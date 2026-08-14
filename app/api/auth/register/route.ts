import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  // Initialisation du client Supabase Admin
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Configuration de Nodemailer avec Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  try {
    const { email, password, fullName, userType, institutionName, cycle } = await req.json()

    if (!email || !password || !fullName || !userType) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
    }

    // 1. Créer l'utilisateur via l'API Admin de Supabase (email_confirm: false)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        user_type: userType,
        institution_name: institutionName,
        cycle: cycle
      }
    })

    if (userError) {
      console.error('Erreur création admin:', userError)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    const userId = userData.user.id

    // 2. Générer un token sécurisé
    const token = crypto.randomUUID() + '-' + crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // Valable 24 heures

    // 3. Stocker le token en base
    const { error: insertError } = await supabaseAdmin
      .from('email_verification_tokens')
      .insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Erreur insertion token:', insertError)
      // Si l'insertion échoue, on supprime l'utilisateur créé pour éviter les comptes orphelins
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw insertError
    }

    // 4. Construire le lien de vérification
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const verifyLink = `${siteUrl}/api/auth/verify-email?token=${token}`

    // 5. Envoyer l'email via Nodemailer (Gmail)
    try {
      await transporter.sendMail({
        from: `"ESB Hub" <${process.env.GMAIL_EMAIL}>`,
        to: email,
        subject: '✨ Confirmez votre inscription sur ESB Hub',
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vérification de votre compte</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);padding:36px 40px;text-align:center;">
              <img src="https://upload.wikimedia.org/wikipedia/fr/a/ab/Logo_esb_algerie.png" alt="ESB" width="60" style="margin-bottom:16px;border-radius:8px;" />
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">Bienvenue sur ESB Hub !</h1>
              <p style="color:#bfdbfe;font-size:13px;margin:6px 0 0;">Le portail numérique de l'École Supérieure de Banque</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 12px;">Bonjour ${fullName},</h2>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Merci de rejoindre la communauté ESB Hub. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
              </p>
              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${verifyLink}" style="display:inline-block;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                  ✅ Confirmer mon adresse email
                </a>
              </div>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Ce lien est valable pendant <strong>24 heures</strong>.
              </p>
              <!-- Fallback link -->
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
                <a href="${verifyLink}" style="color:#2563EB;word-break:break-all;">${verifyLink}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} ESB Hub — Algérie
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      })
    } catch (emailError) {
      console.error('Nodemailer error:', emailError)
      // On supprime l'utilisateur s'il y a eu un problème d'envoi d'email
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw emailError
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('register error:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription.' },
      { status: 500 }
    )
  }
}
