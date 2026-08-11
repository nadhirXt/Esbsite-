'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Folder, FolderOpen, ArrowLeft, ChevronRight, Search, Eye } from 'lucide-react'
import { formatDate, CYCLES } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

interface CycleDocumentsClientProps {
  cycle: string
  cycleLabel: string
  documents: any[]
  supabaseUrl?: string
  supabaseKey?: string
}

export default function CycleDocumentsClient({ cycle, cycleLabel, documents, supabaseUrl, supabaseKey }: CycleDocumentsClientProps) {
  const [currentPath, setCurrentPath] = useState<string[]>([])
  
  const supabase = createClient(supabaseUrl || '', supabaseKey || '')

  const [searchQuery, setSearchQuery] = useState('')
  const currentPathString = currentPath.join('/')

  // Extract folders and files for the current path
  const subFolders = new Set<string>()
  let filesHere: any[] = []

  if (searchQuery.trim() !== '') {
    // If searching, ignore folders and just filter all documents
    const query = searchQuery.toLowerCase()
    filesHere = documents.filter(doc => doc.title.toLowerCase().includes(query))
  } else {
    // Normal folder navigation
    documents.forEach(doc => {
      const cat = doc.category || 'Général'
      
      // Si on est à la racine, 'Général' est considéré comme la racine
      if (currentPath.length === 0 && cat === 'Général') {
        filesHere.push(doc)
        return
      }

      if (cat === currentPathString) {
        // Fichier appartenant exactement à ce dossier
        filesHere.push(doc)
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
      <div className="mb-8">
        {currentPath.length > 0 ? (
          <div className="mb-4 flex items-center flex-wrap gap-2 text-sm">
            <button 
              onClick={() => setCurrentPath([])}
              className="text-[#64748B] hover:text-[#1E3A8A] transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Racine
            </button>
            {currentPath.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
                <button
                  onClick={() => navigateToCrumb(index)}
                  className={cn(
                    "transition-colors font-medium",
                    index === currentPath.length - 1 ? "text-[#0F172A]" : "text-[#64748B] hover:text-[#1E3A8A]"
                  )}
                >
                  {crumb}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mb-3 ${cycleBadge?.color}`}>
            {cycleBadge?.label}
          </span>
        )}
        
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          {currentPath.length > 0 ? (
            <>
              <FolderOpen className="w-6 h-6 text-[#1E3A8A]" />
              {currentPath[currentPath.length - 1]}
            </>
          ) : (
            <>Cours — {cycleLabel}</>
          )}
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          {searchQuery ? `${filesHere.length} résultat(s) pour "${searchQuery}"` : `${foldersList.length} dossier(s), ${filesHere.length} fichier(s)`}
        </p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#94A3B8]" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un document par nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-[#E2E8F0] rounded-xl leading-5 bg-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all sm:text-sm shadow-sm"
        />
      </div>

      {foldersList.length === 0 && filesHere.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <FolderOpen className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B] font-medium">Ce dossier est vide.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* FOLDERS GRID */}
          {foldersList.length > 0 && (
            <div>
              {currentPath.length === 0 && <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Dossiers</h2>}
              <div className="grid sm:grid-cols-3 gap-4">
                {foldersList.map((folderName) => {
                  // Compter le nombre total de fichiers à l'intérieur de ce dossier (récursivement)
                  const folderPrefix = currentPathString ? `${currentPathString}/${folderName}` : folderName;
                  let filesCount = 0;
                  documents.forEach(doc => {
                    if (doc.category === folderPrefix || doc.category?.startsWith(folderPrefix + '/')) {
                      filesCount++;
                    }
                  });

                  return (
                    <button
                      key={folderName}
                      onClick={() => navigateTo(folderName)}
                      className="group flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 hover:shadow-md hover:border-[#1E3A8A]/30 hover:-translate-y-0.5 transition-all duration-200 text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#1E3A8A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <Folder className="w-6 h-6 fill-current opacity-80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors truncate">{folderName}</h3>
                        <p className="text-xs text-[#64748B] mt-0.5">{filesCount} élément{filesCount > 1 ? 's' : ''}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* FILES GRID */}
          {filesHere.length > 0 && (
            <div>
              {(currentPath.length > 0 || foldersList.length > 0) && (
                <h2 className="text-sm font-semibold text-[#0F172A] mb-3 mt-4 pt-4 border-t border-[#E2E8F0]">Fichiers</h2>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filesHere.map((doc: any) => (
                  <DocumentCard key={doc.id} doc={doc} supabase={supabase} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DocumentCard({ doc, supabase }: { doc: any; supabase: any }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUrl() {
      // Pour l'aperçu
      const { data: pData } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600)
      if (pData?.signedUrl) setPreviewUrl(pData.signedUrl)
      
      // Pour le téléchargement direct
      const { data: dData } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600, { download: true })
      if (dData?.signedUrl) setDownloadUrl(dData.signedUrl)
    }
    fetchUrl()
  }, [doc.file_path, supabase.storage])

  return (
    <div className="group flex flex-col justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 hover:shadow-md hover:border-[#1E3A8A]/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0F172A] truncate" title={doc.title}>{doc.title}</p>
          <p className="text-xs text-[#64748B] mt-0.5">{formatDate(doc.created_at)}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#F1F5F9]">
        {previewUrl ? (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE] transition-colors text-xs font-medium">
            <Eye className="w-3.5 h-3.5" />
            Voir
          </a>
        ) : (
          <div className="flex-1 h-7 bg-gray-100 animate-pulse rounded-lg" />
        )}
        
        {downloadUrl ? (
          <a href={downloadUrl} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors text-xs font-medium">
            <Download className="w-3.5 h-3.5" />
            Télécharger
          </a>
        ) : (
          <div className="flex-1 h-7 bg-gray-100 animate-pulse rounded-lg" />
        )}
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
