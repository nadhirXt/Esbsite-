'use client'

import { Mail, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    toast.success('Adresse copiée ! Ouverture de la messagerie...')
    setTimeout(() => setCopied(false), 2000)
    
    // Redirige vers l'application d'emails
    window.location.href = `mailto:${email}`
  }

  return (
    <button 
      onClick={handleCopy}
      className="group/btn flex items-center justify-center gap-3 px-6 py-4 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] w-full md:w-auto cursor-pointer"
    >
      <div className="bg-white/20 p-2 rounded-xl group-hover/btn:scale-110 group-hover/btn:-rotate-12 transition-all duration-300 shadow-sm relative flex items-center justify-center">
        <Mail className={`w-5 h-5 text-[#FCD34D] absolute transition-opacity duration-300 ${copied ? 'opacity-0' : 'opacity-100'}`} />
        <Check className={`w-5 h-5 text-green-400 absolute transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`} />
        <div className="w-5 h-5 opacity-0" /> {/* Spacer for layout */}
      </div>
      {copied ? "Copié !" : email}
    </button>
  )
}
