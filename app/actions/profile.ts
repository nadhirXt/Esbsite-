'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { full_name: string, linkedin_url: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non autorisé' }
  }

  // Update profile in database
  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: data.full_name,
      linkedin_url: data.linkedin_url 
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { error: 'Erreur lors de la mise à jour du profil' }
  }

  // Also update user metadata just in case
  await supabase.auth.updateUser({
    data: {
      full_name: data.full_name,
      linkedin_url: data.linkedin_url
    }
  })

  revalidatePath('/dashboard/profile')
  revalidatePath('/admin/etudiants')
  
  return { error: null }
}
