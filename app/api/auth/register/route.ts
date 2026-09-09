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
    const { email, password, fullName, userType, institutionName, cycle, turnstileToken } = await req.json()

    if (!email || !password || !fullName || !userType) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
    }

    // Validation Turnstile Anti-Bot
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp)
    if (!turnstileCheck.success) {
      return NextResponse.json({ error: turnstileCheck.error || 'Échec de la validation du CAPTCHA.' }, { status: 400 })
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
      return NextResponse.json({ error: 'Vérifiez votre email pour finaliser l\'inscription.' }, { status: 400 })
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://esbhub.study'
    const verifyLink = `${siteUrl}/api/auth/verify-email?token=${token}`

    // 5. Envoyer l'email via Nodemailer (Gmail)
    const logoUrl = `${siteUrl}/images/esb-logo.jpg`
    const escapedName = escapeHtml(fullName)

    try {
      await transporter.sendMail({
        from: FROM_ADDRESS,
        to: email,
        subject: '✨ Confirmez votre inscription sur ESB Hub',
        text: `Bonjour ${fullName},\n\nMerci de rejoindre ESB Hub. Pour activer votre compte, veuillez confirmer votre adresse email en ouvrant ce lien :\n${verifyLink}\n\nCe lien est valable pendant 24 heures.\n\nSi vous n'avez pas créé de compte, vous pouvez ignorer cet email.\n\nL'équipe ESB Hub\nÉcole Supérieure de Banque — Algérie`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vérification de votre compte — ESB Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#0b132b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader preview text for mail clients -->
  <div style="display:none;font-size:1px;color:#0b132b;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Confirmez votre adresse email pour finaliser votre inscription sur le portail ESB Hub. Lien valable 24h.
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
                PORTAIL ACADÉMIQUE OFFICIEL
              </div>
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.4px;">Bienvenue sur ESB Hub !</h1>
              <p style="color:#bfdbfe;font-size:13px;margin:6px 0 0;font-weight:500;">École Supérieure de Banque — Algérie</p>
            </td>
          </tr>

          <!-- Gold Accent Bar -->
          <tr>
            <td height="3" bgcolor="#f59e0b" style="background:linear-gradient(90deg,#f59e0b,#38bdf8,#f59e0b);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <h2 style="color:#0f172a;font-size:19px;font-weight:700;margin:0 0 14px;letter-spacing:-0.2px;">
                Bonjour ${escapedName},
              </h2>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
                Nous sommes ravis de vous compter parmi les membres de la communauté <strong>ESB Hub</strong>. Pour finaliser la création de votre compte et accéder à votre espace, veuillez confirmer votre adresse email en cliquant ci-dessous :
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#2563EB" style="border-radius:12px;background-color:#2563EB;background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);box-shadow:0 6px 18px rgba(37,99,235,0.35);">
                          <a href="${verifyLink}" target="_blank" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
                            ✅ Confirmer mon adresse email &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:8px;margin:24px 0;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="color:#475569;font-size:13px;line-height:1.5;margin:0;">
                      ⏳ <strong>Validité :</strong> Ce lien est sécurisé et reste actif pendant <strong>24 heures</strong>. Passé ce délai, une nouvelle inscription sera requise.
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
                  <a href="${verifyLink}" style="color:#2563EB;text-decoration:underline;">${verifyLink}</a>
                </p>
              </div>

              <!-- Security disclaimer -->
              <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:24px 0 0;">
                Si vous n'êtes pas à l'origine de cette inscription, aucune action n'est requise. Ce compte ne sera pas activé sans confirmation.
              </p>
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
