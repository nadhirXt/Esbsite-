import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getTurnstileHmacSecret } from '@/lib/turnstile'

export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier l'origine et le User-Agent contre les appels automatisés directs
    const origin = req.headers.get('origin') || req.headers.get('referer') || ''
    const userAgent = req.headers.get('user-agent') || ''
    const expectedOrigin = req.nextUrl.origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://esbhub.study'

    if (
      !userAgent ||
      userAgent.length < 10 ||
      (!origin.startsWith(expectedOrigin) && !origin.startsWith(siteUrl))
    ) {
      return NextResponse.json({ error: 'Requête non autorisée.' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { clientTimestamp } = body

    if (!clientTimestamp || typeof clientTimestamp !== 'number') {
      return NextResponse.json({ error: 'Validation impossible.' }, { status: 400 })
    }

    const now = Date.now()
    // Rejeter les horodatages décalés de plus de 5 minutes
    if (Math.abs(now - clientTimestamp) > 5 * 60 * 1000) {
      return NextResponse.json({ error: 'Horloge client désynchronisée.' }, { status: 400 })
    }

    // Anti-replay payload: timestamp + random UUID
    const payload = `${now}:${crypto.randomUUID()}`
    const signature = crypto
      .createHmac('sha256', getTurnstileHmacSecret())
      .update(payload)
      .digest('hex')
    const token = `esb_sec_${Buffer.from(payload).toString('base64url')}.${signature}`

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Security challenge error:', error)
    return NextResponse.json({ error: 'Erreur lors de la validation de sécurité.' }, { status: 500 })
  }
}
