const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hcymxnoytvjydkiqxyfs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeW14bm95dHZqeWRraXF4eWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM5NTk0OSwiZXhwIjoyMTAxOTcxOTQ5fQ.Yk_wFWF1e6Umc6UTQIeSy1nPuxLkM6MkUW53HGXEuLQ'
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
