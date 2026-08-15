'use client'

import { useState, useEffect } from 'react'
import { Lock, FileKey, CheckCircle2, ShieldAlert, Key, HelpCircle, Loader2 } from 'lucide-react'
import CycleDocumentsClient from '@/components/dashboard/CycleDocumentsClient'
import { useRouter } from 'next/navigation'

export default function MemoiresPageClient({ documents }: { documents: any[] }) {
  const router = useRouter()
  const [status, setStatus] = useState<string | null>('loading')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Challenge states
  const [title, setTitle] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const { data: { session } } = await (await import('@/lib/supabase/client')).createClient().auth.getSession()
      if (!session) return router.push('/login')

      const res = await fetch('/api/memoires/status', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (!res.ok) throw new Error('Erreur de statut')
      const data = await res.json()
      setStatus(data.status)
    } catch (err) {
      console.error(err)
      setStatus(null)
    }
  }

  async function handleRequestAccess() {
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data: { session } } = await (await import('@/lib/supabase/client')).createClient().auth.getSession()
      if (!session) throw new Error('Session expirée')

      const res = await fetch('/api/memoires/request', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      
      setStatus('pending')
      setSuccess('Votre demande a été envoyée. Vous recevrez un email dès sa validation.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const { data: { session } } = await (await import('@/lib/supabase/client')).createClient().auth.getSession()
      if (!session) throw new Error('Session expirée')

      const res = await fetch('/api/memoires/unlock', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ title, name, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      
      setStatus('unlocked')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    )
  }

  if (status === 'unlocked') {
    return (
      <CycleDocumentsClient 
        cycle="memoires" 
        cycleLabel="Mémoires (Confidentiel)" 
        documents={documents} 
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1E3A8A] px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <Lock className="w-16 h-16 text-white mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Dossier Confidentiel</h1>
          <p className="text-blue-100 relative z-10">Cet espace est réservé aux étudiants de l'ESB et aux anciens.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          {status === 'revoked' && (
            <div className="text-center py-8">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">Accès Révoqué</h2>
              <p className="text-[#64748B] mb-6">Votre accès à ce dossier a été retiré par l'administration.</p>
              <button 
                onClick={handleRequestAccess}
                disabled={isLoading}
                className="px-6 py-3 bg-[#1E3A8A] text-white font-semibold rounded-xl hover:bg-[#152C6B] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Demande en cours...' : 'Demander un nouvel accès'}
              </button>
            </div>
          )}

          {status === 'pending' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">Demande en cours...</h2>
              <p className="text-[#64748B]">
                L'administration examine votre demande. Vous recevrez un email avec votre mot de passe secret une fois approuvée.
              </p>
            </div>
          )}

          {(status === null) && !success && (
            <div className="text-center py-8">
              <FileKey className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">Vous n'avez pas l'accès</h2>
              <p className="text-[#64748B] mb-6">
                Pour consulter les mémoires, vous devez obtenir une autorisation et un mot de passe de la part de l'administration de l'ESB.
              </p>
              <button 
                onClick={handleRequestAccess}
                disabled={isLoading}
                className="px-6 py-3 bg-[#1E3A8A] text-white font-semibold rounded-xl hover:bg-[#152C6B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Demander mon mot de passe d'accès
              </button>
            </div>
          )}

          {status === 'approved' && (
            <div className="animate-fade-in">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
                <h3 className="font-semibold text-[#1E3A8A] flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5" />
                  Challenge de Sécurité
                </h3>
                <p className="text-sm text-blue-800">
                  Pour prouver votre identité en tant qu'étudiant de l'ESB, veuillez répondre à la question de vérification et saisir le mot de passe secret que vous avez reçu par email.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-6">
                <div className="space-y-4 p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                  <div className="flex items-center gap-2 mb-2 text-[#0F172A] font-semibold">
                    <HelpCircle className="w-5 h-5 text-[#3B82F6]" />
                    Question : Qui gère la bibliothèque au sein de l'ESB ?
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#475569] mb-1.5">Titre</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Madame', 'Monsieur', 'Mlle'].map(t => (
                         <label key={t} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${title === t ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#1E3A8A] ring-1 ring-[#3B82F6]' : 'bg-white border-[#E2E8F0] hover:border-[#94A3B8] text-[#475569]'}`}>
                           <input type="radio" name="title" value={t} className="sr-only" checked={title === t} onChange={(e) => setTitle(e.target.value)} />
                           <span className="font-medium text-sm">{t}</span>
                         </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#475569] mb-1.5">Nom</label>
                    <input 
                      type="text"
                      placeholder="Saisissez le nom..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5 flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#64748B]" />
                    Mot de passe secret
                  </label>
                  <input 
                    type="password"
                    placeholder="ESB-XXXXXX"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all font-mono tracking-widest text-lg"
                    required
                  />
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-[#64748B]">Reçu par email suite à l'approbation.</span>
                    <button type="button" onClick={handleRequestAccess} className="text-[#3B82F6] hover:underline font-medium">
                      J'ai oublié mon mot de passe
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !title || !name || !password}
                  className="w-full py-4 bg-[#1E3A8A] text-white font-bold rounded-xl hover:bg-[#152C6B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                  Déverrouiller le coffre
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
