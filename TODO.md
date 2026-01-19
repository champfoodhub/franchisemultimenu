# TODO: Fix Create Buttons and Add Menu Column

## Issues to Fix:
1. Create buttons not working (form doesn't reset properly)
2. Add "menu" column to products table as a dropdown

## Tasks:

### 1. Add Menu Column to Products Schema
- [x] Add `menu` column to products table in `shared/schema.ts`
- [x] Update zod schema for products
- [x] Update TypeScript types

### 2. Database Migration
- [x] Add migration instructions to `SQLITE_MIGRATION.md`

### 3. Update Storage Layer
- [x] Update `createProduct` in `server/storage.ts` to handle menu field
- [x] Update `updateProduct` in `server/storage.ts` to handle menu field

### 4. Fix Form Reset Issues
- [x] Fix `products.tsx` - Add key prop to dialog for proper form reset
- [x] Fix `schedules.tsx` - Add key prop to dialog for proper form reset
- [x] Fix `branches.tsx` - Add key prop to dialog for proper form reset

### 5. Update UI Components
- [x] Add menu dropdown field to product dialog in `products.tsx`
- [x] Show menu value in product card

## Status: COMPLETED


