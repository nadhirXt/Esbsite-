'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import {
  ShieldCheck, Compass, ArrowRight, GraduationCap,
  FileText, Users, Library, ChevronRight, ChevronDown, Sparkles,
  MapPin, Award
} from 'lucide-react'
import CountUp from '@/components/ui/CountUp'

interface HeroSectionProps {
  totalDocs: number
  totalUsers: number
  uniqueCategories: number
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.10, delayChildren: 0.1 } }
}

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } }
}

const fadeUpDelay = (delay: number): Variants => ({
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const } }
})

export default function HeroSection({ totalDocs, totalUsers, uniqueCategories }: HeroSectionProps) {
  return (
    <section
      id="presentation"
      className="relative min-h-[92dvh] flex items-center bg-gradient-to-b from-[#030712] via-[#070D19] to-[#0A1633] text-white py-16 sm:py-24 md:py-28 overflow-hidden"
    >
      {/* High-Tech Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #38BDF8 1px, transparent 0)`, backgroundSize: '32px 32px' }}
      />

      {/* Cybernetic Laser Top Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent opacity-80" />
      
      {/* Dynamic Ambient Glow Orbs */}
      <motion.div
        className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none"
        animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

        {/* ── LEFT CONTENT (7 cols) ────────────── */}
        <motion.div
          className="lg:col-span-7 space-y-6 sm:space-y-8"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Brow Badge */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs sm:text-sm text-cyan-200 backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold tracking-wide">
                Direction Générale de la Banque d&apos;Algérie • Créée en 1995
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white"
          >
            L&apos;Excellence Bancaire &amp; Financière au{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              Cœur de l&apos;Algérie
            </span>
          </motion.h1>

          {/* Pitch */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal"
          >
            L&apos;École Supérieure de Banque (ESB) est l&apos;institution de référence dédiée à la formation des cadres dirigeants, analystes de crédit, auditeurs et opérateurs de marchés financiers à travers ses cycles certifiés : <strong className="text-white font-semibold">Licence</strong>, <strong className="text-white font-semibold">DSEB</strong> et <strong className="text-white font-semibold">Master</strong>.
          </motion.p>

          {/* Strategic CTAs — hiérarchie claire */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3.5 pt-2">
            {/* PRIMARY — cyber amber */}
            <Link href="/register">
              <motion.span
                className="inline-flex items-center gap-2.5 h-13 px-7 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm transition-all duration-200 shadow-xl shadow-amber-500/30 cursor-pointer select-none border border-amber-300/40"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GraduationCap className="w-4.5 h-4.5" />
                Rejoindre le Portail
              </motion.span>
            </Link>

            {/* SECONDARY — cyber blue */}
            <Link href="#formations">
              <motion.span
                className="inline-flex items-center gap-2.5 h-13 px-6 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-white font-bold text-sm transition-all duration-200 shadow-lg border border-blue-400/40 cursor-pointer select-none backdrop-blur-md"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Découvrir les Formations</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </motion.span>
            </Link>

            {/* TERTIARY — ghost text */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 h-13 px-4 rounded-xl text-slate-300 hover:text-white text-sm font-semibold transition-colors hover:bg-white/10"
            >
              <span>Connexion</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Location & Meta */}
          <motion.div
            variants={fadeUp}
            className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">Bouzaréah, Alger (Forêt de Baïnem)</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">Diplômes d&apos;État &amp; Spécialisations Bancaires</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT SHOWCASE CARD (5 cols) ────── */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative rounded-3xl p-6 sm:p-8 bg-[#070D19]/80 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-950/40 space-y-6 overflow-hidden">
            {/* Top glowing laser line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            {/* Subtle background gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Card */}
            <div className="relative z-10 flex items-center gap-4 pb-5 border-b border-white/10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-amber-900/20 shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1 leading-none mb-1">
                  <span className="text-xl font-black text-white">ESB</span>
                  <span className="text-xl font-bold text-sky-400">Hub</span>
                </div>
                <h2 className="text-xs font-mono text-slate-400">
                  Système d&apos;Information Académique
                </h2>
              </div>
            </div>

            {/* Live Metrics — count-up animé */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Documents &amp; Mémoires</p>
                    <p className="text-[11px] text-slate-400">Ressources pédagogiques indexées</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-lg text-cyan-300">
                  {totalDocs > 0 ? <CountUp to={totalDocs} suffix="+" /> : '500+'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/30 hover:bg-white/[0.07] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Étudiants &amp; Cadres inscrits</p>
                    <p className="text-[11px] text-slate-400">Licence, DSEB, Master &amp; Alumni</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-lg text-amber-300">
                  {totalUsers > 0 ? <CountUp to={totalUsers} suffix="+" /> : '900+'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Library className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Spécialités Couvertes</p>
                    <p className="text-[11px] text-slate-400">Finance, Audit, Régulation, Risques</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-lg text-emerald-300">
                  {uniqueCategories > 0 ? `${uniqueCategories} Thématiques` : '3 Cycles'}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="relative z-10 pt-2 flex items-center justify-between text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Session 2026–2027
              </span>
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition-colors">
                <span>Ouvrir l&apos;espace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 cursor-pointer select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => document.getElementById('chiffres')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold">Défiler</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Curved Transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" className="fill-[#F8FAFC] dark:fill-[#070D19]" />
        </svg>
      </div>
    </section>
  )
}
