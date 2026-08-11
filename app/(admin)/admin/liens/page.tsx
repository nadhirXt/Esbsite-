'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link2, Plus, Trash2, ExternalLink, AlertCircle, CheckCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'

const LINK_CATEGORIES = ['Général', 'Banque centrale', 'Réglementation', 'Formation', 'Outils', 'Autre']

interface Link {
  id: string
  title: string
  url: string
  category: string
  created_at: string
}

export default function LiensPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Général')
  const [customCategory, setCustomCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('useful_links')
      .select('*')
      .order('created_at', { ascending: false })
    setLinks(data || [])
    setFetching(false)
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!title || !url) { setError('Titre et URL sont obligatoires.'); return }

    setLoading(true)
    const supabase = createClient()
    let finalCategory = category
    if (category === 'Autre') {
      if (!customCategory.trim()) {
        setError('Veuillez préciser la catégorie.')
        setLoading(false)
        return
      }
      finalCategory = customCategory.trim()
    }

    const { error } = await supabase.from('useful_links').insert({ title, url, category: finalCategory })
    if (error) { setError(error.message); setLoading(false); return }

    setSuccess('Lien ajouté avec succès !')
    setTitle(''); setUrl(''); setCustomCategory(''); setCategory('Général')
    await fetchLinks()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('useful_links').delete().eq('id', id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Liens utiles</h1>
        <p className="text-[#64748B] text-sm mt-1">Gérez les ressources visibles par les étudiants.</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-8 space-y-4">
        <h2 className="font-semibold text-[#0F172A] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter un lien
        </h2>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <Input
          label="Titre *"
          id="link-title"
          type="text"
          placeholder="ex: Banque d'Algérie — Site officiel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          label="URL *"
          id="link-url"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Catégorie</label>
          <div className="flex flex-wrap gap-2">
            {LINK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 cursor-pointer ${
                  category === cat
                    ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                    : 'border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {category === 'Autre' && (
            <div className="mt-3">
              <Input
                label="Précisez la catégorie *"
                id="custom-category"
                type="text"
                placeholder="Ex: Statistiques"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        <Button type="submit" loading={loading}>
          <Plus className="w-4 h-4" />
          Ajouter le lien
        </Button>
      </form>

      {/* Links list */}
      <div>
        <h2 className="font-semibold text-[#0F172A] mb-4">
          Liens existants ({links.length})
        </h2>
        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-[#E2E8F0]">
            <Link2 className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#64748B]">Aucun lien ajouté.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="group flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 hover:shadow-sm transition-all duration-200"
              >
                <Link2 className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{link.title}</p>
                  <p className="text-xs text-[#94A3B8] truncate">{link.url}</p>
                </div>
                <span className="text-xs text-[#64748B] hidden sm:block">{link.category}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[#94A3B8] hover:text-[#1E3A8A] transition-colors"
                  aria-label="Ouvrir le lien"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={deletingId === link.id}
                  className="p-1.5 text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Supprimer"
                >
                  {deletingId === link.id ? (
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
