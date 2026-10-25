'use client'

import { useState, useEffect } from 'react'
import {
  X, Link2, FolderOpen, Sparkles, Check, AlertTriangle,
  Loader2, Trash2, CloudDownload, KeyRound, Copy, RefreshCw, Ban, ChevronRight, FileText
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

  // Configuration Google Picker pré-configurée par défaut (avec surcharge possible via env ou localStorage)
  const DEFAULT_CLIENT_ID = '57964261704-r7lmkv3otpol310vrjfpk014afpkgt1u.apps.googleusercontent.com'
  const DEFAULT_API_KEY = 'AIzaSyA9P9BJJJWkCwHGLQHa3EGn0ECm0tRWjRU'

  const [clientId, setClientId] = useState(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID
  )
  const [apiKey, setApiKey] = useState(
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY || DEFAULT_API_KEY
  )
  const [oauthToken, setOauthToken] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedClientId = localStorage.getItem('esb_gdrive_client_id')
      const savedApiKey = localStorage.getItem('esb_gdrive_api_key')
      if (savedClientId) setClientId(savedClientId)
      if (savedApiKey) setApiKey(savedApiKey)
    }
  }, [])

  if (!isOpen) return null

  const savePickerCredentials = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('esb_gdrive_client_id', clientId.trim())
      localStorage.setItem('esb_gdrive_api_key', apiKey.trim())
      setShowConfig(false)
    }
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

      // Extraire le sous-dossier éventuel depuis relativePath
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
          apiKey: apiKey || undefined,
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
   * Charge dynamiquement les scripts Google Identity Services & Google Picker puis ouvre le sélecteur
   */
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }
      const s = document.createElement('script')
      s.src = src
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error(`Impossible de charger ${src}`))
      document.body.appendChild(s)
    })
  }

  const handleOpenGooglePicker = async () => {
    if (!clientId.trim() || !apiKey.trim()) {
      setShowConfig(true)
      setScanError('Renseignez votre Google Client ID et API Key ci-dessous (ou utilisez l’onglet « Par Lien » sans configuration).')
      return
    }

    setScanError(null)
    setIsScanning(true)

    try {
      await Promise.all([
        loadScript('https://accounts.google.com/gsi/client'),
        loadScript('https://apis.google.com/js/api.js'),
      ])

      const googleWin = (window as any).google
      const gapiWin = (window as any).gapi

      await new Promise<void>((resolve) => gapiWin.load('picker', { callback: resolve }))

      const openPickerWithToken = (token: string) => {
        const docsView = new googleWin.picker.DocsView()
          .setIncludeFolders(true)
          .setSelectFolderEnabled(true)

        const appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID || clientId.trim().split('-')[0] || ''
        const pickerBuilder = new googleWin.picker.PickerBuilder()
          .addView(docsView)
          .enableFeature(googleWin.picker.Feature.MULTISELECT_ENABLED)
          .setOAuthToken(token)
          .setDeveloperKey(apiKey.trim())
          .setOrigin(window.location.origin)

        if (appId) {
          pickerBuilder.setAppId(appId)
        }

        const picker = pickerBuilder
          .setCallback(async (data: any) => {
            if (data.action === googleWin.picker.Action.PICKED) {
              setIsScanning(true)
              try {
                const picked = (data.docs || []).map((d: any) => ({
                  id: d.id,
                  name: d.name,
                  mimeType: d.mimeType,
                  sizeBytes: d.sizeBytes,
                }))

                const res = await fetch('/api/admin/google-drive/scan', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    pickerItems: picked,
                    accessToken: token,
                    apiKey: apiKey.trim(),
                  }),
                })
                const scanData = await res.json()
                if (!res.ok) throw new Error(scanData.error || 'Erreur de lecture Google Drive')
                setStagedItems(prev => [...prev, ...buildStagedItems(scanData.files || [])])
              } catch (err: any) {
                setScanError(err.message)
              } finally {
                setIsScanning(false)
              }
            } else if (data.action === googleWin.picker.Action.CANCEL) {
              setIsScanning(false)
            }
          })
          .build()

        picker.setVisible(true)
      }

      if (oauthToken) {
        openPickerWithToken(oauthToken)
        return
      }

      const tokenClient = googleWin.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          if (response.error) {
            setScanError(`Erreur OAuth Google: ${response.error}`)
            setIsScanning(false)
            return
          }
          setOauthToken(response.access_token)
          openPickerWithToken(response.access_token)
        },
      })

      tokenClient.requestAccessToken({ prompt: 'consent' })
    } catch (err: any) {
      setScanError(err.message || "Impossible d'initialiser Google Picker")
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
              apiKey: apiKey || undefined,
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
        <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-slate-100 dark:border-white/5">
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
            1. Coller un lien Fichier ou Dossier (Sans config)
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
            2. Parcourir mon Google Drive (Picker)
          </button>
        </div>

        {/* Input Panel */}
        <div className="px-6 py-4 bg-slate-50/40 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
          {activeTab === 'link' ? (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Collez un ou plusieurs liens Google Drive de <strong>fichiers</strong> ou de <strong>dossiers entiers</strong> (un par ligne) :
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
                ⚡ Transfert direct <strong>Google Drive → Serveur → Backblaze B2</strong> (0 Mo consommé sur votre connexion Internet). Les sous-dossiers sont recréés automatiquement.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Sélectionnez vos fichiers et dossiers directement depuis votre fenêtre Google Drive.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfig(!showConfig)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    Clés API Google
                  </button>
                  <Button
                    type="button"
                    onClick={handleOpenGooglePicker}
                    loading={isScanning}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    <FolderOpen className="w-4 h-4 mr-1.5" />
                    Ouvrir Google Drive Picker
                  </Button>
                </div>
              </div>

              {showConfig && (
                <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 space-y-2.5 text-xs">
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Google OAuth Client ID
                      </label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={e => setClientId(e.target.value)}
                        placeholder="123456-abc.apps.googleusercontent.com"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Google Drive API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={savePickerCredentials}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 cursor-pointer"
                    >
                      Enregistrer dans le navigateur
                    </button>
                  </div>
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
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              <CloudDownload className="w-10 h-10 mx-auto mb-2 opacity-40" />
              Aucun fichier Google Drive en attente. Collez un lien de fichier ou de dossier ci-dessus pour commencer.
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
