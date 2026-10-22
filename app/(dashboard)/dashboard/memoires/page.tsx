import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import MemoiresPageClient from './MemoiresPageClient'
import type { Document } from '@/lib/types'

export default async function MemoiresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Vérifier côté serveur que l'utilisateur a effectivement déverrouillé l'accès aux mémoires
  const { data: access } = await supabaseAdmin
    .from('memoires_access')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  const isUnlocked = access?.status === 'unlocked'

  // Ne charger les documents confidentiels que si l'accès est déverrouillé
  let documents: Document[] = []
  if (isUnlocked) {
    const { data: docs } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('cycle', 'memoires')
      .neq('title', '.keep')
      .order('created_at', { ascending: false })
    documents = (docs as Document[]) || []
  }

  // Fetch favorites
  let favoriteDocsIds: string[] = []
  if (isUnlocked) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('document_id')
      .eq('user_id', user.id)
    if (favs) {
      favoriteDocsIds = favs.map(f => f.document_id)
    }
  }

  return <MemoiresPageClient documents={documents} favoriteDocsIds={favoriteDocsIds} />
}
