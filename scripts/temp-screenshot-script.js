
const { test } = require('@playwright/test');

test('macOS Retina Desktop - Dark Mode - Mid Page', async ({ page }) => {
  // Set viewport and device configuration
  await page.setViewportSize({
    width: 2560,
    height: 1600
  });

  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

  // Navigate to the resume (use localhost URL instead of file protocol)
  await page.goto('http://localhost:3001');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Apply theme if dark mode

  await page.evaluate(() => {
    document.body.setAttribute('data-theme', 'dark');
    // Trigger dark mode
    const toggleButton = document.getElementById('darkToggle');
    if (toggleButton) toggleButton.click();
  });
  await page.waitForTimeout(500);


  // Scroll if specified

  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(300);


  // Wait for animations to complete
  await page.waitForTimeout(1000);

  // Take full page screenshot
  await page.screenshot({
    path: '/Users/rafael.sathler/projetos/resume-as-code/docs/screenshots/visual-evidence/macos-retina/macos-retina_dark_scrolled.png',
    fullPage: true,
    animations: 'disabled'
  });
});
