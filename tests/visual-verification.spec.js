const { test, expect } = require('@playwright/test');

test.describe('Visual Verification Tests', () => {
  test('Desktop - Profile Image and UI Elements', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Extra wait for images

    // Verify profile image loads
    const profileImage = page.locator('img[src*="profile"]').first();
    await expect(profileImage).toBeVisible();
    await expect(profileImage).toHaveJSProperty('complete', true);
    const naturalWidth = await profileImage.evaluate(img => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);

    // Take full desktop screenshot
    await page.screenshot({
      path: 'visual-evidence/desktop-verification.png',
      fullPage: true
    });

    console.log('✅ Desktop screenshot generated');
  });

  test('Mobile - Profile Image and Responsive Layout', async ({ page }) => {
    // Set iPhone 15 Pro Max viewport
    await page.setViewportSize({ width: 430, height: 932 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Extra wait for images

    // Verify profile image loads on mobile
    const profileImage = page.locator('img[src*="profile"]').first();
    await expect(profileImage).toBeVisible();
    await expect(profileImage).toHaveJSProperty('complete', true);

    // Take full mobile screenshot
    await page.screenshot({
      path: 'visual-evidence/mobile-verification.png',
      fullPage: true
    });

    console.log('✅ Mobile screenshot generated');
  });

  test('QR Code and Link Button Verification', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for QR code presence
    const qrCode = page.locator('img[src*="qr"], canvas[id*="qr"], svg[id*="qr"]').first();
    if (await qrCode.isVisible()) {
      console.log('✅ QR Code found');
    } else {
      console.log('❌ QR Code missing');
    }

    // Check link buttons for readability
    const linkButtons = page.locator('a[href], button[onclick*="window.open"]');
    const buttonCount = await linkButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = linkButtons.nth(i);
      const styles = await button.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          visibility: computed.visibility,
          opacity: computed.opacity
        };
      });

      console.log(`Link button ${i + 1}:`, styles);
    }
  });
});
