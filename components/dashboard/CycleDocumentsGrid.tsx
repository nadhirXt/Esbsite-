'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Folder, FolderOpen, ArrowLeft, ChevronRight, Search, Eye, Loader2, Sparkles } from 'lucide-react'
import { formatDate, CYCLES, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/types'
import FavoriteButton from '@/components/ui/FavoriteButton'
import ShareButtons from '@/components/ui/ShareButtons'
import { CourseThumbnailCard } from './CourseThumbnailCard'
import { getCourseThumbnail } from '@/lib/course-thumbnails'
import { useTrackReading } from './useTrackReading'

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
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au tableau de bord
        </Link>

        {selectedYear !== null ? (
          <div className="mb-4 flex items-center gap-2 text-xs sm:text-sm max-w-full overflow-x-auto no-scrollbar py-1 scroll-smooth">
            {!isNoYearCycle && (
              <>
                <button
                  onClick={() => { setSelectedYear(null); setCurrentPath([]) }}
                  className="whitespace-nowrap shrink-0 text-[#64748B] hover:text-[#1E3A8A] transition-colors flex items-center gap-1 font-medium min-h-[36px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Racine du Cycle
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
                  <button
                    onClick={() => setCurrentPath([])}
                    className={cn(
                      "whitespace-nowrap transition-colors font-medium min-h-[36px]",
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
                className="whitespace-nowrap shrink-0 text-[#64748B] dark:text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-medium min-h-[36px]"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dossier Principal
              </button>
            )}
            {currentPath.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2 shrink-0">
                <ChevronRight className="w-4 h-4 text-[#CBD5E1] dark:text-slate-600" />
                <button
                  onClick={() => navigateToCrumb(index)}
                  className={cn(
                    "whitespace-nowrap transition-colors font-medium min-h-[36px]",
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
          <Search className="h-4 w-4 text-cyan-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un document par nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-white/10 rounded-2xl leading-5 bg-white dark:bg-[#070D19]/90 backdrop-blur-xl placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm shadow-sm"
        />
      </div>

      {/* Year Selection with Thumbnails */}
      {selectedYear === null && searchQuery === '' && !isNoYearCycle ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Sélectionnez votre niveau d&apos;études
            </h2>
          </div>
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
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-[#070D19]/90 backdrop-blur-2xl p-6 sm:p-7 text-white hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all duration-300 text-left cursor-pointer"
                >
                  {/* Cyber Grid Background */}
                  <div className="absolute inset-0 cyber-grid-pattern opacity-15 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.25)] text-cyan-300"
                    >
                      <span className="text-3xl font-mono font-black">{year}</span>
                    </motion.div>

                    <h3 className="text-lg font-black text-white mb-1">
                      {year}{year === 1 ? 'ère' : 'ème'} Année
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mb-4">
                      {coursesCount} modules de cours
                    </p>

                    <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      <span>Accéder au programme</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070D19]/90 backdrop-blur-xl hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-400/50 transition-all duration-300 text-left cursor-pointer"
                    >
                      {/* Thumbnail gradient header */}
                      <div className={`h-24 bg-gradient-to-br ${thumbnail.gradient} dark:bg-gradient-to-br dark:${thumbnail.gradientDark} relative overflow-hidden`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg"
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </motion.div>
                        </div>

                        {/* File count badge */}
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-white/20">
                          {filesCount} fichiers
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors truncate">
                          {folderName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{thumbnail.description}</p>
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
                <h2 className="text-xs font-mono font-bold text-cyan-400 mb-4 mt-6 pt-6 border-t border-slate-200 dark:border-white/10 tracking-widest uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Fichiers &amp; Documents
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
  const { trackView, trackDownload } = useTrackReading(doc.id)

  const handleView = () => {
    trackView()  // ← Analytics
    const ext = doc.file_path.split('.').pop()?.toLowerCase() || 'pdf'
    const safeTitle = (doc.title || 'document').replace(/[/\\?%*:|"<>]/g, '_')
    const viewUrl = `/assets/documents/${doc.id}/${encodeURIComponent(safeTitle)}.${ext}`
    const win = window.open(viewUrl, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = viewUrl
    }
  }

  const handleDownload = () => {
    trackDownload() // ← Analytics
    const ext = doc.file_path.split('.').pop()?.toLowerCase() || 'pdf'
    const safeTitle = (doc.title || 'document').replace(/[/\\?%*:|"<>]/g, '_')
    const downloadUrl = `/assets/documents/${doc.id}/${encodeURIComponent(safeTitle)}.${ext}?download=1`
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `${safeTitle}.${ext}`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
    }, 100)
  }

  const thumbnail = getCourseThumbnail(doc.category)

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative group flex flex-col justify-between gap-3 h-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070D19]/90 backdrop-blur-xl overflow-hidden hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-400/50 transition-all duration-300"
    >
      {/* Thumbnail header */}
      <div className={`h-20 bg-gradient-to-br ${thumbnail.gradient} dark:bg-gradient-to-br dark:${thumbnail.gradientDark} relative flex items-center justify-center`}>
        <FileText className="w-8 h-8 text-white/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="p-4 pt-2">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition-colors" title={doc.title}>
          {doc.title}
        </p>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{formatDate(doc.created_at)}</p>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors text-xs font-mono font-bold cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Voir
          </button>

          {!isMemoire && (
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs font-mono font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger
            </button>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1">
        <ShareButtons documentTitle={doc.title} documentId={doc.id} />
        <FavoriteButton documentId={doc.id} initialIsFavorite={!!isFavorite} />
      </div>
    </motion.div>
  )
}
