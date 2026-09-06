'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, BookOpen, FileText, Link2,
  LogOut, ChevronRight, Settings, Shield, Menu, X, ArrowLeft, Users, Lock, Heart, BarChart2,
  Calendar, Megaphone, Calculator, Building2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, CYCLES } from '@/lib/utils'
import { getUserBadges } from '@/lib/badges'
import BadgeList from '@/components/ui/BadgeList'
import ThemeToggle from '@/components/ui/ThemeToggle'
import GlobalSearch from '@/components/dashboard/GlobalSearch'
import NotificationBell from '@/components/dashboard/NotificationBell'
import { motion } from 'framer-motion'

const NAV_GROUPS = [
  {
    title: 'Espace Général',
    items: [
      { href: '/dashboard',              label: 'Tableau de bord',     icon: LayoutDashboard },
      { href: '/dashboard/calculateur',  label: 'Calculateur & Notes',  icon: Calculator },
      { href: '/dashboard/calendrier',   label: 'Calendrier Examens',  icon: Calendar },
      { href: '/dashboard/actualites',   label: 'Actualités ESB',      icon: Megaphone },
    ]
  },
  {
    title: 'Cycles de Formation',
    items: [
      { href: '/dashboard/licence',      label: 'Licence Bancaire',    icon: BookOpen },
      { href: '/dashboard/dseb',         label: 'DSEB (4 ans)',        icon: BookOpen },
      { href: '/dashboard/master',       label: 'Master Monnaie & B.', icon: BookOpen },
      { href: '/dashboard/memoires',     label: 'Mémoires & PFE',      icon: Lock },
    ]
  },
  {
    title: 'Fonds Documentaire',
    items: [
      { href: '/dashboard/bibliotheque', label: 'Bibliothèque',        icon: FileText },
      { href: '/dashboard/ressources',   label: 'Ressources & Guides', icon: Link2 },
      { href: '/dashboard/favoris',      label: 'Documents Favoris',   icon: Heart },
    ]
  },
  {
    title: 'Communauté',
    items: [
      { href: '/dashboard/annuaire',     label: 'Annuaire Communauté', icon: Users },
      { href: '/dashboard/analytics',    label: 'Statistiques',        icon: BarChart2 },
      { href: '/dashboard/profile',      label: 'Mon Profil',          icon: Settings },
    ]
  }
]

interface SidebarProps {
  user: {
    email: string
    fullName?: string
    cycle?: string
    role?: string
    is_delegate?: boolean
    user_type?: string
    created_at?: string
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
  const badges = getUserBadges({
    role: user.role,
    user_type: user.user_type,
    cycle: user.cycle,
    is_delegate: user.is_delegate,
    created_at: user.created_at,
  })

  const sidebarVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white/95 dark:bg-[#070D19]/95 backdrop-blur-xl text-slate-900 dark:text-white shrink-0 shadow-sm border-b border-slate-200 dark:border-white/10 relative z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-1.5 -ml-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Ouvrir menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <GraduationCap className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-base font-black tracking-tight">ESB <span className="text-sky-400 font-bold">Hub</span></span>
          </Link>
        </div>
        <NotificationBell userCycle={user.cycle} userRole={user.role} />
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className={cn(
        "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 md:w-64 h-full bg-white dark:bg-[#040814] text-slate-900 dark:text-white shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none border-r border-slate-200 dark:border-white/10 relative",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Subtle laser line right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-cyan-500/40 via-transparent to-amber-500/30 hidden md:block" />

        {/* Logo (Desktop) */}
        <div className="hidden md:flex items-center justify-between px-5 py-5 border-b border-slate-200 dark:border-white/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <GraduationCap className="w-6 h-6 text-amber-500 shrink-0 transition-transform group-hover:-rotate-6" />
            <div className="flex items-center">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">ESB</span>
              <span className="font-bold text-lg text-sky-400 ml-1">Hub</span>
            </div>
          </Link>
          <NotificationBell userCycle={user.cycle} userRole={user.role} />
        </div>

        {/* User profile card */}
        <div className="px-3.5 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <Link 
            href="/dashboard/profile" 
            onClick={() => setIsOpen(false)} 
            className="block p-3 rounded-2xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.3)] border border-cyan-400/40 text-white font-black text-xs font-mono">
                {(user.fullName || user.email).charAt(0).toUpperCase()}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#040814]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition-colors">
                  {user.fullName || 'Étudiant(e)'}
                </p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            {cycleBadge && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className={cn(
                  'inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider',
                  cycleBadge.color
                )}>
                  {cycleBadge.label}
                </span>
                {user.is_delegate && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    Délégué
                  </span>
                )}
              </div>
            )}
            {badges.length > 0 && (
              <BadgeList badges={badges} compact className="mt-2" />
            )}
          </Link>
        </div>

        {/* Global Search input */}
        <div className="px-3.5 py-3 border-b border-slate-200 dark:border-white/10">
          <GlobalSearch />
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto cyber-scrollbar">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="flex items-center gap-1.5 px-3 mb-1.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {group.title}
                </p>
              </div>
              {group.items.map((item) => {
                if (item.href === '/dashboard/memoires') {
                  if (user.role !== 'admin' && user.user_type !== 'etudiant_esb' && user.user_type !== 'ancien_etudiant_esb') {
                    return null
                  }
                }
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group',
                      active
                        ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-400 dark:text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors", 
                        active ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                      )} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Admin link */}
          {user.role === 'admin' && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1">
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">Administration</p>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150',
                  pathname.startsWith('/admin')
                    ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-transparent'
                )}
              >
                <Shield className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="font-mono">Console Admin</span>
              </Link>
            </div>
          )}

          {/* Delegate link */}
          {user.role !== 'admin' && user.is_delegate && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1">
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">Coordination</p>
              <Link
                href="/dashboard/delegate"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150',
                  pathname.startsWith('/dashboard/delegate')
                    ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-transparent'
                )}
              >
                <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-mono">Espace Délégué</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer: Theme toggle, Back to site & Logout */}
        <div className="px-3 py-3 border-t border-slate-200 dark:border-white/10 space-y-1 bg-slate-50/50 dark:bg-white/2">
          <ThemeToggle variant="sidebar" />
          <Link
            href="/"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Site Public ESB</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}

