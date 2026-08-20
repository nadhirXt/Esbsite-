const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixMemoires() {
  const { data: docs } = await supabase.from('documents').select('*').in('cycle', ['memoires', 'bibliotheque']);
  if (!docs || docs.length === 0) return;
  for (const doc of docs) {
    if (doc.year !== null) {
      console.log(`Fixing doc ${doc.id} (${doc.cycle}) to year=null`);
      await supabase.from('documents').update({ year: null }).eq('id', doc.id);
    }
  }
}
fixMemoires();
