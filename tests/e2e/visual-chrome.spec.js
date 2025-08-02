import { test, expect } from '@playwright/test';

// Comprehensive screen sizes that match the baseline images
const SCREEN_SIZES = {
  'Desktop-1080p': { width: 1920, height: 1080 },
  'Desktop-1440p': { width: 2560, height: 1440 },
  'Laptop-13': { width: 1280, height: 800 },
  'Ultrawide': { width: 3440, height: 1440 },
  'iPad-Pro-12.9': { width: 1024, height: 1366 },
  'iPad-Pro-11': { width: 834, height: 1194 },
  'iPad-Mini': { width: 768, height: 1024 },
  'iPhone-14-Pro-Max': { width: 428, height: 926 },
  'iPhone-12': { width: 390, height: 844 },
  'iPhone-SE': { width: 375, height: 667 },
  'Google-Pixel-7': { width: 412, height: 915 },
  'Samsung-Galaxy-S21': { width: 384, height: 854 }
};

const THEMES = ['light', 'dark'];

// Configure test timeout for comprehensive testing
test.setTimeout(60000);

for (const [deviceName, viewport] of Object.entries(SCREEN_SIZES)) {
  for (const theme of THEMES) {
    test(`Visual validation: ${deviceName} - ${theme} theme`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize(viewport);
      
      // Set color scheme
      await page.emulateMedia({ colorScheme: theme });
      
      // Navigate to page
      await page.goto('/');
      
      // Wait for everything to load including images
      await page.waitForLoadState('networkidle');
      
      // Wait for profile images to load
      await page.waitForSelector('.profile-photo', { state: 'visible', timeout: 10000 });
      
      // Additional wait for any animations or lazy loading
      await page.waitForTimeout(2000);
      
      // Check for horizontal scroll (responsive design validation)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margins
      
      // Take screenshot with specific naming convention
      const screenshotName = `${deviceName}-${theme}-theme.png`;
      
      await expect(page).toHaveScreenshot(screenshotName, {
        fullPage: true,
        threshold: 0.2,
        animations: 'disabled', // Disable animations for consistent screenshots
        clip: null // Capture full page
      });
    });
  }
}

// Additional specific tests for critical functionality
test('Profile image loads correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check if profile image is visible
  const profileImage = page.locator('.profile-photo');
  await expect(profileImage).toBeVisible();
  
  // Check if image has loaded (not broken)
  const imageLoaded = await profileImage.evaluate((img) => {
    return img.complete && img.naturalHeight !== 0;
  });
  expect(imageLoaded).toBe(true);
});

test('Theme switching works correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Test dark theme button
  const darkButton = page.locator('button:has-text("🌙")');
  await expect(darkButton).toBeVisible();
  await darkButton.click();
  
  // Verify dark theme is applied
  const bodyClass = await page.evaluate(() => document.body.className);
  expect(bodyClass).toContain('dark-theme');
  
  // Test light theme (if there's a light button)
  const lightButton = page.locator('button:has-text("☀")');
  if (await lightButton.isVisible()) {
    await lightButton.click();
    const bodyClassLight = await page.evaluate(() => document.body.className);
    expect(bodyClassLight).not.toContain('dark-theme');
  }
});

test('Print functionality works', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const printButton = page.locator('button.control-btn[onclick="window.print()"]').first();
  await expect(printButton).toBeVisible();
  
  // Test print button doesn't cause errors
  await printButton.click();
  
  // Verify page is still functional after print
  await expect(page.locator('h1')).toBeVisible();
});