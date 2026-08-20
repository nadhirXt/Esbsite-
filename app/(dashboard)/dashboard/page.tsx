import { createClient } from '@/lib/supabase/server'
import { BookOpen, Link2, FileText, GraduationCap, ArrowRight, Trophy, Sparkles, FolderOpen, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { CYCLES } from '@/lib/utils'
import { ensureProfile } from '@/lib/ensure-profile'
import { getUserBadges } from '@/lib/badges'
import BadgeList from '@/components/ui/BadgeList'
import { getPresignedDownloadUrl } from '@/app/actions/storage'

import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import PopularDocuments from '@/components/dashboard/PopularDocuments'
import ContinueLearning from '@/components/dashboard/ContinueLearning'
import { StatsOverview, QuickActions } from '@/components/dashboard/InteractiveStatsCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = await ensureProfile(supabase, user!)

  // Fetch recent documents for "Popular" section
  const { data: recentDocs } = await supabase
    .from('documents')
    .select('*')
    .neq('title', '.keep')
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch stats for the dashboard
  const userCycle = profile?.cycle || 'licence'

  const { count: totalDocs } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('cycle', userCycle)
    .neq('title', '.keep')

  const { data: coursesData } = await supabase
    .from('documents')
    .select('category')
    .eq('cycle', userCycle)
    .neq('title', '.keep')

  const uniqueCourses = new Set(coursesData?.map(d => d.category) || []).size

  const { count: recentCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .neq('title', '.keep')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())



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

      {/* Recommandations "Reprendre là où vous étiez" */}
      <ContinueLearning />

      {/* Stats Overview */}
      <StatsOverview
        totalDocuments={totalDocs || 0}
        totalCourses={uniqueCourses || 0}
        recentActivity={recentCount || 0}
        cycle={userCycle}
      />

      {/* Popular Documents section */}
      {recentDocs && recentDocs.length > 0 && (
        <PopularDocuments documents={recentDocs} />
      )}

      {/* Quick Actions */}
      <QuickActions cycle={userCycle} />


    </div>
  )
}
