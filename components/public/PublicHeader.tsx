'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Building2, GraduationCap, BookOpen, Award, 
  Menu, X, User as UserIcon, 
  ChevronRight, Compass, MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Logo } from '@/components/ui/Logo'
import { useTheme } from '@/components/ui/ThemeProvider'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '#presentation', label: "L'Institution",     icon: Building2,    id: 'presentation' },
  { href: '#formations',   label: 'Formations',         icon: GraduationCap, id: 'formations' },
  { href: '#concours',     label: 'Concours',           icon: Compass,       id: 'concours' },
  { href: '#bibliotheque', label: 'Bibliothèque',       icon: BookOpen,      id: 'bibliotheque' },
  { href: '#feedbacks',   label: 'Alumni & Avis',       icon: Award,         id: 'feedbacks' },
]


export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('presentation')
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    
    // Active section tracking via IntersectionObserver
    const sectionIds = NAV_LINKS.map(l => l.id)
    const observers: IntersectionObserver[] = []
    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    
    // Check Auth State
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      observers.forEach(o => o.disconnect())
      subscription.unsubscribe()
    }
  }, [])

  // Verrouillage du scroll en arrière-plan quand le menu mobile est ouvert
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isScrolledOrDark = scrolled || resolvedTheme === 'dark'


  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
      {/* ── TOP INSTITUTIONAL BAR (TELEMETRY) ─────────── */}
      <div 
        className={cn(
          "hidden sm:block w-full text-[11px] font-medium transition-all duration-300 border-b overflow-hidden",
          scrolled 
            ? "max-h-0 opacity-0 py-0 border-transparent pointer-events-none" 
            : "max-h-10 opacity-100 py-1.5 bg-[#030712]/95 text-slate-300 border-white/10 backdrop-blur-xl"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white tracking-wide">Direction Générale de la Banque d&apos;Algérie</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-300">École Supérieure de Banque (Fondée en 1995)</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Session 2026–2027
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-sky-400" />
              Bouzaréah, Alger
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR DOCK ─────────────────────────── */}
      <div
        className={cn(
          'transition-all duration-300 border-b',
          scrolled
            ? 'bg-white/90 dark:bg-[#030712]/90 backdrop-blur-2xl shadow-xl shadow-cyan-950/5 border-slate-200/80 dark:border-white/10'
            : 'bg-[#070D19]/80 dark:bg-[#030712]/80 backdrop-blur-xl border-white/10'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Logo 
            esbTextClassName={cn(
              'transition-colors',
              isScrolledOrDark ? 'text-slate-950 dark:text-white' : 'text-white'
            )}
          />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 backdrop-blur-md">
            {NAV_LINKS.map((l) => {
              const Icon = l.icon
              const isActive = activeSection === l.id
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group select-none',
                    isScrolledOrDark
                      ? isActive
                        ? 'text-blue-600 dark:text-cyan-300 bg-white dark:bg-white/10 shadow-sm border border-slate-200/50 dark:border-white/10'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-white/50 dark:hover:bg-white/5'
                      : isActive
                        ? 'text-amber-300 bg-white/10 shadow-sm border border-white/10'
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                  <span>{l.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-cyan-400 dark:bg-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  )}
                </a>
              )
            })}
          </nav>

          {/* Actions & Portal Access */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle
              variant="header"
              className={cn(
                !scrolled && resolvedTheme !== 'dark' && 'bg-white/10 text-white hover:bg-white/20 border-white/20'
              )}
            />

            {user ? (
              <Link href="/dashboard">
                <Button 
                  size="sm" 
                  variant="cyber-amber"
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Mon Espace Étudiant</span>
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={cn(
                    'text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200',
                    isScrolledOrDark 
                      ? 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-white/5' 
                      : 'text-white hover:bg-white/10'
                  )}
                >
                  Connexion
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm" 
                    variant="cyber-amber"
                    className="flex items-center gap-1.5 px-4.5 py-2 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <span>Portail Numérique</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle
              variant="header"
              className={cn(
                !scrolled && resolvedTheme !== 'dark' && 'bg-white/10 text-white hover:bg-white/20'
              )}
            />
            <button
              className={cn(
                'p-2 rounded-xl border transition-colors cursor-pointer',
                isScrolledOrDark 
                  ? 'text-slate-800 dark:text-white border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5' 
                  : 'text-white border-white/20 bg-white/10'
              )}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Ouvrir le menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU DRAWER ──────────────────────── */}
      {menuOpen && (
        <div className="lg:hidden bg-white/98 dark:bg-[#070D19]/98 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-6 py-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="pb-3 border-b border-slate-100 dark:border-white/10">
            <p className="text-xs font-semibold text-[#A16207] dark:text-amber-400 uppercase tracking-wider">
              Navigation Académique
            </p>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {NAV_LINKS.map((l) => {
              const Icon = l.icon
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#A16207] dark:text-amber-400" />
                  <span>{l.label}</span>
                </a>
              )
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2.5">
            {user ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full bg-[#A16207] hover:bg-[#854d0e] flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm">
                  <UserIcon className="w-4 h-4" />
                  <span>Mon Espace Étudiant</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-[#A16207] hover:bg-[#854d0e] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-amber-900/20">
                    Rejoindre l&apos;ESB Hub
                  </Button>
                </Link>
                <Link 
                  href="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Connexion au Portail
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

