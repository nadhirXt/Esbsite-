import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MemoiresPageClient from './MemoiresPageClient'

export default async function MemoiresPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch the actual documents for cycle "memoires"
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('cycle', 'memoires')
    .neq('title', '.keep')
    .order('created_at', { ascending: false })

  // Fetch favorites
  let favoriteDocsIds: string[] = []
  const { data: favs } = await supabase
    .from('favorites')
    .select('document_id')
    .eq('user_id', session.user.id)
  if (favs) {
    favoriteDocsIds = favs.map(f => f.document_id)
  }

  return <MemoiresPageClient documents={documents || []} favoriteDocsIds={favoriteDocsIds} />
}
