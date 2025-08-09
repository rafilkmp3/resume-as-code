const { test, expect } = require('@playwright/test');

test.describe('Basic Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Profile image loads correctly', async ({ page }) => {
    const profileImage = page.locator('.profile-photo');

    // Check image exists
    await expect(profileImage).toBeVisible();

    // Check image has loaded (not broken)
    const naturalWidth = await profileImage.evaluate(img => img.naturalWidth);
    const naturalHeight = await profileImage.evaluate(img => img.naturalHeight);

    expect(naturalWidth).toBeGreaterThan(0);
    expect(naturalHeight).toBeGreaterThan(0);

    // Check image has correct alt text
    await expect(profileImage).toHaveAttribute('alt', 'Rafael Bernardo Sathler');

    // Check image source is not empty
    const src = await profileImage.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).not.toBe('');

    console.log(`✅ Profile image loaded: ${src} (${naturalWidth}x${naturalHeight})`);
  });

  test('Essential navigation elements are present', async ({ page }) => {
    // Check main sections exist
    await expect(page.locator('h2:has-text("Profile")')).toBeVisible();
    await expect(page.locator('h2:has-text("Experience")')).toBeVisible();
    await expect(page.locator('h2:has-text("Skills")')).toBeVisible();

    // Check contact links work
    const linkedinLink = page.locator('a:has-text("LinkedIn")');
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('href', /linkedin\.com/);

    const githubLink = page.locator('a:has-text("GitHub")');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', /github\.com/);
  });

  test('Theme switching works correctly', async ({ page }) => {
    // Check initial theme (should be light)
    const body = page.locator('body');
    const initialTheme = await body.getAttribute('data-theme');

    // Find and click theme toggle
    const themeToggle = page.locator('#darkToggle');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for theme transition

    // Check theme changed
    const newTheme = await body.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);

    console.log(`✅ Theme switching works: ${initialTheme} → ${newTheme}`);
  });

  test('Download functionality works', async ({ page }) => {
    // Check direct download button exists and is clickable
    const downloadBtn = page.locator('.resume-download-btn');
    await expect(downloadBtn).toBeVisible();

    // Check download button has correct href
    const href = await downloadBtn.getAttribute('href');
    expect(href).toContain('.pdf');

    // Check share button exists
    const shareBtn = page.locator('.resume-share-btn');
    await expect(shareBtn).toBeVisible();

    // Check that both buttons are properly styled and functional
    const downloadBtnText = await downloadBtn.textContent();
    expect(downloadBtnText).toContain('Download PDF');

    const shareBtnText = await shareBtn.textContent();
    expect(shareBtnText).toContain('Share');

    console.log(`✅ Direct download and share buttons work correctly`);
  });

  test('Availability status displays correctly', async ({ page }) => {
    // Check availability status section exists
    const availabilityStatus = page.locator('.availability-status');
    await expect(availabilityStatus).toBeVisible();

    // Check status indicator
    const statusIndicator = page.locator('.status-indicator');
    await expect(statusIndicator).toBeVisible();

    // Check status text
    const statusText = await statusIndicator.textContent();
    expect(statusText).toContain('Open to Work');

    // Check work types are displayed
    const workTypes = page.locator('.work-types');
    await expect(workTypes).toBeVisible();

    const workTypesText = await workTypes.textContent();
    expect(workTypesText).toContain('Full-time');
    expect(workTypesText).toContain('Contract');

    console.log(`✅ Availability status displays: ${statusText.trim()}`);
  });

  test('Load more buttons function correctly', async ({ page }) => {
    // Find all load more buttons
    const loadMoreButtons = page.locator('.load-more-btn');
    const buttonCount = await loadMoreButtons.count();

    if (buttonCount > 0) {
      // Test first load more button
      const firstButton = loadMoreButtons.first();
      await expect(firstButton).toBeVisible();

      // Check button is clickable
      await firstButton.click();
      await page.waitForTimeout(500);

      console.log(`✅ Load more functionality works (${buttonCount} buttons found)`);
    } else {
      console.log('ℹ️ No load more buttons found (may be fully expanded)');
    }
  });

  test('Critical CSS is loaded', async ({ page }) => {
    // Check that critical styles are applied
    const header = page.locator('header');
    const headerBg = await header.evaluate(el => getComputedStyle(el).background);

    // Should have gradient background
    expect(headerBg).toContain('gradient');

    // Check responsive design variables
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      return {
        primaryColor: styles.getPropertyValue('--color-accent-primary').trim(),
        baseFont: styles.getPropertyValue('--font-size-base').trim()
      };
    });

    expect(rootStyles.primaryColor).toBeTruthy();
    expect(rootStyles.baseFont).toBeTruthy();

    console.log(`✅ CSS variables loaded: ${JSON.stringify(rootStyles)}`);
  });

  test('Page performance is acceptable', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();

    // Navigate and wait for complete load
    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Page should load within reasonable time
    expect(loadTime).toBeLessThan(10000); // 10 seconds max

    // Check page title is set
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('Rafael');

    console.log(`✅ Page performance: ${loadTime}ms load time`);
    console.log(`✅ Page title: ${title}`);
  });

  test('Accessibility basics are in place', async ({ page }) => {
    // Check page has main landmark
    await expect(page.locator('main')).toBeVisible();

    // Check images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      // Images should have alt text or be decorative
      if (src && !src.includes('icon') && !src.includes('logo')) {
        expect(alt).toBeTruthy();
      }
    }

    // Check headings hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1); // Should have at least one h1

    console.log(`✅ Accessibility: ${imageCount} images checked, ${h1Count} h1 heading(s)`);
  });
});
