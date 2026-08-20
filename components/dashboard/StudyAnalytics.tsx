'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Download, Clock, CalendarClock, TrendingUp, BookOpen, BarChart2 } from 'lucide-react'
import { getStudyStats, getLocalFocusStats, formatMinutes } from '@/lib/study-api'
import type { StudyStatsData } from '@/lib/study-api'

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function StudyAnalytics() {
  const [stats, setStats] = useState<StudyStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    getStudyStats()
      .then(data => {
        if (mounted) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Impossible de charger vos statistiques')
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  const focus = getLocalFocusStats()

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const totalViews = stats?.total_views ?? 0
  const totalDownloads = stats?.total_downloads ?? 0
  const totalMinutes = stats?.total_study_minutes ?? 0
  const weekMinutes = stats?.sessions_this_week ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          icon={Eye}
          label="Vues totales"
          value={String(totalViews)}
          color="blue"
        />
        <StatTile
          icon={Download}
          label="Téléchargements"
          value={String(totalDownloads)}
          color="emerald"
        />
        <StatTile
          icon={Clock}
          label="Temps d'étude"
          value={formatMinutes(focus.totalMinutes)}
          color="amber"
        />
        <StatTile
          icon={CalendarClock}
          label="Sessions / semaine"
          value={`${stats?.sessions_this_week ?? 0}`}
          color="purple"
        />
      </div>

      {/* Weekly activity */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activité des 7 derniers jours</h3>
        </div>

        {/* Heatmap */}
        <div className="flex items-end justify-between gap-1.5 h-32">
          {focus.thisWeek.map((d, i) => {
            const max = Math.max(...focus.thisWeek.map(x => x.minutes), 1)
            const h = d.minutes === 0 ? 8 : Math.max(8, (d.minutes / max) * 100)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                  className="w-full rounded-lg bg-gradient-to-t from-blue-600 to-amber-500 relative"
                  style={{ opacity: d.minutes === 0 ? 0.12 : 0.5 + (0.5 * (d.minutes / max)) }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 dark:bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {d.minutes === 0 ? 'Rien' : formatMinutes(d.minutes)}
                  </div>
                </motion.div>
                <span className="text-[9px] text-slate-400">{DAY_LABELS[i]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top courses */}
      {stats?.top_courses && stats.top_courses.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Matières les plus consultées</h3>
          </div>
          <div className="space-y-2.5">
            {stats.top_courses.map((course, i) => {
              const max = Math.max(...stats.top_courses.map(c => c.count), 1)
              const pct = (course.count / max) * 100

              const bars = [
                'from-blue-500 to-indigo-600',
                'from-emerald-500 to-teal-600',
                'from-amber-500 to-orange-600',
                'from-rose-500 to-pink-600',
                'from-purple-500 to-violet-600'
              ]

              return (
                <motion.div
                  key={course.category}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-28 sm:w-40 text-xs font-medium text-slate-600 dark:text-slate-300 truncate text-right shrink-0">
                    {course.category || 'Général'}
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                      className={`h-full rounded-full bg-gradient-to-r ${bars[i % bars.length]}`}
                    />
                  </div>
                  <span className="w-6 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">
                    {course.count}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent reads */}
      {stats?.recent_documents && stats.recent_documents.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Récemment consultés</h3>
          </div>
          <div className="space-y-2">
            {stats.recent_documents.slice(0, 5).map((doc, i) => (
              <motion.div
                key={`${doc.id}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.title}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(doc.viewed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-500 text-center py-8">
          {error} — Reconnectez-vous ou réessayez plus tard.
        </p>
      )}
    </motion.div>
  )
}

function StatTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-2xl border ${colors[color]} p-4 flex items-start justify-between`}
    >
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
    </motion.div>
  )
}