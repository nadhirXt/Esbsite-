const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hcymxnoytvjydkiqxyfs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeW14bm95dHZqeWRraXF4eWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM5NTk0OSwiZXhwIjoyMTAxOTcxOTQ5fQ.Yk_wFWF1e6Umc6UTQIeSy1nPuxLkM6MkUW53HGXEuLQ'
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
