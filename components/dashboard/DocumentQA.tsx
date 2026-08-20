'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Loader2, User, Reply, MessageSquare, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface QAPost {
  id: string
  content: string
  author_name: string
  parent_id: string | null
  created_at: string
  reply_count: number
}

/**
 * Q&A collaboratif par document (légère : questions_top + réponses simples).
 */
export default function DocumentQA({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false)
  const [posts, setPosts] = useState<QAPost[]>([])
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const supabase = createClient()

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_document_questions', {
      p_document_id: documentId,
    })
    if (!error && data) setPosts(data as QAPost[])
    setLoading(false)
  }, [documentId, supabase])

  useEffect(() => {
    if (open) fetchPosts()
  }, [open, fetchPosts])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim() || sending) return
    setSending(true)
    const { error } = await supabase.from('document_questions').insert({
      document_id: documentId,
      content: content.trim().slice(0, 1000),
      parent_id: replyingTo,
    })
    setSending(false)
    if (!error) {
      setContent('')
      setReplyingTo(null)
      fetchPosts()
    }
  }

  const questions = posts.filter(p => !p.parent_id)
  const answersOf = (qid: string) => posts.filter(p => p.parent_id === qid)

  return (
    <>
      {/* Launcher — bouton intégré en bas des cartes de document */}
      <button
        onClick={() => setOpen(o => !o)}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Questions & réponses"
      >
        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:scale-110 transition-transform">
          <MessageCircle className="w-3.5 h-3.5" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              exit={{ y: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-lg max-h-[80vh] flex flex-col divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-3xl shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Questions & Réponses</h3>
                  <p className="text-xs text-slate-400">Posez une question, partagez votre aide</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Aucune question pour ce document.
                      <br />
                      <span className="text-slate-400 text-xs">Soyez le premier à aider la communauté !</span>
                    </p>
                  </div>
                ) : (
                  questions.map(q => {
                    const answers = answersOf(q.id)
                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 bg-slate-50/60 dark:bg-slate-800/30"
                      >
                        <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{q.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <span className="font-medium">{q.author_name}</span>
                          <span>•</span>
                          <span>{new Date(q.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        </div>

                        {/* Réponses */}
                        {answers.length > 0 && (
                          <div className="mt-3 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                            {answers.map(ans => (
                              <div key={ans.id} className="rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-3">
                                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{ans.content}</p>
                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                                  <span className="font-medium">{ans.author_name}</span>
                                  <span>•</span>
                                  <span>{new Date(ans.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => { setReplyingTo(q.id); setContent('') }}
                          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          {answers.length > 0 ? `${answers.length} réponse(s)` : 'Répondre'}
                        </button>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Reply banner */}
              {replyingTo && (
                <div className="px-4 pt-3 text-xs text-blue-600 dark:text-blue-400 flex items-center justify-between">
                  <span>
                    <ChevronLeft className="w-3 h-3 inline" /> Répondre à une question
                  </span>
                  <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">Annuler</button>
                </div>
              )}

              {/* Input */}
              <div className="p-4">
                <form onSubmit={submit} className="flex items-end gap-2">
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={2}
                    placeholder={replyingTo ? 'Écrivez votre réponse…' : 'Poser une question sur ce document…'}
                    className="flex-1 resize-none px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="shrink-0 h-11 px-4 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** Carte compacte à intégrer dans un doc — utilisé par CycleDocumentsGrid */
export function QAButtons({ documentId, compact = false }: { documentId: string; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && <DocumentQA documentId={documentId} />}
      <button
        onClick={() => setOpen(true)}
        className={`${compact ? 'w-7 h-7 text-xs' : 'px-2.5 py-1.5 text-xs'} rounded-lg flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors font-medium`}
        title="Questions & réponses"
      >
        <MessageCircle className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
      </button>
    </>
  )
}