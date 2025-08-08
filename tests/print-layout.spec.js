const { test, expect } = require('@playwright/test');

/**
 * Comprehensive Print Layout Tests
 * Tests all aspects of print/PDF functionality for professional resume output
 * Validates 2024 standards for print-optimized web design
 */

test.describe('Print Layout Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    const filePath = `file://${process.cwd()}/dist/index.html`;
    await page.goto(filePath);
    await page.waitForLoadState('networkidle');

    // Switch to print media emulation
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500); // Allow CSS transitions
  });

  test.describe('Print Content Visibility', () => {
    test('Print - Main content sections are fully visible', async ({
      page,
    }) => {
      // Critical: All main content should be visible
      const mainContent = page.locator('.main-content');
      await expect(mainContent).toBeVisible();

      // All sections should be visible
      const sections = page.locator('.section');
      const sectionCount = await sections.count();
      expect(sectionCount).toBeGreaterThan(0);

      for (let i = 0; i < sectionCount; i++) {
        await expect(sections.nth(i)).toBeVisible();
      }
    });

    test('Print - Work experience items are visible', async ({ page }) => {
      const workItems = page.locator('.work-item');
      const workCount = await workItems.count();

      if (workCount > 0) {
        // First work item should be visible
        await expect(workItems.first()).toBeVisible();

        // Check all work items are visible
        for (let i = 0; i < Math.min(workCount, 5); i++) {
          await expect(workItems.nth(i)).toBeVisible();
        }
      }
    });

    test('Print - Education and projects sections visible', async ({
      page,
    }) => {
      // Education items
      const educationItems = page.locator('.education-item');
      const eduCount = await educationItems.count();
      if (eduCount > 0) {
        await expect(educationItems.first()).toBeVisible();
      }

      // Project items
      const projectItems = page.locator('.project-item');
      const projCount = await projectItems.count();
      if (projCount > 0) {
        await expect(projectItems.first()).toBeVisible();
      }
    });

    test('Print - Header content is visible and readable', async ({ page }) => {
      const header = page.locator('.header');
      await expect(header).toBeVisible();

      // Name should be visible
      const h1 = page.locator('.header h1');
      if ((await h1.count()) > 0) {
        await expect(h1).toBeVisible();
      }

      // Contact info should be visible
      const contactInfo = page.locator('.contact-info');
      if ((await contactInfo.count()) > 0) {
        await expect(contactInfo).toBeVisible();
      }
    });
  });

  test.describe('Print Element Hiding', () => {
    test('Print - Interactive elements are properly hidden', async ({
      page,
    }) => {
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

      // Parallax backgrounds should be hidden
      const parallaxBg = page.locator('.parallax-bg');
      if ((await parallaxBg.count()) > 0) {
        await expect(parallaxBg).toBeHidden();
      }
    });

    test('Print - Social media links are hidden for clean look', async ({
      page,
    }) => {
      const socialLinks = page.locator('.links');
      if ((await socialLinks.count()) > 0) {
        await expect(socialLinks).toBeHidden();
      }
    });

    test('Print - Profile photo is hidden to save space', async ({ page }) => {
      const profilePhoto = page.locator('.profile-photo');
      if ((await profilePhoto.count()) > 0) {
        await expect(profilePhoto).toBeHidden();
      }
    });

    test('Print - Footer is hidden for professional look', async ({ page }) => {
      const footer = page.locator('.footer');
      if ((await footer.count()) > 0) {
        await expect(footer).toBeHidden();
      }
    });
  });

  test.describe('Print Typography and Styling', () => {
    test('Print - Body has correct background and text colors', async ({
      page,
    }) => {
      // Body should have white background and black text
      const body = page.locator('body');
      await expect(body).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(body).toHaveCSS('color', 'rgb(0, 0, 0)');
    });

    test('Print - Content sections have high contrast', async ({ page }) => {
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

    test('Print - Typography uses serif font for readability', async ({
      page,
    }) => {
      const body = page.locator('body');
      const fontFamily = await body.evaluate(
        el => window.getComputedStyle(el).fontFamily
      );

      // Should use Times New Roman or similar serif font
      expect(fontFamily.toLowerCase()).toContain('times');
    });

    test('Print - Font size is optimized for print (11pt)', async ({
      page,
    }) => {
      const body = page.locator('body');
      const fontSize = await body.evaluate(
        el => window.getComputedStyle(el).fontSize
      );

      // Should be around 11pt (14.67px)
      const fontSizePx = parseFloat(fontSize);
      expect(fontSizePx).toBeGreaterThanOrEqual(14);
      expect(fontSizePx).toBeLessThanOrEqual(16);
    });

    test('Print - No shadows or visual effects', async ({ page }) => {
      // Check various elements don't have shadows
      const elementsToCheck = [
        '.work-item',
        '.section',
        '.project-item',
        'h1',
        'h2',
      ];

      for (const selector of elementsToCheck) {
        const elements = page.locator(selector);
        const count = await elements.count();

        if (count > 0) {
          const boxShadow = await elements
            .first()
            .evaluate(el => window.getComputedStyle(el).boxShadow);
          const textShadow = await elements
            .first()
            .evaluate(el => window.getComputedStyle(el).textShadow);

          expect(boxShadow).toBe('none');
          expect(textShadow).toBe('none');
        }
      }
    });
  });

  test.describe('Print Layout Structure', () => {
    test('Print - Single column layout for simplicity', async ({ page }) => {
      // Container should be full width for print
      const container = page.locator('.container');
      if ((await container.count()) > 0) {
        const width = await container.evaluate(
          el => window.getComputedStyle(el).width
        );

        // Should be close to full width (allowing for margins)
        const widthPx = parseFloat(width);
        expect(widthPx).toBeGreaterThan(500); // Reasonable minimum for print
      }
    });

    test('Print - Main content uses block layout', async ({ page }) => {
      const mainContent = page.locator('.main-content');
      if ((await mainContent.count()) > 0) {
        const display = await mainContent.evaluate(
          el => window.getComputedStyle(el).display
        );

        // Should be block or similar for linear print flow
        expect(['block', 'flex', 'grid']).toContain(display);
      }
    });

    test('Print - Sections have proper spacing', async ({ page }) => {
      const sections = page.locator('.section');
      const sectionCount = await sections.count();

      if (sectionCount > 0) {
        // Check first section has some margin/padding
        const firstSection = sections.first();
        const marginTop = await firstSection.evaluate(el =>
          parseFloat(window.getComputedStyle(el).marginTop)
        );
        const paddingTop = await firstSection.evaluate(el =>
          parseFloat(window.getComputedStyle(el).paddingTop)
        );

        // Should have some vertical spacing
        expect(marginTop + paddingTop).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Print Page Breaking', () => {
    test('Print - Work items avoid page breaks inside', async ({ page }) => {
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

    test('Print - Section headers stay with content', async ({ page }) => {
      const sectionHeaders = page.locator('.section h2');
      const headerCount = await sectionHeaders.count();

      for (let i = 0; i < Math.min(headerCount, 3); i++) {
        const header = sectionHeaders.nth(i);
        const pageBreakAfter = await header.evaluate(
          el =>
            window.getComputedStyle(el).pageBreakAfter ||
            window.getComputedStyle(el).breakAfter
        );

        // Should avoid breaking after headers
        expect(['avoid', 'auto']).toContain(pageBreakAfter);
      }
    });

    test('Print - Orphans and widows are controlled', async ({ page }) => {
      const paragraphs = page.locator('p');
      const pCount = await paragraphs.count();

      if (pCount > 0) {
        const firstP = paragraphs.first();
        const orphans = await firstP.evaluate(
          el => window.getComputedStyle(el).orphans
        );
        const widows = await firstP.evaluate(
          el => window.getComputedStyle(el).widows
        );

        // Should have reasonable orphan/widow control
        expect(parseInt(orphans)).toBeGreaterThanOrEqual(2);
        expect(parseInt(widows)).toBeGreaterThanOrEqual(2);
      }
    });
  });

  test.describe('Print Content Integrity', () => {
    test('Print - All text content is preserved', async ({ page }) => {
      // Check that main headings are present
      const h1 = page.locator('h1');
      if ((await h1.count()) > 0) {
        const h1Text = await h1.textContent();
        expect(h1Text.trim().length).toBeGreaterThan(0);
      }

      // Check that work experience has content
      const workItems = page.locator('.work-item');
      const workCount = await workItems.count();
      if (workCount > 0) {
        const firstWorkText = await workItems.first().textContent();
        expect(firstWorkText.trim().length).toBeGreaterThan(10);
      }
    });

    test('Print - Contact information is readable', async ({ page }) => {
      const contactInfo = page.locator('.contact-info');
      if ((await contactInfo.count()) > 0) {
        const contactText = await contactInfo.textContent();
        expect(contactText.trim().length).toBeGreaterThan(0);

        // Should contain some contact details
        const hasEmail =
          contactText.includes('@') || contactText.includes('email');
        const hasPhone =
          /\d{3}/.test(contactText) || contactText.includes('phone');
        const hasLocation =
          contactText.includes('Brazil') || contactText.includes('São Paulo');

        expect(hasEmail || hasPhone || hasLocation).toBe(true);
      }
    });

    test('Print - Skills and technologies are visible', async ({ page }) => {
      // Look for skills section or technology mentions
      const skillsSection = page.locator(
        '.skills, .technologies, [class*="skill"]'
      );
      const skillCount = await skillsSection.count();

      if (skillCount > 0) {
        const skillsText = await skillsSection.first().textContent();
        expect(skillsText.trim().length).toBeGreaterThan(0);
      }
    });

    test('Print - Work experience dates and details preserved', async ({
      page,
    }) => {
      const workItems = page.locator('.work-item');
      const workCount = await workItems.count();

      if (workCount > 0) {
        const firstWork = workItems.first();
        const workText = await firstWork.textContent();

        // Should contain date patterns or duration indicators
        const hasDatePattern = /\d{4}|\d{1,2}\/\d{4}|present|current/i.test(
          workText
        );
        const hasCompanyInfo = workText.length > 50; // Reasonable content length

        expect(hasDatePattern || hasCompanyInfo).toBe(true);
      }
    });
  });

  test.describe('Print Visual Quality', () => {
    test('Print - Layout is not broken or overlapping', async ({ page }) => {
      // Check that header and main content don't overlap
      const header = page.locator('.header');
      const mainContent = page.locator('.main-content');

      if ((await header.count()) > 0 && (await mainContent.count()) > 0) {
        const headerBox = await header.boundingBox();
        const mainBox = await mainContent.boundingBox();

        if (headerBox && mainBox) {
          // Main content should start after header
          expect(mainBox.y).toBeGreaterThanOrEqual(headerBox.y);
        }
      }
    });

    test('Print - Content fits within printable area', async ({ page }) => {
      // Get page dimensions
      const bodyBox = await page.locator('body').boundingBox();

      if (bodyBox) {
        // Content should not be excessively wide (considering margins)
        expect(bodyBox.width).toBeLessThan(1000); // Reasonable for A4/Letter
        expect(bodyBox.height).toBeGreaterThan(100); // Has content
      }
    });

    test('Print - Text is not cut off or invisible', async ({ page }) => {
      // Check that text elements have visible dimensions
      const textElements = page.locator('h1, h2, p, li');
      const textCount = await textElements.count();

      if (textCount > 0) {
        const firstText = textElements.first();
        const textBox = await firstText.boundingBox();

        if (textBox) {
          expect(textBox.width).toBeGreaterThan(0);
          expect(textBox.height).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Print Performance', () => {
    test('Print - Media emulation switches correctly', async ({ page }) => {
      // Switch back to screen and verify
      await page.emulateMedia({ media: 'screen' });
      await page.waitForTimeout(100);

      // Interactive elements should be visible again
      const darkToggle = page.locator('.dark-toggle');
      if ((await darkToggle.count()) > 0) {
        await expect(darkToggle).toBeVisible();
      }

      // Switch back to print
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(100);

      // Interactive elements should be hidden again
      if ((await darkToggle.count()) > 0) {
        await expect(darkToggle).toBeHidden();
      }
    });

    test('Print - Fade-in sections are properly shown', async ({ page }) => {
      const fadeInSections = page.locator('.fade-in-section');
      const fadeCount = await fadeInSections.count();

      for (let i = 0; i < Math.min(fadeCount, 5); i++) {
        const section = fadeInSections.nth(i);

        // Should be visible and fully opaque
        await expect(section).toBeVisible();

        const opacity = await section.evaluate(
          el => window.getComputedStyle(el).opacity
        );
        expect(parseFloat(opacity)).toBe(1);
      }
    });
  });
});
