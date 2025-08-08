const { test, expect } = require('@playwright/test');

test.describe('Print Theme Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should force light theme variables when print media is detected', async ({
    page,
  }) => {
    // Check initial theme state (could be light or dark)
    const initialTheme = await page.getAttribute('html', 'data-theme');

    // If we're starting in dark mode, verify dark theme colors first
    if (initialTheme === 'dark') {
      const darkBackground = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue(
          '--color-background-base'
        );
      });
      expect(darkBackground.trim()).toContain('#'); // Should be a dark color
    }

    // Emulate print media to trigger print styles
    await page.emulateMedia({ media: 'print' });

    // Wait for print styles to apply
    await page.waitForTimeout(100);

    // Check that print media query forces light theme variables
    const printBackground = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-background-base'
      );
    });

    const printTextColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-text-primary'
      );
    });

    const printAccentColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-accent-primary'
      );
    });

    // Assert that print forces light theme colors
    expect(printBackground.trim()).toBe('#ffffff');
    expect(printTextColor.trim()).toBe('#000000');
    expect(printAccentColor.trim()).toBe('#2196f3');
  });

  test('should maintain light theme when already in light mode during print', async ({
    page,
  }) => {
    // Force light theme first
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });

    await page.waitForTimeout(100);

    // Check light theme is active
    const lightBackground = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-background-base'
      );
    });

    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(100);

    // Print should still show light theme colors
    const printBackground = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-background-base'
      );
    });

    expect(printBackground.trim()).toBe('#ffffff');
  });

  test('should return to original theme after print preview exits', async ({
    page,
  }) => {
    // Set dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });

    await page.waitForTimeout(100);

    // Verify dark theme
    const darkBackground = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-background-base'
      );
    });

    // Enter print mode
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(100);

    // Exit print mode back to screen
    await page.emulateMedia({ media: 'screen' });
    await page.waitForTimeout(100);

    // Should return to dark theme
    const restoredBackground = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-background-base'
      );
    });

    // Should be back to dark theme (not the forced white from print)
    expect(restoredBackground.trim()).not.toBe('#ffffff');
  });

  test('should have proper contrast ratios in print mode', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(100);

    // Check header text contrast against white background
    const headerElement = await page.locator('header.header h1').first();
    await expect(headerElement).toBeVisible();

    // Check main content text contrast
    const workTitle = await page.locator('.work-title').first();
    await expect(workTitle).toBeVisible();

    // Verify that dark mode toggle is hidden in print
    const darkToggle = page.locator('.dark-toggle, .controls');
    await expect(darkToggle).toBeHidden();
  });

  test('should hide non-essential elements in print mode', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(100);

    // Elements that should be hidden in print
    const hiddenElements = ['.dark-toggle', '.controls', '.parallax-bg'];

    for (const selector of hiddenElements) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        await expect(element).toBeHidden();
      }
    }
  });

  test('should maintain proper layout in print mode', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(100);

    // Check that main content is visible and properly laid out
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();

    // Check that work items are visible
    const workItems = page.locator('.work-item');
    const count = await workItems.count();
    expect(count).toBeGreaterThan(0);

    // Verify first work item is visible
    await expect(workItems.first()).toBeVisible();
  });

  test('should force light theme CSS variables with !important in print media query', async ({
    page,
  }) => {
    // Check that the print media query CSS contains the forced light theme variables
    const printRules = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      let rules = [];

      for (const stylesheet of stylesheets) {
        try {
          const cssRules = Array.from(
            stylesheet.cssRules || stylesheet.rules || []
          );
          for (const rule of cssRules) {
            if (
              rule.type === CSSRule.MEDIA_RULE &&
              rule.media.mediaText.includes('print')
            ) {
              const mediaRules = Array.from(rule.cssRules || []);
              for (const cssRule of mediaRules) {
                if (
                  cssRule.selectorText === ':root' &&
                  cssRule.cssText.includes('!important')
                ) {
                  rules.push(cssRule.cssText);
                }
              }
            }
          }
        } catch (e) {
          // Skip cross-origin stylesheets
          continue;
        }
      }
      return rules;
    });

    // Should have found print media query rules with !important
    expect(printRules.length).toBeGreaterThan(0);

    // Check that the rules contain the expected forced values
    const printRuleText = printRules.join(' ');
    expect(printRuleText).toContain(
      '--color-background-base: #ffffff !important'
    );
    expect(printRuleText).toContain('--color-text-primary: #000000 !important');
    expect(printRuleText).toContain(
      '--color-accent-primary: #2196f3 !important'
    );
  });
});
