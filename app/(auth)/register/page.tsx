'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const CYCLES = [
  { value: 'licence', label: 'Licence Bancaire', desc: '3 ans' },
  { value: 'dseb',    label: 'DSEB',             desc: '4 ans' },
  { value: 'master',  label: 'Master',            desc: '2 ans' },
]

const USER_TYPES = [
  { value: 'etudiant_esb',   label: 'Étudiant à l\'ESB' },
  { value: 'autre_etudiant', label: 'Autre étudiant' },
  { value: 'professeur',     label: 'Professeur' },
  { value: 'ancien',         label: 'Ancien ESBiste' },
  { value: 'metier',         label: 'Professionnel' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [userType, setUserType]   = useState('etudiant_esb')
  const [institutionName, setInstitutionName] = useState('')
  const [cycle, setCycle]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    
    if (userType === 'autre_etudiant' && !institutionName.trim()) {
      setError('Veuillez renseigner votre université ou école supérieure.')
      return
    }

    if ((userType === 'etudiant_esb' || userType === 'ancien') && !cycle) {
      setError('Veuillez sélectionner votre cycle de formation à l\'ESB.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName, 
          user_type: userType,
           institution_name: userType === 'etudiant_esb' || userType === 'ancien'
             ? 'École Supérieure de Banque'
             : userType === 'autre_etudiant' ? institutionName : null,
          cycle: (userType === 'etudiant_esb' || userType === 'ancien') ? cycle : null 
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('rate limit')) {
        setError('Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.')
      } else if (msg.includes('already registered')) {
        setError('Un compte existe déjà avec cet email.')
      } else if (msg.includes('invalid email')) {
        setError('Adresse email invalide.')
      } else if (msg.includes('weak password') || msg.includes('password')) {
        setError('Le mot de passe est trop faible. Utilisez au moins 8 caractères.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Créer un compte</h1>
        <p className="text-blue-200 text-sm">Rejoignez le portail ESB</p>
      </div>

      <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur">
        <CardBody className="p-8">
          <form onSubmit={handleRegister} className="space-y-5" noValidate>
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full name */}
            <div className="relative">
              <Input
                label="Nom complet"
                id="full_name"
                type="text"
                placeholder="Prénom Nom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
              />
              <User className="absolute right-3 top-8 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>

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
              />
              <Mail className="absolute right-3 top-8 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                label="Mot de passe"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

            {/* User Type selection */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Je suis...
              </label>
              <div className="flex flex-wrap gap-2">
                {USER_TYPES.map((u) => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setUserType(u.value)}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer flex-grow',
                      userType === u.value
                        ? 'border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A] shadow-sm'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B]'
                    )}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Institution Name for other students */}
            {userType === 'autre_etudiant' && (
              <div className="relative animate-fade-in-up">
                <Input
                  label="Université ou École Supérieure"
                  id="institution_name"
                  type="text"
                  placeholder="Ex: HEC Alger, ESC, Université d'Oran..."
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Cycle selection for ESB students / Alumni */}
            {(userType === 'etudiant_esb' || userType === 'ancien') && (
              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Cycle de formation (ESB)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CYCLES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCycle(c.value)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 rounded-lg border p-3 text-center transition-all duration-200 cursor-pointer',
                        cycle === c.value
                          ? 'border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A] shadow-sm'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B]'
                      )}
                    >
                      <span className="text-sm font-semibold">{c.label}</span>
                      <span className="text-xs">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-sm text-[#64748B]">
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#1E3A8A] hover:text-[#0F172A] transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
