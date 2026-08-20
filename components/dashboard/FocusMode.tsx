'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, X, Coffee, Brain, Flame, ChevronRight, Sparkles } from 'lucide-react'
import { addLocalFocusSession, getLocalFocusStats, formatMinutes } from '@/lib/study-api'

const FOCUS_DURATION = 25 * 60 // 25 min
const BREAK_DURATION = 5 * 60   // 5 min

export default function FocusMode({
  onClose,
  onComplete,
}: {
  onClose?: () => void
  onComplete?: (minutes: number, module: string) => void
}) {
  const [seconds, setSeconds] = useState(FOCUS_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [module, setModule] = useState('')
  const [showStats, setShowStats] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Play subtle completion sound
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACBhYqF')
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          // Session complete
          setIsRunning(false)

          const sessionMin = Math.round(
            (mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION) / 60
          )
          addLocalFocusSession(sessionMin, mode === 'focus' ? module : 'Pause')
          onComplete?.(sessionMin, mode === 'focus' ? module : 'Pause')

          // Switch modes
          if (mode === 'focus') {
            setMode('break')
            setSeconds(BREAK_DURATION)
          } else {
            setMode('focus')
            setSeconds(FOCUS_DURATION)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, mode, module, onComplete])

  const toggle = useCallback(() => setIsRunning(prev => !prev), [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setMode('focus')
    setSeconds(FOCUS_DURATION)
    setModule('')
  }, [])

  const stats = getLocalFocusStats()

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const progress = mode === 'focus'
    ? ((FOCUS_DURATION - seconds) / FOCUS_DURATION) * 100
    : ((BREAK_DURATION - seconds) / BREAK_DURATION) * 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] backdrop-blur-md bg-slate-900/60 dark:bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Decorative gradient */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-500/15 dark:bg-amber-600/10 blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {mode === 'focus' ? (
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Coffee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
              <h2 className="font-bold text-slate-900 dark:text-white">
                {mode === 'focus' ? 'Mode Focus' : <span className="flex items-center gap-1.5"><Coffee className="w-4 h-4 text-emerald-500" /> <Coffee className="w-4 h-4 text-emerald-400" /> Pause</span>}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timer Circle */}
          <div className="relative mx-auto mb-6 w-44 h-44">
            {/* Progress ring */}
            <svg className="w-full h-full rotate-90" viewBox="0 0 176 176">
              <circle
                cx="88" cy="88" r="80"
                fill="none"
                strokeWidth="8"
                className="stroke-slate-100 dark:stroke-slate-800"
              />
              <motion.circle
                cx="88" cy="88" r="80"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 80}
                className={mode === 'focus' ? 'stroke-blue-500' : 'stroke-emerald-500'}
                animate={{ strokeDashoffset: (1 - progress / 100) * 2 * Math.PI * 80 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.p
                key={seconds}
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold tabular-nums text-slate-900 dark:text-white"
              >
                {formatTime(seconds)}
              </motion.p>
              <span className={`text-xs font-medium mt-1 ${mode === 'focus' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {mode === 'focus' ? '🎯 Travail' : '☕ Pause'}
              </span>
            </div>
          </div>

          {/* Module input (focus mode only) */}
          {mode === 'focus' && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Matière en cours (optionnel)
              </label>
              <input
                type="text"
                value={module}
                onChange={e => setModule(e.target.value)}
                placeholder="Ex: Comptabilité, Droit, Économie..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggle}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isRunning ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'} hover:scale-105 active:scale-95`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <button
              onClick={() => setShowStats(s => !s)}
              className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Mes stats focus"
            >
              <Flame className="w-4 h-4" />
            </button>
          </div>

          {/* Stats panel */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <StatTile label="Sessions" value={`${stats.totalSessions}`} color="text-blue-600 dark:text-blue-400" />
                    <StatTile label="Focus total" value={formatMinutes(stats.totalMinutes)} color="text-amber-600 dark:text-amber-400" />
                  </div>

                  {/* Weekly mini-heatmap */}
                  <div className="flex items-end justify-between h-16 gap-1">
                    {stats.thisWeek.map((d, i) => {
                      const max = Math.max(...stats.thisWeek.map(x => x.minutes), 1)
                      const h = Math.max(4, (d.minutes / max) * 100)
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-md bg-gradient-to-t from-blue-600 to-amber-500" style={{ height: `${h}%`, opacity: d.minutes === 0 ? 0.15 : 0.6 + 0.4 * (d.minutes / max) }} />
                          <span className="text-[8px] text-slate-400 truncate w-full text-center">
                            {['L','M','M','J','V','S','D'][new Date(d.day + 'T00:00:00').getDay()]}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Top modules */}
                  {stats.topModules.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Matieres les plus étudiées</p>
                      {stats.topModules.map((m: { module: string; minutes: number }) => (
                        <div key={m.module} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-300 truncate">{m.module}</span>
                          <span className="text-slate-400 dark:text-slate-500 font-medium">{formatMinutes(m.minutes)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

// Floating launcher button (monté côté dashboard)
export function FocusLauncher() {
  const [open, setOpen] = useState(false)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <AnimatePresence>
        {open && (
          <FocusMode
            onClose={() => setOpen(false)}
            onComplete={(minutes, module) => {
              setJustCompleted(`+${minutes} min • ${module || 'Focus'}`)
              setTimeout(() => setJustCompleted(null), 3000)
            }}
          />
        )}
      </AnimatePresence>

      {/* Notification toast */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-6 z-[99] px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-medium">{justCompleted}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/30 flex items-center justify-center"
        title="Mode Focus (Ctrl+Shift+F)"
      >
        {open ? <X className="w-6 h-6" /> : <Timer className="w-6 h-6" />}
      </motion.button>
    </>
  )
}