import Link from 'next/link'
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <GraduationCap className="w-6 h-6 text-[#A16207]" />
              <span>ESB</span>
              <span className="font-light text-blue-300">Hub</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              L&apos;École Supérieure de Banque est une Direction Générale de la Banque d&apos;Algérie, créée en janvier 1995 en vue de former des cadres dans les domaines de la banque. Le siège de l&apos;École se trouve sur les hauteurs d&apos;Alger, à Bouzaréah, à proximité de la forêt de Baïnem. L&apos;École est dotée d&apos;infrastructures modernes situées dans un site verdoyant et calme, propice aux études et à la réflexion.
            </p>
            <div className="mt-6 space-y-3">
              <p className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-[#A16207] shrink-0 mt-0.5" />
                <span>BP 156, Route de Baïnem,<br />Bouzaréah (Alger)</span>
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-[#A16207] shrink-0" />
                +213 23 23 67 62 / +213 23 23 67 59
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-[#A16207] shrink-0" />
                defesb@bank-of-algeria.dz
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">
              Formations
            </h3>
            <ul className="space-y-2.5">
              {['Licence Bancaire', 'DSEB (4 ans)', 'Master'].map((f) => (
                <li key={f}>
                  <a href="#formations" className="text-sm text-slate-400 hover:text-[#A16207] transition-colors">
                    {f}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">
              Portail
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/login" className="text-sm text-slate-400 hover:text-[#A16207] transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-slate-400 hover:text-[#A16207] transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/reset-password" className="text-sm text-slate-400 hover:text-[#A16207] transition-colors">
                  Mot de passe oublié
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} École Supérieure de Banque · Tous droits réservés
          </p>

        </div>
      </div>
    </footer>
  )
}
