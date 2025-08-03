
import { test, expect } from '@playwright/test';

test.describe('PWA Basic Functionality', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Rafael Bernardo Sathler - Resume/);
  });

  test('should have a manifest file', async ({ page }) => {
    test.setTimeout(60000);
    test.setTimeout(60000);
    test.setTimeout(60000);
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBe('/manifest.json');
  });

  test('should have a service worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null);
    const registration = await page.evaluate(() => navigator.serviceWorker.getRegistration());
    expect(registration).not.toBeNull();
  });
});
