'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Bell, FileText, CheckCheck, X, Volume2, VolumeX,
  Smartphone, Filter, Megaphone, Calendar, MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeNotifications, type NotificationItem } from '@/lib/hooks/useRealtimeNotifications'

interface NotificationBellProps {
  userCycle?: string | null
  userRole?: string | null
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
    if (mins < 1) return 'À l\'instant'
    if (mins < 60) return rtf.format(-mins, 'minute')
    if (hours < 24) return rtf.format(-hours, 'hour')
    return rtf.format(-days, 'day')
  } catch {
    return 'Récemment'
  }
}

const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
  new_document: { icon: FileText, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  announcement: { icon: Megaphone, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  exam_reminder: { icon: Calendar, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  qa_reply: { icon: MessageSquare, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
}

export default function NotificationBell({ userCycle, userRole }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    soundEnabled,
    pushStatus,
    activeFilter,
    setActiveFilter,
    toggleSound,
    enablePush,
    markAllRead,
    markOneRead,
  } = useRealtimeNotifications(userCycle, userRole)

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        aria-label="Centre de notifications"
        title="Notifications en direct"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0B1120] flex items-center justify-center shadow-sm"
          >
            <span className="text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.span>
        )}
      </button>

      {/* Notification Modal / Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-4 top-16 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 w-auto md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-blue-950/20 border border-slate-200 dark:border-slate-800 overflow-hidden z-50 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[11px] font-bold">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Sound Toggle */}
                <button
                  onClick={toggleSound}
                  title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>

                {/* Mark all as read */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Tout marquer comme lu"
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Push Notification Opt-in Prompt */}
            {pushStatus === 'default' && (
              <div className="px-4 py-2.5 bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Activer les alertes sur votre écran ?</span>
                </div>
                <button
                  onClick={enablePush}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors cursor-pointer shrink-0"
                >
                  Activer
                </button>
              </div>
            )}

            {/* Filter Chips */}
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setActiveFilter('new_document')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === 'new_document'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveFilter('announcement')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === 'announcement'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Annonces
              </button>
              <button
                onClick={() => setActiveFilter('exam_reminder')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === 'exam_reminder'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Examens
              </button>
            </div>

            {/* Notification Items List */}
            <div className="overflow-y-auto max-h-80 divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2 opacity-50" />
                  Aucune notification pour le moment
                </div>
              ) : (
                notifications.map((n) => {
                  const typeInfo = TYPE_ICONS[n.type] || { icon: Bell, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' }
                  const Icon = typeInfo.icon

                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        markOneRead(n.id, n.link)
                        setIsOpen(false)
                      }}
                      className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                        !n.read
                          ? 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/70 dark:hover:bg-blue-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${typeInfo.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold truncate ${!n.read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                        {n.message && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        )}
                      </div>

                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <Link
                href="/dashboard/actualites"
                onClick={() => setIsOpen(false)}
                className="text-blue-600 dark:text-amber-400 hover:underline font-semibold"
              >
                Toutes les actualités ESB →
              </Link>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Temps Réel Actif
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
