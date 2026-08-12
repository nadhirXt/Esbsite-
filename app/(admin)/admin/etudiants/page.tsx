import { createClient } from '@/lib/supabase/server'
import AdminStudentsClient from './AdminStudentsClient'

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage() {
  const supabase = await createClient()

  // Fetch all profiles except admins
  const { data: students, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching students:', error)
  }

  return <AdminStudentsClient initialStudents={students || []} />
}
