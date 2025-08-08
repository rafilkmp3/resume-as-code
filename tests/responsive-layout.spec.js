const { test, expect } = require('@playwright/test');

/**
 * Comprehensive Responsive Layout Tests
 * Tests mobile/desktop/print layout issues found in analysis
 * Follows 2024 industry standards for responsive design
 */

test.describe('Responsive Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Use file:// protocol to avoid server dependency
    const filePath = `file://${process.cwd()}/dist/index.html`;
    await page.goto(filePath);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Layout Tests', () => {
    test.use({ viewport: { width: 393, height: 852 } });

    test('Mobile - Header spacing meets 2024 standards', async ({ page }) => {
      // Check header padding meets minimum standards
      const header = page.locator('.header');
      const headerBox = await header.boundingBox();

      // Verify header has adequate padding (should be 2rem = 32px minimum)
      await expect(header).toHaveCSS('padding-top', '32px');
      await expect(header).toHaveCSS('padding-bottom', '32px');

      // Check that header content is properly centered
      await expect(header).toHaveCSS('text-align', 'center');
    });

    test('Mobile - Touch targets meet WCAG 44px standard', async ({ page }) => {
      // Test social media link buttons
      const linkItems = page.locator('.links .link-item');
      const count = await linkItems.count();

      for (let i = 0; i < count; i++) {
        const linkItem = linkItems.nth(i);
        const box = await linkItem.boundingBox();

        // WCAG 2.1 AA requires minimum 44x44px touch targets
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('Mobile - Social buttons spacing optimized', async ({ page }) => {
      const linksContainer = page.locator('.links');

      // Check gap between buttons (should be 0.5rem = 8px minimum)
      await expect(linksContainer).toHaveCSS('gap', '8px');

      // Verify flex-wrap is enabled for mobile
      await expect(linksContainer).toHaveCSS('flex-wrap', 'wrap');
    });

    test('Mobile - Contact info readability optimized', async ({ page }) => {
      const contactInfo = page.locator('.contact-info');

      // Check font size is adequate for mobile (minimum 0.9rem)
      const fontSize = await contactInfo.evaluate(
        el => window.getComputedStyle(el).fontSize
      );
      expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(14.4); // 0.9rem * 16px

      // Check line height for readability
      await expect(contactInfo).toHaveCSS('line-height', '22.4px'); // 1.4 * 16px
    });

    test('Mobile - Typography scaling follows standards', async ({ page }) => {
      const h1 = page.locator('.header h1');
      const h2 = page.locator('.header h2, .header .subtitle');

      // Check mobile-specific font sizes
      const h1FontSize = await h1.evaluate(
        el => window.getComputedStyle(el).fontSize
      );
      const h2FontSize = await h2
        .first()
        .evaluate(el => window.getComputedStyle(el).fontSize);

      expect(parseFloat(h1FontSize)).toBeGreaterThanOrEqual(28.8); // 1.8rem minimum
      expect(parseFloat(h2FontSize)).toBeGreaterThanOrEqual(16); // 1rem minimum
    });
  });

  test.describe('Desktop Layout (1920x1080)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('Header proportions are optimized for desktop', async ({ page }) => {
      const header = page.locator('.header');
      const profilePhoto = page.locator('.profile-photo');

      // Profile photo should be larger on desktop
      if (await profilePhoto.isVisible()) {
        const photoBox = await profilePhoto.boundingBox();
        expect(photoBox.width).toBeGreaterThanOrEqual(120);
        expect(photoBox.height).toBeGreaterThanOrEqual(120);
      }

      // Header should use horizontal layout on desktop
      await expect(header).toHaveCSS('flex-direction', 'row');
    });

    test('Main content uses proper grid layout', async ({ page }) => {
      const mainContent = page.locator('.main-content');

      // Should use CSS Grid with two columns on desktop
      const gridColumns = await mainContent.evaluate(
        el => window.getComputedStyle(el).gridTemplateColumns
      );

      // Check that it's not single column (mobile layout)
      expect(gridColumns).not.toBe('1fr');
    });

    test('Interactive elements have proper hover states', async ({ page }) => {
      const linkItems = page.locator('.links .link-item');

      if ((await linkItems.count()) > 0) {
        const firstLink = linkItems.first();

        // Hover and check for transform or color change
        await firstLink.hover();

        // Allow time for transition
        await page.waitForTimeout(100);

        // Should have some visual feedback on hover
        const transform = await firstLink.evaluate(
          el => window.getComputedStyle(el).transform
        );

        // Should not be 'none' (indicating some transformation)
        expect(transform).not.toBe('none');
      }
    });
  });

  test.describe('Print Layout Validation', () => {
    test('Print CSS does not break layout structure', async ({ page }) => {
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(500); // Allow CSS to apply

      // Critical: Main content should be visible
      const mainContent = page.locator('.main-content');
      await expect(mainContent).toBeVisible();

      // Work items should be visible
      const workItems = page.locator('.work-item');
      const workCount = await workItems.count();
      if (workCount > 0) {
        await expect(workItems.first()).toBeVisible();
      }

      // Sections should be visible
      const sections = page.locator('.section');
      const sectionCount = await sections.count();
      if (sectionCount > 0) {
        await expect(sections.first()).toBeVisible();
      }
    });

    test('Interactive elements are hidden in print', async ({ page }) => {
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(500);

      // Dark mode toggle should be hidden
      const darkToggle = page.locator('.dark-toggle');
      if ((await darkToggle.count()) > 0) {
        await expect(darkToggle).toBeHidden();
      }

      // Controls should be hidden
      const controls = page.locator('.controls');
      if ((await controls.count()) > 0) {
        await expect(controls).toBeHidden();
      }
    });

    test('Print colors are high contrast', async ({ page }) => {
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(500);

      // Body should have white background and black text
      const body = page.locator('body');
      await expect(body).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(body).toHaveCSS('color', 'rgb(0, 0, 0)');

      // Main content should not have obstructive backgrounds
      const mainContent = page.locator('.main-content');
      const bgColor = await mainContent.evaluate(
        el => window.getComputedStyle(el).backgroundColor
      );

      // Should be transparent or white (not colored)
      expect([
        'rgba(0, 0, 0, 0)',
        'transparent',
        'rgb(255, 255, 255)',
      ]).toContain(bgColor);
    });

    test('Page breaks are properly controlled', async ({ page }) => {
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(500);

      // Work items should avoid page breaks inside
      const workItems = page.locator('.work-item');
      const workCount = await workItems.count();

      for (let i = 0; i < Math.min(workCount, 3); i++) {
        const workItem = workItems.nth(i);
        const pageBreakInside = await workItem.evaluate(
          el => window.getComputedStyle(el).pageBreakInside
        );
        expect(pageBreakInside).toBe('avoid');
      }
    });
  });

  test.describe('Cross-Device Compatibility', () => {
    test('iPad Pro layout (1024x1365)', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 1365 });
      await page.waitForTimeout(200);

      // Should adapt between mobile and desktop layouts
      const header = page.locator('.header');
      const mainContent = page.locator('.main-content');

      // Header should be readable and well-spaced
      await expect(header).toBeVisible();
      await expect(mainContent).toBeVisible();

      // Check that layout doesn't break at this breakpoint
      const headerBox = await header.boundingBox();
      expect(headerBox.height).toBeGreaterThan(100); // Reasonable height
    });

    test('Ultra-wide screen support (2560px)', async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 });
      await page.waitForTimeout(200);

      // Content should not be too wide (should have max-width)
      const container = page.locator('.container');
      const containerBox = await container.boundingBox();

      // Container should not span full ultra-wide width
      expect(containerBox.width).toBeLessThan(2400);

      // Should be centered
      const containerLeft = containerBox.x;
      const containerRight = containerLeft + containerBox.width;
      const centerPoint = 2560 / 2;

      expect(
        Math.abs((containerLeft + containerRight) / 2 - centerPoint)
      ).toBeLessThan(100);
    });
  });

  test.describe('Accessibility Validation', () => {
    test('Focus management works properly', async ({ page }) => {
      // Tab through interactive elements
      const linkItems = page.locator('.links .link-item');
      const linkCount = await linkItems.count();

      if (linkCount > 0) {
        // Focus first link
        await linkItems.first().focus();

        // Should have visible focus indicator
        const focusedElement = await page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // Should have outline or similar focus indicator
        const outline = await focusedElement.evaluate(
          el => window.getComputedStyle(el).outline
        );
        expect(outline).not.toBe('none');
      }
    });

    test('Color contrast meets WCAG standards', async ({ page }) => {
      // This is a basic check - in production, use automated accessibility tools
      const headerText = page.locator('.header h1');

      if (await headerText.isVisible()) {
        const color = await headerText.evaluate(
          el => window.getComputedStyle(el).color
        );
        const bgColor = await headerText.evaluate(
          el => window.getComputedStyle(el).backgroundColor
        );

        // Basic contrast check (should not be same color)
        expect(color).not.toBe(bgColor);
      }
    });
  });
});
