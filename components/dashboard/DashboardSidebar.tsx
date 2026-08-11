'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, BookOpen, FileText, Link2,
  LogOut, ChevronRight, Settings, Shield, Menu, X, ArrowLeft
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, CYCLES } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/licence',  label: 'Licence',         icon: BookOpen },
  { href: '/dashboard/dseb',     label: 'DSEB',            icon: BookOpen },
  { href: '/dashboard/master',   label: 'Master',          icon: BookOpen },
  { href: '/dashboard/ressources', label: 'Ressources',    icon: Link2 },
  { href: '/dashboard/profile',    label: 'Mon Profil',      icon: Settings },
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
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const cycleBadge = user.cycle ? CYCLES[user.cycle as keyof typeof CYCLES] : null

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-[#0F172A] text-white shrink-0 shadow-md">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <GraduationCap className="w-5 h-5 text-[#A16207]" />
          <span className="text-base">ESB <span className="text-blue-300 font-light">Hub</span></span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 md:w-64 min-h-screen bg-[#0F172A] text-white shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo (Desktop) */}
        <div className="hidden md:flex px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <GraduationCap className="w-5 h-5 text-[#A16207]" />
          <span className="text-sm">ESB <span className="text-blue-300 font-light">Hub</span></span>
        </Link>
      </div>

      {/* User info */}
      <Link href="/dashboard/profile" onClick={() => setIsOpen(false)} className="block px-5 py-5 border-b border-white/10 hover:bg-white/5 transition-colors duration-200 cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-sm font-bold text-white">
              {(user.fullName || user.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
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
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
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
            onClick={() => setIsOpen(false)}
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

      {/* Return Home & Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Retour à l'accueil
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
    </>
  )
}
