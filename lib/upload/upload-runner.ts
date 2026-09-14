import { getPresignedUploadUrlsBatch } from '@/app/actions/storage'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/types'
import type { SmartFileItem } from '@/lib/upload/smart-upload'

export interface UploadRunnerCallbacks {
  onItemProgress: (id: string, percent: number) => void
  onItemStatus: (id: string, status: 'queued' | 'uploading' | 'completed' | 'error', errorMsg?: string) => void
  onItemSuccess: (doc: Document) => void
  onComplete?: () => void
}

export interface UploadContext {
  cycle: string
  year: number | null
  isNoYearCycle: boolean
  uploaderId?: string | null
}

/**
 * Exécute un pool de tâches avec un maximum de concurrence donné
 */
async function runConcurrent<T>(tasks: (() => Promise<T>)[], concurrency = 3): Promise<T[]> {
  const results: T[] = []
  let currentIndex = 0

  async function worker(): Promise<void> {
    while (currentIndex < tasks.length) {
      const taskIndex = currentIndex++
      try {
        const res = await tasks[taskIndex]()
        results[taskIndex] = res
      } catch (err) {
        console.error(`Error in task ${taskIndex}:`, err)
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  await Promise.all(workers)
  return results
}

/**
 * Lance l'upload haute performance avec URLs présignées en batch et 3 workers parallèles
 */
export async function executeParallelUpload(
  items: SmartFileItem[],
  context: UploadContext,
  callbacks: UploadRunnerCallbacks
): Promise<void> {
  if (items.length === 0) return

  const supabase = createClient()

  // 1. Initialiser tous les items au statut 'queued'
  items.forEach(item => {
    callbacks.onItemStatus(item.id, 'queued')
    callbacks.onItemProgress(item.id, 0)
  })

  // 2. Préparer les chemins S3 sécurisés
  const itemPaths = new Map<string, string>()
  const batchRequests = items.map(item => {
    const safeFileName = item.file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
    const filePath = context.isNoYearCycle
      ? `${context.cycle}/${Date.now()}_${safeFileName}`
      : `${context.cycle}/A${context.year}/${Date.now()}_${safeFileName}`

    itemPaths.set(item.id, filePath)

    return {
      id: item.id,
      filePath,
      contentType: item.file.type || 'application/octet-stream'
    }
  })

  // 3. Obtenir toutes les URLs présignées en 1 seul aller-retour serveur
  const { results: presignedResults, error: batchError } = await getPresignedUploadUrlsBatch(batchRequests)
  if (batchError || !presignedResults) {
    console.error('Batch URL generation failed:', batchError)
    items.forEach(item => {
      callbacks.onItemStatus(item.id, 'error', batchError || "Impossible de générer les liens d'upload.")
    })
    callbacks.onComplete?.()
    return
  }

  const urlMap = new Map<string, string>()
  presignedResults.forEach(r => {
    if (r.url) urlMap.set(r.id, r.url)
    else callbacks.onItemStatus(r.id, 'error', r.error || "Type de fichier non autorisé")
  })

  // 4. Définir les tâches d'upload XHR
  const uploadTasks = items.map(item => async () => {
    const uploadUrl = urlMap.get(item.id)
    const filePath = itemPaths.get(item.id)

    if (!uploadUrl || !filePath) {
      callbacks.onItemStatus(item.id, 'error', "Lien d'upload manquant")
      return
    }

    callbacks.onItemStatus(item.id, 'uploading')

    try {
      // Transfert direct vers Backblaze B2 avec suivi temps réel
      const uploadSuccess = await new Promise<boolean>((resolve) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl, true)
        xhr.setRequestHeader('Content-Type', item.file.type || 'application/octet-stream')

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            callbacks.onItemProgress(item.id, percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(true)
          } else {
            console.error('XHR Upload Failed:', xhr.status, xhr.responseText)
            resolve(false)
          }
        }

        xhr.onerror = () => {
          console.error('XHR Network Error')
          resolve(false)
        }

        xhr.send(item.file)
      })

      if (!uploadSuccess) {
        callbacks.onItemStatus(item.id, 'error', "Échec du transfert vers le stockage")
        return
      }

      // Enregistrement dans Supabase
      const titleToSave = item.isConflict && item.conflictAction === 'rename'
        ? item.suggestedNewTitle
        : item.cleanTitle

      if (item.isConflict && item.conflictAction === 'replace' && item.existingDoc) {
        // Remplacer le document existant
        const { data: updatedDoc, error: updateError } = await supabase
          .from('documents')
          .update({
            title: titleToSave,
            file_path: filePath,
            created_at: new Date().toISOString()
          })
          .eq('id', item.existingDoc.id)
          .select()
          .single()

        if (updateError || !updatedDoc) {
          console.error('Supabase update error:', updateError)
          callbacks.onItemStatus(item.id, 'error', "Échec de mise à jour de la base de données")
          return
        }

        callbacks.onItemProgress(item.id, 100)
        callbacks.onItemStatus(item.id, 'completed')
        callbacks.onItemSuccess(updatedDoc)
      } else {
        // Nouveau document
        const insertData: any = {
          title: titleToSave,
          file_path: filePath,
          cycle: context.cycle,
          category: item.targetCategory || 'Général'
        }

        if (!context.isNoYearCycle && context.year !== null) {
          insertData.year = context.year
        }

        if (context.uploaderId) {
          insertData.uploader_id = context.uploaderId
        }

        const { data: insertedDoc, error: insertError } = await supabase
          .from('documents')
          .insert(insertData)
          .select()
          .single()

        if (insertError || !insertedDoc) {
          console.error('Supabase insert error:', insertError)
          callbacks.onItemStatus(item.id, 'error', "Échec de l'enregistrement en base")
          return
        }

        callbacks.onItemProgress(item.id, 100)
        callbacks.onItemStatus(item.id, 'completed')
        callbacks.onItemSuccess(insertedDoc)
      }
    } catch (err: any) {
      console.error('Error during upload execution:', err)
      callbacks.onItemStatus(item.id, 'error', err.message || "Erreur inattendue")
    }
  })

  // 5. Exécution parallèle avec 3 workers
  await runConcurrent(uploadTasks, 3)
  callbacks.onComplete?.()
}

