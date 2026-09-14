const http = require('http');

// Let's check if the backend is running on port 9000
const req = http.request({
  hostname: 'localhost',
  port: 9000,
  path: '/admin/collections?limit=100&fields=*metadata,*products',
  method: 'GET',
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.log('Server not reachable or error:', e.message);
});

req.end();

