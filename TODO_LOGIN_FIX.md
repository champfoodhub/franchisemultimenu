# Login Fix Plan

## Issue
Backend was using Service Role Key for authentication, causing frontend login to fail while curl worked.

## Solution Applied
Created two Supabase clients:
- `supabaseAdmin` - Service role key (for RLS-bypass operations)
- `supabase` - Anon key (for authentication operations)

## Files Modified
- ✅ `src/config/supabase.ts` - Added dual client setup
- ✅ `src/controllers/auth.controller.ts` - Uses `supabase` (anon key) for login
- ✅ `src/controllers/menu.controller.ts` - Uses `supabaseAdmin`
- ✅ `src/controllers/hq.controller.ts` - Uses `supabaseAdmin`
- ✅ `src/controllers/branch.controller.ts` - Uses `supabaseAdmin`
- ✅ `src/controllers/schedule.controller.ts` - Uses `supabaseAdmin`
- ✅ `src/middlewares/auth.middleware.ts` - Uses `supabaseAdmin` for token verification

## Required: Add Environment Variable
You need to add `SUPABASE_ANON_KEY` to your `.env` file:

```
SUPABASE_URL=https://xfznfefqdpsuwufxqxat.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here  # <-- ADD THIS
```

The anon key can be found in your Supabase Dashboard under:
Project Settings → API → anon public key

## After Adding the Env Variable
1. Restart the backend server
2. Test frontend login with hq@test.com / HqPass123!

