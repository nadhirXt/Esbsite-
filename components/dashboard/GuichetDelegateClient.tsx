'use client'

import { motion } from 'framer-motion'
import { Ticket, Users, CheckCircle } from 'lucide-react'

export default function GuichetDelegateClient({ tickets, delegateCycle, delegateYear }: { tickets?: any[], delegateCycle?: any, delegateYear?: any }) {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 bg-amber-500/10 rounded-2xl">
          <Users className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guichet Délégué (Admin)</h1>
          <p className="text-slate-500 mt-1">Gérez les réclamations et demandes des étudiants de votre classe.</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "En attente", value: "0", color: "text-slate-500", icon: Ticket },
          { title: "En cours", value: "0", color: "text-amber-500", icon: Users },
          { title: "Résolus", value: "0", color: "text-emerald-500", icon: CheckCircle },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
              <h4 className="text-3xl font-bold">{stat.value}</h4>
            </div>
            <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50"
      >
        <Ticket className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucun ticket pour le moment</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Les tickets soumis par les étudiants apparaîtront ici pour que vous puissiez les traiter.
        </p>
      </motion.div>
    </div>
  )
}
