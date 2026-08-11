import { createClient } from '@/lib/supabase/server'
import { ExternalLink, Link2 } from 'lucide-react'

export default async function RessourcesPage() {
  const supabase = await createClient()

  const { data: links } = await supabase
    .from('useful_links')
    .select('*')
    .order('category', { ascending: true })
    .order('created_at', { ascending: false })

  const grouped = (links || []).reduce((acc, link) => {
    const cat = link.category || 'Général'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(link)
    return acc
  }, {} as Record<string, typeof links>)

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Liens utiles & Ressources</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Ressources, outils et liens recommandés par l&apos;administration ESB.
        </p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <Link2 className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B] font-medium">Aucun lien disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catLinks]) => (
            <div key={category}>
              <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                {category}
              </h2>
              <div className="space-y-2">
                {(catLinks as any[]).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-5 py-3.5 hover:shadow-sm hover:border-[#1E3A8A]/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Link2 className="w-4 h-4 text-[#1E3A8A]" />
                      <span className="text-sm font-medium text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors">
                        {link.title}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#1E3A8A] transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
