import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] flex flex-col">
      {/* Top brand bar */}
      <header className="px-6 py-5 flex items-center justify-between">
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
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} École Supérieure de Banque · Tous droits réservés
      </footer>
    </div>
  )
}
