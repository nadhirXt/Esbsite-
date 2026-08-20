'use client'

import { useEffect, useRef } from 'react'
import { logDocumentView, logDownload } from '@/lib/study-api'

/**
 * Hook de tracking léger — log une vue quand le document est "lu".
 * Adapte: Vue (open), téléchargement.
 */
export function useTrackReading(documentId?: string) {
  const lastLogged = useRef<string | null>(null)

  const trackView = () => {
    if (!documentId || lastLogged.current === documentId) return
    lastLogged.current = documentId
    logDocumentView(documentId)
  }

  const trackDownload = () => {
    if (!documentId) return
    logDownload(documentId)
    // Une vue de téléchargement compte comme lecture
    trackView()
  }

  return { trackView, trackDownload }
}