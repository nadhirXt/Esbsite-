'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Search, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  cycle?: string | null
}

export default function BottomNav({ cycle }: BottomNavProps) {
  const pathname = usePathname()
  const userCyclePath = cycle ? `/dashboard/${cycle}` : '/dashboard/licence'

  const navItems = [
    {
      label: 'Accueil',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Mes Cours',
      href: userCyclePath,
      icon: BookOpen,
      isActive: pathname.startsWith('/dashboard/licence') || 
                pathname.startsWith('/dashboard/dseb') || 
                pathname.startsWith('/dashboard/master'),
    },
    {
      label: 'Recherche',
      href: '#search',
      icon: Search,
      isAction: true,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
      },
    },
    {
      label: 'Examens',
      href: '/dashboard/calendrier',
      icon: Calendar,
      isActive: pathname === '/dashboard/calendrier',
    },
    {
      label: 'Profil',
      href: '/dashboard/profile',
      icon: User,
      isActive: pathname === '/dashboard/profile',
    },
  ]

  return (
    <nav 
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.isActive

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center py-1 px-3 text-slate-500 dark:text-slate-400 hover:text-[#1E3A8A] dark:hover:text-amber-400 transition-colors cursor-pointer group"
              >
                <div className="p-1 rounded-xl group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
                  <Icon className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 transition-colors rounded-xl",
                isActive
                  ? "text-[#1E3A8A] dark:text-amber-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all",
                isActive && "bg-blue-50 dark:bg-amber-400/10"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
