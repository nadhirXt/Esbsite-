import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import {
  GraduationCap, TrendingUp, Users, Award, BookOpen,
  ArrowRight, CheckCircle, Building2, Star,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'ESB Hub — École Supérieure de Banque',
  description: 'Découvrez l\'École Supérieure de Banque (ESB). Formations Licence, DSEB et Master en banque et finance en Algérie.',
}

const STATS = [
  { value: '30+',   label: 'Années d\'excellence', icon: Award },
  { value: '5 000+', label: 'Diplômés',            icon: Users },
  { value: '3',     label: 'Cycles de formation',  icon: BookOpen },
  { value: '95%',   label: 'Taux d\'insertion',    icon: TrendingUp },
]

const FORMATIONS = [
  {
    cycle: 'Licence', duration: '3 ans',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    accent: 'bg-[#1E3A8A]',
    description: 'Formation fondamentale en sciences bancaires et financières. Développez des compétences solides en comptabilité, droit bancaire et gestion financière.',
    modules: ['Comptabilité générale', 'Droit bancaire', 'Techniques de crédit', 'Monnaie & Finance'],
  },
  {
    cycle: 'DSEB', duration: '4 ans',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: 'bg-[#A16207]',
    description: 'Le Diplôme Supérieur d\'Études Bancaires offre une formation approfondie pour former des cadres spécialisés dans tous les métiers de la banque.',
    modules: ['Analyse financière', 'Risques bancaires', 'Ingénierie financière', 'Management bancaire'],
  },
  {
    cycle: 'Master', duration: '2 ans',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: 'bg-[#581C87]',
    description: 'Formation de haut niveau orientée recherche et expertise. Accédez aux postes de direction et à la recherche appliquée en finance et banque.',
    modules: ['Finance quantitative', 'Recherche appliquée', 'Stratégie bancaire', 'Mémoire de fin d\'études'],
  },
]

const WHY_ESB = [
  'Corps professoral issu du secteur bancaire algérien',
  'Partenariats avec les grandes banques nationales',
  'Programme aligné sur les standards internationaux',
  'Stages professionnels intégrés au cursus',
  'Bibliothèque spécialisée en finance et droit',
  'Réseau alumni actif à travers tout le territoire',
]

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="overflow-x-hidden">
        {/* ── HERO ─────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A]">
          <div
            className="absolute inset-0 opacity-5"
            style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '32px 32px' }}
          />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A16207] to-transparent" />

          <div className="relative max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-blue-200 mb-8">
                <Star className="w-3.5 h-3.5 text-[#FCD34D]" />
                <span>École d&apos;excellence en Algérie</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Formez les{' '}
                <span className="text-[#FCD34D]">experts bancaires</span>{' '}
                de demain.
              </h1>
              <p className="text-lg text-blue-200 mb-10 leading-relaxed max-w-md">
                L&apos;École Supérieure de Banque propose des formations d&apos;excellence en Licence, DSEB et Master pour préparer les cadres du secteur financier algérien.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#formations">
                  <button className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-[#A16207] hover:bg-[#854d0e] text-white font-semibold transition-all duration-200 shadow-lg shadow-amber-900/30 hover:-translate-y-0.5 cursor-pointer">
                    Découvrir les formations <ArrowRight className="w-4 h-4" />
                  </button>
                </a>
                <Link href="/login">
                  <button className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium transition-all duration-200 cursor-pointer">
                    <GraduationCap className="w-4 h-4" /> Espace Étudiant
                  </button>
                </Link>
              </div>
            </div>

            <div className="animate-fade-in-up animate-delay-200 hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#A16207] rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">ESB Hub</p>
                    <p className="text-xs text-blue-300">Portail étudiant</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Cours disponibles', val: '240+', color: 'bg-blue-500' },
                    { label: 'Étudiants actifs',  val: '1 200', color: 'bg-amber-500' },
                    { label: 'Taux de réussite',  val: '92%',  color: 'bg-green-500' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.color}`} />
                        <span className="text-sm text-blue-200">{s.label}</span>
                      </div>
                      <span className="font-bold text-white">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#F8FAFC" />
            </svg>
          </div>
        </section>

        {/* ── STATS ──────────────────────────────── */}
        <section id="chiffres" className="bg-[#F8FAFC] py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#1E3A8A] mb-3 group-hover:bg-[#1E3A8A] group-hover:text-white transition-all duration-300">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
                  <p className="text-sm text-[#64748B]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORMATIONS ─────────────────────────── */}
        <section id="formations" className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[#A16207] uppercase tracking-wider mb-3">Nos cycles de formation</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">Choisissez votre parcours d&apos;excellence</h2>
              <p className="text-[#64748B] max-w-xl mx-auto">Des formations adaptées à chaque niveau, conçues pour répondre aux exigences du secteur bancaire algérien et international.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {FORMATIONS.map((f) => (
                <div key={f.cycle} className="group border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`h-1.5 ${f.accent}`} />
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-5">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${f.badge}`}>{f.cycle}</span>
                      <span className="text-xs text-[#64748B] font-medium">{f.duration}</span>
                    </div>
                    <p className="text-sm text-[#64748B] leading-relaxed mb-6">{f.description}</p>
                    <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-3">Modules clés</h3>
                    <ul className="space-y-2">
                      {f.modules.map((m) => (
                        <li key={m} className="flex items-center gap-2 text-sm text-[#374151]">
                          <CheckCircle className="w-3.5 h-3.5 text-[#A16207] shrink-0" /> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY ESB ────────────────────────────── */}
        <section id="presentation" className="bg-[#0F172A] py-24 text-white">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-sm font-semibold text-[#FCD34D] uppercase tracking-wider mb-3">Pourquoi choisir l&apos;ESB ?</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Une institution au service de l&apos;excellence financière</h2>
              <p className="text-slate-400 leading-relaxed">Depuis plus de 30 ans, l&apos;ESB forme les professionnels qui façonnent le secteur bancaire algérien. Nos diplômés occupent aujourd&apos;hui des postes de direction dans les plus grandes institutions financières du pays.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {WHY_ESB.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-5 py-3.5 transition-colors duration-200 border border-white/5">
                  <CheckCircle className="w-4 h-4 text-[#A16207] mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── A PROPOS ────────────────────────────────── */}
        <section id="apropos" className="bg-white py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="mb-12 text-center">
              <p className="text-sm font-semibold text-[#A16207] uppercase tracking-wider mb-3">L&apos;histoire derrière le projet</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">À propos</h2>
            </div>
            
            <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] rotate-12">
                <GraduationCap className="w-64 h-64 text-[#1E3A8A]" />
              </div>
              
              <div className="relative z-10 space-y-10 text-slate-600 leading-relaxed">
                <div>
                  <p className="text-lg text-slate-800 font-medium mb-4">
                    Bonjour et bienvenue ! Je suis Mohamed Nadhir Benelhadj, étudiant en 2ème année DSEB (Diplôme Supérieur d&apos;Études Bancaires) et créateur de cet espace.
                  </p>
                  <p>
                    Si ce site existe aujourd&apos;hui, c&apos;est avant tout à cause de mon propre parcours et des obstacles que j&apos;ai dû surmonter.
                  </p>
                </div>

                <div>
                  <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4">
                    <span className="text-2xl">🔄</span> De l&apos;ingénierie à l&apos;économie : Un grand saut
                  </h3>
                  <p className="mb-4">
                    Avant d&apos;intégrer l&apos;École Supérieure de Banque (ESB), j&apos;étais étudiant à l&apos;École Nationale Polytechnique d&apos;Oran (ENPO). J&apos;ai fait le choix de changer de voie, passant d&apos;un domaine purement technique à l&apos;univers complexe de l&apos;économie et de la finance.
                  </p>
                  <p>
                    Cette transition n&apos;a pas été facile. À mes débuts, j&apos;ai rencontré beaucoup de difficultés pour m&apos;adapter : le vocabulaire était différent, la logique académique changeait, et surtout, il était très difficile de trouver les bons cours et les bonnes ressources pour rattraper mon retard. C&apos;est cette période de doute et d&apos;adaptation intense qui a fait germer l&apos;idée de ce projet.
                  </p>
                </div>

                <div>
                  <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4">
                    <span className="text-2xl">🎯</span> Pourquoi cette plateforme ?
                  </h3>
                  <p className="mb-6">
                    Ayant déjà pris l&apos;habitude de structurer et centraliser les dossiers numériques et les ressources académiques pour notre promotion afin de nous entraider, j&apos;ai ressenti le besoin de créer un outil plus grand et plus pérenne. J&apos;ai conçu ce site avec trois objectifs précis en tête :
                  </p>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-[#A16207]" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Faciliter le quotidien étudiant</strong>
                        <span className="text-sm">Centraliser les cours, les ressources et les outils pour que les étudiants de l&apos;ESB ne perdent plus de temps à chercher l&apos;information.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-[#A16207]" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Créer un pont</strong>
                        <span className="text-sm">Aider les étudiants d&apos;autres écoles ou universités équivalentes qui suivent des formations similaires en économie et en banque.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-[#A16207]" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Offrir de la visibilité</strong>
                        <span className="text-sm">Donner un coup d&apos;œil concret et transparent sur notre formation à tous ceux qui sont curieux, aux futurs bacheliers, ou à ceux qui, comme moi, envisagent une reconversion.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4">
                    <span className="text-2xl">🤝</span> Avancer ensemble
                  </h3>
                  <p className="mb-6">
                    Je sais ce que c&apos;est que de se sentir perdu face à de nouvelles matières. Ce site est ma façon de m&apos;assurer que les futurs étudiants auront un point de repère solide dès leur premier jour. J&apos;espère que cette plateforme vous fera gagner un temps précieux et facilitera votre réussite.
                  </p>
                  <div className="pt-6 border-t border-slate-200">
                    <p className="font-medium text-slate-800 mb-2">Excellente navigation à toutes et à tous !</p>
                    <p className="text-[#A16207] font-bold signature">— Mohamed Nadhir Benelhadj</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────── */}
        <section id="contact" className="bg-gradient-to-r from-[#1E3A8A] to-[#0F172A] py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-6">
            <GraduationCap className="w-12 h-12 text-[#FCD34D] mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Prêt à rejoindre l&apos;ESB ?</h2>
            <p className="text-blue-200 mb-8">Accédez à votre espace étudiant et consultez vos cours, ressources et documents pédagogiques.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <button className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-[#A16207] hover:bg-[#854d0e] text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-lg cursor-pointer">
                  Créer un compte <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/login">
                <button className="inline-flex items-center gap-2 h-12 px-8 rounded-xl border border-white/30 hover:bg-white/10 text-white font-medium transition-all duration-200 cursor-pointer">
                  Se connecter
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  )
}
