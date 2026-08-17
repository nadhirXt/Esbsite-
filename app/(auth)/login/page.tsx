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
      <motion.div variants={itemVariants} className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-sm">Connexion</h1>
        <p className="text-blue-100/80 text-base font-medium">
          Accédez à votre espace étudiant ESB
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden relative group">
          {/* Subtle glow effect behind the card */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 opacity-50 z-0"></div>
          
          <CardBody className="p-8 sm:p-10 relative z-10">
            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              {/* Error banner */}
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
                  autoFocus
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-white/90 border-white/20 focus:bg-white text-slate-900 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end pt-1">
                <Link
                  href="/reset-password"
                  className="text-sm text-blue-200 hover:text-white font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full shadow-xl shadow-blue-900/20 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0 py-6 text-lg font-semibold"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </motion.div>
            </form>

            {/* Register link */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-blue-100/70">
                Pas encore de compte ?{' '}
                <Link
                  href="/register"
                  className="font-bold text-white hover:text-blue-200 transition-colors drop-shadow-sm"
                >
                  S&apos;inscrire
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  )
}
