'use client'

import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, Shield, Check, Loader2 } from 'lucide-react'

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

  // États du widget
  const [verified, setVerified] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Mémoriser les callbacks dans une ref pour ÉVITER TOUT RE-RENDER / CLIGNOTEMENT
  const callbacksRef = useRef({ onSuccess, onError, onExpire })
  callbacksRef.current = { onSuccess, onError, onExpire }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || PRODUCTION_SITE_KEY

  // ── Action au clic sur la case native de secours (Brave / Adblock) ──
  const handleNativeClick = async () => {
    if (verified || isVerifying) return

    setIsVerifying(true)

    try {
      // Petite latence comportementale humaine (400ms)
      await new Promise((r) => setTimeout(r, 400))

      const res = await fetch('/api/auth/security-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientTimestamp: Date.now() }),
      })

      const data = await res.json()

      if (res.ok && data.success && data.token) {
        if (isMountedRef.current) {
          setVerified(true)
          setIsVerifying(false)
        }
        callbacksRef.current.onSuccess(data.token)
      } else {
        throw new Error(data.error || 'Échec de la validation')
      }
    } catch (err) {
      console.error('Security challenge failed:', err)
      if (isMountedRef.current) {
        setIsVerifying(false)
      }
      callbacksRef.current.onError?.('challenge_error')
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    let intervalId: NodeJS.Timeout | null = null
    let fallbackTimeoutId: NodeJS.Timeout | null = null

    // 1. Détecter si le script Turnstile est bloqué au niveau réseau (ex: Brave Shields)
    const existingScript = document.getElementById('cf-turnstile-script') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('error', () => {
        if (isMountedRef.current && !widgetIdRef.current) {
          setUseFallback(true)
        }
      })
    }

    const tryRender = () => {
      if (!containerRef.current || widgetIdRef.current || !isMountedRef.current) return false

      const turnstile = (window as any).turnstile
      if (!turnstile || typeof turnstile.render !== 'function') return false

      try {
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
            console.warn('Turnstile error code:', code)
            // Si Cloudflare échoue dans le navigateur, basculer sur le challenge natif
            if (isMountedRef.current && !verified) {
              setUseFallback(true)
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

        return true
      } catch (err) {
        console.error('Failed to render Turnstile widget:', err)
        return false
      }
    }

    // Tenter immédiatement
    if (!tryRender()) {
      // Scruter pendant 1.2s max pour Cloudflare Turnstile
      intervalId = setInterval(() => {
        if (tryRender() || !isMountedRef.current) {
          if (intervalId) clearInterval(intervalId)
          intervalId = null
        }
      }, 100)

      // Si Cloudflare Turnstile est bloqué par Brave ou un bloqueur, activer immédiatement le captcha natif
      fallbackTimeoutId = setTimeout(() => {
        if (isMountedRef.current && !widgetIdRef.current) {
          if (intervalId) clearInterval(intervalId)
          setUseFallback(true)
        }
      }, 1200)
    }

    return () => {
      isMountedRef.current = false
      if (intervalId) clearInterval(intervalId)
      if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId)
      if (widgetIdRef.current && (window as any).turnstile?.remove) {
        try {
          ;(window as any).turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        } catch {}
      }
    }
  }, [siteKey, theme, verified])

  return (
    <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
      {/* CAS 1 : Fallback Natif (Brave Browser, bloqueurs ou panne réseau) */}
      {useFallback ? (
        <div
          onClick={handleNativeClick}
          className={`w-[300px] h-[65px] min-h-[65px] rounded-xl bg-slate-900/90 border transition-all select-none flex items-center justify-between px-4 cursor-pointer group shadow-lg ${
            verified
              ? 'border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/10'
              : 'border-slate-700/80 hover:border-cyan-400/60 hover:shadow-cyan-500/10'
          }`}
          role="checkbox"
          aria-checked={verified}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              handleNativeClick()
            }
          }}
        >
          {/* Case à cocher */}
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                verified
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : isVerifying
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-400'
                  : 'border-slate-400 bg-slate-800/80 group-hover:border-cyan-400 group-hover:bg-slate-800'
              }`}
            >
              {verified ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : isVerifying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
            </div>

            <div className="flex flex-col text-left">
              <span className={`text-xs font-semibold tracking-wide transition-colors ${
                verified ? 'text-emerald-300' : 'text-slate-200 group-hover:text-white'
              }`}>
                {verified ? 'Vérification confirmée' : 'Je ne suis pas un robot'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {verified ? 'Validation humaine active' : 'Cliquer pour valider'}
              </span>
            </div>
          </div>

          {/* Badge ESB Hub Security */}
          <div className="flex flex-col items-end opacity-70 group-hover:opacity-100 transition-opacity">
            <Shield className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
              ESB SHIELD
            </span>
          </div>
        </div>
      ) : (
        /* CAS 2 : Conteneur Turnstile Cloudflare officiel */
        <div
          ref={containerRef}
          className="w-[300px] h-[65px] min-h-[65px] flex items-center justify-center overflow-hidden"
        />
      )}

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
