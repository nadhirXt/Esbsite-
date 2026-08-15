const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function migrate() {
  const { data: docs } = await supabase.from('documents').select('*').is('year', null);
  if (!docs || docs.length === 0) {
    console.log("No documents to migrate.");
    return;
  }
  
  for (const doc of docs) {
    let year = null;
    const cat = doc.category || '';
    if (cat.includes('1 ère année') || cat.includes('1ere année')) year = 1;
    else if (cat.includes('2 ème année') || cat.includes('2eme année')) year = 2;
    else if (cat.includes('3 ème année') || cat.includes('3eme année')) year = 3;
    else if (cat.includes('4 ème année') || cat.includes('4eme année')) year = 4;
    
    // If we can infer a year, update it and remove the prefix from category if we want,
    // but the user's category string shouldn't break anything.
    if (year !== null) {
      console.log(`Migrating doc ${doc.id}: category="${cat}" -> year=${year}`);
      await supabase.from('documents').update({ year }).eq('id', doc.id);
    }
  }
}
migrate();
