import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Shield, Building2, BookOpen, Settings } from 'lucide-react'
import { CYCLES } from '@/lib/utils'
import { ensureProfile } from '@/lib/ensure-profile'

export const metadata = {
  title: 'Mon Profil | ESB Hub',
}

const USER_TYPES_MAP: Record<string, string> = {
  'etudiant_esb': 'Étudiant à l\'ESB',
  'autre_etudiant': 'Étudiant d\'une autre école',
  'professeur': 'Professeur',
  'ancien': 'Ancien ESBiste',
  'metier': 'Professionnel',
}

const ROLES_MAP: Record<string, string> = {
  'admin': 'Administrateur',
  'student': 'Utilisateur',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await ensureProfile(supabase, user)

  if (!profile) {
    return <div>Profil introuvable. Veuillez vous reconnecter ou contacter l&apos;administration.</div>
  }

  const cycleBadge = profile.cycle ? CYCLES[profile.cycle as keyof typeof CYCLES] : null
  const userTypeLabel = profile.user_type ? USER_TYPES_MAP[profile.user_type] : 'Non spécifié'
  const roleLabel = profile.role ? ROLES_MAP[profile.role] : 'Utilisateur'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#A16207]" /> Mon Profil
        </h1>
        <p className="text-slate-500 mt-1">Consultez les informations relatives à votre compte.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 rounded-full bg-[#1E3A8A] flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-white">
              {(profile.full_name || user.email || '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{profile.full_name || 'Utilisateur'}</h2>
            <p className="text-slate-500">{user.email}</p>
            {profile.role === 'admin' && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                <Shield className="w-3 h-3" /> Administrateur
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Informations personnelles */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Informations</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Nom complet</p>
                  <p className="font-medium text-slate-800">{profile.full_name}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Adresse e-mail</p>
                  <p className="font-medium text-slate-800">{user.email}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Rôle système</p>
                  <p className="font-medium text-slate-800">{roleLabel}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Statut Académique / Professionnel */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Statut & Établissement</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Profil</p>
                  <p className="font-medium text-slate-800">{userTypeLabel}</p>
                </div>
              </li>
              
              {profile.institution_name && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Établissement</p>
                    <p className="font-medium text-slate-800">{profile.institution_name}</p>
                  </div>
                </li>
              )}

              {profile.cycle && cycleBadge && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cycle de formation</p>
                    <p className="font-medium text-slate-800">{cycleBadge.label}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
