'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import StudyAnalytics from '@/components/dashboard/StudyAnalytics'
import ProgressByCourse from '@/components/dashboard/ProgressByCourse'

interface Doc {
  id: string
  title: string
  category: string
  cycle: string
  created_at: string
}

export default function AnalyticsPageClient({
  initialDocuments,
  cycle,
}: {
  initialDocuments: Doc[]
  cycle: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au tableau de bord
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes Statistiques</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Votre activité d'étude en un coup d'œil</p>
          </div>
        </div>
      </div>

      <StudyAnalytics />

      {/* Progression par matière */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 tracking-tight uppercase opacity-80">
          Progression par matière
        </h2>
        <ProgressByCourse documents={initialDocuments} />
      </div>
    </motion.div>
  )
}