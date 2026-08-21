import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/ensure-profile'
import AnnalesClient from '@/components/dashboard/AnnalesClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Annales & Bibliothèque d\'Épreuves | ESB Hub' }

export default async function AnnalesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  // Récupérer les épreuves depuis la table documents (type: epreuve)
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('doc_type', 'epreuve')
    .order('created_at', { ascending: false })

  return <AnnalesClient documents={documents || []} userCycle={profile?.cycle} />
}