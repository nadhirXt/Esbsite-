import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Megaphone, Pin, Info, AlertTriangle, CheckCircle, Zap, ArrowLeft } from 'lucide-react'
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
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au tableau de bord
        </Link>
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
        <div className="text-center py-20 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#070D19]/90 backdrop-blur-xl">
          <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-bold">Aucune actualité pour le moment</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-mono mt-1">Revenez bientôt !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned announcements */}
          {pinned.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">Épinglées</span>
              </div>
              {pinned.map(announcement => {
                const config = TYPE_CONFIG[announcement.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info
                const Icon = config.icon
                return (
                  <div key={announcement.id} className="relative rounded-3xl border border-amber-500/30 bg-[#070D19]/95 backdrop-blur-xl p-5 sm:p-6 shadow-[0_0_25px_rgba(245,158,11,0.12)]">
                    <div className="absolute top-5 right-5">
                      <Pin className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                          <h2 className="text-base font-black text-white">{announcement.title}</h2>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{announcement.content}</p>
                        <p className="text-xs font-mono text-slate-500 mt-3">
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
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Flux d&apos;informations</span>
                </div>
              )}
              {regular.map(announcement => {
                const config = TYPE_CONFIG[announcement.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info
                const Icon = config.icon
                return (
                  <div key={announcement.id} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070D19]/90 backdrop-blur-xl p-5 sm:p-6 shadow-sm hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                          <h2 className="text-base font-black text-slate-900 dark:text-white">{announcement.title}</h2>
                          {announcement.cycle_target && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300 font-bold uppercase">
                              {announcement.cycle_target}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{announcement.content}</p>
                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-3">
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
