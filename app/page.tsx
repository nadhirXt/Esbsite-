import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import FormationsExplorer from '@/components/public/FormationsExplorer'
import FutursEtudiantsSection from '@/components/public/FutursEtudiantsSection'
import InterEcolesSection from '@/components/public/InterEcolesSection'
import QRCodeSection from '@/components/public/QRCodeSection'
import AlumniFeedbacks from '@/components/public/AlumniFeedbacks'
import HeroSection from '@/components/public/HeroSection'
import { createClient } from '@/lib/supabase/server'
import { ClientImage } from '@/components/ui/ClientImage'
import CopyEmailButton from '@/components/ui/CopyEmailButton'
import {
  GraduationCap, TrendingUp, Users, Award, BookOpen,
  ArrowRight, CheckCircle, Building2, ShieldCheck, 
  MapPin, Library, Search, FileText, Sparkles, 
  ExternalLink, Mail, CheckCircle2, ChevronRight, Trees
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'ESB Hub — École Supérieure de Banque d\'Algérie | Portail Académique Officiel',
  description: 'Portail académique de l\'École Supérieure de Banque (Direction Générale de la Banque d\'Algérie). Formations d\'élite Licence, DSEB et Master en monnaie, banque et finance à Alger. Annales de concours et mémoires de référence pour les grandes écoles de commerce.',
  keywords: [
    'École Supérieure de Banque',
    'ESB Alger',
    'Banque d\'Algérie',
    'Concours ESB 2026–2027',
    'HEC Alger annales',
    'IHEC Alger',
    'ENSSEA',
    'Licence Management et Banque',
    'DSEB',
    'Master Monnaie et Banque',
    'Mémoires banque Algérie',
    'Finance bancaire Algérie'
  ],
  openGraph: {
    title: 'ESB Hub — École Supérieure de Banque d\'Algérie',
    description: 'Portail d\'élite de l\'École Supérieure de Banque : Formations certifiées, bibliothèque virtuelle et annales nationales.',
    url: 'https://esbhub.study',
    type: 'website',
  }
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: "École Supérieure de Banque d'Algérie",
  alternateName: 'ESB Hub',
  url: 'https://esbhub.study',
  logo: 'https://esbhub.study/images/esb-logo.jpg',
  description: "Portail officiel de l'École Supérieure de Banque (Banque d'Algérie). Formations d'élite Licence, DSEB et Master, annales de concours et mémoires de référence pour les étudiants en économie et finance en Algérie.",
  parentOrganization: {
    '@type': 'GovernmentOrganization',
    name: "Banque d'Algérie",
    url: 'https://www.bank-of-algeria.dz'
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Forêt de Baïnem, Bouzaréah',
    addressLocality: 'Alger',
    addressRegion: 'Alger',
    addressCountry: 'DZ'
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Formations Bancaires Supérieures',
    itemListElement: [
      {
        '@type': 'Course',
        name: 'Licence en Management et Banque (LMB)',
        description: 'Cursus certifié de 3 ans formant aux métiers opérationnels et analytiques de la banque.'
      },
      {
        '@type': 'Course',
        name: "Diplôme Supérieur d'Études Bancaires (DSEB)",
        description: 'Programme supérieur de 4 ans dédié aux cadres dirigeants et analystes du secteur financier.'
      },
      {
        '@type': 'Course',
        name: 'Master Professionnel en Monnaie et Banque (M2B)',
        description: "Cursus d'élite en 2 ans axé sur la macroéconomie monétaire, les marchés financiers et la régulation prudentielle."
      }
    ]
  }
}

const STATS_DATA = [
  { value: '30+',  label: 'Années d\'excellence', sub: 'Fondée en janvier 1995', icon: Award },
  { value: '100%', label: 'Tutelle Banque d\'Algérie', sub: 'Direction Générale dédiée', icon: ShieldCheck },
  { value: '3',    label: 'Cycles de formation', sub: 'Licence, DSEB & Master', icon: BookOpen },
  { value: '95%',  label: 'Taux d\'insertion', sub: 'Dans les banques partenaires', icon: TrendingUp },
]

const PARTNER_BANKS = [
  'Banque d\'Algérie',
  'BNA',
  'BEA',
  'BDL',
  'CPA',
  'CNEP-Banque',
  'BADR',
  'BNP Paribas El Djazaïr',
  'Société Générale Algérie',
  'Al Baraka Bank'
]

const LIBRARY_DISCIPLINES = [
  { 
    name: 'Comptabilité Financière & Normes SCF', 
    count: '76+ documents', 
    tag: 'Fonds Réel',
    detail: 'Exemples réels : "Comptabilité et audit bancaires" (546 p.), "CONTENU DES RUBRIQUES DE BILAN ET CR", "Toutes les séries corrgiées" (26 p.)'
  },
  { 
    name: 'Analyse Financière & Diagnostic PME', 
    count: '44+ documents', 
    tag: 'Fonds Réel',
    detail: 'Exemples réels : "Les ratios qui comptent" (254 p.), "Chapitre 4 CAF NOUVEAU SCF DEC 2025" (4 p.), "Les ratios de délais ESB"'
  },
  { 
    name: 'Mathématiques Financières & Actuariat', 
    count: '189+ polycopiés', 
    tag: 'Fonds Réel',
    detail: 'Exemples réels : "Stat-Et-Proba-Cours-Et-Exos-Corrigees-J-P-LECOUTRE" (317 p.), "Optimisation et analyse convexe" (355 p.)'
  },
  { 
    name: 'Gestion des Risques & Bâle II / Bâle III', 
    count: '154+ dossiers', 
    tag: 'Fonds Réel',
    detail: 'Exemples réels : "Risk Management _ Financial Institutions - J. C. Hull" (830 p.), "GLOBAL" (269 p.), "Risque credit"'
  },
  { 
    name: 'Macroéconomie Monétaire & Marchés', 
    count: '83+ synthèses', 
    tag: 'Fonds Réel',
    detail: 'Exemples réels : "Système Comptable National 2008" (751 p.), "toaz.info-macroeconomie" (159 p.), "cours de macroéconomie"'
  },
  { 
    name: 'Sujets d\'Examens & Annales Officielles', 
    count: '259+ épreuves', 
    tag: 'Fonds Réel',
    detail: 'Exemples réels : "Examens S2 D27 ( 1st year)" (12 p.), "Interrogations S2 D27" (3 p.), "Examen S1 DSEB 27 Comptabilité" (2 p.)'
  },
]

const CAMPUS_PILLARS = [
  {
    title: 'Cadre Préservé de Baïnem',
    desc: 'Implantée sur les hauteurs de Bouzaréah, à l\'orée de la forêt de Baïnem, l\'ESB offre un environnement calme et verdoyant propice aux hautes études et à la concentration.',
    icon: Trees,
    accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  {
    title: 'Infrastructures Pédagogiques',
    desc: 'Amphithéâtres équipés, salles de séminaires, laboratoires informatiques et espaces de travail collaboratif configurés selon les exigences académiques modernes.',
    icon: Building2,
    accent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  {
    title: 'Bibliothèque Spécialisée',
    desc: 'Un riche fonds documentaire physique et numérique regroupant les monographies économiques, traités de droit bancaire, revues financières et archives monétaires.',
    icon: Library,
    accent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  {
    title: 'Synergie avec la Banque Centrale',
    desc: 'Des interventions régulières assurées par les directeurs, cadres supérieurs de la Banque d\'Algérie et praticiens de renom du système bancaire national.',
    icon: ShieldCheck,
    accent: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
  }
]

export const revalidate = 300 // Revalidate cached metrics every 5 minutes

export default async function HomePage() {
  const supabase = await createClient()

  // Parallel fast execution
  const [statsRes, categoriesRes, concoursRes] = await Promise.all([
    supabase.rpc('get_platform_stats'),
    supabase.from('documents').select('category').neq('title', '.keep').limit(150),
    supabase.from('documents').select('*').eq('cycle', 'concours').order('created_at', { ascending: false })
  ])
  
  const totalUsers = statsRes.data?.[0]?.total_users || 0
  const totalDocs = statsRes.data?.[0]?.total_documents || 0
  const uniqueCategories = new Set(categoriesRes.data?.map((d: any) => d.category).filter(Boolean) || []).size
  const concoursDocs = concoursRes.data || []

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicHeader />
      <main className="overflow-x-hidden pt-16 sm:pt-20">
        
        {/* ── 1. HERO SECTION INSTITUTIONNELLE ─────── */}
        <HeroSection totalDocs={totalDocs} totalUsers={totalUsers} uniqueCategories={uniqueCategories} />

        {/* ── 2. TRUST STRIP : BANQUES PARTENAIRES (Infinite Marquee) ─── */}
        <section className="bg-[#F8FAFC] dark:bg-[#030712] py-6 border-b border-slate-200/80 dark:border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 text-center">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Écosystème bancaire algérien — Partenaires de stages &amp; d&apos;insertion
            </p>
          </div>
          <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex gap-4 animate-marquee whitespace-nowrap">
              {[...PARTNER_BANKS, ...PARTNER_BANKS].map((bank, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl bg-white/80 dark:bg-[#070D19]/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm shrink-0 hover:border-cyan-400/40 transition-colors"
                >
                  {bank}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. CHIFFRES CLÉS & IDENTITÉ ───────────── */}
        <section id="chiffres" className="bg-[#F8FAFC] dark:bg-[#040814] py-14 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid-pattern opacity-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Piliers d&apos;Excellence
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                L&apos;institution en chiffres clés
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS_DATA.map((s, idx) => {
                const Icon = s.icon
                return (
                  <div 
                    key={idx} 
                    className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-[#070D19]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-cyan-400/40 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-5 border border-blue-100 dark:border-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1 font-mono">
                      {s.value}
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {s.sub}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 4. ESPACE FUTURS ÉTUDIANTS & GUIDE DU CONCOURS ── */}
        <FutursEtudiantsSection initialDocs={concoursDocs} />

        {/* ── 5. OFFRE DE FORMATION COMPLÈTE ───────── */}
        <section id="formations" className="bg-white dark:bg-[#070D19] py-16 sm:py-24 border-t border-slate-200/80 dark:border-white/10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Offre Académique &amp; Diplômes Certifiés
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                Nos Programmes d&apos;Élite Bancaire
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Trois cursus d&apos;excellence conçus en symbiose directe avec les besoins opérationnels de la Banque d&apos;Algérie et des banques nationales.
              </p>
            </div>

            {/* Interactive Tabbed Component */}
            <FormationsExplorer />
          </div>
        </section>

        {/* ── 6. OUVERTURE INTER-ÉCOLES & ACCÈS NATIONAL ── */}
        <InterEcolesSection />

        {/* ── 7. BIBLIOTHÈQUE VIRTUELLE & RECHERCHE ─── */}
        <section id="bibliotheque" className="bg-slate-50/70 dark:bg-[#030712] py-16 sm:py-24 border-t border-slate-200/80 dark:border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid-pattern opacity-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-sky-500/10 border border-blue-200 dark:border-sky-500/20 text-blue-700 dark:text-sky-300 text-xs font-mono font-bold uppercase tracking-wider">
                  <Library className="w-3.5 h-3.5 text-sky-400" />
                  <span>Fonds Documentaire Réel &bull; Entraide Inter-Écoles</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  La Bibliothèque Virtuelle &amp; Ressources Partagées
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Conçu dans une démarche d&apos;ouverture et d&apos;entraide académique, le portail ESB Hub met à disposition des étudiants de l&apos;ESB et de nos camarades des autres grandes écoles (HEC Alger, IHEC, ENSSEA, ESC Kolea, Facultés des Sciences Économiques) un patrimoine de <strong>plus de 865 documents réels</strong> : cours magistraux officiels, travaux dirigés corrigés, polycopiés et annales complètes d&apos;examens.
                </p>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>865+ documents académiques réels classés par cycle et discipline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Séries de TD avec corrigés types, bilans SCF et cas pratiques PME</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Prévisualisation intégrée sécurisée (PDF &amp; Office) en libre consultation</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link 
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Explorer la Bibliothèque</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                  >
                    <span>Inscription Visiteur</span>
                  </Link>
                </div>
              </div>

              {/* Right Disciplines Grid */}
              <div className="lg:col-span-7">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-[#070D19]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-5">
                  
                  {/* Fake Search Header */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-400">
                    <Search className="w-4 h-4 text-amber-500" />
                    <span className="font-mono">Ex : Bilan SCF, Ratio de solvabilité Bâle, Diagnostic PME, Probabilités...</span>
                  </div>

                  {/* Thematic Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {LIBRARY_DISCIPLINES.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-sky-500/30 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:bg-sky-500/10 dark:text-sky-300 border border-blue-500/10 dark:border-sky-500/20">
                            {item.tag}
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-400">
                            {item.count}
                          </span>
                        </div>
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ressources en accès libre partagé pour les étudiants de l&apos;ESB, de HEC, de l&apos;ENSSEA et des facultés partenaires.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 8. RETOURS ALUMNI & AVIS LINKEDIN (Preuve Sociale Élevée) ── */}
        <AlumniFeedbacks />

        {/* ── 6. CAMPUS DE BOUZARÉAH & CADRE DE VIE ─── */}
        <section id="campus" className="bg-white dark:bg-[#070D19] py-16 sm:py-24 border-t border-slate-200/80 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Localisation &amp; Environnement
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                Un Campus d&apos;Exception sur les Hauteurs d&apos;Alger
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Le siège de l&apos;École Supérieure de Banque est niché à Bouzaréah, à l&apos;orée de la forêt de Baïnem, offrant un environnement serein et stimulant propice à la haute réflexion académique.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CAMPUS_PILLARS.map((col, idx) => {
                const Icon = col.icon
                return (
                  <div 
                    key={idx} 
                    className="p-6 sm:p-7 rounded-3xl bg-slate-50/80 dark:bg-[#0B1326]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${col.accent}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {col.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {col.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 7. GENÈSE DU PROJET & INITIATEUR ──────── */}
        <section id="apropos" className="bg-slate-50/80 dark:bg-[#030712] py-16 sm:py-24 border-t border-slate-200/80 dark:border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid-pattern opacity-10 pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Note d&apos;Initiative Académique
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                La Genèse d&apos;ESB Hub
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Une démarche d&apos;innovation collaborative portée par un étudiant au service de toute la communauté bancaire.
              </p>
            </div>

            <div className="bg-white/95 dark:bg-[#070D19]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 md:p-14 border border-slate-200/90 dark:border-white/10 shadow-2xl space-y-10">
              
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-white dark:border-slate-700 bg-gradient-to-br from-[#1E3A8A] to-[#0F172A]">
                  <ClientImage
                    src="/images/nadhir.jpg"
                    alt="Mohamed Nadhir Benelhadj"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[#A16207] dark:text-amber-300 text-xs font-bold mb-2">
                    <span>Créateur & Développeur du Portail</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Mohamed Nadhir Benelhadj
                  </h3>
                  <p className="text-sm font-semibold text-[#1E3A8A] dark:text-blue-400 mt-0.5">
                    Étudiant en 2ème année DSEB · École Supérieure de Banque (ESB)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ex-Étudiant à l&apos;École Nationale Polytechnique d&apos;Oran (ENPO) · Alger, Algérie
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2.5 justify-center sm:justify-start">
                    <a
                      href="https://www.linkedin.com/in/mohamed-nadhir-benelhadj-833a32349/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077B5] hover:bg-[#005E93] text-white text-xs font-semibold shadow-md transition-transform hover:-translate-y-0.5"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      <span>Profil LinkedIn Vérifié</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Narrative Content */}
              <div className="space-y-6 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[#0F172A] dark:text-blue-100 font-medium italic">
                  « Passer des sciences pour l&apos;ingénieur (ENPO) à la finance bancaire (ESB) a été un défi formateur. Face à la dispersion des supports et à la densité des programmes, j&apos;ai souhaité offrir aux promotions actuelles et futures l&apos;outil que j&apos;aurais rêvé avoir dès mon premier jour. »
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Trois Engagements au Service de la Communauté
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-[#A16207] dark:text-amber-400 flex items-center justify-center font-bold text-xs mb-3">
                        01
                      </div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                        Centralisation Intégrale
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Mettre un terme à l&apos;éparpillement des polycopiés et mémoires pour concentrer tout le savoir en un point unique.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-[#1E3A8A] dark:text-blue-400 flex items-center justify-center font-bold text-xs mb-3">
                        02
                      </div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                        Passerelle Académique
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Aider les étudiants issus d&apos;autres parcours à acquérir avec fluidité le vocabulaire et les méthodes bancaires.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
                        03
                      </div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                        Rayonnement National
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Offrir une vitrine d&apos;excellence à l&apos;École Supérieure de Banque pour les futurs bacheliers et partenaires bancaires.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Ce portail est une initiative académique bénévole, conçue pour soutenir l&apos;effort pédagogique de l&apos;ESB et de la Banque d&apos;Algérie.
                </p>
              </div>

              {/* Contact Dialogue Module */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Canal de Dialogue Direct</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    Échanger avec l&apos;initiateur du projet
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-200 max-w-md leading-relaxed">
                    Une suggestion d&apos;amélioration, un dépôt de document ou une collaboration ? N&apos;hésitez pas à prendre contact.
                  </p>
                </div>
                <div className="shrink-0">
                  <CopyEmailButton email="info@esbhub.study" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 9. ACCÈS MOBILE & QR CODE ─────────────── */}
        <QRCodeSection />

        {/* ── 10. CLIMAX CTA ACADÉMIQUE ─────────────── */}
        <section id="contact" className="relative py-20 sm:py-28 bg-[#030712] border-t border-white/10 text-white text-center overflow-hidden">
          <div className="absolute inset-0 cyber-grid-pattern opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/15 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 space-y-6 z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 text-cyan-300 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.3)] backdrop-blur-md">
              <GraduationCap className="w-9 h-9 text-cyan-300" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Promotion &amp; Accréditation ESB
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              Rejoignez l&apos;Excellence Bancaire
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Consultez les cours, téléchargez les annales, échangez avec les promotions et intégrez la communauté d&apos;élite de l&apos;École Supérieure de Banque.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link 
                href="/register"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Créer mon Compte Étudiant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white/5 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(56,189,248,0.1)] transition-all cursor-pointer backdrop-blur-md"
              >
                <span>Connexion au Portail</span>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </>
  )
}
