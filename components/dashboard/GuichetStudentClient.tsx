'use client'

import { motion } from 'framer-motion'
import { Ticket, Plus, MessageSquare } from 'lucide-react'

export default function GuichetStudentClient({ tickets, userCycle, userId }: { tickets?: any[], userCycle?: any, userId?: string }) {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-500/10 rounded-2xl">
            <Ticket className="w-8 h-8 text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guichet & Réclamations</h1>
            <p className="text-slate-500 mt-1">Soumettez vos demandes et réclamations à vos délégués.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-colors font-medium shadow-sm shadow-pink-500/20">
          <Plus className="w-5 h-5" />
          Nouveau Ticket
        </button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50"
      >
        <div className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-4">
          <MessageSquare className="w-10 h-10 text-pink-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Aucune réclamation active</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Vous n'avez soumis aucun ticket pour le moment. Cliquez sur "Nouveau Ticket" pour faire une demande.
        </p>
      </motion.div>
    </div>
  )
}
