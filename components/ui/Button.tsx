import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass' | 'cyber-glow' | 'cyber-amber' | 'cyber-outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses = {
  primary:
    'bg-[#0F172A] text-white hover:bg-[#1E3A8A] focus-visible:ring-[#38BDF8] dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-200 shadow-sm hover:shadow-md',
  secondary:
    'bg-[#1E3A8A] text-white hover:bg-[#1D4ED8] focus-visible:ring-[#38BDF8] shadow-sm hover:shadow-md',
  outline:
    'border border-slate-200 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md text-slate-900 dark:text-slate-100 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:border-white/10 focus-visible:ring-[#38BDF8]',
  ghost:
    'bg-transparent text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10',
  destructive:
    'bg-[#DC2626] text-white hover:bg-[#b91c1c] shadow-sm hover:shadow-red-500/20',
  glass:
    'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:border-white/30 focus-visible:ring-white/40 shadow-lg',
  'cyber-glow':
    'bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 text-white font-bold border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:border-cyan-300 focus-visible:ring-cyan-400',
  'cyber-amber':
    'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold border border-amber-300/40 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:border-amber-200 focus-visible:ring-amber-400',
  'cyber-outline':
    'border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/15 hover:border-cyan-400 focus-visible:ring-cyan-400 backdrop-blur-sm',
}

const sizeClasses = {
  sm:  'h-8.5 px-3.5 text-xs gap-1.5 rounded-lg',
  md:  'h-10 px-4.5 text-sm gap-2 rounded-xl',
  lg:  'h-12 px-6.5 text-sm sm:text-base gap-2.5 rounded-xl font-semibold',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none',
          'transition-all duration-200 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
