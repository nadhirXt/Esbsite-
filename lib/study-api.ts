// Helpers côté client pour les RPC "study" — légers, adaptés au free tier
// Ces fonctions appellent les RPC sécurisées (auth.uid()) créées dans supabase/study-features.sql

import { createClient } from '@/lib/supabase/client'

export interface ContinueDoc {
  document_id: string
  title: string
  category: string
  cycle: string
  viewed_at: string
}

export interface StudyStats {
  total_views: number
  total_downloads: number
  total_study_minutes: number
  sessions_this_week: number
  views_this_week: number
  last_7_days: Array<{ day: string; count: number }>
  top_courses: Array<{ category: string; count: number }>
  recent_documents: Array<{
    id: string
    title: string
    cycle: string
    category: string
    viewed_at: string
  }>
}

/** Log une vue de document (fire & forget, non bloquant) */
export function logDocumentView(documentId: string) {
  const supabase = createClient()
  try {
    supabase.rpc('log_document_view', { p_document_id: documentId }).then(({ error }) => {
      if (error) console.warn('[study] log view failed', error.message)
    })
  } catch (e) {
    // Ne jamais bloquer la lecture pour du tracking
  }
}

/** Log un téléchargement */
export function logDownload(documentId: string) {
  const supabase = createClient()
  try {
    supabase.rpc('log_download', { p_document_id: documentId }).then(({ error }) => {
      if (error) console.warn('[study] log download failed', error.message)
    })
  } catch (e) {
    // silencieux
  }
}

/** Récupère "Continuez là où vous vous êtes arrêté" */
export async function getContinueLearning(): Promise<ContinueDoc[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_continue_learning')
  if (error) {
    console.warn('[study] get_continue_learning failed:', error.message)
    return []
  }
  return (data as ContinueDoc[]) || []
}

/** Récupère les stats globales d'étude (1 requête agrégée) */
export async function getStudyStats() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_study_stats')
  if (error) {
    console.warn('[study] get_study_stats failed:', error.message)
    return null
  }
  return data
}

export interface StudyStatsData {
  total_views: number
  total_downloads: number
  total_study_minutes: number
  sessions_this_week: number
  views_this_week: number
  last_7_days: Array<{ day: string; count: number }>
  top_courses: Array<{ category: string; count: number }>
  recent_documents: Array<{
    id: string
    title: string
    cycle: string
    category: string
    viewed_at: string
  }>
}

// ── Pomodoro / focus (localStorage uniquement — zéro coût) ──
const FOCUS_STORAGE_KEY = 'esb_focus_sessions'

export interface FocusSession {
  id: string
  date: string          // ISO date
  minutes: number
  module: string
  type: 'focus' | 'break'
}

/** Charge les sessions focus stockées localement */
export function getLocalFocusSessions(): FocusSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FOCUS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FocusSession[]) : []
  } catch {
    return []
  }
}

/** Ajoute une session terminée */
export function addLocalFocusSession(minutes: number, module: string) {
  if (typeof window === 'undefined') return
  const sessions = getLocalFocusSessions()
  const session: FocusSession = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: new Date().toISOString(),
    minutes,
    module,
    type: 'focus',
  }
  sessions.push(session)
  // Limiter à ~120 sessions pour ne pas gonfler localStorage
  const trimmed = sessions.slice(-120)
  try {
    localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(trimmed))
  } catch (e) {
    // localStorage plein — on ignore
  }
}

/** Stats focus client-side (derniers 7 jours) */
export function getLocalFocusStats() {
  const sessions = getLocalFocusSessions()
  const now = new Date()

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  // Group by day for heatmap (7 derniers jours)
  const days: Array<{ day: string; minutes: number }> = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const total = sessions
      .filter(s => s.date.slice(0, 10) === key)
      .reduce((acc, s) => acc + s.minutes, 0)
    days.push({ day: key, minutes: total })
  }

  return {
    totalMinutes: sessions.reduce((acc, s) => acc + s.minutes, 0),
    totalSessions: sessions.length,
    weekMinutes: days.reduce((acc, d) => acc + d.minutes, 0),
    thisWeek: days,
    topModules: topModules(sessions),
  }
}

function topModules(sessions: FocusSession[]) {
  const map = new Map<string, number>()
  for (const s of sessions) {
    const mod = s.module || 'Général'
    map.set(mod, (map.get(mod) || 0) + s.minutes)
  }
  return Array.from(map.entries())
    .map(([module, minutes]) => ({ module, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5)
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}