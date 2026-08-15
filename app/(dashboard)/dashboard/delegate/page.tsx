import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DelegateDriveClient from '@/components/dashboard/DelegateDriveClient'
import { ensureProfile } from '@/lib/ensure-profile'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DelegatePage() {
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

  // L'administrateur peut-il voir cette page ? Normalement l'admin utilise /admin/documents
  // Mais s'il y accède, on peut lui donner un fallback, ou le rediriger.
  // Pour simplifier, si c'est l'admin, on le redirige vers le vrai drive admin.
  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // Récupérer les documents spécifiques au cycle et à l'année du délégué
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('cycle', profile.delegate_cycle)
    .eq('year', profile.delegate_year)
    .order('created_at', { ascending: false })

  return (
    <div className="animate-fade-in">
      <DelegateDriveClient 
        documents={documents || []} 
        delegateCycle={profile.delegate_cycle}
        delegateYear={profile.delegate_year}
        uploaderId={user.id}
      />
    </div>
  )
}
