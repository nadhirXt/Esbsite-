'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(documentId: string, path: string = '/dashboard') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if favorite exists
  const { data: existingFav } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('document_id', documentId)
    .single()

  if (existingFav) {
    // Remove favorite
    await supabase
      .from('favorites')
      .delete()
      .eq('id', existingFav.id)
  } else {
    // Add favorite
    await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        document_id: documentId
      })
  }

  revalidatePath(path)
  return !existingFav // Returns true if added, false if removed
}

export async function getUserFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      documents (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}
