import type { Document } from '@/lib/types'

export type AcademicType = 
  | 'Cours' 
  | 'TD' 
  | 'TP' 
  | 'Examen' 
  | 'Corrigé' 
  | 'Rattrapage' 
  | 'Fiche / Résumé' 
  | 'Syllabus'
  | 'Autre'

export interface SmartFileItem {
  id: string
  file: File
  originalName: string
  cleanTitle: string
  detectedType: AcademicType
  detectedSemester: 'S1' | 'S2' | null
  sizeFormatted: string
  targetCategory: string
  isConflict: boolean
  existingDoc?: Document
  conflictAction: 'replace' | 'rename' | 'skip'
  suggestedNewTitle: string
  customPath?: string
}

const ACRONYMS = new Set([
  'ESB', 'TVA', 'IFRS', 'BFR', 'SIG', 'PIB', 'RH', 'SI', 'SQL', 
  'IA', 'AI', 'CM', 'TD', 'TP', 'DS', 'PFE', 'RSE', 'IR', 'IS',
  'CEO', 'CFO', 'IT', 'ERP', 'CRM', 'API', 'PDF', 'QCM'
])

const ROMAN_NUMERALS = new Set([
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'
])

/**
 * Formate la taille d'un fichier en unité lisible
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 o'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['o', 'Ko', 'Mo', 'Go']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Détecte le type académique d'un document à partir de son nom
 */
export function detectAcademicType(fileName: string): AcademicType {
  // Normaliser les séparateurs pour que les limites de mots fonctionnent avec les tirets et underscores
  const normalized = ' ' + fileName.toLowerCase().replace(/[_\.\-]+/g, ' ') + ' '

  // Corrigé en premier pour éviter faux positifs (ex: "TD 1 Corrigé")
  if (/\b(corrig[eé]|correction|solution|sol)\b/i.test(normalized)) return 'Corrigé'
  if (/\b(rattrapage|session\s*2|rattrap)\b/i.test(normalized)) return 'Rattrapage'
  if (/\b(examen|partiel|ds|devoir|contr[oô]le|test)\b/i.test(normalized)) return 'Examen'
  if (/\b(td|travaux\s*dirig[eé]s|exercices?|s[eé]rie)\b/i.test(normalized)) return 'TD'
  if (/\b(tp|travaux\s*pratiques?|manip|laboratoire)\b/i.test(normalized)) return 'TP'
  if (/\b(cours|cm|chapitre|ch\s*\d+|partie\s*\d+|support|le[cç]on)\b/i.test(normalized)) return 'Cours'
  if (/\b(r[eé]sum[eé]|fiche|synth[eè]se|m[eé]mo)\b/i.test(normalized)) return 'Fiche / Résumé'
  if (/\b(syllabus|programme|plan\s*de\s*cours)\b/i.test(normalized)) return 'Syllabus'

  return 'Autre'
}

/**
 * Détecte le semestre académique
 */
export function detectSemester(fileName: string): 'S1' | 'S2' | null {
  const normalized = ' ' + fileName.toLowerCase().replace(/[_\.\-]+/g, ' ') + ' '
  if (/\b(s1|semestre\s*1)\b/i.test(normalized)) return 'S1'
  if (/\b(s2|semestre\s*2)\b/i.test(normalized)) return 'S2'
  return null
}

/**
 * Nettoie le nom de fichier brut en un titre élégant et professionnel
 */
export function cleanFileNameToTitle(fileName: string): string {
  // 1. Supprimer l'extension
  let name = fileName.replace(/\.[^/.]+$/, '')

  // 2. Remplacer les séparateurs par des espaces
  name = name.replace(/[_\.]+/g, ' ')
  name = name.replace(/\s*-\s*/g, ' - ')

  // 3. Supprimer les préfixes d'horodatage ou de numérisation (ex: 1741234567 ou scan001)
  name = name.replace(/^\d{10,14}\s*/, '')
  name = name.replace(/\b(scan|img|doc|document|fichier)\s*\d*\b/gi, '')

  // 4. Supprimer les mentions de copie, version, final et bruit récurrents
  name = name.replace(/\b(copie\s*(de)?|copy\s*of)\b/gi, '')
  name = name.replace(/\b(v\d+(\.\d+)?|version\s*\d+|final|definitif|nouveau|new|ok)\b/gi, '')

  // 5. Normaliser les espaces
  name = name.replace(/\s{2,}/g, ' ').trim()

  if (!name) return fileName.replace(/\.[^/.]+$/, '')

  // 6. Capitalisation intelligente
  const words = name.split(' ')
  const formattedWords = words.map((w, index) => {
    const upper = w.toUpperCase()
    if (ACRONYMS.has(upper)) return upper
    if (ROMAN_NUMERALS.has(upper)) return upper

    // Mots de liaison en minuscule sauf au début
    const lower = w.toLowerCase()
    const smallWords = ['de', 'du', 'des', 'le', 'la', 'les', 'et', 'en', 'un', 'une', 'a', 'à', 'pour', 'dans', 'sur']
    if (index > 0 && smallWords.includes(lower)) {
      return lower
    }

    // Capitaliser la 1ère lettre
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })

  return formattedWords.join(' ')
}

/**
 * Génère un titre unique en cas de doublon (ex: "Macroéconomie (1)")
 */
export function generateUniqueTitle(baseTitle: string, existingTitles: string[]): string {
  const existingSet = new Set(existingTitles.map(t => t.toLowerCase().trim()))
  if (!existingSet.has(baseTitle.toLowerCase().trim())) return baseTitle

  let counter = 1
  const match = baseTitle.match(/^(.*?)(?:\s*\((\d+)\))?$/)
  const rootName = match ? match[1].trim() : baseTitle

  while (existingSet.has(`${rootName.toLowerCase()} (${counter})`)) {
    counter++
  }
  return `${rootName} (${counter})`
}

/**
 * Prépare les fichiers sélectionnés en objets SmartFileItem complets
 */
export function prepareSmartFiles(
  rawFiles: (File | any)[],
  existingDocs: Document[],
  targetLocation: { cycle: string; year: number | null; baseCategory: string }
): SmartFileItem[] {
  const existingFolderDocs = existingDocs.filter(d => {
    const matchCycle = d.cycle === targetLocation.cycle
    const matchYear = targetLocation.year !== null ? d.year === targetLocation.year : true
    return matchCycle && matchYear
  })

  const existingTitles = existingFolderDocs.map(d => d.title)

  return rawFiles.map((file, idx) => {
    const originalName = file.name || `fichier_${idx + 1}`
    const cleanTitle = cleanFileNameToTitle(originalName)
    const detectedType = detectAcademicType(originalName)
    const detectedSemester = detectSemester(originalName)

    // Catégorie relative si dossier uploadé
    let relativeCat = ''
    const pathStr = file.customPath || file.webkitRelativePath || ''
    if (pathStr) {
      const parts = pathStr.split('/')
      parts.pop() // Retire le nom du fichier
      if (parts.length > 0) {
        relativeCat = parts.join('/')
      }
    }

    const category = relativeCat
      ? (targetLocation.baseCategory === 'Général' || !targetLocation.baseCategory ? relativeCat : `${targetLocation.baseCategory}/${relativeCat}`)
      : (targetLocation.baseCategory || 'Général')

    // Vérification de doublon dans la même catégorie
    const matchingDoc = existingFolderDocs.find(d => 
      (d.category || 'Général') === category &&
      d.title.trim().toLowerCase() === cleanTitle.trim().toLowerCase()
    )

    const isConflict = !!matchingDoc
    const suggestedNewTitle = isConflict ? generateUniqueTitle(cleanTitle, existingTitles) : cleanTitle

    return {
      id: `smart-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      originalName,
      cleanTitle,
      detectedType,
      detectedSemester,
      sizeFormatted: formatBytes(file.size || 0),
      targetCategory: category,
      isConflict,
      existingDoc: matchingDoc,
      conflictAction: isConflict ? 'rename' : 'rename',
      suggestedNewTitle,
      customPath: file.customPath
    }
  })
}
