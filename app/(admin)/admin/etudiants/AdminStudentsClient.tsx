'use client'

import { useState } from 'react'
import { Search, Users, User as UserIcon, GraduationCap, Building2, Calendar, Filter } from 'lucide-react'

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
)
import { formatDate, CYCLES } from '@/lib/utils'
import type { User } from '@/lib/types'

export default function AdminStudentsClient({ initialStudents }: { initialStudents: User[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'licence', 'dseb', 'master', 'ancien'
  const [students, setStudents] = useState(initialStudents)

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (student.institution_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    let matchesFilter = true
    if (filterType === 'licence') matchesFilter = student.cycle === 'licence'
    else if (filterType === 'dseb') matchesFilter = student.cycle === 'dseb'
    else if (filterType === 'master') matchesFilter = student.cycle === 'master'
    else if (filterType === 'ancien') matchesFilter = student.user_type === 'ancien'

    return matchesSearch && matchesFilter
  })

  return (
    <div className="animate-fade-in max-w-6xl mx-auto py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 uppercase tracking-wider font-bold">STUDENT_REGISTRY // ANNUAIRE ACADÉMIQUE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 dark:bg-cyan-500/10 border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Users className="w-7 h-7 text-cyan-500 dark:text-cyan-400" />
          </div>
          Annuaire des Étudiants
        </h1>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">
          Consultez la liste des <span className="font-bold text-cyan-600 dark:text-cyan-400">{students.length}</span> étudiants inscrits sur la plateforme.
        </p>
      </div>

      <div className="bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row gap-5 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom ou établissement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {['all', 'dseb', 'master', 'licence', 'ancien'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === type 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                  : 'bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {type === 'all' ? 'TOUS' : type === 'ancien' ? 'ANCIENS' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/40 dark:bg-[#070D19]/60 backdrop-blur-sm">
          <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-bold text-sm font-mono">AUCUN ÉTUDIANT NE CORRESPOND À VOTRE RECHERCHE // NO_MATCH</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => {
            const cycleBadge = student.cycle ? CYCLES[student.cycle as keyof typeof CYCLES] : null
            
            return (
              <div key={student.id} className="bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group shadow-sm">
                <div>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)] group-hover:scale-105 transition-transform duration-300">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white truncate" title={student.full_name || ''}>{student.full_name || 'Utilisateur Anonyme'}</h3>
                      {cycleBadge ? (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold mt-1.5 ${cycleBadge?.color} dark:bg-opacity-20`}>
                          {cycleBadge?.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-[10px] font-mono font-bold mt-1.5">
                          Non spécifié
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/5 font-sans">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      </div>
                      <span className="truncate">{student.institution_name || 'Établissement non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      </div>
                      <span className="truncate capitalize">{student.user_type ? student.user_type.replace('_', ' ') : 'Type non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      <div className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      </div>
                      <span>Inscrit le {formatDate(student.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                {student.linkedin_url && (
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                    <a 
                      href={student.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center gap-2 w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-mono font-bold transition-all border border-blue-500/20 hover:border-blue-500/40"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                      VOIR LE PROFIL LINKEDIN
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
