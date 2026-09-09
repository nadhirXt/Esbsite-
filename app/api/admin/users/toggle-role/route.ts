import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Verify caller is admin
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { targetUserId, newRole } = await req.json()

    if (!targetUserId || !['admin', 'student'].includes(newRole)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    // Prevent self-demotion
    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Impossible de modifier votre propre rôle' }, { status: 400 })
    }

    // If demoting an admin, prevent demoting the last admin
    if (newRole === 'student') {
      const { count } = await supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')

      if ((count || 0) <= 1) {
        return NextResponse.json({ error: 'Impossible de rétrograder le dernier administrateur' }, { status: 400 })
      }
    }

    // Update role
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, role: newRole })
  } catch (error: any) {
    console.error('Toggle Role Error:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la mise à jour du rôle' }, { status: 500 })
  }
}
