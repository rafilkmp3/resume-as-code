const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const filePath = req.url === '/' ? './dist/index.html' : './dist' + req.url;
  
  try {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.pdf': 'application/pdf',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.css': 'text/css',
        '.js': 'application/javascript'
      };
      
      res.writeHead(200, { 
        'Content-Type': contentTypes[ext] || 'application/octet-stream' 
      });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Resume server running at http://localhost:${port}`);
});