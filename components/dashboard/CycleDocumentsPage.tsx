import { createClient } from '@/lib/supabase/server'
import { FileText, Download, FolderOpen } from 'lucide-react'
import { formatDate, CYCLES } from '@/lib/utils'

interface DocPageProps {
  cycle: string
  cycleLabel: string
}

export async function CycleDocumentsPage({ cycle, cycleLabel }: DocPageProps) {
  const supabase = await createClient()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('cycle', cycle)
    .order('category', { ascending: true })
    .order('created_at', { ascending: false })

  // Group by category
  const grouped = (documents || []).reduce((acc, doc) => {
    const cat = doc.category || 'Général'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(doc)
    return acc
  }, {} as Record<string, typeof documents>)

  const cycleBadge = CYCLES[cycle as keyof typeof CYCLES]

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-8">
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mb-3 ${cycleBadge?.color}`}>
          {cycleBadge?.label}
        </span>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Cours — {cycleLabel}
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          {(documents || []).length} document{(documents || []).length > 1 ? 's' : ''} disponible{(documents || []).length > 1 ? 's' : ''}
        </p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <FolderOpen className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B] font-medium">Aucun document disponible</p>
          <p className="text-xs text-[#94A3B8] mt-1">Les documents seront ajoutés par votre administration.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, docs]) => (
            <div key={category}>
              <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-[#E2E8F0]" />
                {category}
                <div className="h-px flex-1 bg-[#E2E8F0]" />
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {(docs as any[]).map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} supabase={supabase} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function DocumentCard({ doc, supabase }: { doc: any; supabase: any }) {
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.file_path, 3600)

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 hover:shadow-md hover:border-[#1E3A8A]/30 transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0F172A] truncate">{doc.title}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{formatDate(doc.created_at)}</p>
      </div>
      {data?.signedUrl && (
        <a
          href={data.signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-2 rounded-lg text-[#94A3B8] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] transition-all duration-150"
          aria-label={`Télécharger ${doc.title}`}
        >
          <Download className="w-4 h-4" />
        </a>
      )}
    </div>
  )
}
