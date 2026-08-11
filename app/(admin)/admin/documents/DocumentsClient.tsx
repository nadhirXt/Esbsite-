'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Trash2, Eye, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, CYCLES } from '@/lib/utils'

export default function DocumentsClient({ documents: initialDocuments }: { documents: any[] }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const supabase = createClient()

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  async function handleDelete(id: string, filePath: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.')) return

    setDeletingId(id)
    
    // 1. Supprimer du stockage
    const { error: storageError } = await supabase.storage.from('documents').remove([filePath])
    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // 2. Supprimer de la base de données
    const { error: dbError } = await supabase.from('documents').delete().eq('id', id)
    
    if (!dbError) {
      setDocuments(prev => prev.filter(d => d.id !== id))
    }
    
    setDeletingId(null)
  }

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Gérer les documents</h1>
        <p className="text-[#64748B] text-sm mt-1">Recherchez, prévisualisez ou supprimez les documents de la plateforme.</p>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#94A3B8]" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un document par nom ou catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-[#E2E8F0] rounded-xl leading-5 bg-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all shadow-sm"
        />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            Aucun document trouvé.
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {filteredDocuments.map(doc => (
              <AdminDocumentCard key={doc.id} doc={doc} supabase={supabase} onDelete={() => handleDelete(doc.id, doc.file_path)} isDeleting={deletingId === doc.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AdminDocumentCard({ doc, supabase, onDelete, isDeleting }: { doc: any; supabase: any; onDelete: () => void; isDeleting: boolean }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  
  const cycleBadge = CYCLES[doc.cycle as keyof typeof CYCLES]

  useEffect(() => {
    async function fetchUrl() {
      const { data: pData } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600)
      if (pData?.signedUrl) setPreviewUrl(pData.signedUrl)
      
      const { data: dData } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600, { download: true })
      if (dData?.signedUrl) setDownloadUrl(dData.signedUrl)
    }
    fetchUrl()
  }, [doc.file_path, supabase.storage])

  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#F8FAFC] transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-red-500" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0F172A] truncate" title={doc.title}>{doc.title}</p>
            {cycleBadge && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cycleBadge.color}`}>
                {cycleBadge.label}
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-1 truncate">
            {doc.category} • {formatDate(doc.created_at)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-[#94A3B8] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer" title="Voir (Aperçu)">
            <Eye className="w-4 h-4" />
          </a>
        )}
        
        {downloadUrl && (
          <a href={downloadUrl} className="p-2 text-[#94A3B8] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer" title="Télécharger">
            <Download className="w-4 h-4" />
          </a>
        )}

        <button 
          onClick={onDelete} 
          disabled={isDeleting}
          className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50" 
          title="Supprimer"
        >
          {isDeleting ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
