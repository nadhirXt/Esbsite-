'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [emailSent, setEmailSent]       = useState(false)
  const [success, setSuccess]           = useState(false)
  const [token, setToken]               = useState<string | null>(null)

  // Lire le token depuis ?token=xxx dans l'URL
  useEffect(() => {
    const t = searchParams.get('token')
    if (t) setToken(t)
  }, [searchParams])

  // ---- Étape 1 : Envoyer le lien de réinitialisation ----
  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
        return
      }

      setEmailSent(true)
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  // ---- Étape 2 : Définir le nouveau mot de passe ----
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
        return
      }

      setSuccess(true)
      // Rediriger vers login après 3 secondes
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  // --- Vue : Succès final ---
  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <div className="bg-white/95 rounded-2xl p-10 shadow-2xl">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-3">Mot de passe mis à jour !</h2>
          <p className="text-[#64748B] text-sm leading-relaxed mb-2">
            Votre mot de passe a été réinitialisé avec succès.
          </p>
          <p className="text-[#94A3B8] text-xs mb-6">Redirection automatique vers la connexion...</p>
          <Link href="/login" className="text-sm font-semibold text-[#1E3A8A] hover:underline">
            Se connecter maintenant →
          </Link>
        </div>
      </div>
    )
  }

  // --- Vue : Formulaire nouveau mot de passe (token présent dans l'URL) ---
  if (token) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Nouveau mot de passe</h1>
          <p className="text-blue-200 text-sm">Choisissez un mot de passe sécurisé</p>
        </div>
        <Card className="shadow-2xl bg-white/95">
          <CardBody className="p-8">
            <form onSubmit={handleSetPassword} className="space-y-5" noValidate>
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nouveau mot de passe */}
              <div className="relative">
                <Input
                  label="Nouveau mot de passe"
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  hint="Au moins 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                  aria-label="Afficher/masquer le mot de passe"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirmer mot de passe */}
              <div className="relative">
                <Input
                  label="Confirmer le mot de passe"
                  id="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-8 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                  aria-label="Afficher/masquer la confirmation"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Indicateur de force (simple) */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= (i + 1) * 3
                            ? password.length >= 12 ? 'bg-green-500'
                            : password.length >= 8 ? 'bg-yellow-400'
                            : 'bg-red-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    {password.length < 8 ? 'Trop court' : password.length < 12 ? 'Acceptable' : 'Fort ✓'}
                  </p>
                </div>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full">
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    )
  }

  // --- Vue : Email envoyé avec succès ---
  if (emailSent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="bg-white/95 rounded-2xl p-10 shadow-2xl">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-[#1E3A8A]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-3">Email envoyé !</h2>
          <p className="text-[#64748B] text-sm leading-relaxed mb-2">
            Un lien de réinitialisation a été envoyé à{' '}
            <strong className="text-[#0F172A]">{email}</strong>.
          </p>
          <p className="text-[#94A3B8] text-xs mb-6">
            Vérifiez votre boîte mail et vos spams. Le lien expire dans <strong>1 heure</strong>.
          </p>
          <button
            onClick={() => { setEmailSent(false); setEmail('') }}
            className="text-sm text-[#64748B] hover:text-[#0F172A] underline underline-offset-2 mb-4 block mx-auto transition-colors"
          >
            Renvoyer avec un autre email
          </button>
          <Link href="/login" className="text-sm font-semibold text-[#1E3A8A] hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  // --- Vue par défaut : Formulaire de demande de reset ---
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Mot de passe oublié ?</h1>
        <p className="text-blue-200 text-sm">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>
      <Card className="shadow-2xl bg-white/95">
        <CardBody className="p-8">
          <form onSubmit={handleRequestReset} className="space-y-5" noValidate>
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="relative">
              <Input
                label="Adresse email"
                id="reset_email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
              <Mail className="absolute right-3 top-8 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
