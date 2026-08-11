import { createClient } from '@/lib/supabase/server'
import CycleDocumentsClient from './CycleDocumentsClient'

interface DocPageProps {
  cycle: string
  cycleLabel: string
}

export async function CycleDocumentsPage({ cycle, cycleLabel }: DocPageProps) {
  const supabase = await createClient()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('cycle', cycle)
    .order('category', { ascending: true })
    .order('created_at', { ascending: false })

  return <CycleDocumentsClient cycle={cycle} cycleLabel={cycleLabel} documents={documents || []} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL} supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY} />
}

