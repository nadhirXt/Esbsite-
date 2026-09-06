'use server'

import { b2 } from '@/lib/b2'
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectVersionsCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'


const BUCKET_NAME = process.env.B2_BUCKET_NAME || 'esb-documents-prod'

// Helper: Vérification de session et permissions
async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { supabase, user: null, profile: null, isAdmin: false, isDelegate: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_delegate, delegate_cycle, delegate_year')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const isDelegate = Boolean(profile?.is_delegate)

  return { supabase, user, profile, isAdmin, isDelegate }
}

function revalidateDocumentPaths() {
  revalidatePath('/admin/documents')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/delegate')
  revalidatePath('/dashboard/licence')
  revalidatePath('/dashboard/master')
  revalidatePath('/dashboard/dseb')
  revalidatePath('/dashboard/memoires')
  revalidatePath('/dashboard/bibliotheque')
  revalidatePath('/dashboard/ressources')
  revalidatePath('/dashboard/annales')
  revalidatePath('/')
}


/**
 * Nettoie une clé S3 (retire les éventuels ../ ou barres obliques en double)
 */
function sanitizeS3Key(key: string): string {
  return key
    .replace(/\\/g, '/')
    .replace(/\.{2,}\//g, '')
    .replace(/^\/+/, '')
    .trim()
}

/**
 * Génère une URL présignée pour l'upload sur Backblaze B2
 */
export async function getPresignedUploadUrl(filePath: string, contentType: string) {
  try {
    const { user, profile, isAdmin, isDelegate } = await getAuthContext()
    if (!user || (!isAdmin && !isDelegate)) {
      return { url: null, error: 'Non autorisé à uploader des fichiers' }
    }

    const safeKey = sanitizeS3Key(filePath)
    if (!safeKey || safeKey === '.keep') {
      return { url: null, error: 'Chemin de fichier invalide' }
    }

    // Restrict delegates to their own cycle/year path
    if (!isAdmin && isDelegate) {
      const expectedPrefix = `${profile?.delegate_cycle}/A${profile?.delegate_year}/`
      if (!safeKey.startsWith(expectedPrefix)) {
        return { url: null, error: 'Vous ne pouvez uploader que dans votre cycle/année' }
      }
    }

    // Validate file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp']
    const ext = '.' + safeKey.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      return { url: null, error: 'Type de fichier non autorisé' }
    }

    // Validate content type
    const allowedMimeTypes = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg', 'image/png', 'image/webp'
    ]
    if (!allowedMimeTypes.includes(contentType)) {
      return { url: null, error: 'Type MIME non autorisé' }
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: safeKey,
      ContentType: contentType || 'application/octet-stream',
    })
    
    // URL valide pendant 1 heure (3600s)
    const signedUrl = await getSignedUrl(b2, command, { expiresIn: 3600 })
    return { url: signedUrl, error: null }
  } catch (error: any) {
    console.error('Error generating presigned upload url:', error)
    return { url: null, error: "Erreur lors de la génération du lien d'upload" }
  }
}

/**
 * Génère une URL présignée pour le téléchargement / la visualisation
 */
export async function getPresignedDownloadUrl(filePath: string, download: boolean = false) {
  try {
    const { user } = await getAuthContext()
    if (!user) {
      return { url: null, error: 'Non authentifié' }
    }

    const safeKey = sanitizeS3Key(filePath)
    if (!safeKey || safeKey === '.keep') {
      return { url: null, error: 'Fichier introuvable' }
    }

    // Block access to memoires files unless user has unlocked access
    if (safeKey.startsWith('memoires/')) {
      const supabase = (await import('@/lib/supabase/admin')).supabaseAdmin
      const { data: access } = await supabase
        .from('memoires_access')
        .select('status')
        .eq('user_id', user.id)
        .single()
      
      if (!access || access.status !== 'unlocked') {
        return { url: null, error: 'Accès non autorisé aux mémoires' }
      }
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: safeKey,
      ResponseContentDisposition: download ? 'attachment' : 'inline',
    })
    
    const signedUrl = await getSignedUrl(b2, command, { expiresIn: 3600 })
    return { url: signedUrl, error: null }
  } catch (error: any) {
    console.error('Error generating presigned download url:', error)
    return { url: null, error: 'Erreur lors de la génération du lien de téléchargement' }
  }
}

/**
 * Génère une URL présignée publique pour les documents de concours (Master & DSEB)
 * Permet aux candidats et visiteurs de consulter/télécharger en libre accès sans login
 */
export async function getPublicConcoursDownloadUrl(filePath: string, download: boolean = false) {
  try {
    const safeKey = sanitizeS3Key(filePath)
    if (!safeKey || safeKey === '.keep' || !safeKey.startsWith('concours/')) {
      return { url: null, error: 'Accès non autorisé ou fichier introuvable' }
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: safeKey,
      ResponseContentDisposition: download ? 'attachment' : 'inline',
    })
    
    const signedUrl = await getSignedUrl(b2, command, { expiresIn: 3600 })
    return { url: signedUrl, error: null }
  } catch (error: any) {
    console.error('Error generating public concours download url:', error)
    return { url: null, error: 'Erreur lors de la génération du lien de téléchargement' }
  }
}

/**
 * Supprime un fichier individuel directement et définitivement sur Backblaze B2 (incluant toutes ses versions)
 */
async function deleteStorageFile(filePath: string) {
  return deleteStorageFiles([filePath])
}

/**
 * Supprime définitivement une liste de fichiers sur Backblaze B2
 * Purge toutes les versions et tous les delete markers pour qu'aucun résidu ne reste dans le bucket.
 */
async function deleteStorageFiles(filePaths: string[]) {
  try {
    const { user, isAdmin, isDelegate } = await getAuthContext()
    if (!user || (!isAdmin && !isDelegate)) {
      return { error: 'Action non autorisée' }
    }

    // Filtrer les clés valides (ignorer .keep et chaînes vides)
    const validKeys = Array.from(
      new Set(
        filePaths
          .map(p => sanitizeS3Key(p))
          .filter(p => p && p !== '.keep')
      )
    )

    if (validKeys.length === 0) {
      return { error: null }
    }

    // Pour chaque clé, rechercher toutes ses versions et delete markers pour une suppression totale
    const objectsToPurge: { Key: string; VersionId?: string }[] = []

    for (const key of validKeys) {
      try {
        const versionsRes = await b2.send(new ListObjectVersionsCommand({
          Bucket: BUCKET_NAME,
          Prefix: key
        }))

        const matchingVersions = (versionsRes.Versions || []).filter(v => v.Key === key)
        const matchingMarkers = (versionsRes.DeleteMarkers || []).filter(dm => dm.Key === key)

        if (matchingVersions.length > 0 || matchingMarkers.length > 0) {
          matchingVersions.forEach(v => {
            if (v.Key) objectsToPurge.push({ Key: v.Key, VersionId: v.VersionId })
          })
          matchingMarkers.forEach(dm => {
            if (dm.Key) objectsToPurge.push({ Key: dm.Key, VersionId: dm.VersionId })
          })
        } else {
          objectsToPurge.push({ Key: key })
        }
      } catch (listErr) {
        console.warn(`Could not list versions for key ${key}:`, listErr)
        objectsToPurge.push({ Key: key })
      }
    }

    // Traiter par lots de 1000 (limite maximale S3 DeleteObjects)
    const CHUNK_SIZE = 1000
    for (let i = 0; i < objectsToPurge.length; i += CHUNK_SIZE) {
      const chunk = objectsToPurge.slice(i, i + CHUNK_SIZE)
      const command = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: chunk,
          Quiet: true,
        },
      })
      await b2.send(command)
    }

    return { error: null }
  } catch (error: any) {
    console.error('Error permanently deleting B2 files batch:', error)
    return { error: 'Erreur lors de la suppression définitive sur Backblaze B2' }
  }
}


/**
 * Action complète : Supprime un document de Backblaze B2 (fichier + miniature) ET de la base Supabase
 */
export async function deleteDocumentAction(documentId: string) {
  try {
    const { supabase, user, isAdmin, isDelegate, profile } = await getAuthContext()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    // 1. Récupérer le document en base
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      return { error: 'Document non trouvé' }
    }

    // 2. Vérifier les autorisations
    if (!isAdmin) {
      const isOwner = doc.uploader_id === user.id
      const isCycleDelegate = isDelegate && profile?.delegate_cycle === doc.cycle && profile?.delegate_year === doc.year
      if (!isOwner && !isCycleDelegate) {
        return { error: 'Vous n\'avez pas les permissions pour supprimer ce document' }
      }
    }

    // 3. Supprimer le fichier et la miniature sur Backblaze B2
    const keysToDelete: string[] = []
    if (doc.file_path && doc.file_path !== '.keep') {
      keysToDelete.push(doc.file_path)
    }
    if (doc.thumbnail_path && doc.thumbnail_path !== '.keep') {
      keysToDelete.push(doc.thumbnail_path)
    }

    if (keysToDelete.length > 0) {
      await deleteStorageFiles(keysToDelete)
    }

    // 4. Supprimer de la base Supabase
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (dbError) {
      console.error('Error deleting document from DB:', dbError)
      return { error: 'Erreur lors de la suppression en base de données' }
    }

    revalidateDocumentPaths()

    return { error: null, success: true }
  } catch (error: any) {
    console.error('deleteDocumentAction error:', error)
    return { error: error.message || 'Erreur inattendue lors de la suppression' }
  }
}

/**
 * Action complète : Supprime un dossier et TOUT son contenu récursivement (fichiers B2, miniatures B2 et DB)
 */
export async function deleteFolderAction(params: {
  cycle: string
  year: number | null
  folderPath: string
}) {
  try {
    const { cycle, year, folderPath } = params
    const { supabase, user, isAdmin, isDelegate, profile } = await getAuthContext()
    
    if (!user) {
      return { error: 'Non authentifié' }
    }

    if (!isAdmin) {
      const isCycleDelegate = isDelegate && profile?.delegate_cycle === cycle && profile?.delegate_year === year
      if (!isCycleDelegate) {
        return { error: 'Vous n\'avez pas les permissions pour supprimer ce dossier' }
      }
    }

    // 1. Récupérer tous les documents du dossier et des sous-dossiers
    let query = supabase
      .from('documents')
      .select('id, file_path, thumbnail_path, category')
      .eq('cycle', cycle)

    if (year !== null && year !== undefined) {
      query = query.eq('year', year)
    }

    const { data: docs, error: queryError } = await query

    if (queryError) {
      return { error: 'Erreur lors de la recherche des fichiers du dossier' }
    }

    const cleanFolder = folderPath.trim()
    const matchingDocs = (docs || []).filter(doc => 
      doc.category === cleanFolder || doc.category?.startsWith(`${cleanFolder}/`)
    )

    if (matchingDocs.length === 0) {
      return { error: null, success: true, count: 0 }
    }

    // 2. Collecter tous les chemins B2 (fichiers réels + miniatures)
    const pathsToDelete: string[] = []
    const idsToDelete: string[] = []

    matchingDocs.forEach(d => {
      idsToDelete.push(d.id)
      if (d.file_path && d.file_path !== '.keep') {
        pathsToDelete.push(d.file_path)
      }
      if (d.thumbnail_path && d.thumbnail_path !== '.keep') {
        pathsToDelete.push(d.thumbnail_path)
      }
    })

    // 3. Supprimer de Backblaze B2
    if (pathsToDelete.length > 0) {
      await deleteStorageFiles(pathsToDelete)
    }

    // 4. Supprimer de Supabase
    if (idsToDelete.length > 0) {
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .in('id', idsToDelete)

      if (dbError) {
        console.error('Error deleting folder documents from DB:', dbError)
        return { error: 'Erreur lors de la suppression des documents en base' }
      }
    }

    revalidateDocumentPaths()

    return { error: null, success: true, count: matchingDocs.length }
  } catch (error: any) {
    console.error('deleteFolderAction error:', error)
    return { error: error.message || 'Erreur lors de la suppression du dossier' }
  }
}

/**
 * Action de déplacement (Move) d'un document individuel avec gestion des conflits
 */
export async function moveDocumentAction(params: {
  documentId: string
  targetCycle: string
  targetYear: number | null
  targetCategory: string
  conflictStrategy?: 'replace' | 'rename' | 'skip'
  newTitle?: string
}) {
  try {
    const { documentId, targetCycle, targetYear, targetCategory, conflictStrategy, newTitle } = params
    const { supabase, user, isAdmin, isDelegate, profile } = await getAuthContext()

    if (!user) {
      return { error: 'Non authentifié' }
    }

    if (conflictStrategy === 'skip') {
      return { error: null, success: true, skipped: true }
    }

    // Récupérer le document
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      return { error: 'Document introuvable' }
    }

    // Vérifier les droits
    if (!isAdmin) {
      const isCycleDelegate = isDelegate && 
        profile?.delegate_cycle === doc.cycle && 
        profile?.delegate_year === doc.year &&
        profile?.delegate_cycle === targetCycle &&
        profile?.delegate_year === targetYear
      
      if (!isCycleDelegate) {
        return { error: 'Permissions insuffisantes pour déplacer ce document' }
      }
    }

    const cleanCategory = targetCategory.trim() || 'Général'
    const finalTitle = newTitle?.trim() || doc.title

    // Si stratégie 'replace' : supprimer l'ancien document portant ce nom dans la destination
    if (conflictStrategy === 'replace') {
      let conflictQuery = supabase
        .from('documents')
        .select('id, file_path, thumbnail_path')
        .eq('cycle', targetCycle)
        .eq('category', cleanCategory)
        .eq('title', finalTitle)
        .neq('id', documentId)

      if (targetYear !== null && targetYear !== undefined) {
        conflictQuery = conflictQuery.eq('year', targetYear)
      }

      const { data: duplicateDocs } = await conflictQuery
      if (duplicateDocs && duplicateDocs.length > 0) {
        for (const dup of duplicateDocs) {
          const keysToDelete = []
          if (dup.file_path && dup.file_path !== '.keep') keysToDelete.push(dup.file_path)
          if (dup.thumbnail_path && dup.thumbnail_path !== '.keep') keysToDelete.push(dup.thumbnail_path)
          if (keysToDelete.length > 0) {
            await deleteStorageFiles(keysToDelete)
          }
          await supabase.from('documents').delete().eq('id', dup.id)
        }
      }
    }

    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update({
        title: finalTitle,
        cycle: targetCycle,
        year: targetYear,
        category: cleanCategory,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error moving document in DB:', updateError)
      return { error: 'Erreur lors de l\'enregistrement du déplacement' }
    }

    revalidateDocumentPaths()

    return { error: null, success: true, doc: updatedDoc }
  } catch (error: any) {
    console.error('moveDocumentAction error:', error)
    return { error: error.message || 'Erreur lors du déplacement' }
  }
}


/**
 * Action de déplacement (Move) d'un dossier complet et de tous ses sous-éléments
 */
export async function moveFolderAction(params: {
  sourceCycle: string
  sourceYear: number | null
  sourceFolderPath: string
  targetCycle: string
  targetYear: number | null
  targetCategory: string
}) {
  try {
    const { sourceCycle, sourceYear, sourceFolderPath, targetCycle, targetYear, targetCategory } = params
    const { supabase, user, isAdmin, isDelegate, profile } = await getAuthContext()

    if (!user) {
      return { error: 'Non authentifié' }
    }

    if (!isAdmin) {
      const isCycleDelegate = isDelegate && 
        profile?.delegate_cycle === sourceCycle && 
        profile?.delegate_year === sourceYear &&
        profile?.delegate_cycle === targetCycle &&
        profile?.delegate_year === targetYear
      
      if (!isCycleDelegate) {
        return { error: 'Permissions insuffisantes pour déplacer ce dossier' }
      }
    }

    const sourcePath = sourceFolderPath.trim()
    const folderBaseName = sourcePath.split('/').pop() || sourcePath
    const cleanTargetCat = targetCategory.trim()
    
    const newPrefix = (!cleanTargetCat || cleanTargetCat === 'Général')
      ? folderBaseName
      : `${cleanTargetCat}/${folderBaseName}`

    // Récupérer tous les documents du dossier source
    let query = supabase
      .from('documents')
      .select('*')
      .eq('cycle', sourceCycle)

    if (sourceYear !== null && sourceYear !== undefined) {
      query = query.eq('year', sourceYear)
    }

    const { data: docs, error: queryError } = await query
    if (queryError) {
      return { error: 'Erreur lors de la récupération des éléments à déplacer' }
    }

    const matchingDocs = (docs || []).filter(doc => 
      doc.category === sourcePath || doc.category?.startsWith(`${sourcePath}/`)
    )

    if (matchingDocs.length === 0) {
      const { data: keepDoc } = await supabase
        .from('documents')
        .insert({
          title: '.keep',
          file_path: '.keep',
          cycle: targetCycle,
          year: targetYear,
          category: newPrefix,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      revalidateDocumentPaths()

      return { error: null, success: true, count: 1, docs: keepDoc ? [keepDoc] : [] }
    }


    const now = new Date().toISOString()
    const updatedDocs = []

    for (const doc of matchingDocs) {
      const updatedCategory = doc.category === sourcePath
        ? newPrefix
        : (doc.category?.startsWith(`${sourcePath}/`) 
            ? doc.category.replace(`${sourcePath}/`, `${newPrefix}/`) 
            : newPrefix)

      const { data: updated, error: updateError } = await supabase
        .from('documents')
        .update({
          cycle: targetCycle,
          year: targetYear,
          category: updatedCategory,
          updated_at: now
        })
        .eq('id', doc.id)
        .select()
        .single()

      if (updateError) {
        console.error(`Error updating document ${doc.id}:`, updateError)
      } else if (updated) {
        updatedDocs.push(updated)
      }
    }

    revalidateDocumentPaths()

    return { error: null, success: true, count: updatedDocs.length, docs: updatedDocs }
  } catch (error: any) {
    console.error('moveFolderAction error:', error)
    return { error: error.message || 'Erreur lors du déplacement du dossier' }
  }
}

/**
 * Action de suppression par lot (fichiers multiples + dossiers multiples)
 */
export async function deleteBatchAction(params: {
  documentIds: string[]
  folders: { cycle: string; year: number | null; folderPath: string }[]
}) {
  try {
    const { documentIds, folders } = params
    const { supabase, user, isAdmin, isDelegate, profile } = await getAuthContext()

    if (!user) {
      return { error: 'Non authentifié' }
    }

    const allPathsToDelete: string[] = []
    const allIdsToDelete: string[] = []

    // 1. Fichiers individuels
    if (documentIds.length > 0) {
      const { data: docs } = await supabase
        .from('documents')
        .select('id, cycle, year, file_path, thumbnail_path')
        .in('id', documentIds)

      for (const doc of docs || []) {
        if (!isAdmin) {
          const isOwnerOrDelegate = isDelegate && profile?.delegate_cycle === doc.cycle && profile?.delegate_year === doc.year
          if (!isOwnerOrDelegate) continue
        }
        allIdsToDelete.push(doc.id)
        if (doc.file_path && doc.file_path !== '.keep') allPathsToDelete.push(doc.file_path)
        if (doc.thumbnail_path && doc.thumbnail_path !== '.keep') allPathsToDelete.push(doc.thumbnail_path)
      }
    }

    // 2. Dossiers
    for (const f of folders) {
      if (!isAdmin) {
        const isOwnerOrDelegate = isDelegate && profile?.delegate_cycle === f.cycle && profile?.delegate_year === f.year
        if (!isOwnerOrDelegate) continue
      }

      let query = supabase.from('documents').select('id, file_path, thumbnail_path, category').eq('cycle', f.cycle)
      if (f.year !== null && f.year !== undefined) {
        query = query.eq('year', f.year)
      }

      const { data: folderDocs } = await query
      const matching = (folderDocs || []).filter(d => d.category === f.folderPath || d.category?.startsWith(`${f.folderPath}/`))
      for (const d of matching) {
        allIdsToDelete.push(d.id)
        if (d.file_path && d.file_path !== '.keep') allPathsToDelete.push(d.file_path)
        if (d.thumbnail_path && d.thumbnail_path !== '.keep') allPathsToDelete.push(d.thumbnail_path)
      }
    }

    // 3. Supprimer de Backblaze B2
    if (allPathsToDelete.length > 0) {
      await deleteStorageFiles(allPathsToDelete)
    }

    // 4. Supprimer de Supabase
    const uniqueIds = Array.from(new Set(allIdsToDelete))
    if (uniqueIds.length > 0) {
      await supabase.from('documents').delete().in('id', uniqueIds)
    }

    revalidateDocumentPaths()

    return { error: null, success: true, count: uniqueIds.length }
  } catch (error: any) {
    console.error('deleteBatchAction error:', error)
    return { error: error.message || 'Erreur lors de la suppression groupée' }
  }
}

/**
 * Action de déplacement par lot (fichiers multiples + dossiers multiples)
 */
export async function moveBatchAction(params: {
  documentIds: string[]
  folders: { sourceCycle: string; sourceYear: number | null; folderPath: string }[]
  targetCycle: string
  targetYear: number | null
  targetCategory: string
}) {
  try {
    const { documentIds, folders, targetCycle, targetYear, targetCategory } = params
    const { supabase, user, isAdmin, isDelegate, profile } = await getAuthContext()

    if (!user) {
      return { error: 'Non authentifié' }
    }

    const cleanTargetCat = targetCategory.trim() || 'Général'
    const now = new Date().toISOString()
    const allUpdatedDocs: any[] = []

    // 1. Déplacer les fichiers individuels
    if (documentIds.length > 0) {
      for (const docId of documentIds) {
        const { data: doc } = await supabase.from('documents').select('*').eq('id', docId).single()
        if (!doc) continue

        if (!isAdmin) {
          const isAllowed = isDelegate && profile?.delegate_cycle === doc.cycle && profile?.delegate_year === doc.year && profile?.delegate_cycle === targetCycle && profile?.delegate_year === targetYear
          if (!isAllowed) continue
        }

        const { data: updated } = await supabase
          .from('documents')
          .update({
            cycle: targetCycle,
            year: targetYear,
            category: cleanTargetCat,
            updated_at: now
          })
          .eq('id', docId)
          .select()
          .single()

        if (updated) allUpdatedDocs.push(updated)
      }
    }

    // 2. Déplacer les dossiers
    for (const f of folders) {
      const res = await moveFolderAction({
        sourceCycle: f.sourceCycle,
        sourceYear: f.sourceYear,
        sourceFolderPath: f.folderPath,
        targetCycle,
        targetYear,
        targetCategory: cleanTargetCat
      })
      if (res.docs) {
        allUpdatedDocs.push(...res.docs)
      }
    }

    revalidateDocumentPaths()

    return { error: null, success: true, count: allUpdatedDocs.length, docs: allUpdatedDocs }
  } catch (error: any) {
    console.error('moveBatchAction error:', error)
    return { error: error.message || 'Erreur lors du déplacement groupé' }
  }
}


