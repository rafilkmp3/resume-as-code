const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Critical file validation tests
 * Ensures all essential files are present and valid in dist/ directory
 * This test should run in CI to catch file copying/generation issues
 */

test.describe('File Validation - Critical Assets', () => {

  test('should have all required profile images in dist/assets/images/', async () => {
    const imageDir = path.join(process.cwd(), 'dist/assets/images');
    const requiredImages = [
      'profile-32.jpg',
      'profile-64.jpg',
      'profile-128.jpg',
      'profile-256.jpg',
      'profile-512.jpg',
      'profile-mobile.jpg',
      'profile-desktop.jpg',
      'profile.jpg'
    ];

    // Check if image directory exists
    expect(fs.existsSync(imageDir)).toBe(true);

    // Check each required image file
    for (const imageName of requiredImages) {
      const imagePath = path.join(imageDir, imageName);

      // File must exist
      expect(fs.existsSync(imagePath), `Missing image: ${imageName}`).toBe(true);

      // File must have reasonable size (not empty, not corrupted)
      const stats = fs.statSync(imagePath);
      expect(stats.size, `Image ${imageName} is too small (${stats.size} bytes)`).toBeGreaterThan(1000); // At least 1KB
      expect(stats.size, `Image ${imageName} is suspiciously large (${stats.size} bytes)`).toBeLessThan(10000000); // Less than 10MB

      console.log(`✅ ${imageName}: ${(stats.size / 1024).toFixed(1)}KB`);
    }
  });

  test('should have valid HTML file with dynamic QR code support', async () => {
    const htmlPath = path.join(process.cwd(), 'dist/index.html');

    // HTML file must exist
    expect(fs.existsSync(htmlPath)).toBe(true);

    // HTML file must have reasonable size
    const stats = fs.statSync(htmlPath);
    expect(stats.size).toBeGreaterThan(10000); // At least 10KB

    // Read HTML content
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Must NOT contain embedded QR code data (we removed it for performance!)
    expect(htmlContent).not.toContain('qrCodeDataURL');
    expect(htmlContent).not.toContain('data:image/png;base64,iVBORw0KGgo'); // Old embedded QR code

    // Must contain dynamic QR code generation functions
    expect(htmlContent).toContain('generateQRCodeOnDemand');
    expect(htmlContent).toContain('loadQRCodeLibrary');
    expect(htmlContent).toContain('qrcode@1.5.3'); // CDN reference

    // Must contain QR canvas elements
    expect(htmlContent).toContain('id="qr-code-image"');
    expect(htmlContent).toContain('id="print-qr-code"');

    console.log(`✅ HTML file: ${(stats.size / 1024).toFixed(1)}KB with dynamic QR code support`);
  });

  test('should have all required PDF files', async () => {
    const distDir = path.join(process.cwd(), 'dist');
    const requiredPDFs = [
      'resume.pdf',
      'resume-print.pdf',
      'resume-ats.pdf'
    ];

    for (const pdfName of requiredPDFs) {
      const pdfPath = path.join(distDir, pdfName);

      // PDF file must exist
      expect(fs.existsSync(pdfPath), `Missing PDF: ${pdfName}`).toBe(true);

      // PDF file must have reasonable size
      const stats = fs.statSync(pdfPath);
      expect(stats.size, `PDF ${pdfName} is too small (${stats.size} bytes)`).toBeGreaterThan(50000); // At least 50KB

      console.log(`✅ ${pdfName}: ${(stats.size / 1024).toFixed(1)}KB`);
    }
  });

  test('should have valid resume data structure', async () => {
    const htmlPath = path.join(process.cwd(), 'dist/index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Extract embedded resume data
    const dataMatch = htmlContent.match(/var resumeData = ({.*?});/s);
    expect(dataMatch, 'Resume data not found in HTML').toBeTruthy();

    if (dataMatch) {
      const resumeDataStr = dataMatch[1];
      const resumeData = JSON.parse(resumeDataStr);

      // Validate required data structure
      expect(resumeData.basics).toBeDefined();
      expect(resumeData.basics.name).toBeTruthy();
      expect(resumeData.basics.image).toBeTruthy();
      expect(resumeData.basics.url).toBeTruthy();
      // QR codes are now generated dynamically - no longer embedded in resume data

      // Validate profile image optimization data
      expect(resumeData.profileImageOptimization).toBeDefined();
      expect(resumeData.profileImageOptimization.images).toBeInstanceOf(Array);
      expect(resumeData.profileImageOptimization.images.length).toBeGreaterThan(0);

      console.log(`✅ Resume data structure valid with ${resumeData.profileImageOptimization.images.length} image variants`);
    }
  });

  test('should verify profile image file sizes match expectations', async () => {
    const htmlPath = path.join(process.cwd(), 'dist/index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Extract embedded resume data to check reported image sizes
    const dataMatch = htmlContent.match(/var resumeData = ({.*?});/s);
    expect(dataMatch, 'Resume data not found in HTML').toBeTruthy();

    if (dataMatch) {
      const resumeDataStr = dataMatch[1];
      const resumeData = JSON.parse(resumeDataStr);

      // Verify actual file sizes match reported sizes
      for (const imageInfo of resumeData.profileImageOptimization.images) {
        const imagePath = path.join(process.cwd(), imageInfo.path);

        if (fs.existsSync(imagePath)) {
          const actualSize = fs.statSync(imagePath).size;

          // Allow some variance but detect major discrepancies
          const sizeDifference = Math.abs(actualSize - imageInfo.size);
          const sizeVariancePercent = (sizeDifference / imageInfo.size) * 100;

          // If variance is more than 50%, something is wrong
          if (sizeVariancePercent > 50) {
            console.warn(`⚠️  Size mismatch for ${imageInfo.path}: reported=${imageInfo.size}B, actual=${actualSize}B (${sizeVariancePercent.toFixed(1)}% difference)`);
          } else {
            console.log(`✅ ${path.basename(imageInfo.path)}: ${(actualSize / 1024).toFixed(1)}KB (${sizeVariancePercent.toFixed(1)}% variance)`);
          }

          // Test should fail for extreme size mismatches (likely copying errors)
          expect(sizeVariancePercent, `Extreme size mismatch for ${imageInfo.path}`).toBeLessThan(90);
        }
      }
    }
  });

  test('should validate QR code functionality in browser', async ({ page }) => {
    // Load the built HTML file
    await page.goto(`file://${path.join(process.cwd(), 'dist/index.html')}`);

    // Check if Share modal button exists and works
    const shareButton = page.locator('[data-testid="share-modal-trigger"]');
    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Check if QR code appears in modal
      const qrCodeImage = page.locator('[data-testid="share-qr-code"]');
      await expect(qrCodeImage).toBeVisible();

      // Check if QR code has valid src
      const src = await qrCodeImage.getAttribute('src');
      expect(src).toContain('data:image/png;base64,');

      console.log('✅ QR code displays correctly in Share modal');
    } else {
      console.log('ℹ️ Share modal not found, skipping QR code display test');
    }
  });

});
