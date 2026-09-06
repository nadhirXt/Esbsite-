'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass, Upload, FileText, Trash2, CheckCircle2, AlertCircle,
  Clock, ExternalLink, Sparkles, Eye, Loader2, ArrowUpRight,
  Shield, Check, FolderOpen
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getPresignedUploadUrl, deleteDocumentAction } from '@/app/actions/storage'
import { formatDate } from '@/lib/utils'
import type { Document } from '@/lib/types'

interface AdminConcoursClientProps {
  initialDocuments: Document[]
}

type ConcoursCycle = 'master' | 'dseb'

const DOCUMENT_TYPES = [
  'Avis Officiel & Modalités',
  'Épreuve / Sujet Type',
  'Règlement du Concours',
  'Guide Pédagogique',
  'Autre Document'
]

export default function AdminConcoursClient({ initialDocuments }: AdminConcoursClientProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [selectedCycle, setSelectedCycle] = useState<ConcoursCycle>('master')
  
  // Form State
  const [fileTitle, setFileTitle] = useState('')
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Filter documents for current cycle
  const currentDocs = documents.filter(doc => doc.category === selectedCycle)

  // Handle File Upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!selectedFile) {
      setErrorMessage('Veuillez sélectionner un fichier (PDF, DOCX...)')
      return
    }

    if (!fileTitle.trim()) {
      setErrorMessage('Veuillez renseigner le titre du document')
      return
    }

    setUploading(true)
    setUploadProgress(10)

    try {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf'
      const cleanFileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const s3Path = `concours/${selectedCycle}/${cleanFileName}`

      // 1. Get presigned upload URL from server
      const { url: uploadUrl, error: urlError } = await getPresignedUploadUrl(
        s3Path,
        selectedFile.type || 'application/pdf'
      )

      if (urlError || !uploadUrl) {
        throw new Error(urlError || 'Impossible de générer le lien de téléversement.')
      }

      setUploadProgress(40)

      // 2. Upload file directly to S3 / Backblaze B2 with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl, true)
        xhr.setRequestHeader('Content-Type', selectedFile.type || 'application/octet-stream')

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 50) + 40
            setUploadProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Échec de l'envoi HTTP: ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Erreur réseau lors du téléversement.'))
        xhr.send(selectedFile)
      })

      setUploadProgress(92)

      // 3. Insert record in Supabase database
      const fullTitle = `${fileTitle.trim()} [${docType}]`
      const { data: newDoc, error: dbError } = await supabase
        .from('documents')
        .insert({
          title: fullTitle,
          file_path: s3Path,
          cycle: 'concours',
          category: selectedCycle,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError || !newDoc) {
        throw new Error(dbError?.message || 'Erreur lors de l’enregistrement en base de données.')
      }

      setUploadProgress(100)
      setDocuments(prev => [newDoc, ...prev])
      setSuccessMessage(`Document « ${fileTitle} » publié avec succès en accès public direct !`)
      
      // Reset form
      setFileTitle('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      console.error('Upload Concours Error:', err)
      setErrorMessage(err.message || 'Une erreur est survenue lors du téléversement.')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  // Handle Document Delete
  const handleDelete = async (docId: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement « ${title} » ?`)) {
      return
    }

    try {
      const res = await deleteDocumentAction(docId)
      if (res && (res as any).error) {
        alert((res as any).error)
        return
      }
      setDocuments(prev => prev.filter(d => d.id !== docId))
      setSuccessMessage(`Document supprimé.`)
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.')
    }
  }

  // Handle Preview Link Test
  const handleTestLink = (docId: string, title?: string, filePath?: string) => {
    const ext = filePath?.split('.').pop()?.toLowerCase() || 'pdf'
    const safeTitle = (title || 'concours').replace(/[/\\?%*:|"<>]/g, '_')
    window.open(`/assets/documents/${docId}/${encodeURIComponent(safeTitle)}.${ext}`, '_blank')
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 text-slate-900 dark:text-white">
      
      {/* ── EN-TÊTE PAGE ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Console Administrateur • Concours National</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion des Documents de Concours ESB
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Tous les documents publiés ici apparaissent <span className="font-semibold text-emerald-600 dark:text-emerald-400">instantanément sur la page d&apos;accueil</span> et sont téléchargeables par les futurs candidats en 1 clic, <span className="font-semibold text-amber-600 dark:text-amber-400">sans aucun compte ni login</span>.
          </p>
        </div>

        {/* Sélecteur de Cycle */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-[#070D19] rounded-2xl border border-slate-200 dark:border-white/10 shrink-0">
          <button
            onClick={() => setSelectedCycle('master')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCycle === 'master'
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Master Monnaie &amp; Banque
          </button>
          <button
            onClick={() => setSelectedCycle('dseb')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCycle === 'dseb'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cycle Supérieur DSEB
          </button>
        </div>
      </div>

      {/* ── ALERTE SUCCÈS OU ERREUR ─────────────────── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
              ✕
            </button>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── COLONNE GAUCHE : FORMULAIRE D'UPLOAD ────── */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#070D19] border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500 uppercase tracking-wider mb-4">
            <Upload className="w-4 h-4" />
            <span>Nouveau Document ({selectedCycle === 'master' ? 'Master' : 'DSEB'})</span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Titre Officiel du Document *
              </label>
              <input
                type="text"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                placeholder="Ex: Avis Officiel du Concours - Session 2026–2027"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Catégorie / Nature du Document
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                {DOCUMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Fichier Source (PDF recommandé, DOCX...) *
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-900/40 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <FileText className="w-8 h-8 text-amber-500/70 mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-xs mx-auto">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo • Cliquez pour changer
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      PDF, Word jusqu&apos;à 50 Mo
                    </p>
                  </div>
                )}
              </div>
            </div>

            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Téléversement vers Backblaze B2...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !selectedFile || !fileTitle.trim()}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publier en Accès Libre</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── COLONNE DROITE : LISTE DES DOCUMENTS ACTIFS ── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              <span>Documents Publiés • {selectedCycle === 'master' ? 'Master Monnaie & Banque' : 'Cycle DSEB'}</span>
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {currentDocs.length} document{currentDocs.length > 1 ? 's' : ''}
            </span>
          </div>

          {currentDocs.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-slate-50 dark:bg-[#070D19]/80 border border-slate-200 dark:border-white/10">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Aucun document publié pour le {selectedCycle === 'master' ? 'Master' : 'DSEB'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Utilisez le formulaire à gauche pour uploader le premier document (avis de concours, épreuve, règlement).
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#070D19] border border-slate-200 dark:border-white/10 hover:border-amber-500/40 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(doc.created_at)}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Accès Public Libre
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleTestLink(doc.id, doc.title, doc.file_path)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Tester la visualisation directe"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>Consulter</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

