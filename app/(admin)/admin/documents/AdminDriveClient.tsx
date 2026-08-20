'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, Download, Folder, FolderOpen, ArrowLeft, ChevronRight, Search, Eye, Plus, Trash2, Edit2, Upload as UploadIcon, MoreVertical, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, CYCLES, cn } from '@/lib/utils'
import type { Document } from '@/lib/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getPresignedUploadUrl, getPresignedDownloadUrl, deleteStorageFile, deleteStorageFiles } from '@/app/actions/storage'

import { generatePDFThumbnail } from '@/lib/pdf-thumbnail'

export default function AdminDriveClient({ documents: initialDocuments }: { documents: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [cycle, setCycle] = useState('dseb')
  const [year, setYear] = useState(1)
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean,
    x: number,
    y: number,
    type: 'bg' | 'folder' | 'file',
    targetName?: string,
    targetDoc?: Document
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
  const cycleDocuments = documents.filter(doc => doc.cycle === cycle && doc.year === year)
  const currentPathString = currentPath.join('/')

  const subFolders = new Set<string>()
  let filesHere: Document[] = []

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
  function handleContextMenuFile(e: React.MouseEvent, doc: Document) {
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
      year: year,
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
    const docsToDelete = documents.filter(doc => doc.cycle === cycle && doc.year === year && (doc.category === folderPath || doc.category?.startsWith(folderPath + '/')))
    
    const filePathsToDelete = docsToDelete.filter(d => d.file_path !== '.keep').map(d => d.file_path)
    const thumbPathsToDelete = docsToDelete.map(d => d.thumbnail_path).filter((p): p is string => Boolean(p))
    const allPathsToDelete = [...filePathsToDelete, ...thumbPathsToDelete]

    if (allPathsToDelete.length > 0) {
      await deleteStorageFiles(allPathsToDelete)
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
    
    const docsToUpdate = documents.filter(doc => doc.cycle === cycle && doc.year === year && (doc.category === oldPath || doc.category?.startsWith(oldPath + '/')))
    
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

  async function deleteFile(id: string, filePath: string, thumbnailPath?: string | null) {
    if (!confirm('Supprimer ce fichier ?')) return
    
    const pathsToDelete = []
    if (filePath !== '.keep') pathsToDelete.push(filePath)
    if (thumbnailPath) pathsToDelete.push(thumbnailPath)
      
    if (pathsToDelete.length > 0) {
      await deleteStorageFiles(pathsToDelete)
    }
    
    await supabase.from('documents').delete().eq('id', id)
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  async function renameFile(doc: Document, newTitle: string) {
    if (!newTitle.trim() || newTitle === doc.title) return
    await supabase.from('documents').update({ title: newTitle }).eq('id', doc.id)
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, title: newTitle } : d))
    setShowRenameFileModal(null)
  }

  async function handleFilesUpload(files: FileList | File[]) {
    if (files.length === 0) return
    setUploading(true)
    const category = currentPathString || 'Général'

    const newDocs: Document[] = []
    for (const file of Array.from(files)) {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
      const path = `${cycle}/A${year}/${Date.now()}_${safeFileName}`
      const fileTitle = file.name.replace(/\.[^.]+$/, '')
      
      const { url, error: urlError } = await getPresignedUploadUrl(path, file.type || 'application/octet-stream')
      
      // 1. Generate and upload thumbnail if PDF
      let thumbnailPath: string | null = null;
      if (file.type === 'application/pdf') {
         const thumbBlob = await generatePDFThumbnail(file);
         if (thumbBlob) {
            const thumbName = `${cycle}/A${year}/${Date.now()}_thumb_${safeFileName}.jpg`;
            const { url: thumbUrl } = await getPresignedUploadUrl(thumbName, 'image/jpeg');
            if (thumbUrl) {
                try {
                  const thumbRes = await fetch(thumbUrl, { method: 'PUT', body: thumbBlob, headers: { 'Content-Type': 'image/jpeg' } });
                  if (thumbRes.ok) {
                     thumbnailPath = thumbName;
                  }
                } catch(e) {
                  console.error("Failed to upload thumbnail", e)
                }
            }
         }
      }
      
      // 2. Upload main file
      if (!urlError && url) {
        try {
          const res = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'application/octet-stream' }
          })
          if (res.ok) {
            const insertData: any = { title: fileTitle, file_path: path, cycle, year, category }
            if (thumbnailPath) {
              insertData.thumbnail_path = thumbnailPath
            }
            const { data, error: dbError } = await supabase.from('documents').insert(insertData).select().single()
            
            if (data) newDocs.push(data)
          } else {
            console.error("Upload error text:", await res.text())
            alert(`Erreur d'upload (HTTP ${res.status}). Vérifiez vos CORS.`)
          }
        } catch (err: any) {
          console.error("Upload fetch error", err)
          if (err.message === "Failed to fetch") {
            alert("Erreur de connexion (CORS). Avez-vous bien fait l'étape 3 du guide ?")
          }
        }
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

  const availableYears = cycle === 'dseb' ? [1, 2, 3, 4] : cycle === 'master' ? [1, 2] : [1, 2, 3]

  return (
    <div 
      className="animate-fade-in max-w-6xl mx-auto min-h-[60vh] relative py-8"
      onContextMenu={handleContextMenuBg}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drop zone overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-600/10 dark:bg-blue-400/10 border-4 border-dashed border-blue-600 dark:border-blue-400 rounded-3xl flex items-center justify-center backdrop-blur-sm transition-all duration-300">
          <div className="text-center text-blue-600 dark:text-blue-400">
            <UploadIcon className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <p className="text-2xl font-bold">Lâchez pour uploader ici</p>
            <p className="mt-2 text-sm opacity-80">Dans : {currentPathString || 'Racine'}</p>
          </div>
        </div>
      )}

      {/* Header & Cycle Selector */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FolderOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            Explorateur (Drive)
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              {Object.entries(CYCLES).map(([cValue, cData]) => (
                <button
                  key={cValue}
                  onClick={() => { setCycle(cValue); setYear(1); setCurrentPath([]); setSearchQuery('') }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-300",
                    cycle === cValue ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  {cData.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => { setYear(y); setCurrentPath([]); setSearchQuery('') }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-300",
                    year === y ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/30" : "bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  Année {y}
                </button>
              ))}
            </div>
          </div>
        </div>

        {uploading && (
          <div className="flex items-center gap-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-500/20 px-5 py-3 rounded-xl font-bold animate-pulse shadow-sm">
            <UploadIcon className="w-5 h-5" />
            Upload en cours...
          </div>
        )}
      </div>

      {/* Search & Breadcrumbs */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-5 rounded-3xl mb-8 flex flex-col md:flex-row gap-5 justify-between items-center shadow-sm">
        <div className="flex items-center flex-wrap gap-2 text-sm font-bold">
          <button 
            onClick={() => setCurrentPath([])}
            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <FolderOpen className="w-4 h-4" />
            {CYCLES[cycle as keyof typeof CYCLES]?.label}
          </button>
          {currentPath.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <button
                onClick={() => navigateToCrumb(index)}
                className={cn(
                  "transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5",
                  index === currentPath.length - 1 ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                {crumb}
              </button>
            </div>
          ))}
        </div>
        
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {foldersList.length === 0 && filesHere.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          <FolderOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-1">Ce dossier est vide.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Clic droit pour créer un dossier ou uploader des fichiers.</p>
          <Button variant="outline" size="sm" onClick={() => setShowFolderModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nouveau dossier
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {foldersList.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider pl-2">Dossiers</h2>
              <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {foldersList.map(folderName => (
                  <div
                    key={folderName}
                    onContextMenu={(e) => handleContextMenuFolder(e, folderName)}
                    onClick={() => navigateTo(folderName)}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg p-4 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Folder className="w-7 h-7 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900/50 shrink-0" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white truncate">{folderName}</span>
                    </div>
                    <button 
                      onClick={(e) => handleContextMenuFolder(e, folderName)}
                      className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filesHere.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider pl-2">Fichiers</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filesHere.map(doc => (
                  <AdminDocumentCard 
                    key={doc.id} 
                    doc={doc} 
                    supabase={supabase} 
                    onContextMenu={(e) => handleContextMenuFile(e, doc)}
                    onDelete={() => deleteFile(doc.id, doc.file_path, doc.thumbnail_path)}
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
          className="fixed z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 w-56 text-sm font-medium overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === 'bg' && (
            <>
              <button className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors" onClick={() => setShowFolderModal(true)}>
                <Folder className="w-4 h-4 text-slate-400" /> Nouveau dossier
              </button>
              <button className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon className="w-4 h-4 text-slate-400" /> Uploader un fichier
              </button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              <button className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors" onClick={() => navigateTo(contextMenu.targetName!)}>
                <FolderOpen className="w-4 h-4 text-slate-400" /> Ouvrir
              </button>
              <button className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors" onClick={() => setShowRenameFolderModal({ oldPath: contextMenu.targetName! })}>
                <Edit2 className="w-4 h-4 text-slate-400" /> Renommer
              </button>
              <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
              <button className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3 transition-colors" onClick={() => deleteFolder(contextMenu.targetName!)}>
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </>
          )}
          {contextMenu.type === 'file' && (
            <>
              <button className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors" onClick={() => setShowRenameFileModal(contextMenu.targetDoc)}>
                <Edit2 className="w-4 h-4 text-slate-400" /> Renommer
              </button>
              <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
              <button className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3 transition-colors" onClick={() => contextMenu.targetDoc && deleteFile(contextMenu.targetDoc.id, contextMenu.targetDoc.file_path, contextMenu.targetDoc.thumbnail_path)}>
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
    <div className="fixed inset-0 z-[100] bg-slate-900/50 dark:bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-slate-200 dark:border-white/10 animate-slide-up">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"><X className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function AdminDocumentCard({ doc, supabase, onContextMenu, onDelete, onRename }: { doc: Document; supabase: any, onContextMenu: (e:any) => void, onDelete: () => void, onRename: () => void }) {
  const [isLoadingView, setIsLoadingView] = useState(false)
  const [isLoadingDownload, setIsLoadingDownload] = useState(false)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)

  useEffect(() => {
    if (doc.thumbnail_path) {
      getPresignedDownloadUrl(doc.thumbnail_path, false).then(res => {
        if (res?.url) setThumbUrl(res.url)
      })
    }
  }, [doc.thumbnail_path])

  const handleView = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoadingView) return
    setIsLoadingView(true)
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

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoadingDownload) return
    setIsLoadingDownload(true)
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

  return (
    <div onContextMenu={onContextMenu} className="group flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg p-5 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-start gap-4 justify-between">
        <div className="flex items-start gap-4 min-w-0 w-full">
          {thumbUrl ? (
            <img src={thumbUrl} alt="Miniature" className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0 group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-900 dark:text-white truncate" title={doc.title}>{doc.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{formatDate(doc.created_at)}</p>
          </div>
        </div>
        <button onClick={onContextMenu} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shrink-0 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-white/5">
        <button 
          onClick={handleView}
          disabled={isLoadingView}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingView ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Voir
        </button>
        
        <button
          onClick={handleDownload}
          disabled={isLoadingDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingDownload ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Télécharger
        </button>
      </div>
    </div>
  )
}
