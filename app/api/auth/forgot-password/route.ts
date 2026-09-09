import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { transporter, FROM_ADDRESS } from '@/lib/email'
import { verifyTurnstileToken } from '@/lib/turnstile'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

export async function POST(req: NextRequest) {
  try {
    const { email, turnstileToken } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    // Validation Turnstile Anti-Bot
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp)
    if (!turnstileCheck.success) {
      return NextResponse.json({ error: turnstileCheck.error || 'Échec de la validation du CAPTCHA.' }, { status: 400 })
    }

    // 1. Chercher l'utilisateur par email
    const normalizedEmail = email.toLowerCase().trim()
    const { data: allUsersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    const user = allUsersData?.users?.find(u => u.email === normalizedEmail)

    // Sécurité : on répond toujours "succès" même si l'email n'existe pas
    // (évite l'énumération d'utilisateurs)
    if (usersError || !user) {
      return NextResponse.json({ success: true })
    }

    const userId = user.id

    // 2. Supprimer les anciens tokens de cet utilisateur
    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', userId)

    // 3. Générer un token sécurisé (UUID + random hex)
    const token = crypto.randomUUID() + '-' + crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // 4. Stocker le token en base
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) throw insertError

    // 5. Construire le lien de réinitialisation
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://esbhub.study'
    const resetLink = `${siteUrl}/reset-password?token=${token}`
    const logoUrl = `${siteUrl}/images/esb-logo.jpg`
    const safeEmail = escapeHtml(normalizedEmail)

    // 6. Envoyer l'email via Nodemailer (Gmail)
    try {
      await transporter.sendMail({
        from: FROM_ADDRESS,
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe — ESB Hub',
        text: `Bonjour,\n\nUne demande de réinitialisation de mot de passe a été reçue pour le compte associé à ${normalizedEmail}.\n\nPour définir un nouveau mot de passe, cliquez sur ce lien (valable 1 heure) :\n${resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message. Votre mot de passe actuel reste inchangé.\n\nL'équipe ESB Hub\nÉcole Supérieure de Banque — Algérie`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation de mot de passe — ESB Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#0b132b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader preview text for mail clients -->
  <div style="display:none;font-size:1px;color:#0b132b;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Réinitialisation de votre mot de passe ESB Hub (lien valable 1 heure). Cliquez ici pour continuer.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0b132b;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);">
          <!-- Header Banner -->
          <tr>
            <td bgcolor="#1E3A8A" style="background-color:#1E3A8A;background:linear-gradient(135deg,#0b132b 0%,#1e3a8a 60%,#2563eb 100%);padding:40px 32px;text-align:center;">
              <img src="${logoUrl}" alt="ESB" width="68" height="68" style="display:block;margin:0 auto 16px;border-radius:14px;border:2px solid rgba(255,255,255,0.25);background:#ffffff;object-fit:cover;" />
              <div style="display:inline-block;padding:4px 14px;border-radius:20px;background:rgba(255,255,255,0.15);color:#93c5fd;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">
                SÉCURITÉ DU COMPTE
              </div>
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.4px;">Mot de passe oublié ?</h1>
              <p style="color:#bfdbfe;font-size:13px;margin:6px 0 0;font-weight:500;">École Supérieure de Banque — Algérie</p>
            </td>
          </tr>

          <!-- Amber Accent Bar -->
          <tr>
            <td height="3" bgcolor="#f59e0b" style="background:linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <h2 style="color:#0f172a;font-size:19px;font-weight:700;margin:0 0 14px;letter-spacing:-0.2px;">
                Réinitialisation demandée
              </h2>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 18px;">
                Une demande de réinitialisation de mot de passe a été émise pour votre compte ESB Hub associé à l'adresse <strong style="color:#0f172a;">${safeEmail}</strong>.
              </p>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 24px;">
                Pour choisir un nouveau mot de passe sécurisé, cliquez sur le bouton ci-dessous :
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#2563EB" style="border-radius:12px;background-color:#2563EB;background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);box-shadow:0 6px 18px rgba(37,99,235,0.35);">
                          <a href="${resetLink}" target="_blank" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
                            🔐 Réinitialiser mon mot de passe &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Expiration Warning Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:8px;margin:20px 0;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="color:#475569;font-size:13px;line-height:1.5;margin:0;">
                      ⏳ <strong>Délai de sécurité :</strong> Ce lien temporaire expirera automatiquement dans <strong>1 heure</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Notice Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fef3c7;border-left:4px solid #f59e0b;border-radius:8px;margin:20px 0;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="color:#92400e;font-size:13px;line-height:1.5;margin:0;">
                      🛡️ <strong>Sécurité :</strong> Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel ne sera pas modifié.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <div style="background:#f1f5f9;border:1px dashed #cbd5e1;border-radius:8px;padding:14px;margin-top:24px;">
                <p style="color:#64748b;font-size:12px;margin:0 0 8px;font-weight:600;">
                  Un problème avec le bouton ? Copiez-collez ce lien direct dans votre navigateur :
                </p>
                <p style="margin:0;font-size:11px;line-height:1.5;word-break:break-all;">
                  <a href="${resetLink}" style="color:#2563EB;text-decoration:underline;">${resetLink}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f8fafc" style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 32px;text-align:center;">
              <p style="color:#475569;font-size:12px;font-weight:600;margin:0 0 4px;">
                École Supérieure de Banque (ESB)
              </p>
              <p style="color:#94a3b8;font-size:11px;margin:0 0 8px;">
                Portail Numérique Académique & Bibliothèque — Algérie
              </p>
              <p style="color:#cbd5e1;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} ESB Hub. Tous droits réservés.
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
