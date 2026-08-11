import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Upload, Link2, FileText, Users, ArrowRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: docCount }, { count: linkCount }] = await Promise.all([
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('useful_links').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Documents uploadés', value: docCount ?? 0, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Liens utiles', value: linkCount ?? 0, icon: Link2, color: 'bg-amber-50 text-amber-600' },
  ]

  const actions = [
    { href: '/admin/upload', label: 'Uploader des documents', desc: 'Ajouter des PDF et documents pour les étudiants', icon: Upload },
    { href: '/admin/liens',  label: 'Gérer les liens utiles',  desc: 'Ajouter ou supprimer des liens de ressources',   icon: Link2 },
  ]

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Tableau de bord Admin</h1>
        <p className="text-[#64748B] text-sm mt-1">Gérez le contenu de la plateforme ESB Hub.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{s.value}</p>
            <p className="text-sm text-[#64748B] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#EFF6FF] text-[#1E3A8A] rounded-xl flex items-center justify-center">
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{action.label}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{action.desc}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1E3A8A] transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
