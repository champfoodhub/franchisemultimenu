# Frontend-Backend Connection Issues - Fix Plan

## Issues Identified:

### 1. CRITICAL: Inventory Route Missing branchId Parameter
**File:** `server/routes.ts`
**Problem:** The route `/api/branches/:branchId/inventory` doesn't extract `branchId` from `req.params`:
```typescript
app.get(api.inventory.list.path, async (req, res) => {
  const branchId = parseInt(req.params.branchId); // ❌ This is undefined!
  const items = await storage.getInventory(branchId);
  res.json(items);
});
```
**Fix:** Must use `req.params.branchId` correctly.

### 2. Schema Mismatch - Missing `menu` column
**File:** `script/seed-sqlite.ts`
**Problem:** Seed script creates products table without `menu` column:
```typescript
sqlite.exec(`CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active INTEGER DEFAULT 1
  -- ❌ Missing: menu column
)`);
```
**Fix:** Add `menu TEXT` column to the products table.

### 3. Missing Update Branch Route
**File:** `server/routes.ts`
**Problem:** The frontend `useUpdateBranch` expects a PUT route at `/api/branches/:id`:
```typescript
// Frontend calls:
const res = await fetch(`/api/branches/${id}`, { method: "PUT", ... });

// But route is defined as:
app.put("/api/branches/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const input = api.branches.create.input.partial().parse(req.body); // ❌ Uses create.input instead of update
    const updated = await (storage as any).updateBranch(id, input);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: "Invalid update" });
  }
});
```
**Fix:** The route exists but uses wrong schema - should work but let me verify.

## Fixes to Implement:

1. ✅ Fix inventory route to properly extract branchId
2. ✅ Update seed script to add menu column
3. ✅ Verify update branch route works correctly
4. ✅ Test the fixes work end-to-end

## Verification Steps:
- Start the server and check inventory page loads
- Create a new product and verify it's saved
- Update inventory and verify changes persist

