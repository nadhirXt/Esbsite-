'use server'

import { b2 } from '@/lib/b2'
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const BUCKET_NAME = process.env.B2_BUCKET_NAME || 'esb-documents'

export async function getPresignedUploadUrl(filePath: string, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      ContentType: contentType,
    })
    
    // URL valide pendant 1 heure
    const signedUrl = await getSignedUrl(b2, command, { expiresIn: 3600 })
    return { url: signedUrl, error: null }
  } catch (error) {
    console.error('Error generating presigned upload url', error)
    return { url: null, error: "Erreur lors de la génération du lien d'upload" }
  }
}

export async function getPresignedDownloadUrl(filePath: string, download: boolean = false) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      ResponseContentDisposition: download ? 'attachment' : 'inline',
    })
    
    // URL valide pendant 1 heure
    const signedUrl = await getSignedUrl(b2, command, { expiresIn: 3600 })
    return { url: signedUrl, error: null }
  } catch (error) {
    console.error('Error generating presigned download url', error)
    return { url: null, error: 'Erreur lors de la génération du lien de téléchargement' }
  }
}

export async function deleteStorageFile(filePath: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    })
    
    await b2.send(command)
    return { error: null }
  } catch (error) {
    console.error('Error deleting B2 file', error)
    return { error: 'Erreur lors de la suppression du fichier' }
  }
}

export async function deleteStorageFiles(filePaths: string[]) {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: filePaths.map(Key => ({ Key }))
      }
    })
    
    await b2.send(command)
    return { error: null }
  } catch (error) {
    console.error('Error deleting B2 files', error)
    return { error: 'Erreur lors de la suppression des fichiers' }
  }
}
