'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, ArrowRight, BookOpen, Calendar, ShieldCheck } from 'lucide-react'

interface WelcomeBannerProps {
  greeting: string;
  fullName: string;
  cycleBadge?: { label: string; color: string } | null;
}

export default function WelcomeBanner({ greeting, fullName, cycleBadge }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-[#070D19]/90 dark:bg-[#070D19]/95 backdrop-blur-2xl p-6 sm:p-8 md:p-10 text-white shadow-[0_0_40px_rgba(56,189,248,0.12)] mb-8 border border-cyan-500/30"
    >
      {/* Top cyan/amber laser line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-amber-500" />

      {/* Cyber Grid & Ambient orbs */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>École Supérieure de Banque</span>
            </span>
            <span className="text-xs font-mono text-slate-300">
              • {greeting}
            </span>
            <span className="hidden sm:inline text-xs font-mono text-slate-400">
              • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            {fullName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Bienvenue sur votre portail d&apos;études. Consultez vos polycopiés de cours, mémoires d&apos;Alumni et plannings pédagogiques.
          </p>
          
          {cycleBadge && (
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-xl border border-cyan-500/30 px-3.5 py-1 text-xs font-mono font-bold shadow-sm backdrop-blur-md bg-cyan-500/10 text-cyan-300">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                {cycleBadge.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Session académique en cours
              </span>
            </div>
          )}
        </div>
        
        {/* Quick action card on the right */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
          <Link 
            href="/dashboard/calendrier" 
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-cyan-500/25 hover:border-cyan-400 text-white text-xs font-mono font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.1)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Calendrier des examens</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
          <Link 
            href="/dashboard/bibliotheque" 
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-mono font-black shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Bibliothèque &amp; Mémoires</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

