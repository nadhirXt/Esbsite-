import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface DriveBrowserEntry {
  id: string
  name: string
  mimeType: string
  size?: number
  isFolder: boolean
  modifiedTime?: string
}

export async function POST(req: NextRequest) {
  try {
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

    const { accessToken, folderId = 'root', searchQuery = '' } = await req.json()
    if (!accessToken) {
      return NextResponse.json({ error: 'Jeton Google Drive manquant' }, { status: 400 })
    }

    let q = 'trashed = false'
    if (searchQuery.trim()) {
      const escaped = searchQuery.trim().replace(/'/g, "\\'")
      q += ` and name contains '${escaped}'`
    } else {
      q += ` and '${folderId}' in parents`
    }

    const url =
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}` +
      `&fields=${encodeURIComponent('files(id,name,mimeType,size,modifiedTime)')}` +
      `&orderBy=${encodeURIComponent('folder,name')}` +
      `&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json(
        { error: 'TOKEN_EXPIRED', message: 'Session Google Drive expirée, veuillez vous reconnecter.' },
        { status: 401 }
      )
    }

    if (!res.ok) {
      const errText = await res.text()
      console.error('Google Drive browse error:', errText)
      return NextResponse.json(
        { error: 'Impossible de lister les fichiers Google Drive. Vérifiez que Google Drive API est activée dans Google Cloud.' },
        { status: 500 }
      )
    }

    const data = await res.json()
    const entries: DriveBrowserEntry[] = (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size ? Number(f.size) : undefined,
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
      modifiedTime: f.modifiedTime,
    }))

    return NextResponse.json({ entries })
  } catch (error: any) {
    console.error('Browse Drive API exception:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
