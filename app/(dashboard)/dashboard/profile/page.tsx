import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Shield, Building2, BookOpen, Settings, Calendar, Hash, Clock, CheckCircle2 } from 'lucide-react'

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
)
import { CYCLES, formatDate } from '@/lib/utils'
import { ensureProfile } from '@/lib/ensure-profile'
import ProfileEditButton from './ProfileEditButton'

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

function InfoItem({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string | React.ReactNode, color?: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${color || 'bg-slate-50 border-slate-100'}`}>
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="font-medium text-slate-800 truncate">{value || <span className="text-slate-400 italic">Non renseigné</span>}</div>
      </div>
    </li>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await ensureProfile(supabase, user)

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Profil introuvable</h2>
        <p className="text-slate-500 text-sm">Veuillez vous déconnecter et vous reconnecter, ou contactez l&apos;administration.</p>
      </div>
    )
  }

  const cycleBadge = profile.cycle ? CYCLES[profile.cycle as keyof typeof CYCLES] : null
  const userTypeLabel = profile.user_type ? USER_TYPES_MAP[profile.user_type] : null
  const roleLabel = profile.role ? ROLES_MAP[profile.role] : 'Utilisateur'
  const isEmailConfirmed = !!user.email_confirmed_at
  const createdAt = profile.created_at ? formatDate(profile.created_at) : (user.created_at ? formatDate(user.created_at) : 'Inconnue')
  const lastSignIn = user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Première connexion'

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#A16207]" /> Mon Profil
        </h1>
        <p className="text-slate-500 mt-1">Toutes les informations relatives à votre compte.</p>
      </div>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-3xl font-bold text-white">
              {(profile.full_name || user.email || '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-800">{profile.full_name || 'Utilisateur'}</h2>
            <p className="text-slate-500">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {profile.role === 'admin' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  <Shield className="w-3 h-3" /> Administrateur
                </span>
              )}
              {cycleBadge && (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cycleBadge.color}`}>
                  {cycleBadge.label}
                </span>
              )}
              {isEmailConfirmed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="w-3 h-3" /> Email vérifié
                </span>
              )}
            </div>
          </div>
          
          <div className="ml-auto mt-4 sm:mt-0 flex-shrink-0">
            <ProfileEditButton 
              initialName={profile.full_name || ''} 
              initialLinkedin={profile.linkedin_url || ''} 
            />
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Informations personnelles</h3>
          <ul className="space-y-5">
            <InfoItem icon={User} label="Nom complet" value={profile.full_name} />
            <InfoItem icon={Mail} label="Adresse e-mail" value={user.email} />
            <InfoItem icon={LinkedinIcon} label="Profil LinkedIn" value={
              profile.linkedin_url ? (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:underline flex items-center gap-1">
                  Voir le profil LinkedIn
                </a>
              ) : null
            } />
            <InfoItem icon={Shield} label="Rôle système" value={
              <span className={profile.role === 'admin' ? 'text-amber-700 font-semibold' : ''}>
                {roleLabel}
              </span>
            } />
            <InfoItem icon={Hash} label="Identifiant utilisateur" value={
              <span className="text-xs font-mono text-slate-500">{user.id.substring(0, 8)}...{user.id.substring(user.id.length - 4)}</span>
            } />
          </ul>
        </div>

        {/* Statut académique */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Statut &amp; Formation</h3>
          <ul className="space-y-5">
            <InfoItem icon={User} label="Type de profil" value={userTypeLabel} />
            <InfoItem icon={Building2} label="Établissement" value={
              profile.institution_name || (profile.user_type === 'etudiant_esb' || profile.user_type === 'ancien' ? 'ESB — École Supérieure de Banque' : null)
            } />
            <InfoItem icon={BookOpen} label="Cycle de formation" value={cycleBadge ? (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cycleBadge.color}`}>
                {cycleBadge.label}
              </span>
            ) : null} />
          </ul>
        </div>

        {/* Informations du compte */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Informations du compte</h3>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Membre depuis</p>
                <p className="font-medium text-slate-800 text-sm">{createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Dernière connexion</p>
                <p className="font-medium text-slate-800 text-sm">{lastSignIn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: isEmailConfirmed ? '#f0fdf4' : '#fef2f2',
                  borderColor: isEmailConfirmed ? '#bbf7d0' : '#fecaca'
                }}
              >
                <Mail className="w-4 h-4" style={{ color: isEmailConfirmed ? '#16a34a' : '#dc2626' }} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Statut email</p>
                <p className={`font-medium text-sm ${isEmailConfirmed ? 'text-green-700' : 'text-red-600'}`}>
                  {isEmailConfirmed ? 'Vérifié' : 'Non vérifié'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
