// Course category thumbnails with colors and icons
// Each category has a gradient, icon, and description for visual appeal

import {
  BookOpen,
  Calculator,
  TrendingUp,
  Scale,
  Globe,
  FileText,
  Users,
  BarChart3,
  Landmark,
  Coins,
  Briefcase,
  Brain,
  PenTool,
  Laptop,
  MessageSquare
} from 'lucide-react'

export interface CourseThumbnail {
  id: string
  label: string
  icon: any
  gradient: string
  gradientDark: string
  description: string
  pattern?: string
}

// Mapping des catégories de cours vers leurs miniatures
export const COURSE_THUMBNAILS: Record<string, CourseThumbnail> = {
  // Commerce & Management
  'management': {
    id: 'management',
    label: 'Management',
    icon: Briefcase,
    gradient: 'from-violet-500 to-purple-600',
    gradientDark: 'from-violet-600 to-purple-700',
    description: 'Gestion et leadership',
    pattern: 'dots'
  },
  'marketing': {
    id: 'marketing',
    label: 'Marketing',
    icon: TrendingUp,
    gradient: 'from-pink-500 to-rose-600',
    gradientDark: 'from-pink-600 to-rose-700',
    description: 'Stratégies commerciales',
    pattern: 'waves'
  },
  'commerce': {
    id: 'commerce',
    label: 'Commerce',
    icon: BarChart3,
    gradient: 'from-cyan-500 to-teal-600',
    gradientDark: 'from-cyan-600 to-teal-700',
    description: 'Commerce international',
    pattern: 'grid'
  },

  // Finance & Banque
  'finance': {
    id: 'finance',
    label: 'Finance',
    icon: Coins,
    gradient: 'from-amber-500 to-orange-600',
    gradientDark: 'from-amber-600 to-orange-700',
    description: 'Marchés financiers',
    pattern: 'circuits'
  },
  'banque': {
    id: 'banque',
    label: 'Banque',
    icon: Landmark,
    gradient: 'from-blue-500 to-indigo-600',
    gradientDark: 'from-blue-600 to-indigo-700',
    description: 'Système bancaire',
    pattern: 'grid'
  },
  'comptabilite': {
    id: 'comptabilite',
    label: 'Comptabilité',
    icon: Calculator,
    gradient: 'from-emerald-500 to-green-600',
    gradientDark: 'from-emerald-600 to-green-700',
    description: 'Comptabilité générale',
    pattern: 'dots'
  },

  // Juridique
  'droit': {
    id: 'droit',
    label: 'Droit',
    icon: Scale,
    gradient: 'from-slate-500 to-gray-700',
    gradientDark: 'from-slate-600 to-gray-800',
    description: 'Droit des affaires',
    pattern: 'lines'
  },
  'juridique': {
    id: 'juridique',
    label: 'Juridique',
    icon: Scale,
    gradient: 'from-slate-600 to-zinc-800',
    gradientDark: 'from-slate-700 to-zinc-900',
    description: 'Cadre juridique',
    pattern: 'lines'
  },

  // Économie
  'economie': {
    id: 'economie',
    label: 'Économie',
    icon: TrendingUp,
    gradient: 'from-orange-500 to-red-600',
    gradientDark: 'from-orange-600 to-red-700',
    description: 'Sciences économiques',
    pattern: 'waves'
  },

  // Langues & Communication
  'anglais': {
    id: 'anglais',
    label: 'Anglais',
    icon: Globe,
    gradient: 'from-sky-500 to-blue-600',
    gradientDark: 'from-sky-600 to-blue-700',
    description: 'Business English',
    pattern: 'dots'
  },
  'communication': {
    id: 'communication',
    label: 'Communication',
    icon: MessageSquare,
    gradient: 'from-fuchsia-500 to-pink-600',
    gradientDark: 'from-fuchsia-600 to-pink-700',
    description: 'Communication d\'entreprise',
    pattern: 'waves'
  },

  // Informatique
  'informatique': {
    id: 'informatique',
    label: 'Informatique',
    icon: Laptop,
    gradient: 'from-indigo-500 to-violet-600',
    gradientDark: 'from-indigo-600 to-violet-700',
    description: 'Systèmes d\'information',
    pattern: 'grid'
  },

  // Mathématiques
  'mathematiques': {
    id: 'mathematiques',
    label: 'Mathématiques',
    icon: Calculator,
    gradient: 'from-teal-500 to-cyan-600',
    gradientDark: 'from-teal-600 to-cyan-700',
    description: 'Mathématiques appliquées',
    pattern: 'dots'
  },
  'statistiques': {
    id: 'statistiques',
    label: 'Statistiques',
    icon: BarChart3,
    gradient: 'from-purple-500 to-indigo-600',
    gradientDark: 'from-purple-600 to-indigo-700',
    description: 'Analyse de données',
    pattern: 'grid'
  },

  // Méthodologie
  'methodologie': {
    id: 'methodologie',
    label: 'Méthodologie',
    icon: PenTool,
    gradient: 'from-rose-500 to-pink-600',
    gradientDark: 'from-rose-600 to-pink-700',
    description: 'Méthodes de recherche',
    pattern: 'waves'
  },
  'recherche': {
    id: 'recherche',
    label: 'Recherche',
    icon: BookOpen,
    gradient: 'from-amber-500 to-yellow-600',
    gradientDark: 'from-amber-600 to-yellow-700',
    description: 'Méthodologie recherche',
    pattern: 'dots'
  },

  // Général / Autre
  'general': {
    id: 'general',
    label: 'Général',
    icon: FileText,
    gradient: 'from-gray-400 to-slate-500',
    gradientDark: 'from-gray-500 to-slate-600',
    description: 'Documents généraux',
    pattern: 'dots'
  },

  // Memoires
  'memoires': {
    id: 'memoires',
    label: 'Mémoires',
    icon: Brain,
    gradient: 'from-red-500 to-rose-700',
    gradientDark: 'from-red-600 to-rose-800',
    description: 'Travaux de fin d\'études',
    pattern: 'waves'
  }
}

// Fonction pour obtenir la miniature d'une catégorie
export function getCourseThumbnail(category: string): CourseThumbnail {
  const normalizedCategory = category?.toLowerCase().trim() || 'general'

  // Recherche directe
  if (COURSE_THUMBNAILS[normalizedCategory]) {
    return COURSE_THUMBNAILS[normalizedCategory]
  }

  // Recherche par mots-clés
  const keywords: Record<string, string> = {
    'management': 'management',
    'manage': 'management',
    'marketing': 'marketing',
    'commerce': 'commerce',
    'commercial': 'commerce',
    'finance': 'finance',
    'financial': 'finance',
    'banque': 'banque',
    'banking': 'banque',
    'comptabilite': 'comptabilite',
    'comptabilité': 'comptabilite',
    'accounting': 'comptabilite',
    'droit': 'droit',
    'law': 'droit',
    'juridique': 'juridique',
    'legal': 'juridique',
    'economie': 'economie',
    'économie': 'economie',
    'economics': 'economie',
    'anglais': 'anglais',
    'english': 'anglais',
    'communication': 'communication',
    'informatique': 'informatique',
    'it': 'informatique',
    'info': 'informatique',
    'math': 'mathematiques',
    'mathematiques': 'mathematiques',
    'mathématiques': 'mathematiques',
    'statistiques': 'statistiques',
    'stats': 'statistiques',
    'methodologie': 'methodologie',
    'méthodologie': 'methodologie',
    'methodology': 'methodologie',
    'recherche': 'recherche',
    'research': 'recherche',
    'memoire': 'memoires',
    'mémoire': 'memoires',
    'thesis': 'memoires'
  }

  for (const [keyword, courseId] of Object.entries(keywords)) {
    if (normalizedCategory.includes(keyword)) {
      return COURSE_THUMBNAILS[courseId]
    }
  }

  return COURSE_THUMBNAILS['general']
}
