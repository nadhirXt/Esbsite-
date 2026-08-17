'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, BookOpen, FileText, Link2,
  LogOut, ChevronRight, Settings, Shield, Menu, X, ArrowLeft, Users, Lock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, CYCLES } from '@/lib/utils'
import { getUserBadges } from '@/lib/badges'
import BadgeList from '@/components/ui/BadgeList'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/licence',  label: 'Licence',         icon: BookOpen },
  { href: '/dashboard/dseb',     label: 'DSEB',            icon: BookOpen },
  { href: '/dashboard/master',   label: 'Master',          icon: BookOpen },
  { href: '/dashboard/memoires', label: 'Mémoires (Confidentiel)', icon: Lock },
  { href: '/dashboard/bibliotheque', label: 'Bibliothèque', icon: FileText },
  { href: '/dashboard/ressources', label: 'Ressources',    icon: Link2 },
  { href: '/dashboard/annuaire',   label: 'Réseau / Annuaire', icon: Users },
  { href: '/dashboard/profile',    label: 'Mon Profil',      icon: Settings },
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
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl text-slate-900 dark:text-white shrink-0 shadow-md relative z-50">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <GraduationCap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <span className="text-base">ESB <span className="text-blue-600 dark:text-blue-300 font-light">Hub</span></span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className={cn(
        "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 md:w-64 h-full bg-white/80 dark:bg-[#020617]/80 backdrop-blur-2xl text-slate-900 dark:text-white shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-r border-slate-200 dark:border-white/10",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo (Desktop) */}
        <motion.div variants={itemVariants} className="hidden md:flex px-6 py-6 border-b border-slate-200 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2 font-bold group">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-500/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-500/30 transition-colors">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
          </div>
          <span className="text-lg tracking-tight">ESB <span className="text-blue-600 dark:text-blue-300 font-light">Hub</span></span>
        </Link>
      </motion.div>

      {/* User info */}
      <motion.div variants={itemVariants}>
        <Link href="/dashboard/profile" onClick={() => setIsOpen(false)} className="block px-5 py-5 border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-sm font-bold text-white">
                {(user.fullName || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user.fullName || 'Étudiant'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
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
          {/* User Badges */}
          {badges.length > 0 && (
            <BadgeList badges={badges} compact className="mt-2" />
          )}
        </Link>
      </motion.div>

      {/* Navigation */}
      <motion.nav variants={itemVariants} className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.href === '/dashboard/memoires') {
            if (user.role !== 'admin' && user.user_type !== 'etudiant_esb' && user.user_type !== 'ancien_etudiant_esb') {
              return null;
            }
          }
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                active
                  ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-blue-600 dark:text-blue-400" : "group-hover:text-blue-500 dark:group-hover:text-blue-300")} />
                {item.label}
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          )
        })}

        {/* Admin link */}
        {user.role === 'admin' && (
          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-white/5">
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                pathname.startsWith('/admin')
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold shadow-[inset_0_0_0_1px_rgba(251,191,36,0.3)]'
                  : 'text-slate-600 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              )}
            >
              <Shield className={cn("w-4 h-4 shrink-0 transition-colors", pathname.startsWith('/admin') ? "text-amber-600 dark:text-amber-400" : "group-hover:text-amber-500 dark:group-hover:text-amber-300")} />
              Administration
            </Link>
          </div>
        )}

        {/* Delegate link */}
        {user.role !== 'admin' && user.is_delegate && (
          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-white/5">
            <Link
              href="/dashboard/delegate"
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                pathname.startsWith('/dashboard/delegate')
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold shadow-[inset_0_0_0_1px_rgba(52,211,153,0.3)]'
                  : 'text-slate-600 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              )}
            >
              <Shield className={cn("w-4 h-4 shrink-0 transition-colors", pathname.startsWith('/dashboard/delegate') ? "text-emerald-600 dark:text-emerald-400" : "group-hover:text-emerald-500 dark:group-hover:text-emerald-300")} />
              Espace Délégué
            </Link>
          </div>
        )}
      </motion.nav>

      {/* Return Home, Theme Toggle & Logout */}
      <motion.div variants={itemVariants} className="px-3 py-4 border-t border-slate-200 dark:border-white/10 space-y-2">
        <ThemeToggle variant="sidebar" />
        <Link
          href="/"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Retour à l'accueil
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Se déconnecter
        </button>
      </motion.div>
    </motion.aside>
    </>
  )
}
