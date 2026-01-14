# Code Fixes Plan

## Errors Identified and Fixes to Apply

### Backend Fixes
1. ✅ Add GET `/hq/products` endpoint to hq.routes.ts
2. ✅ Add GET `/hq/branches` endpoint to hq.routes.ts
3. ✅ Add GET `/hq/stock` endpoint to hq.routes.ts
4. ✅ Fix role checks in middleware and routes to use 'HQ'/'BRANCH' instead of 'HQ_ADMIN'/'BRANCH_MANAGER'

### Frontend Fixes
5. ✅ Update Product type to include category and use string id (UUID)
6. ✅ Update TimeBasedMenu.tsx to use correct endpoint `/branch/menu/time-based`
7. ✅ Add category field to ProductForm.tsx
8. ✅ Add day_of_week field to ScheduleForm.tsx
9. ✅ Fix all type definitions to match backend UUID format

## Status
- [x] Plan created
- [ ] Backend fixes applied
- [ ] Frontend fixes applied
- [ ] Testing completed

