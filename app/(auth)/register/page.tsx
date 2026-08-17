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
import { motion, Variants } from 'framer-motion'

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
  const [isRegistered, setIsRegistered] = useState(false)

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

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          userType,
          institutionName: userType === 'etudiant_esb' || userType === 'ancien'
             ? 'École Supérieure de Banque'
             : userType === 'autre_etudiant' ? institutionName : null,
          cycle: (userType === 'etudiant_esb' || userType === 'ancien') ? cycle : null 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = (data.error || '').toLowerCase()
        if (msg.includes('already registered')) {
          setError('Un compte existe déjà avec cet email.')
        } else if (msg.includes('invalid email')) {
          setError('Adresse email invalide.')
        } else if (msg.includes('password')) {
          setError('Le mot de passe est trop faible. Utilisez au moins 8 caractères.')
        } else {
          setError(data.error || 'Une erreur est survenue.')
        }
        setLoading(false)
        return
      }

      setIsRegistered(true)
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  if (isRegistered) {
    return (
      <motion.div 
        className="text-center max-w-md mx-auto w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">Vérifiez votre email</h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-8">
              Un email de vérification a été envoyé à <strong className="text-white">{email}</strong>.
              Veuillez cliquer sur le lien qu'il contient pour activer votre compte.
            </p>
            <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-blue-900 font-bold hover:bg-blue-50 transition-colors shadow-lg">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="w-full max-w-lg mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-sm">Créer un compte</h1>
        <p className="text-blue-100/80 text-base font-medium">Rejoignez le portail ESB</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 opacity-50 z-0"></div>
          <CardBody className="p-8 sm:p-10 relative z-10">
            <form onSubmit={handleRegister} className="space-y-6" noValidate>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex items-start gap-3 rounded-xl border border-red-200/50 bg-red-500/10 backdrop-blur-md p-4 text-sm text-red-100"
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-300" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}

              {/* Full name */}
              <div className="relative group/input">
                <Input
                  label="Nom complet"
                  id="full_name"
                  type="text"
                  placeholder="Prénom Nom"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                  className="bg-white/90 border-white/20 focus:bg-white text-slate-900 placeholder-slate-400"
                />
                <User className="absolute right-3 top-[34px] w-5 h-5 text-slate-400 pointer-events-none group-focus-within/input:text-blue-600 transition-colors" />
              </div>

              {/* Email */}
              <div className="relative group/input">
                <Input
                  label="Adresse email"
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-white/90 border-white/20 focus:bg-white text-slate-900 placeholder-slate-400"
                />
                <Mail className="absolute right-3 top-[34px] w-5 h-5 text-slate-400 pointer-events-none group-focus-within/input:text-blue-600 transition-colors" />
              </div>

              {/* Password */}
              <div className="relative group/input">
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
                  className="bg-white/90 border-white/20 focus:bg-white text-slate-900 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                  aria-label="Afficher/masquer le mot de passe"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* User Type selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3 drop-shadow-sm">
                  Je suis...
                </label>
                <div className="flex flex-wrap gap-2">
                  {USER_TYPES.map((u) => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setUserType(u.value)}
                      className={cn(
                        'px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer flex-grow border backdrop-blur-sm',
                        userType === u.value
                          ? 'border-blue-400/50 bg-blue-500/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-blue-100/70 hover:text-white'
                      )}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution Name for other students */}
              {userType === 'autre_etudiant' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group/input">
                  <Input
                    label="Université ou École Supérieure"
                    id="institution_name"
                    type="text"
                    placeholder="Ex: HEC Alger, ESC, Université d'Oran..."
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                    className="bg-white/90 border-white/20 focus:bg-white text-slate-900 placeholder-slate-400"
                  />
                </motion.div>
              )}

              {/* Cycle selection for ESB students / Alumni */}
              {(userType === 'etudiant_esb' || userType === 'ancien') && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-sm font-medium text-white mb-3 drop-shadow-sm">
                    Cycle de formation (ESB)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {CYCLES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCycle(c.value)}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center transition-all duration-200 cursor-pointer backdrop-blur-sm',
                          cycle === c.value
                            ? 'border-blue-400/50 bg-blue-500/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-blue-100/70 hover:text-white'
                        )}
                      >
                        <span className="text-sm font-bold">{c.label}</span>
                        <span className="text-xs opacity-80">{c.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full shadow-xl shadow-blue-900/20 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0 py-6 text-lg font-semibold"
                >
                  {loading ? 'Création du compte...' : 'Créer mon compte'}
                </Button>
              </motion.div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-blue-100/70">
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  className="font-bold text-white hover:text-blue-200 transition-colors drop-shadow-sm"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  )
}
