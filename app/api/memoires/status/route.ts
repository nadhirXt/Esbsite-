import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role, user_type').eq('id', user.id).single()
    if (profile?.role === 'admin') {
      return NextResponse.json({ status: 'unlocked' })
    }

    if (profile?.user_type !== 'etudiant_esb' && profile?.user_type !== 'ancien_etudiant_esb') {
      return NextResponse.json({ error: 'Section réservée aux étudiants ESB' }, { status: 403 })
    }

    const { data: access } = await supabase
      .from('memoires_access')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (!access) {
      return NextResponse.json({ status: null })
    }

    return NextResponse.json({ status: access.status })
  } catch (error: any) {
    console.error('Memoires status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
