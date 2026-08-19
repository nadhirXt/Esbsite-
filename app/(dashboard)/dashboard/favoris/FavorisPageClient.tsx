'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import CycleDocumentsClient from '@/components/dashboard/CycleDocumentsClient'
import type { Document } from '@/lib/types'

export default function FavorisPageClient({ documents, favoriteDocsIds }: { documents: Document[], favoriteDocsIds: string[] }) {
  if (documents.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Aucun favori pour le moment
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Vous n'avez pas encore ajouté de documents à vos favoris. 
          Parcourez vos cours et cliquez sur l'icône cœur pour les retrouver ici.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mes Favoris</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Retrouvez rapidement vos documents importants sauvegardés
          </p>
        </div>
      </div>
      
      {/* We reuse CycleDocumentsClient, passing all the docs. 
          It will show them since we aren't restricting it to a specific cycle 
          other than for UI labels, so we'll use a virtual 'favoris' cycle. */}
      <CycleDocumentsClient 
        cycle="favoris" 
        cycleLabel="Tous vos documents" 
        documents={documents}
        favoriteDocsIds={favoriteDocsIds}
      />
    </div>
  )
}
