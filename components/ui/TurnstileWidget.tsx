'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'dark' | 'light' | 'auto'
  className?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          theme?: 'dark' | 'light' | 'auto'
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          size?: 'normal' | 'compact' | 'flexible'
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

// Fallback dummy test key if env var is not yet configured
const DUMMY_SITE_KEY = '1x00000000000000000000AA'

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = 'dark',
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || DUMMY_SITE_KEY

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return

    // Render widget if not already rendered
    if (!widgetId) {
      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme,
          callback: (token: string) => {
            onSuccess(token)
          },
          'error-callback': () => {
            onError?.()
          },
          'expired-callback': () => {
            onExpire?.()
          },
        })
        setWidgetId(id)
      } catch (err) {
        console.error('Error rendering Turnstile:', err)
      }
    }

    return () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [scriptLoaded, siteKey, theme, onSuccess, onError, onExpire, widgetId])

  return (
    <div className={`flex flex-col items-center justify-center my-3 ${className}`}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
    </div>
  )
}
