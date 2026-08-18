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
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 md:p-10 mb-10 shadow-2xl border border-white/10"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="space-y-4 max-w-2xl">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold tracking-wide text-amber-100 uppercase">Centre de Contrôle</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
            Bienvenue dans l'espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Administration</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-blue-100/80 text-base md:text-lg max-w-xl leading-relaxed">
            Gérez facilement l'ensemble de votre établissement : étudiants, professeurs, documents et requêtes. 
            Vous avez le contrôle total.
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="hidden lg:flex items-center justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative h-full w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
              <Sparkles className="w-12 h-12 text-amber-300" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
