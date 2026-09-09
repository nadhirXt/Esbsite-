import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {

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

    const { targetUserId } = await req.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(targetUserId)) {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 })
    }

    // Prevent self-deletion
    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Impossible de supprimer votre propre compte' }, { status: 400 })
    }

    // Prevent deleting the last admin
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', targetUserId)
      .single()

    if (targetProfile?.role === 'admin') {
      const { count } = await supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
      
      if ((count || 0) <= 1) {
        return NextResponse.json({ error: 'Impossible de supprimer le dernier administrateur' }, { status: 400 })
      }
    }

    // 1. Explicitly clean up all user tokens and profile to avoid orphaned records
    await supabaseAdmin.from('email_verification_tokens').delete().eq('user_id', targetUserId)
    await supabaseAdmin.from('password_reset_tokens').delete().eq('user_id', targetUserId)
    await supabaseAdmin.from('profiles').delete().eq('id', targetUserId)

    // 2. Delete the user in auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete User Error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue lors de la suppression' }, { status: 500 })
  }
}
