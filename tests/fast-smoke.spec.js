const { test, expect } = require('@playwright/test');

test.describe('Fast Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    // Wait for essential content to load
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
  });

  test('Page loads and displays essential content', async ({ page }) => {
    // Check critical elements are present
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.contact-info')).toBeVisible();
    await expect(page.locator('.section')).toHaveCount(6); // Adjust based on actual sections
  });

  test('Dark mode toggle works', async ({ page }) => {
    // Test dark mode functionality
    const darkToggle = page.locator('#darkToggle');
    await expect(darkToggle).toBeVisible();

    // Toggle to dark mode
    await darkToggle.click();
    await page.waitForSelector('body[data-theme="dark"]');
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light mode
    await darkToggle.click();
    await page.waitForSelector('body[data-theme="light"]');
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
  });

  test('Profile image loads correctly', async ({ page }) => {
    const profileImg = page.locator('img[alt*="Rafael"]');
    await expect(profileImg).toBeVisible();
    await expect(profileImg).toHaveAttribute('alt');
  });

  test('Contact links are functional', async ({ page }) => {
    // Check that contact links exist and have proper hrefs
    const linkedinLink = page.locator('a[href*="linkedin.com"]').first();
    const githubLink = page.locator('a[href*="github.com"]').first();
    
    await expect(linkedinLink).toBeVisible();
    await expect(githubLink).toBeVisible();
  });

  test('Page is responsive on mobile viewport', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Essential elements should still be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.contact-info')).toBeVisible();
    
    // Dark toggle should be accessible
    await expect(page.locator('#darkToggle')).toBeVisible();
  });

  test('Print media styles applied correctly', async ({ page }) => {
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    // Check that dark toggle is hidden in print (actual behavior)
    const darkToggle = page.locator('#darkToggle');
    const isVisible = await darkToggle.isVisible();
    
    // Dark toggle should be hidden in print
    expect(isVisible).toBeFalsy();
  });

  test('Page accessibility basics', async ({ page }) => {
    await page.waitForSelector('title');
    // Check for basic accessibility attributes
    await expect(page.locator('html')).toHaveAttribute('lang');
    await expect(page.locator('title')).toHaveText(/Rafael/);

    // Check that images have alt text
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt');
    }
  });

  test('No console errors on page load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });
});

test.describe('Fast Integration Tests', () => {
  test('Theme preference persists across page reloads', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Switch to dark mode
    await page.locator('#darkToggle').click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Theme should be preserved
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
  });

  test('Page loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Work experience dates are interactive with hover tooltips', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check that work dates exist
    const workDates = page.locator('.work-date');
    const count = await workDates.count();
    expect(count).toBeGreaterThan(0);
    
    // Check first work date has proper structure
    const firstWorkDate = workDates.first();
    await expect(firstWorkDate).toBeVisible();
    await expect(firstWorkDate.locator('.date-range')).toBeVisible();
    await expect(firstWorkDate.locator('.duration-tooltip')).toBeAttached();
    
    // Check hover behavior and wait for tooltip
    await firstWorkDate.hover();
    const tooltip = firstWorkDate.locator('.duration-tooltip');
    
    // Wait a moment for tooltip to be populated
    await page.waitForTimeout(100);
    
    // Tooltip should contain duration information
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toContain('Duration:');
    expect(tooltipText).toMatch(/Duration: \d+/);
  });

  test('Date hover works on mobile viewports', async ({ page, isMobile }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001');

    // Check that work dates are still accessible on mobile
    const workDates = page.locator('.work-date');
    await expect(workDates.first()).toBeVisible();

    // On mobile, tap should work
    if (isMobile) {
      await workDates.first().tap();
    } else {
      await workDates.first().click();
    }
    const tooltip = workDates.first().locator('.duration-tooltip');
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toContain('Duration:');
  });
});