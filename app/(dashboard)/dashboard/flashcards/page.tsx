import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FlashcardsClient from '@/components/dashboard/FlashcardsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Flashcards | ESB Hub' }

export default async function FlashcardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: decks } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return <FlashcardsClient initialDecks={decks || []} />
}
