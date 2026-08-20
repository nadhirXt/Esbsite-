import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsPageClient from './AnalyticsPageClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupère les documents du cycle de l'utilisateur pour les stats de progression
  const { data: profile } = await supabase
    .from('profiles')
    .select('cycle')
    .eq('id', user.id)
    .single()

  const cycle = profile?.cycle || 'licence'

  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, category, cycle, created_at')
    .eq('cycle', cycle)
    .neq('title', '.keep')

  return <AnalyticsPageClient initialDocuments={documents || []} cycle={cycle} />
}