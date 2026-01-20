# Fix Plan - Vite React Preamble Error & Menu Page Loading

## Issues Identified
1. `@vitejs/plugin-react can't detect preamble` - Vite/React plugin compatibility issue
2. Menu page not loading at `/` route

## Fix Steps

### Step 1: Create vite-env.d.ts file ✅
- Location: `frontend/src/vite-env.d.ts`
- Purpose: Fix the preamble detection error

### Step 2: Update use-foodhub.ts hook ✅
- Add better error handling for public menu endpoint
- Fix the API path (it should not require credentials for public endpoint)
- Added retry logic with 1 second delay

### Step 3: Update queryClient.ts ✅
- Added `getPublicQueryFn` for public endpoints
- Improved URL building logic for query params
- Better error handling - returns empty array instead of throwing

### Step 4: Add Suspense boundary to App.tsx ✅
- Added React.lazy() for code splitting
- Added LoadingFallback component with spinner
- Added Suspense wrapper around Router

## Status
- [x] Step 1: Create vite-env.d.ts
- [x] Step 2: Update use-foodhub.ts
- [x] Step 3: Update queryClient.ts
- [x] Step 4: Add Suspense to App.tsx

## Next Steps
To fully resolve the Vite preamble error, run:
```bash
rm -rf frontend/node_modules/.vite
npm run dev
```

This will clear the Vite cache and rebuild the optimized dependencies.

