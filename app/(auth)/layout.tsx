import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] dark:from-[#020617] dark:via-[#0F172A] dark:to-[#020617] flex flex-col relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="gradient-orb gradient-orb-gold w-80 h-80 -top-40 -right-40 animate-glow" />
      <div className="gradient-orb gradient-orb-blue w-64 h-64 bottom-20 -left-32 animate-glow" style={{ animationDelay: '1.5s' }} />

      {/* Top brand bar */}
      <header className="relative px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-white font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <GraduationCap className="w-6 h-6 text-[#FCD34D]" />
          <span>ESB</span>
          <span className="text-[#FCD34D] font-light">Hub</span>
        </Link>
        <p className="text-sm text-blue-200 hidden sm:block">
          École Supérieure de Banque
        </p>
      </header>

      {/* Auth card */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-4 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} École Supérieure de Banque · Tous droits réservés
      </footer>
    </div>
  )
}
