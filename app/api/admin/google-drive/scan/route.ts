import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface ScannedDriveFile {
  driveId: string
  name: string
  mimeType: string
  size?: number
  relativePath: string // ex: "Sous-dossier/Cours.pdf" ou "Cours.pdf"
  isGoogleWorkspaceDoc?: boolean
  exportMimeType?: string
  exportExtension?: string
}

/**
 * Extrait le type (file | folder | doc | sheet | slide) et l'identifiant Google Drive depuis une URL ou un ID brut
 */
function parseGoogleDriveInput(raw: string): { id: string; kind: 'file' | 'folder' | 'doc' | 'sheet' | 'slide' | 'unknown' } | null {
  const input = raw.trim()
  if (!input) return null

  // Dossier: https://drive.google.com/drive/folders/1a2b3c... ou /drive/u/0/folders/1a2b3c...
  const folderMatch = input.match(/\/folders\/([a-zA-Z0-9_-]{10,})/)
  if (folderMatch) {
    return { id: folderMatch[1], kind: 'folder' }
  }

  // Google Docs / Sheets / Slides
  const docMatch = input.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]{10,})/)
  if (docMatch) return { id: docMatch[1], kind: 'doc' }

  const sheetMatch = input.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]{10,})/)
  if (sheetMatch) return { id: sheetMatch[1], kind: 'sheet' }

  const slideMatch = input.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]{10,})/)
  if (slideMatch) return { id: slideMatch[1], kind: 'slide' }

  // Fichier: https://drive.google.com/file/d/1a2b3c.../view
  const fileMatch = input.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/)
  if (fileMatch) {
    return { id: fileMatch[1], kind: 'file' }
  }

  // Paramètre ?id=1a2b3c...
  const idParamMatch = input.match(/[?&]id=([a-zA-Z0-9_-]{10,})/)
  if (idParamMatch) {
    return { id: idParamMatch[1], kind: 'unknown' }
  }

  // ID brut
  if (/^[a-zA-Z0-9_-]{15,}$/.test(input)) {
    return { id: input, kind: 'unknown' }
  }

  return null
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

/**
 * Convertit un type MIME Google Workspace en extension / MIME exportable
 */
function resolveWorkspaceExport(mimeType: string, currentName: string): {
  name: string
  mimeType: string
  isGoogleWorkspaceDoc: boolean
  exportMimeType?: string
  exportExtension?: string
} {
  if (mimeType === 'application/vnd.google-apps.document') {
    const hasExt = currentName.toLowerCase().endsWith('.pdf')
    return {
      name: hasExt ? currentName : `${currentName}.pdf`,
      mimeType: 'application/pdf',
      isGoogleWorkspaceDoc: true,
      exportMimeType: 'application/pdf',
      exportExtension: '.pdf',
    }
  }
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const hasExt = currentName.toLowerCase().endsWith('.xlsx')
    return {
      name: hasExt ? currentName : `${currentName}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      isGoogleWorkspaceDoc: true,
      exportMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      exportExtension: '.xlsx',
    }
  }
  if (mimeType === 'application/vnd.google-apps.presentation') {
    const hasExt = currentName.toLowerCase().endsWith('.pdf')
    return {
      name: hasExt ? currentName : `${currentName}.pdf`,
      mimeType: 'application/pdf',
      isGoogleWorkspaceDoc: true,
      exportMimeType: 'application/pdf',
      exportExtension: '.pdf',
    }
  }
  return {
    name: currentName,
    mimeType,
    isGoogleWorkspaceDoc: false,
  }
}

/**
 * Récupère les métadonnées d'un fichier public sans clé API en inspectant les en-têtes / page publique
 */
async function probePublicDriveFile(
  driveId: string,
  knownKind: 'file' | 'doc' | 'sheet' | 'slide' | 'unknown',
  parentPath = ''
): Promise<ScannedDriveFile | null> {
  try {
    const pageUrl =
      knownKind === 'doc'
        ? `https://docs.google.com/document/d/${driveId}/edit`
        : knownKind === 'sheet'
        ? `https://docs.google.com/spreadsheets/d/${driveId}/edit`
        : knownKind === 'slide'
        ? `https://docs.google.com/presentation/d/${driveId}/edit`
        : `https://drive.google.com/file/d/${driveId}/view`

    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
      redirect: 'follow',
    })

    if (!res.ok) return null
    const html = await res.text()

    // Extraire le titre depuis <meta property="og:title" content="..."> ou <title>
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i)

    let rawName = ogTitleMatch?.[1] || titleTagMatch?.[1] || `Document_${driveId.slice(0, 6)}.pdf`
    rawName = decodeHtmlEntities(rawName)
      .replace(/\s*-\s*Google\s+(Drive|Docs|Sheets|Slides|Disque).*$/i, '')
      .trim()

    if (!rawName || rawName.toLowerCase() === 'google drive' || rawName.toLowerCase().includes('sign in')) {
      return null
    }

    if (knownKind === 'doc') {
      const name = rawName.toLowerCase().endsWith('.pdf') ? rawName : `${rawName}.pdf`
      return {
        driveId,
        name,
        mimeType: 'application/pdf',
        relativePath: parentPath ? `${parentPath}/${name}` : name,
        isGoogleWorkspaceDoc: true,
        exportMimeType: 'application/pdf',
        exportExtension: '.pdf',
      }
    }
    if (knownKind === 'sheet') {
      const name = rawName.toLowerCase().endsWith('.xlsx') ? rawName : `${rawName}.xlsx`
      return {
        driveId,
        name,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        relativePath: parentPath ? `${parentPath}/${name}` : name,
        isGoogleWorkspaceDoc: true,
        exportMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        exportExtension: '.xlsx',
      }
    }
    if (knownKind === 'slide') {
      const name = rawName.toLowerCase().endsWith('.pdf') ? rawName : `${rawName}.pdf`
      return {
        driveId,
        name,
        mimeType: 'application/pdf',
        relativePath: parentPath ? `${parentPath}/${name}` : name,
        isGoogleWorkspaceDoc: true,
        exportMimeType: 'application/pdf',
        exportExtension: '.pdf',
      }
    }

    // Assurer une extension par défaut si absente
    const hasExtension = /\.[a-z0-9]{2,5}$/i.test(rawName)
    const finalName = hasExtension ? rawName : `${rawName}.pdf`
    const ext = finalName.split('.').pop()?.toLowerCase() || 'pdf'

    const mimeByExt: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      zip: 'application/zip',
      rar: 'application/vnd.rar',
      txt: 'text/plain',
      csv: 'text/csv',
    }

    return {
      driveId,
      name: finalName,
      mimeType: mimeByExt[ext] || 'application/pdf',
      relativePath: parentPath ? `${parentPath}/${finalName}` : finalName,
    }
  } catch (err) {
    console.error('probePublicDriveFile error:', err)
    return null
  }
}

/**
 * Parcourt récursivement un dossier public Google Drive via embeddedfolderview (sans clé API requise !)
 */
async function scanPublicDriveFolder(
  folderId: string,
  parentPath = '',
  depth = 0
): Promise<ScannedDriveFile[]> {
  if (depth > 4) return [] // Limite de sécurité anti-boucle
  try {
    const embedUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
    })
    if (!res.ok) return []

    const html = await res.text()
    const results: ScannedDriveFile[] = []

    // Extraire chaque entrée <div class="flip-entry" id="entry-ID"> ... <div class="flip-entry-title">TITLE</div>
    const entryRegex = /id=["']entry-([a-zA-Z0-9_-]+)["'][\s\S]*?<a\s+href=["']([^"']+)["'][\s\S]*?<div\s+class=["']flip-entry-title["']>([^<]+)<\/div>/gi
    let match: RegExpExecArray | null
    const subFolders: { id: string; name: string }[] = []

    while ((match = entryRegex.exec(html)) !== null) {
      const entryId = match[1]
      const href = match[2]
      const rawTitle = decodeHtmlEntities(match[3].trim())

      if (href.includes('/folders/') || href.includes('embeddedfolderview')) {
        subFolders.push({ id: entryId, name: rawTitle })
      } else {
        const isDoc = href.includes('docs.google.com/document')
        const isSheet = href.includes('docs.google.com/spreadsheets')
        const isSlide = href.includes('docs.google.com/presentation')

        let finalName = rawTitle
        let mimeType = 'application/pdf'
        let isGoogleWorkspaceDoc = false
        let exportMimeType: string | undefined
        let exportExtension: string | undefined

        if (isDoc) {
          if (!finalName.toLowerCase().endsWith('.pdf')) finalName += '.pdf'
          isGoogleWorkspaceDoc = true
          exportMimeType = 'application/pdf'
          exportExtension = '.pdf'
        } else if (isSheet) {
          if (!finalName.toLowerCase().endsWith('.xlsx')) finalName += '.xlsx'
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          isGoogleWorkspaceDoc = true
          exportMimeType = mimeType
          exportExtension = '.xlsx'
        } else if (isSlide) {
          if (!finalName.toLowerCase().endsWith('.pdf')) finalName += '.pdf'
          isGoogleWorkspaceDoc = true
          exportMimeType = 'application/pdf'
          exportExtension = '.pdf'
        } else {
          if (!/\.[a-z0-9]{2,5}$/i.test(finalName)) {
            finalName += '.pdf'
          }
          const ext = finalName.split('.').pop()?.toLowerCase() || 'pdf'
          const mimeByExt: Record<string, string> = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            webp: 'image/webp',
            zip: 'application/zip',
            rar: 'application/vnd.rar',
            txt: 'text/plain',
            csv: 'text/csv',
          }
          mimeType = mimeByExt[ext] || 'application/pdf'
        }

        results.push({
          driveId: entryId,
          name: finalName,
          mimeType,
          relativePath: parentPath ? `${parentPath}/${finalName}` : finalName,
          isGoogleWorkspaceDoc,
          exportMimeType,
          exportExtension,
        })
      }
    }

    // Parcourir récursivement les sous-dossiers
    for (const sub of subFolders) {
      const nextPath = parentPath ? `${parentPath}/${sub.name}` : sub.name
      const subFiles = await scanPublicDriveFolder(sub.id, nextPath, depth + 1)
      results.push(...subFiles)
    }

    return results
  } catch (err) {
    console.error('scanPublicDriveFolder error:', err)
    return []
  }
}

/**
 * Parcourt récursivement via l'API officielle Google Drive v3 (avec OAuth token ou API Key)
 */
async function scanFolderViaDriveApi(
  folderId: string,
  auth: { accessToken?: string; apiKey?: string },
  parentPath = '',
  depth = 0
): Promise<ScannedDriveFile[]> {
  if (depth > 5) return []
  const headers: Record<string, string> = {}
  if (auth.accessToken) {
    headers['Authorization'] = `Bearer ${auth.accessToken}`
  }

  const keyParam = !auth.accessToken && auth.apiKey ? `&key=${encodeURIComponent(auth.apiKey)}` : ''
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
  const fields = encodeURIComponent('files(id,name,mimeType,size)')
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=500&supportsAllDrives=true&includeItemsFromAllDrives=true${keyParam}`

  const res = await fetch(url, { headers })
  if (!res.ok) return []

  const data = await res.json()
  const files: any[] = data.files || []
  const results: ScannedDriveFile[] = []

  for (const f of files) {
    if (f.mimeType === 'application/vnd.google-apps.folder') {
      const nextPath = parentPath ? `${parentPath}/${f.name}` : f.name
      const subResults = await scanFolderViaDriveApi(f.id, auth, nextPath, depth + 1)
      results.push(...subResults)
    } else {
      const exported = resolveWorkspaceExport(f.mimeType, f.name)
      results.push({
        driveId: f.id,
        name: exported.name,
        mimeType: exported.mimeType,
        size: f.size ? Number(f.size) : undefined,
        relativePath: parentPath ? `${parentPath}/${exported.name}` : exported.name,
        isGoogleWorkspaceDoc: exported.isGoogleWorkspaceDoc,
        exportMimeType: exported.exportMimeType,
        exportExtension: exported.exportExtension,
      })
    }
  }

  return results
}

export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier que l'appelant est Admin ou Délégué
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_delegate')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && !profile.is_delegate)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const { urls = [], pickerItems = [], accessToken, apiKey } = body as {
      urls?: string[]
      pickerItems?: { id: string; name: string; mimeType: string; sizeBytes?: number }[]
      accessToken?: string
      apiKey?: string
    }

    const effectiveApiKey = apiKey || process.env.GOOGLE_DRIVE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    const scannedFiles: ScannedDriveFile[] = []

    // Cas A : Éléments sélectionnés depuis Google Picker
    for (const item of pickerItems) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        let folderFiles = await scanFolderViaDriveApi(
          item.id,
          { accessToken, apiKey: effectiveApiKey },
          item.name
        )
        if (folderFiles.length === 0) {
          folderFiles = await scanPublicDriveFolder(item.id, item.name)
        }
        scannedFiles.push(...folderFiles)
      } else {
        const exported = resolveWorkspaceExport(item.mimeType, item.name)
        scannedFiles.push({
          driveId: item.id,
          name: exported.name,
          mimeType: exported.mimeType,
          size: item.sizeBytes,
          relativePath: exported.name,
          isGoogleWorkspaceDoc: exported.isGoogleWorkspaceDoc,
          exportMimeType: exported.exportMimeType,
          exportExtension: exported.exportExtension,
        })
      }
    }

    // Cas B : Liens Google Drive collés par l'Admin
    for (const rawUrl of urls) {
      const parsed = parseGoogleDriveInput(rawUrl)
      if (!parsed) continue

      if (parsed.kind === 'folder') {
        let folderFiles: ScannedDriveFile[] = []
        if (accessToken || effectiveApiKey) {
          folderFiles = await scanFolderViaDriveApi(parsed.id, { accessToken, apiKey: effectiveApiKey })
        }
        if (folderFiles.length === 0) {
          folderFiles = await scanPublicDriveFolder(parsed.id)
        }
        scannedFiles.push(...folderFiles)
      } else {
        // Fichier individuel ou ID inconnu
        let resolved: ScannedDriveFile | null = null

        if (accessToken || effectiveApiKey) {
          const headers: Record<string, string> = {}
          if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
          const keyParam = !accessToken && effectiveApiKey ? `&key=${encodeURIComponent(effectiveApiKey)}` : ''
          const metaRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(parsed.id)}?fields=id,name,mimeType,size&supportsAllDrives=true${keyParam}`,
            { headers }
          )
          if (metaRes.ok) {
            const meta = await metaRes.json()
            if (meta.mimeType === 'application/vnd.google-apps.folder') {
              const sub = await scanFolderViaDriveApi(parsed.id, { accessToken, apiKey: effectiveApiKey })
              scannedFiles.push(...sub)
              continue
            }
            const exported = resolveWorkspaceExport(meta.mimeType, meta.name)
            resolved = {
              driveId: meta.id,
              name: exported.name,
              mimeType: exported.mimeType,
              size: meta.size ? Number(meta.size) : undefined,
              relativePath: exported.name,
              isGoogleWorkspaceDoc: exported.isGoogleWorkspaceDoc,
              exportMimeType: exported.exportMimeType,
              exportExtension: exported.exportExtension,
            }
          }
        }

        if (!resolved) {
          // Essayer comme fichier public
          resolved = await probePublicDriveFile(parsed.id, parsed.kind)
          // Si inconnu et non résolu en fichier, tester comme dossier public
          if (!resolved && parsed.kind === 'unknown') {
            const folderFiles = await scanPublicDriveFolder(parsed.id)
            if (folderFiles.length > 0) {
              scannedFiles.push(...folderFiles)
              continue
            }
          }
        }

        if (resolved) {
          scannedFiles.push(resolved)
        }
      }
    }

    // Dédupliquer par driveId + relativePath
    const uniqueMap = new Map<string, ScannedDriveFile>()
    for (const f of scannedFiles) {
      uniqueMap.set(`${f.driveId}:${f.relativePath}`, f)
    }

    const finalFiles = Array.from(uniqueMap.values())

    if (finalFiles.length === 0) {
      return NextResponse.json(
        {
          error:
            "Aucun fichier accessible trouvé. Vérifiez que le lien Google Drive est partagé en mode « Tous les utilisateurs disposant du lien » ou utilisez l'onglet Google Picker.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ files: finalFiles })
  } catch (error: any) {
    console.error('Google Drive scan error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l’analyse du lien Google Drive' },
      { status: 500 }
    )
  }
}

