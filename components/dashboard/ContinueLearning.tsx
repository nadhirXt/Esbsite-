'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Clock, BookOpen, ChevronRight, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'
import { getContinueLearning, type ContinueDoc } from '@/lib/study-api'
import { getCourseThumbnail } from '@/lib/course-thumbnails'

export default function ContinueLearning() {
  const [docs, setDocs] = useState<ContinueDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getContinueLearning()
      .then(d => {
        setDocs(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Reprendre ...</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!docs.length) return null

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center">
          <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Reprendre là où vous étiez</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {docs.map((doc, i) => (
          <ContinueCard key={doc.document_id} doc={doc} index={i} />
        ))}
      </div>
    </div>
  )
}

function ContinueCard({ doc, index }: { doc: ContinueDoc; index: number }) {
  const thumbnail = getCourseThumbnail(doc.category)
  const Icon = thumbnail.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="group relative flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-3.5 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
    >
      {/* Mini thumbnail */}
      <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${thumbnail.gradient} dark:bg-gradient-to-br dark:${thumbnail.gradientDark} flex items-center justify-center shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {doc.title}
        </p>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(doc.viewed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <Link
        href={`/dashboard/${doc.cycle}`}
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
        title="Ouvrir"
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </motion.div>
  )
}