'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Mail, Key, Check, X, Search, Clock, Trash2, ShieldAlert } from 'lucide-react'

export default function AdminMemoiresPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/admin/memoires/requests', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (res.ok) {
        setRequests(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: string) {
    if (!confirm('Voulez-vous générer et envoyer un mot de passe à cet étudiant ?')) return
    setActionLoading(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/memoires/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ requestId: id, accept: true })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue')
      await fetchRequests()
    } catch (e: any) {
      alert(`Erreur lors de l'approbation : ${e.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    if (!confirm('Voulez-vous refuser cette demande ?')) return
    setActionLoading(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/memoires/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ requestId: id, accept: false })
      })
      if (!res.ok) throw new Error('Erreur')
      await fetchRequests()
    } catch (e) {
      alert('Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRevoke(userId: string) {
    if (!confirm('Voulez-vous expulser cet utilisateur et révoquer son accès ?')) return
    setActionLoading(userId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/memoires/revoke', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ targetUserId: userId })
      })
      if (!res.ok) throw new Error('Erreur')
      await fetchRequests()
    } catch (e) {
      alert('Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent shadow-[0_0_20px_rgba(245,158,11,0.4)]"></div>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">CHARGEMENT // VAULT_KEYS...</p>
      </div>
    )
  }

  const pending = requests.filter(r => r.status === 'pending')
  const active = requests.filter(r => r.status === 'approved' || r.status === 'unlocked')
  const others = requests.filter(r => r.status === 'rejected' || r.status === 'revoked')

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in py-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-mono text-amber-500 dark:text-amber-400 uppercase tracking-wider font-bold">KEY_AUTHORITY // CONTRÔLE DES ACCÈS MÉMOIRES</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <ShieldCheck className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          </div>
          Gestion des Accès Mémoires
        </h1>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">Approbation des requêtes de consultation et génération des clés cryptographiques uniques.</p>
      </div>

      {/* PENDING SECTION */}
      <div className="bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl rounded-3xl shadow-sm border border-amber-500/30 dark:border-amber-500/20 overflow-hidden">
        <div className="bg-amber-500/10 px-6 py-4 border-b border-amber-500/20 flex items-center justify-between">
          <h2 className="font-mono font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Demandes en Attente ({pending.length})
          </h2>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </div>
        <div className="divide-y divide-slate-200/60 dark:divide-white/5">
          {pending.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">AUCUNE DEMANDE EN ATTENTE // NO_REQUESTS</div>
          ) : (
            pending.map(req => (
              <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{req.profiles.full_name}</h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> {req.profiles.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 text-xs font-mono font-bold text-red-500 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    Refuser
                  </button>
                  <button 
                    onClick={() => handleApprove(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Générer & Envoyer Clé
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ACTIVE SECTION */}
      <div className="bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-white/10 overflow-hidden">
        <div className="bg-slate-50/70 dark:bg-white/5 px-6 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Accès Mémoires Actifs ({active.length})
          </h2>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <div className="divide-y divide-slate-200/60 dark:divide-white/5">
          {active.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">AUCUN ACCÈS ACTIF // NO_ACTIVE_ACCOUNTS</div>
          ) : (
            active.map(req => (
              <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {req.profiles.full_name} 
                    {req.status === 'unlocked' && <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.15)]">DÉVERROUILLÉ</span>}
                    {req.status === 'approved' && <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.15)]">CLÉ TRANSMISE</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> {req.profiles.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono bg-slate-100 dark:bg-[#030712] border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 mr-2 shadow-inner">
                    MDP: <span className="font-bold text-amber-500">{req.password}</span>
                  </div>
                  <button 
                    onClick={() => handleRevoke(req.user_id)}
                    disabled={actionLoading === req.user_id}
                    className="px-3 py-1.5 text-xs font-mono font-bold text-red-500 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Révoquer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
