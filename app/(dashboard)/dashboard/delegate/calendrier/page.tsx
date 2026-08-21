import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/ensure-profile'
import DelegateCalendrierClient from '@/components/dashboard/DelegateCalendrierClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Calendrier Délégué | ESB Hub' }

export default async function DelegateCalendrierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await ensureProfile(supabase, user)

  // Sécurité: Si l'utilisateur n'est pas délégué, il est redirigé
  if (profile?.role !== 'admin' && !profile?.is_delegate) {
    redirect('/dashboard')
  }

  // L'administrateur utilise l'interface admin
  if (profile?.role === 'admin') {
    redirect('/admin/calendrier')
  }

  return (
    <div className="animate-fade-in">
      <DelegateCalendrierClient
        delegateCycle={profile.delegate_cycle}
        delegateYear={profile.delegate_year}
        uploaderId={user.id}
      />
    </div>
  )
}