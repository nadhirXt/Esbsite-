'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, Menu, X, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useTheme } from '@/components/ui/ThemeProvider'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '#presentation', label: 'L\'ESB' },
  { href: '#formations',   label: 'Formations' },
  { href: '#chiffres',     label: 'Chiffres clés' },
  { href: '#apropos',      label: 'À propos' },
  { href: '#contact',      label: 'Contact' },
]

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    
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
      subscription.unsubscribe()
    }
  }, [])

  const isScrolledOrDark = scrolled || resolvedTheme === 'dark'

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md shadow-sm border-b border-[#E2E8F0] dark:border-white/10'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 font-bold text-lg tracking-tight transition-colors',
            isScrolledOrDark ? 'text-[#0F172A] dark:text-white' : 'text-white'
          )}
        >
          <GraduationCap className="w-6 h-6 text-[#A16207]" />
          <span>ESB</span>
          <span className={cn('font-light', isScrolledOrDark ? 'text-[#1E3A8A] dark:text-blue-400' : 'text-blue-200')}>
            Hub
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-[#A16207]',
                isScrolledOrDark ? 'text-[#64748B] dark:text-slate-400' : 'text-blue-100'
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle
            variant="header"
            className={cn(
              !scrolled && resolvedTheme !== 'dark' && 'bg-white/10 text-white hover:bg-white/20'
            )}
          />
          {user ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" className="bg-[#A16207] hover:bg-[#854d0e] flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Mon Espace
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isScrolledOrDark ? 'text-[#0F172A] dark:text-white hover:text-[#1E3A8A] dark:hover:text-blue-400' : 'text-white hover:text-blue-200'
                )}
              >
                Connexion
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="sm" className="bg-[#A16207] hover:bg-[#854d0e]">
                  S'inscrire
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle
            variant="header"
            className={cn(
              !scrolled && resolvedTheme !== 'dark' && 'bg-white/10 text-white hover:bg-white/20'
            )}
          />
          <button
            className={cn(
              'p-2 rounded-lg',
              isScrolledOrDark ? 'text-[#0F172A] dark:text-white' : 'text-white'
            )}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-[#111827] border-t border-[#E2E8F0] dark:border-white/10 px-6 py-4 space-y-3 animate-fade-in">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white py-1"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#E2E8F0] dark:border-white/10 flex flex-col gap-2">
            {user ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full bg-[#A16207] hover:bg-[#854d0e] flex items-center justify-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Mon Espace
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#0F172A] dark:text-white">
                  Connexion
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-[#A16207] hover:bg-[#854d0e]">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
