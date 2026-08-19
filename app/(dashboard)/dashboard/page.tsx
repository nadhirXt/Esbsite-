import { createClient } from '@/lib/supabase/server'
import { BookOpen, Link2, FileText, GraduationCap, ArrowRight, Trophy } from 'lucide-react'
import Link from 'next/link'
import { CYCLES } from '@/lib/utils'
import { ensureProfile } from '@/lib/ensure-profile'
import { getUserBadges } from '@/lib/badges'
import BadgeList from '@/components/ui/BadgeList'
import { getPresignedDownloadUrl } from '@/app/actions/storage'

import WelcomeBanner from '@/components/dashboard/WelcomeBanner'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = await ensureProfile(supabase, user!)



  const cycleBadge = profile?.cycle ? CYCLES[profile.cycle as keyof typeof CYCLES] : null
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const badges = getUserBadges({
    role: profile?.role,
    user_type: profile?.user_type,
    cycle: profile?.cycle,
    is_delegate: profile?.is_delegate,
    created_at: profile?.created_at,
  })

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome header */}
      <WelcomeBanner 
        greeting={greeting} 
        fullName={profile?.full_name || 'Étudiant(e)'} 
        cycleBadge={cycleBadge} 
      />

      {/* Badges section */}
      {badges.length > 0 && (
        <div className="mb-8 p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-[#A16207]" />
            <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">Vos badges</h2>
          </div>
          <BadgeList badges={badges} />
        </div>
      )}

      {/* Quick access cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { href: `/dashboard/${profile?.cycle || 'licence'}`, label: 'Mes cours', icon: BookOpen, color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' },
          { href: '/dashboard/ressources', label: 'Liens utiles', icon: Link2, color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-center justify-between rounded-xl border bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-[#0F172A] dark:text-white">{card.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#94A3B8] dark:text-slate-500 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors" />
          </Link>
        ))}
      </div>


    </div>
  )
}
