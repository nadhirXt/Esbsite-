import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Vérifier si l'utilisateur qui appelle est Admin
    // Normalement, tu devrais passer le token de l'utilisateur dans les headers
    // Mais pour simplifier, on fait confiance à l'appel côté serveur pour le moment, 
    // ou tu peux vérifier l'auth header.
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Vérifier son rôle dans profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // 2. Récupérer tous les utilisateurs
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) throw usersError

    // Récupérer les profils pour joindre les infos (cycle, etc.)
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    if (profilesError) throw profilesError

    // Combiner les données
    const combinedUsers = usersData.users.map(u => {
      const p = profilesData.find(p => p.id === u.id) || {}
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        full_name: p.full_name || u.user_metadata?.full_name,
        user_type: p.user_type,
        cycle: p.cycle,
        role: p.role,
        is_delegate: p.is_delegate || false,
        delegate_cycle: p.delegate_cycle,
        delegate_year: p.delegate_year
      }
    })

    return NextResponse.json(combinedUsers)
  } catch (error: any) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
