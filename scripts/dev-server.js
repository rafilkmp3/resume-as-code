const fs = require('fs');
const { exec } = require('child_process');
const createSimpleServer = require('./utils/server-utils');

const PORT = 3000;
const WATCH_FILES = ['template.html', 'resume-data.json'];

let isBuilding = false;

// Build function
function buildResume() {
    if (isBuilding) return;
    
    isBuilding = true;
    console.log('🔄 Building resume...');
    
    exec('node scripts/build.js', (error, stdout, stderr) => {
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
            fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
                if (curr.mtime !== prev.mtime) {
                    console.log(`📝 ${file} changed`);
                    buildResume();
                }
            });
            console.log(`   - ${file}`);
        }
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
createSimpleServer(PORT, './src', true).start();

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
