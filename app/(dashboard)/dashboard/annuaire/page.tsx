import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PublicStudentsClient from './PublicStudentsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Réseau Étudiants | ESB Hub' }

export default async function PublicAnnuairePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch only public data (full_name, linkedin_url) using the secure RPC function
  const { data: students, error } = await supabase.rpc('get_public_students')

  if (error) {
    console.error('Error fetching public students:', error)
  }

  return <PublicStudentsClient initialStudents={students || []} />
}
