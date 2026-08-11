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
  try {
    // 1. Try to fetch existing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile exists, return it
    if (profile) return profile

    // 2. Profile doesn't exist → create it from user metadata
    const meta = user.user_metadata || {}
    const fallbackProfile = {
      id: user.id,
      full_name: meta.full_name || user.email?.split('@')[0] || 'Utilisateur',
      role: meta.role || 'student',
      user_type: meta.user_type || null,
      cycle: meta.cycle || null,
      institution_name: meta.institution_name
        || (meta.user_type === 'etudiant_esb' || meta.user_type === 'ancien' ? 'École Supérieure de Banque' : null),
    }

    const { data: newProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(fallbackProfile, { onConflict: 'id' })
      .select('*')
      .single()

    if (upsertError) {
      console.error('[ensureProfile] Failed to create profile in DB:', upsertError.message)
      console.warn('[ensureProfile] Returning fallback profile to prevent UI block.')
      // Return the fallback profile if DB insert fails (e.g., due to missing RLS policy in production)
      return { 
        ...fallbackProfile, 
        created_at: user.created_at,
        debug_error_select: error?.message || 'No select error',
        debug_error_upsert: upsertError?.message || 'No upsert error'
      }
    }

    return newProfile
  } catch (err) {
    console.error('[ensureProfile] Unexpected error:', err)
    return null
  }
}
