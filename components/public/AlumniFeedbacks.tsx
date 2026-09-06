'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, Quote, Building2, GraduationCap, CheckCircle2, 
  Sparkles, ArrowRight, Heart, ExternalLink, MessageCircle,
  Award, Users, BookOpen, Search, X, ThumbsUp, Send, Share2,
  FileText, Compass, ShieldCheck
} from 'lucide-react'

const Linkedin = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

interface LinkedInReview {
  id: string
  name: string
  role: string
  category: 'Expert' | 'Contributeur' | 'Etudiant'
  linkedinUrl: string
  avatarInitial: string
  avatarGradient: string
  rating: number
  quote: string
  fullComment: string
  badge: string
  likes: number
  institution?: string
}

const LINKEDIN_POST_URL = "https://www.linkedin.com/posts/mohamed-nadhir-benelhadj-833a32349_esb-ecolesuperieuredebanque-finance-activity-7493115959113601024-U-G6"

const REAL_REVIEWS: LinkedInReview[] = [
  {
    id: '1',
    name: 'Rachid Sekak MBE',
    role: 'Expert Financier & Ancien Directeur Général de Banque',
    category: 'Expert',
    institution: 'Banque d\'Affaires / HSBC Algérie',
    linkedinUrl: 'https://dz.linkedin.com/in/rachid-sekak-mbe-0453a524',
    avatarInitial: 'RS',
    avatarGradient: 'from-amber-600 via-yellow-600 to-amber-700',
    rating: 5,
    quote: 'Votre initiative est méritoire et à encourager. Bravo !',
    fullComment: 'Le manque criant d\'informations économiques notamment sur le secteur bancaire est un très gros handicap pour l\'apprentissage du métier de banquier. Sur ce volet je vous promets une aide de ma part car votre initiative est méritoire et à encourager. Bravo.',
    badge: 'Expert International & Ex-DG',
    likes: 38
  },
  {
    id: '2',
    name: 'Aya BELOUCIF',
    role: 'Credit Risk Analyst | Ex-Trader @ Bank of Algeria',
    category: 'Contributeur',
    institution: 'Banque d\'Algérie',
    linkedinUrl: 'https://dz.linkedin.com/in/aya-beloucif-5391b822b',
    avatarInitial: 'AB',
    avatarGradient: 'from-blue-600 via-cyan-600 to-sky-500',
    rating: 5,
    quote: 'Bravo, bravo et BRAVO Mouhamed pour cette belle réalisation !',
    fullComment: 'Bravo, bravo et BRAVO Mouhamed pour cette belle réalisation ! Je suis tellement contente et fière d’avoir pu contribuer à ce projet. Étant donné que c’était l’une des choses que je voulais concrétiser à l’ESB, ça me fait vraiment plaisir de voir le projet prendre vie. Bravo encore une fois ! Le but, c’est vraiment de rendre les études plus faciles et moins inquiétantes pour les nouvelles générations de l\'ESB ! Merci encore et bonne continuation ! Et si jamais vous avez besoin de quoi que se soit n’hésitez surtout pas !',
    badge: 'Pilier Ressources Initiales',
    likes: 46
  },
  {
    id: '3',
    name: 'Lina Bekhouche',
    role: 'FX SALES Salle des Marchés • BNP Paribas El Djazaïr',
    category: 'Expert',
    institution: 'BNP Paribas El Djazaïr',
    linkedinUrl: 'https://dz.linkedin.com/in/lina-bekhouche-954930198',
    avatarInitial: 'LB',
    avatarGradient: 'from-teal-600 via-emerald-600 to-green-500',
    rating: 5,
    quote: 'Excellente idée et initiative, c\'est ce dont l\'ESB avait besoin 👏',
    fullComment: 'Franchement bravo 👏 excellente idée et Initiative a l\'école , c ce que l\'ESB avait besoin , bon continuation à toi !',
    badge: 'FX Sales @ BNP Paribas',
    likes: 31
  },
  {
    id: '4',
    name: 'Aya BENABDESSELAM',
    role: 'Credit Analyst Large Corporates • Société Générale Algérie',
    category: 'Expert',
    institution: 'Société Générale Algérie',
    linkedinUrl: 'https://dz.linkedin.com/in/aya-benabdesselam-332918239',
    avatarInitial: 'AB',
    avatarGradient: 'from-rose-600 via-pink-600 to-purple-600',
    rating: 5,
    quote: 'Bravo, excellent travail ! Une ressource précieuse pour tous.',
    fullComment: 'Bravo, excellent travail ! Une ressource précieuse pour tous les étudiants et diplômés.',
    badge: 'Credit Analyst @ SG Algérie',
    likes: 28
  },
  {
    id: '5',
    name: 'Sohaib IMARAZENE',
    role: 'Parrain de la Section Bibliothèque & Fonds Documentaire',
    category: 'Contributeur',
    institution: 'Communauté Académique & Recherche',
    linkedinUrl: 'https://ca.linkedin.com/in/sohaib-imarazene-55931716a',
    avatarInitial: 'SI',
    avatarGradient: 'from-indigo-600 via-violet-600 to-blue-600',
    rating: 5,
    quote: 'Un fonds documentaire d\'exception pour enrichir la recherche bancaire.',
    fullComment: 'Une immense collection d\'ouvrages d\'économie monétaire, de rapports professionnels et de mémoires mise à la disposition de tous les étudiants pour dynamiser la recherche appliquée et l\'excellence bancaire.',
    badge: 'Parrain Bibliothèque & Thèses',
    likes: 35
  },
  {
    id: '6',
    name: 'Khraili Ikram',
    role: 'Étudiante ESB (Master Monnaie & Banque)',
    category: 'Etudiant',
    institution: 'École Supérieure de Banque',
    linkedinUrl: 'https://dz.linkedin.com/in/khraili-ikram-8a103b2b9',
    avatarInitial: 'KI',
    avatarGradient: 'from-cyan-600 via-teal-600 to-emerald-500',
    rating: 5,
    quote: 'Exactement ce dont on avait besoin pour les cours, les stages et les mémoires.',
    fullComment: 'Bravo pour cette belle initiative 👏🏻 Un site vraiment utile pour les étudiants de toutes les promos, exactement ce dont on avait besoin que ce soit pour les études, les stages ou les mémoires. Merci pour ce travail et pour le partage !',
    badge: 'Étudiante ESB',
    likes: 26
  },
  {
    id: '7',
    name: 'Mostefaoui Nessrine Rania',
    role: 'Étudiante à EHEC • Membre Relations Publiques ALUMNI HEC',
    category: 'Etudiant',
    institution: 'EHEC / ALUMNI HEC Alger',
    linkedinUrl: 'https://dz.linkedin.com/in/mostefaoui-nessrine-rania-94555a2a1',
    avatarInitial: 'MN',
    avatarGradient: 'from-fuchsia-600 via-pink-600 to-rose-500',
    rating: 5,
    quote: 'Transformer une difficulté personnelle en un projet solidaire est admirable.',
    fullComment: 'Je suis vraiment fière de vous, pour avoir transformé une difficulté personnelle en un projet aussi utile. Voir un problème, le vivre soi-même et décider de créer une solution pour aider les autres, c’est une démarche vraiment admirable. Beaucoup de courage pour la suite !',
    badge: 'ALUMNI HEC & EHEC',
    likes: 30
  },
  {
    id: '8',
    name: 'Mohamed Bey Benhadj',
    role: 'Étudiant @ École Supérieure de Banque (ESB)',
    category: 'Etudiant',
    institution: 'École Supérieure de Banque',
    linkedinUrl: 'https://dz.linkedin.com/in/mohamed-bey-benhadj-1218a02a1',
    avatarInitial: 'MB',
    avatarGradient: 'from-blue-700 via-indigo-700 to-cyan-600',
    rating: 5,
    quote: 'Un excellent travail et une initiative qui mérite d’être encouragée 👏🏼',
    fullComment: 'Bravo Nadhir ! Un excellent travail et une initiative qui mérite d’être encouragée. 👏🏼',
    badge: 'Étudiant ESB',
    likes: 24
  },
  {
    id: '9',
    name: 'Ghada Sahraoui',
    role: 'Doctorante (PhD Student), Enseignante & Traductrice',
    category: 'Expert',
    institution: 'Enseignement Supérieur',
    linkedinUrl: 'https://dz.linkedin.com/in/ghada-sahraoui-23b60a181',
    avatarInitial: 'GS',
    avatarGradient: 'from-amber-600 via-orange-600 to-rose-600',
    rating: 5,
    quote: 'Your pioneering mindset will take you places Nadhir 👏🏻👏🏻',
    fullComment: 'Your pioneering mindset will take you places Nadhir 👏🏻👏🏻 Une démarche visionnaire et proactive qui transforme le paysage de l\'accès au savoir financier.',
    badge: 'Doctorante & Enseignante',
    likes: 27
  },
  {
    id: '10',
    name: 'Madjid Debbouze',
    role: 'Professionnel Bancaire & Ancien Étudiant',
    category: 'Etudiant',
    institution: 'Secteur Bancaire',
    linkedinUrl: 'https://dz.linkedin.com/in/madjid-debbouze-9a5302361',
    avatarInitial: 'MD',
    avatarGradient: 'from-slate-700 via-blue-900 to-slate-900',
    rating: 5,
    quote: 'Tu as identifié un vrai besoin et tu as su le transformer en projet concret.',
    fullComment: 'Bravo Nadhir pour cette belle initiative. Tu as identifié un vrai besoin et tu as su le transformer en un projet concret et utile pour les étudiants. Beaucoup de courage pour la suite 👏👏',
    badge: 'Communauté Bancaire',
    likes: 22
  },
  {
    id: '11',
    name: 'Samah Alliaoui',
    role: 'Étudiante à l\'École Supérieure de Banque (ESB)',
    category: 'Etudiant',
    institution: 'École Supérieure de Banque',
    linkedinUrl: 'https://dz.linkedin.com/in/samah-alliaoui-2240a1366',
    avatarInitial: 'SA',
    avatarGradient: 'from-purple-600 via-indigo-600 to-blue-600',
    rating: 5,
    quote: 'Bravo pour ce travail ingénieux au service de la réussite de tous.',
    fullComment: 'Bravo pour ce travail ingénieux 👏 Continue à être cette personne brillante et exceptionnelle que tu es !',
    badge: 'Étudiante ESB',
    likes: 21
  }
]

export default function AlumniFeedbacks() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({})
  const [activeModalReview, setActiveModalReview] = useState<LinkedInReview | null>(null)

  const toggleLike = (id: string) => {
    setLikedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Filter logic: Category + Instant Keyword Search
  const filteredReviews = useMemo(() => {
    return REAL_REVIEWS.filter(r => {
      const matchCategory = selectedCategory === 'all' || r.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchSearch = !q || 
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.quote.toLowerCase().includes(q) ||
        r.fullComment.toLowerCase().includes(q) ||
        (r.institution && r.institution.toLowerCase().includes(q))
      return matchCategory && matchSearch
    })
  }, [selectedCategory, searchQuery])

  const categories = [
    { id: 'all',          label: 'Tous les avis',        count: REAL_REVIEWS.length },
    { id: 'Expert',       label: 'Experts & Banquiers',  count: REAL_REVIEWS.filter(r => r.category === 'Expert').length },
    { id: 'Contributeur', label: 'Piliers du Projet',    count: REAL_REVIEWS.filter(r => r.category === 'Contributeur').length },
    { id: 'Etudiant',     label: 'Étudiants & Alumni',   count: REAL_REVIEWS.filter(r => r.category === 'Etudiant').length },
  ]

  return (
    <section id="feedbacks" className="py-20 sm:py-28 relative overflow-hidden bg-slate-50/90 dark:bg-[#070D19] border-t border-slate-200/80 dark:border-white/10">
      {/* ── AMBIENT GLOWS ────────────────────────────── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-r from-blue-900/15 via-amber-600/10 to-cyan-900/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 dark:bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── EN-TÊTE PRINCIPAL ────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/90 dark:border-blue-800 text-[#0077B5] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm"
          >
            <Linkedin className="w-3.5 h-3.5 fill-current" />
            <span>Retours d&apos;Expérience &amp; Genèse d&apos;ESB Hub</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            La voix de la communauté <span className="text-[#B45309] dark:text-amber-400">bancaire &amp; académique</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Retours authentiques issus de la publication LinkedIn de Mohamed Nadhir Benelhadj, réunissant directeurs de banques, traders, étudiants et contributeurs clés autour d&apos;un même idéal de partage.
          </motion.p>
        </div>

        {/* ── FEATURE CARD 1 : LA GENÈSE DU FONDATEUR (MOHAMED NADHIR BENELHADJ) ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 sm:mb-20 rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white/95 via-blue-50/40 to-white/95 dark:from-[#0B132B]/90 dark:via-[#0F172A]/90 dark:to-[#070D19]/90 border border-blue-200/80 dark:border-blue-500/20 shadow-xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle decorative watermark */}
          <div className="absolute -top-10 -right-10 opacity-5 dark:opacity-10 pointer-events-none">
            <GraduationCap className="w-80 h-80 text-blue-900 dark:text-cyan-400" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Colonne gauche : Profil Fondateur */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-amber-500 p-1 shadow-xl shadow-blue-900/30">
                  <div className="w-full h-full rounded-[22px] bg-[#070D19] flex items-center justify-center text-white font-black text-2xl tracking-wider">
                    MNB
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>Fondateur</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Mohamed Nadhir Benelhadj
              </h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mt-1">
                Concepteur &amp; Développeur d&apos;ESB Hub
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Étudiant à l&apos;ESB • Ex-Élève Ingénieur à l&apos;ENPO
              </p>

              {/* Badges de parcours */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mt-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100/70 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-800">
                  <Compass className="w-3 h-3" />
                  ENPO ➔ ESB (Reconversion)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-800">
                  <ShieldCheck className="w-3 h-3" />
                  Drive &amp; Vision Ouverte
                </span>
              </div>

              {/* Bouton vers le post */}
              <a 
                href={LINKEDIN_POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#005E93] text-white text-xs font-bold transition-all duration-300 shadow-md hover:scale-105"
              >
                <Linkedin className="w-3.5 h-3.5 fill-current" />
                <span>Voir le Post sur LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Colonne droite : Le Récit & La Promesse */}
            <div className="lg:col-span-8 lg:border-l lg:border-slate-200/80 dark:lg:border-white/10 lg:pl-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
                <Quote className="w-4 h-4" />
                <span>La Genèse d&apos;une Initiative Solidaire</span>
              </div>

              <blockquote className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">
                &ldquo;Après un parcours d&apos;ingénieur à l&apos;ENPO, mon passage à l&apos;École Supérieure de Banque m&apos;a confronté à une réalité frappante : le plus grand choc n&apos;était pas la difficulté des cours, mais la <span className="font-bold text-slate-950 dark:text-white underline decoration-amber-500/60 underline-offset-4">rareté absolue de l&apos;information</span> et le manque cruel de ressources centralisées. Des cours éparpillés, des examens introuvables...&rdquo;
              </blockquote>

              <p className="mt-3 text-sm sm:text-base font-bold text-blue-700 dark:text-cyan-300">
                &ldquo;Personne ne devrait avoir à galérer autant pour apprendre. C’est ainsi qu&apos;est né ESB Hub !&rdquo;
              </p>

              {/* 3 piliers concrets du post */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200/80 dark:border-white/10">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>Drive Organisé</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Centralisation par cycle (Licence, DSEB, Master) et annales complètes.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Visualiseur Intégré</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Lecture directe des PDF, Word, Excel et PPT sans téléchargement forcé.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Bibliothèque &amp; Thèses</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Ouvrages d&apos;économie, mémoires et thèses pour soutenir la recherche.
                  </p>
                </div>
              </div>

              {/* Stats réelles du post */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <Heart className="w-4 h-4 fill-current" />
                  +80 Recommandations LinkedIn
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <MessageCircle className="w-4 h-4" />
                  +20 Analyses et Débats
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Users className="w-4 h-4" />
                  Écosystème ESB, EHEC &amp; Banques
                </span>
              </div>

            </div>

          </div>
        </motion.div>

        {/* ── HOMMAGE AUX PILIERS DU PROJET (AYA BELOUCIF & SOHAIB IMARAZENE) ── */}
        <div className="mb-14 sm:mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Reconnaissance &amp; Solidarité
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Hommage aux Piliers d&apos;ESB Hub
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Deux contributeurs d&apos;exception remerciés nommément dans la publication pour leur générosité documentaire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pilier 1 : Aya Beloucif */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-950/20 via-white/80 to-blue-50/50 dark:from-blue-950/40 dark:via-[#070D19] dark:to-slate-900/60 border border-blue-200 dark:border-blue-500/30 shadow-lg relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                    AB
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Aya BELOUCIF</h4>
                      <a 
                        href="https://dz.linkedin.com/in/aya-beloucif-5391b822b" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#0077B5] hover:opacity-80"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
                      Credit Risk Analyst | Ex-Trader @ Bank of Algeria
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800 shrink-0">
                  Drive Original
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;Son Drive exhaustif a constitué le socle inestimable sur lequel repose l&apos;organisation des cours et examens des promotions antérieures. Un modèle d&apos;entraide pour toutes les générations de l&apos;ESB.&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-[#0077B5] dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Contributrice d&apos;Honneur
                  </span>
                  <span className="text-[11px] text-slate-400">
                    42 likes sur le commentaire
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Pilier 2 : Sohaib Imarazene */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/20 via-white/80 to-purple-50/50 dark:from-indigo-950/40 dark:via-[#070D19] dark:to-slate-900/60 border border-indigo-200 dark:border-indigo-500/30 shadow-lg relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                    SI
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Sohaib IMARAZENE</h4>
                      <a 
                        href="https://ca.linkedin.com/in/sohaib-imarazene-55931716a" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#0077B5] hover:opacity-80"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Parrain Documentaire &amp; Thèses Académiques
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800 shrink-0">
                  Bibliothèque
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;A fait don d&apos;une bibliothèque numérique de haut niveau : des dizaines d&apos;ouvrages de référence, d&apos;études de cas bancaires et de mémoires de fin d&apos;études au profit de toute la communauté.&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Donateur &amp; Mécène du Savoir
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Section Bibliothèque ESB
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── BARRE DE CONTRÔLE : FILTRES & RECHERCHE INSTANTANÉE ── */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Onglets Catégories */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-[#1E3A8A] dark:bg-blue-600 text-white shadow-md shadow-blue-900/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Moteur de Recherche */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un mot, nom, banque..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* ── GRILLE DES AVIS LINKEDIN ─────────────────── */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Quote className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Aucun avis ne correspond à votre recherche</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((item, idx) => (
                <ReviewCard 
                  key={item.id} 
                  review={item} 
                  index={idx}
                  isLiked={!!likedIds[item.id]}
                  onToggleLike={() => toggleLike(item.id)}
                  onOpenModal={() => setActiveModalReview(item)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── BANNIÈRE CALL-TO-ACTION & ÉCHANGES LINKEDIN ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-20 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0A1128] text-white shadow-2xl border border-blue-800/40 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Linkedin className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-3 border border-white/15">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Réseau &amp; Synergie Académique ESB</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
                Vous appartenez à l&apos;écosystème de l&apos;ESB ?
              </h3>
              <p className="text-blue-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                Prenez part à la discussion sur LinkedIn, partagez vos retours d&apos;expérience ou proposez vos cours, mémoires et études pour enrichir le fonds documentaire de l&apos;école.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a 
                href={LINKEDIN_POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0077B5] hover:bg-[#005E93] text-white font-bold text-xs transition-all duration-300 hover:scale-105 shadow-xl cursor-pointer"
              >
                <Linkedin className="w-4 h-4 fill-current" />
                <span>Participer au Débat LinkedIn</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              <a 
                href="mailto:info@esbhub.study?subject=Contribution%20Ressources%20ESB%20Hub" 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-xs transition-all duration-300 cursor-pointer"
              >
                <span>Proposer une Ressource</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── MODAL DE LECTURE DU TÉMOIGNAGE COMPLET ────── */}
      <AnimatePresence>
        {activeModalReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setActiveModalReview(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5 mb-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeModalReview.avatarGradient} flex items-center justify-center text-white font-black text-sm shadow-md`}>
                  {activeModalReview.avatarInitial}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                    {activeModalReview.name}
                    <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeModalReview.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-4 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[11px] font-semibold text-slate-400 ml-2">Avis Certifié sur LinkedIn</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                  {activeModalReview.fullComment}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <a
                  href={LINKEDIN_POST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0077B5] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>Voir le fil sur LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => setActiveModalReview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  )
}

function ReviewCard({ 
  review, 
  index, 
  isLiked, 
  onToggleLike,
  onOpenModal
}: { 
  review: LinkedInReview
  index: number
  isLiked: boolean
  onToggleLike: () => void 
  onOpenModal: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const categoryBadges = {
    Expert: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Contributeur: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-cyan-300 dark:border-blue-800',
    Etudiant: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
  }

  const isLong = review.fullComment.length > 130

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-3xl p-6 sm:p-7 bg-white/95 dark:bg-[#070D19]/90 border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-2xl hover:border-blue-400/40 dark:hover:border-cyan-400/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Dynamic Cursor Glow */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: isHovered 
            ? `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(56, 189, 248, 0.12), transparent 80%)`
            : ''
        }}
      />

      <div className="relative z-10">
        {/* Header Auteur */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${review.avatarGradient} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 border border-white/20`}>
              {review.avatarInitial}
            </div>
            <div>
              <a 
                href={review.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{review.name}</span>
                <Linkedin className="w-3 h-3 text-[#0077B5]" />
              </a>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1" title={review.role}>
                {review.role}
              </p>
              {review.institution && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold line-clamp-1">
                  {review.institution}
                </p>
              )}
            </div>
          </div>

          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${categoryBadges[review.category]}`}>
            {review.badge}
          </span>
        </div>

        {/* Note & Badge Vérifié */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0077B5] dark:text-blue-400">
            <CheckCircle2 className="w-3 h-3" />
            Vérifié sur LinkedIn
          </span>
        </div>

        {/* Citation & Commentaire */}
        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 italic mb-2 leading-snug">
          &ldquo;{review.quote}&rdquo;
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
          {review.fullComment}
        </p>

        {isLong && (
          <button
            onClick={onOpenModal}
            className="mt-1.5 text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            Lire la suite
          </button>
        )}
      </div>

      {/* Footer : Lien Post & Like */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <a
          href={LINKEDIN_POST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#0077B5] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Consulter</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button 
          onClick={onToggleLike}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isLiked
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/50'
          }`}
          title="Soutenir cet avis"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{review.likes + (isLiked ? 1 : 0)}</span>
        </button>
      </div>
    </motion.div>
  )
}


