import { test, expect } from '@playwright/test';

test.describe('QR Code Visibility Tests', () => {
  test('QR code should be hidden on website but visible in print mode', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that QR code section exists in DOM but is hidden
    const qrSection = page.locator('section:has(h3:has-text("Live Interactive Version"))');
    await expect(qrSection).toHaveCount(1);
    
    // Verify QR code is hidden on screen (should not be visible)
    await expect(qrSection).toBeHidden();
    
    console.log('✅ QR code is properly hidden on website');
  });
  
  test('QR code should be visible in print mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    // Check that QR code section is visible in print mode
    const qrSection = page.locator('section:has(h3:has-text("Live Interactive Version"))');
    await expect(qrSection).toBeVisible();
    
    // Verify QR code content is present
    const qrHeading = page.locator('h3:has-text("Live Interactive Version")');
    await expect(qrHeading).toBeVisible();
    
    const qrCodeSvg = page.locator('svg');
    await expect(qrCodeSvg).toBeVisible();
    
    console.log('✅ QR code is properly visible in print mode');
  });
});