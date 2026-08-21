import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminCalendrierClient from '@/components/admin/AdminCalendrierClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Gestion du Calendrier | ESB Admin' }

export default async function AdminCalendrierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all events for admin view (no cycle/year filter)
  const { data: events, error } = await supabase.rpc('get_upcoming_events', {
    p_cycle: null,
    p_year: null,
  })

  if (error) {
    console.error('Error fetching events:', error)
  }

  return <AdminCalendrierClient initialEvents={events || []} />
}