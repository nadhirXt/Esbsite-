import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const { targetUserId } = await req.json()

    if (!targetUserId) return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 })

    const { error: updateError } = await supabase
      .from('memoires_access')
      .update({ status: 'revoked', password: null })
      .eq('user_id', targetUserId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Memoires revoke error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
