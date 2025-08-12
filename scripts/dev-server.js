const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const livereload = require('livereload');
const { build } = require('./build');
const createSimpleServer = require('./utils/server-utils');

const PORT = 3000;
const LIVERELOAD_PORT = 35729;
const WATCH_FILES = ['templates/template.html', 'resume-data.json', 'assets/**/*'];

let isBuilding = false;

// Build function using direct module call (10x faster than exec)
async function buildResume() {
    if (isBuilding) return;

    isBuilding = true;
    console.log('🔄 Building resume...');

    try {
        // Use draft mode for development - skips expensive PDF generation
        await build({ mode: 'draft' });
        console.log('✅ Resume built successfully (draft mode)');
    } catch (error) {
        console.error('❌ Build failed:', error.message);
    } finally {
        isBuilding = false;
    }
}

// Professional file watcher with chokidar
function watchFiles() {
    console.log('👀 Watching files for changes...');
    console.log(`🔥 LiveReload server: http://localhost:${LIVERELOAD_PORT}`);

    // Create livereload server
    const liveReloadServer = livereload.createServer({ port: LIVERELOAD_PORT });
    liveReloadServer.watch(path.resolve('./dist'));

    // Watch source files with chokidar
    const watcher = chokidar.watch(WATCH_FILES, {
        ignored: /node_modules|\.git|dist/,
        ignoreInitial: true,
        persistent: true
    });

    watcher
        .on('change', async (filePath) => {
            const relativePath = path.relative('.', filePath);
            console.log(`📝 ${relativePath} changed`);
            await buildResume();
            // LiveReload will auto-refresh the browser after build
        })
        .on('add', async (filePath) => {
            const relativePath = path.relative('.', filePath);
            console.log(`➕ ${relativePath} added`);
            await buildResume();
        })
        .on('unlink', async (filePath) => {
            const relativePath = path.relative('.', filePath);
            console.log(`➖ ${relativePath} removed`);
            await buildResume();
        });

    // Display watched patterns
    WATCH_FILES.forEach(pattern => {
        console.log(`   - ${pattern}`);
    });

    return { watcher, liveReloadServer };
}

// Initialize
console.log('🏗️  Resume-as-Code Development Server');
console.log('=====================================');
console.log(`⚡ Draft Mode: Lightning-fast builds (HTML only)`);
console.log(`🔥 Hot Reload: Browser auto-refresh on changes`);

let watchers = null;

// Initialize everything
(async () => {
    // Initial build
    await buildResume();

    // Start file watching with hot reload
    watchers = watchFiles();

    // Start server
    const server = createSimpleServer(PORT, './dist', false); // No cache for dev
    server.start();

    console.log('=====================================');
    console.log(`🌐 Resume: http://localhost:${PORT}`);
    console.log(`🔥 LiveReload: Add to HTML or use browser extension`);
    console.log('🛑 Press Ctrl+C to stop');
    console.log('=====================================');
})();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down development server...');

    if (watchers) {
        console.log('🧹 Closing file watchers...');
        watchers.watcher.close();
        if (watchers.liveReloadServer) {
            watchers.liveReloadServer.close();
        }
    }

    console.log('✅ Clean shutdown completed');
    process.exit(0);
});
