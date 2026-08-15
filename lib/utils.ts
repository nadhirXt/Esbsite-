export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const CYCLES = {
  licence: { label: 'Licence', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  dseb:    { label: 'DSEB',    color: 'bg-amber-50 text-amber-700 border-amber-200' },
  master:  { label: 'Master',  color: 'bg-purple-50 text-purple-700 border-purple-200' },
  bibliotheque: { label: 'Bibliothèque', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  memoires: { label: 'Mémoires (Confidentiel)', color: 'bg-red-50 text-red-700 border-red-200' },
} as const

export type Cycle = keyof typeof CYCLES
