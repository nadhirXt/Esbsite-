import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {

  try {
    const { token, password } = await req.json()

    // Validation
    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
        { status: 400 }
      )
    }

    // 1. Chercher le token en base
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: 'Lien invalide ou déjà utilisé. Veuillez faire une nouvelle demande.' },
        { status: 400 }
      )
    }

    // 2. Vérifier l'expiration
    if (new Date(tokenRecord.expires_at) < new Date()) {
      // Supprimer le token expiré
      await supabaseAdmin
        .from('password_reset_tokens')
        .delete()
        .eq('token', token)

      return NextResponse.json(
        { error: 'Ce lien a expiré (valable 1 heure). Veuillez faire une nouvelle demande.' },
        { status: 400 }
      )
    }

    // 3. Mettre à jour le mot de passe via admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenRecord.user_id,
      { password }
    )

    if (updateError) throw updateError

    // 4. Supprimer le token (usage unique)
    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .eq('token', token)

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('reset-password error:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Réessayez dans quelques instants.' },
      { status: 500 }
    )
  }
}
