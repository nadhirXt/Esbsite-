import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import BottomNav from '@/components/dashboard/BottomNav'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications'
import { FocusLauncher } from '@/components/dashboard/FocusMode'
import { ensureProfile } from '@/lib/ensure-profile'
import { ShieldCheck, MapPin, Sparkles, Building2 } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] relative flex flex-col md:flex-row text-slate-900 dark:text-slate-100">
      {/* Ambient background cyber grid & glow orbs */}
      <div className="fixed inset-0 cyber-grid-pattern opacity-15 pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/4 pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3 pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col md:flex-row w-full min-h-screen md:h-screen md:overflow-hidden">
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

        <div className="flex-1 flex flex-col min-w-0 md:h-full md:overflow-hidden">
          {/* Institutional HUD Cockpit Top Bar (Desktop) */}
          <div className="hidden md:flex items-center justify-between px-8 py-3 bg-white/80 dark:bg-[#070D19]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 text-xs shrink-0 z-20">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                <Building2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                École Supérieure de Banque d&apos;Algérie
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Direction Générale de la Banque d&apos;Algérie</span>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                COCKPIT ENCLAVE V2.4
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Session 2026–2027
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                Bouzaréah, Alger
              </span>
            </div>
          </div>

          {/* Main content scroll area with cyber scrollbar */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 pb-28 md:pb-10 overflow-y-auto cyber-scrollbar">
            {children}
          </main>
        </div>
      </div>
      <BottomNav cycle={profile?.cycle} />
      <FocusLauncher />
    </div>
  )
}

