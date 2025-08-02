import { test, expect } from '@playwright/test';

const SCREEN_SIZES = {
  // Mobile Phones
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12/13': { width: 390, height: 844 },
  'iPhone 14 Pro Max': { width: 430, height: 932 },
  'Samsung Galaxy S21': { width: 360, height: 800 },
  'Google Pixel 7': { width: 412, height: 915 },
  
  // Tablets  
  'iPad Mini': { width: 768, height: 1024 },
  'iPad Pro 11"': { width: 834, height: 1194 },
  'iPad Pro 12.9"': { width: 1024, height: 1366 },
  
  // Desktop
  'Laptop 13"': { width: 1280, height: 800 },
  'Desktop 1080p': { width: 1920, height: 1080 },
  'Desktop 1440p': { width: 2560, height: 1440 },
  'Ultrawide': { width: 3440, height: 1440 }
};

const THEMES = ['light', 'dark'];

// Test all screen sizes and themes
for (const [deviceName, viewport] of Object.entries(SCREEN_SIZES)) {
  for (const theme of THEMES) {
    test(`Visual validation: ${deviceName} - ${theme} theme`, async ({ page }) => {
      await page.setViewportSize(viewport);
      
      // Set theme preference
      await page.emulateMedia({ colorScheme: theme });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
      
      // Check touch targets on mobile
      if (viewport.width <= 768) {
        const touchTargets = await page.locator('.contact-link, .skill-tag, .social-link').all();
        for (const target of touchTargets) {
          const box = await target.boundingBox();
          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
      
      // Visual screenshot comparison
      await expect(page).toHaveScreenshot(`${deviceName.replace(/[^a-zA-Z0-9]/g, '_')}-${theme}.png`, {
        fullPage: true,
        threshold: 0.2
      });
    });
  }
}