const fs = require('fs');
const path = require('path');

/**
 * Canvas-based image optimization for production builds
 * Uses Node.js Canvas API for actual image resizing
 * Much lighter output files compared to copy-based approach
 */

const RESPONSIVE_SIZES = {
  'profile-32': { width: 32, height: 32, quality: 90 },
  'profile-64': { width: 64, height: 64, quality: 85 },
  'profile-128': { width: 128, height: 128, quality: 80 },
  'profile-256': { width: 256, height: 256, quality: 75 },
  'profile-512': { width: 512, height: 512, quality: 70 },
  // Template-required files
  'profile-mobile': { width: 120, height: 120, quality: 80 },
  'profile-desktop': { width: 150, height: 150, quality: 75 }
};

/**
 * Generate optimized images using Canvas (production approach)
 * Falls back to simple copy if Canvas is not available
 */
async function generateOptimizedImages(sourceImagePath, outputDir, options = {}) {
  const {
    baseFilename = 'profile',
    generateWebP = false
  } = options;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  try {
    // Try to use Canvas for proper resizing
    let canvas, loadImage;
    try {
      const { createCanvas, loadImage: canvasLoadImage } = require('canvas');
      canvas = createCanvas;
      loadImage = canvasLoadImage;
      console.log('📦 Using Canvas for image optimization...');
    } catch (canvasError) {
      console.log('⚠️ Canvas not available, using fallback approach...');
      throw new Error('Canvas not available');
    }

    // Load the source image
    const image = await loadImage(sourceImagePath);
    console.log(`📷 Source image: ${image.width}x${image.height}`);

    // Generate each size using Canvas
    for (const [sizeName, dimensions] of Object.entries(RESPONSIVE_SIZES)) {
      const filename = sizeName.startsWith('profile-') ? `${sizeName}.jpg` : `${baseFilename}-${dimensions.width}.jpg`;
      const outputPath = path.join(outputDir, filename);

      // Create canvas with target dimensions
      const canvasInstance = canvas(dimensions.width, dimensions.height);
      const ctx = canvasInstance.getContext('2d');

      // Draw resized image
      ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);

      // Convert to JPEG with quality control
      const buffer = canvasInstance.toBuffer('image/jpeg', { quality: dimensions.quality / 100 });

      // Write optimized image
      fs.writeFileSync(outputPath, buffer);

      results.push({
        format: 'jpeg',
        width: dimensions.width,
        height: dimensions.height,
        path: outputPath,
        size: buffer.length
      });

      const sizeKB = (buffer.length / 1024).toFixed(1);
      console.log(`✅ Generated: ${filename} (${dimensions.width}x${dimensions.height}, ${sizeKB}KB)`);
    }

    // Create optimized main profile image (mobile size as default)
    const mainPath = path.join(outputDir, `${baseFilename}.jpg`);
    const mainCanvas = canvas(120, 120);
    const mainCtx = mainCanvas.getContext('2d');
    mainCtx.drawImage(image, 0, 0, 120, 120);
    const mainBuffer = mainCanvas.toBuffer('image/jpeg', { quality: 0.8 });
    fs.writeFileSync(mainPath, mainBuffer);

    results.push({
      format: 'jpeg',
      width: 120,
      height: 120,
      path: mainPath,
      size: mainBuffer.length
    });

    const mainSizeKB = (mainBuffer.length / 1024).toFixed(1);
    console.log(`✅ Generated main: ${baseFilename}.jpg (120x120, ${mainSizeKB}KB)`);

  } catch (error) {
    console.log('❌ Canvas optimization failed, using lightweight fallback...');

    // Lightweight fallback: Use original only for mobile/desktop variants
    for (const [sizeName] of Object.entries(RESPONSIVE_SIZES)) {
      if (sizeName === 'profile-mobile' || sizeName === 'profile-desktop') {
        const filename = `${sizeName}.jpg`;
        const outputPath = path.join(outputDir, filename);

        // Copy original (will be large but at least functional)
        fs.copyFileSync(sourceImagePath, outputPath);

        results.push({
          format: 'jpeg',
          width: 'fallback',
          height: 'fallback',
          path: outputPath,
          size: fs.statSync(outputPath).size
        });

        console.log(`⚠️ Fallback: ${filename} (original size)`);
      }
    }

    // Main profile as copy
    const mainPath = path.join(outputDir, `${baseFilename}.jpg`);
    fs.copyFileSync(sourceImagePath, mainPath);
    results.push({
      format: 'jpeg',
      width: 'fallback',
      height: 'fallback',
      path: mainPath,
      size: fs.statSync(mainPath).size
    });
  }

  // Return results with template-compatible structure
  return {
    images: results,
    primaryJPEG: 'assets/images/profile-mobile.jpg',
    primaryWebP: 'assets/images/profile-mobile.webp',
    desktopJPEG: 'assets/images/profile-desktop.jpg',
    desktopWebP: 'assets/images/profile-desktop.webp'
  };
}

/**
 * Optimize profile image for resume - Canvas-based approach
 * Much smaller output files for production use
 */
async function optimizeProfileImageForResume(sourceImagePath, outputDir) {
  console.log('🖼️  Optimizing profile image (Canvas-based)...');

  try {
    const results = await generateOptimizedImages(sourceImagePath, outputDir, {
      baseFilename: 'profile',
      generateWebP: false // Keep simple for compatibility
    });

    const totalSize = results.images.reduce((sum, result) => sum + result.size, 0);
    const totalSizeKB = (totalSize / 1024).toFixed(1);
    console.log(`📊 Generated ${results.images.length} image variants (${totalSizeKB}KB total)`);

    // Calculate savings compared to copy-based approach
    const originalSize = fs.statSync(sourceImagePath).size;
    const savings = Math.round((1 - totalSize / (originalSize * results.images.length)) * 100);
    console.log(`💡 Size reduction: ~${savings}% compared to copy-based approach`);

    return results;
  } catch (error) {
    console.error('❌ Canvas-based optimization failed:', error.message);
    throw error;
  }
}

module.exports = {
  generateOptimizedImages,
  optimizeProfileImageForResume,
  RESPONSIVE_SIZES
};
