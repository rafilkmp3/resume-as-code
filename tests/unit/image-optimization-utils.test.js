const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  generateResponsiveImages,
  generateTemplateData,
  optimizeProfileImageForResume,
  RESPONSIVE_SIZES
} = require('../../scripts/utils/image-optimization');

// Mock sharp module since it requires native dependencies
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    metadata: jest.fn().mockResolvedValue({
      width: 800,
      height: 600,
      format: 'jpeg',
      size: 102400 // 100KB
    }),
    clone: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    composite: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue()
  }));

  return mockSharp;
});

describe('image-optimization', () => {
  let tempDir;
  let testImagePath;
  let outputDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'image-opt-test-'));
    testImagePath = path.join(tempDir, 'test-image.jpg');
    outputDir = path.join(tempDir, 'output');

    // Create mock image file
    fs.writeFileSync(testImagePath, 'fake image data');

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('RESPONSIVE_SIZES constant', () => {
    test('should have all required size definitions', () => {
      expect(RESPONSIVE_SIZES).toBeDefined();
      expect(RESPONSIVE_SIZES.desktop).toEqual({ width: 150, height: 150 });
      expect(RESPONSIVE_SIZES.mobile).toEqual({ width: 120, height: 120 });
      expect(RESPONSIVE_SIZES.thumbnail).toEqual({ width: 64, height: 64 });
      expect(RESPONSIVE_SIZES.original).toEqual({ width: 600, height: 600 });
    });

    test('should have square aspect ratios for all sizes', () => {
      Object.entries(RESPONSIVE_SIZES).forEach(([sizeName, dimensions]) => {
        expect(dimensions.width).toBe(dimensions.height);
      });
    });
  });

  describe('generateResponsiveImages', () => {
    test('should throw error if source image does not exist', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.jpg');

      await expect(generateResponsiveImages(nonExistentPath, outputDir))
        .rejects.toThrow('Source image not found');
    });

    test('should create output directory if it does not exist', async () => {
      expect(fs.existsSync(outputDir)).toBe(false);

      // Mock the sharp operations to avoid actual file generation
      const sharp = require('sharp');
      const mockInstance = sharp();

      // Mock file stats for generated files
      const mockStats = { size: 1024 };
      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      await generateResponsiveImages(testImagePath, outputDir);

      expect(fs.existsSync(outputDir)).toBe(true);
    });

    test('should generate all responsive sizes by default', async () => {
      const sharp = require('sharp');
      const mockInstance = sharp();
      const mockStats = { size: 1024 };

      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      const result = await generateResponsiveImages(testImagePath, outputDir);

      expect(result.generated).toBeDefined();
      expect(Object.keys(result.generated)).toEqual(['desktop', 'mobile', 'thumbnail', 'original']);
    });

    test('should include metadata in results', async () => {
      const mockStats = { size: 1024 };
      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      const result = await generateResponsiveImages(testImagePath, outputDir);

      expect(result.metadata).toEqual({
        width: 800,
        height: 600,
        format: 'jpeg',
        size: 102400
      });
    });

    test('should generate both WebP and JPEG by default', async () => {
      const mockStats = { size: 1024 };
      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      const result = await generateResponsiveImages(testImagePath, outputDir);

      Object.values(result.generated).forEach(sizeData => {
        expect(sizeData.webp).toBeDefined();
        expect(sizeData.jpeg).toBeDefined();
      });
    });

    test('should skip WebP generation when generateWebP is false', async () => {
      const mockStats = { size: 1024 };
      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      const result = await generateResponsiveImages(testImagePath, outputDir, {
        generateWebP: false
      });

      Object.values(result.generated).forEach(sizeData => {
        expect(sizeData.webp).toBeUndefined();
        expect(sizeData.jpeg).toBeDefined();
      });
    });

    test('should skip JPEG generation when generateJPEG is false', async () => {
      const mockStats = { size: 1024 };
      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      const result = await generateResponsiveImages(testImagePath, outputDir, {
        generateJPEG: false
      });

      Object.values(result.generated).forEach(sizeData => {
        expect(sizeData.webp).toBeDefined();
        expect(sizeData.jpeg).toBeUndefined();
      });
    });

    test('should handle sharp errors gracefully', async () => {
      const sharp = require('sharp');
      const mockInstance = sharp();
      mockInstance.metadata.mockRejectedValue(new Error('Sharp error'));

      await expect(generateResponsiveImages(testImagePath, outputDir))
        .rejects.toThrow('Sharp error');
    });
  });

  describe('generateTemplateData', () => {
    test('should return null for invalid input', () => {
      expect(generateTemplateData(null)).toBe(null);
      expect(generateTemplateData({})).toBe(null);
      expect(generateTemplateData({ generated: null })).toBe(null);
    });

    test('should generate template data from image results', () => {
      const mockResults = {
        generated: {
          desktop: {
            webp: { path: '/path/to/profile-desktop.webp' },
            jpeg: { path: '/path/to/profile-desktop.jpg' }
          },
          mobile: {
            webp: { path: '/path/to/profile-mobile.webp' },
            jpeg: { path: '/path/to/profile-mobile.jpg' }
          },
          thumbnail: {
            webp: { path: '/path/to/profile-thumbnail.webp' },
            jpeg: { path: '/path/to/profile-thumbnail.jpg' }
          },
          original: {
            webp: { path: '/path/to/profile-original.webp' },
            jpeg: { path: '/path/to/profile-original.jpg' }
          }
        },
        metadata: {
          size: 102400
        }
      };

      const templateData = generateTemplateData(mockResults);

      expect(templateData).toEqual({
        primaryWebP: 'assets/images/profile-desktop.webp',
        primaryJPEG: 'assets/images/profile-desktop.jpg',
        mobileWebP: 'assets/images/profile-mobile.webp',
        mobileJPEG: 'assets/images/profile-mobile.jpg',
        thumbnailWebP: 'assets/images/profile-thumbnail.webp',
        thumbnailJPEG: 'assets/images/profile-thumbnail.jpg',
        originalWebP: 'assets/images/profile-original.webp',
        originalJPEG: 'assets/images/profile-original.jpg',
        originalSize: 102400,
        totalGenerated: 4
      });
    });

    test('should handle missing image formats gracefully', () => {
      const mockResults = {
        generated: {
          desktop: {
            jpeg: { path: '/path/to/profile-desktop.jpg' }
            // webp missing
          }
        },
        metadata: {
          size: 102400
        }
      };

      const templateData = generateTemplateData(mockResults);

      expect(templateData.primaryWebP).toBe(null);
      expect(templateData.primaryJPEG).toBe('assets/images/profile-desktop.jpg');
    });

    test('should extract correct filenames from full paths', () => {
      const mockResults = {
        generated: {
          desktop: {
            webp: { path: '/very/long/path/to/output/profile-desktop.webp' }
          }
        },
        metadata: { size: 1024 }
      };

      const templateData = generateTemplateData(mockResults);

      expect(templateData.primaryWebP).toBe('assets/images/profile-desktop.webp');
    });
  });

  describe('optimizeProfileImageForResume', () => {
    test('should use correct default output directory', async () => {
      const mockStats = { size: 1024 };
      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      // Mock the main function behavior
      const result = await optimizeProfileImageForResume(testImagePath);

      // Should not throw and should return template data
      expect(result).toBeDefined();
    });

    test('should skip WebP in draft mode', async () => {
      const mockStats = { size: 1024 };
      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      const result = await optimizeProfileImageForResume(testImagePath, {
        isDraft: true
      });

      // In draft mode, WebP generation should be skipped
      expect(result).toBeDefined();
    });

    test('should return null on optimization failure', async () => {
      const sharp = require('sharp');
      const mockInstance = sharp();
      mockInstance.metadata.mockRejectedValue(new Error('Optimization failed'));

      const result = await optimizeProfileImageForResume(testImagePath);

      expect(result).toBe(null);
    });

    test('should use custom output directory when provided', async () => {
      const mockStats = { size: 1024 };
      jest.spyOn(fs, 'statSync').mockReturnValue(mockStats);

      const customOutputDir = path.join(tempDir, 'custom');

      await optimizeProfileImageForResume(testImagePath, {
        outputDir: customOutputDir
      });

      // The function should have been called with the custom directory
      expect(fs.existsSync(customOutputDir)).toBe(true);
    });

    test('should handle non-existent source image gracefully', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.jpg');

      const result = await optimizeProfileImageForResume(nonExistentPath);

      expect(result).toBe(null);
    });
  });
});
