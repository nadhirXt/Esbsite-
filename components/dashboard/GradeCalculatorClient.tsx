'use client'

import { motion } from 'framer-motion'
import { Calculator, BarChart3 } from 'lucide-react'

export default function GradeCalculatorClient({ userCycle }: { userCycle?: any }) {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 bg-emerald-500/10 rounded-2xl">
          <Calculator className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calculateur de Moyenne</h1>
          <p className="text-slate-500 mt-1">Simulez vos notes et suivez votre progression académique.</p>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50"
      >
        <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
          <BarChart3 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Simulateur en développement</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Cet outil vous permettra bientôt de calculer automatiquement votre moyenne en fonction de vos modules et coefficients.
        </p>
      </motion.div>
    </div>
  )
}
