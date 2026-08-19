'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { BellRing, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RealtimeNotifications({ userCycle, userRole }: { userCycle?: string | null, userRole?: string | null }) {
  const router = useRouter()
  
  useEffect(() => {
    // We only connect if the user is a normal student with a cycle, 
    // or if they are admin (admins might want to see all uploads)
    if (!userCycle && userRole !== 'admin') return

    const supabase = createClient()
    
    // Subscribe to INSERT events on the documents table
    const channel = supabase
      .channel('public:documents')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          const newDoc = payload.new
          
          // Check if this document is relevant for the current user
          // Admins see everything, students only see their cycle
          const isRelevant = userRole === 'admin' || newDoc.cycle === userCycle

          if (isRelevant) {
            toast(
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <BellRing className="w-4 h-4 text-blue-500" />
                  <span>Nouveau document !</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-slate-900 dark:text-white">{newDoc.title}</span> a été ajouté en <span className="uppercase">{newDoc.cycle}</span>.
                </p>
                <button 
                  onClick={() => router.push(`/dashboard/${newDoc.cycle}`)}
                  className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline text-left w-fit"
                >
                  Voir le document
                </button>
              </div>,
              {
                duration: 6000,
                position: 'bottom-right',
                icon: <FileText className="w-5 h-5 text-blue-500" />
              }
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userCycle, userRole, router])

  // This component doesn't render anything visible directly
  return null
}
