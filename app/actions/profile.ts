'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { full_name: string, linkedin_url: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non autorisé' }
  }

  // Validate linkedin_url to prevent XSS via javascript: protocol
  let validatedLinkedinUrl = data.linkedin_url?.trim() || ''
  if (validatedLinkedinUrl) {
    try {
      const url = new URL(validatedLinkedinUrl)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        return { error: 'URL LinkedIn invalide. Seules les URLs https:// sont acceptées.' }
      }
    } catch {
      return { error: 'URL LinkedIn invalide.' }
    }
  }

  // Update profile in database
  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: data.full_name,
      linkedin_url: validatedLinkedinUrl
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { error: 'Erreur lors de la mise à jour du profil' }
  }

  // Also update user metadata
  await supabase.auth.updateUser({
    data: {
      full_name: data.full_name,
      linkedin_url: validatedLinkedinUrl
    }
  })

  revalidatePath('/dashboard/profile')
  revalidatePath('/admin/etudiants')
  
  return { error: null }
}
