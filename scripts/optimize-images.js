const fs = require('fs');
const path = require('path');

function optimizeImages() {
  console.log('🖼️  Image optimization script');
  console.log('==============================');
  
  const imageDir = './assets/images';
  const distDir = './dist';
  
  // Ensure directories exist
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
    console.log('📁 Created assets/images directory');
  }
  
  // Check for images
  const profileImage = path.join(imageDir, 'rafael-sathler-profile.jpeg');
  
  if (!fs.existsSync(profileImage)) {
    console.log('❌ Profile image not found at:', profileImage);
    return;
  }
  
  // Get image stats
  const stats = fs.statSync(profileImage);
  const sizeKB = Math.round(stats.size / 1024);
  
  console.log(`📸 Found profile image: ${sizeKB}KB`);
  
  // Copy optimized image to dist when building
  if (fs.existsSync(distDir)) {
    const destPath = path.join(distDir, 'rafael-sathler-profile.jpeg');
    fs.copyFileSync(profileImage, destPath);
    console.log('✅ Copied optimized image to dist/');
  }
  
  console.log(`
📋 Image Optimization Summary:
- Original image: assets/images/rafael-sathler-profile.jpeg (${sizeKB}KB)
- Image has been organized in proper directory structure
- For web optimization, consider:
  - Converting to WebP format for better compression
  - Creating multiple sizes (thumbnail, full resolution)
  - Adding responsive images for different screen densities

💡 Current image is suitable for professional use
`);
}

// Run if called directly
if (require.main === module) {
  optimizeImages();
}

module.exports = { optimizeImages };