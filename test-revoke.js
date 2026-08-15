const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testRevoke() {
  // Get any delegate
  const { data: delegates } = await supabaseAdmin.from('profiles').select('*').eq('is_delegate', true).limit(1);
  if (!delegates || delegates.length === 0) {
    console.log("No delegates found.");
    return;
  }
  const target = delegates[0];
  console.log("Target:", target.id);
  
  const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_delegate: false,
        delegate_cycle: null,
        delegate_year: null
      })
      .eq('id', target.id);
      
  if (updateError) {
    console.error("SUPABASE ERROR:", updateError);
  } else {
    console.log("SUCCESS");
  }
}
testRevoke();
