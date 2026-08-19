import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Check if a request already exists
    const { data: existing } = await supabase
      .from('memoires_access')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'Une demande est déjà en cours' }, { status: 400 })
      }
      
      // If approved or revoked or unlocked, the user can request a new password
      // We set status to pending again
      const { error: updateError } = await supabase
        .from('memoires_access')
        .update({ status: 'pending', requested_at: new Date().toISOString() })
        .eq('user_id', user.id)
        
      if (updateError) throw updateError
    } else {
      // Create new request
      const { error: insertError } = await supabase
        .from('memoires_access')
        .insert([{ user_id: user.id, status: 'pending' }])
        
      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Memoires request error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
