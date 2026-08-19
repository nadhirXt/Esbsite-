import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client — Uses the SERVICE_ROLE_KEY.
 * ⚠️ Only use this in server-side code (API routes, server actions).
 * This client bypasses RLS and has full admin access.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
