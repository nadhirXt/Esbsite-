import Link from 'next/link'
import Image from 'next/image'
import { 
  Building2, GraduationCap, Mail, Phone, MapPin, 
  ArrowRight, ExternalLink, ShieldCheck, BookOpen, 
  Library, FileText
} from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-[#030712] border-t border-white/10 text-white relative overflow-hidden">
      {/* Decorative cyber laser line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-amber-500 opacity-80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-cyan-500/5 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* ── COL 1 & 2: BRAND & INSTITUTION ──────── */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <GraduationCap className="w-6 h-6 text-amber-500 shrink-0 transition-transform group-hover:-rotate-6" />
              <div className="flex items-center">
                <span className="font-black text-xl tracking-tight text-white">ESB</span>
                <span className="font-bold text-xl text-sky-400 ml-1">Hub</span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Établissement d&apos;enseignement supérieur bancaire rattaché à la Direction Générale de la Banque d&apos;Algérie. Depuis janvier 1995, l&apos;ESB prépare les cadres supérieurs, analystes financiers et dirigeants du secteur monétaire et bancaire national.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-slate-300">
              <a 
                href="https://maps.google.com/?q=Bouzareah+Alger+ESB" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-start gap-2.5 hover:text-[#A16207] transition-colors group cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#A16207] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="leading-snug">
                  BP 156, Route de Baïnem, Bouzaréah, Alger, Algérie
                </span>
              </a>

              <a 
                href="tel:+21323236762" 
                className="flex items-center gap-2.5 hover:text-[#A16207] transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#A16207] shrink-0 group-hover:scale-110 transition-transform" />
                <span>+213 (0) 23 23 67 62 / +213 (0) 23 23 67 59</span>
              </a>

              <a 
                href="mailto:defesb@bank-of-algeria.dz" 
                className="flex items-center gap-2.5 hover:text-[#A16207] transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#A16207] shrink-0 group-hover:scale-110 transition-transform" />
                <span>defesb@bank-of-algeria.dz</span>
              </a>
            </div>
          </div>

          {/* ── COL 3: FORMATIONS & CYCLES ──────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#A16207]" />
              Formations Diplômantes
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#formations" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A16207] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Licence Management & Banque</span>
                </a>
              </li>
              <li>
                <a href="#formations" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A16207] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>DSEB Études Bancaires (4 ans)</span>
                </a>
              </li>
              <li>
                <a href="#formations" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A16207] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Master Monnaie & Banque</span>
                </a>
              </li>
              <li>
                <a href="#presentation" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A16207] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Régime des Études & Stages</span>
                </a>
              </li>
            </ul>
          </div>

          {/* ── COL 4: BIBLIOTHÈQUE & PORTAIL ───────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Library className="w-4 h-4 text-[#1E3A8A]" />
              Espace Numérique
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A16207] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Connexion Espace Étudiant</span>
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A16207] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Inscription au Portail</span>
                </Link>
              </li>
              <li>
                <a href="#bibliotheque" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A16207] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Fonds Documentaire & Mémoires</span>
                </a>
              </li>
              <li>
                <Link href="/reset-password" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A16207] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Récupération mot de passe</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ── COL 5: INITIATIVE & RÉSEAU ──────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Garantie & Tutelle
            </h3>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-white">Banque d&apos;Algérie</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Formations certifiées répondant aux standards monétaires et financiers internationaux.
              </p>
            </div>
            <div>
              <a 
                href="https://www.linkedin.com/in/mohamed-nadhir-benelhadj-833a32349/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <span>Projet conçu par Mohamed Nadhir Benelhadj</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

        </div>

        {/* ── SUBFOOTER LEGAL ───────────────────────── */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} École Supérieure de Banque (ESB) · Direction Générale de la Banque d&apos;Algérie. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="#presentation" className="hover:text-white transition-colors">Mentions Légales</a>
            <span>•</span>
            <a href="#contact" className="hover:text-white transition-colors">Contact Institutionnel</a>
            <span>•</span>
            <a href="#apropos" className="hover:text-white transition-colors">À propos du portail</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

