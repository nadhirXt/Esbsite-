const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Erreur: Les variables d'environnement Supabase sont manquantes dans .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Récupérer les arguments : node import.js email password
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error("Usage: node import.js <votre_email_admin> <votre_mot_de_passe>")
  process.exit(1)
}

const CYCLE = process.argv[4] || 'dseb'
const IMPORT_DIR = process.argv[5] ? path.resolve(process.argv[5]) : path.join(__dirname, 'drive-import')
const ROOT_PREFIX = process.argv[6] || '' // e.g. "1ère Année"

async function walkDir(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(await walkDir(filePath))
    } else {
      results.push(filePath)
    }
  }
  return results
}

async function uploadFiles() {
  console.log(`\nConnexion à Supabase avec ${email}...`)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (authError) {
    console.error("Erreur de connexion:", authError.message)
    process.exit(1)
  }

  console.log(`Connexion réussie ! Scan des fichiers dans : ${IMPORT_DIR}`)
  console.log(`Cycle: ${CYCLE} | Préfixe racine: "${ROOT_PREFIX}"`)

  const allFiles = await walkDir(IMPORT_DIR)
  console.log(`${allFiles.length} fichiers trouvés. Début de l'importation...\n`)

  let successCount = 0
  let errorCount = 0
  let skippedCount = 0

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath)
    
    // Ignorer les fichiers cachés comme .DS_Store
    if (fileName.startsWith('.')) continue;

    // Calculer le chemin relatif
    let relativePath = path.relative(IMPORT_DIR, filePath)
    const pathParts = relativePath.split(path.sep)
    
    pathParts.pop() // Retire le nom du fichier pour garder la catégorie
    
    let category = pathParts.join('/')
    
    // Ajouter le préfixe s'il est spécifié (ex: "1ère Année")
    if (ROOT_PREFIX) {
      category = category ? `${ROOT_PREFIX}/${category}` : ROOT_PREFIX
    }
    
    // Nettoyage spécifique hérité de l'ancien code si ROOT_PREFIX n'est pas utilisé
    if (!ROOT_PREFIX && category.startsWith('2 ème année DSEB')) {
      category = category.replace('2 ème année DSEB', '2ème Année')
    }

    const fileTitle = fileName.replace(/\.[^.]+$/, '')
    
    // Check if it already exists to avoid duplicates
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('title', fileTitle)
      .eq('category', category || 'Général')

    if (existing && existing.length > 0) {
      console.log(`⏩ Ignoré (déjà existant) : ${fileName}`)
      skippedCount++
      continue
    }

    // Sécuriser le nom de fichier pour le stockage (Supabase n'aime pas les accents/arabe dans les chemins de stockage)
    // On garde que les lettres latines, chiffres, points. Le reste devient des tirets.
    // Le vrai titre (en arabe/français) reste dans fileTitle (base de données).
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_')
    const storagePath = `${CYCLE}/${Date.now()}_${safeFileName}`
    
    const fileBuffer = fs.readFileSync(filePath)
    const fileExt = path.extname(fileName).toLowerCase()
    
    let contentType = 'application/octet-stream'
    if (fileExt === '.pdf') contentType = 'application/pdf'
    else if (fileExt === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    else if (fileExt === '.pptx') contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    else if (fileExt === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    console.log(`Envoi de: ${fileName}\n -> Dossier: ${category || 'Général'}`)
    
    // 1. Upload Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error(`❌ Erreur Upload Storage (${fileName}):`, uploadError.message)
      errorCount++
      continue
    }

    // 2. Insert DB
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        title: fileTitle,
        file_path: storagePath,
        cycle: CYCLE,
        category: category || 'Général'
      })

    if (dbError) {
      console.error(`❌ Erreur Base de données (${fileName}):`, dbError.message)
      errorCount++
    } else {
      console.log(`✅ Succès: ${fileName}`)
      successCount++
    }
  }

  console.log(`\nImportation terminée !`)
  console.log(`✅ Succès : ${successCount}`)
  console.log(`❌ Erreurs : ${errorCount}`)
  console.log(`⏩ Ignorés : ${skippedCount}`)
  process.exit(0)
}

uploadFiles()
