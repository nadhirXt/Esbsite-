'use client'

import { motion } from 'framer-motion'
import { BookOpen, Search } from 'lucide-react'

export default function AnnalesClient({ documents, userCycle }: { documents?: any[], userCycle?: any }) {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <BookOpen className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Annales & Bibliothèque</h1>
            <p className="text-slate-500 mt-1">Consultez les anciens examens pour mieux préparer vos révisions.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher une épreuve..."
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full md:w-64"
          />
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50"
      >
        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <BookOpen className="w-10 h-10 text-indigo-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Module en cours de construction</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Nous préparons actuellement la base de données des annales. Elles seront disponibles très bientôt !
        </p>
      </motion.div>
    </div>
  )
}
