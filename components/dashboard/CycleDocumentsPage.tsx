import { createClient } from '@/lib/supabase/server'
import CycleDocumentsClient from './CycleDocumentsGrid'

interface DocPageProps {
  cycle: string
  cycleLabel: string
}

export async function CycleDocumentsPage({ cycle, cycleLabel }: DocPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [favsRes, docsRes] = await Promise.all([
    user
      ? supabase.from('favorites').select('document_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
    supabase
      .from('documents')
      .select('*')
      .eq('cycle', cycle)
      .order('category', { ascending: true })
      .order('created_at', { ascending: false })
  ])

  const favoriteDocsIds = (favsRes.data || []).map((f: any) => f.document_id)
  const documents = docsRes.data || []

  return (
    <CycleDocumentsClient
      cycle={cycle}
      cycleLabel={cycleLabel}
      documents={documents}
      favoriteDocsIds={favoriteDocsIds}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
      supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
    />
  )
}

