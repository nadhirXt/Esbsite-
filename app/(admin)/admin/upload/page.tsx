'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle, Edit2, Trash2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { getPresignedUploadUrl, deleteStorageFile } from '@/app/actions/storage'

const CYCLES = [
  { value: 'licence', label: 'Licence' },
  { value: 'dseb',    label: 'DSEB' },
  { value: 'master',  label: 'Master' },
  { value: 'bibliotheque', label: 'Bibliothèque' },
]

interface Document {
  id: string
  title: string
  file_path: string
  cycle: string
  category: string | null
  created_at: string
}

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [files, setFiles]       = useState<File[]>([])
  const [title, setTitle]       = useState('')
  const [cycle, setCycle]       = useState('')
  const [category, setCategory] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const [documents, setDocuments] = useState<Document[]>([])
  const [fetching, setFetching] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [oldFilePath, setOldFilePath] = useState<string>('')

  const fetchDocuments = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    setDocuments(data || [])
    setFetching(false)
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const existingFolders = Array.from(new Set(documents.map(d => d.category).filter(Boolean))) as string[]

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)])
      if (!title && e.dataTransfer.files.length === 1 && files.length === 0) {
        setTitle(e.dataTransfer.files[0].name.replace(/\.[^.]+$/, ''))
      }
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!cycle) { setError('Veuillez sélectionner un cycle.'); return }
    if (!category.trim()) { setError('Veuillez spécifier un dossier.'); return }
    if (!editingId && files.length === 0) { setError('Veuillez sélectionner au moins un fichier.'); return }
    if (editingId && files.length > 1) { setError('Vous ne pouvez uploader qu\'un seul fichier lors de la modification.'); return }
    if (files.length === 1 && !title) { setError('Veuillez donner un titre au document.'); return }

    const fullCategory = category.trim()

    setLoading(true)
    const supabase = createClient()
    
    if (editingId) {
      let path = oldFilePath
      const file = files[0]
      if (file) {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
        path = `${cycle}/${Date.now()}_${safeFileName}`
        const { url, error: urlError } = await getPresignedUploadUrl(path, file.type || 'application/octet-stream')
        if (urlError || !url) { setError(urlError || 'Erreur R2'); setLoading(false); return }
        
        try {
          const res = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'application/octet-stream' }
          })
          if (!res.ok) throw new Error("Erreur lors de l'upload R2")
        } catch (err: any) {
          setError(err.message); setLoading(false); return
        }
      }
      const { error: dbError } = await supabase.from('documents').update({
        title, file_path: path, cycle, category: fullCategory
      }).eq('id', editingId)
      if (dbError) { setError(dbError.message); setLoading(false); return }
      setSuccess(`"${title}" modifié avec succès !`)
    } else {
      let uploadedCount = 0
      for (const file of files) {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
        const path = `${cycle}/${Date.now()}_${safeFileName}`
        const fileTitle = files.length === 1 ? title : file.name.replace(/\.[^.]+$/, '')
        
        const { url, error: urlError } = await getPresignedUploadUrl(path, file.type || 'application/octet-stream')
        if (urlError || !url) { setError(urlError || 'Erreur R2'); break; }
        
        try {
          const res = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'application/octet-stream' }
          })
          if (!res.ok) {
            const errText = await res.text();
            console.error("Upload error text:", errText);
            throw new Error(`Erreur HTTP ${res.status}: L'upload a échoué.`)
          }
        } catch (err: any) {
          console.error("Fetch error:", err)
          setError(err.message === "Failed to fetch" ? "Erreur CORS : Veuillez configurer les règles CORS sur Backblaze (Étape 3 du guide)." : err.message); 
          break;
        }
        
        const { error: dbError } = await supabase.from('documents').insert({
          title: fileTitle, file_path: path, cycle, category: fullCategory
        })
        if (dbError) { setError(dbError.message); break; }
        uploadedCount++
      }
      
      if (uploadedCount === files.length) {
        setSuccess(`${uploadedCount} document(s) uploadé(s) avec succès dans le dossier "${fullCategory}" !`)
      } else {
        setError(prev => prev ? `${prev} (Seulement ${uploadedCount}/${files.length} fichiers uploadés)` : `Erreur partielle : seulement ${uploadedCount} sur ${files.length} fichiers ont été uploadés.`)
      }
    }

    setEditingId(null)
    setFiles([]); setTitle(''); setOldFilePath('')
    await fetchDocuments()
    setLoading(false)
  }

  function handleEdit(doc: Document) {
    setEditingId(doc.id)
    setTitle(doc.title)
    setCycle(doc.cycle)
    setCategory(doc.category || '')
    setOldFilePath(doc.file_path)
    setFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setFiles([]); setTitle(''); setCycle(''); setCategory(''); setOldFilePath('')
    setError(''); setSuccess('')
  }

  async function handleDelete(id: string, path: string) {
    setDeletingId(id)
    const supabase = createClient()
    await deleteStorageFile(path)
    await supabase.from('documents').delete().eq('id', id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Upload de documents</h1>
        <p className="text-[#64748B] text-sm mt-1">Ajoutez des cours et documents pour les étudiants.</p>
      </div>

      <form onSubmit={handleUpload} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-[#0F172A] flex items-center gap-2">
            {editingId ? <Edit2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {editingId ? 'Modifier le document' : 'Uploader un document'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
        {/* Feedback */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* File drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
            dragging
              ? 'border-[#1E3A8A] bg-[#EFF6FF]'
              : files.length > 0
              ? 'border-green-400 bg-green-50'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files || [])
              if (selected.length > 0) {
                setFiles(prev => [...prev, ...selected])
                if (!title && selected.length === 1 && files.length === 0) {
                  setTitle(selected[0].name.replace(/\.[^.]+$/, ''))
                }
              }
            }}
            className="hidden"
          />
          {files.length > 0 ? (
            <div className="space-y-3">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <File className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#0F172A]">{f.name}</p>
                      <p className="text-xs text-[#64748B]">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFiles(prev => prev.filter((_, index) => index !== i));
                    }}
                    className="ml-2 text-[#94A3B8] hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {!editingId && (
                <p className="text-sm text-[#1E3A8A] font-medium pt-2">Cliquez pour ajouter d'autres fichiers</p>
              )}
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0F172A]">
                {editingId ? "Glissez un nouveau fichier pour remplacer l'existant" : "Glissez-déposez vos fichiers ici"}
              </p>
              <p className="text-xs text-[#64748B] mt-1">ou cliquez pour parcourir</p>
              {editingId && <p className="text-xs text-[#1E3A8A] mt-2 font-medium">Laissez vide pour conserver le fichier actuel</p>}
              <p className="text-xs text-[#94A3B8] mt-3">PDF, Word, PowerPoint, Excel · Max 50 MB par fichier</p>
            </>
          )}
        </div>

        {files.length <= 1 && (
          <Input
            label="Titre du document"
            id="doc-title"
            type="text"
            placeholder="ex: Comptabilité générale — Chapitre 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required={files.length === 1}
          />
        )}

        {/* Cycle selector */}
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Cycle de formation *</label>
          <div className="flex gap-2">
            {CYCLES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCycle(c.value)}
                className={cn(
                  'flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer',
                  cycle === c.value
                    ? 'border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category / Folder */}
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Chemin du dossier *</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {existingFolders.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 cursor-pointer',
                  category === cat
                    ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                    : 'border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <Input
            id="doc-category"
            type="text"
            placeholder="Ex: Mathématiques/Chapitre 1/Exercices"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <p className="text-xs text-[#64748B] mt-2">
            Utilisez <strong className="text-[#0F172A]">/</strong> pour créer des sous-dossiers (ex: <code className="bg-[#F1F5F9] px-1 py-0.5 rounded">Mathématiques/Chapitre 1</code>).
          </p>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {editingId ? <Edit2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
          {loading ? 'Enregistrement...' : (editingId ? 'Enregistrer les modifications' : 'Uploader le document')}
        </Button>
      </form>

      {/* Documents list */}
      <div>
        <h2 className="font-semibold text-[#0F172A] mb-4">
          Documents existants ({documents.length})
        </h2>
        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-[#E2E8F0]">
            <FileText className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#64748B]">Aucun document uploadé.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 hover:shadow-sm transition-all duration-200"
              >
                <FileText className="w-5 h-5 text-[#1E3A8A] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{doc.title}</p>
                  <p className="text-xs text-[#94A3B8] truncate">Cycle : <span className="uppercase">{doc.cycle}</span> {doc.category && `• ${doc.category}`}</p>
                </div>
                <button
                  onClick={() => handleEdit(doc)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#1E3A8A] transition-colors cursor-pointer"
                  aria-label="Modifier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.file_path)}
                  disabled={deletingId === doc.id}
                  className="p-1.5 text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Supprimer"
                >
                  {deletingId === doc.id ? (
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
