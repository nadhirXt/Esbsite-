'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Email not confirmed'
          ? 'Veuillez confirmer votre email avant de vous connecter.'
          : error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : error.message
      )
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
        <p className="text-blue-200 text-sm">
          Accédez à votre espace étudiant
        </p>
      </div>

      <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur">
        <CardBody className="p-8">
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Input
                label="Adresse email"
                id="email"
                type="email"
                placeholder="prenom.nom@esb.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
              <Mail className="absolute right-3 top-8 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                label="Mot de passe"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/reset-password"
                className="text-sm text-[#1E3A8A] hover:text-[#0F172A] font-medium transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-sm text-[#64748B]">
              Pas encore de compte ?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#1E3A8A] hover:text-[#0F172A] transition-colors"
              >
                S&apos;inscrire
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
