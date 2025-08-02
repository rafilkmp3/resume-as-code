const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

const PORT = 3000;
const DIST_DIR = './dist';
const WATCH_FILES = ['template.html', 'resume-data.json', 'images/profile/', 'assets/'];

let isBuilding = false;

// Build function
function buildResume() {
    if (isBuilding) return;
    
    isBuilding = true;
    console.log('🔄 Building resume...');
    
    exec('node build.js', (error, stdout, stderr) => {
        isBuilding = false;
        
        if (error) {
            console.error('❌ Build failed:', error.message);
            return;
        }
        
        if (stderr) {
            console.error('⚠️  Build warnings:', stderr);
        }
        
        console.log('✅ Resume built successfully');
        if (stdout) console.log(stdout);
    });
}

// File watcher
function watchFiles() {
    console.log('👀 Watching files for changes...');
    
    WATCH_FILES.forEach(file => {
        if (fs.existsSync(file)) {
            const stat = fs.statSync(file);
            
            if (stat.isDirectory()) {
                // Watch directory recursively
                watchDirectory(file);
                console.log(`   - ${file}/ (directory)`);
            } else {
                // Watch individual file
                fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
                    if (curr.mtime !== prev.mtime) {
                        console.log(`📝 ${file} changed`);
                        buildResume();
                    }
                });
                console.log(`   - ${file}`);
            }
        }
    });
}

// Watch directory recursively
function watchDirectory(dir) {
    function watchDirRecursive(dirPath) {
        try {
            const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
                if (filename && (eventType === 'change' || eventType === 'rename')) {
                    console.log(`📝 ${path.join(dirPath, filename)} ${eventType}`);
                    buildResume();
                }
            });
            
            // Handle watcher errors
            watcher.on('error', (error) => {
                console.error(`Watcher error for ${dirPath}:`, error.message);
            });
            
        } catch (error) {
            console.error(`Failed to watch directory ${dirPath}:`, error.message);
        }
    }
    
    watchDirRecursive(dir);
}

// Simple HTTP server
function createServer() {
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
                    '.webp': 'image/webp',
                    '.css': 'text/css',
                    '.js': 'application/javascript'
                };
                
                res.writeHead(200, { 
                    'Content-Type': contentTypes[ext] || 'application/octet-stream',
                    'Cache-Control': 'no-cache' // Disable caching for development
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
    
    server.listen(PORT, () => {
        console.log(`🚀 Development server running at http://localhost:${PORT}`);
        console.log('   Press Ctrl+C to stop');
    });
}

// Initialize
console.log('🏗️  Resume-as-Code Development Server');
console.log('=====================================');

// Initial build
buildResume();

// Start file watching
watchFiles();

// Start server
createServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down development server...');
    
    // Cleanup file watchers
    WATCH_FILES.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unwatchFile(file);
        }
    });
    
    process.exit(0);
});