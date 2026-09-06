import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Upload, Link2, FileText, Users, ArrowRight, Shield } from 'lucide-react'

import AdminWelcomeBanner from '@/components/admin/AdminWelcomeBanner'
import AdminAnalyticsPrototype from '@/components/admin/AdminAnalyticsPrototype'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: docCount }, { count: linkCount }, { count: studentCount }] = await Promise.all([
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('useful_links').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
  ])

  const stats = [
    { label: 'Documents uploadés', value: docCount ?? 0, icon: FileText, color: 'bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' },
    { label: 'Liens utiles', value: linkCount ?? 0, icon: Link2, color: 'bg-amber-500/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
    { label: 'Étudiants inscrits', value: studentCount ?? 0, icon: Users, color: 'bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
  ]

  const actions = [
    { href: '/admin/documents', label: 'Gérer les documents', desc: 'Rechercher, visualiser et supprimer les documents', icon: FileText },
    { href: '/admin/liens',  label: 'Gérer les liens utiles',  desc: 'Ajouter ou supprimer des liens de ressources',   icon: Link2 },
    { href: '/admin/etudiants', label: 'Annuaire des étudiants', desc: 'Consulter la liste de tous les étudiants inscrits', icon: Users },
    { href: '/admin/users', label: 'Gestion des Membres', desc: 'Gérer les rôles, les accès et les délégués', icon: Shield },
  ]

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <AdminWelcomeBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans tracking-wide uppercase text-xs">Vue d'ensemble // Métriques Clés</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="group relative overflow-hidden bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 p-6 shadow-sm hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
                  <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mb-1 tracking-tight">{s.value}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NOUVEAU : Analytics Prototype */}
          <AdminAnalyticsPrototype />
        </div>

        <div>
          {/* Actions */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans tracking-wide uppercase text-xs">Commandes // Actions Rapides</h2>
          </div>
          <div className="space-y-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#070D19]/80 backdrop-blur-md p-4 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-400 transition-all duration-300 shadow-sm">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">{action.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{action.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
