const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hcymxnoytvjydkiqxyfs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeW14bm95dHZqeWRraXF4eWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM5NTk0OSwiZXhwIjoyMTAxOTcxOTQ5fQ.Yk_wFWF1e6Umc6UTQIeSy1nPuxLkM6MkUW53HGXEuLQ'
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
