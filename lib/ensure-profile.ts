import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Ensures a profile row exists for the given user.
 * If the trigger didn't fire (e.g. user was created before schema was applied),
 * this function creates the profile on-the-fly using upsert.
 *
 * Returns the profile data or null on hard failure.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
) {
  // 1. Try to fetch existing profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile) return profile

  // 2. Profile doesn't exist → create it from user metadata
  const meta = user.user_metadata || {}
  const { data: newProfile, error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: meta.full_name || user.email?.split('@')[0] || 'Utilisateur',
      role: meta.role || 'student',
      user_type: meta.user_type || null,
      cycle: meta.cycle || null,
      institution_name: meta.institution_name || null,
    }, { onConflict: 'id' })
    .select('*')
    .single()

  if (upsertError) {
    console.error('[ensureProfile] Failed to create profile:', upsertError.message)
    return null
  }

  return newProfile
}
