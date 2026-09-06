'use client'

import { motion } from 'framer-motion'
import { LineChart, BarChart2, Activity, Users, FileText, ArrowUpRight } from 'lucide-react'

// Données fictives pour le prototype d'Analytics Admin
const MOCK_ACTIVITY_DATA = [
  { day: 'Lun', views: 45, downloads: 12 },
  { day: 'Mar', views: 52, downloads: 18 },
  { day: 'Mer', views: 38, downloads: 8 },
  { day: 'Jeu', views: 65, downloads: 24 },
  { day: 'Ven', views: 48, downloads: 15 },
  { day: 'Sam', views: 25, downloads: 5 },
  { day: 'Dim', views: 30, downloads: 10 },
]

const MOCK_TOP_COURSES = [
  { name: 'Finance de marché', views: 124 },
  { name: 'Macroéconomie', views: 98 },
  { name: 'Comptabilité bancaire', views: 85 },
  { name: 'Droit des affaires', views: 64 },
]

export default function AdminAnalyticsPrototype() {
  const maxViews = Math.max(...MOCK_ACTIVITY_DATA.map(d => d.views))

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans tracking-wide uppercase text-xs">
            <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            Analytics // Télémétrie Plateforme
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Aperçu global de l'activité sur la plateforme en temps réel</p>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          LIVE TELEMETRY
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graphique d'Activité Hebdomadaire */}
        <div className="relative overflow-hidden bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-400" />
              Activité 7J
            </h3>
            <div className="text-xs font-mono flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></div>Vues</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]"></div>DL</div>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-48 gap-2">
            {MOCK_ACTIVITY_DATA.map((data, i) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2 relative group">
                <div className="w-full flex justify-center gap-1.5 items-end h-full">
                  {/* Bar Vues */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.views / maxViews) * 100}%` }}
                    transition={{ delay: i * 0.08, duration: 0.8, type: 'spring' }}
                    className="w-1/2 max-w-[10px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm opacity-90 group-hover:opacity-100 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all"
                  />
                  {/* Bar Downloads */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.downloads / maxViews) * 100}%` }}
                    transition={{ delay: i * 0.08 + 0.1, duration: 0.8, type: 'spring' }}
                    className="w-1/2 max-w-[10px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-sm opacity-90 group-hover:opacity-100 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all"
                  />
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">{data.day}</span>
                
                {/* Tooltip Hover */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-950 border border-slate-700 text-white text-[10px] font-mono px-2.5 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {data.views} vues / {data.downloads} dl
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Documents / Matières */}
        <div className="relative overflow-hidden bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              Top des matières
            </h3>
            <button className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              VOIR TOUT <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-5">
            {MOCK_TOP_COURSES.map((course, i) => {
              const max = MOCK_TOP_COURSES[0].views;
              const width = `${(course.views / max) * 100}%`;
              
              return (
                <div key={course.name} className="relative">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{course.name}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{course.views} vues</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{ delay: 0.2 + (i * 0.1), duration: 0.8, type: 'spring' }}
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
