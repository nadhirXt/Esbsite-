import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/ensure-profile'
import GradeCalculatorClient from '@/components/dashboard/GradeCalculatorClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Calculateur de Moyenne & Simulateur | ESB Hub' }

export default async function CalculateurPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  return <GradeCalculatorClient userCycle={profile?.cycle} />
}