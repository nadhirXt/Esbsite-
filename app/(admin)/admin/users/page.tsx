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
    return <div className="min-h-[80vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
    </div>
  }

  return (
    <div className="py-8 animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            Gestion des Membres
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Gérez les utilisateurs, les rôles et les délégués.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un membre..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 w-full md:w-80 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-500/30">
          <ShieldAlert className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-5">Utilisateur</th>
                <th className="px-6 py-5">Rôle & Cycle</th>
                <th className="px-6 py-5">Statut Délégué</th>
                <th className="px-6 py-5">Date d'inscription</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{u.full_name || 'Sans Nom'}</div>
                    <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 text-xs">
                      <Mail className="w-3.5 h-3.5" /> {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' ? (
                        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/20">Admin</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-500/20">Étudiant</span>
                      )}
                      {u.cycle && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-white/10">{u.cycle.toUpperCase()}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.is_delegate ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold w-fit">
                        <GraduationCap className="w-4 h-4" />
                        Délégué {u.delegate_cycle?.toUpperCase()} ({u.delegate_year}A)
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'admin' && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                          title={u.is_delegate ? "Modifier/Retirer le rôle Délégué" : "Nommer Délégué"}
                        >
                          <UserCog className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Assigner Délégué */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200 dark:border-white/10">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedUser.is_delegate ? 'Gérer le Délégué' : 'Nommer Délégué'}
              </h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Utilisateur :</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.full_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
              </div>

              {!selectedUser.is_delegate ? (
                <form onSubmit={handleToggleDelegate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Cycle</label>
                    <select 
                      value={delegateCycle} 
                      onChange={(e) => setDelegateCycle(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="licence">Licence Bancaire</option>
                      <option value="dseb">DSEB</option>
                      <option value="master">Master</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Année</label>
                    <select 
                      value={delegateYear} 
                      onChange={(e) => setDelegateYear(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="1">1ère Année</option>
                      <option value="2">2ème Année</option>
                      {(delegateCycle === 'licence' || delegateCycle === 'dseb') && <option value="3">3ème Année</option>}
                      {delegateCycle === 'dseb' && <option value="4">4ème Année</option>}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all mt-6">
                    Confirmer Délégué
                  </button>
                </form>
              ) : (
                <div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 mb-6 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-base">Actuellement Délégué</p>
                      <p className="text-sm opacity-90">{selectedUser.delegate_cycle?.toUpperCase()} - Année {selectedUser.delegate_year}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleDelegate}
                    className="w-full py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-200 dark:border-red-500/30"
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
