/**
 * Cloudflare Turnstile Server-side Token Verification Helper
 */

// Clés Turnstile Cloudflare pour esbhub.study
const PRODUCTION_SECRET_KEY = 'your-turnstile-secret-key-placeholder'

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
    return { success: false, error: 'Token CAPTCHA manquant. Veuillez valider le contrôle de sécurité.' }
  }

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
