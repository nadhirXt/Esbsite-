import { AlertCircle, Sparkles, GraduationCap, Clock, FileText } from 'lucide-react'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_date: string
  event_time?: string
  end_time?: string
  type: string
  cycle?: string | null
  year?: number | null
  location?: string | null
  created_by?: string | null
}

export interface EventTypeConfig {
  label: string
  color: string
  dot: string
  bg: string
  icon?: any
}

export const EVENT_TYPES: Record<string, EventTypeConfig> = {
  exam: {
    label: 'Examen',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: AlertCircle,
  },
  ds: {
    label: 'Devoir Surveillé',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    dot: 'bg-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: Clock,
  },
  examen_final: {
    label: 'Examen Final',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    dot: 'bg-rose-500',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    icon: AlertCircle,
  },
  rattrapage: {
    label: 'Rattrapage',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: FileText,
  },
  holiday: {
    label: 'Congé',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: Sparkles,
  },
  autre: {
    label: 'Événement',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    dot: 'bg-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: GraduationCap,
  },
}
