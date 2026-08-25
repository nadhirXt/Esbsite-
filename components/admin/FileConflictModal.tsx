'use client'

import { useState } from 'react'
import { AlertTriangle, FileText, ArrowRight, Copy, RefreshCw, X, Check, XCircle } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import type { Document } from '@/lib/types'

export type ConflictResolution = 'replace' | 'rename' | 'skip'

interface FileConflictModalProps {
  isOpen: boolean
  onClose: () => void
  sourceDoc: Document
  existingDoc: Document
  targetLocation: {
    cycle: string
    year: number | null
    category: string
  }
  suggestedNewTitle: string
  onResolve: (resolution: ConflictResolution) => void
}

export default function FileConflictModal({
  isOpen,
  onClose,
  sourceDoc,
  existingDoc,
  targetLocation,
  suggestedNewTitle,
  onResolve,
}: FileConflictModalProps) {
  const [selectedOption, setSelectedOption] = useState<ConflictResolution>('replace')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 dark:bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-7 relative border border-slate-200 dark:border-white/10 animate-slide-up flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Le dossier contient déjà un fichier portant ce nom
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choisissez l&apos;action à effectuer pour ce fichier :
            </p>
          </div>
        </div>

        {/* File Comparison Card */}
        <div className="grid sm:grid-cols-2 gap-3 mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
          {/* Source Document */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Fichier source (déplacé)
            </span>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={sourceDoc.title}>
                {sourceDoc.title}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Créé le : {formatDate(sourceDoc.created_at)}
            </p>
          </div>

          {/* Existing Document */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Fichier déjà présent dans le dossier cible
            </span>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={existingDoc.title}>
                {existingDoc.title}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Créé le : {formatDate(existingDoc.created_at)}
            </p>
          </div>
        </div>

        {/* Action Choices (Windows Explorer / WinRAR style) */}
        <div className="space-y-2.5 mb-6">
          {/* Choice 1: Replace */}
          <button
            type="button"
            onClick={() => setSelectedOption('replace')}
            className={cn(
              "w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5",
              selectedOption === 'replace'
                ? "bg-blue-50/80 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl shrink-0 mt-0.5",
              selectedOption === 'replace' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            )}>
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Remplacer le fichier dans la destination
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Écrase l&apos;ancien fichier dans le dossier cible par celui que vous déplacez.
              </p>
            </div>
          </button>

          {/* Choice 2: Rename / Keep both */}
          <button
            type="button"
            onClick={() => setSelectedOption('rename')}
            className={cn(
              "w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5",
              selectedOption === 'rename'
                ? "bg-blue-50/80 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl shrink-0 mt-0.5",
              selectedOption === 'rename' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            )}>
              <Copy className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Conserver les deux fichiers (Renommer automatiquement)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Le fichier déplacé sera renommé en : <strong className="text-blue-600 dark:text-blue-400 font-semibold">« {suggestedNewTitle} »</strong>
              </p>
            </div>
          </button>

          {/* Choice 3: Skip */}
          <button
            type="button"
            onClick={() => setSelectedOption('skip')}
            className={cn(
              "w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5",
              selectedOption === 'skip'
                ? "bg-blue-50/80 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl shrink-0 mt-0.5",
              selectedOption === 'skip' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            )}>
              <XCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Ignorer ce fichier
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Le fichier ne sera pas déplacé et restera à son emplacement d&apos;origine.
              </p>
            </div>
          </button>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onResolve(selectedOption)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Confirmer l&apos;action
          </button>
        </div>
      </div>
    </div>
  )
}
