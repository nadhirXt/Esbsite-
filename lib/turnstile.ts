import crypto from 'crypto'

/**
 * Cloudflare Turnstile & Native Security Verification Helper
 */

// Clés Turnstile Cloudflare pour esbhub.study
const PRODUCTION_SECRET_KEY = 'your-turnstile-secret-key-placeholder'
const HMAC_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'esb-hub-secure-fallback-secret-2026'

// Cache mémoire pour éviter les attaques par rejeu
const usedTokensCache = new Set<string>()

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (usedTokensCache.size > 5000) {
      usedTokensCache.clear()
    }
  }, 15 * 60 * 1000)
}

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: 'Veuillez valider le contrôle de sécurité (CAPTCHA).' }
  }

  // ── 1. Validation du jeton natif de secours (Brave / Adblock) ──
  if (token.startsWith('esb_sec_')) {
    try {
      const parts = token.slice('esb_sec_'.length).split('.')
      if (parts.length !== 2) {
        return { success: false, error: 'Format de validation de sécurité invalide.' }
      }

      const [encodedPayload, receivedSig] = parts
      const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8')
      const expectedSig = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')

      if (receivedSig !== expectedSig) {
        return { success: false, error: 'Signature de sécurité invalide.' }
      }

      const [tsStr] = payload.split(':')
      const ts = parseInt(tsStr, 10)

      if (isNaN(ts) || Date.now() - ts > 10 * 60 * 1000) {
        return { success: false, error: 'La validation de sécurité a expiré. Veuillez revérifier.' }
      }

      if (usedTokensCache.has(token)) {
        return { success: false, error: 'Ce contrôle de sécurité a déjà été utilisé.' }
      }
      usedTokensCache.add(token)

      return { success: true }
    } catch (err) {
      console.error('Error verifying native token:', err)
      return { success: false, error: 'Échec de la validation de sécurité.' }
    }
  }

  // ── 2. Validation officielle Cloudflare Turnstile ──
  const secretKey = process.env.TURNSTILE_SECRET_KEY || PRODUCTION_SECRET_KEY

  try {
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (remoteIp) {
      formData.append('remoteip', remoteIp)
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      console.error(`Turnstile HTTP error: ${response.status} ${response.statusText}`)
      return { success: false, error: 'Erreur lors de la vérification de sécurité.' }
    }

    const data: TurnstileVerifyResponse = await response.json()

    if (!data.success) {
      console.warn('Turnstile verification failed:', data['error-codes'])
      return { success: false, error: 'Validation de sécurité échouée. Veuillez réessayer.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Turnstile verification exception:', error)
    return { success: false, error: 'Erreur réseau lors de la validation du CAPTCHA.' }
  }
}
