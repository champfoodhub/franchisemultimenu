# Bug Fixes Task List

## Phase 1: Type Definitions Fixes ✅
- [x] 1. Update frontend/src/types/index.ts
  - Add `active` property to `MenuItem` interface
  - Change `quantity` to `stock` in `Stock` interface
  - Add `hq_id` and `branch_id` to User interface

## Phase 2: Backend Fixes ✅
- [x] 2. Update src/controllers/hq.controller.ts
  - Map `quantity` to `stock` for frontend compatibility

## Phase 3: Frontend Fixes ✅
- [x] 3. Update frontend/src/pages/StockReports.tsx
  - Change `quantity` to `stock` property access
- [x] 4. Update frontend/src/pages/TimeBasedMenu.tsx
  - Add `active` property when parsing response
- [x] 5. Update frontend/src/pages/StockUpdate.tsx
  - Fix is_active vs active property usage with fallback
- [x] 6. Update frontend/src/pages/Menu.tsx
  - Fix is_active vs active property usage with fallback

## Phase 4: TypeScript Declaration ✅
- [x] 7. src/types/express.d.ts already has correct type for req.user

## All Fixes Completed ✅

