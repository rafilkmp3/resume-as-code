/**
 * Minimal PDF Routes Test
 * 
 * Tests that PDF routes generate HTML content without errors.
 * This ensures QR code generation and template rendering work correctly.
 */

import { test, expect } from '@playwright/test';

const PDF_ROUTES = [
  { name: 'Screen PDF', path: '/pdf-screen' },
  { name: 'Print PDF', path: '/pdf-print' },
  { name: 'ATS PDF', path: '/pdf-ats' }
];

test.describe('PDF Route Generation', () => {
  // Test each PDF route loads successfully
  for (const route of PDF_ROUTES) {
    test(`${route.name} generates without errors`, async ({ page }) => {
      // Navigate to PDF route
      const response = await page.goto(`http://localhost:4321${route.path}`);
      
      // Verify response is successful
      expect(response?.status()).toBe(200);
      
      // Verify basic page structure exists
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.footer')).toBeVisible();
      
      // Verify QR code image loads (data URL should be present)
      const qrImg = page.locator('.qr-code');
      await expect(qrImg).toBeVisible();
      
      // Verify QR code has data URL (starts with "data:")
      const qrSrc = await qrImg.getAttribute('src');
      expect(qrSrc).toMatch(/^data:image\//);
      
      // Verify no JavaScript errors in console
      const jsErrors = [];
      page.on('pageerror', error => jsErrors.push(error.message));
      
      // Wait a moment for any async operations
      await page.waitForTimeout(1000);
      
      // Should have no JavaScript errors
      expect(jsErrors).toHaveLength(0);
      
      console.log(`✅ ${route.name} generated successfully with QR code`);
    });
  }
  
  // Test API redirects work
  test('PDF API routes redirect correctly', async ({ page }) => {
    const apiRoutes = [
      { api: '/api/pdf/screen', target: '/pdf-screen' },
      { api: '/api/pdf/print', target: '/pdf-print' },
      { api: '/api/pdf/ats', target: '/pdf-ats' }
    ];
    
    for (const route of apiRoutes) {
      const response = await page.goto(`http://localhost:4321${route.api}`);
      
      // Should redirect (302) to target page
      expect([200, 302]).toContain(response?.status());
      
      // Final URL should be the target
      expect(page.url()).toBe(`http://localhost:4321${route.target}`);
      
      console.log(`✅ ${route.api} redirects to ${route.target}`);
    }
  });
  
  // Test print media queries work
  test('Print CSS applies correctly', async ({ page }) => {
    await page.goto('http://localhost:4321/pdf-screen');
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    // Check that print styles are applied
    const body = page.locator('body');
    const bodyStyles = await body.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        margin: styles.margin,
        padding: styles.padding,
        fontSize: styles.fontSize
      };
    });
    
    // Print styles should modify the layout
    expect(bodyStyles.margin).toBe('0px');
    expect(bodyStyles.padding).toBe('0px');
    
    console.log('✅ Print CSS media queries work correctly');
  });
  
  // Test QR code data integrity
  test('QR codes contain valid data URLs', async ({ page }) => {
    await page.goto('http://localhost:4321/pdf-screen');
    
    const qrImg = page.locator('.qr-code');
    const qrSrc = await qrImg.getAttribute('src');
    
    // Should be a data URL
    expect(qrSrc).toMatch(/^data:image\/png;base64,/);
    
    // Data URL should be reasonably long (valid base64 content)
    expect(qrSrc.length).toBeGreaterThan(100);
    
    // Should not contain external URLs (security check)
    expect(qrSrc).not.toContain('api.qrserver.com');
    
    console.log('✅ QR code is self-hosted and secure');
  });
});