'use client'

import { useState } from 'react'
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
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
          <Megaphone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publier une Annonce</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Les étudiants la verront immédiatement dans &ldquo;Actualités ESB&rdquo;</p>
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
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all
                    ${type === t.value ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 ' + t.color : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
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
  )
}
