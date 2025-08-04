const { test, expect } = require('@playwright/test');

test.describe('Dark Mode Toggle Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load completely
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
  });

  test('Dark mode toggle button should be visible and positioned correctly', async ({ page }) => {
    // Check that dark mode toggle button exists and is visible
    const darkToggle = page.locator('#darkToggle');
    await expect(darkToggle).toBeVisible();
    
    // Check button positioning (should be in bottom-right corner)
    const boundingBox = await darkToggle.boundingBox();
    expect(boundingBox).toBeTruthy();
    
    // Check button is properly sized for touch interaction
    expect(boundingBox.width).toBeGreaterThanOrEqual(48); // 3rem = 48px minimum
    expect(boundingBox.height).toBeGreaterThanOrEqual(48);
    
    // Check button has proper styling
    await expect(darkToggle).toHaveCSS('border-radius', '50%');
    await expect(darkToggle).toHaveCSS('position', 'fixed');
  });

  test('Should start in light mode with moon icon', async ({ page }) => {
    const themeIcon = page.locator('#themeIcon');
    
    // Should start with moon icon (indicating light mode)
    await expect(themeIcon).toContainText('🌙');
    
    // Body should not have dark theme attribute initially
    const body = page.locator('body');
    const dataTheme = await body.getAttribute('data-theme');
    expect(dataTheme).toBeNull();
  });

  test('Should toggle to dark mode when clicked', async ({ page }) => {
    const darkToggle = page.locator('#darkToggle');
    const themeIcon = page.locator('#themeIcon');
    const body = page.locator('body');
    
    // Click the toggle button
    await darkToggle.click();
    
    // Wait for theme to change
    await page.waitForTimeout(100);
    
    // Should now show sun icon (indicating dark mode active)
    await expect(themeIcon).toContainText('☀️');
    
    // Body should have dark theme attribute
    await expect(body).toHaveAttribute('data-theme', 'dark');
  });

  test('Should toggle back to light mode on second click', async ({ page }) => {
    const darkToggle = page.locator('#darkToggle');
    const themeIcon = page.locator('#themeIcon');
    const body = page.locator('body');
    
    // First click - go to dark mode
    await darkToggle.click();
    await page.waitForTimeout(100);
    await expect(body).toHaveAttribute('data-theme', 'dark');
    
    // Second click - go back to light mode
    await darkToggle.click();
    await page.waitForTimeout(100);
    
    // Should be back to moon icon (light mode)
    await expect(themeIcon).toContainText('🌙');
    
    // Body should not have dark theme attribute
    const dataTheme = await body.getAttribute('data-theme');
    expect(dataTheme).toBeNull();
  });

  test('Should persist theme preference in localStorage', async ({ page }) => {
    const darkToggle = page.locator('#darkToggle');
    
    // Toggle to dark mode
    await darkToggle.click();
    await page.waitForTimeout(100);
    
    // Check localStorage has theme preference
    const savedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(savedTheme).toBe('dark');
    
    // Reload page and check theme is maintained
    await page.reload();
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
    
    // Should still be in dark mode after reload
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-theme', 'dark');
    
    const themeIcon = page.locator('#themeIcon');
    await expect(themeIcon).toContainText('☀️');
  });

  test('Should apply dark mode styles correctly', async ({ page }) => {
    const darkToggle = page.locator('#darkToggle');
    const body = page.locator('body');
    
    // Get initial background color (light mode)
    const initialBgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Toggle to dark mode
    await darkToggle.click();
    await page.waitForTimeout(200); // Allow time for CSS transitions
    
    // Check that background color changed
    const darkBgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(darkBgColor).not.toBe(initialBgColor);
    
    // Check that dark theme is applied to body
    await expect(body).toHaveAttribute('data-theme', 'dark');
  });

  test('Should handle multiple rapid clicks without breaking', async ({ page }) => {
    const darkToggle = page.locator('#darkToggle');
    const themeIcon = page.locator('#themeIcon');
    
    // Rapidly click the toggle multiple times
    for (let i = 0; i < 5; i++) {
      await darkToggle.click();
      await page.waitForTimeout(50);
    }
    
    // Should end up in dark mode (odd number of clicks)
    await expect(themeIcon).toContainText('☀️');
    
    // One more click should return to light mode
    await darkToggle.click();
    await page.waitForTimeout(100);
    await expect(themeIcon).toContainText('🌙');
  });

  test('Should be keyboard accessible', async ({ page }) => {
    const darkToggle = page.locator('#darkToggle');
    
    // Focus the toggle button with keyboard
    await darkToggle.focus();
    
    // Check button is focused
    await expect(darkToggle).toBeFocused();
    
    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    
    // Should toggle to dark mode
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-theme', 'dark');
  });

  test('Should not interfere with mobile scrolling', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const darkToggle = page.locator('#darkToggle');
    await expect(darkToggle).toBeVisible();
    
    // Scroll down to check button doesn't block content
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);
    
    // Button should still be visible and clickable
    await expect(darkToggle).toBeVisible();
    await darkToggle.click();
    
    // Should still work after scrolling
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-theme', 'dark');
  });

  test('Should take screenshots in both light and dark modes', async ({ page }) => {
    // Take screenshot in light mode
    await page.screenshot({ 
      path: './test-results/light-mode-screenshot.png', 
      fullPage: true 
    });
    
    // Toggle to dark mode
    const darkToggle = page.locator('#darkToggle');
    await darkToggle.click();
    await page.waitForTimeout(300); // Allow time for theme transition
    
    // Take screenshot in dark mode
    await page.screenshot({ 
      path: './test-results/dark-mode-screenshot.png', 
      fullPage: true 
    });
    
    // Verify we're actually in dark mode
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-theme', 'dark');
  });
});