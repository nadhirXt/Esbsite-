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
          'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
          'text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer',
          className
        )}
        aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4 shrink-0" />
        ) : (
          <Moon className="w-4 h-4 shrink-0" />
        )}
        {resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      </button>
    )
  }

  // Header variant
  return (
    <button
      onClick={toggle}
      className={cn(
        'theme-toggle',
        resolvedTheme === 'dark'
          ? 'bg-white/10 text-yellow-300 hover:bg-white/20'
          : 'bg-black/5 text-slate-600 hover:bg-black/10',
        className
      )}
      aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  )
}
