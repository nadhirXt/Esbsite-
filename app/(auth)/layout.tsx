import Link from 'next/link'
import { ArrowLeft, GraduationCap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col relative overflow-hidden text-slate-100">
      {/* Background Cyber Grid & Glow Orbs */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top brand bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
        >
          <GraduationCap className="w-6 h-6 text-amber-500 shrink-0 transition-transform group-hover:-rotate-6" />
          <div className="flex items-center">
            <span className="font-black text-xl text-white tracking-tight">ESB</span>
            <span className="font-bold text-xl text-sky-400 ml-1">Hub</span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 px-3.5 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/15 shadow-[0_0_10px_rgba(56,189,248,0.1)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au site</span>
        </Link>
      </header>

      {/* Auth card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500 font-mono border-t border-white/5">
        <span>© {new Date().getFullYear()} École Supérieure de Banque · Direction Générale de la Banque d&apos;Algérie · Système Sécurisé</span>
      </footer>
    </div>
  )
}

