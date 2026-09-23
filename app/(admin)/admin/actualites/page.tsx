'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Megaphone, Plus, Pin, Trash2, Loader2, Info, AlertTriangle, CheckCircle, Zap, X } from 'lucide-react'

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
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

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
    if (!confirmDelete) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('announcements').delete().eq('id', id)
    setConfirmDelete(null)
    setDeleting(false)
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
    <>
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono text-amber-500 dark:text-amber-400 uppercase tracking-wider font-bold">BROADCAST_SYSTEM // FLUX D'INFORMATIONS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <Megaphone className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            </div>
            Diffuser une Annonce
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">Transmission directe vers les cockpits étudiants et délégués.</p>
        </div>

        <div className="bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 space-y-4 shadow-sm">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Titre de l'Annonce *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Examen de Mathématiques reporté" className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500/50" />
          </div>

          {/* Content */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Corps du Message *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Détails de l'annonce..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500/50 resize-none" />
            <p className="text-[10px] font-mono text-slate-400 mt-1">{content.length}/2000 caractères</p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Niveau de Priorité</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map(t => {
                const Icon = t.icon
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer
                      ${type === t.value ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] hidden sm:inline">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cycle target */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Ciblage de Cycle</label>
            <select value={cycleTarget} onChange={e => setCycleTarget(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500/50 font-mono">
              <option value="">Tous les étudiants (Général)</option>
              <option value="licence">Licence Bancaire</option>
              <option value="dseb">DSEB</option>
              <option value="master">Master</option>
            </select>
          </div>

          {/* Pinned */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setPinned(!pinned)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer
                ${pinned ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <Pin className="w-3.5 h-3.5" />
              {pinned ? 'ÉPINGLÉ EN TÊTE ✓' : 'ÉPINGLER EN TÊTE'}
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={publish}
            disabled={saving || !title.trim() || !content.trim()}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'TRANSMISSION...' : 'TRANSMETTRE L\'ANNONCE'}
          </button>

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 rounded-xl text-xs font-mono font-bold">
              <CheckCircle className="w-4 h-4" />
              DIFFUSION RÉUSSIE // EN LIGNE !
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 uppercase tracking-wider font-bold">DISPATCH_LOG // HISTORIQUE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Actualités Publiées</h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">Gérez et supprimez vos annonces actives.</p>
        </div>

        <div className="space-y-3">
          {loadingList ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center p-8 bg-white/40 dark:bg-[#070D19]/60 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
              <p className="text-xs font-mono text-slate-500">AUCUNE ACTUALITÉ PUBLIÉE // NO_DATA</p>
            </div>
          ) : (
            announcements.map(ann => {
              const typeConfig = TYPES.find(t => t.value === ann.type) || TYPES[0]
              const Icon = typeConfig.icon
              return (
                <div key={ann.id} className="p-4 bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm relative group hover:border-amber-500/40 transition-all">
                  <div className="flex items-start gap-3 pr-8">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {ann.title}
                        {ann.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ann.content}</p>
                      <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-400">
                        <span>{new Date(ann.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {ann.cycle_target && (
                          <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 rounded-md uppercase font-bold">
                            {ann.cycle_target}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfirmDelete({ id: ann.id, title: ann.title })}
                    className="absolute top-4 right-4 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Supprimer cette annonce"
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

    {/* Confirmation Modal */}
    {confirmDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white dark:bg-[#0F172A] rounded-2xl border border-red-500/30 shadow-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-500">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-bold text-sm">Supprimer l&apos;annonce ?</h3>
            </div>
            <button onClick={() => setConfirmDelete(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-2 font-medium border border-slate-200 dark:border-white/10">
            &ldquo;{confirmDelete.title}&rdquo;
          </p>
          <p className="text-xs text-slate-400">Cette action est irréversible. L&apos;annonce sera définitivement supprimée.</p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              ANNULER
            </button>
            <button
              onClick={() => deleteAnnouncement(confirmDelete.id)}
              disabled={deleting}
              className="flex-1 py-2 text-xs font-mono font-bold rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              SUPPRIMER
            </button>
          </div>
        </div>
      </div>
    )}
  </>
}
