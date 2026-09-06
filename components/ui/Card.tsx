import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'cyber' | 'hud'
  hoverable?: boolean
}

export function Card({ children, className, variant = 'default', hoverable = false }: CardProps) {
  const variantStyles = {
    default: 'rounded-2xl border border-slate-200/90 bg-white dark:bg-[#070D19] dark:border-white/10 shadow-sm',
    glass: 'rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#070D19]/70 backdrop-blur-xl shadow-lg',
    cyber: 'rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-gradient-to-b dark:from-[#0B1326] dark:to-[#070D19] shadow-md relative overflow-hidden',
    hud: 'rounded-2xl border border-cyan-500/20 bg-white dark:bg-[#060B17] shadow-xl relative overflow-hidden',
  }

  return (
    <div
      className={cn(
        variantStyles[variant],
        hoverable && 'transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl dark:hover:border-cyan-500/30 dark:hover:shadow-cyan-500/10',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-5 border-b border-slate-100 dark:border-white/10', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>
}
