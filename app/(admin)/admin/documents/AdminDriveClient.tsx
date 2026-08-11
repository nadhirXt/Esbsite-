'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, Download, Folder, FolderOpen, ArrowLeft, ChevronRight, Search, Eye, Plus, Trash2, Edit2, Upload as UploadIcon, MoreVertical, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, CYCLES, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminDriveClient({ documents: initialDocuments }: { documents: any[] }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [cycle, setCycle] = useState('dseb')
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean,
    x: number,
    y: number,
    type: 'bg' | 'folder' | 'file',
    targetName?: string,
    targetDoc?: any
  } | null>(null)

  // Modals state
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showRenameFolderModal, setShowRenameFolderModal] = useState<{oldPath: string} | null>(null)
  const [showRenameFileModal, setShowRenameFileModal] = useState<any | null>(null)
  
  // Upload State (for drag and drop / direct upload)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  // Click outside to close context menu
  useEffect(() => {
    function handleClick() {
      if (contextMenu?.visible) setContextMenu(null)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [contextMenu])

  // Process documents
  const cycleDocuments = documents.filter(doc => doc.cycle === cycle)
  const currentPathString = currentPath.join('/')

  const subFolders = new Set<string>()
  let filesHere: any[] = []

  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase()
    filesHere = cycleDocuments.filter(doc => doc.title.toLowerCase().includes(query) && doc.title !== '.keep')
  } else {
    cycleDocuments.forEach(doc => {
      const cat = doc.category || 'Général'
      if (currentPath.length === 0 && cat === 'Général') {
        if (doc.title !== '.keep') filesHere.push(doc)
        return
      }
      if (cat === currentPathString) {
        if (doc.title !== '.keep') filesHere.push(doc)
      } else if (cat.startsWith(currentPathString ? currentPathString + '/' : '')) {
        const remainingPath = cat.slice(currentPathString ? currentPathString.length + 1 : 0)
        const nextFolder = remainingPath.split('/')[0]
        if (nextFolder) subFolders.add(nextFolder)
      }
    })
  }

  const foldersList = Array.from(subFolders).sort()

  // Navigation
  function navigateTo(folder: string) { setCurrentPath(prev => [...prev, folder]) }
  function navigateToCrumb(index: number) { setCurrentPath(prev => prev.slice(0, index + 1)) }

  // Context Menu Handlers
  function handleContextMenuBg(e: React.MouseEvent) {
    e.preventDefault()
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, type: 'bg' })
  }
  function handleContextMenuFolder(e: React.MouseEvent, folderName: string) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, type: 'folder', targetName: folderName })
  }
  function handleContextMenuFile(e: React.MouseEvent, doc: any) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, type: 'file', targetDoc: doc })
  }

  // Actions
  async function createFolder(folderName: string) {
    if (!folderName.trim()) return
    const folderPath = currentPathString ? `${currentPathString}/${folderName}` : folderName
    const { data, error } = await supabase.from('documents').insert({
      title: '.keep',
      file_path: '.keep',
      cycle: cycle,
      category: folderPath
    }).select().single()

    if (!error && data) {
      setDocuments(prev => [data, ...prev])
    }
    setShowFolderModal(false)
  }

  async function deleteFolder(folderName: string) {
    if (!confirm(`Supprimer le dossier "${folderName}" et TOUT son contenu ?`)) return
    const folderPath = currentPathString ? `${currentPathString}/${folderName}` : folderName
    
    // Find all documents in this folder and subfolders
    const docsToDelete = documents.filter(doc => doc.cycle === cycle && (doc.category === folderPath || doc.category?.startsWith(folderPath + '/')))
    
    const filePathsToDelete = docsToDelete.filter(d => d.file_path !== '.keep').map(d => d.file_path)
    if (filePathsToDelete.length > 0) {
      await supabase.storage.from('documents').remove(filePathsToDelete)
    }

    const idsToDelete = docsToDelete.map(d => d.id)
    if (idsToDelete.length > 0) {
      await supabase.from('documents').delete().in('id', idsToDelete)
    }
    
    setDocuments(prev => prev.filter(doc => !idsToDelete.includes(doc.id)))
  }

  async function renameFolder(oldName: string, newName: string) {
    if (!newName.trim() || oldName === newName) return
    const oldPath = currentPathString ? `${currentPathString}/${oldName}` : oldName
    const newPath = currentPathString ? `${currentPathString}/${newName}` : newName
    
    const docsToUpdate = documents.filter(doc => doc.cycle === cycle && (doc.category === oldPath || doc.category?.startsWith(oldPath + '/')))
    
    for (const doc of docsToUpdate) {
      let updatedCategory = doc.category
      if (doc.category === oldPath) {
        updatedCategory = newPath
      } else if (doc.category?.startsWith(oldPath + '/')) {
        updatedCategory = doc.category.replace(oldPath + '/', newPath + '/')
      }
      await supabase.from('documents').update({ category: updatedCategory }).eq('id', doc.id)
      
      // Update local state
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, category: updatedCategory } : d))
    }
    setShowRenameFolderModal(null)
  }

  async function deleteFile(id: string, filePath: string) {
    if (!confirm('Supprimer ce fichier ?')) return
    if (filePath !== '.keep') {
      await supabase.storage.from('documents').remove([filePath])
    }
    await supabase.from('documents').delete().eq('id', id)
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  async function renameFile(doc: any, newTitle: string) {
    if (!newTitle.trim() || newTitle === doc.title) return
    await supabase.from('documents').update({ title: newTitle }).eq('id', doc.id)
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, title: newTitle } : d))
    setShowRenameFileModal(null)
  }

  async function handleFilesUpload(files: FileList | File[]) {
    if (files.length === 0) return
    setUploading(true)
    const category = currentPathString || 'Général'

    const newDocs: any[] = []
    for (const file of Array.from(files)) {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
      const path = `${cycle}/${Date.now()}_${safeFileName}`
      const fileTitle = file.name.replace(/\.[^.]+$/, '')
      
      const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, { cacheControl: '3600' })
      if (!uploadError) {
        const { data, error: dbError } = await supabase.from('documents').insert({
          title: fileTitle, file_path: path, cycle, category
        }).select().single()
        
        if (data) newDocs.push(data)
      }
    }
    setDocuments(prev => [...newDocs, ...prev])
    setUploading(false)
  }

  // Drag and drop handlers
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length > 0) {
      handleFilesUpload(e.dataTransfer.files)
    }
  }

  return (
    <div 
      className="animate-fade-in max-w-6xl min-h-[60vh] relative"
      onContextMenu={handleContextMenuBg}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drop zone overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#1E3A8A]/10 border-4 border-dashed border-[#1E3A8A] rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center text-[#1E3A8A]">
            <UploadIcon className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <p className="text-2xl font-bold">Lâchez pour uploader ici</p>
            <p className="mt-2 text-sm opacity-80">Dans : {currentPathString || 'Racine'}</p>
          </div>
        </div>
      )}

      {/* Header & Cycle Selector */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-4">Explorateur (Drive)</h1>
          <div className="flex gap-2">
            {Object.entries(CYCLES).map(([cValue, cData]) => (
              <button
                key={cValue}
                onClick={() => { setCycle(cValue); setCurrentPath([]); setSearchQuery('') }}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  cycle === cValue ? "bg-[#1E3A8A] border-[#1E3A8A] text-white" : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                )}
              >
                {cData.label}
              </button>
            ))}
          </div>
        </div>

        {uploading && (
          <div className="flex items-center gap-2 text-sm text-[#1E3A8A] bg-[#EFF6FF] px-4 py-2 rounded-lg font-medium animate-pulse">
            <UploadIcon className="w-4 h-4" />
            Upload en cours...
          </div>
        )}
      </div>

      {/* Search & Breadcrumbs */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex items-center flex-wrap gap-2 text-sm font-medium">
          <button 
            onClick={() => setCurrentPath([])}
            className="text-[#64748B] hover:text-[#1E3A8A] transition-colors flex items-center gap-1"
          >
            <FolderOpen className="w-4 h-4" />
            {CYCLES[cycle as keyof typeof CYCLES]?.label}
          </button>
          {currentPath.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              <button
                onClick={() => navigateToCrumb(index)}
                className={cn(
                  "transition-colors",
                  index === currentPath.length - 1 ? "text-[#0F172A]" : "text-[#64748B] hover:text-[#1E3A8A]"
                )}
              >
                {crumb}
              </button>
            </div>
          ))}
        </div>
        
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {foldersList.length === 0 && filesHere.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <FolderOpen className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B] font-medium mb-1">Ce dossier est vide.</p>
          <p className="text-xs text-[#94A3B8] mb-4">Clic droit pour créer un dossier ou uploader des fichiers.</p>
          <Button variant="outline" size="sm" onClick={() => setShowFolderModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nouveau dossier
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {foldersList.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#64748B] mb-3 uppercase tracking-wider">Dossiers</h2>
              <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {foldersList.map(folderName => (
                  <div
                    key={folderName}
                    onContextMenu={(e) => handleContextMenuFolder(e, folderName)}
                    onClick={() => navigateTo(folderName)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 hover:shadow-md hover:border-[#1E3A8A]/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Folder className="w-6 h-6 text-[#1E3A8A] fill-[#EFF6FF] shrink-0" />
                      <span className="font-medium text-[#0F172A] truncate">{folderName}</span>
                    </div>
                    <button 
                      onClick={(e) => handleContextMenuFolder(e, folderName)}
                      className="p-1 rounded-md text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filesHere.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#64748B] mb-3 uppercase tracking-wider">Fichiers</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filesHere.map(doc => (
                  <AdminDocumentCard 
                    key={doc.id} 
                    doc={doc} 
                    supabase={supabase} 
                    onContextMenu={(e) => handleContextMenuFile(e, doc)}
                    onDelete={() => deleteFile(doc.id, doc.file_path)}
                    onRename={() => setShowRenameFileModal(doc)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu?.visible && (
        <div 
          className="fixed z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 w-48 text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === 'bg' && (
            <>
              <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2" onClick={() => setShowFolderModal(true)}>
                <Folder className="w-4 h-4 text-[#64748B]" /> Nouveau dossier
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon className="w-4 h-4 text-[#64748B]" /> Uploader un fichier
              </button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2" onClick={() => navigateTo(contextMenu.targetName!)}>
                <FolderOpen className="w-4 h-4 text-[#64748B]" /> Ouvrir
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2" onClick={() => setShowRenameFolderModal({ oldPath: contextMenu.targetName! })}>
                <Edit2 className="w-4 h-4 text-[#64748B]" /> Renommer
              </button>
              <div className="h-px bg-[#E2E8F0] my-1" />
              <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2" onClick={() => deleteFolder(contextMenu.targetName!)}>
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </>
          )}
          {contextMenu.type === 'file' && (
            <>
              <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2" onClick={() => setShowRenameFileModal(contextMenu.targetDoc)}>
                <Edit2 className="w-4 h-4 text-[#64748B]" /> Renommer
              </button>
              <div className="h-px bg-[#E2E8F0] my-1" />
              <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2" onClick={() => deleteFile(contextMenu.targetDoc.id, contextMenu.targetDoc.file_path)}>
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </>
          )}
        </div>
      )}

      {/* Hidden file input for contextual upload */}
      <input 
        type="file" 
        multiple 
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handleFilesUpload(e.target.files)
        }}
      />

      {/* Modals */}
      {showFolderModal && (
        <Modal title="Nouveau dossier" onClose={() => setShowFolderModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); const val = new FormData(e.currentTarget).get('name') as string; createFolder(val) }}>
            <Input id="name" name="name" label="Nom du dossier" autoFocus required placeholder="Ex: Mathématiques" />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFolderModal(false)}>Annuler</Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </Modal>
      )}

      {showRenameFolderModal && (
        <Modal title="Renommer le dossier" onClose={() => setShowRenameFolderModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); const val = new FormData(e.currentTarget).get('name') as string; renameFolder(showRenameFolderModal.oldPath, val) }}>
            <Input id="name" name="name" label="Nouveau nom" defaultValue={showRenameFolderModal.oldPath} autoFocus required />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRenameFolderModal(null)}>Annuler</Button>
              <Button type="submit">Renommer</Button>
            </div>
          </form>
        </Modal>
      )}

      {showRenameFileModal && (
        <Modal title="Renommer le fichier" onClose={() => setShowRenameFileModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); const val = new FormData(e.currentTarget).get('name') as string; renameFile(showRenameFileModal, val) }}>
            <Input id="name" name="name" label="Nouveau titre" defaultValue={showRenameFileModal.title} autoFocus required />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRenameFileModal(null)}>Annuler</Button>
              <Button type="submit">Renommer</Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  )
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#0F172A]"><X className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold text-[#0F172A] mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function AdminDocumentCard({ doc, supabase, onContextMenu, onDelete, onRename }: { doc: any; supabase: any, onContextMenu: (e:any) => void, onDelete: () => void, onRename: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUrl() {
      const { data: pData } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600)
      if (pData?.signedUrl) {
        const ext = doc.file_path.split('.').pop()?.toLowerCase()
        const officeExts = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']
        if (officeExts.includes(ext || '')) {
          setPreviewUrl(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(pData.signedUrl)}`)
        } else {
          setPreviewUrl(pData.signedUrl)
        }
      }
      
      const { data: dData } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600, { download: true })
      if (dData?.signedUrl) setDownloadUrl(dData.signedUrl)
    }
    fetchUrl()
  }, [doc.file_path, supabase.storage])

  return (
    <div onContextMenu={onContextMenu} className="group flex flex-col justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 hover:shadow-md hover:border-[#1E3A8A]/30 transition-all duration-200">
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] truncate" title={doc.title}>{doc.title}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{formatDate(doc.created_at)}</p>
          </div>
        </div>
        <button onClick={onContextMenu} className="p-1 rounded-md text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A]">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 mt-1 pt-3 border-t border-[#F1F5F9]">
        {previewUrl ? (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE] transition-colors text-xs font-medium">
            <Eye className="w-3.5 h-3.5" /> Voir
          </a>
        ) : <div className="flex-1 h-7 bg-gray-100 animate-pulse rounded-lg" />}
        {downloadUrl ? (
          <a href={downloadUrl} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors text-xs font-medium">
            <Download className="w-3.5 h-3.5" /> Télécharger
          </a>
        ) : <div className="flex-1 h-7 bg-gray-100 animate-pulse rounded-lg" />}
      </div>
    </div>
  )
}
