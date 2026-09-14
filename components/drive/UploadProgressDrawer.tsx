'use client'

import { useState } from 'react'
import { 
  Loader2, Check, AlertCircle, ChevronDown, ChevronUp, 
  X, RefreshCw, Clock, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActiveUploadItem {
  id: string
  title: string
  originalName: string
  sizeFormatted: string
  progress: number
  status: 'queued' | 'uploading' | 'completed' | 'error'
  errorMsg?: string
}

interface UploadProgressDrawerProps {
  isOpen: boolean
  items: ActiveUploadItem[]
  onRetryItem?: (id: string) => void
  onClose: () => void
}

export default function UploadProgressDrawer({
  isOpen,
  items,
  onRetryItem,
  onClose,
}: UploadProgressDrawerProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (!isOpen || items.length === 0) return null

  const completedCount = items.filter(i => i.status === 'completed').length
  const errorCount = items.filter(i => i.status === 'error').length
  const isAllFinished = completedCount + errorCount === items.length
  
  // Progression globale moyenne
  const totalProgress = Math.round(
    items.reduce((acc, curr) => acc + (curr.status === 'completed' ? 100 : curr.progress), 0) / items.length
  )

  return (
    <div className="fixed bottom-5 right-5 z-[100] w-88 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all animate-slide-up">
      {/* Drawer Header */}
      <div 
        onClick={() => setIsMinimized(!isMinimized)}
        className="px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {!isAllFinished ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
          ) : errorCount > 0 ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          
          <div className="min-w-0">
            <h4 className="text-xs font-bold truncate">
              {!isAllFinished 
                ? `Envoi de ${items.length} fichier${items.length > 1 ? 's' : ''} (${completedCount}/${items.length})`
                : `${completedCount} fichier${completedCount > 1 ? 's envoyés' : ' envoyé'}`
              }
            </h4>
            <p className="text-[10px] text-slate-300">
              {!isAllFinished ? `${totalProgress}% global` : errorCount > 0 ? `${errorCount} échec(s)` : 'Terminé avec succès'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            title={isMinimized ? "Agrandir" : "Réduire"}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isAllFinished && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Global Progress Bar under header */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
        <div 
          className={cn(
            "h-1 transition-all duration-300",
            errorCount > 0 ? "bg-amber-500" : isAllFinished ? "bg-emerald-500" : "bg-blue-600"
          )}
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {/* Body: List of files (Hidden when minimized) */}
      {!isMinimized && (
        <div className="max-h-72 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-white/5">
          {items.map((item) => (
            <div key={item.id} className="pt-2 first:pt-0">
              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.title}>
                    {item.title}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {item.status === 'queued' && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> En attente
                    </span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {item.progress}%
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> OK
                    </span>
                  )}
                  {item.status === 'error' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-rose-500">Erreur</span>
                      {onRetryItem && (
                        <button
                          type="button"
                          onClick={() => onRetryItem(item.id)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Réessayer cet envoi"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar per file */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 ease-out",
                    item.status === 'completed' ? "bg-emerald-500" :
                    item.status === 'error' ? "bg-rose-500" :
                    item.status === 'queued' ? "bg-slate-300 dark:bg-slate-700" : "bg-blue-600"
                  )}
                  style={{ width: `${item.status === 'completed' ? 100 : item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

