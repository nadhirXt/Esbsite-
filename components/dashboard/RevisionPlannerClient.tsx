'use client'

import { motion } from 'framer-motion'
import { CalendarDays, Clock, Target } from 'lucide-react'

export default function RevisionPlannerClient({ userCycle, userId }: { userCycle?: any, userId?: string }) {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 bg-violet-500/10 rounded-2xl">
          <CalendarDays className="w-8 h-8 text-violet-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compagnon de Révision</h1>
          <p className="text-slate-500 mt-1">Planifiez vos sessions d'études et atteignez vos objectifs.</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]"
        >
          <Clock className="w-12 h-12 text-violet-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Chronomètre de DS</h3>
          <p className="text-slate-500 mb-6">Entraînez-vous dans les conditions réelles des examens.</p>
          <button className="px-6 py-2.5 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 rounded-xl font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
            Lancer un chrono
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 md:p-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl shadow-lg shadow-violet-500/20 text-white flex flex-col items-center justify-center text-center min-h-[300px]"
        >
          <Target className="w-12 h-12 text-violet-200 mb-4" />
          <h3 className="text-xl font-bold mb-2">Planning Intelligent</h3>
          <p className="text-violet-100 mb-6 max-w-sm">
            Bientôt : un assistant IA qui génère un planning de révision optimisé selon vos faiblesses.
          </p>
          <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
            Prochainement
          </span>
        </motion.div>
      </div>
    </div>
  )
}
