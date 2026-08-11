'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [emailSent, setEmailSent]   = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // If user arrived via email reset link, Supabase sets `type=recovery` in hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    if (hashParams.get('type') === 'recovery') {
      setIsResetting(true)
    }
  }, [])

  // ---- Step 1: Request reset email ----
  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) { setError(error.message); setLoading(false); return }
    setEmailSent(true)
    setLoading(false)
  }

  // ---- Step 2: Set new password ----
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  // --- Render: new password form (after clicking email link) ---
  if (isResetting) {
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
                  className="absolute right-3 top-8 text-[#94A3B8] hover:text-[#64748B]"
                  aria-label="Afficher/masquer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" size="lg" loading={loading} className="w-full">
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    )
  }

  // --- Render: Email sent confirmation ---
  if (emailSent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="bg-white/95 rounded-2xl p-10 shadow-2xl">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-[#1E3A8A]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-3">Email envoyé !</h2>
          <p className="text-[#64748B] text-sm leading-relaxed mb-6">
            Un lien de réinitialisation a été envoyé à <strong className="text-[#0F172A]">{email}</strong>.
            Vérifiez votre boite mail et suivez les instructions.
          </p>
          <Link href="/login" className="text-sm font-semibold text-[#1E3A8A] hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  // --- Render: Default — request reset email ---
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Mot de passe oublié</h1>
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
                id="email"
                type="email"
                placeholder="prenom.nom@esb.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Mail className="absolute right-3 top-8 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>
            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
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
