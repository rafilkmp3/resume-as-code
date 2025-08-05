const http = require('http');
const fs = require('fs');
const path = require('path');

function createSimpleServer(port, publicDir, useCache = false) {
  const server = http.createServer((req, res) => {
    const filePath = req.url === '/' ? path.join(publicDir, 'index.html') : path.join(publicDir, req.url);
    
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
        
        const headers = {
          'Content-Type': contentTypes[ext] || 'application/octet-stream'
        };

        if (!useCache) {
          headers['Cache-Control'] = 'no-cache';
        }

        res.writeHead(200, headers);
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
  
  return {
    start: () => {
      server.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
        console.log('   Press Ctrl+C to stop');
      });
    }
  }
}

module.exports = createSimpleServer;
