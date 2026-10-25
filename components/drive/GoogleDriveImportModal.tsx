'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  X, Link2, FolderOpen, Sparkles, Check, AlertTriangle,
  Loader2, Trash2, CloudDownload, Copy, RefreshCw, Ban,
  ChevronRight, FileText, Folder, Search, ArrowLeft, LogOut, CheckSquare, Square
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { Document } from '@/lib/types'
import {
  cleanFileNameToTitle,
  detectAcademicType,
  formatBytes,
  generateUniqueTitle,
  type AcademicType
} from '@/lib/upload/smart-upload'
import type { ScannedDriveFile } from '@/app/api/admin/google-drive/scan/route'
import type { DriveBrowserEntry } from '@/app/api/admin/google-drive/browse/route'

interface GoogleDriveStagedItem extends ScannedDriveFile {
  id: string
  cleanTitle: string
  detectedType: AcademicType
  targetCategory: string
  isConflict: boolean
  existingDoc?: Document
  conflictAction: 'replace' | 'rename' | 'skip'
  suggestedNewTitle: string
  status: 'ready' | 'transferring' | 'done' | 'error'
  errorMsg?: string
}

interface GoogleDriveImportModalProps {
  isOpen: boolean
  onClose: () => void
  existingDocs: Document[]
  targetLocation: {
    cycle: string
    year: number | null
    category: string
  }
  onDocumentImported: (doc: Document) => void
}

const DEFAULT_CLIENT_ID = '57964261704-r7lmkv3otpol310vrjfpk014afpkgt1u.apps.googleusercontent.com'
const DEFAULT_API_KEY = 'AIzaSyA9P9BJJJWkCwHGLQHa3EGn0ECm0tRWjRU'

export default function GoogleDriveImportModal({
  isOpen,
  onClose,
  existingDocs,
  targetLocation,
  onDocumentImported,
}: GoogleDriveImportModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'picker'>('link')
  const [linksInput, setLinksInput] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [stagedItems, setStagedItems] = useState<GoogleDriveStagedItem[]>([])

  // Jeton OAuth Google Drive (100% compatible Brave Browser — sans script tiers bloqué)
  const [oauthToken, setOauthToken] = useState<string | null>(null)
  const [driveEntries, setDriveEntries] = useState<DriveBrowserEntry[]>([])
  const [isLoadingDrive, setIsLoadingDrive] = useState(false)
  const [driveFolderStack, setDriveFolderStack] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'Mon Drive' },
  ])
  const [driveSearch, setDriveSearch] = useState('')
  const [selectedDriveIds, setSelectedDriveIds] = useState<string[]>([])

  // Charger le token OAuth stocké et écouter la popup OAuth
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedToken = localStorage.getItem('esb_gdrive_oauth_token')
    if (savedToken) {
      setOauthToken(savedToken)
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ESB_GDRIVE_TOKEN' && event.data.token) {
        localStorage.setItem('esb_gdrive_oauth_token', event.data.token)
        setOauthToken(event.data.token)
        setActiveTab('picker')
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'esb_gdrive_oauth_token' && event.newValue) {
        setOauthToken(event.newValue)
        setActiveTab('picker')
      }
    }

    window.addEventListener('message', handleMessage)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const currentDriveFolder = driveFolderStack[driveFolderStack.length - 1]

  const fetchDriveDirectory = useCallback(
    async (token: string, folderId: string, query = '') => {
      setIsLoadingDrive(true)
      setScanError(null)
      try {
        const res = await fetch('/api/admin/google-drive/browse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: token,
            folderId,
            searchQuery: query,
          }),
        })
        const data = await res.json()
        if (res.status === 401 || data.error === 'TOKEN_EXPIRED') {
          localStorage.removeItem('esb_gdrive_oauth_token')
          setOauthToken(null)
          setScanError('Session Google expirée. Cliquez sur « Connecter mon Google Drive ».')
          return
        }
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du chargement de Google Drive')
        }
        setDriveEntries(data.entries || [])
        setSelectedDriveIds([])
      } catch (err: any) {
        setScanError(err.message)
      } finally {
        setIsLoadingDrive(false)
      }
    },
    []
  )

  useEffect(() => {
    if (isOpen && activeTab === 'picker' && oauthToken) {
      fetchDriveDirectory(oauthToken, currentDriveFolder.id, driveSearch)
    }
  }, [isOpen, activeTab, oauthToken, currentDriveFolder.id, fetchDriveDirectory])

  if (!isOpen) return null

  /**
   * Ouvre la fenêtre OAuth2 Google standard (non bloquée par Brave Shields !)
   */
  const handleConnectGoogleAccount = () => {
    setScanError(null)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID
    // Utiliser l'URI exacte autorisée dans Google Cloud Console
    const redirectUri =
      window.location.hostname === 'localhost'
        ? `${window.location.origin}/admin/documents`
        : 'https://www.esbhub.study/admin/documents'

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent('https://www.googleapis.com/auth/drive.readonly')}` +
      `&include_granted_scopes=true` +
      `&prompt=select_account`

    const width = 520
    const height = 640
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      authUrl,
      'esb_google_oauth',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )

    if (!popup) {
      // Si les popups sont bloquées, rediriger dans l'onglet courant
      window.location.href = authUrl
    }
  }

  const handleDisconnectGoogle = () => {
    localStorage.removeItem('esb_gdrive_oauth_token')
    setOauthToken(null)
    setDriveEntries([])
  }

  /**
   * Convertit les fichiers scannés depuis Google Drive en éléments intelligents avec détection des doublons
   */
  const buildStagedItems = (scanned: ScannedDriveFile[]): GoogleDriveStagedItem[] => {
    const existingFolderDocs = existingDocs.filter(d => {
      const matchCycle = d.cycle === targetLocation.cycle
      const matchYear = targetLocation.year !== null ? Number(d.year) === Number(targetLocation.year) : true
      return matchCycle && matchYear
    })
    const existingTitles = existingFolderDocs.map(d => d.title)

    return scanned.map((file, idx) => {
      const cleanTitle = cleanFileNameToTitle(file.name)
      const detectedType = detectAcademicType(file.name)

      let relativeCat = ''
      if (file.relativePath && file.relativePath.includes('/')) {
        const parts = file.relativePath.split('/')
        parts.pop()
        relativeCat = parts.join('/')
      }

      const baseCat = targetLocation.category || 'Général'
      const targetCategory = relativeCat
        ? (baseCat === 'Général' ? relativeCat : `${baseCat}/${relativeCat}`)
        : baseCat

      const matchingDoc = existingFolderDocs.find(
        d =>
          (d.category || 'Général') === targetCategory &&
          d.title.trim().toLowerCase() === cleanTitle.trim().toLowerCase()
      )

      const isConflict = Boolean(matchingDoc)
      const suggestedNewTitle = isConflict ? generateUniqueTitle(cleanTitle, existingTitles) : cleanTitle

      return {
        ...file,
        id: `gdrive-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        cleanTitle,
        detectedType,
        targetCategory,
        isConflict,
        existingDoc: matchingDoc,
        conflictAction: 'rename',
        suggestedNewTitle,
        status: 'ready',
      }
    })
  }

  /**
   * Analyse les liens collés (fichiers ou dossiers partagés)
   */
  const handleScanLinks = async () => {
    const urls = linksInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean)

    if (urls.length === 0) {
      setScanError('Veuillez coller au moins un lien Google Drive (fichier ou dossier).')
      return
    }

    setIsScanning(true)
    setScanError(null)

    try {
      const res = await fetch('/api/admin/google-drive/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          accessToken: oauthToken || undefined,
          apiKey: DEFAULT_API_KEY,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Impossible d'analyser ce lien Google Drive")
      }

      const newItems = buildStagedItems(data.files || [])
      setStagedItems(prev => [...prev, ...newItems])
      setLinksInput('')
    } catch (err: any) {
      setScanError(err.message || 'Erreur lors du scan Google Drive')
    } finally {
      setIsScanning(false)
    }
  }

  /**
   * Ajoute les éléments cochés depuis l'explorateur Google Drive intégré
   */
  const handleStageSelectedDriveEntries = async (entriesToStage?: DriveBrowserEntry[]) => {
    const pickedEntries =
      entriesToStage || driveEntries.filter(e => selectedDriveIds.includes(e.id))
    if (pickedEntries.length === 0) return

    setIsScanning(true)
    setScanError(null)
    try {
      const res = await fetch('/api/admin/google-drive/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickerItems: pickedEntries.map(e => ({
            id: e.id,
            name: e.name,
            mimeType: e.mimeType,
            sizeBytes: e.size,
          })),
          accessToken: oauthToken || undefined,
          apiKey: DEFAULT_API_KEY,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la préparation des fichiers')
      setStagedItems(prev => [...prev, ...buildStagedItems(data.files || [])])
      setSelectedDriveIds([])
    } catch (err: any) {
      setScanError(err.message)
    } finally {
      setIsScanning(false)
    }
  }

  /**
   * Lance le transfert direct Serveur → Backblaze B2 (3 workers en parallèle)
   */
  const handleStartServerImport = async () => {
    const itemsToRun = stagedItems.filter(
      i => i.status !== 'done' && (!i.isConflict || i.conflictAction !== 'skip')
    )
    if (itemsToRun.length === 0) return

    setIsImporting(true)
    setScanError(null)

    let currentIndex = 0
    const concurrency = 3

    const worker = async () => {
      while (currentIndex < itemsToRun.length) {
        const idx = currentIndex++
        const item = itemsToRun[idx]

        setStagedItems(prev =>
          prev.map(p => (p.id === item.id ? { ...p, status: 'transferring', errorMsg: undefined } : p))
        )

        try {
          const finalTitle =
            item.isConflict && item.conflictAction === 'rename'
              ? item.suggestedNewTitle
              : item.cleanTitle

          const res = await fetch('/api/admin/google-drive/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              driveId: item.driveId,
              fileName: item.name,
              title: finalTitle,
              cycle: targetLocation.cycle,
              year: targetLocation.year,
              category: item.targetCategory,
              conflictAction: item.isConflict ? item.conflictAction : undefined,
              existingDocId: item.existingDoc?.id,
              isGoogleWorkspaceDoc: item.isGoogleWorkspaceDoc,
              exportMimeType: item.exportMimeType,
              exportExtension: item.exportExtension,
              accessToken: oauthToken || undefined,
              apiKey: DEFAULT_API_KEY,
            }),
          })

          const data = await res.json()
          if (!res.ok || !data.document) {
            throw new Error(data.error || 'Échec du transfert')
          }

          onDocumentImported(data.document)
          setStagedItems(prev =>
            prev.map(p => (p.id === item.id ? { ...p, status: 'done' } : p))
          )
        } catch (err: any) {
          setStagedItems(prev =>
            prev.map(p =>
              p.id === item.id ? { ...p, status: 'error', errorMsg: err.message } : p
            )
          )
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, itemsToRun.length) }, () => worker())
    )

    setIsImporting(false)
  }

  const updateItem = (id: string, updates: Partial<GoogleDriveStagedItem>) => {
    setStagedItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeItem = (id: string) => {
    setStagedItems(prev => prev.filter(item => item.id !== id))
  }

  const toggleSelectDriveId = (id: string) => {
    setSelectedDriveIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const conflictCount = stagedItems.filter(i => i.isConflict && i.status !== 'done').length
  const completedCount = stagedItems.filter(i => i.status === 'done').length

  return (
    <div className="fixed inset-0 z-[125] bg-slate-900/65 dark:bg-black/80 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col relative border border-slate-200 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
                <CloudDownload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Import Direct depuis Google Drive
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Destination :</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 uppercase">
                    {targetLocation.cycle}
                  </span>
                  {targetLocation.year && (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        A{targetLocation.year}
                      </span>
                    </>
                  )}
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {targetLocation.category || 'Général'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 pb-2 flex items-center gap-2 border-b border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'link'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            )}
          >
            <Link2 className="w-4 h-4" />
            1. Coller un lien Fichier ou Dossier (Immédiat)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('picker')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'picker'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            )}
          >
            <FolderOpen className="w-4 h-4" />
            2. Parcourir mon Google Drive {oauthToken ? '(Connecté ✅)' : ''}
          </button>
        </div>

        {/* Input Panel */}
        <div className="px-6 py-4 bg-slate-50/40 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
          {activeTab === 'link' ? (
            <div className="space-y-2.5">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Collez le lien de votre dossier Google Drive (ex: votre onglet <strong>Fiscalité</strong>) ou d'un fichier :
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <textarea
                  rows={2}
                  value={linksInput}
                  onChange={e => setLinksInput(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1A2B3C... ou https://drive.google.com/file/d/1X2Y3Z.../view"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <Button
                  type="button"
                  onClick={handleScanLinks}
                  loading={isScanning}
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Analyser le lien
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ⚡ Astuce : Sur Google Drive, faites <strong>Clic droit sur le dossier → Partager → Tous les utilisateurs disposant du lien</strong> puis collez le lien ici.
              </p>
            </div>
          ) : !oauthToken ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  Explorateur Google Drive intégré (Compatible Brave Browser 🛡️)
                </p>
                <p>
                  Connectez votre compte Google en 1 clic pour parcourir vos dossiers et importer vos cours directement.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleConnectGoogleAccount}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0"
              >
                <FolderOpen className="w-4 h-4 mr-1.5" />
                Connecter mon Google Drive
              </Button>
            </div>
          ) : (
            /* Integrated Brave-Proof Google Drive Browser */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Breadcrumbs */}
                <div className="flex items-center flex-wrap gap-1 text-xs font-semibold">
                  {driveFolderStack.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDriveFolderStack(prev => prev.slice(0, -1))}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 mr-1 cursor-pointer"
                      title="Dossier parent"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {driveFolderStack.map((f, idx) => (
                    <div key={f.id} className="flex items-center gap-1">
                      {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                      <button
                        type="button"
                        onClick={() => {
                          setDriveSearch('')
                          setDriveFolderStack(prev => prev.slice(0, idx + 1))
                        }}
                        className={cn(
                          'px-2 py-1 rounded-lg transition-colors cursor-pointer',
                          idx === driveFolderStack.length - 1
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        {f.name}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Search inside Drive */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={driveSearch}
                      onChange={e => setDriveSearch(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && oauthToken) {
                          fetchDriveDirectory(oauthToken, currentDriveFolder.id, driveSearch)
                        }
                      }}
                      placeholder="Rechercher sur Drive..."
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white w-44"
                    />
                  </div>
                  {currentDriveFolder.id !== 'root' && (
                    <Button
                      type="button"
                      loading={isScanning}
                      onClick={() =>
                        handleStageSelectedDriveEntries([
                          {
                            id: currentDriveFolder.id,
                            name: currentDriveFolder.name,
                            mimeType: 'application/vnd.google-apps.folder',
                            isFolder: true,
                          },
                        ])
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                    >
                      Importer tout « {currentDriveFolder.name} »
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={handleDisconnectGoogle}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Déconnecter Google Drive"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drive Entries Grid */}
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2 space-y-1">
                {isLoadingDrive ? (
                  <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Chargement de vos dossiers Google Drive...
                  </div>
                ) : driveEntries.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Ce dossier Google Drive est vide.
                  </div>
                ) : (
                  driveEntries.map(entry => {
                    const isSelected = selectedDriveIds.includes(entry.id)
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-blue-500/15 border border-blue-500/30'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5'
                        )}
                        onClick={() => {
                          if (entry.isFolder) {
                            setDriveSearch('')
                            setDriveFolderStack(prev => [...prev, { id: entry.id, name: entry.name }])
                          } else {
                            toggleSelectDriveId(entry.id)
                          }
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              toggleSelectDriveId(entry.id)
                            }}
                            className="text-slate-400 hover:text-blue-500"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          {entry.isFolder ? (
                            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          )}
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {entry.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {entry.size && (
                            <span className="text-[11px] text-slate-400">
                              {formatBytes(entry.size)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              handleStageSelectedDriveEntries([entry])
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] cursor-pointer"
                          >
                            + Ajouter
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {selectedDriveIds.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    loading={isScanning}
                    onClick={() => handleStageSelectedDriveEntries()}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl"
                  >
                    Ajouter la sélection ({selectedDriveIds.length})
                  </Button>
                </div>
              )}
            </div>
          )}

          {scanError && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}
        </div>

        {/* Conflict Bulk Bar */}
        {conflictCount > 0 && (
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {conflictCount} doublon{conflictCount > 1 ? 's détectés' : ' détecté'} :
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setStagedItems(prev =>
                    prev.map(i => (i.isConflict ? { ...i, conflictAction: 'rename' } : i))
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> Tout renommer
              </button>
              <button
                type="button"
                onClick={() =>
                  setStagedItems(prev =>
                    prev.map(i => (i.isConflict ? { ...i, conflictAction: 'replace' } : i))
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Tout remplacer
              </button>
              <button
                type="button"
                onClick={() =>
                  setStagedItems(prev =>
                    prev.map(i => (i.isConflict ? { ...i, conflictAction: 'skip' } : i))
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Ban className="w-3 h-3" /> Tout ignorer
              </button>
            </div>
          </div>
        )}

        {/* Staged Files List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {stagedItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              <CloudDownload className="w-9 h-9 mx-auto mb-2 opacity-40" />
              Aucun fichier en file d'attente. Collez un lien (Onglet 1) ou sélectionnez un dossier (Onglet 2).
            </div>
          ) : (
            stagedItems.map(item => (
              <div
                key={item.id}
                className={cn(
                  'p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5',
                  item.status === 'done'
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : item.status === 'error'
                    ? 'bg-red-500/5 border-red-500/30'
                    : item.isConflict
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/10'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        disabled={item.status === 'done' || isImporting}
                        value={
                          item.isConflict && item.conflictAction === 'rename'
                            ? item.suggestedNewTitle
                            : item.cleanTitle
                        }
                        onChange={e =>
                          updateItem(
                            item.id,
                            item.isConflict && item.conflictAction === 'rename'
                              ? { suggestedNewTitle: e.target.value }
                              : { cleanTitle: e.target.value }
                          )
                        }
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                      />
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1 mt-0.5">
                        <span className="truncate max-w-[220px]">{item.name}</span>
                        {item.size && <span>• {formatBytes(item.size)}</span>}
                        <span>• Dossier : <strong>{item.targetCategory}</strong></span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                          {item.detectedType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status / Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'transferring' && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transfert B2...
                      </span>
                    )}
                    {item.status === 'done' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                        <Check className="w-4 h-4" />
                        Importé
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-xs font-semibold text-red-500" title={item.errorMsg}>
                        {item.errorMsg || 'Erreur'}
                      </span>
                    )}
                    {item.status !== 'transferring' && item.status !== 'done' && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-item Conflict Selector */}
                {item.isConflict && item.status !== 'done' && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-500/20 text-[11px]">
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Doublon détecté dans « {item.targetCategory} »
                    </span>
                    <div className="flex items-center gap-1">
                      {(['rename', 'replace', 'skip'] as const).map(act => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => updateItem(item.id, { conflictAction: act })}
                          className={cn(
                            'px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer',
                            item.conflictAction === act
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-white/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          )}
                        >
                          {act === 'rename' ? 'Renommer' : act === 'replace' ? 'Remplacer' : 'Ignorer'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {stagedItems.length > 0 ? (
              <span>
                <strong>{completedCount}</strong> / {stagedItems.length} transféré{stagedItems.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span>Prêt pour l'import serveur direct</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button type="button" variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button
              type="button"
              disabled={
                stagedItems.length === 0 ||
                isImporting ||
                stagedItems.every(i => i.status === 'done' || (i.isConflict && i.conflictAction === 'skip'))
              }
              loading={isImporting}
              onClick={handleStartServerImport}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
            >
              <CloudDownload className="w-4 h-4 mr-1.5" />
              Transférer vers ESB Hub ({stagedItems.filter(i => i.status !== 'done' && (!i.isConflict || i.conflictAction !== 'skip')).length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
