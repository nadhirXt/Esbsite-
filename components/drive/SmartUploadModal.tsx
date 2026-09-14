'use client'

import { useState } from 'react'
import { 
  Upload, X, AlertTriangle, Check, FileText, Trash2, 
  Sparkles, RefreshCw, Copy, Ban, Folder, ChevronRight, Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SmartFileItem, AcademicType } from '@/lib/upload/smart-upload'
import Button from '@/components/ui/Button'

interface SmartUploadModalProps {
  isOpen: boolean
  onClose: () => void
  items: SmartFileItem[]
  onUpdateItem: (id: string, updates: Partial<SmartFileItem>) => void
  onRemoveItem: (id: string) => void
  onStartUpload: (itemsToUpload: SmartFileItem[]) => void
  targetLocation: {
    cycle: string
    year: number | null
    category: string
  }
}

const ACADEMIC_TYPES: AcademicType[] = [
  'Cours', 'TD', 'TP', 'Examen', 'Corrigé', 'Rattrapage', 'Fiche / Résumé', 'Syllabus', 'Autre'
]

export default function SmartUploadModal({
  isOpen,
  onClose,
  items,
  onUpdateItem,
  onRemoveItem,
  onStartUpload,
  targetLocation,
}: SmartUploadModalProps) {
  const [selectedTypeMenu, setSelectedTypeMenu] = useState<string | null>(null)

  if (!isOpen || items.length === 0) return null

  const conflictCount = items.filter(i => i.isConflict).length
  const totalSizeFormatted = items.reduce((acc, curr) => acc + (curr.file.size || 0), 0)

  // Bulk actions for conflicts
  const handleBulkConflictAction = (action: 'replace' | 'rename' | 'skip') => {
    items.forEach(item => {
      if (item.isConflict) {
        onUpdateItem(item.id, { conflictAction: action })
      }
    })
  }

  const handleLaunch = () => {
    // Filtrer les fichiers marqués "skip"
    const validItems = items.filter(item => !item.isConflict || item.conflictAction !== 'skip')
    if (validItems.length === 0) {
      alert('Aucun fichier à uploader (tous les fichiers en conflit sont ignorés).')
      return
    }
    onStartUpload(validItems)
  }

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 dark:bg-black/80 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative border border-slate-200 dark:border-white/10 animate-slide-up overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload Intelligent ({items.length} fichier{items.length > 1 ? 's' : ''})
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Folder className="w-3.5 h-3.5 text-slate-400" />
              <span>Destination :</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 uppercase">{targetLocation.cycle}</span>
              {targetLocation.year && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">A{targetLocation.year}</span>
                </>
              )}
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-blue-600 dark:text-blue-400">{targetLocation.category || 'Général'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Notification Banner if any */}
        {conflictCount > 0 && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{conflictCount} fichier{conflictCount > 1 ? 's existent' : ' existe'} déjà dans ce dossier :</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleBulkConflictAction('rename')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold hover:bg-amber-100/50 transition-all flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Tout renommer auto
              </button>
              <button
                type="button"
                onClick={() => handleBulkConflictAction('replace')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold hover:bg-amber-100/50 transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Tout remplacer
              </button>
              <button
                type="button"
                onClick={() => handleBulkConflictAction('skip')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-amber-100/50 transition-all flex items-center gap-1"
              >
                <Ban className="w-3 h-3" />
                Tout ignorer
              </button>
            </div>
          </div>
        )}

        {/* Scrollable List of Files */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 rounded-2xl border transition-all flex flex-col gap-3 relative",
                item.isConflict 
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60" 
                  : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900"
              )}
            >
              <div className="flex items-start gap-3 justify-between">
                {/* File Icon & Main Fields */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Title Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.cleanTitle}
                        onChange={(e) => onUpdateItem(item.id, { cleanTitle: e.target.value })}
                        className="flex-1 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Titre du document..."
                      />
                      
                      {/* Type Badge Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setSelectedTypeMenu(selectedTypeMenu === item.id ? null : item.id)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Tag className="w-3 h-3" />
                          {item.detectedType}
                        </button>

                        {selectedTypeMenu === item.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 animate-in fade-in">
                            {ACADEMIC_TYPES.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  onUpdateItem(item.id, { detectedType: type })
                                  setSelectedTypeMenu(null)
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                                  item.detectedType === type ? "text-blue-600 font-bold" : "text-slate-700 dark:text-slate-300"
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="truncate max-w-[240px]" title={item.originalName}>
                        Nom d&apos;origine : {item.originalName}
                      </span>
                      <span>•</span>
                      <span>{item.sizeFormatted}</span>
                      {item.detectedSemester && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                            {item.detectedSemester}
                          </span>
                        </>
                      )}
                      {item.targetCategory !== targetLocation.category && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Sous-dossier : {item.targetCategory}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors shrink-0"
                  title="Retirer de l'upload"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Conflict Action Selector */}
              {item.isConflict && (
                <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-amber-800 dark:text-amber-300 font-medium">
                    ⚠️ Ce fichier existe déjà dans le dossier cible
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateItem(item.id, { conflictAction: 'rename' })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border font-semibold text-xs transition-all flex items-center gap-1",
                        item.conflictAction === 'rename'
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <Copy className="w-3 h-3" />
                      Renommer en « {item.suggestedNewTitle} »
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateItem(item.id, { conflictAction: 'replace' })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border font-semibold text-xs transition-all flex items-center gap-1",
                        item.conflictAction === 'replace'
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Remplacer
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateItem(item.id, { conflictAction: 'skip' })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border font-semibold text-xs transition-all flex items-center gap-1",
                        item.conflictAction === 'skip'
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <Ban className="w-3 h-3" />
                      Ignorer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {items.length} document{items.length > 1 ? 's' : ''} prêt{items.length > 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleLaunch}
              className="flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Upload className="w-4 h-4" />
              Lancer l&apos;upload ({items.filter(i => !i.isConflict || i.conflictAction !== 'skip').length})
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

