import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Megaphone, Pin, Info, AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Actualités ESB | ESB Hub' }

const TYPE_CONFIG = {
  info:    { icon: Info,          color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',   iconColor: 'text-blue-600 dark:text-blue-400',   label: 'Info' },
  warning: { icon: AlertTriangle, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', iconColor: 'text-amber-600 dark:text-amber-400',  label: 'Attention' },
  success: { icon: CheckCircle,   color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', iconColor: 'text-green-600 dark:text-green-400',   label: 'Succès' },
  urgent:  { icon: Zap,           color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',       iconColor: 'text-red-600 dark:text-red-400',      label: 'Urgent' },
}

export default async function ActualitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const pinned = announcements?.filter(a => a.pinned) || []
  const regular = announcements?.filter(a => !a.pinned) || []

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
            <Megaphone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Actualités ESB</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Annonces et informations de l&apos;administration</p>
          </div>
        </div>
      </div>

      {announcements?.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]">
          <Megaphone className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune actualité pour le moment</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Revenez bientôt !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned announcements */}
          {pinned.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Épinglées</span>
              </div>
              {pinned.map(announcement => {
                const config = TYPE_CONFIG[announcement.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info
                const Icon = config.icon
                return (
                  <div key={announcement.id} className={`relative rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-5 shadow-sm`}>
                    <div className="absolute top-4 right-4">
                      <Pin className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${config.color} shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">{announcement.title}</h2>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color} ${config.iconColor}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{announcement.content}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          {formatDate(announcement.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Regular announcements */}
          {regular.length > 0 && (
            <div className="space-y-3">
              {pinned.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Toutes les annonces</span>
                </div>
              )}
              {regular.map(announcement => {
                const config = TYPE_CONFIG[announcement.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info
                const Icon = config.icon
                return (
                  <div key={announcement.id} className={`rounded-2xl border ${config.color} p-5 shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl bg-white dark:bg-black/20 shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">{announcement.title}</h2>
                          {announcement.cycle_target && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                              {announcement.cycle_target}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{announcement.content}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          {formatDate(announcement.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
