-- =====================================================
-- MySQL Database Schema: Franchise Menu Management System
-- Migrated from Supabase (PostgreSQL)
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS franchisemultimenu;
USE franchisemultimenu;

-- =====================================================
-- Table: users
-- Stores user accounts for authentication
-- =====================================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('HQ', 'BRANCH', 'ADMIN') NOT NULL DEFAULT 'BRANCH',
  hq_id INT NULL,
  branch_id INT NULL,
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_hq_id (hq_id),
  INDEX idx_users_branch_id (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: branches
-- Stores branch information
-- =====================================================
DROP TABLE IF EXISTS branches;
CREATE TABLE branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hq_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_branches_hq_id (hq_id),
  INDEX idx_branches_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: products
-- Main product catalog (created and managed by HQ)
-- =====================================================
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hq_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_hq_id (hq_id),
  INDEX idx_products_category (category),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: branch_products
-- Branch-specific product configuration (stock, discount)
-- =====================================================
DROP TABLE IF EXISTS branch_products;
CREATE TABLE branch_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  product_id INT NOT NULL,
  stock INT DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_branch_product (branch_id, product_id),
  INDEX idx_branch_products_branch (branch_id),
  INDEX idx_branch_products_product (product_id),
  CONSTRAINT fk_bp_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_bp_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: menu
-- Menu items (alias for products, for frontend compatibility)
-- =====================================================
DROP TABLE IF EXISTS menu;
CREATE TABLE menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  branch_id INT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_menu_branch (branch_id),
  INDEX idx_menu_product (product_id),
  INDEX idx_menu_category (category),
  INDEX idx_menu_active (is_active),
  CONSTRAINT fk_menu_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: branch_menu
-- Branch-specific menu items with stock and discount
-- =====================================================
DROP TABLE IF EXISTS branch_menu;
CREATE TABLE branch_menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  menu_id INT NOT NULL,
  branch_id INT NOT NULL,
  stock INT DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_branch_menu (menu_id, branch_id),
  INDEX idx_branch_menu_branch (branch_id),
  INDEX idx_branch_menu_menu (menu_id),
  CONSTRAINT fk_bm_menu FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE,
  CONSTRAINT fk_bm_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: menu_schedules
-- Stores time slots (breakfast, lunch, dinner) and 
-- seasonal menus (Christmas, Summer specials)
-- =====================================================
DROP TABLE IF EXISTS menu_schedules;
CREATE TABLE menu_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hq_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('TIME_SLOT', 'SEASONAL') NOT NULL,
  
  -- Time slot specific fields
  start_time TIME,
  end_time TIME,
  
  -- Seasonal specific fields
  start_date DATE,
  end_date DATE,
  
  -- Common fields
  timezone VARCHAR(50) DEFAULT 'UTC',
  day_of_week JSON, -- Stored as JSON array: [1,2,3,4,5]
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_menu_schedules_hq_id (hq_id),
  INDEX idx_menu_schedules_type (type),
  INDEX idx_menu_schedules_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: menu_schedule_items
-- Links menu items to schedules
-- =====================================================
DROP TABLE IF EXISTS menu_schedule_items;
CREATE TABLE menu_schedule_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  priority INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_schedule_item (schedule_id, menu_item_id),
  INDEX idx_menu_schedule_items_schedule (schedule_id),
  INDEX idx_menu_schedule_items_menu_item (menu_item_id),
  CONSTRAINT fk_msi_schedule FOREIGN KEY (schedule_id) REFERENCES menu_schedules(id) ON DELETE CASCADE,
  CONSTRAINT fk_msi_menu FOREIGN KEY (menu_item_id) REFERENCES menu(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Stored Procedures
-- =====================================================

DELIMITER //

-- Procedure: Get branch menu with product details
DROP PROCEDURE IF EXISTS get_branch_menu //
CREATE PROCEDURE get_branch_menu(IN p_branch_id INT)
BEGIN
  SELECT 
    m.id,
    m.name,
    m.price,
    m.category,
    m.description,
    m.image_url,
    m.is_active,
    COALESCE(bm.stock, 0) as stock,
    COALESCE(bm.discount_percent, 0) as discount_percent,
    bm.is_available
  FROM menu m
  LEFT JOIN branch_menu bm ON m.id = bm.menu_id AND bm.branch_id = p_branch_id
  WHERE m.is_active = TRUE
    AND (m.branch_id IS NULL OR m.branch_id = p_branch_id)
  ORDER BY m.category, m.name;
END //

-- Procedure: Get time-based menu for a branch
DROP PROCEDURE IF EXISTS get_time_based_menu //
CREATE PROCEDURE get_time_based_menu(
  IN p_branch_id INT,
  IN p_time TIME,
  IN p_date DATE,
  IN p_schedule_type VARCHAR(10)
)
BEGIN
  DECLARE v_hq_id INT;
  
  -- Get HQ ID from branch
  SELECT hq_id INTO v_hq_id FROM branches WHERE id = p_branch_id;
  
  -- Get active schedules and their items
  SELECT 
    ms.id as schedule_id,
    ms.name as schedule_name,
    ms.type as schedule_type,
    ms.timezone as schedule_timezone,
    mi.id as menu_item_id,
    mi.name as menu_item_name,
    mi.price as menu_item_price,
    mi.category as menu_item_category,
    mi.description as menu_item_description,
    msi.priority,
    msi.is_featured
  FROM menu_schedule_items msi
  JOIN menu_schedules ms ON msi.schedule_id = ms.id
  JOIN menu mi ON msi.menu_item_id = mi.id
  WHERE ms.hq_id = v_hq_id
    AND ms.is_active = TRUE
    AND mi.is_active = TRUE
    AND (
      (ms.type = 'TIME_SLOT' 
        AND (p_schedule_type = 'ALL' OR p_schedule_type = 'TIME_SLOT')
        AND p_time >= ms.start_time 
        AND p_time <= ms.end_time
        AND (
          ms.day_of_week IS NULL 
          OR JSON_CONTAINS(ms.day_of_week, CAST(DAYOFWEEK(p_date) - 1 AS JSON))
        )
      )
      OR
      (ms.type = 'SEASONAL'
        AND (p_schedule_type = 'ALL' OR p_schedule_type = 'SEASONAL')
        AND p_date >= ms.start_date
        AND p_date <= ms.end_date
      )
    )
  ORDER BY msi.priority, msi.created_at;
END //

-- Procedure: Get available time slots for a date
DROP PROCEDURE IF EXISTS get_available_time_slots //
CREATE PROCEDURE get_available_time_slots(IN p_hq_id INT, IN p_date DATE)
BEGIN
  SELECT 
    id as schedule_id,
    name as schedule_name,
    start_time,
    end_time,
    timezone
  FROM menu_schedules
  WHERE hq_id = p_hq_id
    AND type = 'TIME_SLOT'
    AND is_active = TRUE
    AND (
      day_of_week IS NULL 
      OR JSON_CONTAINS(day_of_week, CAST(DAYOFWEEK(p_date) - 1 AS JSON))
    )
  ORDER BY start_time;
END //

-- Procedure: HQ stock report
DROP PROCEDURE IF EXISTS get_hq_stock_report //
CREATE PROCEDURE get_hq_stock_report(IN p_hq_id INT)
BEGIN
  SELECT 
    bp.product_id,
    p.name as product_name,
    bp.branch_id,
    b.name as branch_name,
    bp.stock,
    bp.discount
  FROM branch_products bp
  JOIN products p ON bp.product_id = p.id
  JOIN branches b ON bp.branch_id = b.id
  WHERE p.hq_id = p_hq_id
  ORDER BY b.name, p.name;
END //

DELIMITER ;

-- =====================================================
-- Triggers for updated_at timestamp (auto-handled by MySQL)
-- =====================================================
-- Note: In MySQL, updated_at is automatically handled by 
-- DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- No additional triggers needed

-- =====================================================
-- Sample Data (Optional - run manually if needed)
-- =====================================================

-- Insert sample HQ user (password: password123)
-- Password hash should be generated using bcrypt
-- INSERT INTO users (email, password_hash, role, full_name)
-- VALUES ('hq@franchise.com', '$2b$10$...', 'HQ', 'HQ Admin');

-- Insert sample branch
-- INSERT INTO branches (hq_id, name, timezone, address)
-- VALUES (1, 'Main Branch', 'America/New_York', '123 Main St, City, State');

-- Insert sample product
-- INSERT INTO products (hq_id, name, base_price, category, description)
-- VALUES (1, 'Classic Burger', 9.99, 'Burgers', 'A delicious classic burger with fresh ingredients');

-- Insert sample breakfast schedule
-- INSERT INTO menu_schedules (hq_id, name, type, start_time, end_time, timezone, day_of_week)
-- VALUES (1, 'Breakfast Menu', 'TIME_SLOT', '06:00:00', '11:00:00', 'UTC', '[1,2,3,4,5]');

-- =====================================================
-- Verification Queries
-- =====================================================

-- SHOW TABLES;
-- DESCRIBE users;
-- DESCRIBE branches;
-- DESCRIBE products;
-- DESCRIBE menu_schedules;

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================

-- DROP TABLE IF EXISTS menu_schedule_items;
-- DROP TABLE IF EXISTS menu_schedules;
-- DROP TABLE IF EXISTS branch_menu;
-- DROP TABLE IF EXISTS menu;
-- DROP TABLE IF EXISTS branch_products;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS branches;
-- DROP TABLE IF EXISTS users;
-- DROP DATABASE IF EXISTS franchisemultimenu;

