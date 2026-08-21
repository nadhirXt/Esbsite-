import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

// ============================================================
// Rate limiting simple en mémoire (edge-compatible)
// Pour les routes API sensibles (/api/auth/*)
// ============================================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }

  if (entry.count >= limit) return false // blocked
  entry.count++
  return true
}

// ============================================================
// Security Headers
// ============================================================
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Permissions policy — disable camera, mic, geolocation etc.
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  )
  // HSTS — force HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.backblazeb2.com https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co https://*.backblazeb2.com wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host')

  // ── Redirect old domain ──────────────────────────────────
  if (hostname === 'esbhub.vercel.app') {
    const url = request.nextUrl.clone()
    url.host = 'esbhub.study'
    url.port = ''
    return NextResponse.redirect(url)
  }

  // ── Rate Limiting on sensitive auth routes ────────────────
  const sensitiveRoutes = [
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
  ]

  if (sensitiveRoutes.some(route => pathname.startsWith(route))) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const allowed = rateLimit(ip, 10, 60_000) // max 10 requêtes/minute par IP
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Trop de requêtes. Réessayez dans une minute.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      )
    }
  }

  // ── Session refresh (Supabase auth) ──────────────────────
  const response = await updateSession(request)

  // ── Add security headers to every response ───────────────
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (favicon files)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
