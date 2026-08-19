import { createClient } from '@/lib/supabase/server'
import CycleDocumentsClient from './CycleDocumentsClient'

interface DocPageProps {
  cycle: string
  cycleLabel: string
}

export async function CycleDocumentsPage({ cycle, cycleLabel }: DocPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let favoriteDocsIds: string[] = []
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('document_id')
      .eq('user_id', user.id)
    
    if (favs) {
      favoriteDocsIds = favs.map(f => f.document_id)
    }
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('cycle', cycle)
    .neq('title', '.keep')
    .order('category', { ascending: true })
    .order('created_at', { ascending: false })

  return <CycleDocumentsClient cycle={cycle} cycleLabel={cycleLabel} documents={documents || []} favoriteDocsIds={favoriteDocsIds} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL} supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY} />
}

