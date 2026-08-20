'use client'

import { FileText, TrendingUp, ArrowRight, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatDate, CYCLES } from '@/lib/utils'
import { getPresignedDownloadUrl } from '@/app/actions/storage'
import { useTrackReading } from './useTrackReading'

interface Document {
  id: string
  title: string
  file_path: string
  thumbnail_path?: string | null
  cycle: string
  category: string
  created_at: string
}

interface PopularDocumentsProps {
  documents: Document[]
}

export default function PopularDocuments({ documents }: PopularDocumentsProps) {
  if (documents.length === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#A16207]" />
          <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">Documents récents</h2>
        </div>
        <Link
          href="/dashboard/bibliotheque"
          className="text-xs text-[#64748B] dark:text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors flex items-center gap-1"
        >
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {documents.slice(0, 6).map((doc) => (
          <PopularDocCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  )
}

function PopularDocCard({ doc }: { doc: Document }) {
  const [isLoading, setIsLoading] = useState(false)
  const cycleBadge = CYCLES[doc.cycle as keyof typeof CYCLES]
  const { trackView } = useTrackReading(doc.id)

  const handleView = async () => {
    if (isLoading) return
    setIsLoading(true)
    trackView() // ← Analytics
    try {
      const pData = await getPresignedDownloadUrl(doc.file_path, false)
      if (pData?.url) {
        const ext = doc.file_path.split('.').pop()?.toLowerCase()
        const officeExts = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']
        if (officeExts.includes(ext || '')) {
          window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(pData.url)}`, '_blank')
        } else {
          window.open(pData.url, '_blank')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="group flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 hover:shadow-md hover:border-blue-400/50 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0F172A] dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={doc.title}>
            {doc.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {cycleBadge && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cycleBadge.color}`}>
                {cycleBadge.label}
              </span>
            )}
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(doc.created_at)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleView}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs font-semibold disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
        Voir
      </button>
    </div>
  )
}
