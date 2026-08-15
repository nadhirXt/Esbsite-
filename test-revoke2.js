const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testRevoke() {
  // First make someone a delegate
  const { data: users } = await supabaseAdmin.from('profiles').select('*').limit(1);
  if (!users || users.length === 0) return console.log("No users");
  const target = users[0];
  
  await supabaseAdmin.from('profiles').update({ is_delegate: true, delegate_cycle: 'dseb', delegate_year: 3 }).eq('id', target.id);
  
  console.log("Made delegate:", target.id);
  
  // Now revoke
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
    console.log("SUCCESS REVOKING");
  }
}
testRevoke();
