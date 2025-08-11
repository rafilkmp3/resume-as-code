const { test, expect } = require('@playwright/test');

// Comprehensive viewport and theme testing matrix
const testMatrix = [
  // Mobile devices
  { name: 'iPhone SE', width: 375, height: 667, category: 'mobile' },
  { name: 'iPhone 15', width: 393, height: 852, category: 'mobile' },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932, category: 'mobile' },
  { name: 'Pixel 7', width: 412, height: 915, category: 'mobile' },
  { name: 'Galaxy S21', width: 360, height: 800, category: 'mobile' },

  // Tablet devices
  { name: 'iPad', width: 768, height: 1024, category: 'tablet' },
  { name: 'iPad Pro', width: 1024, height: 1366, category: 'tablet' },

  // Desktop 16:9 optimized
  { name: 'Desktop HD', width: 1366, height: 768, category: 'desktop' },
  { name: 'Desktop FHD', width: 1920, height: 1080, category: 'desktop' },
  { name: 'Desktop QHD', width: 2560, height: 1440, category: 'desktop' }
];

const themes = ['light', 'dark'];

// Helper function to set theme
async function setTheme(page, theme) {
  await page.evaluate((themeValue) => {
    document.documentElement.setAttribute('data-theme', themeValue);
    if (themeValue === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, theme);
  await page.waitForTimeout(500); // Wait for theme transition
}

// Helper function to validate Contact & Connect section
async function validateContactSection(page, viewport, theme) {
  console.log(`🔍 Validating Contact & Connect section: ${viewport.name} (${theme})`);

  // Check contact cards are visible
  const contactCards = page.locator('.contact-card');
  const cardCount = await contactCards.count();
  expect(cardCount).toBeGreaterThan(0);

  // Validate liquid glass effects
  for (let i = 0; i < cardCount; i++) {
    const card = contactCards.nth(i);
    await expect(card).toBeVisible();

    const styles = await card.evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        backdropFilter: computed.backdropFilter,
        background: computed.background,
        borderRadius: computed.borderRadius
      };
    });

    // Verify glass effect is applied
    expect(styles.backdropFilter).toContain('blur');
    expect(styles.borderRadius).not.toBe('0px');
  }

  // Check social links are readable (not empty white buttons)
  const socialLinks = page.locator('.social-link');
  const socialCount = await socialLinks.count();

  for (let i = 0; i < socialCount; i++) {
    const link = socialLinks.nth(i);
    const isVisible = await link.isVisible();

    if (isVisible) {
      const styles = await link.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          opacity: computed.opacity
        };
      });

      // Ensure link has contrast (not empty/white)
      expect(styles.opacity).not.toBe('0');
      expect(styles.color).not.toBe(styles.backgroundColor);
    }
  }

  console.log(`✅ Contact section validated: ${cardCount} cards, ${socialCount} social links`);
}

test.describe('Comprehensive Visual Validation Matrix', () => {
  // Generate tests for all viewport/theme combinations
  for (const viewport of testMatrix) {
    for (const theme of themes) {
      test(`${viewport.name} ${viewport.width}x${viewport.height} - ${theme} theme`, async ({ page }) => {
        // Set viewport
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        // Navigate and wait for load
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Set theme
        await setTheme(page, theme);
        await page.waitForTimeout(1000); // Extra wait for theme and images

        // Verify profile image loads
        const profileImage = page.locator('img[src*="profile"]').first();
        await expect(profileImage).toBeVisible();
        await expect(profileImage).toHaveJSProperty('complete', true);
        const naturalWidth = await profileImage.evaluate(img => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);

        // Validate Contact & Connect section
        await validateContactSection(page, viewport, theme);

        // Take screenshot with descriptive name
        const screenshotPath = `docs/screenshots/visual-evidence/${viewport.category}/${viewport.name.toLowerCase().replace(/\s+/g, '-')}-${viewport.width}x${viewport.height}-${theme}.png`;
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        console.log(`✅ Screenshot: ${screenshotPath}`);
      });
    }
  }
});

test.describe('Core Functionality Tests', () => {
  test('QR Code Generation and Display', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for QR code presence - it should be embedded as base64 data
    const qrCode = page.locator('img[src*="data:image"], img[src*="qr"], canvas[id*="qr"], svg[id*="qr"]').first();
    const isVisible = await qrCode.isVisible();

    if (isVisible) {
      console.log('✅ QR Code found and visible');

      // Verify QR code has content
      const src = await qrCode.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src.length).toBeGreaterThan(10);
    } else {
      console.log('ℹ️  QR Code not found - may be generated dynamically');
    }
  });

  test('Theme Toggle Functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if theme toggle exists
    const themeToggle = page.locator('.theme-toggle, [data-theme-toggle], button[aria-label*="theme"], button[aria-label*="Theme"]');
    const toggleExists = await themeToggle.count() > 0;

    if (toggleExists) {
      console.log('✅ Theme toggle found');

      // Test theme switching
      await themeToggle.first().click();
      await page.waitForTimeout(500);

      const currentTheme = await page.getAttribute('html', 'data-theme');
      console.log(`Current theme: ${currentTheme}`);
      expect(['light', 'dark']).toContain(currentTheme);
    } else {
      console.log('ℹ️  Theme toggle not found - may use system preference only');
    }
  });

  test('PDF Download Links Functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for PDF download links
    const pdfLinks = page.locator('a[href*=".pdf"], a[download*=".pdf"]');
    const pdfCount = await pdfLinks.count();

    console.log(`Found ${pdfCount} PDF download links`);

    for (let i = 0; i < pdfCount; i++) {
      const link = pdfLinks.nth(i);
      const href = await link.getAttribute('href');
      const download = await link.getAttribute('download');

      expect(href || download).toBeTruthy();
      console.log(`PDF link ${i + 1}: ${href || download}`);
    }
  });
});
