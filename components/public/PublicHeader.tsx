'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E2E8F0]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 font-bold text-lg tracking-tight transition-colors',
            scrolled ? 'text-[#0F172A]' : 'text-white'
          )}
        >
          <GraduationCap className="w-6 h-6 text-[#A16207]" />
          <span>ESB</span>
          <span className={cn('font-light', scrolled ? 'text-[#1E3A8A]' : 'text-blue-200')}>
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
                scrolled ? 'text-[#64748B]' : 'text-blue-100'
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              'text-sm font-medium transition-colors',
              scrolled ? 'text-[#0F172A] hover:text-[#1E3A8A]' : 'text-white hover:text-blue-200'
            )}
          >
            Connexion
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="sm" className="bg-[#A16207] hover:bg-[#854d0e]">
              Espace Étudiant
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            'md:hidden p-2 rounded-lg',
            scrolled ? 'text-[#0F172A]' : 'text-white'
          )}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#E2E8F0] px-6 py-4 space-y-3 animate-fade-in">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-[#64748B] hover:text-[#0F172A] py-1"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
            <Link href="/login" className="block text-sm font-medium text-[#0F172A]">
              Connexion
            </Link>
            <Link href="/register">
              <Button size="sm" className="w-full bg-[#A16207] hover:bg-[#854d0e]">
                Espace Étudiant
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
