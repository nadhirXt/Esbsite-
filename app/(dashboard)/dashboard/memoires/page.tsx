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
    .order('created_at', { ascending: false })

  return <MemoiresPageClient documents={documents || []} />
}
