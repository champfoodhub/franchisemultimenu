# SQLite Migration Plan

## Goal: Migrate from PostgreSQL to SQLite for local development

## Tasks

### 1. Update shared/schema.ts
- [x] Change imports from `drizzle-orm/pg-core` to `drizzle-orm/sqlite-core`
- [x] Replace `pgTable` with `sqliteTable`
- [x] Replace `serial` with `integer` (SQLite auto-increment)

### 2. Update server/db.ts
- [x] Import `better-sqlite3` and `drizzle-orm/better-sqlite3`
- [x] Create SQLite database connection
- [x] Export new `db` instance

### 3. Update drizzle.config.ts
- [x] Change dialect from "postgresql" to "sqlite"
- [x] Update credentials to use local file path

### 4. Create seed script for SQLite
- [x] Initialize SQLite database with schema
- [x] Import seed data

### 5. Update package.json scripts
- [x] Add SQLite-specific database commands

### 6. Database Schema Updates (2024)

#### Adding menu column to products table

To add the `menu` column to the products table, run the following SQL:

```sql
ALTER TABLE products ADD COLUMN menu TEXT;
```

This adds a nullable text column for menu classification/dropdown.

## Progress

- [x] Create TODO.md file (DONE)
- [x] Update shared/schema.ts
- [x] Update server/db.ts
- [x] Update drizzle.config.ts
- [x] Create seed script
- [x] Test the migration
- [x] Add menu column to products (DONE - see section 6 above)

