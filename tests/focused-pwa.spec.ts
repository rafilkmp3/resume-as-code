import { test, expect } from '@playwright/test';

test.describe('Focused PWA Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Rafael Bernardo Sathler - Resume/);
  });

  test('should have a manifest file accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check if manifest link exists in HTML (should be only one now)
    const manifestLink = await page.locator('link[rel="manifest"]').first().getAttribute('href');
    expect(manifestLink).toBe('/manifest.json');
    
    // Verify manifest file is actually accessible
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.status()).toBe(200);
    
    const manifestData = await manifestResponse.json();
    expect(manifestData.name).toBeTruthy();
    expect(manifestData.icons).toBeTruthy();
  });

  test('should register service worker properly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for service worker to be registered
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(() => {
            resolve(true);
          }).catch(() => {
            resolve(false);
          });
        } else {
          resolve(false);
        }
      });
    }, { timeout: 10000 });
    
    // Check if service worker is registered
    const registration = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration().then(reg => !!reg);
    });
    expect(registration).toBe(true);
  });

  test('should have working service worker file', async ({ page }) => {
    // Check if service worker file exists and is accessible
    const swResponse = await page.request.get('/sw.js');
    expect(swResponse.status()).toBe(200);
    
    const swContent = await swResponse.text();
    expect(swContent).toContain('install');
    expect(swContent).toContain('fetch');
  });
});