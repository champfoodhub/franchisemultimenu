import mysql, { Pool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Database configuration
const mysqlHost: string = process.env.MYSQL_HOST || 'localhost';
const mysqlPort: number = parseInt(process.env.MYSQL_PORT || '3306');
const mysqlUser: string = process.env.MYSQL_USER || 'root';
const mysqlPassword: string = process.env.MYSQL_PASSWORD || '';
const mysqlDatabase: string = process.env.MYSQL_DATABASE || 'franchisemultimenu';

const pool: Pool = mysql.createPool({
  host: mysqlHost,
  port: mysqlPort,
  user: mysqlUser,
  password: mysqlPassword,
  database: mysqlDatabase,
  connectionLimit: 5,
});

async function seed() {
  console.log('🌱 Starting database seed...\n');

  const connection = await pool.getConnection();
  try {
    // Seed users
    console.log('Creating users...');
    
    const hqPasswordHash = await bcrypt.hash('hq123456', 10);
    const branchPasswordHash = await bcrypt.hash('branch123456', 10);
    
    // Create HQ admin user
    await connection.execute(`
      INSERT IGNORE INTO users (email, password_hash, role, full_name)
      VALUES ('hq@franchise.com', ?, 'HQ', 'HQ Admin')
    `, [hqPasswordHash]);
    
    // Create branch user
    await connection.execute(`
      INSERT IGNORE INTO users (email, password_hash, role, branch_id, full_name)
      VALUES ('branch@franchise.com', ?, 'BRANCH', 1, 'Branch Manager')
    `, [branchPasswordHash]);
    
    console.log('✅ Users created');
    console.log('   - hq@franchise.com / hq123456 (HQ Admin)');
    console.log('   - branch@franchise.com / branch123456 (Branch Manager)\n');

    // Seed branches
    console.log('Creating branches...');
    await connection.execute(`
      INSERT IGNORE INTO branches (id, hq_id, name, timezone, address)
      VALUES 
        (1, 1, 'Main Branch', 'America/New_York', '123 Main Street, New York, NY'),
        (2, 1, 'Downtown Branch', 'America/Chicago', '456 Downtown Ave, Chicago, IL'),
        (3, 1, 'West Side Branch', 'America/Los_Angeles', '789 West Blvd, Los Angeles, CA')
    `);
    console.log('✅ Branches created\n');

    // Seed products
    console.log('Creating products...');
    await connection.execute(`
      INSERT IGNORE INTO products (id, hq_id, name, base_price, category, description)
      VALUES 
        (1, 1, 'Classic Burger', 9.99, 'Burgers', 'A delicious classic burger with fresh ingredients'),
        (2, 1, 'Cheese Burger', 10.99, 'Burgers', 'Classic burger with melted cheese'),
        (3, 1, 'Bacon Burger', 11.99, 'Burgers', 'Classic burger with crispy bacon'),
        (4, 1, 'French Fries', 4.99, 'Sides', 'Crispy golden fries'),
        (5, 1, 'Onion Rings', 5.99, 'Sides', 'Crispy battered onion rings'),
        (6, 1, 'Cola', 2.99, 'Drinks', 'Ice cold cola'),
        (7, 1, 'Lemonade', 3.49, 'Drinks', 'Fresh squeezed lemonade'),
        (8, 1, 'Chocolate Shake', 5.99, 'Drinks', 'Rich chocolate milkshake')
    `);
    console.log('✅ Products created\n');

    // Seed menu items
    console.log('Creating menu items...');
    await connection.execute(`
      INSERT IGNORE INTO menu (id, product_id, branch_id, name, price, category, description)
      VALUES 
        (1, 1, NULL, 'Classic Burger', 9.99, 'Burgers', 'A delicious classic burger with fresh ingredients'),
        (2, 2, NULL, 'Cheese Burger', 10.99, 'Burgers', 'Classic burger with melted cheese'),
        (3, 3, NULL, 'Bacon Burger', 11.99, 'Burgers', 'Classic burger with crispy bacon'),
        (4, 4, NULL, 'French Fries', 4.99, 'Sides', 'Crispy golden fries'),
        (5, 5, NULL, 'Onion Rings', 5.99, 'Sides', 'Crispy battered onion rings'),
        (6, 6, NULL, 'Cola', 2.99, 'Drinks', 'Ice cold cola'),
        (7, 7, NULL, 'Lemonade', 3.49, 'Drinks', 'Fresh squeezed lemonade'),
        (8, 8, NULL, 'Chocolate Shake', 5.99, 'Drinks', 'Rich chocolate milkshake')
    `);
    console.log('✅ Menu items created\n');

    // Seed branch products (stock)
    console.log('Creating branch products with stock...');
    for (let branchId = 1; branchId <= 3; branchId++) {
      for (let productId = 1; productId <= 8; productId++) {
        const stock = Math.floor(Math.random() * 100) + 10;
        const discount = Math.random() > 0.8 ? Math.random() * 10 : 0;
        
        await connection.execute(`
          INSERT IGNORE INTO branch_products (branch_id, product_id, stock, discount)
          VALUES (?, ?, ?, ?)
        `, [branchId, productId, stock, discount]);
      }
    }
    console.log('✅ Branch products created\n');

    // Seed branch menu items
    console.log('Creating branch menu items...');
    for (let branchId = 1; branchId <= 3; branchId++) {
      for (let menuId = 1; menuId <= 8; menuId++) {
        const stock = Math.floor(Math.random() * 50) + 5;
        const discount_percent = Math.random() > 0.8 ? Math.random() * 15 : 0;
        
        await connection.execute(`
          INSERT IGNORE INTO branch_menu (menu_id, branch_id, stock, discount_percent)
          VALUES (?, ?, ?, ?)
        `, [menuId, branchId, stock, discount_percent]);
      }
    }
    console.log('✅ Branch menu items created\n');

    // Seed menu schedules
    console.log('Creating menu schedules...');
    
    // Breakfast schedule
    await connection.execute(`
      INSERT IGNORE INTO menu_schedules (id, hq_id, name, type, start_time, end_time, timezone, day_of_week, is_active)
      VALUES (1, 1, 'Breakfast Menu', 'TIME_SLOT', '06:00:00', '11:00:00', 'UTC', '[1,2,3,4,5]', true)
    `);
    
    // Lunch schedule
    await connection.execute(`
      INSERT IGNORE INTO menu_schedules (id, hq_id, name, type, start_time, end_time, timezone, day_of_week, is_active)
      VALUES (2, 1, 'Lunch Menu', 'TIME_SLOT', '11:00:00', '15:00:00', 'UTC', '[1,2,3,4,5]', true)
    `);
    
    // Dinner schedule
    await connection.execute(`
      INSERT IGNORE INTO menu_schedules (id, hq_id, name, type, start_time, end_time, timezone, day_of_week, is_active)
      VALUES (3, 1, 'Dinner Menu', 'TIME_SLOT', '17:00:00', '22:00:00', 'UTC', '[1,2,3,4,5,6,0]', true)
    `);
    
    // Seasonal menu
    await connection.execute(`
      INSERT IGNORE INTO menu_schedules (id, hq_id, name, type, start_date, end_date, timezone, is_active)
      VALUES (4, 1, 'Summer Specials 2024', 'SEASONAL', '2024-06-01', '2024-08-31', 'America/New_York', true)
    `);
    
    console.log('✅ Menu schedules created\n');

    // Seed menu schedule items
    console.log('Creating menu schedule items...');
    
    // Breakfast items
    await connection.execute(`
      INSERT IGNORE INTO menu_schedule_items (schedule_id, menu_item_id, priority, is_featured)
      VALUES 
        (1, 1, 1, true),
        (1, 4, 2, false),
        (1, 6, 3, false)
    `);
    
    // Lunch items
    await connection.execute(`
      INSERT IGNORE INTO menu_schedule_items (schedule_id, menu_item_id, priority, is_featured)
      VALUES 
        (2, 1, 1, true),
        (2, 2, 2, true),
        (2, 3, 3, false),
        (2, 4, 4, false),
        (2, 5, 5, false)
    `);
    
    // Dinner items
    await connection.execute(`
      INSERT IGNORE INTO menu_schedule_items (schedule_id, menu_item_id, priority, is_featured)
      VALUES 
        (3, 1, 1, true),
        (3, 2, 2, true),
        (3, 3, 3, true),
        (3, 4, 4, false),
        (3, 5, 5, false),
        (3, 8, 6, false)
    `);
    
    // Seasonal items
    await connection.execute(`
      INSERT IGNORE INTO menu_schedule_items (schedule_id, menu_item_id, priority, is_featured)
      VALUES 
        (4, 1, 1, true),
        (4, 2, 2, true),
        (4, 8, 3, true)
    `);
    
    console.log('✅ Menu schedule items created\n');

    console.log('🎉 Database seed completed successfully!\n');
    console.log('========================================');
    console.log('Sample Login Credentials:');
    console.log('----------------------------------------');
    console.log('HQ Admin:    hq@franchise.com / hq123456');
    console.log('Branch Mgr:  branch@franchise.com / branch123456');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch(console.error);

