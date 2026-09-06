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
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row relative">
      {/* Cyber Grid & Ambient Orbs */}
      <div className="fixed inset-0 cyber-grid-pattern opacity-15 pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <AdminSidebar user={{ fullName: profile?.full_name || 'Administrateur' }} />

      <div className="flex-1 flex flex-col min-w-0 md:h-full md:overflow-hidden relative z-10">
        {/* Mission Control Cockpit Topbar (Desktop) */}
        <div className="hidden md:flex items-center justify-between px-8 py-3 bg-white/80 dark:bg-[#070D19]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 text-xs shrink-0">
          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-2 font-black text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              MISSION CONTROL DECK
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">ADMINISTRATION CENTRALE ESB</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold tracking-wider">
              PRIVILEGE: ROOT ADMIN
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              SYS STAT: OPTIMAL
            </span>
          </div>
        </div>

        {/* Main Admin Content */}
        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10 overflow-y-auto cyber-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
