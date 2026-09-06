import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Ensures a profile row exists for the given user.
 * If the trigger didn't fire (e.g. user was created before schema was applied),
 * this function creates the profile on-the-fly using upsert.
 *
 * Returns the profile data or null on hard failure.
 */
const ADMIN_EMAILS = [
  'benelhadjbenelhadj@gmail.com',
  'benelhadjbenelhadj@outlook.com',
  'mohamed-nadhir.benelhadj@etu.enp-oran.dz',
]

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
) {
  try {
    const userEmail = (user.email || '').toLowerCase()
    const isDesignatedAdmin = ADMIN_EMAILS.includes(userEmail)

    // 1. Try to fetch existing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile exists, ensure designated admin status if applicable
    if (profile) {
      if (isDesignatedAdmin && profile.role !== 'admin') {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)
        return { ...profile, role: 'admin' }
      }
      return profile
    }

    // 2. Profile doesn't exist → create it from user metadata
    const meta = user.user_metadata || {}
    const fallbackProfile = {
      id: user.id,
      full_name: meta.full_name || user.email?.split('@')[0] || 'Utilisateur',
      role: isDesignatedAdmin ? 'admin' : (meta.role || 'student'),
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
        created_at: user.created_at
      }
    }

    return newProfile
  } catch (err) {
    console.error('[ensureProfile] Unexpected error:', err)
    return null
  }
}
