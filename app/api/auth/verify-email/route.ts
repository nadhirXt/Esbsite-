import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/login?error=Lien de vérification invalide.`)
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Chercher le token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.redirect(`${siteUrl}/login?error=Le lien de vérification est invalide ou a expiré.`)
    }

    // 2. Vérifier l'expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      await supabaseAdmin.from('email_verification_tokens').delete().eq('id', tokenData.id)
      return NextResponse.redirect(`${siteUrl}/login?error=Le lien de vérification a expiré. Veuillez vous réinscrire.`)
    }

    // 3. Valider l'utilisateur
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { email_confirm: true }
    )

    if (updateError) {
      console.error('Erreur validation utilisateur:', updateError)
      return NextResponse.redirect(`${siteUrl}/login?error=Impossible de valider le compte.`)
    }

    // 4. Supprimer le token utilisé
    await supabaseAdmin.from('email_verification_tokens').delete().eq('id', tokenData.id)

    // 5. Rediriger vers le login avec succès
    return NextResponse.redirect(`${siteUrl}/login?verified=true`)

  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.redirect(`${siteUrl}/login?error=Une erreur est survenue.`)
  }
}
