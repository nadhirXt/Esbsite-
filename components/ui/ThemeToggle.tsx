'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  /** Variant for different contexts */
  variant?: 'header' | 'sidebar'
  className?: string
}

export default function ThemeToggle({ variant = 'header', className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()

  function toggle() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggle}
        className={cn(
          'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
          'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
          'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 cursor-pointer group',
          className
        )}
        aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
          {resolvedTheme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </div>
        <span>{resolvedTheme === 'dark' ? 'Mode Lumineux' : 'Mode Nuit'}</span>
      </button>
    )
  }

  // Header variant
  return (
    <button
      onClick={toggle}
      className={cn(
        'relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 cursor-pointer select-none',
        resolvedTheme === 'dark'
          ? 'bg-[#0B1326]/80 text-amber-300 border border-white/10 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10'
          : 'bg-white/80 text-slate-700 border border-slate-200 hover:border-blue-400 hover:shadow-md hover:text-blue-600',
        className
      )}
      aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  )
}
