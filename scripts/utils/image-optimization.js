const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Profile Image Optimization Utility
 * DRY implementation for responsive image generation
 */

// Standard responsive breakpoints and sizes
const RESPONSIVE_SIZES = {
  desktop: { width: 150, height: 150 },
  mobile: { width: 120, height: 120 },
  thumbnail: { width: 64, height: 64 },
  original: { width: 600, height: 600 } // Original web optimized
};

/**
 * Generate responsive images from source
 * @param {string} sourceImagePath - Path to high-quality source image
 * @param {string} outputDir - Directory for optimized images
 * @param {Object} options - Generation options
 * @returns {Object} Paths and metadata for generated images
 */
async function generateResponsiveImages(sourceImagePath, outputDir, options = {}) {
  const { isDraft = false, generateWebP = true, generateJPEG = true } = options;

  console.log(`🖼️  Generating circular responsive images from: ${path.basename(sourceImagePath)}`);

  // Ensure source exists
  if (!fs.existsSync(sourceImagePath)) {
    throw new Error(`Source image not found: ${sourceImagePath}`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = {
    source: sourceImagePath,
    generated: {},
    metadata: null
  };

  try {
    // Add better error handling for Sharp image format compatibility
    let sourceImage;
    let metadata;

    try {
      sourceImage = sharp(sourceImagePath);
      metadata = await sourceImage.metadata();
    } catch (formatError) {
      console.log(`⚠️ Sharp format error: ${formatError.message}`);
      console.log(`🔄 Attempting image format conversion for compatibility...`);

      // Try to force read as JPEG and convert
      sourceImage = sharp(sourceImagePath, { failOnError: false })
        .jpeg({ quality: 95 });
      metadata = await sourceImage.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error(`Unable to read image dimensions from ${sourceImagePath}`);
      }
    }
    // Get actual file size since Sharp metadata.size might be undefined
    const sourceStats = fs.statSync(sourceImagePath);

    results.metadata = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: sourceStats.size
    };

    console.log(`📏 Source: ${metadata.width}x${metadata.height}, ${metadata.format}, ${Math.round(sourceStats.size / 1024)}KB`);

    // Generate each responsive size
    for (const [sizeName, dimensions] of Object.entries(RESPONSIVE_SIZES)) {
      const { width, height } = dimensions;
      const baseFilename = `profile-${sizeName}`;

      results.generated[sizeName] = {};

      // Generate WebP version (modern browsers) with circular crop
      if (generateWebP) {
        const webpPath = path.join(outputDir, `${baseFilename}.webp`);

        // Create circular mask
        const circularMask = Buffer.from(
          `<svg width="${width}" height="${height}"><circle cx="${width/2}" cy="${height/2}" r="${width/2}" fill="white"/></svg>`
        );

        await sourceImage
          .clone()
          .resize(width, height, { fit: 'cover' })
          .composite([{ input: circularMask, blend: 'dest-in' }])
          .webp({ quality: 85, effort: 6 })
          .toFile(webpPath);

        const webpStats = fs.statSync(webpPath);
        results.generated[sizeName].webp = {
          path: webpPath,
          size: webpStats.size,
          width,
          height
        };

        console.log(`  ✅ ${sizeName} WebP (circular): ${Math.round(webpStats.size / 1024)}KB (${width}x${height})`);
      }

      // Generate JPEG version (fallback) with circular crop
      if (generateJPEG) {
        const jpegPath = path.join(outputDir, `${baseFilename}.jpg`);

        // Create circular mask
        const circularMask = Buffer.from(
          `<svg width="${width}" height="${height}"><circle cx="${width/2}" cy="${height/2}" r="${width/2}" fill="white"/></svg>`
        );

        await sourceImage
          .clone()
          .resize(width, height, { fit: 'cover' })
          .composite([{ input: circularMask, blend: 'dest-in' }])
          .jpeg({ quality: 85, progressive: true })
          .toFile(jpegPath);

        const jpegStats = fs.statSync(jpegPath);
        results.generated[sizeName].jpeg = {
          path: jpegPath,
          size: jpegStats.size,
          width,
          height
        };

        console.log(`  ✅ ${sizeName} JPEG (circular): ${Math.round(jpegStats.size / 1024)}KB (${width}x${height})`);
      }
    }

    const totalFiles = Object.values(results.generated).reduce((count, size) => {
      return count + Object.keys(size).length;
    }, 0);

    console.log(`🎯 Generated ${totalFiles} responsive images successfully`);
    return results;

  } catch (error) {
    console.error('❌ Image optimization failed:', error.message);
    throw error;
  }
}

/**
 * Generate template data for responsive images
 * @param {Object} imageResults - Results from generateResponsiveImages
 * @returns {Object} Template data for Handlebars
 */
function generateTemplateData(imageResults) {
  if (!imageResults?.generated) {
    return null;
  }

  const { generated } = imageResults;

  return {
    // Primary desktop images
    primaryWebP: generated.desktop?.webp ? `assets/images/${path.basename(generated.desktop.webp.path)}` : null,
    primaryJPEG: generated.desktop?.jpeg ? `assets/images/${path.basename(generated.desktop.jpeg.path)}` : null,

    // Mobile optimized images
    mobileWebP: generated.mobile?.webp ? `assets/images/${path.basename(generated.mobile.webp.path)}` : null,
    mobileJPEG: generated.mobile?.jpeg ? `assets/images/${path.basename(generated.mobile.jpeg.path)}` : null,

    // Thumbnail for favicons/small uses
    thumbnailWebP: generated.thumbnail?.webp ? `assets/images/${path.basename(generated.thumbnail.webp.path)}` : null,
    thumbnailJPEG: generated.thumbnail?.jpeg ? `assets/images/${path.basename(generated.thumbnail.jpeg.path)}` : null,

    // Original web-optimized version
    originalWebP: generated.original?.webp ? `assets/images/${path.basename(generated.original.webp.path)}` : null,
    originalJPEG: generated.original?.jpeg ? `assets/images/${path.basename(generated.original.jpeg.path)}` : null,

    // Metadata
    originalSize: imageResults.metadata?.size,
    totalGenerated: Object.keys(generated).length
  };
}

/**
 * Main function to optimize profile image for the resume
 * @param {string} sourceImagePath - Path to source image
 * @param {Object} options - Build options
 * @returns {Object} Template data for image optimization
 */
async function optimizeProfileImageForResume(sourceImagePath, options = {}) {
  const { isDraft = false, outputDir = './dist/assets/images' } = options;

  try {
    const imageResults = await generateResponsiveImages(sourceImagePath, outputDir, {
      isDraft,
      generateWebP: !isDraft, // Skip WebP in draft mode for speed
      generateJPEG: true
    });

    return generateTemplateData(imageResults);
  } catch (error) {
    console.error('❌ Profile image optimization failed:', error.message);
    return null;
  }
}

module.exports = {
  generateResponsiveImages,
  generateTemplateData,
  optimizeProfileImageForResume,
  RESPONSIVE_SIZES
};
