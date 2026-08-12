'use client'

import { useState } from 'react'
import { X, Loader2, User } from 'lucide-react'

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
)
import { updateProfile } from '@/app/actions/profile'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ProfileEditModalProps {
  initialName: string
  initialLinkedin: string
  onClose: () => void
}

export default function ProfileEditModal({ initialName, initialLinkedin, onClose }: ProfileEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('full_name') as string
    const linkedinUrl = formData.get('linkedin_url') as string
    
    const result = await updateProfile({ full_name: fullName, linkedin_url: linkedinUrl })
    
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#0F172A]">
          <X className="w-5 h-5"/>
        </button>
        
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">Modifier mon profil</h2>
        <p className="text-[#64748B] text-sm mb-6">Mettez à jour vos informations personnelles.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                name="full_name" 
                defaultValue={initialName} 
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profil LinkedIn (Optionnel)</label>
            <div className="relative">
              <LinkedinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                name="linkedin_url" 
                type="url"
                placeholder="https://linkedin.com/in/votre-profil"
                defaultValue={initialLinkedin} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
