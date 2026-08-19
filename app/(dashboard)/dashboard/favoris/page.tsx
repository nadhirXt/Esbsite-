import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FavorisPageClient from './FavorisPageClient'
import { getUserFavorites } from '@/app/actions/favorites'

export default async function FavorisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const favorites = await getUserFavorites()
  
  // Format the data to match what the client expects
  const formattedDocs = favorites.map(fav => {
    // If the join resulted in an array or single object
    const doc = Array.isArray(fav.documents) ? fav.documents[0] : fav.documents
    return doc
  }).filter(Boolean)

  return <FavorisPageClient documents={formattedDocs} favoriteDocsIds={formattedDocs.map(d => d.id)} />
}
