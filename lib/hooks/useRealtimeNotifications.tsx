'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { BellRing, FileText, Megaphone, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { playNotificationChime } from '@/lib/audio-chime'
import { getNotificationPermissionState, requestPushNotificationPermission } from '@/lib/push-notifications'

export interface NotificationItem {
  id: string
  type: string
  title: string
  message?: string
  link?: string
  read: boolean
  created_at: string
}

export function useRealtimeNotifications(userCycle?: string | null, userRole?: string | null) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [pushStatus, setPushStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const processedIds = useRef(new Set<string>())

  // Initialize preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSound = localStorage.getItem('esb_notification_sound')
      if (storedSound !== null) {
        setSoundEnabled(storedSound === 'true')
      }
      getNotificationPermissionState().then(setPushStatus)
    }
  }, [])

  // Load initial notifications
  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    async function loadNotifications() {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30)

        if (!error && data && isMounted) {
          setNotifications(data)
          setUnreadCount(data.filter((n) => !n.read).length)
          data.forEach((n) => processedIds.current.add(n.id))
        }
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }

    loadNotifications()

    // Realtime channel for instant push updates
    const channelId = `realtime-hub-${Math.random().toString(36).slice(2, 9)}`
    const channel = supabase
      .channel(channelId)
      // 1. Listen to personal notifications
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          if (!isMounted) return
          const n = payload.new as NotificationItem
          if (processedIds.current.has(n.id)) return
          processedIds.current.add(n.id)

          setNotifications((prev) => [n, ...prev].slice(0, 30))
          setUnreadCount((c) => c + 1)
          playNotificationChime()

          toast(
            <div className="flex flex-col gap-1 cursor-pointer" onClick={() => n.link && router.push(n.link)}>
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <BellRing className="w-4 h-4 text-amber-500" />
                <span>{n.title}</span>
              </div>
              {n.message && <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>}
            </div>,
            { duration: 5000, position: 'bottom-right' }
          )
        }
      )
      // 2. Listen to announcements (instant broadcast)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          if (!isMounted) return
          const ann = payload.new as any
          const isRelevant = !ann.cycle_target || ann.cycle_target === userCycle || userRole === 'admin'
          if (!isRelevant) return

          const key = `ann-${ann.id}`
          if (processedIds.current.has(key)) return
          processedIds.current.add(key)

          playNotificationChime()
          toast(
            <div className="flex flex-col gap-1 cursor-pointer" onClick={() => router.push('/dashboard/actualites')}>
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>Annonce ESB : {ann.title}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{ann.content}</p>
            </div>,
            { duration: 7000, position: 'bottom-right' }
          )
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [userCycle, userRole, router])

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      localStorage.setItem('esb_notification_sound', String(next))
      if (next) playNotificationChime()
      return next
    })
  }, [])

  const enablePush = useCallback(async () => {
    const granted = await requestPushNotificationPermission()
    if (granted) {
      setPushStatus('granted')
      toast.success('Alertes Web Push activées avec succès !')
    } else {
      toast.error('Autorisation refusée ou non supportée par le navigateur.')
    }
  }, [])

  const markAllRead = useCallback(async () => {
    const supabase = createClient()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await supabase.rpc('mark_all_notifications_read')
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }, [])

  const markOneRead = useCallback(async (id: string, link?: string) => {
    const supabase = createClient()
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
    if (link) {
      router.push(link)
    }
  }, [router])

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true
    return n.type === activeFilter
  })

  return {
    notifications: filteredNotifications,
    rawNotifications: notifications,
    unreadCount,
    soundEnabled,
    pushStatus,
    activeFilter,
    setActiveFilter,
    toggleSound,
    enablePush,
    markAllRead,
    markOneRead,
  }
}
