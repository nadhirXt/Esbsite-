'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Timer, Flame, CalendarClock, Zap, Play, 
  TrendingUp, BookOpen, Clock, Trash2, RotateCcw,
  Sparkles, CheckCircle2, Coffee, Plus
} from 'lucide-react'
import { 
  getLocalFocusStats, 
  deleteLocalFocusSession, 
  clearLocalFocusSessions, 
  formatMinutes 
} from '@/lib/study-api'
import FocusMode from '@/components/dashboard/FocusMode'

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function StudyAnalytics() {
  const [stats, setStats] = useState<ReturnType<typeof getLocalFocusStats> | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isFocusOpen, setIsFocusOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const refreshStats = useCallback(() => {
    if (typeof window !== 'undefined') {
      setStats(getLocalFocusStats())
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    refreshStats()

    // Listen to storage events if pomodoro completed elsewhere
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'esb_focus_sessions') {
        refreshStats()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refreshStats])

  const handleDeleteSession = (id: string) => {
    deleteLocalFocusSession(id)
    refreshStats()
  }

  const handleClearAll = () => {
    clearLocalFocusSessions()
    setConfirmClear(false)
    refreshStats()
  }

  if (!mounted || !stats) {
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

  const hasSessions = stats.totalSessions > 0
  const maxDayMinutes = Math.max(...stats.thisWeek.map(x => x.minutes), 1)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Top Action Banner */}
        <div className="rounded-3xl bg-[#070D19]/90 backdrop-blur-2xl border border-cyan-500/30 text-white p-6 sm:p-7 shadow-[0_0_35px_rgba(56,189,248,0.1)] relative overflow-hidden">
          {/* Laser line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Méthode Pomodoro (25 min Focus + 5 min Pause)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Statistiques de Focus &amp; Concentration
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Visualisez vos cycles d&apos;étude, le temps investi par matière et votre constance de révision.
              </p>
            </div>
            <button
              onClick={() => setIsFocusOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all transform hover:-translate-y-0.5 shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>DÉMARRER UN POMODORO</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            icon={Timer}
            label="Temps Focus Total"
            value={formatMinutes(stats.totalMinutes)}
            subLabel={`${stats.totalSessions} session${stats.totalSessions > 1 ? 's' : ''}`}
            color="amber"
          />
          <StatTile
            icon={Flame}
            label="Série Actuelle"
            value={`${stats.streakDays} jour${stats.streakDays > 1 ? 's' : ''}`}
            subLabel={stats.streakDays > 0 ? 'Régularité active' : 'Lancez une session'}
            color="rose"
          />
          <StatTile
            icon={CalendarClock}
            label="Cette Semaine"
            value={formatMinutes(stats.weekMinutes)}
            subLabel="7 derniers jours"
            color="indigo"
          />
          <StatTile
            icon={Zap}
            label="Aujourd'hui"
            value={formatMinutes(stats.todayMinutes)}
            subLabel={stats.todayMinutes > 0 ? 'Objectif en cours' : 'Aucune session'}
            color="emerald"
          />
        </div>

        {/* Weekly activity chart */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070D19]/90 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Activité Pomodoro des 7 derniers jours
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total semaine : {formatMinutes(stats.weekMinutes)}
            </span>
          </div>

          {/* Heatmap / Bars */}
          <div className="flex items-end justify-between gap-2 h-36 pt-4 pb-1">
            {stats.thisWeek.map((d, i) => {
              const h = d.minutes === 0 ? 8 : Math.max(12, (d.minutes / maxDayMinutes) * 100)
              const isToday = i === 6

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-slate-900 dark:bg-slate-800 text-white text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-20">
                    <span className="font-semibold">{d.minutes === 0 ? '0 min' : formatMinutes(d.minutes)}</span>
                    <span className="text-[9px] text-slate-300">{d.count} session{d.count > 1 ? 's' : ''}</span>
                  </div>

                  <div className="w-full h-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                      className={`w-full rounded-xl transition-all relative ${
                        isToday 
                          ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30' 
                          : 'bg-gradient-to-t from-blue-600/80 to-amber-500/80 hover:opacity-100'
                      }`}
                      style={{ 
                        opacity: d.minutes === 0 ? 0.15 : 0.6 + (0.4 * (d.minutes / maxDayMinutes)) 
                      }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium ${isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'}`}>
                    {DAY_LABELS[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grid: Temps par Matière & Historique */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temps de focus par matière */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Temps de Focus par Matière
                </h3>
              </div>

              {stats.topModules.length > 0 ? (
                <div className="space-y-3.5">
                  {stats.topModules.map((item, i) => {
                    const pct = Math.round((item.minutes / Math.max(stats.totalMinutes, 1)) * 100)
                    const colors = [
                      'from-blue-500 to-indigo-600',
                      'from-amber-500 to-orange-600',
                      'from-emerald-500 to-teal-600',
                      'from-purple-500 to-pink-600',
                      'from-cyan-500 to-blue-600',
                    ]

                    return (
                      <motion.div
                        key={item.module}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-[240px]">
                            {item.module}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {formatMinutes(item.minutes)}
                            </span>
                            <span className="text-[10px] text-slate-400 w-8 text-right">
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}
                            className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto opacity-40 text-amber-500" />
                  <p className="text-xs">
                    Aucune matière enregistrée pour le moment.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-500">
                    Indiquez le nom de votre cours lorsque vous lancez un cycle Pomodoro.
                  </p>
                </div>
              )}
            </div>

            {stats.topModules.length > 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                💡 Renseignez votre matière au démarrage du timer pour catégoriser vos sessions.
              </p>
            )}
          </div>

          {/* Historique des sessions Pomodoro */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Historique des Sessions
                  </h3>
                </div>

                {hasSessions && (
                  confirmClear ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        onClick={handleClearAll}
                        className="text-rose-600 hover:text-rose-700 font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="text-slate-400 hover:text-slate-600 px-1"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="text-xs text-slate-400 hover:text-rose-500 transition-colors inline-flex items-center gap-1"
                      title="Effacer tout l'historique"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Effacer</span>
                    </button>
                  )
                )}
              </div>

              {hasSessions ? (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {stats.recentSessions.slice(0, 10).map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          session.type === 'break'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {session.type === 'break' ? (
                            <Coffee className="w-3.5 h-3.5" />
                          ) : (
                            <Timer className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {session.module || 'Général'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(session.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          +{session.minutes} min
                        </span>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 transition-opacity"
                          title="Supprimer cette session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Timer className="w-8 h-8 mx-auto opacity-40 text-indigo-500" />
                  <p className="text-xs">Aucune session enregistrée.</p>
                  <button
                    onClick={() => setIsFocusOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Lancer votre premier cycle Pomodoro
                  </button>
                </div>
              )}
            </div>

            {hasSessions && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-2 text-right">
                Affichage des {Math.min(stats.recentSessions.length, 10)} dernières sessions
              </p>
            )}
          </div>
        </div>

        {/* Focus Mode Modal */}
        <AnimatePresence>
          {isFocusOpen && (
            <FocusMode
              onClose={() => {
                setIsFocusOpen(false)
                refreshStats()
              }}
              onComplete={() => {
                refreshStats()
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

function StatTile({ 
  icon: Icon, 
  label, 
  value, 
  subLabel, 
  color 
}: { 
  icon: any
  label: string
  value: string
  subLabel?: string
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo'
}) {
  const colorMap = {
    blue: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  }

  const iconBgMap = {
    blue: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    rose: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070D19]/90 backdrop-blur-xl p-4 sm:p-5 flex items-start justify-between shadow-sm hover:border-cyan-400/40 transition-all`}
    >
      <div>
        <p className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mt-1">{label}</p>
        {subLabel && (
          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{subLabel}</p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl ${iconBgMap[color]} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
    </motion.div>
  )
}