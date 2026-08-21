'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar, Plus, Pencil, Trash2, AlertTriangle, X, Loader2,
  Filter, Save, Clock, MapPin, Users, Search, Download
} from 'lucide-react'
import { formatDate, CYCLES, cn } from '@/lib/utils'
import type { Cycle } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_date: string
  event_time?: string
  end_time?: string
  type: string
  cycle?: string | null
  year?: number | null
  location?: string | null
  created_by?: string | null
}

const EVENT_TYPES: Record<string, { label: string, color: string, dot: string, bg: string }> = {
  exam:          { label: 'Examen',         color: 'text-red-700 dark:text-red-400',     dot: 'bg-red-500',     bg: 'bg-red-100 dark:bg-red-900/30' },
  ds:            { label: 'Devoir Surveillé', color: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  examen_final:  { label: 'Examen Final',   color: 'text-rose-700 dark:text-rose-400',   dot: 'bg-rose-500',    bg: 'bg-rose-100 dark:bg-rose-900/30' },
  rattrapage:    { label: 'Rattrapage',     color: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500',   bg: 'bg-amber-100 dark:bg-amber-900/30' },
  holiday:       { label: 'Congé',          color: 'text-green-700 dark:text-green-400', dot: 'bg-green-500',   bg: 'bg-green-100 dark:bg-green-900/30' },
  autre:         { label: 'Autre',          color: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
}

const CYCLE_KEYS = Object.keys(CYCLES) as Cycle[]
const YEARS = [1, 2, 3, 4, 5]

interface FormState {
  id?: string
  title: string
  description: string
  event_date: string
  event_time: string
  end_time: string
  type: string
  cycle: string
  year: string
  location: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  event_date: '',
  event_time: '',
  end_time: '',
  type: 'exam',
  cycle: '',
  year: '',
  location: '',
}

export default function AdminCalendrierClient({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([])
  const [saving, setSaving] = useState(false)

  // Filters
  const [filterCycle, setFilterCycle] = useState<string>('')
  const [filterYear, setFilterYear] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [search, setSearch] = useState('')

  const supabase = createClient()

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterCycle && e.cycle !== filterCycle) return false
      if (filterYear && String(e.year) !== filterYear) return false
      if (filterType && e.type !== filterType) return false
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [events, filterCycle, filterYear, filterType, search])

  // Detect conflicts: same location & date & overlapping time
  const detectConflicts = (formData: FormState) => {
    if (!formData.event_date || !formData.location) {
      setConflicts([])
      return
    }
    const overlaps = events.filter(e => {
      if (e.id === formData.id) return false
      if (e.event_date !== formData.event_date) return false
      if ((e.location || '').trim().toLowerCase() !== formData.location.trim().toLowerCase()) return false

      const aStart = formData.event_time || '00:00'
      const aEnd = formData.end_time || formData.event_time || '23:59'
      const bStart = e.event_time || '00:00'
      const bEnd = (e as any).end_time || e.event_time || '23:59'

      // overlap if aStart < bEnd AND bStart < aEnd
      return aStart < bEnd && bStart < aEnd
    })
    setConflicts(overlaps)
  }

  useEffect(() => {
    if (showForm) detectConflicts(form)
  }, [form, showForm])

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setConflicts([])
    setShowForm(true)
  }

  function openEdit(ev: CalendarEvent) {
    setForm({
      id: ev.id,
      title: ev.title,
      description: ev.description || '',
      event_date: ev.event_date,
      event_time: ev.event_time || '',
      end_time: (ev as any).end_time || '',
      type: ev.type,
      cycle: ev.cycle || '',
      year: ev.year != null ? String(ev.year) : '',
      location: ev.location || '',
    })
    setEditingId(ev.id)
    setConflicts([])
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setConflicts([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.event_date) return

    setSaving(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date,
      event_time: form.event_time || null,
      end_time: form.end_time || null,
      type: form.type,
      cycle: form.cycle || null,
      year: form.year ? parseInt(form.year, 10) : null,
      location: form.location.trim() || null,
      updated_at: new Date().toISOString(),
    }

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single()
        if (error) throw error
        if (data) {
          setEvents(prev => prev.map(ev => ev.id === editingId ? { ...ev, ...data } as CalendarEvent : ev))
        }
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id })
          .select()
          .single()
        if (error) throw error
        if (data) {
          setEvents(prev => [...prev, data as CalendarEvent])
        }
      }
      closeForm()
    } catch (err: any) {
      console.error('Save error:', err)
      alert('Erreur lors de l\'enregistrement: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet événement ?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch (err: any) {
      console.error('Delete error:', err)
      alert('Erreur lors de la suppression: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendrier des Examens</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les examens et événements de l'ESB</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvel événement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <select
            value={filterCycle}
            onChange={(e) => setFilterCycle(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Tous les cycles</option>
            {CYCLE_KEYS.map(c => (
              <option key={c} value={c}>{CYCLES[c].label}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Toutes les années</option>
            {YEARS.map(y => (
              <option key={y} value={y}>Année {y}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Tous les types</option>
            {Object.entries(EVENT_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun événement trouvé</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredEvents.map(ev => {
              const typeInfo = EVENT_TYPES[ev.type] || EVENT_TYPES.autre
              return (
                <div key={ev.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className={cn("w-1.5 h-12 rounded-full shrink-0", typeInfo.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{ev.title}</p>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", typeInfo.bg, typeInfo.color)}>
                        {typeInfo.label}
                      </span>
                      {ev.cycle && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {CYCLES[ev.cycle as Cycle]?.label || ev.cycle}{ev.year ? ` · A${ev.year}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {ev.event_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ev.event_time.slice(0, 5)}{ev.location ? '' : ''}
                          {(ev as any).end_time ? ` - ${(ev as any).end_time.slice(0, 5)}` : ''}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(ev)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl w-full max-w-lg p-6 relative my-8">
            <button onClick={closeForm} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
              {editingId ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h2>

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-400">
                  <p className="font-semibold">Conflit d'horaire détecté !</p>
                  <p className="mt-1">Cette salle est déjà occupée à la même période :</p>
                  <ul className="mt-1 list-disc list-inside">
                    {conflicts.map(c => (
                      <li key={c.id}>{c.title} ({c.event_time || 'horaire non défini'})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Ex: Examen Comptabilité S1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Détails de l'événement..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {Object.entries(EVENT_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Heure début</label>
                  <input
                    type="time"
                    value={form.event_time}
                    onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Heure fin</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salle / Lieu</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Ex: Salle A101"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cycle</label>
                  <select
                    value={form.cycle}
                    onChange={(e) => setForm({ ...form, cycle: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="">Tous les cycles</option>
                    {CYCLE_KEYS.map(c => (
                      <option key={c} value={c}>{CYCLES[c].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Année</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="">Toutes les années</option>
                    {YEARS.map(y => (
                      <option key={y} value={y}>Année {y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
