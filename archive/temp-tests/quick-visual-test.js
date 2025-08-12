const { chromium } = require('playwright');

async function captureHeaderScreenshots() {
  const browser = await chromium.launch();

  try {
    // Desktop viewport
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const desktopPage = await desktopContext.newPage();

    // Navigate to localhost:3001 (serve port)
    await desktopPage.goto('http://localhost:3001');
    await desktopPage.waitForLoadState('networkidle');
    await desktopPage.waitForTimeout(2000);

    // Take header screenshot in light mode
    await desktopPage.screenshot({
      path: 'visual-evidence/header-desktop-light.png',
      clip: { x: 0, y: 0, width: 1280, height: 400 }
    });
    console.log('✓ Desktop light mode header screenshot saved');

    // Switch to dark mode
    await desktopPage.evaluate(() => {
      const toggle = document.getElementById('darkToggle');
      if (toggle) toggle.click();
    });
    await desktopPage.waitForTimeout(1000);

    // Take header screenshot in dark mode
    await desktopPage.screenshot({
      path: 'visual-evidence/header-desktop-dark.png',
      clip: { x: 0, y: 0, width: 1280, height: 400 }
    });
    console.log('✓ Desktop dark mode header screenshot saved');

    await desktopContext.close();

    // Mobile viewport
    const mobileContext = await browser.newContext({
      viewport: { width: 430, height: 932 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto('http://localhost:3001');
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(2000);

    // Mobile light mode
    await mobilePage.screenshot({
      path: 'visual-evidence/header-mobile-light.png',
      clip: { x: 0, y: 0, width: 430, height: 400 }
    });
    console.log('✓ Mobile light mode header screenshot saved');

    // Mobile dark mode
    await mobilePage.evaluate(() => {
      const toggle = document.getElementById('darkToggle');
      if (toggle) toggle.click();
    });
    await mobilePage.waitForTimeout(1000);

    await mobilePage.screenshot({
      path: 'visual-evidence/header-mobile-dark.png',
      clip: { x: 0, y: 0, width: 430, height: 400 }
    });
    console.log('✓ Mobile dark mode header screenshot saved');

    await mobileContext.close();

  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
    process.exit(1);
  }

  await browser.close();
}

captureHeaderScreenshots();
