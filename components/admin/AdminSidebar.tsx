'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap, Upload, Link2, LayoutDashboard, Shield, Menu, X, Users, BookOpen, Newspaper, Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV = [
  { href: '/admin',            label: 'Vue d\'ensemble',   icon: LayoutDashboard },
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
          <GraduationCap className="w-5 h-5 text-blue-600 dark:text-[#A16207]" />
          ESB <span className="text-blue-600 dark:text-blue-300 font-light">Admin</span>
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
        "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 md:w-64 min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-white shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none border-r border-slate-200 dark:border-white/10",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo (Desktop) */}
        <div className="hidden md:flex px-6 py-5 border-b border-slate-200 dark:border-white/10">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-[#A16207]" />
            ESB <span className="text-blue-600 dark:text-blue-300 font-light">Admin</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-amber-700 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600 dark:text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate w-40">{user.fullName || 'Administrateur'}</p>
              <p className="text-xs text-blue-600 dark:text-yellow-400 font-medium">Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  active 
                    ? 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-white font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-blue-600 dark:text-white" : "group-hover:text-blue-500 dark:group-hover:text-white")} />
                {item.label}
              </Link>
            )
          })}
          
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/10 space-y-0.5">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-150"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Retour au Portail étudiant
            </Link>
            <ThemeToggle variant="sidebar" />
          </div>
        </nav>
      </aside>
    </>
  )
}
