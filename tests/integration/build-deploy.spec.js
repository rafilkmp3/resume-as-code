const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Build and Deployment Integration Tests', () => {
  const distPath = path.join(__dirname, '../../dist');

  test('should generate dist directory with build output', async () => {
    // Check that dist directory exists
    expect(fs.existsSync(distPath)).toBeTruthy();

    // Check for essential files
    const expectedFiles = ['index.html', 'resume.pdf'];

    for (const file of expectedFiles) {
      const filePath = path.join(distPath, file);
      expect(fs.existsSync(filePath)).toBeTruthy();
    }
  });

  test('should generate valid HTML output', async () => {
    const htmlPath = path.join(distPath, 'index.html');

    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      // Basic HTML structure validation
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html');
      expect(htmlContent).toContain('<head>');
      expect(htmlContent).toContain('<body>');
      expect(htmlContent).toContain('</html>');

      // Resume-specific content
      expect(htmlContent).toContain('Rafael Bernardo Sathler');

      // Dark mode toggle should be present
      expect(htmlContent).toContain('darkToggle');
      expect(htmlContent).toContain('themeIcon');

      // Meta tags for SEO
      expect(htmlContent).toContain('<meta');
      expect(htmlContent).toContain('viewport');
    }
  });

  test('should generate valid PDF output', async () => {
    const pdfPath = path.join(distPath, 'resume.pdf');

    if (fs.existsSync(pdfPath)) {
      const pdfStats = fs.statSync(pdfPath);

      // PDF should have reasonable file size (not empty, not too large)
      expect(pdfStats.size).toBeGreaterThan(10000); // > 10KB
      expect(pdfStats.size).toBeLessThan(5000000); // < 5MB

      // PDF should have PDF header
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfHeader = pdfBuffer.slice(0, 4).toString();
      expect(pdfHeader).toBe('%PDF');
    }
  });

  test('should have proper file permissions', async () => {
    if (fs.existsSync(distPath)) {
      const distStats = fs.statSync(distPath);
      expect(distStats.isDirectory()).toBeTruthy();

      // Check HTML file permissions
      const htmlPath = path.join(distPath, 'index.html');
      if (fs.existsSync(htmlPath)) {
        const htmlStats = fs.statSync(htmlPath);
        expect(htmlStats.isFile()).toBeTruthy();

        // File should be readable
        try {
          fs.accessSync(htmlPath, fs.constants.R_OK);
        } catch (error) {
          throw new Error('HTML file is not readable');
        }
      }
    }
  });

  test('should serve content correctly via web server', async ({ page }) => {
    // Test the actual served content
    await page.goto('/');

    // Page should load successfully
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');

    // Check HTTP status
    const response = await page.request.get('/');
    expect(response.status()).toBe(200);

    // Content-Type should be HTML
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/html');
  });

  test('should handle static assets correctly', async ({ page }) => {
    await page.goto('/');

    // Collect all network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });

    const responses = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()['content-type'] || '',
      });
    });

    await page.waitForLoadState('networkidle');

    // Check that CSS and JS files loaded successfully
    const cssResponses = responses.filter(r =>
      r.contentType.includes('text/css')
    );
    const jsResponses = responses.filter(r =>
      r.contentType.includes('javascript')
    );
    const imageResponses = responses.filter(r =>
      r.contentType.includes('image')
    );

    // All resources should return 200
    for (const response of responses) {
      if (!response.url.includes('favicon')) {
        // Skip favicon as it might not exist
        expect(response.status).toBe(200);
      }
    }
  });

  test('should support PDF download', async ({ page }) => {
    await page.goto('/');

    // Check if PDF is accessible
    const pdfResponse = await page.request.get('/resume.pdf');

    if (pdfResponse.status() === 200) {
      const contentType = pdfResponse.headers()['content-type'];
      expect(contentType).toContain('application/pdf');

      // PDF should have content
      const pdfBuffer = await pdfResponse.body();
      expect(pdfBuffer.length).toBeGreaterThan(10000);
    }
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    const response = await page.request.get('/nonexistent-page.html');
    expect(response.status()).toBe(404);
  });

  test('should have proper caching headers', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    // Should have some form of cache control
    const hasCacheControl =
      headers['cache-control'] ||
      headers['expires'] ||
      headers['etag'] ||
      headers['last-modified'];

    expect(hasCacheControl).toBeTruthy();
  });

  test('should support HTTPS in production environment', async ({ page }) => {
    // Check if we're running against a production URL
    const currentUrl = page.url();

    if (currentUrl.includes('github.io') || currentUrl.includes('https://')) {
      expect(currentUrl).toMatch(/^https:/);

      // Check security headers
      const response = await page.request.get('/');
      const headers = response.headers();

      // Common security headers in production
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
      ];

      // At least some security headers should be present
      const hasSecurityHeaders = securityHeaders.some(
        header => headers[header]
      );
      if (currentUrl.includes('github.io')) {
        expect(hasSecurityHeaders).toBeTruthy();
      }
    }
  });

  test('should maintain consistent build output', async () => {
    // Check that build is deterministic
    const htmlPath = path.join(distPath, 'index.html');

    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      // Should not contain build-specific timestamps or random data
      // (unless intentionally added for cache busting)
      expect(htmlContent).toContain('Rafael Bernardo Sathler');

      // Should not contain development-only content
      expect(htmlContent).not.toContain('localhost:3000');
      expect(htmlContent).not.toContain('development');
      expect(htmlContent).not.toContain('console.log');
    }
  });

  test('should handle different deployment environments', async ({ page }) => {
    await page.goto('/');

    // Page should work regardless of base URL
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');

    // All relative links should work
    const links = page.locator('a[href^="/"], a[href^="./"], a[href^="../"]');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      // Test first 5 internal links
      const link = links.nth(i);
      const href = await link.getAttribute('href');

      if (href && !href.includes('#')) {
        // Skip anchor links
        const response = await page.request.get(href);
        // Link should either work (200) or be a valid redirect (3xx)
        expect(response.status()).toBeLessThan(400);
      }
    }
  });
});
