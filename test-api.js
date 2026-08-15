const http = require('http');

async function test() {
  const res = await fetch('http://localhost:3000/api/admin/users/toggle-delegate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId: "dummy", isDelegate: false, delegateCycle: null, delegateYear: null })
  });
  console.log(res.status, await res.text());
}
test();
