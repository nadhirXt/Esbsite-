import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { b2 } from '@/lib/b2'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import mime from 'mime-types'

const BUCKET_NAME = process.env.B2_BUCKET_NAME || 'esb-documents-prod'

export async function handleDocumentStream(
  req: NextRequest,
  paramsPromise: Promise<{ id: string; slug?: string[] }>
) {
  try {
    const { id } = await paramsPromise
    if (!id) {
      return NextResponse.json({ error: 'Identifiant de document manquant' }, { status: 400 })
    }

    // 1. Recherche du document en base via supabaseAdmin (contourne RLS côté serveur de confiance)
    let { data: doc } = await supabaseAdmin
      .from('documents')
      .select('id, title, file_path, cycle, category, year')
      .eq('id', id)
      .maybeSingle()

    if (!doc) {
      const { data: docByPath } = await supabaseAdmin
        .from('documents')
        .select('id, title, file_path, cycle, category, year')
        .eq('file_path', id)
        .maybeSingle()
      doc = docByPath
    }

    if (!doc || !doc.file_path || doc.file_path === '.keep') {
      return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
    }

    // 2. Contrôle de sécurité et permissions
    const isPublicCycle = doc.cycle === 'concours'
    if (!isPublicCycle) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const accept = req.headers.get('accept') || ''
        if (accept.includes('text/html')) {
          const loginUrl = new URL('/login', req.url)
          loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
          return NextResponse.redirect(loginUrl)
        }
        return NextResponse.json(
          { error: 'Non authentifié. Veuillez vous connecter pour accéder à ce document.' },
          { status: 401 }
        )
      }

      // Vérifier accès mémoires si le document est dans le cycle memoires
      if (doc.cycle === 'memoires' || doc.file_path.startsWith('memoires/')) {
        const { data: access } = await supabaseAdmin
          .from('memoires_access')
          .select('status')
          .eq('user_id', user.id)
          .single()
        
        if (!access || access.status !== 'unlocked') {
          return NextResponse.json(
            { error: 'Accès non autorisé aux mémoires. Veuillez compléter le processus de déverrouillage.' },
            { status: 403 }
          )
        }
      }
    }

    // 3. Récupération du flux depuis Backblaze B2
    const rangeHeader = req.headers.get('range') || undefined
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: doc.file_path,
      Range: rangeHeader,
    })

    const s3Res = await b2.send(command)
    if (!s3Res.Body) {
      return NextResponse.json({ error: 'Fichier vide ou inaccessible' }, { status: 502 })
    }

    // 4. Conversion en Web ReadableStream
    let webStream: ReadableStream<Uint8Array>
    if (typeof (s3Res.Body as any).transformToWebStream === 'function') {
      webStream = (s3Res.Body as any).transformToWebStream()
    } else {
      webStream = Readable.toWeb(s3Res.Body as Readable) as ReadableStream<Uint8Array>
    }

    // 5. En-têtes HTTP de streaming et sécurité
    const status = s3Res.$metadata.httpStatusCode || (rangeHeader ? 206 : 200)
    const headers = new Headers()

    const ext = doc.file_path.split('.').pop()?.toLowerCase() || 'pdf'
    const contentType = s3Res.ContentType || (mime.lookup(ext) as string) || 'application/pdf'
    headers.set('Content-Type', contentType)

    if (s3Res.ContentLength !== undefined) {
      headers.set('Content-Length', s3Res.ContentLength.toString())
    }

    if (s3Res.ContentRange) {
      headers.set('Content-Range', s3Res.ContentRange)
    }

    headers.set('Accept-Ranges', 'bytes')

    // Détermination du nom de fichier propre
    const isDownload = req.nextUrl.searchParams.get('download') === '1' || req.nextUrl.searchParams.get('download') === 'true'
    const safeTitle = (doc.title?.trim() || doc.file_path.split('/').pop() || 'document')
      .replace(/[/\\?%*:|"<>]/g, '_')
    const fullFilename = safeTitle.toLowerCase().endsWith(`.${ext}`) ? safeTitle : `${safeTitle}.${ext}`
    
    // Pour éviter TypeError: Invalid character in header content
    const asciiFilename = fullFilename.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "_")
    const encodedFilename = encodeURIComponent(fullFilename)

    headers.set(
      'Content-Disposition',
      `${isDownload ? 'attachment' : 'inline'}; filename="${asciiFilename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`
    )

    // En-têtes de sécurité et compatibilité mobile
    headers.set('Cache-Control', 'private, max-age=3600, stale-while-revalidate=86400')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'SAMEORIGIN')
    headers.set('Content-Security-Policy', "default-src 'self'; object-src 'self' blob: data:; frame-src 'self' blob: data:; style-src 'self' 'unsafe-inline';")

    return new Response(webStream, {
      status,
      headers,
    })
  } catch (err: any) {
    console.error('Document stream error:', err)
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'Fichier physique introuvable sur le stockage' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur lors de la diffusion du document' }, { status: 500 })
  }
}

