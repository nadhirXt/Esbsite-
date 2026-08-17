import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses = {
  primary:
    'bg-[#0F172A] text-white hover:bg-[#1E3A8A] focus-visible:ring-[#1E3A8A] dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-200',
  secondary:
    'bg-[#1E3A8A] text-white hover:bg-[#1e40af] focus-visible:ring-[#1E3A8A]',
  outline:
    'border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#1E3A8A] dark:border-slate-700 dark:bg-[#111827] dark:text-white dark:hover:bg-[#1E293B] dark:hover:border-blue-500',
  ghost:
    'bg-transparent text-[#0F172A] hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-white/10',
  destructive:
    'bg-[#DC2626] text-white hover:bg-[#b91c1c]',
  glass:
    'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 focus-visible:ring-white/30',
}

const sizeClasses = {
  sm:  'h-8  px-3  text-sm  gap-1.5',
  md:  'h-10 px-4  text-sm  gap-2',
  lg:  'h-12 px-6  text-base gap-2',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-all duration-200 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:-translate-y-0.5 active:translate-y-0',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
