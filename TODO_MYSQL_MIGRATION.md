# MySQL Migration Plan

## Overview
Complete migration from Supabase (PostgreSQL) to MySQL for local execution.

## Tasks

### 1. Database Configuration ✅
- [x] Create MySQL connection config (`src/config/mysql.ts`)
- [x] Create MySQL schema/migration file (`database/mysql_schema.sql`)
- [x] Update environment variables (`.env.example`)

### 2. Authentication System (Complete Replacement) ✅
- [x] Create users table with proper schema
- [x] Implement JWT token generation/verification
- [x] Create password hashing utilities
- [x] Update auth controller for MySQL

### 3. Database Operations Layer ✅
- [x] Create database connection pool
- [x] Create query builder/helpers
- [x] Convert all Supabase queries to MySQL queries

### 4. Controller Updates ✅
- [x] Update auth.controller.ts
- [x] Update hq.controller.ts
- [x] Update branch.controller.ts
- [x] Update menu.controller.ts
- [x] Update schedule.controller.ts

### 5. Middleware Updates ✅
- [x] Update auth.middleware.ts for JWT verification
- [x] Update role-based authorization

### 6. Route Updates ✅
- [x] Update all routes to use new controllers

### 7. Scripts ✅
- [x] Create seed script for sample data
- [x] Create setup scripts

### 8. Documentation ✅
- [x] Create README_MYSQL.md with setup instructions

## Database Schema Changes ✅
- UUID → INT AUTO_INCREMENT
- TIMESTAMP WITH TIME ZONE → DATETIME
- BOOLEAN → TINYINT(1)
- ARRAY types → JSON
- Remove RLS (implement in app layer)

## Quick Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 3. Create database
mysql -u root -p -e "CREATE DATABASE franchisemultimenu;"

# 4. Run schema
npm run db:schema

# 5. Seed sample data
npm run db:seed

# 6. Start server
npm run dev
```

## Sample Login Credentials

| Role | Email | Password |
|------|-------|----------|
| HQ Admin | hq@franchise.com | hq123456 |
| Branch Manager | branch@franchise.com | branch123456 |

## Files Created/Modified

### New Files
- `src/config/mysql.ts` - MySQL connection pool
- `src/utils/auth.ts` - JWT and password utilities
- `database/mysql_schema.sql` - Complete MySQL schema
- `scripts/seed.ts` - Database seeding script
- `.env.example` - Environment template
- `README_MYSQL.md` - Setup instructions

### Modified Files
- `src/controllers/auth.controller.ts` - MySQL-based auth
- `src/controllers/hq.controller.ts` - MySQL queries
- `src/controllers/branch.controller.ts` - MySQL queries
- `src/controllers/menu.controller.ts` - MySQL queries
- `src/controllers/schedule.controller.ts` - MySQL queries
- `src/middlewares/auth.middleware.ts` - JWT verification
- `src/routes/*.ts` - Updated routes
- `src/app.ts` - MySQL initialization
- `package.json` - New dependencies and scripts
- `src/utils/errormessage.ts` - New error messages


