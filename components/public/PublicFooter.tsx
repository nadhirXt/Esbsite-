import Link from 'next/link'
import { GraduationCap, Mail, Phone, MapPin, ArrowRight, ExternalLink } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-[#0F172A] dark:bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg mb-4 group">
              <div className="p-1.5 bg-[#A16207]/20 rounded-lg group-hover:bg-[#A16207]/30 transition-colors">
                <GraduationCap className="w-6 h-6 text-[#A16207]" />
              </div>
              <span>ESB</span>
              <span className="font-light text-blue-300">Hub</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              L&apos;École Supérieure de Banque est une Direction Générale de la Banque d&apos;Algérie, créée en janvier 1995 en vue de former des cadres dans les domaines de la banque. Le siège de l&apos;École se trouve sur les hauteurs d&apos;Alger, à Bouzaréah, à proximité de la forêt de Baïnem.
            </p>
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <a href="https://maps.google.com/?q=Bouzareah+Alger+ESB" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-slate-400 hover:text-[#A16207] transition-colors group cursor-pointer">
                <MapPin className="w-4 h-4 text-[#A16207] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="flex items-center gap-1">BP 156, Route de Baïnem, Bouzaréah (Alger) <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
              </a>
              <a href="tel:+21323236762" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#A16207] transition-colors group">
                <Phone className="w-4 h-4 text-[#A16207] shrink-0 group-hover:scale-110 transition-transform" />
                +213 23 23 67 62 / +213 23 23 67 59
              </a>
              <a href="mailto:defesb@bank-of-algeria.dz" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#A16207] transition-colors group">
                <Mail className="w-4 h-4 text-[#A16207] shrink-0 group-hover:scale-110 transition-transform" />
                defesb@bank-of-algeria.dz
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-3 sm:mb-4 flex items-center gap-2">
              <span>📚</span> Formations
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {[
                { name: 'Licence Bancaire', icon: '🎓' },
                { name: 'DSEB (4 ans)', icon: '🏦' },
                { name: 'Master', icon: '📜' }
              ].map((f) => (
                <li key={f.name}>
                  <a href="#formations" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#A16207] transition-colors group">
                    <span>{f.icon}</span>
                    {f.name}
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-3 sm:mb-4 flex items-center gap-2">
              <span>🚀</span> Portail
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <Link href="/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#A16207] transition-colors group">
                  <span>🔑</span> Se connecter
                  <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/register" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#A16207] transition-colors group">
                  <span>✨</span> Créer un compte
                  <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/reset-password" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#A16207] transition-colors group">
                  <span>🔐</span> Mot de passe oublié
                </Link>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/mohamed-nadhir-benelhadj-833a32349/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#0A66C2] transition-colors group">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn du créateur
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-slate-800 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} École Supérieure de Banque · Tous droits réservés
          </p>
          <p className="text-xs text-slate-600">
            Créé avec ❤️ par Mohamed Nadhir Benelhadj
          </p>
        </div>
      </div>
    </footer>
  )
}
