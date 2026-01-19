/**
 * SQLite Database Seed Script
 * Run this to initialize the local SQLite database with schema and seed data
 * 
 * Usage: npx tsx script/seed-sqlite.ts
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { hashPassword } from "../server/utils";

// In-memory data stores for seeding (mirror the schema)
const usersStore: any[] = [];
const productsStore: any[] = [];
const branchesStore: any[] = [];
const inventoryStore: any[] = [];
const schedulesStore: any[] = [];
const scheduleItemsStore: any[] = [];

let userId = 1;
let productId = 1;
let branchId = 1;
let inventoryId = 1;
let scheduleId = 1;
let scheduleItemId = 1;

// Initialize SQLite database
const sqlite = new Database("foodhub.db");

// Helper to drop all tables for clean slate
async function dropAllTables() {
  const tables = [
    "schedule_items",
    "schedules", 
    "inventory",
    "products",
    "branches",
    "users"
  ];
  
  for (const table of tables) {
    sqlite.exec(`DROP TABLE IF EXISTS ${table}`);
  }
  console.log("Dropped all existing tables");
}

// Helper to create all tables
async function createAllTables() {
  // Create users table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'BRANCH_MANAGER',
      branch_id INTEGER,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create branches table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      is_active INTEGER DEFAULT 1
    )
  `);

  // Create products table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      base_price TEXT NOT NULL,
      category TEXT NOT NULL,
      menu TEXT,
      image_url TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Create inventory table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      discount INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create schedules table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      days_of_week TEXT,
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Create schedule_items table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schedule_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      priority INTEGER DEFAULT 0
    )
  `);

  console.log("Created all tables");
}

// Seed data
async function seed() {
  console.log("Seeding database...");

  // Hash passwords
  const hashedPassword = await hashPassword("password123");

  // Create users
  const hqUser = {
    id: userId++,
    username: "hq",
    password: hashedPassword,
    role: "HQ_ADMIN",
    name: "HQ Administrator",
    branch_id: null,
    created_at: new Date().toISOString()
  };

  const managerUser = {
    id: userId++,
    username: "manager",
    password: hashedPassword,
    role: "BRANCH_MANAGER",
    name: "Branch Manager",
    branch_id: 1,
    created_at: new Date().toISOString()
  };

  usersStore.push(hqUser, managerUser);
  console.log("Created users: hq, manager (password: password123)");

  // Create branch
  const branch1 = {
    id: branchId++,
    name: "Downtown Hub",
    address: "123 Main St",
    timezone: "EST",
    is_active: 1
  };

  branchesStore.push(branch1);
  console.log("Created branch:", branch1.name);

  // Create products
  const p1 = {
    id: productId++,
    name: "Signature Burger",
    description: "Double patty with cheese",
    base_price: "12.99",
    category: "Burgers",
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    is_active: 1
  };

  const p2 = {
    id: productId++,
    name: "Morning Pancakes",
    description: "Fluffy stack with syrup",
    base_price: "9.99",
    category: "Breakfast",
    image_url: "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=800&q=80",
    is_active: 1
  };

  const p3 = {
    id: productId++,
    name: "dahi burger",
    description: "",
    base_price: "5.00",
    category: "BURGERS",
    image_url: "",
    is_active: 1
  };

  productsStore.push(p1, p2, p3);
  console.log("Created products:", p1.name, p2.name, p3.name);

  // Create inventory
  const inv1 = {
    id: inventoryId++,
    branch_id: branch1.id,
    product_id: p1.id,
    stock: 50,
    discount: 0,
    is_available: 1,
    updated_at: new Date().toISOString()
  };

  const inv2 = {
    id: inventoryId++,
    branch_id: branch1.id,
    product_id: p2.id,
    stock: 30,
    discount: 10,
    is_available: 1,
    updated_at: new Date().toISOString()
  };

  inventoryStore.push(inv1, inv2);
  console.log("Created inventory items");

  // Create schedules
  const s1 = {
    id: scheduleId++,
    name: "Breakfast Menu",
    type: "TIME_SLOT",
    start_time: "06:00",
    end_time: "11:00",
    days_of_week: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
    start_date: null,
    end_date: null,
    is_active: 1
  };

  const s2 = {
    id: scheduleId++,
    name: "Main Menu",
    type: "TIME_SLOT",
    start_time: "11:00",
    end_time: "22:00",
    days_of_week: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
    start_date: null,
    end_date: null,
    is_active: 1
  };

  schedulesStore.push(s1, s2);
  console.log("Created schedules:", s1.name, s2.name);

  // Create schedule items
  const item1 = {
    id: scheduleItemId++,
    schedule_id: s1.id,
    product_id: p2.id,
    priority: 1
  };

  const item2 = {
    id: scheduleItemId++,
    schedule_id: s2.id,
    product_id: p1.id,
    priority: 1
  };

  scheduleItemsStore.push(item1, item2);
  console.log("Created schedule items");

  // Insert all data into SQLite
  console.log("\nInserting data into SQLite database...");
  
  const insertUser = sqlite.prepare(`
    INSERT INTO users (id, username, password, role, branch_id, name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertBranch = sqlite.prepare(`
    INSERT INTO branches (id, name, address, timezone, is_active)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const insertProduct = sqlite.prepare(`
    INSERT INTO products (id, name, description, base_price, category, image_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertInventory = sqlite.prepare(`
    INSERT INTO inventory (id, branch_id, product_id, stock, discount, is_available, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertSchedule = sqlite.prepare(`
    INSERT INTO schedules (id, name, type, start_time, end_time, days_of_week, start_date, end_date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertScheduleItem = sqlite.prepare(`
    INSERT INTO schedule_items (id, schedule_id, product_id, priority)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = sqlite.transaction((stmt: any, data: any[]) => {
    for (const item of data) {
      stmt.run(...item);
    }
  });

  insertMany(insertUser, usersStore.map(u => [u.id, u.username, u.password, u.role, u.branch_id, u.name, u.created_at]));
  insertMany(insertBranch, branchesStore.map(b => [b.id, b.name, b.address, b.timezone, b.is_active]));
  insertMany(insertProduct, productsStore.map(p => [p.id, p.name, p.description, p.base_price, p.category, p.image_url, p.is_active]));
  insertMany(insertInventory, inventoryStore.map(i => [i.id, i.branch_id, i.product_id, i.stock, i.discount, i.is_available, i.updated_at]));
  insertMany(insertSchedule, schedulesStore.map(s => [s.id, s.name, s.type, s.start_time, s.end_time, s.days_of_week, s.start_date, s.end_date, s.is_active]));
  insertMany(insertScheduleItem, scheduleItemsStore.map(si => [si.id, si.schedule_id, si.product_id, si.priority]));

  console.log("✅ Database seeded successfully!");
  console.log("\n   - Users: hq (password123), manager (password123)");
  console.log("   - Branch: Downtown Hub");
  console.log("   - Products: 3 items");
  console.log("   - Schedules: 2 items");
}

// Main execution
async function main() {
  try {
    console.log("Starting SQLite database initialization...\n");
    
    await dropAllTables();
    await createAllTables();
    await seed();
    
    console.log("\n🎉 All done! You can now start the application with:");
    console.log("   npm run dev");
    
    sqlite.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    sqlite.close();
    process.exit(1);
  }
}

main();

