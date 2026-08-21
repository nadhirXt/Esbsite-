import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GuichetDelegateClient from '@/components/dashboard/GuichetDelegateClient'
import { ensureProfile } from '@/lib/ensure-profile'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata = { title: 'Guichet Délégué - Gestion Tickets | ESB Hub' }

export default async function DelegateTicketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await ensureProfile(supabase, user)

  // Sécurité: Seuls les délégués et admins peuvent accéder
  if (profile?.role !== 'admin' && !profile?.is_delegate) {
    redirect('/dashboard')
  }

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // Récupérer tous les tickets du cycle/année du délégué
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, profiles:student_id(email, full_name, cycle)')
    .eq('delegate_cycle', profile.delegate_cycle)
    .eq('delegate_year', profile.delegate_year)
    .order('created_at', { ascending: false })

  return <GuichetDelegateClient tickets={tickets || []} delegateCycle={profile.delegate_cycle} delegateYear={profile.delegate_year} />
}