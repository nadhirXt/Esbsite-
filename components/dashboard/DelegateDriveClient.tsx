'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { FileText, Download, Folder, FolderOpen, ArrowLeft, ChevronRight, Search, Eye, Plus, Trash2, Edit2, Upload as UploadIcon, MoreVertical, X, Loader2, FolderInput, Scissors, ClipboardPaste, CheckSquare, Square, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, CYCLES, cn } from '@/lib/utils'
import type { Document } from '@/lib/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { 
  getPresignedUploadUrl, 
  getPresignedDownloadUrl, 
  deleteDocumentAction, 
  deleteFolderAction,
  moveDocumentAction,
  moveFolderAction,
  deleteBatchAction,
  moveBatchAction 
} from '@/app/actions/storage'
import MoveDocumentModal from '@/components/admin/MoveDocumentModal'
import FileConflictModal, { ConflictResolution } from '@/components/admin/FileConflictModal'
import { generatePDFThumbnail } from '@/lib/pdf-thumbnail'

interface ClipboardItem {
  type: 'file' | 'folder' | 'batch'
  sourceCycle: string
  sourceYear: number | null
  sourceCategory: string
  doc?: Document
  folderPath?: string
  folderName?: string
  batchDocs?: Document[]
  batchFolders?: {
    sourceCycle: string
    sourceYear: number | null
    sourceCategory: string
    folderPath: string
    folderName: string
  }[]
}

function generateUniqueTitle(baseTitle: string, existingTitles: string[]): string {
  if (!existingTitles.includes(baseTitle)) return baseTitle
  let counter = 1
  const match = baseTitle.match(/^(.*?)(?:\s*\((\d+)\))?$/)
  const rootName = match ? match[1].trim() : baseTitle
  while (existingTitles.includes(`${rootName} (${counter})`)) {
    counter++
  }
  return `${rootName} (${counter})`
}

export default function DelegateDriveClient({ 
  documents: initialDocuments, 
  delegateCycle, 
  delegateYear,
  uploaderId
}: { 
  documents: Document[],
  delegateCycle: string, 
  delegateYear: number,
  uploaderId: string
}) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Multi-Selection State
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [selectedFolderNames, setSelectedFolderNames] = useState<string[]>([])
  const [showMoveBatchModal, setShowMoveBatchModal] = useState(false)

  // Clipboard (Couper / Coller) State
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null)

  // Conflict Resolution State
  const [conflictState, setConflictState] = useState<{
    sourceDoc: Document
    existingDoc: Document
    targetLocation: { cycle: string, year: number | null, category: string }
    suggestedNewTitle: string
  } | null>(null)
  
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
  const [showMoveFileModal, setShowMoveFileModal] = useState<Document | null>(null)
  const [showMoveFolderModal, setShowMoveFolderModal] = useState<{ folderPath: string } | null>(null)
  
  // Upload State (for drag and drop / direct upload)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const supabase = createClient()

  // Prevent navigation when uploading
  useEffect(() => {
    const isUploading = Object.keys(uploadProgress).length > 0
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [uploadProgress])

  // Click outside to close context menu
  useEffect(() => {
    function handleClick() {
      if (contextMenu?.visible) setContextMenu(null)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [contextMenu])

  // Process documents
  const currentPathString = currentPath.join('/')

  const subFolders = new Set<string>()
  let filesHere: Document[] = []

  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase()
    filesHere = documents.filter(doc => doc.title.toLowerCase().includes(query) && doc.title !== '.keep')
  } else {
    documents.forEach(doc => {
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

  // Multi-Selection Helpers
  const selectedCount = selectedFileIds.length + selectedFolderNames.length
  const isAllSelected = (foldersList.length > 0 || filesHere.length > 0) &&
    selectedFolderNames.length === foldersList.length &&
    selectedFileIds.length === filesHere.length

  function clearSelection() {
    setSelectedFileIds([])
    setSelectedFolderNames([])
  }

  function toggleSelectFile(fileId: string) {
    setSelectedFileIds(prev => prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId])
  }

  function toggleSelectFolder(folderName: string) {
    setSelectedFolderNames(prev => prev.includes(folderName) ? prev.filter(n => n !== folderName) : [...prev, folderName])
  }

  function selectAll() {
    if (isAllSelected) {
      clearSelection()
    } else {
      setSelectedFolderNames(foldersList)
      setSelectedFileIds(filesHere.map(f => f.id))
    }
  }

  // Navigation
  function navigateTo(folder: string) { 
    clearSelection()
    setCurrentPath(prev => [...prev, folder]) 
  }
  function navigateToCrumb(index: number) { 
    clearSelection()
    setCurrentPath(prev => prev.slice(0, index + 1)) 
  }

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

  // Couper (Cut)
  function handleCutFile(doc: Document) {
    setClipboard({
      type: 'file',
      sourceCycle: doc.cycle,
      sourceYear: doc.year ?? null,
      sourceCategory: doc.category || 'Général',
      doc
    })
    setContextMenu(null)
  }

  function handleCutFolder(folderName: string) {
    const folderPath = currentPathString ? `${currentPathString}/${folderName}` : folderName
    setClipboard({
      type: 'folder',
      sourceCycle: delegateCycle,
      sourceYear: delegateYear,
      sourceCategory: folderPath,
      folderPath,
      folderName
    })
    setContextMenu(null)
  }

  // Couper la sélection multiple
  function handleCutSelection() {
    if (selectedCount === 0) return
    const selectedDocs = filesHere.filter(d => selectedFileIds.includes(d.id))
    const selectedFolders = selectedFolderNames.map(fName => {
      const fPath = currentPathString ? `${currentPathString}/${fName}` : fName
      return {
        sourceCycle: delegateCycle,
        sourceYear: delegateYear,
        sourceCategory: fPath,
        folderPath: fPath,
        folderName: fName
      }
    })

    setClipboard({
      type: 'batch',
      sourceCycle: delegateCycle,
      sourceYear: delegateYear,
      sourceCategory: currentPathString || 'Général',
      batchDocs: selectedDocs,
      batchFolders: selectedFolders
    })
    clearSelection()
  }

  // Supprimer la sélection multiple
  async function handleDeleteSelection() {
    if (selectedCount === 0) return
    if (!confirm(`Supprimer définitivement les ${selectedCount} éléments sélectionnés et tout leur contenu ?`)) return

    const foldersToDelete = selectedFolderNames.map(fName => ({
      cycle: delegateCycle,
      year: delegateYear,
      folderPath: currentPathString ? `${currentPathString}/${fName}` : fName
    }))

    const res = await deleteBatchAction({
      documentIds: selectedFileIds,
      folders: foldersToDelete
    })

    if (res.error) {
      alert('Erreur lors de la suppression groupée : ' + res.error)
      return
    }

    const deletedFileIdsSet = new Set(selectedFileIds)
    const deletedFolderPaths = new Set(foldersToDelete.map(f => f.folderPath))

    setDocuments(prev => prev.filter(doc => {
      if (deletedFileIdsSet.has(doc.id)) return false
      if (doc.category) {
        for (const fPath of deletedFolderPaths) {
          if (doc.category === fPath || doc.category.startsWith(`${fPath}/`)) return false
        }
      }
      return true
    }))

    clearSelection()
  }

  // Déplacer la sélection multiple
  async function moveBatch(targetCycle: string, targetYear: number | null, targetCategory: string) {
    const foldersToMove = selectedFolderNames.map(fName => ({
      sourceCycle: delegateCycle,
      sourceYear: delegateYear,
      folderPath: currentPathString ? `${currentPathString}/${fName}` : fName
    }))

    const res = await moveBatchAction({
      documentIds: selectedFileIds,
      folders: foldersToMove,
      targetCycle,
      targetYear,
      targetCategory
    })

    if (res.error) {
      alert('Erreur lors du déplacement groupé : ' + res.error)
      throw new Error(res.error)
    }

    if (res.docs && res.docs.length > 0) {
      const updatedMap = new Map(res.docs.map((d: Document) => [d.id, d]))
      setDocuments(prev => prev.map(d => updatedMap.get(d.id) || d))
    }
    setShowMoveBatchModal(false)
    clearSelection()
  }

  // Coller (Paste)
  async function handlePaste(targetCategoryParam?: string) {
    if (!clipboard) return
    const targetCategory = targetCategoryParam !== undefined ? targetCategoryParam : (currentPathString || 'Général')
    const targetCycle = delegateCycle
    const targetYear = delegateYear

    // 1. Batch paste
    if (clipboard.type === 'batch') {
      const docIds = (clipboard.batchDocs || []).map(d => d.id)
      const folders = clipboard.batchFolders || []

      const res = await moveBatchAction({
        documentIds: docIds,
        folders,
        targetCycle,
        targetYear,
        targetCategory
      })

      if (res.error) {
        alert(res.error)
        return
      }

      if (res.docs && res.docs.length > 0) {
        const updatedMap = new Map(res.docs.map((d: Document) => [d.id, d]))
        setDocuments(prev => prev.map(d => updatedMap.get(d.id) || d))
      }
      setClipboard(null)
      return
    }

    // 2. Single file paste
    if (clipboard.type === 'file' && clipboard.doc) {
      const sourceDoc = clipboard.doc
      const sameLocation = (clipboard.sourceCategory || 'Général') === targetCategory

      if (sameLocation) {
        setClipboard(null)
        return
      }

      // Check duplicate/conflict
      const existingDoc = documents.find(d => 
        (d.category || 'Général') === targetCategory &&
        d.title.toLowerCase() === sourceDoc.title.toLowerCase() &&
        d.id !== sourceDoc.id &&
        d.title !== '.keep'
      )

      if (existingDoc) {
        // Open conflict dialog
        const existingTitles = documents
          .filter(d => (d.category || 'Général') === targetCategory)
          .map(d => d.title)
        const suggestedTitle = generateUniqueTitle(sourceDoc.title, existingTitles)

        setConflictState({
          sourceDoc,
          existingDoc,
          targetLocation: { cycle: targetCycle, year: targetYear, category: targetCategory },
          suggestedNewTitle: suggestedTitle
        })
        return
      }

      // No conflict -> move directly
      const res = await moveDocumentAction({
        documentId: sourceDoc.id,
        targetCycle,
        targetYear,
        targetCategory,
      })

      if (res.error) {
        alert(res.error)
        return
      }

      setDocuments(prev => prev.map(d => d.id === sourceDoc.id ? (res.doc || {
        ...d,
        category: targetCategory
      }) : d))
      setClipboard(null)
    } else if (clipboard.type === 'folder' && clipboard.folderPath) {
      const sourcePath = clipboard.folderPath
      
      // Prevent pasting folder into itself or its children
      if (targetCategory === sourcePath || targetCategory.startsWith(`${sourcePath}/`)) {
        alert("Impossible de déplacer un dossier dans lui-même ou dans l'un de ses sous-dossiers.")
        return
      }

      const res = await moveFolderAction({
        sourceCycle: clipboard.sourceCycle,
        sourceYear: clipboard.sourceYear,
        sourceFolderPath: sourcePath,
        targetCycle,
        targetYear,
        targetCategory
      })

      if (res.error) {
        alert(res.error)
        return
      }

      if (res.docs && res.docs.length > 0) {
        const updatedMap = new Map(res.docs.map((d: Document) => [d.id, d]))
        setDocuments(prev => prev.map(d => updatedMap.get(d.id) || d))
      } else {
        const folderBaseName = sourcePath.split('/').pop() || sourcePath
        const newPrefix = (!targetCategory || targetCategory === 'Général')
          ? folderBaseName
          : `${targetCategory}/${folderBaseName}`

        setDocuments(prev => prev.map(d => {
          const isMatch = d.category === sourcePath || d.category?.startsWith(sourcePath + '/')
          if (!isMatch) return d

          const updatedCat = d.category === sourcePath 
            ? newPrefix 
            : (d.category?.startsWith(sourcePath + '/') ? d.category.replace(sourcePath + '/', newPrefix + '/') : newPrefix)

          return {
            ...d,
            category: updatedCat
          }
        }))
      }
      setClipboard(null)
    }
  }

  // Conflict Modal Resolution
  async function handleConflictResolve(resolution: ConflictResolution) {
    if (!conflictState) return
    const { sourceDoc, existingDoc, targetLocation, suggestedNewTitle } = conflictState
    setConflictState(null)

    if (resolution === 'skip') {
      setClipboard(null)
      return
    }

    const res = await moveDocumentAction({
      documentId: sourceDoc.id,
      targetCycle: targetLocation.cycle,
      targetYear: targetLocation.year,
      targetCategory: targetLocation.category,
      conflictStrategy: resolution,
      newTitle: resolution === 'rename' ? suggestedNewTitle : undefined
    })

    if (res.error) {
      alert(res.error)
      return
    }

    setDocuments(prev => {
      let filtered = prev
      if (resolution === 'replace') {
        filtered = filtered.filter(d => d.id !== existingDoc.id)
      }
      return filtered.map(d => d.id === sourceDoc.id ? (res.doc || {
        ...d,
        title: resolution === 'rename' ? suggestedNewTitle : d.title,
        category: targetLocation.category
      }) : d)
    })

    setClipboard(null)
  }

  // Keyboard Shortcuts (Ctrl+A, Ctrl+X, Ctrl+V, Escape)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        selectAll()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        if (selectedCount > 0) {
          e.preventDefault()
          handleCutSelection()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (clipboard) {
          e.preventDefault()
          handlePaste()
        }
      } else if (e.key === 'Escape') {
        if (selectedCount > 0) {
          clearSelection()
        } else if (clipboard) {
          setClipboard(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clipboard, delegateCycle, delegateYear, currentPathString, documents, selectedCount, isAllSelected, foldersList, filesHere, selectedFileIds, selectedFolderNames])

  // Actions
  async function createFolder(folderName: string) {
    if (!folderName.trim()) return
    const folderPath = currentPathString ? `${currentPathString}/${folderName}` : folderName
    const { data, error } = await supabase.from('documents').insert({
      title: '.keep',
      file_path: '.keep',
      cycle: delegateCycle,
      year: delegateYear,
      category: folderPath,
      uploader_id: uploaderId
    }).select().single()

    if (!error && data) {
      setDocuments(prev => [data, ...prev])
    }
    setShowFolderModal(false)
  }

  async function deleteFolder(folderName: string) {
    if (!confirm(`Supprimer le dossier "${folderName}" et TOUT son contenu ?`)) return
    const folderPath = currentPathString ? `${currentPathString}/${folderName}` : folderName
    
    const res = await deleteFolderAction({
      cycle: delegateCycle,
      year: delegateYear,
      folderPath
    })

    if (res.error) {
      alert('Erreur lors de la suppression : ' + res.error)
      return
    }

    setDocuments(prev => prev.filter(doc => !(doc.category === folderPath || doc.category?.startsWith(folderPath + '/'))))
  }

  async function renameFolder(oldName: string, newName: string) {
    if (!newName.trim() || oldName === newName) return
    const oldPath = currentPathString ? `${currentPathString}/${oldName}` : oldName
    const newPath = currentPathString ? `${currentPathString}/${newName}` : newName
    
    const docsToUpdate = documents.filter(doc => (doc.category === oldPath || doc.category?.startsWith(oldPath + '/')))
    
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

  async function deleteFile(id: string) {
    if (!confirm('Supprimer ce fichier ?')) return
    
    const res = await deleteDocumentAction(id)
    if (res.error) {
      alert('Erreur lors de la suppression : ' + res.error)
      return
    }

    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  async function renameFile(doc: Document, newTitle: string) {
    if (!newTitle.trim() || newTitle === doc.title) return
    await supabase.from('documents').update({ title: newTitle }).eq('id', doc.id)
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, title: newTitle } : d))
    setShowRenameFileModal(null)
  }

  async function moveFile(targetCycle: string, targetYear: number | null, targetCategory: string) {
    if (!showMoveFileModal) return
    const doc = showMoveFileModal
    const cleanCat = targetCategory.trim() || 'Général'
    
    const res = await moveDocumentAction({
      documentId: doc.id,
      targetCycle,
      targetYear,
      targetCategory: cleanCat
    })

    if (res.error) {
      alert('Erreur lors du déplacement : ' + res.error)
      throw new Error(res.error)
    }

    setDocuments(prev => prev.map(d => d.id === doc.id ? (res.doc || { ...d, category: cleanCat }) : d))
    setShowMoveFileModal(null)
  }

  async function moveFolder(targetCycle: string, targetYear: number | null, targetCategory: string) {
    if (!showMoveFolderModal) return
    const sourcePath = showMoveFolderModal.folderPath
    
    const res = await moveFolderAction({
      sourceCycle: delegateCycle,
      sourceYear: delegateYear,
      sourceFolderPath: sourcePath,
      targetCycle,
      targetYear,
      targetCategory
    })

    if (res.error) {
      alert('Erreur lors du déplacement du dossier : ' + res.error)
      throw new Error(res.error)
    }

    if (res.docs && res.docs.length > 0) {
      const updatedMap = new Map(res.docs.map((d: Document) => [d.id, d]))
      setDocuments(prev => prev.map(d => updatedMap.get(d.id) || d))
    } else {
      const folderBaseName = sourcePath.split('/').pop() || sourcePath
      const newPrefix = (!targetCategory || targetCategory === 'Général')
        ? folderBaseName
        : `${targetCategory}/${folderBaseName}`

      setDocuments(prev => prev.map(d => {
        const isMatch = d.category === sourcePath || d.category?.startsWith(sourcePath + '/')
        if (!isMatch) return d

        const updatedCat = d.category === sourcePath 
          ? newPrefix 
          : (d.category?.startsWith(sourcePath + '/') ? d.category.replace(sourcePath + '/', newPrefix + '/') : newPrefix)

        return {
          ...d,
          category: updatedCat
        }
      }))
    }
    setShowMoveFolderModal(null)
  }

  async function handleFilesUpload(files: FileList | File[] | any[]) {
    if (files.length === 0) return
    setUploading(true)
    const baseCategory = currentPathString || 'Général'

    const newDocs: Document[] = []
    
    for (const file of Array.from(files) as any[]) {
      const fileId = `${file.name}-${Date.now()}`
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

      let relativeCat = ''
      const pathStr = file.customPath || file.webkitRelativePath || ''
      if (pathStr) {
        const parts = pathStr.split('/')
        parts.pop() // remove filename
        if (parts.length > 0) {
          relativeCat = parts.join('/')
        }
      }
      
      const category = relativeCat 
        ? (baseCategory === 'Général' ? relativeCat : `${baseCategory}/${relativeCat}`)
        : baseCategory

      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
      const path = `${delegateCycle}/A${delegateYear}/${Date.now()}_${safeFileName}`
      const fileTitle = file.name.replace(/\.[^.]+$/, '')
      
      const { url, error: urlError } = await getPresignedUploadUrl(path, file.type || 'application/octet-stream')
      
      // 1. Generate and upload thumbnail if PDF
      let thumbnailPath: string | null = null
      if (file.type === 'application/pdf') {
        const thumbBlob = await generatePDFThumbnail(file)
        if (thumbBlob) {
          const thumbName = `${delegateCycle}/A${delegateYear}/${Date.now()}_thumb_${safeFileName}.jpg`
          const { url: thumbUrl } = await getPresignedUploadUrl(thumbName, 'image/jpeg')
          if (thumbUrl) {
            try {
              const thumbRes = await fetch(thumbUrl, { method: 'PUT', body: thumbBlob, headers: { 'Content-Type': 'image/jpeg' } })
              if (thumbRes.ok) {
                thumbnailPath = thumbName
              }
            } catch (e) {
              console.error('Failed to upload thumbnail', e)
            }
          }
        }
      }

      if (!urlError && url) {
        try {
          const success = await new Promise<boolean>((resolve) => {
            const xhr = new XMLHttpRequest()
            xhr.open('PUT', url, true)
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
            
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100)
                setUploadProgress(prev => ({ ...prev, [fileId]: percent }))
              }
            }

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(true)
              } else {
                console.error("Upload error text:", xhr.responseText)
                resolve(false)
              }
            }

            xhr.onerror = () => {
              console.error("Upload xhr error")
              resolve(false)
            }

            xhr.send(file)
          })

          if (success) {
            const insertData: any = {
              title: fileTitle,
              file_path: path,
              cycle: delegateCycle,
              year: delegateYear,
              category,
              uploader_id: uploaderId
            }
            if (thumbnailPath) {
              insertData.thumbnail_path = thumbnailPath
            }

            const { data, error: dbError } = await supabase.from('documents').insert(insertData).select().single()
            
            if (data) newDocs.push(data)
          } else {
            console.error("Upload error text:", "Upload failed")
            alert(`Erreur d'upload. Vérifiez vos CORS.`)
          }
        } catch (err: any) {
          console.error("Upload fetch error", err)
        }
      }
      
      setUploadProgress(prev => {
        const next = { ...prev }
        delete next[fileId]
        return next
      })
    }
    setDocuments(prev => [...newDocs, ...prev])
    setUploading(false)
  }

  // Drag and drop handlers
  const getFilesFromDataTransferItems = async (items: DataTransferItemList) => {
    const files: any[] = []
    
    const readEntry = async (entry: any, path: string = '') => {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve) => entry.file(resolve))
        Object.defineProperty(file, 'customPath', { value: path + file.name })
        files.push(file)
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader()
        
        const readAllEntries = async (reader: any): Promise<any[]> => {
          let allEntries: any[] = []
          let currentEntries = await new Promise<any[]>((resolve) => reader.readEntries(resolve))
          while (currentEntries.length > 0) {
            allEntries = allEntries.concat(currentEntries)
            currentEntries = await new Promise<any[]>((resolve) => reader.readEntries(resolve))
          }
          return allEntries
        }
        
        const entries = await readAllEntries(dirReader)
        for (const e of entries) {
          await readEntry(e, path + entry.name + '/')
        }
      }
    }

    const promises = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry()
        if (entry) {
          promises.push(readEntry(entry))
        }
      }
    }
    await Promise.all(promises)
    return files
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }
  async function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.items) {
      const files = await getFilesFromDataTransferItems(e.dataTransfer.items)
      if (files.length > 0) handleFilesUpload(files)
    } else if (e.dataTransfer.files?.length > 0) {
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
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au tableau de bord
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Espace Délégué</h1>
            <p className="text-[#64748B] text-sm">
              Vous gérez les fichiers de la <strong className="text-[#1E3A8A] uppercase">{delegateCycle}</strong> - Année <strong className="text-[#1E3A8A]">{delegateYear}</strong>
            </p>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-[#1E3A8A] bg-[#EFF6FF] px-4 py-2 rounded-lg font-medium animate-pulse">
              <UploadIcon className="w-4 h-4" />
              Upload en cours...
            </div>
          )}
        </div>
      </div>

      {/* Search & Breadcrumbs & Selection Toolbar */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex items-center flex-wrap gap-2 text-sm font-medium w-full md:w-auto">
          <button 
            onClick={() => setCurrentPath([])}
            className="text-[#64748B] hover:text-[#1E3A8A] transition-colors flex items-center gap-1"
          >
            <FolderOpen className="w-4 h-4" />
            Racine ({delegateCycle.toUpperCase()} {delegateYear}A)
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
        
        <div className="flex items-center flex-wrap gap-3 w-full md:w-auto justify-end">
          {/* Direct Paste button in Toolbar when clipboard active */}
          {clipboard && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 p-1 rounded-xl shadow-sm animate-pulse">
              <button
                type="button"
                onClick={() => handlePaste()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                title="Coller ici (Ctrl+V)"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Coller ici ({clipboard.type === 'batch' ? (clipboard.batchDocs?.length || 0) + (clipboard.batchFolders?.length || 0) : 1})</span>
              </button>
              <button
                type="button"
                onClick={() => setClipboard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Annuler le couper (Échap)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {(foldersList.length > 0 || filesHere.length > 0) && (
            <button
              type="button"
              onClick={selectAll}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all shrink-0 cursor-pointer",
                isAllSelected
                  ? "bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-sm"
                  : selectedCount > 0
                  ? "bg-blue-50 border-blue-200 text-[#1E3A8A]"
                  : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
              )}
              title="Tout sélectionner (Ctrl+A)"
            >
              {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>{isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}</span>
            </button>
          )}

          <div className="relative flex-1 md:w-64 shrink-0">
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
                {foldersList.map(folderName => {
                  const folderPath = currentPathString ? `${currentPathString}/${folderName}` : folderName
                  const isFolderCut = (clipboard?.type === 'folder' && clipboard.folderPath === folderPath) ||
                    (clipboard?.type === 'batch' && Boolean(clipboard.batchFolders?.some(f => f.folderPath === folderPath)))
                  const isFolderSelected = selectedFolderNames.includes(folderName)

                  return (
                    <div
                      key={folderName}
                      onContextMenu={(e) => handleContextMenuFolder(e, folderName)}
                      onClick={() => {
                        if (selectedCount > 0) {
                          toggleSelectFolder(folderName)
                        } else {
                          navigateTo(folderName)
                        }
                      }}
                      className={cn(
                        "group relative flex items-center justify-between gap-3 rounded-xl border bg-white p-3 hover:shadow-md transition-all cursor-pointer",
                        isFolderSelected
                          ? "ring-2 ring-[#1E3A8A] border-[#1E3A8A] bg-blue-50/50"
                          : isFolderCut 
                          ? "opacity-60 border-dashed border-2 border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/30" 
                          : "border-[#E2E8F0] hover:border-[#1E3A8A]/30"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelectFolder(folderName)
                          }}
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0",
                            isFolderSelected
                              ? "bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-sm"
                              : "border-[#CBD5E1] bg-white opacity-0 group-hover:opacity-100",
                            selectedCount > 0 && "opacity-100"
                          )}
                        >
                          {isFolderSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <Folder className="w-6 h-6 text-[#1E3A8A] fill-[#EFF6FF] shrink-0" />
                        <div className="min-w-0">
                          <span className="font-medium text-[#0F172A] truncate block">{folderName}</span>
                          {isFolderCut && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5">
                              <Scissors className="w-3 h-3" /> Coupé
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleContextMenuFolder(e, folderName)}
                        className="p-1 rounded-md text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] shrink-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {filesHere.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#64748B] mb-3 uppercase tracking-wider">Fichiers</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filesHere.map(doc => {
                  const isFileCut = (clipboard?.type === 'file' && clipboard.doc?.id === doc.id) ||
                    (clipboard?.type === 'batch' && Boolean(clipboard.batchDocs?.some(d => d.id === doc.id)))
                  const isFileSelected = selectedFileIds.includes(doc.id)

                  return (
                    <DelegateDocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      supabase={supabase} 
                      isCut={isFileCut}
                      isSelected={isFileSelected}
                      showCheckbox={selectedCount > 0}
                      onToggleSelect={() => toggleSelectFile(doc.id)}
                      onContextMenu={(e) => handleContextMenuFile(e, doc)}
                      onDelete={() => deleteFile(doc.id)}
                      onRename={() => setShowRenameFileModal(doc)}
                      onMove={() => setShowMoveFileModal(doc)}
                      onCut={() => handleCutFile(doc)}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu?.visible && (
        <div 
          className="fixed z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 w-56 text-sm font-medium overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === 'bg' && (
            <>
              {clipboard && (
                <>
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-[#EFF6FF] text-[#1E3A8A] font-semibold flex items-center gap-2 transition-colors" 
                    onClick={() => handlePaste()}
                  >
                    <ClipboardPaste className="w-4 h-4" /> Coller ici {clipboard.type === 'batch' ? `(${(clipboard.batchDocs?.length || 0) + (clipboard.batchFolders?.length || 0)})` : ''}
                  </button>
                  <div className="h-px bg-[#E2E8F0] my-1" />
                </>
              )}
              <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => setShowFolderModal(true)}>
                <Folder className="w-4 h-4 text-[#64748B]" /> Nouveau dossier
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon className="w-4 h-4 text-[#64748B]" /> Uploader un fichier
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => folderInputRef.current?.click()}>
                <FolderOpen className="w-4 h-4 text-[#64748B]" /> Uploader un dossier
              </button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              {selectedCount > 0 && selectedFolderNames.includes(contextMenu.targetName!) ? (
                <>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700 font-semibold" onClick={handleCutSelection}>
                    <Scissors className="w-4 h-4 text-[#1E3A8A]" /> Couper la sélection ({selectedCount})
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700 font-semibold" onClick={() => { setContextMenu(null); setShowMoveBatchModal(true); }}>
                    <FolderInput className="w-4 h-4 text-emerald-600" /> Déplacer la sélection ({selectedCount})...
                  </button>
                  <div className="h-px bg-[#E2E8F0] my-1" />
                  <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-semibold" onClick={() => { setContextMenu(null); handleDeleteSelection(); }}>
                    <Trash2 className="w-4 h-4" /> Supprimer la sélection ({selectedCount})
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => navigateTo(contextMenu.targetName!)}>
                    <FolderOpen className="w-4 h-4 text-[#64748B]" /> Ouvrir
                  </button>
                  {clipboard && (
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-[#EFF6FF] text-[#1E3A8A] font-semibold flex items-center gap-2 transition-colors" 
                      onClick={() => handlePaste(currentPathString ? `${currentPathString}/${contextMenu.targetName!}` : contextMenu.targetName!)}
                    >
                      <ClipboardPaste className="w-4 h-4" /> Coller dans ce dossier {clipboard.type === 'batch' ? `(${(clipboard.batchDocs?.length || 0) + (clipboard.batchFolders?.length || 0)})` : ''}
                    </button>
                  )}
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => handleCutFolder(contextMenu.targetName!)}>
                    <Scissors className="w-4 h-4 text-[#64748B]" /> Couper
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => setShowMoveFolderModal({ folderPath: contextMenu.targetName! })}>
                    <FolderInput className="w-4 h-4 text-[#64748B]" /> Déplacer...
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => setShowRenameFolderModal({ oldPath: contextMenu.targetName! })}>
                    <Edit2 className="w-4 h-4 text-[#64748B]" /> Renommer
                  </button>
                  <div className="h-px bg-[#E2E8F0] my-1" />
                  <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2" onClick={() => deleteFolder(contextMenu.targetName!)}>
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </>
              )}
            </>
          )}
          {contextMenu.type === 'file' && (
            <>
              {selectedCount > 0 && contextMenu.targetDoc && selectedFileIds.includes(contextMenu.targetDoc.id) ? (
                <>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700 font-semibold" onClick={handleCutSelection}>
                    <Scissors className="w-4 h-4 text-[#1E3A8A]" /> Couper la sélection ({selectedCount})
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700 font-semibold" onClick={() => { setContextMenu(null); setShowMoveBatchModal(true); }}>
                    <FolderInput className="w-4 h-4 text-emerald-600" /> Déplacer la sélection ({selectedCount})...
                  </button>
                  <div className="h-px bg-[#E2E8F0] my-1" />
                  <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-semibold" onClick={() => { setContextMenu(null); handleDeleteSelection(); }}>
                    <Trash2 className="w-4 h-4" /> Supprimer la sélection ({selectedCount})
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => contextMenu.targetDoc && handleCutFile(contextMenu.targetDoc)}>
                    <Scissors className="w-4 h-4 text-[#64748B]" /> Couper
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => contextMenu.targetDoc && setShowMoveFileModal(contextMenu.targetDoc)}>
                    <FolderInput className="w-4 h-4 text-[#64748B]" /> Déplacer...
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-slate-700" onClick={() => contextMenu.targetDoc && setShowRenameFileModal(contextMenu.targetDoc)}>
                    <Edit2 className="w-4 h-4 text-[#64748B]" /> Renommer
                  </button>
                  <div className="h-px bg-[#E2E8F0] my-1" />
                  <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2" onClick={() => contextMenu.targetDoc && deleteFile(contextMenu.targetDoc.id)}>
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </>
              )}
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
      <input 
        type="file" 
        multiple 
        {...{ webkitdirectory: "", directory: "" }}
        className="hidden" 
        ref={folderInputRef}
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

      {/* Modal: Déplacer un fichier */}
      {showMoveFileModal && (
        <MoveDocumentModal
          isOpen={Boolean(showMoveFileModal)}
          onClose={() => setShowMoveFileModal(null)}
          type="file"
          itemTitle={showMoveFileModal.title}
          sourceCycle={showMoveFileModal.cycle}
          sourceYear={showMoveFileModal.year ?? null}
          sourceCategory={showMoveFileModal.category || 'Général'}
          allDocuments={documents}
          isDelegate={true}
          onConfirmMove={moveFile}
        />
      )}

      {/* Modal: Déplacer un dossier */}
      {showMoveFolderModal && (
        <MoveDocumentModal
          isOpen={Boolean(showMoveFolderModal)}
          onClose={() => setShowMoveFolderModal(null)}
          type="folder"
          itemTitle={showMoveFolderModal.folderPath.split('/').pop() || showMoveFolderModal.folderPath}
          sourceCycle={delegateCycle}
          sourceYear={delegateYear}
          sourceCategory={showMoveFolderModal.folderPath}
          allDocuments={documents}
          isDelegate={true}
          onConfirmMove={moveFolder}
        />
      )}

      {/* Modal: Déplacer la sélection multiple */}
      {showMoveBatchModal && (
        <MoveDocumentModal
          isOpen={Boolean(showMoveBatchModal)}
          onClose={() => setShowMoveBatchModal(false)}
          type="batch"
          itemTitle={`${selectedCount} éléments sélectionnés`}
          sourceCycle={delegateCycle}
          sourceYear={delegateYear}
          sourceCategory={currentPathString || 'Général'}
          allDocuments={documents}
          isDelegate={true}
          onConfirmMove={moveBatch}
        />
      )}

      {/* Modal: Résolution de conflit (Fichier en doublon) */}
      {conflictState && (
        <FileConflictModal
          isOpen={Boolean(conflictState)}
          onClose={() => setConflictState(null)}
          sourceDoc={conflictState.sourceDoc}
          existingDoc={conflictState.existingDoc}
          targetLocation={conflictState.targetLocation}
          suggestedNewTitle={conflictState.suggestedNewTitle}
          onResolve={handleConflictResolve}
        />
      )}

      {/* Floating Multi-Selection Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 animate-slide-up">
          <div className="flex items-center gap-2 pr-2 border-r border-white/10">
            <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">
              {selectedCount}
            </span>
            <span className="text-xs font-medium text-slate-300">
              sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCutSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
            title="Couper la sélection (Ctrl+X)"
          >
            <Scissors className="w-3.5 h-3.5 text-blue-400" />
            Couper
          </button>

          <button
            type="button"
            onClick={() => setShowMoveBatchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
            title="Déplacer la sélection"
          >
            <FolderInput className="w-3.5 h-3.5 text-emerald-400" />
            Déplacer
          </button>

          <button
            type="button"
            onClick={handleDeleteSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Supprimer la sélection"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>

          <button
            type="button"
            onClick={clearSelection}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            title="Désélectionner tout (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Clipboard Bar (Couper / Coller) */}
      {clipboard && selectedCount === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg animate-pulse">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="text-slate-400 block text-[11px]">
                {clipboard.type === 'batch'
                  ? `${(clipboard.batchDocs?.length || 0) + (clipboard.batchFolders?.length || 0)} éléments coupés`
                  : 'Élément coupé (prêt à coller) :'}
              </span>
              <strong className="text-white truncate max-w-xs block font-bold">
                {clipboard.type === 'batch' 
                  ? 'Sélection multiple' 
                  : (clipboard.type === 'file' ? clipboard.doc?.title : clipboard.folderName)}
              </strong>
            </div>
          </div>
          <div className="h-6 w-px bg-white/10 mx-1" />
          <button
            onClick={() => handlePaste()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4" />
            Coller ici
          </button>
          <button
            onClick={() => setClipboard(null)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Annuler (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Upload Progress Toast */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xl z-50 w-80 animate-in slide-in-from-bottom-5">
          <h3 className="font-bold text-sm mb-4 text-[#0F172A] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
            Uploads en cours...
          </h3>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id}>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-[#64748B]">
                  <span className="truncate w-56" title={id.split('-').slice(0, -1).join('-')}>{id.split('-').slice(0, -1).join('-')}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#1E3A8A] h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

function DelegateDocumentCard({ 
  doc, 
  supabase, 
  isCut, 
  isSelected, 
  showCheckbox,
  onToggleSelect, 
  onContextMenu, 
  onDelete, 
  onRename, 
  onMove, 
  onCut 
}: { 
  doc: Document
  supabase: any
  isCut?: boolean
  isSelected?: boolean
  showCheckbox?: boolean
  onToggleSelect?: () => void
  onContextMenu: (e:any) => void
  onDelete: () => void
  onRename: () => void
  onMove?: () => void
  onCut?: () => void 
}) {
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
    <div 
      onContextMenu={onContextMenu} 
      onClick={(e) => {
        if (showCheckbox && onToggleSelect) {
          onToggleSelect()
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 hover:shadow-md transition-all duration-200 cursor-pointer",
        isSelected
          ? "ring-2 ring-[#1E3A8A] border-[#1E3A8A] bg-blue-50/40"
          : isCut
          ? "opacity-50 border-dashed border-[#1E3A8A] bg-blue-50/20 ring-2 ring-[#1E3A8A]/20"
          : "border-[#E2E8F0] hover:border-[#1E3A8A]/30"
      )}
    >
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {/* Checkbox button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect?.()
            }}
            className={cn(
              "w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-2",
              isSelected
                ? "bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-sm"
                : "border-[#CBD5E1] bg-white opacity-0 group-hover:opacity-100",
              showCheckbox && "opacity-100"
            )}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {thumbUrl ? (
            <img src={thumbUrl} alt="Miniature" className="w-10 h-10 rounded-xl object-cover border border-[#E2E8F0] shrink-0 group-hover:scale-105 transition-transform duration-200" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] truncate" title={doc.title}>{doc.title}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{formatDate(doc.created_at)}</p>
          </div>
        </div>
        <button onClick={onContextMenu} className="p-1 rounded-md text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] shrink-0">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 mt-1 pt-3 border-t border-[#F1F5F9]">
        <button 
          onClick={handleView}
          disabled={isLoadingView}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE] transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingView ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
          Voir
        </button>
        
        <button
          onClick={handleDownload}
          disabled={isLoadingDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingDownload ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Télécharger
        </button>
      </div>
    </div>
  )
}



