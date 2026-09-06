'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { motion, Variants } from 'framer-motion'

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

    try {
      const supabase = createClient()
      const cleanEmail = email.trim()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (signInError) {
        setError(
          signInError.message === 'Email not confirmed'
            ? 'Veuillez confirmer votre email avant de vous connecter.'
            : signInError.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect.'
            : signInError.message
        )
        setLoading(false)
        return
      }

      // Check if user has admin privileges
      const adminEmails = [
        'benelhadjbenelhadj@gmail.com',
        'benelhadjbenelhadj@outlook.com',
        'mohamed-nadhir.benelhadj@etu.enp-oran.dz',
      ]
      const user = data?.user
      const isAdmin = 
        user?.user_metadata?.role === 'admin' ||
        adminEmails.includes(cleanEmail.toLowerCase())

      // Full navigation to ensure fresh session cookies are loaded cleanly
      window.location.href = isAdmin ? '/admin' : '/dashboard'
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'Une erreur inattendue est survenue.')
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
          Terminal d&apos;Accès ESB
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Connexion</h1>
        <p className="text-slate-400 text-sm font-medium">
          Accédez à votre espace étudiant et bibliothèque académique
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="p-7 sm:p-9 rounded-3xl bg-[#070D19]/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(56,189,248,0.12)] relative overflow-hidden group">
          {/* Laser line top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          <form onSubmit={handleLogin} className="space-y-5 relative z-10" noValidate>
            {/* Error banner */}
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

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Adresse Email
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
                  autoFocus
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
                <Link
                  href="/reset-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="cyber-glow"
                size="lg"
                loading={loading}
                className="w-full py-3.5 text-sm font-black font-mono tracking-wider cursor-pointer"
              >
                {loading ? 'Connexion en cours...' : 'OUVRIR LA SESSION'}
              </Button>
            </div>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Pas encore de compte étudiant ?{' '}
              <Link
                href="/register"
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                S&apos;inscrire
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
