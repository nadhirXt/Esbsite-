'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, BookOpen, Link2, Users, Loader2, File, Clock, Calendar, Trophy, Megaphone, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const CYCLE_LABELS: Record<string, string> = {
  licence: 'Licence', dseb: 'DSEB', master: 'Master',
  bibliotheque: 'Bibliothèque', memoires: 'Mémoires',
}

const PAGES = [
  { type: 'page' as const, id: 'p1',  title: 'Licence',        subtitle: 'Mes cours',            url: '/dashboard/licence',     icon: BookOpen },
  { type: 'page' as const, id: 'p2',  title: 'DSEB',           subtitle: 'Mes cours',            url: '/dashboard/dseb',        icon: BookOpen },
  { type: 'page' as const, id: 'p3',  title: 'Master',         subtitle: 'Mes cours',            url: '/dashboard/master',      icon: BookOpen },
  { type: 'page' as const, id: 'p4',  title: 'Bibliothèque',   subtitle: 'Livres et ressources', url: '/dashboard/bibliotheque',icon: FileText },
  { type: 'page' as const, id: 'p5',  title: 'Annuaire',       subtitle: 'Réseau étudiants',     url: '/dashboard/annuaire',    icon: Users },
  { type: 'page' as const, id: 'p6',  title: 'Ressources',     subtitle: 'Liens utiles',         url: '/dashboard/ressources',  icon: Link2 },
  { type: 'page' as const, id: 'p7',  title: 'Calendrier',     subtitle: 'Examens & dates',      url: '/dashboard/calendrier',  icon: Calendar },
  { type: 'page' as const, id: 'p8',  title: 'Classement',     subtitle: 'Mes points',           url: '/dashboard/classement',  icon: Trophy },
  { type: 'page' as const, id: 'p9',  title: 'Actualités ESB', subtitle: 'Annonces',             url: '/dashboard/actualites',  icon: Megaphone },
]

const STORAGE_KEY = 'esb_recent_searches'
function getRecent(): string[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function saveRecent(q: string) { try { const prev = getRecent().filter(x => x !== q); localStorage.setItem(STORAGE_KEY, JSON.stringify([q, ...prev].slice(0, 5))) } catch {} }

type Result = { type: 'page' | 'doc'; id: string; title: string; subtitle?: string; url: string; icon: any }

export default function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (open) { setRecent(getRecent()); setQuery(''); setResults([]); setActiveIndex(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) { setResults([]); return }
      setLoading(true)
      const q = query.toLowerCase()
      const matchedPages = PAGES.filter(p => p.title.toLowerCase().includes(q) || (p.subtitle && p.subtitle.toLowerCase().includes(q)))
      try {
        const supabase = createClient()
        // Try full-text search via RPC
        const { data: ftsData } = await supabase.rpc('search_documents', { p_query: query, p_cycle: null, p_year: null, p_limit: 8 })
        let docs: Result[] = []
        if (ftsData && ftsData.length > 0) {
          docs = ftsData.map((d: any) => ({ type: 'doc' as const, id: d.id, title: d.title, subtitle: `${CYCLE_LABELS[d.cycle] || d.cycle}${d.year ? ` · Année ${d.year}` : ''}${d.category && d.category !== 'Général' ? ` · ${d.category}` : ''}`, url: `/dashboard/${d.cycle}`, icon: File }))
        } else {
          const { data } = await supabase.from('documents').select('id,title,cycle,year,category').ilike('title', `%${q}%`).neq('title', '.keep').limit(8)
          docs = (data || []).map((d: any) => ({ type: 'doc' as const, id: d.id, title: d.title, subtitle: `${CYCLE_LABELS[d.cycle] || d.cycle}${d.year ? ` · Année ${d.year}` : ''}`, url: `/dashboard/${d.cycle}`, icon: File }))
        }
        setResults([...matchedPages, ...docs]); setActiveIndex(0)
      } catch { setResults(matchedPages) } finally { setLoading(false) }
    }
    const t = setTimeout(search, 250)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[activeIndex]) select(results[activeIndex].url)
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, results, activeIndex])

  const select = (url: string) => {
    if (query.trim()) saveRecent(query.trim())
    setOpen(false); router.push(url)
  }

  const pages = results.filter(r => r.type === 'page')
  const docs  = results.filter(r => r.type === 'doc')

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors border border-transparent dark:border-white/5">
        <span className="flex items-center gap-2"><Search className="w-4 h-4" />Recherche...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              {/* Input */}
              <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input ref={inputRef} type="text" placeholder="Rechercher cours, documents, pages..." value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-transparent border-0 focus:ring-0 px-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 outline-none" />
                {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />}
                {query && !loading && <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-4 h-4" /></button>}
                <kbd className="hidden sm:inline-block ml-2 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded shrink-0">ESC</kbd>
              </div>

              <div className="max-h-[65vh] overflow-y-auto">
                {/* Recent */}
                {!query.trim() && recent.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3" />Récents</p>
                    {recent.map((s, i) => (
                      <button key={i} onClick={() => setQuery(s)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{s}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty */}
                {!query.trim() && recent.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm"><Search className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />Commencez à taper pour rechercher…</div>
                )}

                {/* No results */}
                {query.trim() && !loading && results.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">Aucun résultat pour &ldquo;<strong className="text-slate-600 dark:text-slate-300">{query}</strong>&rdquo;</div>
                )}

                {/* Results */}
                {results.length > 0 && (
                  <div className="p-2">
                    {pages.length > 0 && <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pages</p>}
                    {pages.map((item, i) => (
                      <button key={item.id} onClick={() => select(item.url)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left group ${activeIndex === i ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors"><item.icon className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>{item.subtitle && <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>}</div>
                      </button>
                    ))}
                    {docs.length > 0 && <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Documents</p>}
                    {docs.map((item, idx) => {
                      const ri = pages.length + idx
                      return (
                        <button key={item.id} onClick={() => select(item.url)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left group ${activeIndex === ri ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors"><File className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>{item.subtitle && <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>}</div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Footer hints */}
                <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">↑↓</kbd> naviguer</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">↵</kbd> ouvrir</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">ESC</kbd> fermer</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
