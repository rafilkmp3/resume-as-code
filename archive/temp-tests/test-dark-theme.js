const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function testDarkThemeFix() {
  console.log('🌓 Testing dark theme consistency fixes...');

  const browser = await chromium.launch({ headless: true });

  try {
    // iPhone 15 Pro Max viewport
    const context = await browser.newContext({
      viewport: { width: 430, height: 932 },
      deviceScaleFactor: 3,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      hasTouch: true,
      isMobile: true,
    });

    const page = await context.newPage();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Create screenshots directory
    const screenshotDir = path.join(
      __dirname,
      'visual-evidence',
      'theme-comparison'
    );
    await fs.mkdir(screenshotDir, { recursive: true });

    // 1. Light mode - Key Projects section
    console.log('📸 1. Light mode - Key Projects...');
    await page.screenshot({
      path: path.join(screenshotDir, '1-light-projects.png'),
      fullPage: false,
      clip: { x: 0, y: 600, width: 430, height: 800 },
    });

    // 2. Switch to dark mode
    console.log('📸 2. Switching to dark mode...');
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

    // 3. Dark mode - Key Projects section
    console.log('📸 3. Dark mode - Key Projects (fixed)...');
    await page.screenshot({
      path: path.join(screenshotDir, '2-dark-projects-fixed.png'),
      fullPage: false,
      clip: { x: 0, y: 600, width: 430, height: 800 },
    });

    // 4. Full page dark mode comparison
    console.log('📸 4. Full page dark mode...');
    await page.screenshot({
      path: path.join(screenshotDir, '3-dark-full-page.png'),
      fullPage: true,
    });

    console.log('✅ Theme comparison screenshots saved to:', screenshotDir);

    // Analyze theme consistency
    console.log('\n🎨 Analyzing theme colors...');

    const themeAnalysis = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const projectItems = document.querySelectorAll('.project-item');

      return {
        theme: document.body.getAttribute('data-theme'),
        colorSurface: styles.getPropertyValue('--color-surface'),
        colorSurfaceRaised: styles.getPropertyValue('--color-surface-raised'),
        colorSurfaceAccent: styles.getPropertyValue('--color-surface-accent'),
        colorBackground: styles.getPropertyValue('--color-background-base'),
        projectItemsCount: projectItems.length,
        firstProjectBackgroundColor:
          projectItems.length > 0
            ? getComputedStyle(projectItems[0]).backgroundColor
            : null,
      };
    });

    console.log('Theme analysis:', JSON.stringify(themeAnalysis, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testDarkThemeFix().catch(console.error);
