const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hcymxnoytvjydkiqxyfs.supabase.co',
  'your-supabase-service-role-key-placeholder'
);
async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Registered emails:');
  data.users.forEach(u => console.log(u.email));
}
run();
