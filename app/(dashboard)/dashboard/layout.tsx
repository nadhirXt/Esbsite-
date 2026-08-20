import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications'
import FocusLauncher from '@/components/dashboard/FocusLauncher'
import { ensureProfile } from '@/lib/ensure-profile'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] relative flex flex-col md:flex-row overflow-hidden">
      {/* Ambient background orbs for glassmorphism effect */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/4 pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-600/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col md:flex-row w-full h-screen">
      <RealtimeNotifications userCycle={profile?.cycle} userRole={profile?.role} />
      <DashboardSidebar
        user={{
          email: user.email!,
          fullName: profile?.full_name,
          cycle: profile?.cycle,
          role: profile?.role,
          is_delegate: profile?.is_delegate,
          user_type: profile?.user_type,
          created_at: profile?.created_at
        }}
      />
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
      </div>
      <FocusLauncher />
    </div>
  )
}
