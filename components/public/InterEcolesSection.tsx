'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import {
  GraduationCap, BookOpen, FileText, ArrowRight, ShieldCheck,
  Sparkles, Lock, Unlock, Eye, CheckCircle2, Download, Building2,
  ExternalLink, Search, School
} from 'lucide-react'

interface PreviewDoc {
  id: string
  title: string
  author: string
  schoolTag: string
  type: 'Mémoire' | 'Annales' | 'Étude de cas' | 'Rapport de stage'
  year: string
  pages: string
  tags: string[]
  downloads: string
  summary: string
}

const SAMPLE_PREVIEWS: PreviewDoc[] = [
  {
    id: '162c1c76-781b-4acf-a604-f3ec960ebc1e',
    title: 'PFE IKRAM VERSION FINALE',
    author: 'Ikram (Diplômée ESB)',
    schoolTag: 'Fonds Mémoires (Général)',
    type: 'Mémoire',
    year: '2024',
    pages: '78 pages',
    tags: ['PFE', 'Recherche Bancaire', 'Banque d\'Algérie'],
    downloads: '420+ consultations',
    summary: 'Mémoire de recherche et de fin d\'études réel soutenu à l\'École Supérieure de Banque, issu du fonds documentaire officiel de l\'ESB.'
  },
  {
    id: '1787752462137',
    title: 'Nadhir rapport caisse et portefeuille',
    author: 'Mohamed Nadhir Benelhadj',
    schoolTag: 'Rapport de stage en banque',
    type: 'Rapport de stage',
    year: '2024',
    pages: '34 pages',
    tags: ['Caisse', 'Portefeuille', 'Stage Agence'],
    downloads: '680+ consultations',
    summary: 'Rapport de stage d\'immersion professionnelle en agence bancaire axé sur les opérations courantes de caisse et la gestion des comptes et portefeuilles.'
  },
  {
    id: 'examens-s2-d27',
    title: 'Examens S2 D27 ( 1st year)',
    author: 'Direction Pédagogique ESB',
    schoolTag: '1ère Année DSEB',
    type: 'Annales',
    year: '2024',
    pages: '12 pages',
    tags: ['Examens S2', 'DSEB 27', 'Épreuves Officielles'],
    downloads: '1 250+ téléchargements',
    summary: 'Recueil officiel des épreuves d\'examens semestriels du Semestre 2 de la 27ème promotion DSEB couvrant l\'ensemble des modules du cycle.'
  },
  {
    id: 'comptabilite-audit-bancaires',
    title: 'Comptabilité et audit bancaires',
    author: 'Fonds Pédagogique ESB',
    schoolTag: '2. Deuxième année Licence/Comptabilité bancaire',
    type: 'Étude de cas',
    year: 'Fonds ESB',
    pages: '546 pages',
    tags: ['Comptabilité Bancaire', 'Audit', 'Normes Prudentielles'],
    downloads: '1 120+ consultations',
    summary: 'Ouvrage et support de référence complet sur les opérations comptables bancaires, le contrôle interne et les audits en milieu financier.'
  },
  {
    id: 'ratios-qui-comptent',
    title: 'Les ratios qui comptent',
    author: 'Fonds Analyse Financière ESB',
    schoolTag: '2 ème année DSEB/Module semestrielle S1/analyse financiere',
    type: 'Étude de cas',
    year: 'Fonds ESB',
    pages: '254 pages',
    tags: ['Analyse Financière', 'Ratios', 'Diagnostic'],
    downloads: '840+ consultations',
    summary: 'Manuel d\'analyse financière bilancielle détaillant les ratios déterminants de solvabilité, de liquidité et de rentabilité pour le diagnostic d\'entreprise.'
  }
]

const PARTNER_INSTITUTIONS = [
  { name: 'HEC Alger', city: 'Kolea' },
  { name: 'IHEC Alger', city: 'Alger' },
  { name: 'ENSSEA', city: 'Kolea' },
  { name: 'EHEC', city: 'Alger' },
  { name: 'Faculté des Sciences Éco (Alger 3)', city: 'Dely Ibrahim' },
  { name: 'ESC Alger', city: 'Kolea' },
  { name: 'Universités de Constantine, Oran & Sétif', city: 'National' }
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
}

export default function InterEcolesSection() {
  const [selectedDoc, setSelectedDoc] = useState<PreviewDoc | null>(SAMPLE_PREVIEWS[0])

  return (
    <section 
      id="inter-ecoles"
      className="relative py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#070D19] dark:via-[#0A1122] dark:to-[#070D19] border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── HEADER ───────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <motion.div 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#A16207] dark:text-amber-300 text-xs font-bold uppercase tracking-wider"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <School className="w-3.5 h-3.5 text-[#A16207] dark:text-amber-400" />
            <span>Passerelle Inter-Écoles de Commerce &amp; Universités</span>
          </motion.div>

          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Un Portail Ouvert à Toutes les{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] via-blue-600 to-amber-500 dark:from-blue-400 dark:via-amber-300 dark:to-yellow-400">
              Grandes Écoles d&apos;Algérie
            </span>
          </motion.h2>

          <motion.p
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Étudiants de <strong>HEC Alger</strong>, <strong>IHEC</strong>, <strong>ENSSEA</strong>, <strong>Faculté d&apos;Économie</strong> ou candidats aux concours nationaux : l&apos;ESB Hub met à votre disposition un patrimoine d&apos;annales, de mémoires bancaires certifiés et de fiches techniques pour booster vos révisions et vos PFE.
          </motion.p>
        </div>

        {/* ── 3 VALEURS CLÉS POUR LES EXTERNES ──────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1E3A8A] dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Annales &amp; Sujets de Concours
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Préparez le concours d&apos;entrée à l&apos;ESB (Licence &amp; Master) grâce aux sujets originaux des 5 dernières années avec éléments de correction officiels.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[#A16207] dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Mémoires de Fin d&apos;Études &amp; PFE
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Consultez des travaux de recherche réels menés au sein des banques de la place (BNA, BEA, CPA, Banque d&apos;Algérie) pour structurer votre propre mémoire.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Normes &amp; Régulation Bancaire
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Accédez aux synthèses des règlements de la Banque d&apos;Algérie, ratios de solvabilité Bâle II/III et guides pratiques d&apos;analyse financière d&apos;entreprise.
            </p>
          </div>
        </div>

        {/* ── APERÇU INTERACTIF DES DOCUMENTS ───────── */}
        <div className="bg-white dark:bg-[#0D1527] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl overflow-hidden mb-12">
          
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extrait de Ressources Disponibles</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Sélection de documents de référence consultables
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Cliquez sur un document pour afficher la fiche de synthèse et l&apos;accès complet.
              </p>
            </div>

            <Link href="/register">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer">
                <span>Créer un Compte Invité Gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            
            {/* List left (5 cols) */}
            <div className="lg:col-span-5 p-4 sm:p-6 space-y-3">
              {SAMPLE_PREVIEWS.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#1E3A8A] dark:border-blue-500 shadow-sm'
                        : 'bg-slate-50/60 dark:bg-white/5 border-transparent hover:bg-slate-100/80 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[#1E3A8A] dark:text-blue-300 border border-slate-200 dark:border-slate-700">
                        {doc.type} • {doc.year}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {doc.pages}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug mb-1">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.schoolTag}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Document Details & Unlock Card right (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-slate-50/50 dark:bg-[#080E1C]/60">
              {selectedDoc && (
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1E3A8A] text-white">
                        {selectedDoc.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {selectedDoc.year}
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {selectedDoc.downloads}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mb-2">
                      {selectedDoc.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auteur : <strong className="text-slate-700 dark:text-slate-300">{selectedDoc.author}</strong> • {selectedDoc.schoolTag}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Aperçu de la synthèse
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedDoc.summary}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Locked full preview box */}
                  <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-transparent border border-amber-400/30 overflow-hidden">
                    <div className="flex items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            Document intégral ({selectedDoc.pages})
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Gratuit pour tout étudiant inscrit (ESB, HEC, IHEC, Universités)
                          </p>
                        </div>
                      </div>

                      <Link href="/register" className="shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-700 text-white text-xs font-bold shadow transition-all cursor-pointer">
                          <span>Déverrouiller</span>
                          <Unlock className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── BANDEAU ÉCOLES PARTENAIRES ────────────── */}
        <div className="p-6 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Rejoignez les étudiants et enseignants issus des établissements suivants :
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {PARTNER_INSTITUTIONS.map((inst, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white dark:bg-[#0D1527] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-2xs"
              >
                {inst.name} <span className="text-slate-400 dark:text-slate-500 font-normal">({inst.city})</span>
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
