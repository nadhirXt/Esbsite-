'use client'

import { motion } from 'framer-motion'
import { Shield, Sparkles } from 'lucide-react'

export default function AdminWelcomeBanner() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-3xl bg-slate-900/90 dark:bg-[#070D19]/90 backdrop-blur-2xl text-white p-8 md:p-10 mb-10 shadow-2xl border border-amber-500/20 dark:border-amber-500/20"
    >
      {/* Laser line accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
      <div className="absolute -inset-px rounded-3xl pointer-events-none border border-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]" />

      {/* Decorative Cyber Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute inset-0 cyber-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="space-y-4 max-w-2xl">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-amber-300 uppercase">SYS_ADMIN // CENTRE DE CONTRÔLE</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
            Bienvenue dans l'espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">Administration</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed font-normal">
            Gérez facilement l'ensemble de votre établissement : étudiants, professeurs, documents et requêtes. 
            Vous avez le contrôle total.
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="hidden lg:flex items-center justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-blue-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative h-full w-full bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
