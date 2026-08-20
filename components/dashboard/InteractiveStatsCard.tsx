'use client'

import { motion } from 'framer-motion'
import { FileText, FolderOpen, TrendingUp, Sparkles, Star, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface StatsOverviewProps {
  totalDocuments: number
  totalCourses: number
  recentActivity: number
  cycle: string
}

export function StatsOverview({ totalDocuments, totalCourses, recentActivity, cycle }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <StatCard
        icon={FileText}
        value={totalDocuments}
        label="Documents"
        color="blue"
        href={`/dashboard/${cycle}`}
      />
      <StatCard
        icon={FolderOpen}
        value={totalCourses}
        label="Cours"
        color="emerald"
        href={`/dashboard/${cycle}`}
      />
      <StatCard
        icon={Clock}
        value={recentActivity}
        label="Récents"
        color="amber"
        href="/dashboard/bibliotheque"
      />
      <StatCard
        icon={Star}
        value={0}
        label="Favoris"
        color="rose"
        href="/dashboard/favoris"
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  href
}: {
  icon: any
  value: number
  label: string
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
  href: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    // Animate counter
    const duration = 1000
    const steps = 20
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-800',
      gradient: 'from-blue-500 to-indigo-600'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-800',
      gradient: 'from-emerald-500 to-teal-600'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-800',
      gradient: 'from-amber-500 to-orange-600'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-800',
      gradient: 'from-rose-500 to-pink-600'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-800',
      gradient: 'from-purple-500 to-violet-600'
    }
  }

  const colors = colorClasses[color]

  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className={`relative overflow-hidden rounded-xl border ${colors.border} bg-white dark:bg-[#111827] p-4 hover:shadow-md transition-all duration-300 cursor-pointer group`}
      >
        <div className="flex items-start justify-between">
          <div>
            <motion.p
              className={`text-3xl font-bold ${colors.text}`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {displayValue}
            </motion.p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
        </div>

        {/* Subtle gradient line at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </motion.div>
    </Link>
  )
}

// Quick action buttons with hover animations
export function QuickActions({ cycle }: { cycle: string }) {
  const actions = [
    {
      label: 'Mes Cours',
      description: 'Accédez à vos documents',
      icon: FolderOpen,
      href: `/dashboard/${cycle}`,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'Bibliothèque',
      description: 'Explorez tous les documents',
      icon: FileText,
      href: '/dashboard/bibliotheque',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      label: 'Favoris',
      description: 'Vos documents sauvegardés',
      icon: Star,
      href: '/dashboard/favoris',
      color: 'from-amber-500 to-orange-600'
    }
  ]

  return (
    <div className="grid sm:grid-cols-3 gap-4 mb-8">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            href={action.href}
            className="group relative flex items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-400/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {action.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

// Activity feed component
export function ActivityFeed({ activities }: { activities: Array<{ id: string; title: string; date: string; type: string }> }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune activité récente</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activity.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activity.date}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
