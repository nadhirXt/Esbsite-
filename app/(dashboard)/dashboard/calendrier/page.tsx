import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/ensure-profile'
import CalendarViewClient from '@/components/dashboard/CalendarViewClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Calendrier des Examens | ESB Hub' }

export default async function CalendrierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  const { data: events, error } = await supabase.rpc('get_upcoming_events', {
    p_cycle: profile?.cycle || null,
    p_year: profile?.year || null,
  })

  if (error) {
    console.error('Error fetching events:', error)
  }

  return <CalendarViewClient events={events || []} />
}
