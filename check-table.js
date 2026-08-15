const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hcymxnoytvjydkiqxyfs.supabase.co',
  'your-supabase-service-role-key-placeholder'
);
async function run() {
  const { data, error } = await supabase.from('email_verification_tokens').select('*').limit(1);
  if (error) {
    console.error('Table error:', error.message);
  } else {
    console.log('Table exists. Data:', data);
  }
}
run();
