import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const HMAC_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'esb-hub-secure-fallback-secret-2026'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { clientTimestamp } = body

    if (!clientTimestamp || typeof clientTimestamp !== 'number') {
      return NextResponse.json({ error: 'Validation impossible.' }, { status: 400 })
    }

    const now = Date.now()
    // Anti-replay payload: timestamp + random UUID
    const payload = `${now}:${crypto.randomUUID()}`
    const signature = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
    const token = `esb_sec_${Buffer.from(payload).toString('base64url')}.${signature}`

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Security challenge error:', error)
    return NextResponse.json({ error: 'Erreur lors de la validation de sécurité.' }, { status: 500 })
  }
}
