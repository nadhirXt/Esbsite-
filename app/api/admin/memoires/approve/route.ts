import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Generate a random password
function generatePassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `ESB-${password}`
}

export async function POST(req: NextRequest) {
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

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const { requestId, accept } = await req.json()

    if (!requestId) return NextResponse.json({ error: 'ID de requête manquant' }, { status: 400 })

    if (accept) {
      // 1. Get the user email
      const { data: request } = await supabase
        .from('memoires_access')
        .select(`*, profiles!inner(full_name)`)
        .eq('id', requestId)
        .single()

      if (!request) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })

      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(request.user_id)
      const userEmail = authUser?.email
      
      if (!userEmail) return NextResponse.json({ error: 'Email de l\'utilisateur introuvable' }, { status: 400 })

      // 2. Generate password
      const newPassword = generatePassword()

      // 3. Update status
      const { error: updateError } = await supabase
        .from('memoires_access')
        .update({ 
          status: 'approved', 
          password: newPassword, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // 4. Send Email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e3a8a;">Accès au dossier Mémoires</h2>
          <p>Bonjour ${request.profiles.full_name},</p>
          <p>Votre demande d'accès au dossier confidentiel "Mémoires" a été <strong>approuvée</strong> par l'administration.</p>
          <p>Voici votre mot de passe unique. Gardez-le précieusement :</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: 2px;">${newPassword}</span>
          </div>
          <p>Rendez-vous sur la plateforme pour déverrouiller le dossier avec le Challenge de Sécurité.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Ceci est un message automatique, merci de ne pas y répondre.</p>
        </div>
      `

      try {
        await transporter.sendMail({
          from: `"ESB Administration" <${process.env.GMAIL_EMAIL}>`,
          to: userEmail,
          subject: '🔐 Votre accès aux Mémoires ESB',
          html: emailHtml,
        })
      } catch (emailError) {
        console.error("Failed to send email", emailError)
        // We don't fail the request if email fails, but we should log it
      }

    } else {
      // Reject
      const { error: updateError } = await supabase
        .from('memoires_access')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (updateError) throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Memoires approve error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
