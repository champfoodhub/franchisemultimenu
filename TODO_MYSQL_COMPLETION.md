# MySQL Migration - TODO List (IN PROGRESS)

## Phase 1: Frontend Updates ✅ COMPLETED

### 1.1 API Service Enhancements ✅
- [x] Add JWT token interceptor for automatic Bearer token attachment
- [x] Add response interceptor for token expiration handling
- [x] Add request interceptor for loading states

### 1.2 Type Updates ✅
- [x] Update `User` interface - id: string → id: number
- [x] Update `Product` interface - id: string → id: number
- [x] Update `Schedule` interface - id: string → id: number
- [x] Update `ScheduleItem` interface - id: string → id: number
- [x] Update `Branch` interface - id: string → id: number
- [x] Update `Stock` interface - id: string → id: number
- [x] Update `MenuItem` interface - id: string → id: number
- [x] Add AuthResponse, TimeBasedMenuResponse, AvailableTimeSlotsResponse types

## Phase 2: Environment Configuration ✅ COMPLETED

### 2.1 Environment Files ✅
- [x] Create `.env` file with MySQL configuration
- [x] Add JWT secret configurations
- [x] Add API URL configuration

## Phase 3: Cleanup ✅ COMPLETED

### 3.1 Remove Supabase Dependencies (Frontend) ✅
- [x] Remove Supabase imports from frontend services
- [x] Remove Supabase configuration
- [x] Keep Supabase config in backend for reference

## Phase 4: Database Setup & Bug Fixes 🔄 IN PROGRESS

### 4.1 Bug Fixes
- [x] Fix import order in menu.controller.ts (ErrorMessage at bottom)
- [x] Export error/success messages from frontend API service
- [x] Update schema database name to `franchisemultimenu`
- [x] Fix seed script to handle database name consistency

### 4.2 Database Setup
- [x] Create MySQL schema file
- [x] Create seed script
- [x] Create `.env` file with database config
- [ ] Create MySQL database (manual step required)
- [ ] Run schema migration
- [ ] Seed sample data
- [ ] Verify connections

### 4.3 Application Testing
- [ ] Test login flow
- [ ] Test HQ dashboard
- [ ] Test branch dashboard
- [ ] Test menu management
- [ ] Test schedule management
- [ ] Test time-based menu

## Files Modified

### Backend
- `src/config/mysql.ts` - MySQL connection pool
- `src/utils/auth.ts` - JWT utilities
- `src/controllers/auth.controller.ts` - Auth with MySQL
- `src/controllers/hq.controller.ts` - HQ operations with MySQL
- `src/controllers/branch.controller.ts` - Branch operations with MySQL
- `src/controllers/menu.controller.ts` - Menu operations with MySQL (FIXED import)
- `src/controllers/schedule.controller.ts` - Schedule operations with MySQL
- `src/middlewares/auth.middleware.ts` - JWT verification
- `src/routes/*.ts` - Updated routes
- `database/mysql_schema.sql` - Complete MySQL schema (FIXED database name)
- `scripts/seed.ts` - Database seeding script (FIXED)
- `.env` - Environment configuration (CREATED)

### Frontend
- `frontend/src/services/api.ts` - Added JWT interceptors + message exports
- `frontend/src/types/index.ts` - Updated types for MySQL (number IDs)

## Sample Login Credentials
| Role | Email | Password |
|------|-------|----------|
| HQ Admin | hq@franchise.com | hq123456 |
| Branch Manager | branch@franchise.com | branch123456 |

## Quick Setup Commands

```bash
# 1. Create database (run in MySQL)
mysql -u root -p -e "CREATE DATABASE franchisemultimenu;"

# 2. Run schema
mysql -u root -p franchisemultimenu < database/mysql_schema.sql

# 3. Seed data
npm run db:seed

# 4. Start server
npm run dev

# 5. Start frontend (in separate terminal)
cd frontend && npm run dev
```

## Bug Fixes Applied

### Fix 1: menu.controller.ts Import Order
Moved `ErrorMessage` import to the top of the file to fix hoisting issues.

### Fix 2: Frontend API Service Exports
Added re-exports of `ErrorMessage`, `SuccessMessage`, `getErrorMessage`, and `getSuccessMessage` from the API service.

### Fix 3: Database Name Consistency
Updated `mysql_schema.sql` to use `franchisemultimenu` as the database name (matching seed script).

### Fix 4: Seed Script Improvements
- Added proper error handling for database connection
- Added console output for progress tracking
- Used `INSERT IGNORE` for idempotent seeding

