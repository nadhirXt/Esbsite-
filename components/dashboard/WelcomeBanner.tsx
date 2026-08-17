'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

interface WelcomeBannerProps {
  greeting: string;
  fullName: string;
  cycleBadge?: { label: string; color: string } | null;
}

export default function WelcomeBanner({ greeting, fullName, cycleBadge }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-8 sm:p-10 text-white shadow-2xl shadow-blue-900/20 mb-10"
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2 mb-2"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <p className="text-blue-200 font-medium tracking-wide uppercase text-sm">{greeting}</p>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 drop-shadow-md"
          >
            {fullName}
          </motion.h1>
          
          {cycleBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <span className={`inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur-md bg-white/10 ${cycleBadge.color.replace('bg-', 'text-').replace('text-', 'text-')}`}>
                {cycleBadge.label}
              </span>
            </motion.div>
          )}
        </div>
        
        {/* Optional quick action or graphic on the right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="hidden sm:flex flex-col items-end"
        >
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
            <p className="text-sm text-blue-200 mb-1">Votre Espace Personnel</p>
            <p className="text-lg font-semibold text-white">Prêt à apprendre ?</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
