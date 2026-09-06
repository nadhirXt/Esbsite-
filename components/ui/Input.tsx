import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10.5 w-full rounded-xl border px-3.5 text-sm text-slate-900 dark:text-white',
            'bg-white/90 dark:bg-[#0B1326]/70 backdrop-blur-md',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'transition-all duration-200 shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:focus:ring-cyan-400/40 focus:border-sky-500 dark:focus:border-cyan-400',
            error
              ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500'
              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export default Input
