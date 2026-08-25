'use client'

import { motion } from 'framer-motion'
import { Timer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import StudyAnalytics from '@/components/dashboard/StudyAnalytics'

export default function AnalyticsPageClient() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au tableau de bord
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes Statistiques Pomodoro</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suivi de vos sessions de focus, régularité et temps d'étude</p>
          </div>
        </div>
      </div>

      <StudyAnalytics />
    </motion.div>
  )
}