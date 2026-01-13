-- =====================================================
-- Database Migration: Time-Based + Seasonal Menus
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Table: menu_schedules
-- Stores time slots (breakfast, lunch, dinner) and 
-- seasonal menus (Christmas 2024, Summer specials)
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hq_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL, -- e.g., "Breakfast Menu", "Summer Menu 2024"
  type VARCHAR(20) NOT NULL CHECK (type IN ('TIME_SLOT', 'SEASONAL')),
  
  -- Time slot specific fields
  start_time TIME,
  end_time TIME,
  
  -- Seasonal specific fields
  start_date DATE,
  end_date DATE,
  
  -- Common fields
  timezone VARCHAR(50) DEFAULT 'UTC',
  day_of_week INTEGER[] DEFAULT '{}', -- [0=Sunday, 1=Monday, ...] for recurring schedules
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
  menu_item_id UUID NOT NULL, -- references your existing menu/products table
  priority INTEGER DEFAULT 0, -- display order within schedule
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for better query performance
-- =====================================================

-- Index for HQ queries
CREATE INDEX IF NOT EXISTS idx_menu_schedules_hq_id 
ON menu_schedules(hq_id);

-- Index for finding active schedules
CREATE INDEX IF NOT EXISTS idx_menu_schedules_active 
ON menu_schedules(hq_id, type, is_active) 
WHERE is_active = true;

-- Index for schedule items lookup
CREATE INDEX IF NOT EXISTS idx_menu_schedule_items_schedule 
ON menu_schedule_items(schedule_id);

-- Index for menu items lookup
CREATE INDEX IF NOT EXISTS idx_menu_schedule_items_menu_item 
ON menu_schedule_items(menu_item_id);

-- Composite index for schedule + item uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_schedule_items_unique 
ON menu_schedule_items(schedule_id, menu_item_id);

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
  JOIN menu_items mi ON msi.menu_item_id = mi.id
  WHERE ms.is_active = true
    AND mi.is_active = true
    AND ms.hq_id = (
      SELECT hq_id FROM branches WHERE id = branch_id_input
    )
    AND (
      -- Time slot matching
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
      -- Seasonal matching
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
-- RPC Function: HQ stock report (updated to include schedule info)
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

CREATE OR REPLACE FUNCTION update_menu_schedules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_menu_schedules_updated_at ON menu_schedules;
CREATE TRIGGER trigger_menu_schedules_updated_at
  BEFORE UPDATE ON menu_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_schedules_timestamp();

-- =====================================================
-- Sample Data: Example Time Slots
-- =====================================================

-- Example: Insert sample breakfast schedule (run manually if needed)
-- INSERT INTO menu_schedules (hq_id, name, type, start_time, end_time, timezone, day_of_week)
-- VALUES (
--   'your-hq-uuid-here',
--   'Breakfast Menu',
--   'TIME_SLOT',
--   '06:00:00',
--   '11:00:00',
--   'UTC',
--   ARRAY[1,2,3,4,5] -- Monday to Friday
-- );

-- Example: Insert sample seasonal menu (run manually if needed)
-- INSERT INTO menu_schedules (hq_id, name, type, start_date, end_date, timezone)
-- VALUES (
--   'your-hq-uuid-here',
--   'Summer Specials 2024',
--   'SEASONAL',
--   '2024-06-01',
--   '2024-08-31',
--   'America/New_York'
-- );

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name LIKE 'menu_%';

-- Check if functions were created
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name LIKE '%menu%' OR routine_name LIKE '%slot%';

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================

-- DROP TABLE IF EXISTS menu_schedule_items CASCADE;
-- DROP TABLE IF EXISTS menu_schedules CASCADE;
-- DROP FUNCTION IF EXISTS branch_menu_by_time(UUID, TIME, DATE, VARCHAR);
-- DROP FUNCTION IF EXISTS available_time_slots(UUID, DATE);
-- DROP FUNCTION IF EXISTS update_menu_schedules_timestamp();

