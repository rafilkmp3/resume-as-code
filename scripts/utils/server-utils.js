const http = require('http');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

function createSimpleServer(port, publicDir, useCache = false) {
  // Load resume data for QR code generation
  let resumeData;
  try {
    // Try multiple possible paths for resume-data.json
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'resume-data.json'),
      path.join(process.cwd(), 'resume-data.json'),
      path.join(__dirname, '..', '..', 'src', 'resume-data.json'),
    ];
    
    let resumeDataPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        resumeDataPath = testPath;
        break;
      }
    }
    
    if (resumeDataPath) {
      resumeData = JSON.parse(fs.readFileSync(resumeDataPath, 'utf8'));
      console.log(`✅ Loaded resume data from: ${resumeDataPath}`);
    } else {
      throw new Error('resume-data.json not found in any expected location');
    }
  } catch (err) {
    console.warn('Could not load resume-data.json for QR code generation:', err.message);
    resumeData = {
      basics: { url: 'https://rafilkmp3.github.io/resume-as-code' },
    };
  }

  const server = http.createServer(async (req, res) => {
    // Handle /qrcode route
    if (req.url === '/qrcode' || req.url === '/qrcode/') {
      try {
        const qrCodePNG = await QRCode.toBuffer(resumeData.basics.url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': useCache ? 'max-age=3600' : 'no-cache',
          'Content-Length': qrCodePNG.length,
        });
        res.end(qrCodePNG);
        return;
      } catch (err) {
        console.error('Error generating QR code:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error generating QR code');
        return;
      }
    }

    // Handle regular file serving
    const filePath =
      req.url === '/'
        ? path.join(publicDir, 'index.html')
        : path.join(publicDir, req.url);

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
          '.js': 'application/javascript',
          '.svg': 'image/svg+xml',
        };

        const headers = {
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
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
    },
  };
}

module.exports = createSimpleServer;
