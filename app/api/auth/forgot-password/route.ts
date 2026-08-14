import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  // Initialisation du client Supabase
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
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    // 1. Chercher l'utilisateur dans Supabase Auth
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) throw usersError

    const user = usersData.users.find(u => u.email === email.toLowerCase().trim())

    // Sécurité : on répond toujours "succès" même si l'email n'existe pas
    // (évite l'énumération d'utilisateurs)
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // 2. Supprimer les anciens tokens de cet utilisateur
    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', user.id)

    // 3. Générer un token sécurisé (UUID + random hex)
    const token = crypto.randomUUID() + '-' + crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // 4. Stocker le token en base
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) throw insertError

    // 5. Construire le lien de réinitialisation
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const resetLink = `${siteUrl}/reset-password?token=${token}`

    // 6. Envoyer l'email via Nodemailer (Gmail)
    try {
      await transporter.sendMail({
        from: `"ESB Hub" <${process.env.GMAIL_EMAIL}>`,
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe — ESB Hub',
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation du mot de passe</title>
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
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">ESB Hub</h1>
              <p style="color:#bfdbfe;font-size:13px;margin:6px 0 0;">Portail Numérique de l'École Supérieure de Banque</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 12px;">Réinitialisation du mot de passe</h2>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte associé à <strong style="color:#0f172a;">${email}</strong>.
              </p>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant <strong>1 heure</strong>.
              </p>
              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                  🔐 Réinitialiser mon mot de passe
                </a>
              </div>
              <!-- Security note -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:24px;">
                <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;">
                  🛡️ <strong>Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.
                </p>
              </div>
              <!-- Fallback link -->
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
                <a href="${resetLink}" style="color:#2563EB;word-break:break-all;">${resetLink}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} ESB Hub — École Supérieure de Banque, Algérie
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
      throw emailError
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('forgot-password error:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Réessayez dans quelques instants.' },
      { status: 500 }
    )
  }
}
