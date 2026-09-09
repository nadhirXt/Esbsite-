'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ShieldCheck, AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react'

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
  const [isBrave, setIsBrave] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  // Mémoriser les callbacks dans une ref pour ÉVITER TOUT RE-RENDER / CLIGNOTEMENT
  const callbacksRef = useRef({ onSuccess, onError, onExpire })
  callbacksRef.current = { onSuccess, onError, onExpire }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || PRODUCTION_SITE_KEY

  // Vérifier si le navigateur est Brave
  const checkIsBrave = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function') {
        const brave = await (navigator as any).brave.isBrave()
        if (brave && isMountedRef.current) {
          setIsBrave(true)
        }
        return brave
      }
    } catch {}
    return false
  }, [])

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !isMountedRef.current) return false

    const turnstile = (window as any).turnstile
    if (!turnstile || typeof turnstile.render !== 'function') return false

    // Nettoyer l'ancien widget si existant
    if (widgetIdRef.current) {
      try {
        turnstile.remove(widgetIdRef.current)
      } catch {}
      widgetIdRef.current = null
    }

    try {
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme,
        size: 'normal',
        appearance: 'always',
        execution: 'render',
        language: 'fr',
        retry: 'auto',
        'retry-interval': 2500,
        'refresh-expired': 'auto',
        callback: (token: string) => {
          if (isMountedRef.current) {
            setVerified(true)
            setIsBlocked(false)
            setErrorMessage(null)
          }
          callbacksRef.current.onSuccess(token)
        },
        'error-callback': async (code: string) => {
          console.error('Cloudflare Turnstile error code:', code)
          const brave = await checkIsBrave()
          if (isMountedRef.current) {
            setVerified(false)
            setIsBlocked(true)
            if (brave) {
              setErrorMessage("Le bouclier Brave (Shields) bloque la validation.")
            } else {
              setErrorMessage(`Contrôle de sécurité (${code || 'bloqué'}). Désactivez vos bloqueurs.`)
            }
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
  }, [siteKey, theme, checkIsBrave])

  useEffect(() => {
    isMountedRef.current = true
    let intervalId: NodeJS.Timeout | null = null

    // Détection initiale Brave
    checkIsBrave()

    // 1. Essayer immédiatement
    if (!renderWidget()) {
      // 2. Si le script n'est pas encore prêt, scruter jusqu'à 30 tentatives (4.5s)
      let attempts = 0
      intervalId = setInterval(async () => {
        attempts++
        if (renderWidget() || attempts > 30) {
          if (intervalId) clearInterval(intervalId)
          intervalId = null

          // Si toujours pas chargé après 4.5s -> blocage client (Brave Shields ou AdBlock)
          if (!widgetIdRef.current && isMountedRef.current) {
            const brave = await checkIsBrave()
            setIsBlocked(true)
            setErrorMessage(
              brave
                ? "Le bouclier Brave (Shields) bloque le chargement du CAPTCHA."
                : "Le module de sécurité est bloqué par le navigateur (AdBlock ou pare-feu)."
            )
          }
        }
      }, 150)
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
  }, [renderWidget, checkIsBrave])

  // Action de réessai manuel
  const handleRetry = async () => {
    setIsRetrying(true)
    setErrorMessage(null)
    setIsBlocked(false)

    // Vérifier si Turnstile est déjà dispo
    if ((window as any).turnstile) {
      const rendered = renderWidget()
      setIsRetrying(false)
      if (rendered) return
    }

    // Réinjecter dynamiquement le script si absent ou bloqué
    const existing = document.getElementById('cf-turnstile-script')
    if (existing) existing.remove()

    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&ts=${Date.now()}`
    script.async = true
    script.onload = () => {
      setTimeout(() => {
        renderWidget()
        setIsRetrying(false)
      }, 200)
    }
    script.onerror = async () => {
      const brave = await checkIsBrave()
      setIsRetrying(false)
      setIsBlocked(true)
      setErrorMessage(
        brave
          ? "Toujours bloqué par Brave Shields. Désactivez le bouclier 🦁 pour esbhub.study."
          : "Échec du chargement du module de sécurité."
      )
    }
    document.head.appendChild(script)
  }

  return (
    <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
      {/* Conteneur principal Turnstile */}
      <div 
        ref={containerRef} 
        className={`w-[300px] h-[65px] min-h-[65px] flex items-center justify-center overflow-hidden transition-all ${
          isBlocked ? 'hidden' : 'block'
        }`}
      />

      {/* Confirmation une fois la case cochée */}
      {verified && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1.5 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Vérification humaine confirmée</span>
        </div>
      )}

      {/* Assistance interactive en cas de blocage (Brave Shields ou AdBlocker) */}
      {isBlocked && (
        <div className="w-full max-w-[340px] p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 backdrop-blur-md text-left">
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-amber-300 mb-1.5">
            {isBrave ? (
              <>
                <span className="text-base">🦁</span>
                <span>Navigateur Brave détecté</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Bloqueur de sécurité actif</span>
              </>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
            {isBrave ? (
              <>
                Le bouclier <strong>Brave Shields</strong> bloque le composant de vérification Cloudflare.
              </>
            ) : (
              <>
                Votre bloqueur de publicités ou pare-feu empêche le chargement du CAPTCHA Cloudflare.
              </>
            )}
          </p>

          <div className="text-[11px] text-amber-200/90 space-y-1 font-sans bg-black/20 p-2 rounded-lg border border-amber-500/20 mb-3">
            {isBrave ? (
              <>
                <p>1. Cliquez sur le <strong>Lion 🦁</strong> dans la barre d&apos;adresse.</p>
                <p>2. Passez les boucliers en mode <em>Standard</em> ou désactivez-les pour <strong>esbhub.study</strong>.</p>
                <p>3. Cliquez sur <strong>Réessayer</strong> ci-dessous.</p>
              </>
            ) : (
              <>
                <p>1. Désactivez temporairement votre bloqueur pour <strong>esbhub.study</strong>.</p>
                <p>2. Cliquez sur <strong>Réessayer</strong> ci-dessous.</p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-2 px-3 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Vérification en cours...' : 'Réessayer la vérification'}</span>
          </button>
        </div>
      )}

      {/* Message d'erreur simple si non bloqué mais avec code d'erreur */}
      {errorMessage && !isBlocked && !verified && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 mt-1.5 font-mono text-center">
          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
