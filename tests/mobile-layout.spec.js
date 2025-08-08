const { test, expect } = require('@playwright/test');

test.describe('Mobile Layout Tests', () => {
  test('iPhone 15 Pro Max - should display resume without floating controls blocking content', async ({
    page,
  }) => {
    await page.goto('/');

    // Check that the page loads correctly
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');

    // Verify no floating controls are present
    await expect(page.locator('.controls')).not.toBeVisible();
    await expect(page.locator('.control-btn')).not.toBeVisible();

    // Check that main content is fully accessible
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();

    // Check that profile section is visible and accessible
    const profileSection = page.locator('text=Profile').first();
    await expect(profileSection).toBeVisible();

    // Check that experience section is visible
    const experienceSection = page.locator('text=Experience').first();
    await expect(experienceSection).toBeVisible();

    // Check that skills section is visible
    const skillsSection = page.locator('text=Skills').first();
    await expect(skillsSection).toBeVisible();

    // Take a mobile screenshot for verification
    await page.screenshot({
      path: './test-results/mobile-iphone15-pro-max.png',
      fullPage: true,
    });

    // Verify the page is scrollable without UI interference
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Verify footer is accessible at bottom
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
  });

  test('Mobile - content should be readable and not overlapped', async ({
    page,
  }) => {
    await page.goto('/');

    // Check text is readable and not cut off
    const profileText = page.locator('.profile-summary');
    await expect(profileText).toBeVisible();

    // Verify profile image displays correctly on mobile
    const profileImage = page.locator('.profile-photo');
    await expect(profileImage).toBeVisible();

    // Check that contact info is accessible
    const contactInfo = page.locator('.contact-info');
    await expect(contactInfo).toBeVisible();
  });
});
