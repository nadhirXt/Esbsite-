import { createClient } from '@/lib/supabase/server'
import AdminConcoursClient from './AdminConcoursClient'

export const dynamic = 'force-dynamic'

export default async function AdminConcoursPage() {
  const supabase = await createClient()

  // Fetch all documents tagged for the public concours
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('cycle', 'concours')
    .order('created_at', { ascending: false })

  return <AdminConcoursClient initialDocuments={documents || []} />
}

