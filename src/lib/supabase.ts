import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// In development/server-side, we use the Service Role Key to bypass RLS securely from API endpoints
// Next.js prevents exposing non-NEXT_PUBLIC variables to the client bundle.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
