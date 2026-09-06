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
  deleteDocumentAction, 
  deleteFolderAction,
  moveDocumentAction,
  moveFolderAction,
  deleteBatchAction,
  moveBatchAction
} from '@/app/actions/storage'
import MoveDocumentModal from '@/components/admin/MoveDocumentModal'
import FileConflictModal, { ConflictResolution } from '@/components/admin/FileConflictModal'

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

export default function AdminDriveClient({ documents: initialDocuments }: { documents: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [cycle, setCycle] = useState('dseb')
  const [year, setYear] = useState<number | null>(1)
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
  const isNoYearCycle = cycle === 'memoires' || cycle === 'bibliotheque'
  const cycleDocuments = documents.filter(doc => doc.cycle === cycle && (isNoYearCycle || doc.year === year))
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
      sourceCycle: cycle,
      sourceYear: isNoYearCycle ? null : year,
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
        sourceCycle: cycle,
        sourceYear: isNoYearCycle ? null : year,
        sourceCategory: fPath,
        folderPath: fPath,
        folderName: fName
      }
    })

    setClipboard({
      type: 'batch',
      sourceCycle: cycle,
      sourceYear: isNoYearCycle ? null : year,
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
      cycle,
      year: isNoYearCycle ? null : year,
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
      const matchCycle = doc.cycle === cycle && (isNoYearCycle || doc.year === year)
      if (matchCycle && doc.category) {
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
      sourceCycle: cycle,
      sourceYear: isNoYearCycle ? null : year,
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
    const targetCycle = cycle
    const targetYear = isNoYearCycle ? null : year

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
      const sameLocation = 
        clipboard.sourceCycle === targetCycle &&
        clipboard.sourceYear === targetYear &&
        (clipboard.sourceCategory || 'Général') === targetCategory

      if (sameLocation) {
        setClipboard(null)
        return
      }

      // Check duplicate/conflict
      const existingDoc = documents.find(d => 
        d.cycle === targetCycle &&
        (isNoYearCycle || d.year === targetYear) &&
        (d.category || 'Général') === targetCategory &&
        d.title.toLowerCase() === sourceDoc.title.toLowerCase() &&
        d.id !== sourceDoc.id &&
        d.title !== '.keep'
      )

      if (existingDoc) {
        const existingTitles = documents
          .filter(d => d.cycle === targetCycle && (isNoYearCycle || d.year === targetYear) && (d.category || 'Général') === targetCategory)
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
        cycle: targetCycle,
        year: targetYear,
        category: targetCategory
      }) : d))
      setClipboard(null)
    } else if (clipboard.type === 'folder' && clipboard.folderPath) {
      const sourcePath = clipboard.folderPath
      
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
          const isMatch = d.cycle === clipboard.sourceCycle && 
            (!isNoYearCycle ? d.year === clipboard.sourceYear : true) && 
            (d.category === sourcePath || d.category?.startsWith(sourcePath + '/'))
          
          if (!isMatch) return d

          const updatedCat = d.category === sourcePath 
            ? newPrefix 
            : (d.category?.startsWith(sourcePath + '/') ? d.category.replace(sourcePath + '/', newPrefix + '/') : newPrefix)

          return {
            ...d,
            cycle: targetCycle,
            year: targetYear,
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
        cycle: targetLocation.cycle,
        year: targetLocation.year,
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
  }, [clipboard, cycle, year, currentPathString, documents, isNoYearCycle, selectedCount, isAllSelected, foldersList, filesHere, selectedFileIds, selectedFolderNames])

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
    
    const res = await deleteFolderAction({
      cycle,
      year: isNoYearCycle ? null : year,
      folderPath
    })

    if (res.error) {
      alert('Erreur de suppression : ' + res.error)
      return
    }
    
    // Update local state immediately
    setDocuments(prev => prev.filter(doc => {
      const matchCycle = doc.cycle === cycle && (isNoYearCycle || doc.year === year)
      const matchFolder = doc.category === folderPath || doc.category?.startsWith(folderPath + '/')
      return !(matchCycle && matchFolder)
    }))
  }

  async function renameFolder(oldName: string, newName: string) {
    if (!newName.trim() || oldName === newName) return
    const oldPath = currentPathString ? `${currentPathString}/${oldName}` : oldName
    const newPath = currentPathString ? `${currentPathString}/${newName}` : newName
    
    const docsToUpdate = documents.filter(doc => doc.cycle === cycle && (isNoYearCycle || doc.year === year) && (doc.category === oldPath || doc.category?.startsWith(oldPath + '/')))
    
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

    setDocuments(prev => prev.map(d => d.id === doc.id ? (res.doc || { ...d, cycle: targetCycle, year: targetYear, category: cleanCat }) : d))
    setShowMoveFileModal(null)
  }

  async function moveFolder(targetCycle: string, targetYear: number | null, targetCategory: string) {
    if (!showMoveFolderModal) return
    const sourcePath = showMoveFolderModal.folderPath
    
    const res = await moveFolderAction({
      sourceCycle: cycle,
      sourceYear: isNoYearCycle ? null : year,
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
        const isMatch = d.cycle === cycle && 
          (!isNoYearCycle ? d.year === year : true) && 
          (d.category === sourcePath || d.category?.startsWith(sourcePath + '/'))
        
        if (!isMatch) return d

        const updatedCat = d.category === sourcePath 
          ? newPrefix 
          : (d.category?.startsWith(sourcePath + '/') ? d.category.replace(sourcePath + '/', newPrefix + '/') : newPrefix)

        return {
          ...d,
          cycle: targetCycle,
          year: targetYear,
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
      const path = isNoYearCycle ? `${cycle}/${Date.now()}_${safeFileName}` : `${cycle}/A${year}/${Date.now()}_${safeFileName}`
      const fileTitle = file.name.replace(/\.[^.]+$/, '')
      
      const { url, error: urlError } = await getPresignedUploadUrl(path, file.type || 'application/octet-stream')

      // Upload main file
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
            const insertData: any = { title: fileTitle, file_path: path, cycle, category }
            if (!isNoYearCycle) insertData.year = year
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
        <div className="absolute inset-0 z-50 bg-cyan-950/40 border-2 border-dashed border-cyan-400 rounded-3xl flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
          <div className="text-center text-cyan-400">
            <UploadIcon className="w-16 h-16 mx-auto mb-4 animate-bounce filter drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" />
            <p className="text-2xl font-mono font-bold tracking-tight">DÉPÔT EN COURS // DROP FILES HERE</p>
            <p className="mt-2 text-sm font-mono opacity-80">Destination : {currentPathString || 'Racine'}</p>
          </div>
        </div>
      )}

      {/* Header & Cycle Selector */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            SYS_ADMIN // RETOUR CONSOLE
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <FolderOpen className="w-7 h-7 text-amber-500 dark:text-amber-400" />
            </div>
            Explorateur Documentaire <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 font-mono text-xl uppercase tracking-wider">(Drive)</span>
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2.5 p-1.5 bg-white/40 dark:bg-[#070D19]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl w-fit">
              {Object.entries(CYCLES).map(([cValue, cData]) => (
                <button
                  key={cValue}
                  onClick={() => { 
                    setCycle(cValue); 
                    const newIsNoYear = cValue === 'memoires' || cValue === 'bibliotheque';
                    setYear(newIsNoYear ? null : 1); 
                    setCurrentPath([]); 
                    setSearchQuery(''); 
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer",
                    cycle === cValue 
                      ? "bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]" 
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                >
                  {cData.label}
                </button>
              ))}
            </div>
            {!isNoYearCycle && (
              <div className="flex flex-wrap gap-2">
                {availableYears.map((y) => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setCurrentPath([]); setSearchQuery('') }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all duration-300 cursor-pointer",
                      year === y 
                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                        : "bg-white/40 dark:bg-[#070D19]/40 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    Année {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {uploading && (
          <div className="flex items-center gap-3 text-xs font-mono text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-5 py-3 rounded-2xl font-bold animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <UploadIcon className="w-4 h-4 animate-bounce" />
            TRANSFERT_EN_COURS // UPLOAD ACTIF...
          </div>
        )}
      </div>

      {/* Search & Breadcrumbs & Selection Toolbar */}
      <div className="bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-5 rounded-3xl mb-8 flex flex-col md:flex-row gap-5 justify-between items-center shadow-sm">

        <div className="flex items-center flex-wrap gap-2 text-xs font-mono font-bold w-full md:w-auto">
          <button 
            onClick={() => setCurrentPath([])}
            className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            {CYCLES[cycle as keyof typeof CYCLES]?.label}
          </button>
          {currentPath.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
              <button
                onClick={() => navigateToCrumb(index)}
                className={cn(
                  "transition-colors px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5",
                  index === currentPath.length - 1 ? "text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400"
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
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
              <button
                type="button"
                onClick={() => handlePaste()}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
                title="Coller ici (Ctrl+V)"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>COLLER ({clipboard.type === 'batch' ? (clipboard.batchDocs?.length || 0) + (clipboard.batchFolders?.length || 0) : 1})</span>
              </button>
              <button
                type="button"
                onClick={() => setClipboard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-500/20 transition-colors cursor-pointer"
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
                "flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all shrink-0 cursor-pointer",
                isAllSelected
                  ? "bg-amber-500 border-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : selectedCount > 0
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-sm"
                  : "bg-white/40 dark:bg-[#070D19]/60 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              )}
              title="Tout sélectionner (Ctrl+A)"
            >
              {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>{isAllSelected ? "Désélectionner tout" : "Tout sélectionner"}</span>
            </button>
          )}

          <div className="relative flex-1 md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {foldersList.length === 0 && filesHere.length === 0 ? (
        <div className="relative overflow-hidden text-center py-20 rounded-3xl border border-dashed border-amber-500/20 dark:border-white/10 bg-white/40 dark:bg-[#070D19]/60 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <FolderOpen className="w-8 h-8" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-1">Ce dossier est vide.</p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-6">SYS_INFO // Clic droit pour créer un dossier ou uploader des fichiers.</p>
          <Button variant="cyber-amber" size="sm" onClick={() => setShowFolderModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Nouveau dossier
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {foldersList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 pl-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Répertoires // Dossiers ({foldersList.length})</h2>
              </div>
              <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-5">
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
                        "group relative flex items-center justify-between gap-3 rounded-2xl border bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl p-4 transition-all duration-300 cursor-pointer shadow-sm",
                        isFolderSelected
                          ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          : isFolderCut 
                          ? "opacity-60 border-dashed border-2 border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30" 
                          : "border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:-translate-y-0.5"
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
                            "w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0",
                            isFolderSelected
                              ? "bg-amber-500 border-amber-500 text-slate-950 shadow-sm"
                              : "border-slate-300 dark:border-white/20 bg-white/80 dark:bg-white/5 opacity-0 group-hover:opacity-100",
                            selectedCount > 0 && "opacity-100"
                          )}
                        >
                          {isFolderSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl group-hover:scale-105 transition-transform duration-300 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                          <Folder className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-amber-500/20 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">{folderName}</span>
                          {isFolderCut && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded mt-0.5">
                              <Scissors className="w-3 h-3" /> CUT
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleContextMenuFolder(e, folderName)}
                        className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
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
              <div className="flex items-center gap-2 mb-4 pl-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h2 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fichiers & Documents ({filesHere.length})</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filesHere.map(doc => {
                  const isFileCut = (clipboard?.type === 'file' && clipboard.doc?.id === doc.id) ||
                    (clipboard?.type === 'batch' && Boolean(clipboard.batchDocs?.some(d => d.id === doc.id)))
                  const isFileSelected = selectedFileIds.includes(doc.id)

                  return (
                    <AdminDocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      supabase={supabase} 
                      isCut={isFileCut}
                      isSelected={isFileSelected}
                      showCheckbox={selectedCount > 0}
                      onToggleSelect={() => toggleSelectFile(doc.id)}
                      onContextMenu={(e) => handleContextMenuFile(e, doc)}
                      onDelete={() => deleteFile(doc.id, doc.file_path, doc.thumbnail_path)}
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
          className="fixed z-50 bg-slate-900/95 dark:bg-[#070D19]/95 backdrop-blur-2xl border border-amber-500/20 dark:border-white/15 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] py-2 w-64 text-xs font-mono overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === 'bg' && (
            <>
              {clipboard && (
                <>
                  <button 
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 flex items-center gap-3 text-emerald-400 font-bold transition-colors cursor-pointer" 
                    onClick={() => handlePaste()}
                  >
                    <ClipboardPaste className="w-4 h-4 text-emerald-400" /> COLLER ICI {clipboard.type === 'batch' ? `(${(clipboard.batchDocs?.length || 0) + (clipboard.batchFolders?.length || 0)})` : ''}
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
                </>
              )}
              <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => setShowFolderModal(true)}>
                <Folder className="w-4 h-4 text-amber-400" /> Nouveau dossier
              </button>
              <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon className="w-4 h-4 text-cyan-400" /> Uploader un fichier
              </button>
              <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => folderInputRef.current?.click()}>
                <FolderOpen className="w-4 h-4 text-cyan-400" /> Uploader un dossier
              </button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              {selectedCount > 0 && selectedFolderNames.includes(contextMenu.targetName!) ? (
                <>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-amber-400 transition-colors cursor-pointer" onClick={handleCutSelection}>
                    <Scissors className="w-4 h-4 text-amber-400" /> Couper la sélection ({selectedCount})
                  </button>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-cyan-400 transition-colors cursor-pointer" onClick={() => { setContextMenu(null); setShowMoveBatchModal(true); }}>
                    <FolderInput className="w-4 h-4 text-cyan-400" /> Déplacer la sélection ({selectedCount})...
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
                  <button className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-3 transition-colors cursor-pointer" onClick={() => { setContextMenu(null); handleDeleteSelection(); }}>
                    <Trash2 className="w-4 h-4 text-red-400" /> Supprimer la sélection ({selectedCount})
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => navigateTo(contextMenu.targetName!)}>
                    <FolderOpen className="w-4 h-4 text-amber-400" /> Ouvrir le dossier
                  </button>
                  {clipboard && (
                    <button 
                      className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 flex items-center gap-3 text-emerald-400 font-bold transition-colors cursor-pointer" 
                      onClick={() => handlePaste(currentPathString ? `${currentPathString}/${contextMenu.targetName!}` : contextMenu.targetName!)}
                    >
                      <ClipboardPaste className="w-4 h-4 text-emerald-400" /> Coller dans ce dossier {clipboard.type === 'batch' ? `(${(clipboard.batchDocs?.length || 0) + (clipboard.batchFolders?.length || 0)})` : ''}
                    </button>
                  )}
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => handleCutFolder(contextMenu.targetName!)}>
                    <Scissors className="w-4 h-4 text-amber-400" /> Couper
                  </button>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => setShowMoveFolderModal({ folderPath: contextMenu.targetName! })}>
                    <FolderInput className="w-4 h-4 text-cyan-400" /> Déplacer...
                  </button>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => setShowRenameFolderModal({ oldPath: contextMenu.targetName! })}>
                    <Edit2 className="w-4 h-4 text-slate-400" /> Renommer
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
                  <button className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-3 transition-colors cursor-pointer" onClick={() => deleteFolder(contextMenu.targetName!)}>
                    <Trash2 className="w-4 h-4 text-red-400" /> Supprimer
                  </button>
                </>
              )}
            </>
          )}
          {contextMenu.type === 'file' && (
            <>
              {selectedCount > 0 && contextMenu.targetDoc && selectedFileIds.includes(contextMenu.targetDoc.id) ? (
                <>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-amber-400 transition-colors cursor-pointer" onClick={handleCutSelection}>
                    <Scissors className="w-4 h-4 text-amber-400" /> Couper la sélection ({selectedCount})
                  </button>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-cyan-400 transition-colors cursor-pointer" onClick={() => { setContextMenu(null); setShowMoveBatchModal(true); }}>
                    <FolderInput className="w-4 h-4 text-cyan-400" /> Déplacer la sélection ({selectedCount})...
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
                  <button className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-3 transition-colors cursor-pointer" onClick={() => { setContextMenu(null); handleDeleteSelection(); }}>
                    <Trash2 className="w-4 h-4 text-red-400" /> Supprimer la sélection ({selectedCount})
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => contextMenu.targetDoc && handleCutFile(contextMenu.targetDoc)}>
                    <Scissors className="w-4 h-4 text-amber-400" /> Couper
                  </button>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => contextMenu.targetDoc && setShowMoveFileModal(contextMenu.targetDoc)}>
                    <FolderInput className="w-4 h-4 text-cyan-400" /> Déplacer...
                  </button>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-slate-200 transition-colors cursor-pointer" onClick={() => contextMenu.targetDoc && setShowRenameFileModal(contextMenu.targetDoc)}>
                    <Edit2 className="w-4 h-4 text-slate-400" /> Renommer
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
                  <button className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-3 transition-colors cursor-pointer" onClick={() => contextMenu.targetDoc && deleteFile(contextMenu.targetDoc.id, contextMenu.targetDoc.file_path, contextMenu.targetDoc.thumbnail_path)}>
                    <Trash2 className="w-4 h-4 text-red-400" /> Supprimer
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
          sourceCycle={cycle}
          sourceYear={year}
          sourceCategory={showMoveFolderModal.folderPath}
          allDocuments={documents}
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
          sourceCycle={cycle}
          sourceYear={isNoYearCycle ? null : year}
          sourceCategory={currentPathString || 'Général'}
          allDocuments={documents}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 animate-slide-up">
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
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
        <div className="fixed bottom-6 right-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl z-50 w-80 animate-slide-up">
          <h3 className="font-bold text-sm mb-4 text-slate-900 dark:text-white flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            Uploads en cours...
          </h3>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id}>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <span className="truncate w-56" title={id.split('-').slice(0, -1).join('-')}>{id.split('-').slice(0, -1).join('-')}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
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
    <div className="fixed inset-0 z-[100] bg-slate-900/50 dark:bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-slate-200 dark:border-white/10 animate-slide-up">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"><X className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function AdminDocumentCard({ 
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
  const handleView = (e: React.MouseEvent) => {
    e.preventDefault()
    const ext = doc.file_path.split('.').pop()?.toLowerCase() || 'pdf'
    const safeTitle = (doc.title || 'document').replace(/[/\\?%*:|"<>]/g, '_')
    const viewUrl = `/assets/documents/${doc.id}/${encodeURIComponent(safeTitle)}.${ext}`
    const win = window.open(viewUrl, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = viewUrl
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
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

  return (
    <div 
      onContextMenu={onContextMenu} 
      onClick={(e) => {
        if (showCheckbox && onToggleSelect) {
          onToggleSelect()
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between gap-4 rounded-3xl border bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl p-5 transition-all duration-300 shadow-sm",
        isSelected
          ? "ring-2 ring-cyan-500 border-cyan-500 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.2)]"
          : isCut
          ? "opacity-50 border-dashed border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20"
          : "border-slate-200/80 dark:border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-3 min-w-0 w-full">
          {/* Checkbox button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect?.()
            }}
            className={cn(
              "w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-3",
              isSelected
                ? "bg-cyan-500 border-cyan-500 text-slate-950 shadow-sm"
                : "border-slate-300 dark:border-white/20 bg-white/80 dark:bg-white/5 opacity-0 group-hover:opacity-100",
              showCheckbox && "opacity-100"
            )}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <FileText className="w-6 h-6 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={doc.title}>{doc.title}</p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">{formatDate(doc.created_at)}</p>
          </div>
        </div>
        <button onClick={onContextMenu} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white shrink-0 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-white/5">
        <button 
          onClick={handleView}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all text-xs font-mono font-bold cursor-pointer shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          VOIR
        </button>
        
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 transition-all text-xs font-mono font-bold cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          TÉLÉCHARGER
        </button>
      </div>
    </div>
  )
}

