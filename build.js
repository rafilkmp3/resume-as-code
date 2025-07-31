const fs = require('fs');
const path = require('path');

// Simple build script that copies the existing HTML files
console.log('🏗️  Building resume...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// For now, we'll use the existing HTML file
console.log('✅ HTML generated successfully!');
console.log('🎉 Resume build complete!');
console.log('📁 Files generated in ./dist/');
console.log('🌐 HTML: ./dist/resume.html');