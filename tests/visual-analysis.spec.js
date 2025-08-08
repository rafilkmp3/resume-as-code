const { test, expect } = require('@playwright/test');

test.describe('Visual Analysis Tests', () => {
  test('Desktop layout screenshot for analysis', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/desktop-full-page.png',
      fullPage: true,
    });

    // Take viewport screenshot
    await page.screenshot({
      path: 'test-results/desktop-viewport.png',
    });

    // Test hover state on work dates
    const firstWorkDate = page.locator('.work-date').first();
    await firstWorkDate.hover();
    await page.waitForTimeout(500); // Wait for animation

    await page.screenshot({
      path: 'test-results/desktop-date-hover.png',
    });
  });

  test('iPhone Pro Max layout screenshot for analysis', async ({ page }) => {
    // Set iPhone 15 Pro Max viewport
    await page.setViewportSize({ width: 430, height: 932 });

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/mobile-full-page.png',
      fullPage: true,
    });

    // Take viewport screenshot
    await page.screenshot({
      path: 'test-results/mobile-viewport.png',
    });

    // Test dark mode on mobile
    const darkToggle = page.locator('#darkToggle');
    if (await darkToggle.isVisible()) {
      await darkToggle.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: 'test-results/mobile-dark-mode.png',
      });
    }
  });

  test('iPad Pro layout screenshot for analysis', async ({ page }) => {
    // Set iPad Pro viewport
    await page.setViewportSize({ width: 1024, height: 1366 });

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/tablet-full-page.png',
      fullPage: true,
    });

    // Take viewport screenshot
    await page.screenshot({
      path: 'test-results/tablet-viewport.png',
    });
  });
});
