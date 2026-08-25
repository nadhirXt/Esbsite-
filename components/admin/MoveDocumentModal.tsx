'use client'

import { useState, useMemo } from 'react'
import { Folder, FolderOpen, FolderInput, ArrowRight, CornerDownRight, Check, X, Loader2, Plus } from 'lucide-react'
import { CYCLES, cn } from '@/lib/utils'
import type { Document } from '@/lib/types'

interface MoveDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'file' | 'folder'
  itemTitle: string
  sourceCycle: string
  sourceYear: number | null
  sourceCategory: string
  allDocuments: Document[]
  isDelegate?: boolean
  onConfirmMove: (targetCycle: string, targetYear: number | null, targetCategory: string) => Promise<void>
}

export default function MoveDocumentModal({
  isOpen,
  onClose,
  type,
  itemTitle,
  sourceCycle,
  sourceYear,
  sourceCategory,
  allDocuments,
  isDelegate = false,
  onConfirmMove,
}: MoveDocumentModalProps) {
  const [targetCycle, setTargetCycle] = useState(sourceCycle)
  const isNoYearCycle = targetCycle === 'memoires' || targetCycle === 'bibliotheque'
  const [targetYear, setTargetYear] = useState<number | null>(isNoYearCycle ? null : (sourceYear || 1))
  const [selectedFolder, setSelectedFolder] = useState<string>('Général')
  const [isCustomFolder, setIsCustomFolder] = useState(false)
  const [customFolderName, setCustomFolderName] = useState('')
  const [loading, setLoading] = useState(false)

  // Compute existing folders for targetCycle and targetYear
  const availableFolders = useMemo(() => {
    const foldersSet = new Set<string>()
    foldersSet.add('Général')

    allDocuments.forEach(doc => {
      if (doc.cycle !== targetCycle) return
      if (!isNoYearCycle && doc.year !== targetYear) return
      
      const cat = doc.category?.trim()
      if (cat && cat !== 'Général') {
        foldersSet.add(cat)
        // Also add parent folders if nested (e.g. A/B -> A)
        const parts = cat.split('/')
        let current = ''
        for (let i = 0; i < parts.length; i++) {
          current = current ? `${current}/${parts[i]}` : parts[i]
          foldersSet.add(current)
        }
      }
    })

    // If moving a folder, exclude the folder itself and its subfolders from the destination list to prevent cyclic moves
    if (type === 'folder') {
      const excludedPrefix = sourceCategory
      return Array.from(foldersSet).filter(f => f !== excludedPrefix && !f.startsWith(excludedPrefix + '/')).sort()
    }

    return Array.from(foldersSet).sort()
  }, [allDocuments, targetCycle, targetYear, isNoYearCycle, type, sourceCategory])

  const availableYears = targetCycle === 'dseb' ? [1, 2, 3, 4] : targetCycle === 'master' ? [1, 2] : [1, 2, 3]

  const finalDestinationCategory = isCustomFolder
    ? (customFolderName.trim() || 'Général')
    : selectedFolder

  const isSameLocation = 
    targetCycle === sourceCycle &&
    targetYear === sourceYear &&
    finalDestinationCategory === (sourceCategory || 'Général')

  const handleCycleChange = (newCycle: string) => {
    setTargetCycle(newCycle)
    const newIsNoYear = newCycle === 'memoires' || newCycle === 'bibliotheque'
    setTargetYear(newIsNoYear ? null : 1)
    setSelectedFolder('Général')
    setIsCustomFolder(false)
  }

  const handleYearChange = (newYear: number) => {
    setTargetYear(newYear)
    setSelectedFolder('Général')
    setIsCustomFolder(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await onConfirmMove(targetCycle, isNoYearCycle ? null : targetYear, finalDestinationCategory)
      onClose()
    } catch (err) {
      console.error('Error moving item:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative border border-slate-200 dark:border-white/10 animate-slide-up max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <FolderInput className="w-6 h-6" />
          </div>
          <div className="min-w-0 pr-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              Déplacer {type === 'file' ? 'le document' : 'le dossier'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" title={itemTitle}>
              « {itemTitle} »
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-5">
          {/* Target Cycle Selection (Admin Only) */}
          {!isDelegate && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                1. Choisir le cycle de destination
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {Object.entries(CYCLES).map(([cKey, cVal]) => (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => handleCycleChange(cKey)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center truncate",
                      targetCycle === cKey
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    {cVal.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Year Selection */}
          {!isNoYearCycle && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {!isDelegate ? '2. Année d\'études' : 'Année d\'études'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableYears.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleYearChange(y)}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center",
                      targetYear === y
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    Année {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Destination Folder Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {!isDelegate && !isNoYearCycle ? '3. Dossier de destination' : 'Dossier de destination'}
              </label>
              <button
                type="button"
                onClick={() => setIsCustomFolder(!isCustomFolder)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {isCustomFolder ? 'Choisir un dossier existant' : '+ Nouveau dossier'}
              </button>
            </div>

            {isCustomFolder ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customFolderName}
                  onChange={(e) => setCustomFolderName(e.target.value)}
                  placeholder="Ex: Économie / Semestre 1"
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400">
                  Le dossier sera créé automatiquement lors du déplacement.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl max-h-48 overflow-y-auto p-1.5 space-y-1 bg-slate-50/50 dark:bg-slate-800/30">
                {availableFolders.map((folder) => {
                  const isSelected = selectedFolder === folder
                  const isRoot = folder === 'Général'
                  return (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => setSelectedFolder(folder)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors",
                        isSelected
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {isRoot ? (
                          <Folder className="w-4 h-4 shrink-0 text-amber-500" />
                        ) : (
                          <FolderOpen className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400" />
                        )}
                        <span className="truncate">{isRoot ? '📁 Racine (Général)' : folder}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Location Summary */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-500 dark:text-slate-400 w-12">Origine :</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {sourceCycle.toUpperCase()} {sourceYear ? `· ${sourceYear}A` : ''} · {sourceCategory || 'Racine'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <span className="font-semibold w-12 flex items-center gap-1">
                <CornerDownRight className="w-3.5 h-3.5" /> Cible :
              </span>
              <span className="font-bold truncate">
                {targetCycle.toUpperCase()} {!isNoYearCycle && targetYear ? `· ${targetYear}A` : ''} · {finalDestinationCategory || 'Racine'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || (isSameLocation && !isCustomFolder)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Déplacement en cours...
                </>
              ) : (
                <>
                  <FolderInput className="w-4 h-4" />
                  Déplacer ici
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
