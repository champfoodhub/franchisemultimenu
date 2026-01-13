import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
const supabaseServiceRoleKey: string | undefined =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase environment variables are missing');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

