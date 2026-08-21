import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/ensure-profile'
import RevisionPlannerClient from '@/components/dashboard/RevisionPlannerClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Compagnon de Révision & Chrono DS | ESB Hub' }

export default async function RevisionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  return <RevisionPlannerClient userCycle={profile?.cycle} userId={user.id} />
}