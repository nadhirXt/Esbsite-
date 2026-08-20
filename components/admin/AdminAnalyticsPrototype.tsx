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
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Analytics (Prototype)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Aperçu global de l'activité sur la plateforme</p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          En temps réel
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graphique d'Activité Hebdomadaire (Mock) */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <LineChart className="w-4 h-4 text-emerald-500" />
              Activité des 7 derniers jours
            </h3>
            <div className="text-xs flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Vues</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Téléchargements</div>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-48 gap-2">
            {MOCK_ACTIVITY_DATA.map((data, i) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2 relative group">
                <div className="w-full flex justify-center gap-1">
                  {/* Bar Vues */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.views / maxViews) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8, type: 'spring' }}
                    className="w-1/2 max-w-[12px] bg-emerald-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  {/* Bar Downloads */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.downloads / maxViews) * 100}%` }}
                    transition={{ delay: i * 0.1 + 0.1, duration: 0.8, type: 'spring' }}
                    className="w-1/2 max-w-[12px] bg-blue-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500">{data.day}</span>
                
                {/* Tooltip Hover */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {data.views} vues<br/>{data.downloads} dl
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Documents / Matières (Mock) */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-500" />
              Top des matières
            </h3>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-5">
            {MOCK_TOP_COURSES.map((course, i) => {
              const max = MOCK_TOP_COURSES[0].views;
              const width = `${(course.views / max) * 100}%`;
              
              return (
                <div key={course.name} className="relative">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{course.name}</span>
                    <span className="text-slate-500">{course.views} vues</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{ delay: 0.3 + (i * 0.1), duration: 0.8, type: 'spring' }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
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
