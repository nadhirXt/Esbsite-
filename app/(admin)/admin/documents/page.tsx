import { createClient } from '@/lib/supabase/server'
import DocumentsClient from './DocumentsClient'

export const dynamic = 'force-dynamic'

export default async function AdminDocumentsPage() {
  const supabase = await createClient()

  // Fetch all documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  return <DocumentsClient documents={documents || []} />
}
