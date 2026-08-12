import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  
  // Try with anon key first
  const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  
  console.log("Essai de lister les fichiers du bucket 'documents' avec la clé publique...")
  const { data: filesAnon, error: errAnon } = await supabaseAnon.storage.from('documents').list()
  
  if (errAnon) {
    console.error("Erreur avec la clé publique:", errAnon.message)
  } else {
    console.log(`Trouvé ${filesAnon?.length || 0} fichiers avec la clé publique.`)
  }

  // Try to query the table
  console.log("Essai de lire la table 'documents' avec la clé publique...")
  const { data: rowsAnon, error: errRows } = await supabaseAnon.from('documents').select('*')
  
  if (errRows) {
    console.error("Erreur avec la clé publique (table):", errRows.message)
  } else {
    console.log(`Trouvé ${rowsAnon?.length || 0} lignes avec la clé publique.`)
  }
}

checkSupabase()
