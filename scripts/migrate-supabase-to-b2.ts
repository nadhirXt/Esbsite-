import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function migrate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  
  // IL NOUS FAUT ABSOLUMENT LA CLÉ SECRÈTE (service_role) POUR CONTOURNER LA SÉCURITÉ ET TOUT VOIR
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceKey) {
    console.error("❌ ERREUR CRITIQUE : La clé 'SUPABASE_SERVICE_ROLE_KEY' est introuvable dans .env.local")
    console.error("Sans cette clé secrète, le script ne peut pas voir vos fichiers à cause de la sécurité (RLS).")
    process.exit(1)
  }

  // Connexion en mode Administrateur absolu
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const endpoint = process.env.B2_ENDPOINT || '';
  const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;

  const b2 = new S3Client({
    region: process.env.B2_REGION || 'us-east-005',
    endpoint: formattedEndpoint,
    credentials: {
      accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
    },
  })

  const bucketName = process.env.B2_BUCKET_NAME || 'esb-documents-prod'

  console.log('🔄 Connexion administrateur réussie. Recherche des fichiers...')
  
  // 1. On liste tous les fichiers directement dans le bucket de stockage Supabase
  const { data: files, error: listError } = await supabase.storage.from('documents').list('', {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  })

  // Note : S'il y a des dossiers (licence, dseb, etc.), il faudrait lister récursivement.
  // Pour simplifier, on va chercher dans la base de données.
  const { data: documents, error } = await supabase.from('documents').select('*')

  if (error) {
    console.error('Erreur lors de la récupération des documents:', error)
    return
  }

  if (!documents || documents.length === 0) {
    console.log('Aucun document trouvé dans la base de données.')
    return
  }

  console.log(`Trouvé ${documents.length} document(s). Démarrage du transfert vers Backblaze...`)

  let successCount = 0
  let errorCount = 0

  for (const doc of documents) {
    const filePath = doc.file_path
    if (filePath === '.keep') continue

    console.log(`\n⏳ Traitement de : ${filePath}`)

    try {
      // 1. Download from Supabase
      const { data: fileData, error: downloadError } = await supabase.storage.from('documents').download(filePath)
      
      if (downloadError) {
        console.error(`❌ Échec du téléchargement (Supabase): ${filePath}`, downloadError)
        errorCount++
        continue
      }

      const buffer = Buffer.from(await fileData.arrayBuffer())

      // 2. Upload to B2
      let contentType = fileData.type || 'application/octet-stream'
      
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: buffer,
        ContentType: contentType
      })

      await b2.send(uploadCommand)
      console.log(`✅ Copié sur Backblaze avec succès : ${filePath}`)

      // 3. Delete from Supabase to free up space (since that's the whole point!)
      const { error: deleteError } = await supabase.storage.from('documents').remove([filePath])
      
      if (deleteError) {
        console.warn(`⚠️ Fichier copié sur B2, mais impossible de le supprimer de Supabase : ${filePath}`, deleteError)
      } else {
        console.log(`🗑️ Supprimé de Supabase (Espace libéré !)`)
      }

      successCount++

    } catch (err) {
      console.error(`❌ Échec global pour : ${filePath}`, err)
      errorCount++
    }
  }

  console.log('\n--- Bilan de la migration (Supabase -> Backblaze) ---')
  console.log(`Total traité: ${successCount + errorCount}`)
  console.log(`Transférés et libérés: ${successCount}`)
  console.log(`Erreurs: ${errorCount}`)
}

migrate()
