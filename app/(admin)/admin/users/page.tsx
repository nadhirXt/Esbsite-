'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, UserCog, ShieldCheck, ShieldAlert, GraduationCap, X, Mail, Clock, Search, Shield, ShieldOff } from 'lucide-react'
import { cn } from '@/lib/utils'

// Utiliser des classes Tailwind natives car on ne sait pas si Card/Button sont exactement compatibles ici
export default function AdminUsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
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
      setCurrentUserId(session.user.id)

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

  async function handleToggleAdmin(targetUser: any) {
    const isPromoting = targetUser.role !== 'admin'
    const confirmMsg = isPromoting
      ? `Promouvoir ${targetUser.full_name || targetUser.email} comme Administrateur ?`
      : `Rétrograder ${targetUser.full_name || targetUser.email} au rôle Étudiant ?`
    if (!confirm(confirmMsg)) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Session expirée")

      const newRole = isPromoting ? 'admin' : 'student'
      const res = await fetch('/api/admin/users/toggle-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          targetUserId: targetUser.id,
          newRole
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erreur lors de la modification du rôle')
      }

      setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u))
    } catch (err: any) {
      alert(err.message)
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
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent shadow-[0_0_20px_rgba(245,158,11,0.4)]"></div>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">CHARGEMENT // SYS_USERS...</p>
      </div>
    )
  }

  return (
    <div className="py-8 animate-fade-in max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono text-amber-500 dark:text-amber-400 uppercase tracking-wider font-bold">REGISTRY // MEMBRES & PRIVILÈGES</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <ShieldCheck className="w-7 h-7 text-amber-500 dark:text-amber-400" />
            </div>
            Gestion des Membres
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">Contrôle des accès utilisateurs, affectation des délégués et supervision académique.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un membre..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 py-2.5 w-full md:w-80 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-xs font-sans text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 border border-red-500/30 text-xs font-mono shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider border-b border-slate-200/80 dark:border-white/10">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle & Cycle</th>
                <th className="px-6 py-4">Statut Délégué</th>
                <th className="px-6 py-4">Date d'inscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{u.full_name || 'Sans Nom'}</div>
                    <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 text-[11px] font-mono">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" /> {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">ADMIN</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-mono font-bold border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]">ÉTUDIANT</span>
                      )}
                      {u.cycle && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-white/10">{u.cycle.toUpperCase()}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.is_delegate ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold w-fit shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <GraduationCap className="w-3.5 h-3.5" />
                        DÉLÉGUÉ {u.delegate_cycle?.toUpperCase()} ({u.delegate_year}A)
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 font-mono">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id !== currentUserId ? (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Toggle Admin role */}
                        <button
                          onClick={() => handleToggleAdmin(u)}
                          className={cn(
                            "p-2 rounded-xl transition-all cursor-pointer",
                            u.role === 'admin'
                              ? "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                              : "text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                          )}
                          title={u.role === 'admin' ? "Rétrograder en rôle Étudiant" : "Promouvoir au rôle Administrateur"}
                        >
                          {u.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>

                        {/* Toggle Delegate (for students) */}
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => setSelectedUser(u)}
                            className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer"
                            title={u.is_delegate ? "Modifier/Retirer le rôle Délégué" : "Nommer Délégué"}
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete User */}
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg">
                        Vous
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-mono">
                    AUCUN MEMBRE TROUVÉ // NO_DATA
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Assigner Délégué */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#070D19] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200/80 dark:border-white/10">
            <div className="p-6 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-500" />
                {selectedUser.is_delegate ? 'Gérer le Délégué' : 'Nommer Délégué'}
              </h3>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <p className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">Candidat // Profil :</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{selectedUser.full_name}</p>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
              </div>

              {!selectedUser.is_delegate ? (
                <form onSubmit={handleToggleDelegate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Cycle Académique</label>
                    <select 
                      value={delegateCycle} 
                      onChange={(e) => setDelegateCycle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#030712] text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                    >
                      <option value="licence">Licence Bancaire</option>
                      <option value="dseb">DSEB</option>
                      <option value="master">Master</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Année de Promotion</label>
                    <select 
                      value={delegateYear} 
                      onChange={(e) => setDelegateYear(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#030712] text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                    >
                      <option value="1">1ère Année</option>
                      <option value="2">2ème Année</option>
                      {(delegateCycle === 'licence' || delegateCycle === 'dseb') && <option value="3">3ème Année</option>}
                      {delegateCycle === 'dseb' && <option value="4">4ème Année</option>}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all mt-6 cursor-pointer">
                    Confirmer Privilèges Délégué
                  </button>
                </form>
              ) : (
                <div>
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl border border-emerald-500/30 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-xs uppercase font-mono">Actuellement Délégué</p>
                      <p className="text-xs font-mono opacity-90">{selectedUser.delegate_cycle?.toUpperCase()} - Année {selectedUser.delegate_year}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleDelegate}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-red-500/30 cursor-pointer"
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
