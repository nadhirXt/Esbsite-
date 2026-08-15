'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, UserCog, ShieldCheck, Mail, Clock, Search, ShieldAlert, GraduationCap, X } from 'lucide-react'

// Utiliser des classes Tailwind natives car on ne sait pas si Card/Button sont exactement compatibles ici
export default function AdminUsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [sessionToken, setSessionToken] = useState('')

  // Modal d'assignation Délégué
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [delegateCycle, setDelegateCycle] = useState('dseb')
  const [delegateYear, setDelegateYear] = useState('1')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setSessionToken(session.access_token)

      // Vérifier si admin côté client (pour affichage, l'API bloquera quand même)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      
      if (!res.ok) throw new Error('Erreur de chargement des utilisateurs')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.")) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Session expirée")

      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ targetUserId: userId })
      })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      
      // Mettre à jour la liste
      setUsers(users.filter(u => u.id !== userId))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleToggleDelegate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const isDelegate = !selectedUser.is_delegate
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Session expirée")

      const res = await fetch('/api/admin/users/toggle-delegate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          targetUserId: selectedUser.id,
          isDelegate: isDelegate,
          delegateCycle: isDelegate ? delegateCycle : null,
          delegateYear: isDelegate ? parseInt(delegateYear) : null
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erreur lors de la modification du rôle')
      }
      
      // Mettre à jour l'affichage
      setUsers(users.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            is_delegate: isDelegate,
            delegate_cycle: isDelegate ? delegateCycle : null,
            delegate_year: isDelegate ? parseInt(delegateYear) : null
          }
        }
        return u
      }))
      
      setSelectedUser(null)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#2563EB]" />
              Tableau de Bord Admin
            </h1>
            <p className="text-[#64748B] mt-2">Gérez les utilisateurs, les rôles et les délégués.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Rechercher un membre..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-80 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-200">
            <ShieldAlert className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F1F5F9] text-[#475569] font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Rôle & Cycle</th>
                  <th className="px-6 py-4">Statut Délégué</th>
                  <th className="px-6 py-4">Date d'inscription</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0F172A]">{u.full_name || 'Sans Nom'}</div>
                      <div className="text-[#64748B] flex items-center gap-1.5 mt-1 text-xs">
                        <Mail className="w-3.5 h-3.5" /> {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.role === 'admin' ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">Admin</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Étudiant</span>
                        )}
                        {u.cycle && (
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">{u.cycle.toUpperCase()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_delegate ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <GraduationCap className="w-4 h-4" />
                          Délégué {u.delegate_cycle?.toUpperCase()} ({u.delegate_year}A)
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => setSelectedUser(u)}
                            className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                            title={u.is_delegate ? "Modifier/Retirer le rôle Délégué" : "Nommer Délégué"}
                          >
                            <UserCog className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="p-2 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#64748B]">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Assigner Délégué */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">
                {selectedUser.is_delegate ? 'Gérer le Délégué' : 'Nommer Délégué'}
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-[#64748B] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-[#475569]">Utilisateur :</p>
                <p className="font-semibold text-[#0F172A]">{selectedUser.full_name}</p>
                <p className="text-xs text-[#64748B]">{selectedUser.email}</p>
              </div>

              {!selectedUser.is_delegate ? (
                <form onSubmit={handleToggleDelegate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Cycle</label>
                    <select 
                      value={delegateCycle} 
                      onChange={(e) => setDelegateCycle(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none"
                    >
                      <option value="licence">Licence Bancaire</option>
                      <option value="dseb">DSEB</option>
                      <option value="master">Master</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Année</label>
                    <select 
                      value={delegateYear} 
                      onChange={(e) => setDelegateYear(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none"
                    >
                      <option value="1">1ère Année</option>
                      <option value="2">2ème Année</option>
                      {(delegateCycle === 'licence' || delegateCycle === 'dseb') && <option value="3">3ème Année</option>}
                      {delegateCycle === 'dseb' && <option value="4">4ème Année</option>}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors mt-6">
                    Confirmer Délégué
                  </button>
                </form>
              ) : (
                <div>
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 mb-6 flex items-center gap-3">
                    <GraduationCap className="w-6 h-6" />
                    <div>
                      <p className="font-bold">Actuellement Délégué</p>
                      <p className="text-sm">{selectedUser.delegate_cycle?.toUpperCase()} - Année {selectedUser.delegate_year}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleDelegate}
                    className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                  >
                    Révoquer le statut de Délégué
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
