import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
const supabaseServiceRoleKey: string | undefined =
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey: string | undefined = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase environment variables are missing');
}

// Admin client (Service Role Key) - for RLS-bypass operations
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

// Anon client - for authentication operations
export const supabase: SupabaseClient = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient(supabaseUrl, supabaseServiceRoleKey); // Fallback to service role if anon key not set

