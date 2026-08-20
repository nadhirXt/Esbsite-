'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface ProgressDoc {
  id: string
  title: string
  category: string
  cycle: string
  created_at: string
}

interface CourseStats {
  category: string
  total: number
  read: number
  pct: number
  cycle: string
}

interface ProgressByCourseProps {
  documents: ProgressDoc[]
}

/**
 * Barre de progression par matière.
 * Progression estimée (à remplacer par user_progress RPC quand disponible).
 */
export default function ProgressByCourse({ documents }: ProgressByCourseProps) {
  if (!documents.length) return null

  // Group docs by category (Map<string, ProgressDoc[]>)
  const byCategory = new Map<string, ProgressDoc[]>()
  documents.forEach(doc => {
    const cat = doc.category || 'Général'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(doc)
  })

  const stats: CourseStats[] = Array.from(byCategory.entries()).map(([category, docs]) => {
    const available = docs.filter(d => d.title !== '.keep').length
    const readCount = Math.min(available, Math.floor(available * 0.35))
    const cycle = docs[0]?.cycle || 'licence'

    return {
      category,
      total: available,
      read: readCount,
      pct: available === 0 ? 0 : Math.round((readCount / available) * 100),
      cycle,
    }
  })

  stats.sort((a, b) => b.pct - a.pct)

  if (stats.length === 0) {
    return (
      <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune matière disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {stats.map((course, i) => (
        <motion.div
          key={course.category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4"
        >
          <div className="flex items-center gap-3 mb-2.5">
            {course.pct === 100 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{course.category}</p>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">
                  {course.pct}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.pct}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full ${course.pct === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
              />
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {course.read}/{course.total}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-1.5">
            {course.pct === 100
              ? '🏆 Terminé — bravo !'
              : course.read === 0
                ? 'Commencez à explorer cette matière'
                : 'Continuez pour progresser !'}
          </p>
        </motion.div>
      ))}
    </div>
  )
}