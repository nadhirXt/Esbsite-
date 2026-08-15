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

    // Check if admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    // Fetch requests with user details
    const { data: requestsData, error: reqError } = await supabase
      .from('memoires_access')
      .select(`
        *,
        profiles!inner(full_name, cycle)
      `)
      .order('requested_at', { ascending: false })

    if (reqError) throw reqError

    // Fetch emails manually
    const requests = await Promise.all(
      requestsData.map(async (req) => {
        try {
          const { data: { user: authUser } } = await supabase.auth.admin.getUserById(req.user_id)
          return {
            ...req,
            profiles: {
              ...req.profiles,
              email: authUser?.email || 'Email introuvable'
            }
          }
        } catch {
          return {
            ...req,
            profiles: {
              ...req.profiles,
              email: 'Erreur email'
            }
          }
        }
      })
    )

    return NextResponse.json(requests)
  } catch (error: any) {
    console.error('Fetch memoires requests error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
