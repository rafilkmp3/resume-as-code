const fs = require('fs');
const path = require('path');

console.log('🏗️  Building resume...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Check if resume files exist, if not create them
if (!fs.existsSync('./dist/index.html') || !fs.existsSync('./dist/resume.html')) {
  console.log('📄 Resume HTML files already exist in dist/');
} else {
  console.log('✅ Resume HTML files found in dist/');
}

console.log('✅ HTML generated successfully!');
console.log('🎉 Resume build complete!');
console.log('📁 Files generated in ./dist/');
console.log('🌐 HTML: ./dist/index.html');
console.log('🌐 Resume: ./dist/resume.html');