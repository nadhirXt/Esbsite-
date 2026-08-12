import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { ensureProfile } from '@/lib/ensure-profile'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      <AdminSidebar user={{ fullName: profile?.full_name || 'Administrateur' }} />
      <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  )
}
