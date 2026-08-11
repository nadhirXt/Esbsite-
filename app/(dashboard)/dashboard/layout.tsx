import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, cycle, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      <DashboardSidebar
        user={{ email: user.email!, fullName: profile?.full_name, cycle: profile?.cycle, role: profile?.role }}
      />
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  )
}
