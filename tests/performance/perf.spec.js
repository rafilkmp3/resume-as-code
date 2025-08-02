import { test, expect } from '@playwright/test';

test.describe('Performance tests', () => {
  test('should load within performance budgets', async ({ page }) => {
    // Monitor network activity
    await page.route('**/*', route => route.continue());
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Performance budgets
    expect(loadTime).toBeLessThan(3000); // 3 seconds max load time
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.value;
            }
            if (entry.name === 'first-input-delay') {
              vitals.fid = entry.value;
            }
            if (entry.name === 'cumulative-layout-shift') {
              vitals.cls = entry.value;
            }
          });
          
          // Resolve after a short delay to collect metrics
          setTimeout(() => resolve(vitals), 1000);
        }).observe({ entryTypes: ['paint', 'navigation', 'layout-shift'] });
      });
    });
    
    // Core Web Vitals thresholds
    if (vitals.lcp) expect(vitals.lcp).toBeLessThan(2500); // LCP < 2.5s
    if (vitals.fid) expect(vitals.fid).toBeLessThan(100);  // FID < 100ms  
    if (vitals.cls) expect(vitals.cls).toBeLessThan(0.1);  // CLS < 0.1
  });

  test('should work well on mobile networks', async ({ page }) => {
    // Simulate 3G network
    await page.context().newCDPSession(page).then(session => {
      return session.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 1500 * 1024 / 8, // 1.5 Mbps
        uploadThroughput: 750 * 1024 / 8,    // 750 Kbps
        latency: 40
      });
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds on 3G
    expect(loadTime).toBeLessThan(5000);
  });
});