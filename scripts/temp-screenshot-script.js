
const { test } = require('@playwright/test');

test('Header SCROLLED - macOS Retina Desktop - Dark Mode', async ({ page }) => {
  // Set viewport and device configuration
  await page.setViewportSize({
    width: 2560,
    height: 1600
  });
  
  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  
  // Navigate to the resume
  await page.goto('http://localhost:3001');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Apply theme if dark mode
  
  await page.evaluate(() => {
    document.body.setAttribute('data-theme', 'dark');
    // Try multiple dark mode triggers
    const toggleButton = document.getElementById('darkToggle');
    if (toggleButton) toggleButton.click();
    
    const darkButton = document.querySelector('.dark-mode-toggle');
    if (darkButton) darkButton.click();
    
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) themeToggle.click();
  });
  await page.waitForTimeout(1000);
  
  
  
  // Scroll down to trigger sticky header or header changes
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
        
  
  // Wait for animations to complete
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({
    path: '/Users/rafael.sathler/projetos/resume-as-code/visual-evidence/macos-retina/header_scrolled_macos-retina_dark.png',
    
    animations: 'disabled'
  });
});
    