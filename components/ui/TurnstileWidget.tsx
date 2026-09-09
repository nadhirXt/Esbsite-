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
  const [verified, setVerified] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || PRODUCTION_SITE_KEY

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const tryRender = () => {
      if (!containerRef.current || widgetIdRef.current) return

      const turnstile = (window as any).turnstile
      if (!turnstile || typeof turnstile.render !== 'function') return

      try {
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme,
          size: 'normal',
          appearance: 'always',
          callback: (token: string) => {
            setVerified(true)
            setErrorMessage(null)
            onSuccess(token)
          },
          'error-callback': (code: string) => {
            console.error('Cloudflare Turnstile error code:', code)
            setVerified(false)
            setErrorMessage(`Erreur de sécurité (${code || 'inconnue'}). Vérifiez vos bloqueurs de pub.`)
            onError?.(code)
          },
          'expired-callback': () => {
            setVerified(false)
            onExpire?.()
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

    // Tenter immédiatement
    tryRender()

    // Si le script api.js charge encore, vérifier toutes les 150ms pendant 10s
    if (!widgetIdRef.current) {
      let attempts = 0
      intervalId = setInterval(() => {
        attempts++
        tryRender()
        if (widgetIdRef.current || attempts > 60) {
          if (intervalId) clearInterval(intervalId)
          if (!widgetIdRef.current && attempts > 60) {
            setErrorMessage('Le captcha met du temps à charger. Désactivez Adblock si actif.')
          }
        }
      }, 150)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (widgetIdRef.current && (window as any).turnstile?.remove) {
        try {
          ;(window as any).turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        } catch {}
      }
    }
  }, [siteKey, theme, onSuccess, onError, onExpire])

  return (
    <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
      {/* Conteneur Turnstile officiel */}
      <div 
        ref={containerRef} 
        className="w-[300px] min-h-[65px] flex items-center justify-center"
      />

      {/* Confirmation visuelle de validation */}
      {verified && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vérification de sécurité réussie</span>
        </div>
      )}

      {/* Message d'aide en cas d'erreur de chargement */}
      {errorMessage && !verified && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 mt-1.5 font-mono text-center">
          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
