# TODO: Indian Cuisine Database Seeding

## Status: IN PROGRESS

### Files to Update
- [ ] `script/seed-sqlite.ts` - Add complete Indian food data (SQL-based)
- [ ] `server/mock-storage.ts` - Add complete Indian food data (in-memory)

### Step 1: Update script/seed-sqlite.ts
- [ ] Add Indian branches (5 cities)
- [ ] Add Indian users (HQ admin + 5 branch managers)
- [ ] Add Indian products (55 dishes across 10 categories)
- [ ] Add schedules (5 time slots + 4 seasonal)
- [ ] Add inventory (5 branches × 55 products)
- [ ] Add schedule items (product-schedule mappings)

### Step 2: Update server/mock-storage.ts
- [ ] Add Indian branches
- [ ] Add Indian users
- [ ] Add Indian products
- [ ] Add schedules
- [ ] Add inventory entries
- [ ] Add schedule items

### Step 3: Test & Verify
- [ ] Run seed script: `npx tsx script/seed-sqlite.ts`
- [ ] Start dev server: `npm run dev`
- [ ] Verify data in application

---

## Indian Food Data Summary

### Branches (5)
1. Mumbai Hub - Mumbai, Maharashtra
2. Delhi Hub - New Delhi, NCT
3. Bangalore Hub - Bangalore, Karnataka
4. Chennai Hub - Chennai, Tamil Nadu
5. Kolkata Hub - Kolkata, West Bengal

### Products (55)
- Biryanis: 5
- Curries: 10
- Tandoori: 6
- Street Food: 8
- South Indian: 6
- Breads: 6
- Rice: 4
- Drinks: 5
- Desserts: 5
- Special: 5

### Schedules (9)
- Time Slots: Breakfast, Lunch, Snacks, Dinner, Late Night
- Seasonal: Summer, Monsoon, Winter, Festival

### Users (6)
- HQ Admin + 5 Branch Managers

