const fs = require('fs');
const path = require('path');

// Skip image optimization tests if sharp is not available (e.g. in CI environments without image processing)
let imageOptimizationModule;
let sharpAvailable = false;

try {
  imageOptimizationModule = require('../../scripts/utils/image-optimization');
  sharpAvailable = true;
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
    console.log('⚠️  Skipping image optimization tests - sharp not available in test environment');
    sharpAvailable = false;
  } else {
    throw error;
  }
}

(sharpAvailable ? describe : describe.skip)('Image Optimization Utility', () => {
  const testOutputDir = './test-output';
  const sourceImagePath = path.join(process.cwd(), 'assets/images/profile-source.jpeg');

  const {
    generateResponsiveImages,
    generateTemplateData,
    optimizeProfileImageForResume,
    RESPONSIVE_SIZES
  } = imageOptimizationModule || {};

  beforeEach(() => {
    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  describe('RESPONSIVE_SIZES Configuration', () => {
    test('should have all required responsive sizes', () => {
      expect(RESPONSIVE_SIZES).toHaveProperty('desktop');
      expect(RESPONSIVE_SIZES).toHaveProperty('mobile');
      expect(RESPONSIVE_SIZES).toHaveProperty('thumbnail');
      expect(RESPONSIVE_SIZES).toHaveProperty('original');
    });

    test('should have valid dimensions for each size', () => {
      Object.values(RESPONSIVE_SIZES).forEach(size => {
        expect(size).toHaveProperty('width');
        expect(size).toHaveProperty('height');
        expect(typeof size.width).toBe('number');
        expect(typeof size.height).toBe('number');
        expect(size.width).toBeGreaterThan(0);
        expect(size.height).toBeGreaterThan(0);
      });
    });
  });

  describe('generateResponsiveImages', () => {
    test('should generate responsive images in production mode', async () => {
      const results = await generateResponsiveImages(sourceImagePath, testOutputDir, {
        generateWebP: true,
        generateJPEG: true
      });

      expect(results).toHaveProperty('source', sourceImagePath);
      expect(results).toHaveProperty('generated');
      expect(results).toHaveProperty('metadata');

      // Check that all sizes were generated
      Object.keys(RESPONSIVE_SIZES).forEach(sizeName => {
        expect(results.generated).toHaveProperty(sizeName);
        expect(results.generated[sizeName]).toHaveProperty('webp');
        expect(results.generated[sizeName]).toHaveProperty('jpeg');
      });
    });

    test('should generate only JPEG in draft mode', async () => {
      const results = await generateResponsiveImages(sourceImagePath, testOutputDir, {
        generateWebP: false,
        generateJPEG: true
      });

      // Check that only JPEG files were generated
      Object.keys(RESPONSIVE_SIZES).forEach(sizeName => {
        expect(results.generated[sizeName]).toHaveProperty('jpeg');
        expect(results.generated[sizeName]).not.toHaveProperty('webp');
      });
    });

    test('should throw error for non-existent source image', async () => {
      const nonExistentPath = './non-existent-image.jpg';

      await expect(generateResponsiveImages(nonExistentPath, testOutputDir))
        .rejects.toThrow('Source image not found');
    });

    test('should create output directory if it does not exist', async () => {
      expect(fs.existsSync(testOutputDir)).toBe(false);

      await generateResponsiveImages(sourceImagePath, testOutputDir);

      expect(fs.existsSync(testOutputDir)).toBe(true);
    });
  });

  describe('generateTemplateData', () => {
    test('should generate proper template data from image results', async () => {
      const imageResults = await generateResponsiveImages(sourceImagePath, testOutputDir);
      const templateData = generateTemplateData(imageResults);

      expect(templateData).toHaveProperty('primaryWebP');
      expect(templateData).toHaveProperty('primaryJPEG');
      expect(templateData).toHaveProperty('mobileWebP');
      expect(templateData).toHaveProperty('mobileJPEG');
      expect(templateData).toHaveProperty('thumbnailWebP');
      expect(templateData).toHaveProperty('thumbnailJPEG');
      expect(templateData).toHaveProperty('originalWebP');
      expect(templateData).toHaveProperty('originalJPEG');
      expect(templateData).toHaveProperty('originalSize');
      expect(templateData).toHaveProperty('totalGenerated');

      // All paths should start with 'assets/images/'
      expect(templateData.primaryWebP).toMatch(/^assets\/images\//);
      expect(templateData.primaryJPEG).toMatch(/^assets\/images\//);
    });

    test('should return null for invalid image results', () => {
      expect(generateTemplateData(null)).toBeNull();
      expect(generateTemplateData({})).toBeNull();
      expect(generateTemplateData({ generated: null })).toBeNull();
    });
  });

  describe('optimizeProfileImageForResume', () => {
    test('should optimize image for production mode', async () => {
      const templateData = await optimizeProfileImageForResume(sourceImagePath, {
        isDraft: false,
        outputDir: testOutputDir
      });

      expect(templateData).not.toBeNull();
      expect(templateData).toHaveProperty('primaryWebP');
      expect(templateData).toHaveProperty('primaryJPEG');

      // Check that files were actually created
      const desktopWebP = path.join(testOutputDir, 'profile-desktop.webp');
      const desktopJPEG = path.join(testOutputDir, 'profile-desktop.jpg');
      expect(fs.existsSync(desktopWebP)).toBe(true);
      expect(fs.existsSync(desktopJPEG)).toBe(true);
    });

    test('should optimize image for draft mode (JPEG only)', async () => {
      const templateData = await optimizeProfileImageForResume(sourceImagePath, {
        isDraft: true,
        outputDir: testOutputDir
      });

      expect(templateData).not.toBeNull();
      expect(templateData.primaryJPEG).toBeTruthy();

      // WebP should not be generated in draft mode
      const desktopWebP = path.join(testOutputDir, 'profile-desktop.webp');
      const desktopJPEG = path.join(testOutputDir, 'profile-desktop.jpg');
      expect(fs.existsSync(desktopWebP)).toBe(false);
      expect(fs.existsSync(desktopJPEG)).toBe(true);
    });

    test('should return null for non-existent source image', async () => {
      const templateData = await optimizeProfileImageForResume('./non-existent.jpg', {
        outputDir: testOutputDir
      });

      expect(templateData).toBeNull();
    });
  });

  describe('Integration with Build Process', () => {
    test('should work with default dist/assets/images output directory', async () => {
      const distDir = './dist/assets/images';

      // Ensure dist directory exists
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      const templateData = await optimizeProfileImageForResume(sourceImagePath, {
        isDraft: false,
        outputDir: distDir
      });

      expect(templateData).not.toBeNull();

      // Check that files exist in dist directory
      const desktopJPEG = path.join(distDir, 'profile-desktop.jpg');
      expect(fs.existsSync(desktopJPEG)).toBe(true);
    });
  });
});
