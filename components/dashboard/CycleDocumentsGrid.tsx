'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Folder, FolderOpen, ArrowLeft, ChevronRight, Search, Eye, Loader2, Sparkles } from 'lucide-react'
import { formatDate, CYCLES, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getPresignedDownloadUrl } from '@/app/actions/storage'
import type { Document } from '@/lib/types'
import FavoriteButton from '@/components/ui/FavoriteButton'
import ShareButtons from '@/components/ui/ShareButtons'
import { CourseThumbnailCard } from './CourseThumbnailCard'
import { getCourseThumbnail } from '@/lib/course-thumbnails'
import { useTrackReading } from './useTrackReading'
import { QAButtons } from './DocumentQA'

interface CycleDocumentsClientProps {
  cycle: string
  cycleLabel: string
  documents: Document[]
  favoriteDocsIds?: string[]
  supabaseUrl?: string
  supabaseKey?: string
}

export default function CycleDocumentsClient({ cycle, cycleLabel, documents, favoriteDocsIds = [], supabaseUrl, supabaseKey }: CycleDocumentsClientProps) {
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'cards' | 'thumbnails'>('thumbnails')

  const supabase = createClient()

  const isNoYearCycle = cycle === 'memoires' || cycle === 'bibliotheque'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const currentPathString = currentPath.join('/')

  // Filtrer d'abord par année si une année est sélectionnée
  const yearDocuments = selectedYear !== null
    ? documents.filter(doc => doc.year === selectedYear)
    : documents

  // Extract folders and files for the current path
  const subFolders = new Set<string>()
  let filesHere: Document[] = []

  if (searchQuery.trim() !== '') {
    // If searching, ignore folders and just filter all documents
    const query = searchQuery.toLowerCase()
    filesHere = (selectedYear !== null ? yearDocuments : documents).filter(doc => doc.title.toLowerCase().includes(query) && doc.title !== '.keep')
  } else if (selectedYear !== null || isNoYearCycle) {
    // Normal folder navigation INSIDE a specific year or for cycles without years
    const baseDocs = isNoYearCycle ? documents : yearDocuments
    baseDocs.forEach(doc => {
      const cat = doc.category || 'Général'

      // Si on est à la racine, 'Général' est considéré comme la racine
      if (currentPath.length === 0 && cat === 'Général') {
        if (doc.title !== '.keep') filesHere.push(doc)
        return
      }

      if (cat === currentPathString) {
        // Fichier appartenant exactement à ce dossier
        if (doc.title !== '.keep') filesHere.push(doc)
      } else if (cat.startsWith(currentPathString ? currentPathString + '/' : '')) {
        // Fichier dans un sous-dossier
        const remainingPath = cat.slice(currentPathString ? currentPathString.length + 1 : 0)
        const nextFolder = remainingPath.split('/')[0]
        if (nextFolder) subFolders.add(nextFolder)
      }
    })
  }

  const foldersList = Array.from(subFolders).sort()
  const cycleBadge = CYCLES[cycle as keyof typeof CYCLES]

  // Déterminer les années disponibles pour le cycle
  const availableYears = cycle === 'dseb' ? [1, 2, 3, 4] : cycle === 'master' ? [1, 2] : [1, 2, 3]

  function navigateTo(folder: string) {
    setCurrentPath(prev => [...prev, folder])
  }

  function navigateUp() {
    setCurrentPath(prev => prev.slice(0, -1))
  }

  function navigateToCrumb(index: number) {
    setCurrentPath(prev => prev.slice(0, index + 1))
  }

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        {selectedYear !== null ? (
          <div className="mb-4 flex items-center flex-wrap gap-2 text-sm">
            {!isNoYearCycle && (
              <>
                <button
                  onClick={() => { setSelectedYear(null); setCurrentPath([]) }}
                  className="text-[#64748B] hover:text-[#1E3A8A] transition-colors flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Racine du Cycle
                </button>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
                  <button
                    onClick={() => setCurrentPath([])}
                    className={cn(
                      "transition-colors font-medium",
                      currentPath.length === 0 ? "text-[#0F172A] dark:text-white" : "text-[#64748B] hover:text-[#1E3A8A] dark:hover:text-blue-400"
                    )}
                  >
                    Année {selectedYear}
                  </button>
                </div>
              </>
            )}
            {isNoYearCycle && currentPath.length > 0 && (
              <button
                onClick={() => setCurrentPath([])}
                className="text-[#64748B] dark:text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dossier Principal
              </button>
            )}
            {currentPath.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#CBD5E1] dark:text-slate-600" />
                <button
                  onClick={() => navigateToCrumb(index)}
                  className={cn(
                    "transition-colors font-medium",
                    index === currentPath.length - 1 ? "text-[#0F172A] dark:text-white" : "text-[#64748B] dark:text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400"
                  )}
                >
                  {crumb}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mb-3 shadow-sm ${cycleBadge?.color}`}>
            {cycleBadge?.label}
          </span>
        )}

        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2 drop-shadow-sm">
          {selectedYear !== null ? (
            currentPath.length > 0 ? (
              <>
                <FolderOpen className="w-6 h-6 text-[#1E3A8A] dark:text-blue-400" />
                {currentPath[currentPath.length - 1]}
              </>
            ) : (
              isNoYearCycle ? <>{cycleLabel}</> : <>Année {selectedYear} — {cycleLabel}</>
            )
          ) : (
            <>Cours — {cycleLabel}</>
          )}
        </h1>
        <p className="text-[#64748B] dark:text-slate-400 text-sm mt-1 font-medium">
          {searchQuery
            ? `${filesHere.length} résultat(s) pour "${searchQuery}"`
            : selectedYear === null && !isNoYearCycle
              ? `${availableYears.length} années d'études`
              : `${foldersList.length} dossier(s), ${filesHere.length} fichier(s)`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un document par nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-xl leading-5 bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-md placeholder-slate-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm shadow-sm"
        />
      </div>

      {/* Year Selection with Thumbnails */}
      {selectedYear === null && searchQuery === '' && !isNoYearCycle ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Sélectionnez votre année
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableYears.map((year, index) => {
              const yearDocs = documents.filter(d => d.year === year)
              const coursesCount = new Set(yearDocs.map(d => d.category)).size

              return (
                <motion.button
                  key={year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedYear(year)}
                  className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white hover:shadow-2xl hover:shadow-blue-900/30 hover:border-blue-400/50 transition-all duration-300"
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id={`year-${year}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <circle cx="20" cy="20" r="2" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#year-${year})`} />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl"
                    >
                      <span className="text-3xl font-bold">{year}</span>
                    </motion.div>

                    <h3 className="text-lg font-bold mb-1">
                      {year}{year === 1 ? 'ère' : 'ème'} Année
                    </h3>
                    <p className="text-sm text-white/80 mb-3">
                      {coursesCount} cours disponibles
                    </p>

                    <div className="flex items-center justify-center gap-2 text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-lg py-2 px-3">
                      <Folder className="w-4 h-4" />
                      Explorer
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      ) : foldersList.length === 0 && filesHere.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
        >
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Ce dossier est vide.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* FOLDERS WITH THUMBNAILS */}
          {foldersList.length > 0 && (
            <div>
              {currentPath.length === 0 && (
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 tracking-tight uppercase opacity-80 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Dossiers
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {foldersList.map((folderName, index) => {
                  const folderPrefix = currentPathString ? `${currentPathString}/${folderName}` : folderName
                  let filesCount = 0
                  documents.forEach(doc => {
                    if (doc.category === folderPrefix || doc.category?.startsWith(folderPrefix + '/')) {
                      filesCount++
                    }
                  })

                  const thumbnail = getCourseThumbnail(folderName)
                  const Icon = thumbnail.icon

                  return (
                    <motion.button
                      key={folderName}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigateTo(folderName)}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-400/50 transition-all duration-300 text-left"
                    >
                      {/* Thumbnail gradient header */}
                      <div className={`h-24 bg-gradient-to-br ${thumbnail.gradient} dark:bg-gradient-to-br dark:${thumbnail.gradientDark} relative overflow-hidden`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </motion.div>
                        </div>

                        {/* File count badge */}
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold">
                          {filesCount} fichiers
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {folderName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{thumbnail.description}</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* FILES GRID */}
          {filesHere.length > 0 && (
            <div>
              {(currentPath.length > 0 || foldersList.length > 0) && (
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/50 tracking-tight uppercase opacity-80 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Fichiers
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filesHere.map((doc: Document) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <DocumentCard
                      doc={doc}
                      supabase={supabase}
                      isMemoire={cycle === 'memoires'}
                      isFavorite={favoriteDocsIds.includes(doc.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function DocumentCard({ doc, supabase, isMemoire, isFavorite }: { doc: Document; supabase: any; isMemoire?: boolean; isFavorite?: boolean }) {
  const [isLoadingView, setIsLoadingView] = useState(false)
  const [isLoadingDownload, setIsLoadingDownload] = useState(false)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const { trackView, trackDownload } = useTrackReading(doc.id)

  useEffect(() => {
    if (doc.thumbnail_path) {
      getPresignedDownloadUrl(doc.thumbnail_path, false).then(res => {
        if (res?.url) setThumbUrl(res.url)
      })
    }
  }, [doc.thumbnail_path])

  const handleView = async () => {
    if (isLoadingView) return
    setIsLoadingView(true)
    trackView()  // ← Analytics
    try {
      const pData = await getPresignedDownloadUrl(doc.file_path, false)
      if (pData?.url) {
        const ext = doc.file_path.split('.').pop()?.toLowerCase()
        const officeExts = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']
        if (officeExts.includes(ext || '')) {
          window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(pData.url)}`, '_blank')
        } else {
          window.open(pData.url, '_blank')
        }
      }
    } finally {
      setIsLoadingView(false)
    }
  }

  const handleDownload = async () => {
    if (isLoadingDownload) return
    setIsLoadingDownload(true)
    trackDownload() // ← Analytics
    try {
      const dData = await getPresignedDownloadUrl(doc.file_path, true)
      if (dData?.url) {
        const a = document.createElement('a')
        a.href = dData.url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } finally {
      setIsLoadingDownload(false)
    }
  }

  const thumbnail = getCourseThumbnail(doc.category)

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative group flex flex-col justify-between gap-3 h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg overflow-hidden hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-400/50 transition-all duration-300"
    >
      {/* Thumbnail header */}
      <div className={`h-20 bg-gradient-to-br ${thumbnail.gradient} dark:bg-gradient-to-br dark:${thumbnail.gradientDark} relative flex items-center justify-center`}>
        {thumbUrl ? (
          <img src={thumbUrl} alt="Miniature" className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <FileText className="w-8 h-8 text-white/80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-4 pt-2">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={doc.title}>
          {doc.title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{formatDate(doc.created_at)}</p>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleView}
            disabled={isLoadingView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs font-bold disabled:opacity-50"
          >
            {isLoadingView ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
            Voir
          </button>

          {!isMemoire && (
            <button
              onClick={handleDownload}
              disabled={isLoadingDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold disabled:opacity-50"
            >
              {isLoadingDownload ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Télécharger
            </button>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1">
        <QAButtons documentId={doc.id} compact />
        <ShareButtons documentTitle={doc.title} documentId={doc.id} />
        <FavoriteButton documentId={doc.id} initialIsFavorite={!!isFavorite} />
      </div>
    </motion.div>
  )
}
