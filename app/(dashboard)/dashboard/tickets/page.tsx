import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/ensure-profile'
import GuichetStudentClient from '@/components/dashboard/GuichetStudentClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Guichet Délégué & Réclamations | ESB Hub' }

export default async function TicketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  // Récupérer les tickets de l'utilisateur
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return <GuichetStudentClient tickets={tickets || []} userCycle={profile?.cycle} userId={user.id} />
}