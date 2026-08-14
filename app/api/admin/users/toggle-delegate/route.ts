import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { targetUserId, isDelegate, delegateCycle, delegateYear } = await req.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 })
    }

    // Mettre à jour le profil avec les nouveaux droits de délégué
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_delegate: isDelegate,
        delegate_cycle: isDelegate ? delegateCycle : null,
        delegate_year: isDelegate ? delegateYear : null
      })
      .eq('id', targetUserId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Toggle Delegate Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
