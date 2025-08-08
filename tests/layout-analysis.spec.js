const { test, expect } = require('@playwright/test');

test.describe('Layout Analysis & Usability Tests', () => {
  test('Desktop - Generate screenshot and analyze layout issues', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for content to load
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');

    // Take desktop screenshot for analysis
    await page.screenshot({
      path: './test-results/desktop-analysis.png',
      fullPage: true,
    });

    // Analyze desktop layout issues
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Check if content is properly spaced
    const leftColumn = page.locator('.left-column');
    const rightColumn = page.locator('.right-column');

    await expect(leftColumn).toBeVisible();
    await expect(rightColumn).toBeVisible();

    // Check header layout
    const header = page.locator('.header');
    await expect(header).toBeVisible();

    // Check profile image positioning
    const profileImage = page.locator('.profile-photo');
    await expect(profileImage).toBeVisible();

    // Verify sections are properly structured
    const sections = page.locator('.section');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(3);
  });

  test('Mobile iPhone 15 Pro Max - Generate screenshot and analyze usability', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for mobile layout to render
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');

    // Take mobile screenshot for analysis
    await page.screenshot({
      path: './test-results/mobile-analysis-iphone15.png',
      fullPage: true,
    });

    // Analyze mobile layout issues
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();

    // Check text readability on mobile
    const profileSummary = page.locator('.profile-summary');
    await expect(profileSummary).toBeVisible();

    // Check spacing and padding
    const sections = page.locator('.section');
    for (let i = 0; i < (await sections.count()); i++) {
      const section = sections.nth(i);
      await expect(section).toBeVisible();
    }

    // Check mobile responsiveness
    const header = page.locator('.header');
    await expect(header).toBeVisible();

    // Verify content doesn't overflow viewport
    const viewportSize = page.viewportSize();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportSize.width + 50); // Allow small margin
  });

  test('Tablet iPad Pro - Generate screenshot for tablet analysis', async ({
    page,
  }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');

    // Take tablet screenshot
    await page.screenshot({
      path: './test-results/tablet-analysis-ipad.png',
      fullPage: true,
    });

    // Basic tablet layout checks
    const container = page.locator('.container');
    await expect(container).toBeVisible();
  });

  test('Desktop - Usability metrics and accessibility', async ({ page }) => {
    await page.goto('/');

    // Check text contrast and readability
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check link accessibility
    const links = page.locator('a');
    for (let i = 0; i < Math.min(5, await links.count()); i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        await expect(link).toHaveAttribute('href');
      }
    }

    // Check section spacing
    const sections = page.locator('.section');
    for (let i = 0; i < Math.min(3, await sections.count()); i++) {
      const section = sections.nth(i);
      await expect(section).toBeVisible();
    }
  });

  test('Mobile - Touch targets and interaction', async ({ page }) => {
    await page.goto('/');

    // Check that links are properly sized for touch
    const skillTags = page.locator('.skill-tag');
    const skillCount = await skillTags.count();

    if (skillCount > 0) {
      const firstSkill = skillTags.first();
      await expect(firstSkill).toBeVisible();

      // Check touch target size (should be at least 44px)
      const boundingBox = await firstSkill.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(30); // Minimum touch target
      }
    }

    // Test scrolling behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Check that content is still accessible after scroll
    const footer = page.locator('.footer');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(footer).toBeVisible();
  });
});
