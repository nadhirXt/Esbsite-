'use client'

import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, AlertCircle } from 'lucide-react'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)
  const [verified, setVerified] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Mémoriser les callbacks dans une ref pour ÉVITER TOUT RE-RENDER / CLIGNOTEMENT
  const callbacksRef = useRef({ onSuccess, onError, onExpire })
  callbacksRef.current = { onSuccess, onError, onExpire }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || PRODUCTION_SITE_KEY

  useEffect(() => {
    isMountedRef.current = true
    let intervalId: NodeJS.Timeout | null = null

    const tryRender = () => {
      if (!containerRef.current || widgetIdRef.current || !isMountedRef.current) return

      const turnstile = (window as any).turnstile
      if (!turnstile || typeof turnstile.render !== 'function') return

      try {
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme,
          size: 'normal',
          appearance: 'always',
          execution: 'render',
          callback: (token: string) => {
            if (isMountedRef.current) {
              setVerified(true)
              setErrorMessage(null)
            }
            callbacksRef.current.onSuccess(token)
          },
          'error-callback': (code: string) => {
            console.error('Cloudflare Turnstile error code:', code)
            if (isMountedRef.current) {
              setVerified(false)
              setErrorMessage(`Contrôle de sécurité (${code || 'bloqué'}). Rechargez la page.`)
            }
            callbacksRef.current.onError?.(code)
          },
          'expired-callback': () => {
            if (isMountedRef.current) {
              setVerified(false)
            }
            callbacksRef.current.onExpire?.()
          },
        })

        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      } catch (err) {
        console.error('Failed to render Turnstile widget:', err)
      }
    }

    // 1. Essayer immédiatement
    tryRender()

    // 2. Si le script charge encore, surveiller sans détruire
    if (!widgetIdRef.current) {
      let attempts = 0
      intervalId = setInterval(() => {
        attempts++
        tryRender()
        if (widgetIdRef.current || attempts > 50) {
          if (intervalId) clearInterval(intervalId)
        }
      }, 150)
    }

    // Nettoyage UNIQUEMENT au démontage du composant
    return () => {
      isMountedRef.current = false
      if (intervalId) clearInterval(intervalId)
      if (widgetIdRef.current && (window as any).turnstile?.remove) {
        try {
          ;(window as any).turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        } catch {}
      }
    }
  }, [siteKey, theme]) // Dépendance STRICTE : ne se re-rend jamais sur changement de callback !

  return (
    <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
      {/* Conteneur stable et fixe (300px x 65px) pour la case à cocher */}
      <div 
        ref={containerRef} 
        className="w-[300px] h-[65px] min-h-[65px] flex items-center justify-center overflow-hidden"
      />

      {/* Confirmation une fois la case cochée */}
      {verified && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vérification humaine confirmée</span>
        </div>
      )}

      {/* Alerte si problème de chargement */}
      {errorMessage && !verified && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 mt-1.5 font-mono text-center">
          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
