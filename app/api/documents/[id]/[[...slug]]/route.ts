import { NextRequest } from 'next/server'
import { handleDocumentStream } from '@/lib/document-stream'

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string; slug?: string[] }> }
) {
  return handleDocumentStream(req, props.params)
}

