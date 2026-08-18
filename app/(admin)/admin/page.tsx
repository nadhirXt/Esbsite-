import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Upload, Link2, FileText, Users, ArrowRight, Shield } from 'lucide-react'

import AdminWelcomeBanner from '@/components/admin/AdminWelcomeBanner'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: docCount }, { count: linkCount }, { count: studentCount }] = await Promise.all([
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('useful_links').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
  ])

  const stats = [
    { label: 'Documents uploadés', value: docCount ?? 0, icon: FileText, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { label: 'Liens utiles', value: linkCount ?? 0, icon: Link2, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
    { label: 'Étudiants inscrits', value: studentCount ?? 0, icon: Users, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  ]

  const actions = [
    { href: '/admin/documents', label: 'Gérer les documents', desc: 'Rechercher, visualiser et supprimer les documents', icon: FileText },
    { href: '/admin/liens',  label: 'Gérer les liens utiles',  desc: 'Ajouter ou supprimer des liens de ressources',   icon: Link2 },
    { href: '/admin/etudiants', label: 'Annuaire des étudiants', desc: 'Consulter la liste de tous les étudiants inscrits', icon: Users },
    { href: '/admin/users', label: 'Gestion des Membres', desc: 'Gérer les rôles, les accès et les délégués', icon: Shield },
  ]

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <AdminWelcomeBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Vue d'ensemble</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-4 shadow-inner`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white mb-1">{s.value}</p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* Actions */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Actions Rapides</h2>
          <div className="space-y-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{action.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{action.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
