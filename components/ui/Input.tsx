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
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#0F172A]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border bg-white px-3 text-sm text-[#020617]',
            'placeholder:text-[#94A3B8]',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent',
            error
              ? 'border-[#DC2626] focus:ring-[#DC2626]'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1]',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#64748B]">{hint}</p>}
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export default Input
