const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();
  });

  test.afterEach(async ({ page }) => {
    // Stop coverage and clean up
    await page.coverage.stopJSCoverage();
    await page.coverage.stopCSSCoverage();
  });

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load and settle
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitalsData = {};
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            vitalsData.lcp = entries[entries.length - 1].startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID) simulation
        vitalsData.fid = 0; // We'll simulate since it requires real user input
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitalsData.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Give some time for measurements
        setTimeout(() => {
          resolve(vitalsData);
        }, 2000);
      });
    });
    
    // Core Web Vitals thresholds (good values)
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500); // LCP should be < 2.5s
    }
    if (vitals.cls !== undefined) {
      expect(vitals.cls).toBeLessThan(0.1); // CLS should be < 0.1
    }
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      if (src && !src.startsWith('data:')) {
        // Image should have proper loading attribute
        const loading = await img.getAttribute('loading');
        const isAboveFold = await img.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.top < window.innerHeight;
        });
        
        // Images below the fold should have lazy loading
        if (!isAboveFold) {
          expect(loading).toBe('lazy');
        }
        
        // Check image dimensions are reasonable
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        const naturalHeight = await img.evaluate(el => el.naturalHeight);
        const displayWidth = await img.evaluate(el => el.offsetWidth);
        const displayHeight = await img.evaluate(el => el.offsetHeight);
        
        // Images shouldn't be significantly larger than their display size
        if (naturalWidth > 0 && displayWidth > 0) {
          const widthRatio = naturalWidth / displayWidth;
          expect(widthRatio).toBeLessThan(3); // Allow up to 2x for retina displays
        }
      }
    }
  });

  test('should have minimal unused CSS', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    let totalBytes = 0;
    let usedBytes = 0;
    
    for (const entry of cssCoverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedBytes += range.end - range.start - 1;
      }
    }
    
    if (totalBytes > 0) {
      const usagePercentage = (usedBytes / totalBytes) * 100;
      
      // At least 40% of CSS should be used
      expect(usagePercentage).toBeGreaterThan(40);
    }
    
    // Restart coverage for cleanup in afterEach
    await page.coverage.startCSSCoverage();
  });

  test('should have minimal unused JavaScript', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Interact with the page to ensure JS is executed
    const darkToggle = page.locator('#darkToggle');
    if (await darkToggle.count() > 0) {
      await darkToggle.click();
      await page.waitForTimeout(500);
      await darkToggle.click();
    }
    
    const jsCoverage = await page.coverage.stopJSCoverage();
    
    let totalBytes = 0;
    let usedBytes = 0;
    
    for (const entry of jsCoverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedBytes += range.end - range.start - 1;
      }
    }
    
    if (totalBytes > 0) {
      const usagePercentage = (usedBytes / totalBytes) * 100;
      
      // At least 30% of JS should be used
      expect(usagePercentage).toBeGreaterThan(30);
    }
    
    // Restart coverage for cleanup in afterEach
    await page.coverage.startJSCoverage();
  });

  test('should have fast theme toggle performance', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
    
    const darkToggle = page.locator('#darkToggle');
    if (await darkToggle.count() > 0) {
      // Measure theme toggle performance
      const toggleTimes = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await darkToggle.click();
        await page.waitForTimeout(100); // Allow theme to settle
        const endTime = Date.now();
        
        toggleTimes.push(endTime - startTime);
      }
      
      const avgToggleTime = toggleTimes.reduce((a, b) => a + b, 0) / toggleTimes.length;
      
      // Theme toggle should be fast (< 300ms including wait time)
      expect(avgToggleTime).toBeLessThan(300);
    }
  });

  test('should have reasonable bundle sizes', async ({ page }) => {
    const resourceSizes = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.endsWith('.js') || url.endsWith('.css')) {
        response.body().then(body => {
          resourceSizes.push({
            url,
            size: body.length,
            type: url.endsWith('.js') ? 'js' : 'css'
          });
        }).catch(() => {
          // Ignore errors for resources we can't access
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for all resources to be captured
    await page.waitForTimeout(1000);
    
    const totalJSSize = resourceSizes
      .filter(r => r.type === 'js')
      .reduce((total, r) => total + r.size, 0);
    
    const totalCSSSize = resourceSizes
      .filter(r => r.type === 'css')
      .reduce((total, r) => total + r.size, 0);
    
    // Bundle sizes should be reasonable
    if (totalJSSize > 0) {
      expect(totalJSSize).toBeLessThan(500000); // < 500KB JS
    }
    if (totalCSSSize > 0) {
      expect(totalCSSSize).toBeLessThan(200000); // < 200KB CSS
    }
  });

  test('should handle rapid interactions gracefully', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
    
    const darkToggle = page.locator('#darkToggle');
    if (await darkToggle.count() > 0) {
      // Rapidly click the toggle many times
      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        await darkToggle.click();
        // No wait time - test rapid clicking
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should handle rapid clicking without performance issues
      expect(totalTime).toBeLessThan(2000);
      
      // Page should still be responsive
      await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
    }
  });

  test('should have good scroll performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Measure scroll performance
    const scrollStartTime = Date.now();
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);
    
    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    
    const scrollEndTime = Date.now();
    const scrollTime = scrollEndTime - scrollStartTime;
    
    // Scrolling should be smooth and fast
    expect(scrollTime).toBeLessThan(1000);
    
    // Verify we're back at the top
    const scrollTop = await page.evaluate(() => window.scrollY);
    expect(scrollTop).toBe(0);
  });

  test('should maintain performance across device sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 393, height: 852, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      const startTime = Date.now();
      await page.goto('/');
      await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
      const loadTime = Date.now() - startTime;
      
      // Load time should be consistent across devices
      expect(loadTime).toBeLessThan(3000);
      
      // Dark mode toggle should work on all devices
      const darkToggle = page.locator('#darkToggle');
      if (await darkToggle.count() > 0) {
        const toggleStartTime = Date.now();
        await darkToggle.click();
        await page.waitForTimeout(100);
        const toggleTime = Date.now() - toggleStartTime;
        
        expect(toggleTime).toBeLessThan(300);
      }
    }
  });
});