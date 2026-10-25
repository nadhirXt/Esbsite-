
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { b2 } from '@/lib/b2'
import { PutObjectCommand } from '@aws-sdk/client-s3'

const BUCKET_NAME = process.env.B2_BUCKET_NAME || 'esb-documents-prod'

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.jpg', '.jpeg', '.png', '.webp', '.zip', '.rar', '.txt', '.csv'
]

/**
 * Télécharge un fichier depuis Google Drive côté serveur (avec support OAuth, API Key, Google Docs Export et gros fichiers confirm=t)
 */
async function downloadFromGoogleDrive(params: {
  driveId: string
  isGoogleWorkspaceDoc?: boolean
  exportMimeType?: string
  exportExtension?: string
  accessToken?: string
  apiKey?: string
}): Promise<{ buffer: Buffer; contentType: string }> {
  const { driveId, isGoogleWorkspaceDoc, exportMimeType, exportExtension, accessToken, apiKey } = params
  const effectiveApiKey =
    apiKey ||
    process.env.GOOGLE_DRIVE_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
    'AIzaSyA9P9BJJJWkCwHGLQHa3EGn0ECm0tRWjRU'

  // 1. Si jeton OAuth ou API Key disponible, tenter l'API Drive v3 directe
  if (accessToken || effectiveApiKey) {
    const headers: Record<string, string> = {}
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
    const keyParam = !accessToken && effectiveApiKey ? `&key=${encodeURIComponent(effectiveApiKey)}` : ''

    const apiUrl = isGoogleWorkspaceDoc
      ? `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(driveId)}/export?mimeType=${encodeURIComponent(exportMimeType || 'application/pdf')}${keyParam}`
      : `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(driveId)}?alt=media&supportsAllDrives=true${keyParam}`

    const apiRes = await fetch(apiUrl, { headers })
    if (apiRes.ok) {
      const arrayBuf = await apiRes.arrayBuffer()
      const ct = apiRes.headers.get('content-type') || exportMimeType || 'application/pdf'
      return { buffer: Buffer.from(arrayBuf), contentType: ct }
    }
  }

  // 2. Téléchargement public direct (sans OAuth)
  let publicUrl: string
  if (isGoogleWorkspaceDoc) {
    if (exportExtension === '.xlsx') {
      publicUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(driveId)}/export?format=xlsx`
    } else {
      // Fonctionne pour Google Docs et Google Slides
      publicUrl = `https://docs.google.com/document/d/${encodeURIComponent(driveId)}/export?format=pdf`
    }
  } else {
    // Endpoint direct Google Drive avec confirm=t pour éviter l'écran d'avertissement antivirus sur les gros fichiers
    publicUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t`
  }

  let res = await fetch(publicUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
    },
    redirect: 'follow',
  })

  // Fallback pour Google Slides public si /document/d/ renvoie 404
  if (!res.ok && isGoogleWorkspaceDoc && exportExtension !== '.xlsx') {
    res = await fetch(`https://docs.google.com/presentation/d/${encodeURIComponent(driveId)}/export/pdf`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
      redirect: 'follow',
    })
  }

  if (!res.ok) {
    throw new Error(`Impossible de télécharger le fichier Google Drive (HTTP ${res.status})`)
  }

  const contentType = res.headers.get('content-type') || 'application/pdf'

  // Si Google renvoie une page HTML de confirmation au lieu du binaire, extraire l'URL du formulaire
  if (contentType.includes('text/html') && !isGoogleWorkspaceDoc) {
    const html = await res.text()
    const uuidMatch = html.match(/name=["']uuid["']\s+value=["']([^"']+)["']/i)
    if (uuidMatch) {
      const confirmUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t&uuid=${encodeURIComponent(uuidMatch[1])}`
      const retryRes = await fetch(confirmUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        },
        redirect: 'follow',
      })
      if (retryRes.ok && !(retryRes.headers.get('content-type') || '').includes('text/html')) {
        const buf = Buffer.from(await retryRes.arrayBuffer())
        return { buffer: buf, contentType: retryRes.headers.get('content-type') || 'application/pdf' }
      }
    }
    throw new Error('Ce fichier Google Drive est privé. Partagez-le en mode « Tous les utilisateurs disposant du lien » ou connectez-vous via Google Picker.')
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  return { buffer, contentType }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification et vérification des droits Admin / Délégué
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_delegate, delegate_cycle, delegate_year')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isDelegate = Boolean(profile?.is_delegate)

    if (!isAdmin && !isDelegate) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const {
      driveId,
      fileName,
      title,
      cycle,
      year,
      category,
      conflictAction,
      existingDocId,
      isGoogleWorkspaceDoc,
      exportMimeType,
      exportExtension,
      accessToken,
      apiKey,
    } = body as {
      driveId: string
      fileName: string
      title: string
      cycle: string
      year: number | null
      category: string
      conflictAction?: 'replace' | 'rename' | 'skip'
      existingDocId?: string
      isGoogleWorkspaceDoc?: boolean
      exportMimeType?: string
      exportExtension?: string
      accessToken?: string
      apiKey?: string
    }

    if (!driveId || !fileName || !cycle) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Restriction de périmètre pour les délégués
    if (!isAdmin && isDelegate) {
      if (profile?.delegate_cycle !== cycle || Number(profile?.delegate_year) !== Number(year)) {
        return NextResponse.json({ error: 'Périmètre cycle/année non autorisé' }, { status: 403 })
      }
    }

    // 2. Valider l'extension du fichier
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_')
    const ext = '.' + (safeFileName.split('.').pop()?.toLowerCase() || 'pdf')
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: `Extension non autorisée (${ext})` }, { status: 400 })
    }

    const isNoYearCycle = cycle === 'memoires' || cycle === 'bibliotheque' || cycle === 'concours'
    const s3Key = isNoYearCycle
      ? `${cycle}/${Date.now()}_${safeFileName}`
      : `${cycle}/A${year}/${Date.now()}_${safeFileName}`

    // 3. Télécharger le binaire depuis Google Drive côté serveur
    const { buffer, contentType } = await downloadFromGoogleDrive({
      driveId,
      isGoogleWorkspaceDoc,
      exportMimeType,
      exportExtension,
      accessToken,
      apiKey,
    })

    // 4. Envoyer directement vers Backblaze B2
    await b2.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType || 'application/pdf',
      })
    )

    // 5. Enregistrer ou mettre à jour dans Supabase
    const cleanCategory = (category || 'Général').trim()
    const cleanTitle = (title || fileName).trim()

    if (conflictAction === 'replace' && existingDocId) {
      const { data: updatedDoc, error: updateError } = await supabaseAdmin
        .from('documents')
        .update({
          title: cleanTitle,
          file_path: s3Key,
          created_at: new Date().toISOString(),
        })
        .eq('id', existingDocId)
        .select()
        .single()

      if (updateError || !updatedDoc) {
        throw new Error(updateError?.message || 'Erreur lors du remplacement en base')
      }

      return NextResponse.json({ document: updatedDoc })
    }

    const insertData: Record<string, any> = {
      title: cleanTitle,
      file_path: s3Key,
      cycle,
      category: cleanCategory,
      uploader_id: user.id,
    }

    if (!isNoYearCycle && year !== null && year !== undefined) {
      insertData.year = year
    }

    const { data: insertedDoc, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert(insertData)
      .select()
      .single()

    if (insertError || !insertedDoc) {
      throw new Error(insertError?.message || "Erreur lors de l'enregistrement en base")
    }

    return NextResponse.json({ document: insertedDoc })
  } catch (error: any) {
    console.error('Google Drive import error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors du transfert Google Drive → B2' },
      { status: 500 }
    )
  }
}

