'use client'

import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { ShieldCheck, Loader2 } from 'lucide-react'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: (errorCode?: string) => void
  onExpire?: () => void
  theme?: 'dark' | 'light' | 'auto'
  className?: string
}

// Clé Turnstile officielle Cloudflare configurée pour esbhub.study
const PRODUCTION_SITE_KEY = 'your-turnstile-site-key-placeholder'

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = 'dark',
  className = '',
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || PRODUCTION_SITE_KEY
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  return (
    <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
      {/* Conteneur Turnstile avec apparence forcée visible */}
      <div className="min-h-[65px] flex items-center justify-center">
        <Turnstile
          siteKey={siteKey}
          options={{
            theme: theme,
            size: 'normal',
            appearance: 'always',
          }}
          onSuccess={(token) => {
            setStatus('success')
            onSuccess(token)
          }}
          onError={(errorCode) => {
            console.error('Cloudflare Turnstile Error:', errorCode)
            setStatus('error')
            onError?.(errorCode)
          }}
          onExpire={() => {
            setStatus('loading')
            onExpire?.()
          }}
        />
      </div>

      {/* Badge de statut rassurant pour l'utilisateur */}
      {status === 'success' && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vérification de sécurité réussie</span>
        </div>
      )}

      {status === 'error' && (
        <p className="text-[11px] text-amber-400/90 text-center mt-1 font-mono">
          Si la vérification ne s&apos;affiche pas, désactivez votre bloqueur de pub (Adblock).
        </p>
      )}
    </div>
  )
}
