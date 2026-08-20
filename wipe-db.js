const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function wipeDatabase() {
  console.log("Deleting all documents from the database to start fresh...");
  const { data, error } = await supabase
    .from('documents')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); 
    
  if (error) {
    console.error("Error deleting:", error);
  } else {
    console.log("Successfully deleted all documents.");
  }
}
wipeDatabase();
