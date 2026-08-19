'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, FileText, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Document } from '@/lib/types'
import Link from 'next/link'

interface NotificationBellProps {
  userCycle?: string | null
  userRole?: string | null
}

export default function NotificationBell({ userCycle, userRole }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [recentDocs, setRecentDocs] = useState<Document[]>([])
  const [hasNew, setHasNew] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchRecentDocs() {
      if (!userCycle && userRole !== 'admin') return
      
      const supabase = createClient()
      let query = supabase
        .from('documents')
        .select('*')
        .neq('title', '.keep')
        .order('created_at', { ascending: false })
        .limit(5)

      if (userRole !== 'admin') {
        query = query.eq('cycle', userCycle)
      }

      const { data } = await query

      if (data && data.length > 0) {
        setRecentDocs(data)
        
        // Check if there are documents newer than 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const hasRecent = data.some(doc => new Date(doc.created_at) > sevenDaysAgo)
        setHasNew(hasRecent)
      }
    }

    fetchRecentDocs()
  }, [userCycle, userRole])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasNew && (
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0B1120]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 md:right-auto md:left-full md:top-0 md:mt-0 md:ml-4 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-blue-900/5 border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Nouveautés</h3>
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
              Récents
            </span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {recentDocs.length > 0 ? (
              <div className="flex flex-col">
                {recentDocs.map((doc) => {
                  let timeAgoStr = ''
                  try {
                    const diffMs = new Date().getTime() - new Date(doc.created_at).getTime()
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                    const diffMins = Math.floor(diffMs / (1000 * 60))
                    
                    const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
                    
                    if (diffMins < 60) {
                      timeAgoStr = rtf.format(-diffMins, 'minute')
                    } else if (diffHours < 24) {
                      timeAgoStr = rtf.format(-diffHours, 'hour')
                    } else {
                      timeAgoStr = rtf.format(-diffDays, 'day')
                    }
                  } catch (e) {
                    timeAgoStr = 'Récemment'
                  }
                  
                  return (
                    <Link
                      key={doc.id}
                      href={`/dashboard/${doc.cycle}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50 last:border-0 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {doc.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {doc.category || 'Document'}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                            {timeAgoStr}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                Aucun document récent pour le moment.
              </div>
            )}
          </div>
          
          <Link
            href={`/dashboard/${userCycle || 'licence'}`}
            onClick={() => setIsOpen(false)}
            className="block w-full p-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/50 transition-colors border-t border-slate-200 dark:border-slate-800"
          >
            Aller à mes cours
          </Link>
        </div>
      )}
    </div>
  )
}
