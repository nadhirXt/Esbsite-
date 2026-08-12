'use client'

import { useState } from 'react'
import { Search, Users, User, GraduationCap, Building2, Calendar, Filter } from 'lucide-react'

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
)
import { formatDate, CYCLES } from '@/lib/utils'

export default function AdminStudentsClient({ initialStudents }: { initialStudents: any[] }) {
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
    <div className="animate-fade-in max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EFF6FF] text-[#1E3A8A] rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          Annuaire des Étudiants
        </h1>
        <p className="text-[#64748B] text-sm mt-2">
          Consultez la liste des {students.length} étudiants inscrits sur la plateforme.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl mb-8 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom ou établissement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {['all', 'dseb', 'master', 'licence', 'ancien'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === type 
                  ? 'bg-[#1E3A8A] text-white' 
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type === 'all' ? 'Tous' : type === 'ancien' ? 'Anciens' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <Users className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B] font-medium">Aucun étudiant trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const cycleBadge = student.cycle ? CYCLES[student.cycle as keyof typeof CYCLES] : null
            
            return (
              <div key={student.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-md hover:border-[#1E3A8A]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#64748B] shrink-0 border border-slate-200">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#0F172A] truncate" title={student.full_name}>{student.full_name || 'Utilisateur Anonyme'}</h3>
                      {cycleBadge ? (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium mt-1.5 ${cycleBadge?.color}`}>
                          {cycleBadge?.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 px-2 py-0.5 text-xs font-medium mt-1.5">
                          Non spécifié
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">{student.institution_name || 'Établissement non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <GraduationCap className="w-4 h-4 shrink-0" />
                      <span className="truncate capitalize">{student.user_type ? student.user_type.replace('_', ' ') : 'Type non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Inscrit(e) le {formatDate(student.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                {student.linkedin_url && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <a 
                      href={student.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center gap-2 w-full py-2 bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#0A66C2] rounded-xl text-sm font-medium transition-colors border border-[#E2E8F0] hover:border-[#BFDBFE]"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                      Voir le profil LinkedIn
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
