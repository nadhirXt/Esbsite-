'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap, Upload, Link2, LayoutDashboard, Shield, Menu, X, Users, BookOpen, Newspaper, Calendar, Compass
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV = [
  { href: '/admin',            label: 'Vue d\'ensemble',   icon: LayoutDashboard },
  { href: '/admin/concours',   label: 'Gestion Concours',  icon: Compass },
  { href: '/admin/documents',  label: 'Gérer les documents', icon: Upload },
  { href: '/admin/actualites', label: 'Actualités',         icon: Newspaper },
  { href: '/admin/calendrier', label: 'Calendrier',         icon: Calendar },
  { href: '/admin/users',      label: 'Gestion des Membres', icon: Shield },
  { href: '/admin/etudiants',  label: 'Annuaire Étudiants', icon: Users },
  { href: '/admin/memoires',   label: 'Mémoires',          icon: BookOpen },
  { href: '/admin/liens',      label: 'Liens utiles',      icon: Link2 },
]

interface AdminSidebarProps {
  user: {
    fullName?: string
  }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white dark:bg-[#020617] text-slate-900 dark:text-white shrink-0 shadow-md border-b border-slate-200 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm">
          <GraduationCap className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="font-black text-slate-900 dark:text-white">ESB</span> <span className="text-sky-400 font-bold">Admin</span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
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
        "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 md:w-64 min-h-screen bg-white dark:bg-[#040814] text-slate-900 dark:text-white shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none border-r border-slate-200 dark:border-white/10",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Laser line edge */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-amber-500/40 via-transparent to-cyan-500/30 hidden md:block" />

        {/* Logo (Desktop) */}
        <div className="hidden md:flex px-6 py-5 border-b border-slate-200 dark:border-white/10 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <GraduationCap className="w-6 h-6 text-amber-500 shrink-0 transition-transform group-hover:-rotate-6" />
            <div className="flex items-center">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">ESB</span>
              <span className="font-bold text-lg text-sky-400 ml-1">Admin</span>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.3)] border border-amber-400/40 text-slate-950 font-black">
              <Shield className="w-4 h-4 text-slate-950" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#040814]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.fullName || 'Administrateur'}</p>
              <span className="inline-block text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 uppercase tracking-wider mt-0.5">
                ROOT PRIVILEGES
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto cyber-scrollbar">
          <div className="flex items-center gap-1.5 px-3 mb-2 mt-1">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Navigation Console
            </p>
          </div>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group',
                  active 
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-mono' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-amber-400" : "text-slate-400 group-hover:text-amber-400")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          
          <div className="pt-3 mt-4 border-t border-slate-200 dark:border-white/10 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Retour Espace Étudiant</span>
            </Link>
            <ThemeToggle variant="sidebar" />
          </div>
        </nav>
      </aside>
    </>
  )
}
