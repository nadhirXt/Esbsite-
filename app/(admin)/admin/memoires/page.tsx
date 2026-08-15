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

  if (loading) return <div className="p-8 text-center">Chargement...</div>

  const pending = requests.filter(r => r.status === 'pending')
  const active = requests.filter(r => r.status === 'approved' || r.status === 'unlocked')
  const others = requests.filter(r => r.status === 'rejected' || r.status === 'revoked')

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#1E3A8A]" />
          Gestion des Accès Mémoires
        </h1>
        <p className="text-[#64748B] mt-2">Approuvez les demandes et générez les mots de passe uniques.</p>
      </div>

      {/* PENDING SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden mb-8">
        <div className="bg-amber-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-bold text-amber-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Demandes en attente ({pending.length})
          </h2>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {pending.length === 0 ? (
            <div className="p-6 text-center text-[#64748B]">Aucune demande en attente.</div>
          ) : (
            pending.map(req => (
              <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#0F172A]">{req.profiles.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#64748B] mt-1">
                    <Mail className="w-4 h-4" /> {req.profiles.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                  >
                    Refuser
                  </button>
                  <button 
                    onClick={() => handleApprove(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 bg-[#1E3A8A] text-white hover:bg-[#152C6B] rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Générer & Envoyer MDP
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ACTIVE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-bold text-[#0F172A] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Accès Actifs ({active.length})
          </h2>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {active.length === 0 ? (
            <div className="p-6 text-center text-[#64748B]">Aucun accès actif.</div>
          ) : (
            active.map(req => (
              <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#0F172A]">
                    {req.profiles.full_name} 
                    {req.status === 'unlocked' && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Déverrouillé</span>}
                    {req.status === 'approved' && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">MDP Envoyé</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#64748B] mt-1">
                    <Mail className="w-4 h-4" /> {req.profiles.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-600 mr-4">
                    MDP: {req.password}
                  </div>
                  <button 
                    onClick={() => handleRevoke(req.user_id)}
                    disabled={actionLoading === req.user_id}
                    className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Expulser
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
