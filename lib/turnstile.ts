/**
 * Cloudflare Turnstile Server-side Token Verification Helper
 */

// Official Cloudflare Turnstile test keys (dummy always-pass)
export const CLOUDFLARE_DUMMY_SITE_KEY = '1x00000000000000000000AA'
export const CLOUDFLARE_DUMMY_SECRET_KEY = '1x0000000000000000000000000000000AA'

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstileToken(token: string | undefined | null, remoteIp?: string): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: 'Token CAPTCHA manquant.' }
  }

  // Use configured secret or fallback to Cloudflare test key for local/preview
  const secretKey = process.env.TURNSTILE_SECRET_KEY || CLOUDFLARE_DUMMY_SECRET_KEY

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
