// Database migration script to add menu column to products table
import Database from 'better-sqlite3';

const db = new Database('foodhub.db');

// Check if menu column exists
const columns = db.prepare("PRAGMA table_info(products)").all();
const menuColumn = columns.find((col: any) => col.name === 'menu');

if (!menuColumn) {
  console.log('Adding menu column to products table...');
  db.prepare("ALTER TABLE products ADD COLUMN menu TEXT").run();
  console.log('Menu column added successfully!');
} else {
  console.log('Menu column already exists.');
}

db.close();

