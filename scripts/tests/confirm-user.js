const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hcymxnoytvjydkiqxyfs.supabase.co',
  'your-supabase-service-role-key-placeholder'
);
async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return console.error(error);
  const user = data.users.find(u => u.email === 'benn4dir@gmail.com');
  if (user) {
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );
    if (updateError) console.error('Error confirming:', updateError);
    else console.log('User confirmed successfully!');
  } else {
    console.log('User not found in first 50.');
  }
}
run();
