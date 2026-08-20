const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixYears() {
  const { data: docs } = await supabase.from('documents').select('*').is('year', null);
  if (!docs || docs.length === 0) {
    console.log("No documents to migrate.");
    return;
  }
  console.log(`Found ${docs.length} documents with year=null.`);
  
  for (const doc of docs) {
    console.log(`Migrating doc ${doc.title} (${doc.id}) to year=1`);
    await supabase.from('documents').update({ year: 1 }).eq('id', doc.id);
  }
  console.log("Done!");
}
fixYears();
