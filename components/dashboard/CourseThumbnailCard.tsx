'use client'

import { motion } from 'framer-motion'
import { Folder, ChevronRight, FileText, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getCourseThumbnail, type CourseThumbnail } from '@/lib/course-thumbnails'

interface CourseThumbnailCardProps {
  courseName: string
  categoryPath: string
  cycle: string
  documentsCount: number
  index?: number
}

export function CourseThumbnailCard({
  courseName,
  categoryPath,
  cycle,
  documentsCount,
  index = 0
}: CourseThumbnailCardProps) {
  const thumbnail = getCourseThumbnail(courseName)
  const Icon = thumbnail.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={`/dashboard/${cycle}/${encodeURIComponent(categoryPath)}`}
        className="group block relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300"
      >
        {/* Thumbnail Header with Gradient */}
        <div className={`relative h-28 bg-gradient-to-br ${thumbnail.gradient} dark:bg-gradient-to-br dark:${thumbnail.gradientDark} overflow-hidden`}>
          {/* Animated pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <PatternOverlay pattern={thumbnail.pattern} />
          </div>

          {/* Floating icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Sparkle effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
              </motion.div>
            </motion.div>
          </div>

          {/* Course count badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {documentsCount}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm mb-1 truncate">
            {courseName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">
            {thumbnail.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">
              {thumbnail.label}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
              <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Pattern overlays for visual variety
function PatternOverlay({ pattern }: { pattern?: string }) {
  if (pattern === 'dots') {
    return (
      <svg width="100%" height="100%" className="opacity-30">
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    )
  }

  if (pattern === 'grid') {
    return (
      <svg width="100%" height="100%" className="opacity-20">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    )
  }

  if (pattern === 'waves') {
    return (
      <svg width="100%" height="100%" className="opacity-20">
        <defs>
          <pattern id="waves" x="0" y="0" width="50" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q 12.5 0, 25 10 T 50 10" fill="none" stroke="white" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" />
      </svg>
    )
  }

  if (pattern === 'circuits') {
    return (
      <svg width="100%" height="100%" className="opacity-20">
        <defs>
          <pattern id="circuits" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="3" fill="none" stroke="white" strokeWidth="1" />
            <line x1="20" y1="0" x2="20" y2="17" stroke="white" strokeWidth="1" />
            <line x1="0" y1="20" x2="17" y2="20" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuits)" />
      </svg>
    )
  }

  return null
}

// Animated stats counter component
export function AnimatedCounter({
  value,
  label,
  icon: Icon,
  color = 'blue'
}: {
  value: number
  label: string
  icon: any
  color?: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose'
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
    amber: 'from-amber-500 to-orange-600 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
    emerald: 'from-emerald-500 to-teal-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    purple: 'from-purple-500 to-violet-600 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30',
    rose: 'from-rose-500 to-pink-600 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color].split(' ').slice(2).join(' ')} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[2]}`} />
      </div>
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-slate-900 dark:text-white"
        >
          {value}
        </motion.p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </motion.div>
  )
}
