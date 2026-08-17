'use client'

import { type Badge } from '@/lib/badges'
import { cn } from '@/lib/utils'

interface BadgeListProps {
  badges: Badge[]
  /** Compact mode for sidebars (smaller) */
  compact?: boolean
  className?: string
}

export default function BadgeList({ badges, compact = false, className }: BadgeListProps) {
  if (!badges || badges.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {badges.map((badge, index) => (
        <span
          key={badge.id}
          title={badge.description}
          className={cn(
            'badge-pill animate-scale-in',
            badge.color,
            compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
          )}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <span>{badge.emoji}</span>
          {!compact && <span>{badge.label}</span>}
        </span>
      ))}
    </div>
  )
}
