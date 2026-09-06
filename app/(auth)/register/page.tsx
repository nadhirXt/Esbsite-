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
  { value: 'licence', label: 'Licence en Management et Banque', desc: '3 ans (6 semestres) — 2 340h' },
  { value: 'dseb',    label: 'DSEB — Diplôme Supérieur d\'Études Bancaires', desc: '4 ans — Formation des cadres' },
  { value: 'master',  label: 'Master en Monnaie et Banque', desc: '2 ans — Régime mixte & immersion' },
]

const USER_TYPES = [
  { value: 'etudiant_esb',   label: 'Étudiant(e) à l\'ESB' },
  { value: 'autre_etudiant', label: 'Étudiant(e) d\'une autre institution' },
  { value: 'professeur',     label: 'Enseignant / Intervenant' },
  { value: 'ancien',         label: 'Alumni / Diplômé de l\'ESB' },
  { value: 'metier',         label: 'Cadre du secteur bancaire' },
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Enregistrement Portail ESB
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Créer un compte</h1>
        <p className="text-slate-400 text-sm font-medium">Rejoignez l&apos;écosystème d&apos;excellence académique</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="p-7 sm:p-9 rounded-3xl bg-[#070D19]/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(56,189,248,0.12)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          <form onSubmit={handleRegister} className="space-y-5 relative z-10" noValidate>
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

            {/* Full name */}
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Nom complet
              </label>
              <div className="relative">
                <input
                  id="full_name"
                  type="text"
                  placeholder="Prénom Nom"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                  className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                />
                <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Adresse email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                />
                <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Mot de passe
                </label>
                <span className="text-[11px] font-mono text-slate-400">Min. 8 caractères</span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            {/* User Type selection */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Profil académique
              </label>
              <div className="flex flex-wrap gap-2">
                {USER_TYPES.map((u) => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setUserType(u.value)}
                    className={cn(
                      'px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer flex-grow border backdrop-blur-sm',
                      userType === u.value
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                        : 'border-white/10 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white'
                    )}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Institution Name for other students */}
            {userType === 'autre_etudiant' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="block text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  Suggestions rapides :
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['HEC Alger', 'IHEC Alger', 'ENSSEA', 'EHEC', 'Alger 3 (FSE)', 'ESC Kolea'].map((school) => (
                    <button
                      key={school}
                      type="button"
                      onClick={() => setInstitutionName(school)}
                      className={cn(
                        'text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer',
                        institutionName === school
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-sm'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      )}
                    >
                      {school}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <input
                    id="institution_name"
                    type="text"
                    placeholder="Ex: HEC Alger, ESC, Université d'Oran..."
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Cycle selection for ESB students / Alumni */}
            {(userType === 'etudiant_esb' || userType === 'ancien') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Cycle de formation (ESB)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {CYCLES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCycle(c.value)}
                      className={cn(
                        'flex flex-col items-start sm:items-center justify-center gap-1 rounded-xl border p-3 text-left sm:text-center transition-all duration-200 cursor-pointer backdrop-blur-sm',
                        cycle === c.value
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                          : 'border-white/10 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white'
                      )}
                    >
                      <span className="text-xs font-bold">{c.label}</span>
                      <span className="text-[10px] text-slate-400">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="cyber-amber"
                size="lg"
                loading={loading}
                className="w-full py-3.5 text-sm font-black font-mono tracking-wider cursor-pointer"
              >
                {loading ? 'Création du compte...' : 'CRÉER MON COMPTE ÉTUDIANT'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
