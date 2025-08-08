const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Use file:// protocol to avoid server dependency for CI compatibility
    const filePath = `file://${process.cwd()}/dist/index.html`;
    await page.goto(filePath);
    await page.waitForLoadState('networkidle');
    // Wait for page to load completely
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
    // Wait for any animations or transitions to complete
    await page.waitForTimeout(1000);
  });

  test('Desktop layout baseline - Light Mode', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Ensure we're in light mode
    const body = page.locator('body');
    const dataTheme = await body.getAttribute('data-theme');
    if (dataTheme === 'dark') {
      await page.locator('#darkToggle').click();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('desktop-light-baseline.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('Desktop layout baseline - Dark Mode', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Switch to dark mode
    const darkToggle = page.locator('#darkToggle');
    await darkToggle.click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('desktop-dark-baseline.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('Mobile layout baseline - Light Mode', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 }); // iPhone 15 Pro Max

    // Ensure we're in light mode
    const body = page.locator('body');
    const dataTheme = await body.getAttribute('data-theme');
    if (dataTheme === 'dark') {
      await page.locator('#darkToggle').click();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('mobile-light-baseline.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('Mobile layout baseline - Dark Mode', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 }); // iPhone 15 Pro Max

    // Switch to dark mode
    const darkToggle = page.locator('#darkToggle');
    await darkToggle.click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('mobile-dark-baseline.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('Tablet layout baseline - Light Mode', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1365 }); // iPad Pro

    // Ensure we're in light mode
    const body = page.locator('body');
    const dataTheme = await body.getAttribute('data-theme');
    if (dataTheme === 'dark') {
      await page.locator('#darkToggle').click();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('tablet-light-baseline.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('Tablet layout baseline - Dark Mode', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1365 }); // iPad Pro

    // Switch to dark mode
    const darkToggle = page.locator('#darkToggle');
    await darkToggle.click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('tablet-dark-baseline.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('Print layout baseline', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.setViewportSize({ width: 1920, height: 1080 });

    await expect(page).toHaveScreenshot('print-baseline.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('Header section visual consistency', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const header = page.locator('header, .header, h1').first();
    await expect(header).toHaveScreenshot('header-section-baseline.png', {
      threshold: 0.1,
    });
  });

  test('Profile image visual consistency', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const profileImage = page
      .locator('img[alt*="profile"], img[alt*="Rafael"], .profile-image')
      .first();
    if ((await profileImage.count()) > 0) {
      await expect(profileImage).toHaveScreenshot(
        'profile-image-baseline.png',
        {
          threshold: 0.1,
        }
      );
    }
  });

  test('Dark mode toggle visual consistency', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const darkToggle = page.locator('#darkToggle');
    await expect(darkToggle).toHaveScreenshot('dark-toggle-baseline.png', {
      threshold: 0.1,
    });
  });

  test('Cross-browser visual consistency - Chrome vs Firefox', async ({
    page,
    browserName,
  }) => {
    // Only run on Chrome and Firefox
    test.skip(browserName !== 'chromium' && browserName !== 'firefox');

    await page.setViewportSize({ width: 1920, height: 1080 });

    await expect(page).toHaveScreenshot(`${browserName}-baseline.png`, {
      fullPage: true,
      threshold: 0.3, // Allow slightly more variation between browsers
    });
  });
});
