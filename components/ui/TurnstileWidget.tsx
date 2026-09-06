'use client'

import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
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

  return (
    <div className={`flex flex-col items-center justify-center my-3 min-h-[65px] ${className}`}>
      <Turnstile
        siteKey={siteKey}
        options={{
          theme: theme,
          size: 'normal',
        }}
        onSuccess={(token) => onSuccess(token)}
        onError={() => onError?.()}
        onExpire={() => onExpire?.()}
      />
    </div>
  )
}
