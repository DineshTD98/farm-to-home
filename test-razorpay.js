const http = require('http');
const fs = require('fs');
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('test-razorpay.html'));
}).listen(8081, () => console.log('Listening on 8081'));
