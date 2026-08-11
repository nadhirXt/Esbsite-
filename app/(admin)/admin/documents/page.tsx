import { createClient } from '@/lib/supabase/server'
import AdminDriveClient from './AdminDriveClient'

export const dynamic = 'force-dynamic'

export default async function AdminDocumentsPage() {
  const supabase = await createClient()

  // Fetch all documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminDriveClient documents={documents || []} />
}
