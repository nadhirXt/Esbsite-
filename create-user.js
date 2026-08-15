const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hcymxnoytvjydkiqxyfs.supabase.co',
  'your-supabase-service-role-key-placeholder'
);
async function run() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'benn4dir@gmail.com',
    password: 'Password123!',
    email_confirm: true
  });
  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('User created successfully:', data.user.email);
  }
}
run();
