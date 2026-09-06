'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link2, Plus, Trash2, ExternalLink, AlertCircle, CheckCircle, X, Edit2 } from 'lucide-react'
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
  const [editingId, setEditingId] = useState<string | null>(null)

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

  async function handleSubmit(e: React.FormEvent) {
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

    if (editingId) {
      const { error } = await supabase.from('useful_links').update({ title, url, category: finalCategory }).eq('id', editingId)
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Lien modifié avec succès !')
    } else {
      const { error } = await supabase.from('useful_links').insert({ title, url, category: finalCategory })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Lien ajouté avec succès !')
    }

    setEditingId(null)
    setTitle(''); setUrl(''); setCustomCategory(''); setCategory('Général')
    await fetchLinks()
    setLoading(false)
  }

  function handleEdit(link: Link) {
    setEditingId(link.id)
    setTitle(link.title)
    setUrl(link.url)
    if (LINK_CATEGORIES.includes(link.category) && link.category !== 'Autre') {
      setCategory(link.category)
      setCustomCategory('')
    } else {
      setCategory('Autre')
      setCustomCategory(link.category)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle(''); setUrl(''); setCustomCategory(''); setCategory('Général')
    setError(''); setSuccess('')
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('useful_links').delete().eq('id', id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 uppercase tracking-wider font-bold">RESOURCE_INDEX // LIENS UTILES</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Link2 className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          </div>
          Liens Utiles & Références
        </h1>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">Gérez les passerelles et ressources documentaires externes accessibles aux étudiants.</p>
      </div>

      {/* Add/Edit form */}
      <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wide">
            {editingId ? <Edit2 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-amber-500" />}
            {editingId ? 'Modifier le lien' : 'Ajouter un lien de référence'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs font-mono text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              [ANNULER]
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-mono text-red-500 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-500 dark:text-emerald-400">
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
          <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Catégorie</label>
          <div className="flex flex-wrap gap-2">
            {LINK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                  category === cat
                    ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
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

        <div className="pt-2">
          <Button variant="cyber-amber" type="submit" loading={loading} className="w-full justify-center">
            {editingId ? <Edit2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {editingId ? 'Enregistrer les modifications' : 'Ajouter le lien de référence'}
          </Button>
        </div>
      </form>

      {/* Links list */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <h2 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Liens Actifs ({links.length})
          </h2>
        </div>
        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-white/40 dark:bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/40 dark:bg-[#070D19]/60">
            <Link2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-500">AUCUN LIEN ENREGISTRÉ // NO_DATA</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {links.map((link) => (
              <div
                key={link.id}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl px-4 py-3 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{link.title}</p>
                  <p className="text-xs font-mono text-slate-400 truncate">{link.url}</p>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hidden sm:block">
                  {link.category}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Ouvrir le lien"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleEdit(link)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={deletingId === link.id}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Supprimer"
                >
                  {deletingId === link.id ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Trash2 className="w-4 h-4" />
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
