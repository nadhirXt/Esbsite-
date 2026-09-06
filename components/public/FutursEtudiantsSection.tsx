'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Award, CheckCircle2, Sparkles,
  ExternalLink, Compass, FileText, Calendar, Building,
  ShieldCheck, Clock, Users, ArrowUpRight, Download, Eye,
  FolderOpen
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Document } from '@/lib/types'

type ConcoursCycle = 'master' | 'dseb'

interface ConcoursInfo {
  title: string
  cycle: string
  duration: string
  description: string
  conditions: string[]
  badgeColor: string
}

const CONCOURS_DATA: Record<ConcoursCycle, ConcoursInfo> = {
  master: {
    title: 'Master en « Monnaie et Banque »',
    cycle: 'Cycle Master • 2 ans',
    duration: '2 années consécutives (Master 1 & Master 2)',
    description: 'Former les lauréats à l\'exercice des métiers de haute banque et aux fondements de la finance, micro et macroéconomie appliquées.',
    conditions: [
      'Moyenne générale exigée ≥ 12,50/20, obtenue sans redoublement.',
      'Titulaires d\'une Licence reconnue (Bac+3) ou 3 années accomplies en grande école dans les filières : Sciences Financières et Comptables, Sciences de Gestion, Commerciales, Économiques, Sciences & Technologies.',
      'Ou titulaires d\'un Diplôme Supérieur d\'Études Bancaires (DSEB) ou d\'une Licence de l\'ESB.',
      'Diplôme obtenu impérativement entre les années 2022 et 2024.'
    ],
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
  },
  dseb: {
    title: 'Diplôme Supérieur des Études Bancaires (DSEB)',
    cycle: 'Cycle Supérieur DSEB • 4 ans',
    duration: 'Formation d\'excellence en 4 années complètes',
    description: 'Le diplôme historique et emblématique de l\'ESB, formant les cadres polyvalents dotés d\'une haute expertise managériale pour la Banque centrale et les réseaux bancaires.',
    conditions: [
      'Accès par voie de concours national écrit ouvert aux bacheliers sélectionnés.',
      'Filières du Baccalauréat éligibles : Mathématiques, Techniques Mathématiques, Sciences Expérimentales, Gestion & Économie.',
      'Moyenne générale requise au Baccalauréat fixée annuellement par l\'ESB.',
      'Fort potentiel technique et managérial pour devenir acteur du changement.'
    ],
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  }
}

interface FutursEtudiantsSectionProps {
  initialDocs?: Document[]
}

export default function FutursEtudiantsSection({ initialDocs = [] }: FutursEtudiantsSectionProps) {
  const [selectedCycle, setSelectedCycle] = useState<ConcoursCycle>('master')

  const currentConcours = CONCOURS_DATA[selectedCycle]
  
  // Filter published documents for this cycle
  const cycleDocs = initialDocs.filter(doc => doc.category === selectedCycle)

  // Direct public open/download handler without login (streamed securely through our domain)
  const handleOpenDoc = (doc: Document, download: boolean = false) => {
    const ext = doc.file_path.split('.').pop()?.toLowerCase() || 'pdf'
    const safeTitle = (doc.title || 'document').replace(/[/\\?%*:|"<>]/g, '_')
    const fileUrl = `/assets/documents/${doc.id}/${encodeURIComponent(safeTitle)}.${ext}${download ? '?download=1' : ''}`

    if (download) {
      const link = window.document.createElement('a')
      link.href = fileUrl
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    } else {
      window.open(fileUrl, '_blank')
    }
  }

  return (
    <section id="concours" className="relative py-20 sm:py-28 bg-[#040814] text-white overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 cyber-grid-pattern opacity-15 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── EN-TÊTE STATUTAIRE ───────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-md shadow-lg shadow-cyan-500/10">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="font-mono uppercase tracking-wider text-xs">Concours National d&apos;Entrée • ESB</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Le Concours d&apos;Accès à l&apos;<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">École Supérieure de Banque</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Conditions officielles d&apos;admission, modalités réglementaires et documents officiels en <span className="text-amber-400 font-semibold">accès direct et libre</span> pour tous les candidats.
          </p>
        </div>

        {/* ── SÉLECTEUR DE CYCLE (MASTER & DSEB) ───────── */}
        <div className="bg-[#070D19]/90 border border-cyan-500/20 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-cyan-950/30 mb-14 relative overflow-hidden">
          {/* Top laser line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* DOCK SÉLECTEUR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Cycles sur Concours National</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                Sélectionnez le concours ciblé
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#030712] rounded-2xl border border-white/10 shrink-0">
              <button
                onClick={() => setSelectedCycle('master')}
                className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCycle === 'master'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Master Monnaie &amp; Banque
              </button>
              <button
                onClick={() => setSelectedCycle('dseb')}
                className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCycle === 'dseb'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cycle Supérieur DSEB
              </button>
            </div>
          </div>

          {/* DÉTAILS DU CONCOURS SÉLECTIONNÉ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCycle}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* En-tête du cycle */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-3 uppercase tracking-wider border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentConcours.cycle}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{currentConcours.duration}</span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentConcours.title}
                </h4>
                <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                  {currentConcours.description}
                </p>
              </div>

              {/* Grille : Conditions d'Admissibilité + Cadre des Épreuves Écrites */}
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                
                {/* Colonne 1 : Conditions Officielles (7 colonnes) */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/70 border border-slate-700/60 shadow-lg">
                  <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Conditions d&apos;admissibilité officielles
                  </h5>
                  <ul className="space-y-3">
                    {currentConcours.conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Colonne 2 : Cadre des Épreuves Écrites (5 colonnes) */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-slate-900 border border-blue-500/30 flex flex-col justify-between h-full space-y-5">
                  <div>
                    <h5 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-sky-400" />
                      Épreuves Écrites du Concours
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Les épreuves écrites de sélection et les coefficients associés sont arrêtés et communiqués lors de chaque session de concours par la commission pédagogique de l&apos;école.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Organisation de la Session</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Le calendrier officiel, la répartition des centres d&apos;examen et les convocations nominatives sont publiés et mis à jour pour chaque session.
                    </p>
                  </div>
                </div>

              </div>

              {/* ── DOCUMENTS OFFICIELS PUBLIÉS PAR L'ADMINISTRATION (LIBRE ACCÈS) ── */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    <FolderOpen className="w-4 h-4" />
                    <span>Documents Officiels du Concours ({selectedCycle === 'master' ? 'Master' : 'DSEB'})</span>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Accès Public Direct • Zéro Login
                  </span>
                </div>

                {cycleDocs.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
                    <FileText className="w-6 h-6 text-slate-500 mx-auto mb-2 opacity-60" />
                    <p className="text-xs text-slate-400">
                      Les documents et avis officiels pour cette session seront directement publiés ici par l&apos;administration dès leur parution.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {cycleDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate" title={doc.title}>
                              {doc.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Publié le {formatDate(doc.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenDoc(doc, false)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs transition-colors cursor-pointer"
                            title="Consulter directement"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenDoc(doc, true)}
                            className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs transition-colors cursor-pointer"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── COMMUNIQUÉS OFFICIELS & PORTAIL INSTITUTIONNEL ESB ── */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-[#070D19] to-slate-900/90 border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Portail Officiel &amp; Annonces Institutionnelles ESB
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Consultez l&apos;ensemble des avis de concours, arrêtés ministériels et communiqués de la Banque d&apos;Algérie directement sur le site officiel de l&apos;école.
              </p>
            </div>
          </div>

          <a
            href="http://www.esb.edu.dz/#/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-all duration-200 shrink-0 cursor-pointer"
          >
            <span>Site Officiel de l&apos;ESB</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* ── ENVIRONNEMENT ACADÉMIQUE DE BOUZARÉAH ────── */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Building className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-white mb-1.5">Campus de Baïnem</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Un cadre naturel boisé sur les hauteurs de Bouzaréah offrant sérénité et concentration pour la préparation et le cursus.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-white mb-1.5">Tutelle Banque d&apos;Algérie</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Une institution financière étatique garantissant des standards rigoureux et une valeur nationale pour les diplômes délivrés.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-white mb-1.5">Réseau Professionnel</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Plus de 30 promotions de cadres supérieurs intégrés dans les banques publiques, privées et institutions monétaires.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
