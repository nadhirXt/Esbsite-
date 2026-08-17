/**
 * ESB Hub — Declarative Badge System
 * Badges are computed from profile data, no extra DB table needed.
 */

export interface Badge {
  id: string
  label: string
  emoji: string
  color: string          // Tailwind-compatible color classes
  description: string
}

interface ProfileData {
  role?: string
  user_type?: string
  cycle?: string
  is_delegate?: boolean
  created_at?: string
}

const ALL_BADGES: Badge[] = [
  {
    id: 'admin',
    label: 'Admin',
    emoji: '🛡️',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    description: 'Administrateur de la plateforme',
  },
  {
    id: 'professeur',
    label: 'Professeur',
    emoji: '👨‍🏫',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    description: 'Enseignant de l\'ESB',
  },
  {
    id: 'alumni',
    label: 'Banquier',
    emoji: '🏦',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    description: 'Ancien(ne) diplômé(e) de l\'ESB',
  },
  {
    id: 'delegate',
    label: 'Délégué',
    emoji: '⭐',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    description: 'Délégué(e) de promotion',
  },
  {
    id: 'major',
    label: 'Major',
    emoji: '🎓',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    description: 'Formation avancée (DSEB/Master)',
  },
  {
    id: 'pioneer',
    label: 'Pionnier',
    emoji: '🌟',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    description: 'Parmi les premiers membres de la plateforme',
  },
]

/**
 * Compute which badges a user profile qualifies for.
 */
export function getUserBadges(profile: ProfileData): Badge[] {
  const badges: Badge[] = []

  // Admin badge
  if (profile.role === 'admin') {
    badges.push(ALL_BADGES.find(b => b.id === 'admin')!)
  }

  // Professeur badge
  if (profile.user_type === 'professeur') {
    badges.push(ALL_BADGES.find(b => b.id === 'professeur')!)
  }

  // Alumni / ancien étudiant badge
  if (profile.user_type === 'ancien_etudiant_esb' || profile.user_type === 'ancien') {
    badges.push(ALL_BADGES.find(b => b.id === 'alumni')!)
  }

  // Delegate badge
  if (profile.is_delegate) {
    badges.push(ALL_BADGES.find(b => b.id === 'delegate')!)
  }

  // Major badge — DSEB or Master students
  if (profile.cycle === 'dseb' || profile.cycle === 'master') {
    badges.push(ALL_BADGES.find(b => b.id === 'major')!)
  }

  // Pioneer badge — account created in the first 30 days of the platform
  // We check if created_at is within 2025 (early adopters)
  if (profile.created_at) {
    const created = new Date(profile.created_at)
    const cutoff = new Date('2026-01-01')
    if (created < cutoff) {
      badges.push(ALL_BADGES.find(b => b.id === 'pioneer')!)
    }
  }

  return badges
}
