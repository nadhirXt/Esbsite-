import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://esbhub.study'

  const makeRedirect = (params: Record<string, string>) => {
    const url = new URL('/login', siteUrl)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    return NextResponse.redirect(url)
  }

  if (!token) {
    return makeRedirect({ error: 'Lien de vérification manquant ou invalide.' })
  }

  try {
    // 1. Chercher le token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return makeRedirect({ error: 'Le lien de vérification est invalide ou a déjà été utilisé.' })
    }

    // 2. Vérifier l'expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      await supabaseAdmin.from('email_verification_tokens').delete().eq('id', tokenData.id)
      return makeRedirect({ error: 'Le lien de vérification a expiré. Veuillez vous réinscrire.' })
    }

    // 3. Valider l'utilisateur
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { email_confirm: true }
    )

    if (updateError) {
      console.error('Erreur validation utilisateur:', updateError)
      return makeRedirect({ error: 'Impossible de valider le compte.' })
    }

    // 4. Supprimer le token utilisé
    await supabaseAdmin.from('email_verification_tokens').delete().eq('id', tokenData.id)

    // 5. Rediriger vers le login avec succès
    return makeRedirect({ verified: 'true' })

  } catch (error) {
    console.error('Verify email error:', error)
    return makeRedirect({ error: 'Une erreur est survenue lors de la vérification.' })
  }
}
