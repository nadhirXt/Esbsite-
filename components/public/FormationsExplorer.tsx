'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { 
  GraduationCap, Clock, Award, BookOpen, CheckCircle2, 
  ArrowRight, Briefcase, Sparkles, ChevronRight, Layers
} from 'lucide-react'

export interface FormationData {
  id: string
  cycle: string
  title: string
  subtitle: string
  duration: string
  hours: string
  badgeColor: string
  accentColor: string
  heroTag: string
  overview: string
  objectives: string[]
  admission: {
    title: string
    intro: string
    criteria: { label: string; detail: string }[]
  }
  programme: {
    title: string
    intro: string
    competences: string[]
    volumeHoraire?: string
  }
}

const FORMATIONS: FormationData[] = [
  {
    id: 'dseb',
    cycle: 'Cycle Supérieur DSEB',
    title: 'Diplôme Supérieur des Études Bancaires (DSEB)',
    subtitle: 'Programme d\'excellence historique formant des cadres à fort potentiel technique et managérial',
    duration: '4 années complètes',
    hours: 'Enseignements & stages en services opérationnels bancaires',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: '#A16207',
    heroTag: 'Management & Acteurs du Changement',
    overview: 'Le programme du cycle du Diplôme Supérieur des Études Bancaires combine harmonieusement une orientation professionnelle et un ancrage académique solide pour former les cadres d\'élite du secteur financier.',
    objectives: [
      "Développer chez les candidats un fort potentiel technique et managérial leur permettant de devenir des acteurs du changement.",
      "Forger une qualification technique et professionnelle de haut rang.",
      "Développer une solide capacité d’analyse et de synthèse face aux problématiques complexes du secteur bancaire."
    ],
    admission: {
      title: "Conditions d’Accès",
      intro: "L’accès au Diplôme Supérieur des Études Bancaires se fait par voie de concours. Le concours est ouvert aux candidats remplissant les conditions suivantes :",
      criteria: [
        { label: "Modalité de concours", detail: "Admission sur concours national officiel de l'École Supérieure de Banque." },
        { label: "Séries du Baccalauréat", detail: "Séries Mathématiques et Techniques Mathématiques, Sciences Expérimentales, Gestion et Économie." },
        { label: "Exigence de moyenne", detail: "Moyenne générale du baccalauréat exigée (fixée annuellement lors de l'ouverture du concours)." }
      ]
    },
    programme: {
      title: "Programme & Compétences Acquises",
      intro: "Le programme combine harmonieusement orientation professionnelle et ancrage académique solide. L’élève diplômé de l’École Supérieure de Banque acquiert :",
      competences: [
        "Une approche stratégique globale des métiers et du fonctionnement de la banque et des institutions financières.",
        "Des compétences techniques et professionnelles approfondies dans les domaines bancaires, financiers et assurantiels.",
        "La maîtrise du rôle des marchés financier, monétaire et de change.",
        "La capacité d'identifier et de mesurer les risques opérationnels, de crédit, de marché et de liquidité, tout en maîtrisant les techniques de couverture appropriées.",
        "La maîtrise des outils d’analyse, d’audit et de contrôle nécessaires au pilotage de la performance et à la conformité réglementaire."
      ]
    }
  },
  {
    id: 'licence',
    cycle: 'Cycle Licence',
    title: 'Licence « Management et Banque » (LMB)',
    subtitle: 'Formation diplômante en 3 ans (6 semestres) préparant au marché de l\'emploi et au Master',
    duration: '3 années académiques (6 semestres)',
    hours: '2 340 heures (cours magistraux, TD, TP & projets tutorés)',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    accentColor: '#1E3A8A',
    heroTag: 'Insertion Rapide & Poursuite Master',
    overview: 'Le programme de formation pour l’obtention de la Licence « Management et Banque » vise à doter les étudiants des qualifications requises pour une intégration rapide et réussie sur le marché du travail ou l\'accès direct au Master.',
    objectives: [
      "Doter les étudiants des qualifications requises leur permettant une intégration rapide et réussie sur le marché du travail.",
      "Développer une solide capacité d'analyse et de synthèse dans les opérations bancaires et financières.",
      "Offrir un accès direct en première année du Master Monnaie et Banque de l'école."
    ],
    admission: {
      title: "Conditions d’accès (Barèmes Baccalauréat)",
      intro: "L’accès est ouvert aux candidats titulaires d'un baccalauréat de l'année dans les filières suivantes avec barèmes spécifiques :",
      criteria: [
        { label: "Mathématiques & Techniques Mathématiques", detail: "Moyenne générale du baccalauréat égale ou supérieure à 15/20." },
        { label: "Sciences Expérimentales", detail: "Moyenne générale du baccalauréat ≥ 15/20 ET Note de mathématiques ≥ 15/20." },
        { label: "Gestion et Économie", detail: "Moyenne générale du baccalauréat ≥ 15/20 ET Note de mathématiques ≥ 15/20." }
      ]
    },
    programme: {
      title: "Programme & Compétences Clés",
      intro: "Le programme de formation en Licence « Management et Banque » s'articule autour de compétences clés :",
      competences: [
        "La compréhension des métiers et des opérations bancaires et financières.",
        "L’acquisition des fondements théoriques et pratiques des marchés financier, monétaire et de change.",
        "La maîtrise des techniques d'identification et de gestion des risques bancaires.",
        "L'assimilation des outils d'analyse financière, de comptabilité bancaire et de contrôle interne."
      ],
      volumeHoraire: "Volume horaire global : 2 340 heures réparties entre enseignements magistraux, travaux dirigés, travaux pratiques et projets tutorés."
    }
  },
  {
    id: 'master',
    cycle: 'Cycle Master',
    title: 'Master en « Monnaie et Banque »',
    subtitle: 'Haute formation universitaire et professionnelle formant les cadres hautement qualifiés du secteur bancaire',
    duration: '2 années universitaires (Master 1 & Master 2)',
    hours: 'Régime mixte : cours théoriques, études de cas & immersion professionnelle',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    accentColor: '#581C87',
    heroTag: 'Haute Finance, Monnaie & Régulation',
    overview: 'Le Master en « Monnaie et Banque » a pour objectif de former des cadres hautement qualifiés dans les domaines bancaires et financiers, dotés d\'une expertise approfondie des mécanismes monétaires, des marchés de capitaux et de la régulation contemporaine.',
    objectives: [
      "Former des cadres hautement qualifiés dans les domaines bancaires et financiers.",
      "Doter les diplômés d'une expertise approfondie des mécanismes monétaires, des marchés de capitaux, de la régulation bancaire et des stratégies financières contemporaines.",
      "Former à l'exercice des métiers de la banque tout en apprenant les fondements avancés de la finance, de la microéconomie et de la macroéconomie."
    ],
    admission: {
      title: "Conditions d’Accès",
      intro: "L’accès au Master « Monnaie et Banque » se fait sur concours ou sur dossier selon les modalités fixées annuellement par l'école :",
      criteria: [
        { label: "Moyenne de cursus en Licence", detail: "Moyenne de cursus égale ou supérieure à 12,50/20 durant le cycle de licence, sans redoublement." },
        { label: "Filières universitaires admises (Bac+3)", detail: "Licence en Sciences Économiques, Sciences de Gestion, Sciences Commerciales, Sciences Financières et Comptables, ou Sciences et Technologies." },
        { label: "Diplômés internes ESB", detail: "Titulaires du DSEB ou de la Licence ESB ayant validé leur cursus avec mention." },
        { label: "Sessions d'obtention", detail: "Diplôme obtenu entre 2022 et 2024 (pour les sessions récentes)." }
      ]
    },
    programme: {
      title: "Programme & Organisation",
      intro: "La formation s'étale sur deux années universitaires (Master 1 et Master 2), organisées en quatre semestres selon un régime d’études mixte :",
      competences: [
        "Enseignements théoriques approfondis en macroéconomie monétaire, marchés financiers et gestion des risques.",
        "Régime d’études mixte associant cours magistraux, études de cas réels et travaux pratiques avancés.",
        "Stage professionnel obligatoire en milieu bancaire ou institution financière de parrainage.",
        "Soutenance d'un mémoire de recherche appliquée de fin d'études devant un jury d'universitaires et d'experts de la place."
      ],
      volumeHoraire: "Régime de formation mixte combinant enseignements théoriques approfondis, études de cas réels et immersion professionnelle."
    }
  }
]

export default function FormationsExplorer() {
  const [activeCycle, setActiveCycle] = useState<string>('dseb')

  const current = FORMATIONS.find(f => f.id === activeCycle) || FORMATIONS[0]

  return (
    <div className="w-full">
      {/* ── TABS SELECTOR ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 p-1.5 bg-slate-200/60 dark:bg-[#060B17] rounded-2xl border border-slate-200 dark:border-white/10 max-w-2xl mx-auto mb-10 sm:mb-14 shadow-inner backdrop-blur-xl">
        {FORMATIONS.map((f) => {
          const isActive = activeCycle === f.id
          return (
            <button
              key={f.id}
              onClick={() => setActiveCycle(f.id)}
              className={`relative flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 select-none ${
                isActive 
                  ? 'text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-formation-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 shadow-md shadow-cyan-500/25 border border-cyan-300/40"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f.cycle}</span>
            </button>
          )
        })}
      </div>

      {/* ── ACTIVE FORMATION CARD ─────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 40, rotateX: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, rotateX: 20, scale: 0.9 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
          style={{ transformPerspective: 1500 }}
          className="preserve-3d w-full z-10"
        >
          <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} perspective={1500} transitionSpeed={1000} scale={1.03} glareEnable={true} glareMaxOpacity={0.2} glareColor={current.accentColor} glarePosition="all" className="preserve-3d w-full">
            <div className="bg-white/90 dark:bg-[#070D19]/90 rounded-3xl border border-slate-200 dark:border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative preserve-3d [transform:translateZ(40px)]">
          {/* Top laser strip */}
          <div 
            className="h-1.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            style={{ backgroundImage: `linear-gradient(90deg, transparent, ${current.accentColor}, transparent)` }}
          />

          <div className="p-6 sm:p-8 md:p-12">
            {/* Header details */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-8 border-b border-slate-100 dark:border-white/10">
              <div className="space-y-3.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${current.badgeColor}`}>
                    <GraduationCap className="w-3.5 h-3.5" />
                    {current.cycle}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {current.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                    {current.hours}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {current.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {current.overview}
                </p>
              </div>

              <div className="shrink-0 flex sm:flex-col gap-3">
                <Link href={`/register?cycle=${current.id}`}>
                  <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all hover:scale-[1.02] cursor-pointer">
                    <span>Accéder aux cours</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <a href="#bibliotheque">
                  <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer">
                    <span>Fonds documentaire</span>
                  </button>
                </a>
              </div>
            </div>

            {/* 3 Main Grid Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
              
              {/* Col 1: Objectifs de la Formation */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  Objectifs de la Formation
                </h4>
                <ul className="space-y-3">
                  {current.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 2: Conditions d'Accès & Éligibilité */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                  {current.admission.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {current.admission.intro}
                </p>
                <div className="space-y-2.5">
                  {current.admission.criteria.map((crit, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 hover:border-sky-500/30 transition-colors">
                      <p className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                        {crit.label}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {crit.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: Programme & Compétences Clés */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  {current.programme.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {current.programme.intro}
                </p>
                <ul className="space-y-2.5">
                  {current.programme.competences.map((comp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
                {current.programme.volumeHoraire && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                    {current.programme.volumeHoraire}
                  </div>
                )}
              </div>

            </div>
            </div>
            </div>
          </Tilt>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
