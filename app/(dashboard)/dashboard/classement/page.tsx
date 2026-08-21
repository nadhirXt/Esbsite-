import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/ensure-profile'
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react'
import { CYCLES } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Classement | ESB Hub' }

export default async function ClassementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  const { data: leaderboard, error } = await supabase.rpc('get_leaderboard', {
    p_cycle: null, // tous les cycles
  })

  if (error) console.error('Leaderboard error:', error)

  const userRank = leaderboard?.find((entry: any) => entry.user_id === user.id)

  const RANK_CONFIG = [
    { rank: 1, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: '🥇' },
    { rank: 2, icon: Medal,  color: 'text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-800/50',   label: '🥈' },
    { rank: 3, icon: Medal,  color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20',   label: '🥉' },
  ]

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg shadow-amber-500/25 mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Classement ESB Hub</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gagnez des points en consultant des cours, téléchargeant des documents et participant aux Q&amp;A
        </p>
      </div>

      {/* Point system legend */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 p-4 mb-6">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Comment gagner des points
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { action: 'Voir un document',       pts: '+5 pts',  color: 'text-blue-600' },
            { action: 'Télécharger un document', pts: '+10 pts', color: 'text-green-600' },
            { action: 'Poser/répondre une question', pts: '+20 pts', color: 'text-purple-600' },
            { action: 'Heure de focus étude',   pts: '+30 pts', color: 'text-amber-600' },
          ].map(item => (
            <div key={item.action} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-600 dark:text-slate-400">{item.action}</span>
              <span className={`text-xs font-bold ${item.color}`}>{item.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My rank banner */}
      {userRank && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 mb-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-200" />
            <div>
              <p className="text-xs text-blue-200">Votre classement</p>
              <p className="font-bold">#{userRank.rank} — {userRank.points} pts</p>
            </div>
          </div>
          <div className="text-3xl font-black text-blue-100 opacity-50">
            #{userRank.rank}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {!leaderboard || leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Soyez le premier à apparaître !</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Consultez des documents pour commencer</p>
          </div>
        ) : (
          <div>
            {leaderboard.map((entry: any, index: number) => {
              const isCurrentUser = entry.user_id === user.id
              const rankConfig = RANK_CONFIG.find(r => r.rank === Number(entry.rank))
              const cycleBadge = entry.cycle ? CYCLES[entry.cycle as keyof typeof CYCLES] : null

              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors
                    ${index !== leaderboard.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}
                    ${isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                  `}
                >
                  {/* Rank */}
                  <div className="w-10 text-center shrink-0">
                    {rankConfig ? (
                      <span className="text-2xl">{rankConfig.label}</span>
                    ) : (
                      <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0
                    ${isCurrentUser ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-slate-400 to-slate-600'}
                  `}>
                    {(entry.full_name || 'A').charAt(0).toUpperCase()}
                  </div>

                  {/* Name & cycle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {entry.full_name || 'Anonyme'}
                        {isCurrentUser && <span className="ml-1 text-xs">(vous)</span>}
                      </p>
                      {cycleBadge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cycleBadge.color}`}>
                          {cycleBadge.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-slate-900 dark:text-white">{entry.points.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">points</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
