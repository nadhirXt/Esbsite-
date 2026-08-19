const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hcymxnoytvjydkiqxyfs.supabase.co',
  'your-supabase-service-role-key-placeholder'
);
async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return console.error('Error:', error);
  const emails = data.users.map(u => u.email);
  console.log('benelhadjbenelhadj@gmail.com exists:', emails.includes('benelhadjbenelhadj@gmail.com'));
  console.log('monadhir93@gmail.com exists:', emails.includes('monadhir93@gmail.com'));
}
run();
