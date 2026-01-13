-- =====================================================
-- Database Migration: Franchise Menu Management System
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Table: branches
-- Stores branch information
-- =====================================================

CREATE TABLE IF NOT EXISTS branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hq_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: products
-- Main product catalog (created and managed by HQ)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hq_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: branch_products
-- Branch-specific product configuration (stock, discount)
-- =====================================================

CREATE TABLE IF NOT EXISTS branch_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock INTEGER DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(branch_id, product_id)
);

-- =====================================================
-- Table: menu
-- Menu items (alias for products, for frontend compatibility)
-- =====================================================

CREATE TABLE IF NOT EXISTS menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: branch_menu
-- Branch-specific menu items with stock and discount
-- =====================================================

CREATE TABLE IF NOT EXISTS branch_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  stock INTEGER DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_id, branch_id)
);

-- =====================================================
-- Table: menu_schedules
-- Stores time slots (breakfast, lunch, dinner) and 
-- seasonal menus (Christmas 2024, Summer specials)
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hq_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('TIME_SLOT', 'SEASONAL')),
  
  -- Time slot specific fields
  start_time TIME,
  end_time TIME,
  
  -- Seasonal specific fields
  start_date DATE,
  end_date DATE,
  
  -- Common fields
  timezone VARCHAR(50) DEFAULT 'UTC',
  day_of_week INTEGER[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: menu_schedule_items
-- Links menu items to schedules
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_schedule_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES menu_schedules(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for better query performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_branches_hq_id ON branches(hq_id);
CREATE INDEX IF NOT EXISTS idx_products_hq_id ON products(hq_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_branch_products_branch ON branch_products(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_products_product ON branch_products(product_id);
CREATE INDEX IF NOT EXISTS idx_menu_branch ON menu(branch_id);
CREATE INDEX IF NOT EXISTS idx_menu_product ON menu(product_id);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category);
CREATE INDEX IF NOT EXISTS idx_branch_menu_branch ON branch_menu(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_menu_menu ON branch_menu(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_schedules_hq_id ON menu_schedules(hq_id);
CREATE INDEX IF NOT EXISTS idx_menu_schedules_active ON menu_schedules(hq_id, type, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_menu_schedule_items_schedule ON menu_schedule_items(schedule_id);
CREATE INDEX IF NOT EXISTS idx_menu_schedule_items_menu_item ON menu_schedule_items(menu_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_schedule_items_unique ON menu_schedule_items(schedule_id, menu_item_id);

-- =====================================================
-- RPC Function: Get branch menu with product details
-- =====================================================

CREATE OR REPLACE FUNCTION branch_menu(branch_id_input UUID)
RETURNS JSON AS $$
  SELECT json_agg(
    json_build_object(
      'id', m.id,
      'name', m.name,
      'price', m.price,
      'category', m.category,
      'description', m.description,
      'image_url', m.image_url,
      'is_active', m.is_active,
      'stock', bm.stock,
      'discount_percent', bm.discount_percent,
      'is_available', bm.is_available
    ) ORDER BY m.category, m.name
  )
  FROM menu m
  LEFT JOIN branch_menu bm ON m.id = bm.menu_id AND bm.branch_id = branch_id_input
  WHERE m.is_active = true
    AND (m.branch_id IS NULL OR m.branch_id = branch_id_input);
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- RPC Function: Get time-based menu for a branch
-- Returns active menu items based on branch location and time
-- =====================================================

CREATE OR REPLACE FUNCTION branch_menu_by_time(
  branch_id_input UUID,
  time_input TIME DEFAULT CURRENT_TIME,
  date_input DATE DEFAULT CURRENT_DATE,
  schedule_type_filter VARCHAR DEFAULT 'ALL'
)
RETURNS JSON AS $$
  SELECT json_agg(
    json_build_object(
      'schedule_id', ms.id,
      'schedule_name', ms.name,
      'schedule_type', ms.type,
      'schedule_timezone', ms.timezone,
      'menu_item_id', mi.id,
      'menu_item_name', mi.name,
      'menu_item_price', mi.price,
      'menu_item_category', mi.category,
      'menu_item_description', mi.description,
      'priority', msi.priority,
      'is_featured', msi.is_featured
    ) ORDER BY msi.priority, msi.created_at
  )
  FROM menu_schedule_items msi
  JOIN menu_schedules ms ON msi.schedule_id = ms.id
  JOIN menu mi ON msi.menu_item_id = mi.id
  WHERE ms.is_active = true
    AND mi.is_active = true
    AND ms.hq_id = (
      SELECT hq_id FROM branches WHERE id = branch_id_input
    )
    AND (
      (ms.type = 'TIME_SLOT' 
        AND (schedule_type_filter = 'ALL' OR schedule_type_filter = 'TIME_SLOT')
        AND time_input >= ms.start_time 
        AND time_input <= ms.end_time
        AND (
          ms.day_of_week IS NULL 
          OR ms.day_of_week = '{}' 
          OR date_input::integer % 7 = ANY(ms.day_of_week)
        )
      )
      OR
      (ms.type = 'SEASONAL'
        AND (schedule_type_filter = 'ALL' OR schedule_type_filter = 'SEASONAL')
        AND date_input >= ms.start_date
        AND date_input <= ms.end_date
      )
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- RPC Function: Get available time slots for a date
-- =====================================================

CREATE OR REPLACE FUNCTION available_time_slots(
  hq_id_input UUID,
  target_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
  SELECT json_agg(
    json_build_object(
      'schedule_id', id,
      'schedule_name', name,
      'start_time', start_time,
      'end_time', end_time,
      'timezone', timezone
    ) ORDER BY start_time
  )
  FROM menu_schedules
  WHERE hq_id = hq_id_input
    AND type = 'TIME_SLOT'
    AND is_active = true
    AND (
      day_of_week IS NULL 
      OR day_of_week = '{}' 
      OR target_date::integer % 7 = ANY(day_of_week)
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- RPC Function: HQ stock report
-- =====================================================

CREATE OR REPLACE FUNCTION hq_stock_report()
RETURNS JSON AS $$
  SELECT json_agg(
    json_build_object(
      'product_id', bp.product_id,
      'product_name', p.name,
      'branch_id', bp.branch_id,
      'branch_name', b.name,
      'stock', bp.stock,
      'discount', bp.discount
    ) ORDER BY b.name, p.name
  )
  FROM branch_products bp
  JOIN products p ON bp.product_id = p.id
  JOIN branches b ON bp.branch_id = b.id
  WHERE p.hq_id = (SELECT auth.uid())::uuid
    OR EXISTS (
      SELECT 1 FROM branch_staff bs 
      WHERE bs.branch_id = bp.branch_id 
        AND bs.user_id = (SELECT auth.uid())::uuid
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- Triggers for updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_branches_updated_at ON branches;
CREATE TRIGGER trigger_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_branch_products_updated_at ON branch_products;
CREATE TRIGGER trigger_branch_products_updated_at
  BEFORE UPDATE ON branch_products
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_menu_updated_at ON menu;
CREATE TRIGGER trigger_menu_updated_at
  BEFORE UPDATE ON menu
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_branch_menu_updated_at ON branch_menu;
CREATE TRIGGER trigger_branch_menu_updated_at
  BEFORE UPDATE ON branch_menu
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_menu_schedules_updated_at ON menu_schedules;
CREATE TRIGGER trigger_menu_schedules_updated_at
  BEFORE UPDATE ON menu_schedules
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_schedule_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Sample Data (Optional - run manually if needed)
-- =====================================================

-- Insert sample branch
-- INSERT INTO branches (hq_id, name, timezone, address)
-- VALUES (
--   'your-hq-uuid-here',
--   'Main Branch',
--   'America/New_York',
--   '123 Main St, City, State'
-- );

-- Insert sample product
-- INSERT INTO products (hq_id, name, base_price, category, description)
-- VALUES (
--   'your-hq-uuid-here',
--   'Classic Burger',
--   9.99,
--   'Burgers',
--   'A delicious classic burger with fresh ingredients'
-- );

-- Insert sample breakfast schedule
-- INSERT INTO menu_schedules (hq_id, name, type, start_time, end_time, timezone, day_of_week)
-- VALUES (
--   'your-hq-uuid-here',
--   'Breakfast Menu',
--   'TIME_SLOT',
--   '06:00:00',
--   '11:00:00',
--   'UTC',
--   ARRAY[1,2,3,4,5]
-- );

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Check if functions were created
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- ORDER BY routine_name;

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================

-- DROP TABLE IF EXISTS menu_schedule_items CASCADE;
-- DROP TABLE IF EXISTS menu_schedules CASCADE;
-- DROP TABLE IF EXISTS branch_menu CASCADE;
-- DROP TABLE IF EXISTS menu CASCADE;
-- DROP TABLE IF EXISTS branch_products CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS branches CASCADE;
-- DROP FUNCTION IF EXISTS branch_menu(UUID);
-- DROP FUNCTION IF EXISTS branch_menu_by_time(UUID, TIME, DATE, VARCHAR);
-- DROP FUNCTION IF EXISTS available_time_slots(UUID, DATE);
-- DROP FUNCTION IF EXISTS hq_stock_report();
-- DROP FUNCTION IF EXISTS update_timestamp();

