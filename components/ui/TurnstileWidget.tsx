'use client'

import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

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

  // Mémoriser les callbacks dans une ref pour ÉVITER TOUT RE-RENDER / CLIGNOTEMENT
  const callbacksRef = useRef({ onSuccess, onError, onExpire })
  callbacksRef.current = { onSuccess, onError, onExpire }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || PRODUCTION_SITE_KEY

  useEffect(() => {
    isMountedRef.current = true
    let intervalId: NodeJS.Timeout | null = null

    // 1. S'assurer que le script Turnstile est injecté dans le head si non présent
    if (typeof window !== 'undefined' && !(window as any).turnstile) {
      const existingScript = document.getElementById('cf-turnstile-script')
      if (!existingScript) {
        const s = document.createElement('script')
        s.id = 'cf-turnstile-script'
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        s.async = true
        s.defer = true
        document.head.appendChild(s)
      }
    }

    const tryRender = () => {
      if (!containerRef.current || widgetIdRef.current || !isMountedRef.current) return false

      const turnstile = (window as any).turnstile
      if (!turnstile || typeof turnstile.render !== 'function') return false

      try {
        // Nettoyer les enfants éventuels
        if (containerRef.current.childElementCount > 0 && !widgetIdRef.current) {
          containerRef.current.innerHTML = ''
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme,
          size: 'normal',
          appearance: 'always',
          execution: 'render',
          language: 'fr',
          retry: 'auto',
          'retry-interval': 1500,
          'refresh-expired': 'auto',
          callback: (token: string) => {
            if (isMountedRef.current) {
              setVerified(true)
            }
            callbacksRef.current.onSuccess(token)
          },
          'error-callback': (code: string) => {
            console.warn('Cloudflare Turnstile error code:', code)
            if (isMountedRef.current) {
              setVerified(false)
            }
            // Auto-reset en cas d'erreur réseau ou de timing
            setTimeout(() => {
              if (isMountedRef.current && widgetIdRef.current && (window as any).turnstile?.reset) {
                try {
                  (window as any).turnstile.reset(widgetIdRef.current)
                } catch {}
              }
            }, 1000)
            callbacksRef.current.onError?.(code)
          },
          'expired-callback': () => {
            if (isMountedRef.current) {
              setVerified(false)
            }
            callbacksRef.current.onExpire?.()
          },
        })

        return true
      } catch (err) {
        console.error('Failed to render Turnstile widget:', err)
        return false
      }
    }

    // Tenter immédiatement
    if (!tryRender()) {
      // Scruter en continu jusqu'au succès du rendu
      intervalId = setInterval(() => {
        if (tryRender() || !isMountedRef.current) {
          if (intervalId) clearInterval(intervalId)
          intervalId = null
        }
      }, 100)
    }

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
  }, [siteKey, theme])

  return (
    <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
      {/* Conteneur Turnstile officiel toujours présent et visible */}
      <div 
        ref={containerRef} 
        className="w-[300px] h-[65px] min-h-[65px] flex items-center justify-center overflow-hidden"
      />

      {/* Confirmation une fois la case cochée */}
      {verified && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vérification humaine confirmée</span>
        </div>
      )}
    </div>
  )
}
