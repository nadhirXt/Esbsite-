import { createClient } from '@/lib/supabase/server'
import { BookOpen, Link2, FileText, GraduationCap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CYCLES } from '@/lib/utils'
import { ensureProfile } from '@/lib/ensure-profile'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = await ensureProfile(supabase, user!)

  const { data: recentDocs } = await supabase
    .from('documents')
    .select('*')
    .eq('cycle', profile?.cycle || '')
    .order('created_at', { ascending: false })
    .limit(4)

  const cycleBadge = profile?.cycle ? CYCLES[profile.cycle as keyof typeof CYCLES] : null
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Welcome header */}
      <div className="mb-8">
        <p className="text-sm text-[#64748B] mb-1">{greeting},</p>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          {profile?.full_name || 'Étudiant(e)'}
        </h1>
        {cycleBadge && (
          <span className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cycleBadge.color}`}>
            {cycleBadge.label}
          </span>
        )}
      </div>

      {/* Quick access cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { href: `/dashboard/${profile?.cycle || 'licence'}`, label: 'Mes cours', icon: BookOpen, color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { href: '/dashboard/ressources', label: 'Liens utiles', icon: Link2, color: 'bg-amber-50 text-amber-700 border-amber-100' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-[#0F172A]">{card.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1E3A8A] transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0F172A]">Documents récents</h2>
          <Link
            href={`/dashboard/${profile?.cycle || 'licence'}`}
            className="text-xs font-medium text-[#1E3A8A] hover:underline"
          >
            Voir tout
          </Link>
        </div>

        {recentDocs && recentDocs.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 hover:shadow-sm hover:border-[#1E3A8A] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{doc.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{doc.category || 'Document'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed border-[#E2E8F0]">
            <GraduationCap className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#64748B]">Aucun document disponible pour le moment.</p>
            <p className="text-xs text-[#94A3B8] mt-1">Les documents seront ajoutés par votre administration.</p>
          </div>
        )}
      </div>
    </div>
  )
}
