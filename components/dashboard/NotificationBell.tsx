'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, FileText, Check, CheckCheck, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationBellProps {
  userCycle?: string | null
  userRole?: string | null
}

interface Notification {
  id: string
  type: string
  title: string
  message?: string
  link?: string
  read: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
    if (mins < 60) return rtf.format(-mins, 'minute')
    if (hours < 24) return rtf.format(-hours, 'hour')
    return rtf.format(-days, 'day')
  } catch { return 'Récemment' }
}

const TYPE_ICONS: Record<string, string> = {
  new_document: '📄',
  qa_reply: '💬',
  exam_reminder: '📅',
  announcement: '📢',
}

export default function NotificationBell({ userCycle, userRole }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    async function loadNotifications() {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (!error && data && isMounted) {
          setNotifications(data)
          setUnreadCount(data.filter(n => !n.read).length)
        }
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }

    loadNotifications()

    // Unique channel identifier per component instance to avoid collisions when multiple bells are rendered (mobile + desktop)
    const channelName = `notifications-bell-${Math.random().toString(36).slice(2, 11)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          if (!isMounted) return
          const n = payload.new as Notification
          setNotifications(prev => [n, ...prev].slice(0, 20))
          setUnreadCount(c => c + 1)
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  async function markAllRead() {
    const supabase = createClient()
    await supabase.rpc('mark_all_notifications_read')
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function markOneRead(id: string, link?: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0B1120] flex items-center justify-center"
          >
            <span className="text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 md:right-auto md:left-full md:top-0 md:mt-0 md:ml-4 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                    {unreadCount} non lues
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Tout marquer comme lu"
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <Bell className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  Aucune notification pour le moment
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { if (n.link) markOneRead(n.id, n.link); else markOneRead(n.id) }}
                    className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0
                      ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/5 hover:bg-blue-50 dark:hover:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                    `}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {n.title}
                      </p>
                      {n.message && <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{n.message}</p>}
                      <p className="text-xs text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <Link
              href={`/dashboard/actualites`}
              onClick={() => setIsOpen(false)}
              className="block w-full p-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/50 transition-colors border-t border-slate-200 dark:border-slate-800"
            >
              Voir les actualités ESB →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
