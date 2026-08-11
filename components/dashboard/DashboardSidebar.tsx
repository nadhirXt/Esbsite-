'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, BookOpen, FileText, Link2,
  LogOut, ChevronRight, Settings, Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, CYCLES } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/licence',  label: 'Licence',         icon: BookOpen },
  { href: '/dashboard/dseb',     label: 'DSEB',            icon: BookOpen },
  { href: '/dashboard/master',   label: 'Master',          icon: BookOpen },
  { href: '/dashboard/ressources', label: 'Ressources',    icon: Link2 },
]

interface SidebarProps {
  user: {
    email: string
    fullName?: string
    cycle?: string
    role?: string
  }
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const cycleBadge = user.cycle ? CYCLES[user.cycle as keyof typeof CYCLES] : null

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#0F172A] text-white shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <GraduationCap className="w-5 h-5 text-[#A16207]" />
          <span className="text-sm">ESB <span className="text-blue-300 font-light">antigravité</span></span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">
              {(user.fullName || user.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.fullName || 'Étudiant'}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        {cycleBadge && (
          <div className={cn(
            'mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
            cycleBadge.color
          )}>
            {cycleBadge.label}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-[#1E3A8A] text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          )
        })}

        {/* Admin link */}
        {user.role === 'admin' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
              pathname.startsWith('/admin')
                ? 'bg-amber-900/30 text-[#FCD34D] font-medium'
                : 'text-slate-500 hover:text-[#FCD34D] hover:bg-amber-900/20'
            )}
          >
            <Shield className="w-4 h-4 shrink-0" />
            Administration
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
