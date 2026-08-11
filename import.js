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

const IMPORT_DIR = path.join(__dirname, 'drive-import')
const CYCLE = 'dseb' // Déduit du nom du dossier "2 ème année DSEB"

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

  console.log("Connexion réussie ! Scan des fichiers...")

  const allFiles = await walkDir(IMPORT_DIR)
  console.log(`${allFiles.length} fichiers trouvés. Début de l'importation...\n`)

  let successCount = 0
  let errorCount = 0

  let skippedCount = 0

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath)
    
    // Ignorer les fichiers cachés comme .DS_Store
    if (fileName.startsWith('.')) continue;

    // Calculer le chemin relatif par rapport au dossier racine des cours
    // drive-import/2 ème année DSEB/Module annuel/... -> "Module annuel/..."
    let relativePath = path.relative(IMPORT_DIR, filePath)
    
    // On enlève le premier dossier s'il s'agit de "2 ème année DSEB" pour avoir une catégorie propre
    const pathParts = relativePath.split(path.sep)

    // Optionnel : On peut nettoyer un peu le nom de la première année pour l'affichage
    if (pathParts[0] === '2 ème année DSEB') {
      pathParts[0] = '2ème Année'
    }
    
    // Le nom du fichier est le dernier élément, le reste c'est la catégorie
    pathParts.pop() // Retire le nom du fichier pour garder la catégorie
    const category = pathParts.join('/')

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
