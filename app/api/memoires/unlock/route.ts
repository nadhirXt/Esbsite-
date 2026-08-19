import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { title, name, password } = await req.json()

    // Valider le quiz
    if (title !== 'Monsieur') return NextResponse.json({ error: 'Mauvaise réponse à la question 1' }, { status: 400 })
    if (name.trim().toLowerCase() !== 'moussa') return NextResponse.json({ error: 'Mauvaise réponse à la question 2' }, { status: 400 })
    if (!password) return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })

    // Check DB
    const { data: access } = await supabase
      .from('memoires_access')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!access) return NextResponse.json({ error: 'Aucune demande trouvée' }, { status: 404 })

    if (access.status === 'revoked') {
      return NextResponse.json({ error: 'Accès révoqué' }, { status: 403 })
    }

    if (access.status !== 'approved' && access.status !== 'unlocked') {
      return NextResponse.json({ error: 'Accès non approuvé' }, { status: 403 })
    }

    if (access.password !== password.trim()) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 400 })
    }

    // Success! Update status to unlocked
    if (access.status === 'approved') {
      await supabase
        .from('memoires_access')
        .update({ status: 'unlocked' })
        .eq('id', access.id)
    }

    // Log activity
    await supabase
      .from('memoires_activity')
      .insert([{ user_id: user.id, action: 'entered_folder' }])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Memoires unlock error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
