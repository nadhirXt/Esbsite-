'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { motion, Variants } from 'framer-motion'

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

  // --- Vue : Succès final ---
  if (success) {
    return (
      <motion.div 
        className="w-full max-w-md mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 opacity-50 z-0"></div>
            <CardBody className="p-8 sm:p-10 relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-5 ring-1 ring-green-500/50">
                <ShieldCheck className="w-8 h-8 text-green-300" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Mot de passe mis à jour !</h2>
              <p className="text-blue-100/80 text-sm leading-relaxed mb-2">
                Votre mot de passe a été réinitialisé avec succès.
              </p>
              <p className="text-blue-200/50 text-xs mb-6">Redirection automatique vers la connexion...</p>
              <Link href="/login" className="text-sm font-semibold text-white hover:text-blue-200 transition-colors">
                Se connecter maintenant →
              </Link>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // --- Vue : Formulaire nouveau mot de passe (token présent dans l'URL) ---
  if (token) {
    return (
      <motion.div 
        className="w-full max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-sm">Nouveau mot de passe</h1>
          <p className="text-blue-100/80 text-sm font-medium">Choisissez un mot de passe sécurisé</p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 opacity-50 z-0"></div>
            <CardBody className="p-8 sm:p-10 relative z-10">
              <form onSubmit={handleSetPassword} className="space-y-6" noValidate>
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

                {/* Nouveau mot de passe */}
                <div className="relative group/input">
                  <Input
                    label="Nouveau mot de passe"
                    id="new_password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
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

                {/* Confirmer mot de passe */}
                <div className="relative group/input">
                  <Input
                    label="Confirmer le mot de passe"
                    id="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/90 border-white/20 focus:bg-white text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                    aria-label="Afficher/masquer la confirmation"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Indicateur de force (simple) */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1.5">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            password.length >= (i + 1) * 3
                              ? password.length >= 12 ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                              : password.length >= 8 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                              : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                              : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-blue-200/70 font-medium">
                      {password.length < 8 ? 'Trop court' : password.length < 12 ? 'Acceptable' : 'Fort ✓'}
                    </p>
                  </div>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" size="lg" loading={loading} className="w-full shadow-xl shadow-blue-900/20 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0 py-6 text-lg font-semibold">
                    {loading ? 'Mise à jour...' : 'Mettre à jour'}
                  </Button>
                </motion.div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // --- Vue : Email envoyé avec succès ---
  if (emailSent) {
    return (
      <motion.div 
        className="w-full max-w-md mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 opacity-50 z-0"></div>
            <CardBody className="p-8 sm:p-10 relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-5 ring-1 ring-blue-500/50">
                <CheckCircle className="w-8 h-8 text-blue-300" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Email envoyé !</h2>
              <p className="text-blue-100/80 text-sm leading-relaxed mb-2">
                Un lien de réinitialisation a été envoyé à{' '}
                <strong className="text-white bg-white/10 px-2 py-0.5 rounded">{email}</strong>
              </p>
              <p className="text-blue-200/60 text-xs mb-8">
                Vérifiez votre boîte mail et vos spams. Le lien expire dans <strong>1 heure</strong>.
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmail('') }}
                className="text-sm font-medium text-blue-200 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/100 mb-6 transition-all"
              >
                Renvoyer avec un autre email
              </button>
              <Link href="/login" className="text-sm font-bold text-white hover:text-blue-200 transition-colors">
                Retour à la connexion
              </Link>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // --- Vue par défaut : Formulaire de demande de reset ---
  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-sm">Mot de passe oublié ?</h1>
        <p className="text-blue-100/80 text-sm font-medium">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 opacity-50 z-0"></div>
          <CardBody className="p-8 sm:p-10 relative z-10">
            <form onSubmit={handleRequestReset} className="space-y-6" noValidate>
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

              <div className="relative group/input">
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
                  className="bg-white/90 border-white/20 focus:bg-white text-slate-900 placeholder-slate-400"
                />
                <Mail className="absolute right-3 top-[34px] w-5 h-5 text-slate-400 pointer-events-none group-focus-within/input:text-blue-600 transition-colors" />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" size="lg" loading={loading} className="w-full shadow-xl shadow-blue-900/20 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0 py-6 text-lg font-semibold">
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </Button>
              </motion.div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-blue-100/70 hover:text-white transition-colors group/link"
              >
                <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" />
                Retour à la connexion
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
