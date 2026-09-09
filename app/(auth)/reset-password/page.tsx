'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { motion, Variants } from 'framer-motion'
import TurnstileWidget from '@/components/ui/TurnstileWidget'

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
  const [turnstileToken, setTurnstileToken] = useState('')

  // Lire le token depuis ?token=xxx dans l'URL
  useEffect(() => {
    const t = searchParams.get('token')
    if (t) setToken(t)
  }, [searchParams])

  // ---- Étape 1 : Envoyer le lien de réinitialisation ----
  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!turnstileToken) {
      setError('Veuillez valider le contrôle de sécurité (CAPTCHA).')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          turnstileToken,
        }),
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
          <div className="p-8 sm:p-10 rounded-3xl bg-[#070D19]/90 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Mot de passe mis à jour !</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-2">
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <p className="text-slate-500 text-xs font-mono mb-6">Redirection automatique vers la connexion...</p>
            <Link href="/login" className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              Se connecter maintenant →
            </Link>
          </div>
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
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Récupération Sécurisée
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Nouveau mot de passe</h1>
          <p className="text-slate-400 text-sm font-medium">Choisissez un mot de passe robuste</p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="p-7 sm:p-9 rounded-3xl bg-[#070D19]/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(56,189,248,0.12)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <form onSubmit={handleSetPassword} className="space-y-5 relative z-10" noValidate>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md p-3.5 text-xs text-red-200"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}

              {/* Nouveau mot de passe */}
              <div className="space-y-1.5">
                <label htmlFor="new_password" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="new_password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Afficher/masquer le mot de passe"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmer mot de passe */}
              <div className="space-y-1.5">
                <label htmlFor="confirm_password" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Afficher/masquer la confirmation"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Indicateur de force */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          password.length >= (i + 1) * 3
                            ? password.length >= 12 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                            : password.length >= 8 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    {password.length < 8 ? 'Trop court' : password.length < 12 ? 'Acceptable' : 'Fort ✓'}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  type="submit" 
                  variant="cyber-glow"
                  size="lg" 
                  loading={loading} 
                  className="w-full py-3.5 text-sm font-black font-mono tracking-wider cursor-pointer"
                >
                  {loading ? 'Mise à jour...' : 'METTRE À JOUR'}
                </Button>
              </div>
            </form>
          </div>
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
          <div className="p-8 sm:p-10 rounded-3xl bg-[#070D19]/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(56,189,248,0.15)] relative overflow-hidden flex flex-col items-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-5 border border-cyan-500/40 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
              <CheckCircle className="w-8 h-8 text-cyan-300" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Email envoyé !</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-2">
              Un lien de réinitialisation a été envoyé à{' '}
              <strong className="text-white bg-white/10 px-2 py-0.5 rounded font-mono">{email}</strong>
            </p>
            <p className="text-slate-400 text-xs mb-8">
              Vérifiez votre boîte mail et vos spams. Le lien expire dans <strong>1 heure</strong>.
            </p>
            <button
              onClick={() => { setEmailSent(false); setEmail('') }}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4 mb-6 transition-all cursor-pointer"
            >
              Renvoyer avec un autre email
            </button>
            <Link href="/login" className="text-xs font-mono font-bold text-white hover:text-cyan-300 transition-colors">
              Retour à la connexion
            </Link>
          </div>
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
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Récupération d&apos;Accès
        </div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Mot de passe oublié ?</h1>
        <p className="text-slate-400 text-sm font-medium">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="p-7 sm:p-9 rounded-3xl bg-[#070D19]/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(56,189,248,0.12)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <form onSubmit={handleRequestReset} className="space-y-5 relative z-10" noValidate>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md p-3.5 text-xs text-red-200"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="reset_email" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Adresse email
              </label>
              <div className="relative">
                <input
                  id="reset_email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                />
                <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Turnstile CAPTCHA */}
            <TurnstileWidget
              onSuccess={(t) => setTurnstileToken(t)}
              onExpire={() => setTurnstileToken('')}
              onError={(code) => setError(`Contrôle de sécurité Cloudflare : ${code || 'bloqué par le navigateur'}. Désactivez Adblock si actif.`)}
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                variant="cyber-glow"
                size="lg" 
                loading={loading} 
                className="w-full py-3.5 text-sm font-black font-mono tracking-wider cursor-pointer"
              >
                {loading ? 'Envoi en cours...' : 'ENVOYER LE LIEN'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors group/link"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover/link:-translate-x-1 transition-transform" />
              Retour à la connexion
            </Link>
          </div>
        </div>
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
