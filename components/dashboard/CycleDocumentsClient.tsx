'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Folder, FolderOpen, ArrowLeft } from 'lucide-react'
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
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  
  const supabase = createClient(supabaseUrl || '', supabaseKey || '')

  // Group by category (which acts as folder)
  const grouped = documents.reduce((acc, doc) => {
    const cat = doc.category || 'Général'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(doc)
    return acc
  }, {} as Record<string, typeof documents>)

  const cycleBadge = CYCLES[cycle as keyof typeof CYCLES]

  if (selectedFolder) {
    const docs = grouped[selectedFolder] || []
    return (
      <div className="animate-fade-in max-w-4xl">
        <div className="mb-8">
          <button 
            onClick={() => setSelectedFolder(null)}
            className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux dossiers
          </button>
          
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-[#1E3A8A]" />
            {selectedFolder}
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            {docs.length} document{docs.length > 1 ? 's' : ''} dans ce dossier
          </p>
        </div>

        {docs.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
            <FileText className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] font-medium">Ce dossier est vide.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {docs.map((doc: any) => (
              <DocumentCard key={doc.id} doc={doc} supabase={supabase} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // List of Folders
  const folders = Object.keys(grouped).sort()

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-8">
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mb-3 ${cycleBadge?.color}`}>
          {cycleBadge?.label}
        </span>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Cours — {cycleLabel}
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          {folders.length} dossier{folders.length > 1 ? 's' : ''} disponible{folders.length > 1 ? 's' : ''}
        </p>
      </div>

      {folders.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <FolderOpen className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B] font-medium">Aucun dossier disponible</p>
          <p className="text-xs text-[#94A3B8] mt-1">Les documents seront ajoutés par votre administration.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          {folders.map((folderName) => (
            <button
              key={folderName}
              onClick={() => setSelectedFolder(folderName)}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-6 hover:shadow-md hover:border-[#1E3A8A]/30 hover:-translate-y-1 transition-all duration-200 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#1E3A8A] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Folder className="w-7 h-7 fill-current opacity-80" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors">{folderName}</h3>
                <p className="text-xs text-[#64748B] mt-1">{grouped[folderName].length} fichier{grouped[folderName].length > 1 ? 's' : ''}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DocumentCard({ doc, supabase }: { doc: any; supabase: any }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUrl() {
      const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600)
      if (data?.signedUrl) setSignedUrl(data.signedUrl)
    }
    fetchUrl()
  }, [doc.file_path, supabase.storage])

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 hover:shadow-md hover:border-[#1E3A8A]/30 transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0F172A] truncate">{doc.title}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{formatDate(doc.created_at)}</p>
      </div>
      {signedUrl && (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-2 rounded-lg text-[#94A3B8] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] transition-all duration-150"
          aria-label={`Télécharger ${doc.title}`}
        >
          <Download className="w-4 h-4" />
        </a>
      )}
    </div>
  )
}
