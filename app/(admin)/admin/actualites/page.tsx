'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Megaphone, Plus, Pin, Trash2, Loader2, Info, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

const TYPES = [
  { value: 'info',    label: 'Information', icon: Info,          color: 'text-blue-600' },
  { value: 'warning', label: 'Attention',   icon: AlertTriangle, color: 'text-amber-600' },
  { value: 'success', label: 'Succès',      icon: CheckCircle,   color: 'text-green-600' },
  { value: 'urgent',  label: 'Urgent',      icon: Zap,           color: 'text-red-600' },
]

export default function AdminActualitesPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('info')
  const [cycleTarget, setCycleTarget] = useState('')
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (data) setAnnouncements(data)
    setLoadingList(false)
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Voulez-vous vraiment supprimer cette annonce ?')) return
    const supabase = createClient()
    await supabase.from('announcements').delete().eq('id', id)
    fetchAnnouncements()
  }

  async function publish() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('announcements').insert({
      title: title.trim(),
      content: content.trim(),
      type,
      cycle_target: cycleTarget || null,
      pinned,
    })
    setSaving(false)
    if (!error) {
      setSuccess(true)
      setTitle(''); setContent(''); setType('info'); setCycleTarget(''); setPinned(false)
      fetchAnnouncements()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
            <Megaphone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publier une Annonce</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Les étudiants la verront immédiatement</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-5 shadow-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Examen de Mathématiques reporté" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Contenu *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Détails de l'annonce..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            <p className="text-xs text-slate-400 mt-1">{content.length}/2000</p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map(t => {
                const Icon = t.icon
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all
                      ${type === t.value ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 ' + t.color : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cycle target */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cibler un cycle (optionnel)</label>
            <select value={cycleTarget} onChange={e => setCycleTarget(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">Tous les étudiants</option>
              <option value="licence">Licence</option>
              <option value="dseb">DSEB</option>
              <option value="master">Master</option>
            </select>
          </div>

          {/* Pinned */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPinned(!pinned)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
                ${pinned ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-amber-300'}`}
            >
              <Pin className="w-4 h-4" />
              {pinned ? 'Épinglée ✓' : 'Épingler en haut'}
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={publish}
            disabled={saving || !title.trim() || !content.trim()}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Publication...' : 'Publier l\'annonce'}
          </button>

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Annonce publiée avec succès !
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-8 md:mt-0 mt-12">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Actualités Publiées</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos annonces existantes</p>
          </div>
        </div>

        <div className="space-y-4">
          {loadingList ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">Aucune actualité publiée.</p>
            </div>
          ) : (
            announcements.map(ann => {
              const typeConfig = TYPES.find(t => t.value === ann.type) || TYPES[0]
              const Icon = typeConfig.icon
              return (
                <div key={ann.id} className="p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm relative group">
                  <div className="flex items-start gap-3 pr-8">
                    <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${typeConfig.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {ann.title}
                        {ann.pinned && <Pin className="w-3 h-3 text-amber-500" />}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ann.content}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs font-medium text-slate-400">
                        <span>{new Date(ann.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {ann.cycle_target && (
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                            {ann.cycle_target}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
