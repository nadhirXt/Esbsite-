'use client'

import { useState, useRef } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const CYCLES = [
  { value: 'licence', label: 'Licence' },
  { value: 'dseb',    label: 'DSEB' },
  { value: 'master',  label: 'Master' },
]

const CATEGORIES = ['Comptabilité', 'Droit bancaire', 'Finance', 'Mathématiques', 'Informatique', 'Anglais', 'Management', 'Autre']

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [title, setTitle]       = useState('')
  const [cycle, setCycle]       = useState('')
  const [category, setCategory] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) { setFile(dropped); if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, '')) }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!file || !title || !cycle) { setError('Veuillez remplir tous les champs obligatoires.'); return }

    setLoading(true)
    const supabase = createClient()
    const path = `${cycle}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) { setError(uploadError.message); setLoading(false); return }

    const { error: dbError } = await supabase.from('documents').insert({
      title, file_path: path, cycle, category: category || null,
    })

    if (dbError) { setError(dbError.message); setLoading(false); return }

    setSuccess(`"${title}" uploadé avec succès !`)
    setFile(null); setTitle(''); setCycle(''); setCategory('')
    setLoading(false)
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Upload de documents</h1>
        <p className="text-[#64748B] text-sm mt-1">Ajoutez des cours et documents pour les étudiants.</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
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
              : file
              ? 'border-green-400 bg-green-50'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')) }
            }}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <File className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-[#0F172A]">{file.name}</p>
                <p className="text-xs text-[#64748B]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="ml-2 text-[#94A3B8] hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0F172A]">Glissez-déposez votre fichier ici</p>
              <p className="text-xs text-[#64748B] mt-1">ou cliquez pour parcourir</p>
              <p className="text-xs text-[#94A3B8] mt-3">PDF, Word, PowerPoint, Excel · Max 50 MB</p>
            </>
          )}
        </div>

        <Input
          label="Titre du document *"
          id="doc-title"
          type="text"
          placeholder="ex: Comptabilité générale — Chapitre 3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

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

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Catégorie</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat === category ? '' : cat)}
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
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          <Upload className="w-4 h-4" />
          {loading ? 'Upload en cours...' : 'Uploader le document'}
        </Button>
      </form>
    </div>
  )
}
