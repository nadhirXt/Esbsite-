'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, Quote, Building2, GraduationCap, CheckCircle2, 
  Sparkles, ArrowRight, Heart, ExternalLink, MessageCircle,
  Award, Users, BookOpen
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
  category: 'Etudiant' | 'Expert' | 'Contributeur'
  linkedinUrl: string
  avatarInitial: string
  avatarGradient: string
  rating: number
  quote: string
  fullComment: string
  badge: string
  likes: number
}

const LINKEDIN_POST_URL = "https://www.linkedin.com/feed/update/urn:li:activity:7493115959113601024/"

const REAL_REVIEWS: LinkedInReview[] = [
  {
    id: '1',
    name: 'Rachid Sekak MBE',
    role: 'Expert Financier & Ancien Directeur de Banque',
    category: 'Expert',
    linkedinUrl: 'https://dz.linkedin.com/in/rachid-sekak-mbe-0453a524',
    avatarInitial: 'RS',
    avatarGradient: 'from-amber-600 to-yellow-500',
    rating: 5,
    quote: 'Votre initiative est méritoire et à encourager. Bravo !',
    fullComment: 'Le manque criant d\'informations économiques notamment sur le secteur bancaire est un très gros handicap pour l\'apprentissage du métier de banquier. Sur ce volet je vous promets une aide de ma part car votre initiative est méritoire et à encourager. Bravo.',
    badge: 'Expert International',
    likes: 34
  },
  {
    id: '2',
    name: 'Aya BELOUCIF',
    role: 'Credit Risk Analyst | Ex-Trader @ Bank of Algeria',
    category: 'Contributeur',
    linkedinUrl: 'https://dz.linkedin.com/in/aya-beloucif-5391b822b',
    avatarInitial: 'AB',
    avatarGradient: 'from-blue-600 to-cyan-500',
    rating: 5,
    quote: 'Bravo, bravo et BRAVO Mouhamed pour cette belle réalisation !',
    fullComment: 'Bravo, bravo et BRAVO Mouhamed pour cette belle réalisation ! Je suis tellement contente et fière d’avoir pu contribuer à ce projet. Étant donné que c’était l’une des choses que je voulais concrétiser à l’ESB, ça me fait vraiment plaisir de voir le projet prendre vie. Bravo encore une fois ! Le but, c’est vraiment de rendre les études plus faciles et moins inquiétantes pour les nouvelles générations de l\'ESB ! Merci encore et bonne continuation ! Et si jamais vous avez besoin de quoi que se soit n’hésitez surtout pas !',
    badge: 'Credit Risk Analyst & Ex-Trader',
    likes: 42
  },
  {
    id: '3',
    name: 'Lina Bekhouche',
    role: 'FX SALES Salle des Marchés • BNP Paribas EL DJAZAÏR',
    category: 'Expert',
    linkedinUrl: 'https://dz.linkedin.com/in/lina-bekhouche-954930198',
    avatarInitial: 'LB',
    avatarGradient: 'from-teal-600 to-emerald-500',
    rating: 5,
    quote: 'Excellente idée et initiative à l\'école, c\'est ce dont l\'ESB avait besoin 👏',
    fullComment: 'Franchement bravo 👏 excellente idée et Initiative a l\'école , c ce que l\'ESB avait besoin , bon continuation à toi !',
    badge: 'FX Sales @ BNP Paribas',
    likes: 29
  },
  {
    id: '4',
    name: 'Aya BENABDESSELAM',
    role: 'Credit Analyst Large Corporates • Société Générale Algérie',
    category: 'Expert',
    linkedinUrl: 'https://dz.linkedin.com/in/aya-benabdesselam-332918239',
    avatarInitial: 'AB',
    avatarGradient: 'from-purple-600 to-pink-500',
    rating: 5,
    quote: 'Bravo, excellent travail !',
    fullComment: 'Bravo, excellent travail ! Une ressource précieuse pour tous les étudiants et diplômés.',
    badge: 'Credit Analyst @ SG Algérie',
    likes: 25
  },
  {
    id: '5',
    name: 'Mohamed Bey Benhadj',
    role: 'Étudiant @ École Supérieure de Banque (ESB)',
    category: 'Etudiant',
    linkedinUrl: 'https://dz.linkedin.com/in/mohamed-bey-benhadj-1218a02a1',
    avatarInitial: 'MB',
    avatarGradient: 'from-blue-700 to-indigo-600',
    rating: 5,
    quote: 'Un excellent travail et une initiative qui mérite d’être encouragée. 👏🏼',
    fullComment: 'Bravo Nadhir ! Un excellent travail et une initiative qui mérite d’être encouragée. 👏🏼',
    badge: 'Étudiant ESB',
    likes: 23
  },
  {
    id: '6',
    name: 'Ghada Sahraoui',
    role: 'PhD Student / English Teacher / Translator',
    category: 'Expert',
    linkedinUrl: 'https://dz.linkedin.com/in/ghada-sahraoui-23b60a181',
    avatarInitial: 'GS',
    avatarGradient: 'from-rose-600 to-orange-500',
    rating: 5,
    quote: 'Your pioneering mindset will take you places Nadhir 👏🏻👏🏻',
    fullComment: 'Your pioneering mindset will take you places Nadhir 👏🏻👏🏻 Une démarche visionnaire pour toute la communauté.',
    badge: 'Doctorante & Enseignante',
    likes: 24
  },
  {
    id: '7',
    name: 'Mostefaoui Nessrine Rania',
    role: 'Étudiante à EHEC • Membre ALUMNI HEC (Relations Publiques)',
    category: 'Etudiant',
    linkedinUrl: 'https://dz.linkedin.com/in/mostefaoui-nessrine-rania-94555a2a1',
    avatarInitial: 'MN',
    avatarGradient: 'from-violet-600 to-fuchsia-500',
    rating: 5,
    quote: 'Transformer une difficulté vécue en une solution pour aider les autres est admirable.',
    fullComment: 'Je suis vraiment fière de vous, pour avoir transformé une difficulté personnelle en un projet aussi utile. Voir un problème, le vivre soi-même et décider de créer une solution pour aider les autres, c’est une démarche vraiment admirable. Beaucoup de courage pour la suite !',
    badge: 'Étudiante EHEC / ALUMNI HEC',
    likes: 27
  },
  {
    id: '8',
    name: 'Khraili Ikram',
    role: 'Étudiante ESB',
    category: 'Etudiant',
    linkedinUrl: 'https://dz.linkedin.com/in/khraili-ikram-8a103b2b9',
    avatarInitial: 'KI',
    avatarGradient: 'from-emerald-600 to-teal-500',
    rating: 5,
    quote: 'Exactement ce dont on avait besoin pour les études, les stages et les mémoires.',
    fullComment: 'Bravo pour cette belle initiative 👏🏻 Un site vraiment utile pour les étudiants de toutes les promos, exactement ce dont on avait besoin que ce soit pour les études, les stages ou les mémoires. Merci pour ce travail et pour le partage !',
    badge: 'Étudiante ESB',
    likes: 22
  },
  {
    id: '9',
    name: 'Sohaib IMARAZENE',
    role: 'Parrain de la Section Bibliothèque & Mémoires',
    category: 'Contributeur',
    linkedinUrl: 'https://ca.linkedin.com/in/sohaib-imarazene-55931716a',
    avatarInitial: 'SI',
    avatarGradient: 'from-indigo-600 to-blue-500',
    rating: 5,
    quote: 'Un fonds documentaire d\'exception partagé pour la communauté.',
    fullComment: 'Une immense collection d\'ouvrages d\'économie, de rapports professionnels et de mémoires mise à la disposition de tous les étudiants pour dynamiser la recherche appliquée et l\'excellence bancaire.',
    badge: 'Parrain Bibliothèque',
    likes: 31
  },
  {
    id: '10',
    name: 'Madjid Debbouze',
    role: 'Étudiant / Professionnel',
    category: 'Etudiant',
    linkedinUrl: 'https://dz.linkedin.com/in/madjid-debbouze-9a5302361',
    avatarInitial: 'MD',
    avatarGradient: 'from-slate-700 to-slate-900',
    rating: 5,
    quote: 'Tu as identifié un vrai besoin et tu as su le transformer en projet concret.',
    fullComment: 'Bravo Nadhir pour cette belle initiative. Tu as identifié un vrai besoin et tu as su le transformer en un projet concret et utile pour les étudiants. Beaucoup de courage pour la suite 👏👏',
    badge: 'Communauté ESB',
    likes: 19
  },
  {
    id: '11',
    name: 'Samah Alliaoui',
    role: 'Étudiante ESB',
    category: 'Etudiant',
    linkedinUrl: 'https://dz.linkedin.com/in/samah-alliaoui-2240a1366',
    avatarInitial: 'SA',
    avatarGradient: 'from-violet-600 to-indigo-600',
    rating: 5,
    quote: 'Bravo pour ce travail ingénieux au service de la réussite de tous.',
    fullComment: 'Bravo pour ce travail ingénieux 👏 Continue à être cette personne brillante et exceptionnelle que tu es !',
    badge: 'Étudiante ESB',
    likes: 20
  }
]

export default function AlumniFeedbacks() {
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({})

  const toggleLike = (id: string) => {
    setLikedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section id="feedbacks" className="py-20 sm:py-28 relative overflow-hidden bg-slate-50/70 dark:bg-[#070D19] border-t border-slate-200/80 dark:border-slate-800/80">
      {/* ── AMBIENT PARTICLES & GLOW ─────────────────── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-r from-amber-500/10 via-blue-600/10 to-amber-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-96 h-96 bg-blue-600/5 dark:bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── HEADER ──────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[#0077B5] dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
          >
            <Linkedin className="w-3.5 h-3.5 fill-current" />
            Témoignages Réels & Retours LinkedIn
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Ce que dit la communauté sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077B5] via-blue-600 to-[#A16207] dark:from-blue-400 dark:via-blue-300 dark:to-amber-400">ESB Hub</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Extraits authentiques des réactions, encouragements et retours d&apos;expérience publiés par les étudiants de l&apos;ESB et les professionnels de la finance.
          </motion.p>

          {/* ── STATS LINKEDIN POST ────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto"
          >
            <a 
              href={LINKEDIN_POST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-[#0077B5] transition-all duration-300 text-xs font-semibold text-slate-700 dark:text-slate-200 group"
            >
              <Linkedin className="w-4 h-4 text-[#0077B5] group-hover:scale-110 transition-transform" />
              <span>Post LinkedIn Officiel</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>+80 Réactions</span>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span>+20 Commentaires</span>
            </div>
          </motion.div>
        </div>

        {/* ── REVIEWS GRID ────────────────────────────── */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {REAL_REVIEWS.map((item, idx) => (
              <ReviewCard 
                key={item.id} 
                review={item} 
                index={idx}
                isLiked={!!likedIds[item.id]}
                onToggleLike={() => toggleLike(item.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── CALLOUT / JOIN LINKEDIN ─────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-20 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#0A2540] to-[#1E3A8A] dark:from-[#0B132B] dark:to-[#1C2541] text-white shadow-2xl border border-blue-800/40 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Linkedin className="w-56 h-56 text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Rejoignez la discussion
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Vous avez testé la plateforme ESB Hub ?</h3>
              <p className="text-blue-200 text-sm sm:text-base max-w-xl">
                Ajoutez votre commentaire sur LinkedIn ou envoyez-nous votre retour pour figurer parmi les avis officiels du site.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a 
                href={LINKEDIN_POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0077B5] hover:bg-[#005E93] text-white font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg shrink-0 cursor-pointer"
              >
                <Linkedin className="w-4 h-4 fill-current" />
                Voir le post LinkedIn <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
              <a 
                href="mailto:info@esbhub.study?subject=Avis%20ESB%20Hub" 
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium text-sm transition-all duration-300 shrink-0 cursor-pointer"
              >
                Écrire par email <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

function ReviewCard({ 
  review, 
  index, 
  isLiked, 
  onToggleLike 
}: { 
  review: LinkedInReview
  index: number
  isLiked: boolean
  onToggleLike: () => void 
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
    Expert: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Contributeur: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    Etudiant: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#10192C] border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
    >
      {/* ── 3D MOUSE GLOW OVERLAY ─────────────────── */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: isHovered 
            ? `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(0, 119, 181, 0.12), transparent 80%)`
            : ''
        }}
      />

      <div>
        {/* ── AUTHOR HEADER ───────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${review.avatarGradient} flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 border border-white/20`}>
              {review.avatarInitial}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <a 
                  href={review.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-[#0077B5] dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                >
                  {review.name}
                  <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                </a>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1" title={review.role}>
                {review.role}
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${categoryBadges[review.category]}`}>
            {review.badge}
          </span>
        </div>

        {/* ── RATING & LINKEDIN VERIFIED ──────────── */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0077B5] dark:text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Commentaire vérifié
          </span>
        </div>

        {/* ── QUOTE & FULL TEXT ────────────────────── */}
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 italic mb-2 leading-snug">
          &ldquo;{review.quote}&rdquo;
        </p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed">
          {review.fullComment}
        </p>
      </div>

      {/* ── FOOTER: LINK TO POST & LIKES ──────────── */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <a
          href={LINKEDIN_POST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#0077B5] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Voir sur LinkedIn</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button 
          onClick={onToggleLike}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isLiked
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/50'
          }`}
          title="Approuver"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{review.likes + (isLiked ? 1 : 0)}</span>
        </button>
      </div>
    </motion.div>
  )
}
