'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, BookOpen, Link2, Users, Loader2, File, Folder } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/types'

export default function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ type: 'page' | 'doc', id: string, title: string, subtitle?: string, url: string, icon: any }[]>([])

  // Static pages to search
  const PAGES = [
    { type: 'page' as const, id: 'p1', title: 'Licence Bancaire', subtitle: 'Mes cours', url: '/dashboard/licence', icon: BookOpen },
    { type: 'page' as const, id: 'p2', title: 'DSEB', subtitle: 'Mes cours', url: '/dashboard/dseb', icon: BookOpen },
    { type: 'page' as const, id: 'p3', title: 'Master', subtitle: 'Mes cours', url: '/dashboard/master', icon: BookOpen },
    { type: 'page' as const, id: 'p4', title: 'Bibliothèque', subtitle: 'Livres et ressources', url: '/dashboard/bibliotheque', icon: FileText },
    { type: 'page' as const, id: 'p5', title: 'Annuaire', subtitle: 'Réseau des étudiants', url: '/dashboard/annuaire', icon: Users },
    { type: 'page' as const, id: 'p6', title: 'Ressources', subtitle: 'Liens utiles', url: '/dashboard/ressources', icon: Link2 },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      const q = query.toLowerCase()

      // 1. Search in pages
      const matchedPages = PAGES.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.subtitle && p.subtitle.toLowerCase().includes(q))
      )

      // 2. Search in documents
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('documents')
          .select('id, title, cycle, category')
          .ilike('title', `%${q}%`)
          .limit(10)

        if (error) throw error

        const matchedDocs = (data || []).map((doc: any) => ({
          type: 'doc' as const,
          id: doc.id,
          title: doc.title,
          subtitle: `${doc.cycle.toUpperCase()} • ${doc.category}`,
          url: `/dashboard/${doc.cycle}`, // We navigate to the cycle page
          icon: File
        }))

        setResults([...matchedPages, ...matchedDocs])
      } catch (err) {
        console.error('Search error:', err)
        setResults(matchedPages)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors border border-transparent dark:border-white/5"
      >
        <span className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Recherche...
        </span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un cours, un document..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-0 focus:ring-0 px-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  autoFocus
                />
                {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {!query.trim() && (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    Commencez à taper pour rechercher des cours, des dossiers ou des documents.
                  </div>
                )}
                
                {query.trim() && !loading && results.length === 0 && (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    Aucun résultat trouvé pour "{query}"
                  </div>
                )}

                {results.length > 0 && (
                  <div className="space-y-1">
                    {results.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.url)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
