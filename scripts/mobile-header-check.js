const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function captureMobileHeaderScreenshots() {
  console.log('📸 Capturing mobile header screenshots...');

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
      '..',
      'docs',
      'screenshots',
      'mobile-header-screenshots'
    );
    await fs.mkdir(screenshotDir, { recursive: true });

    // 1. Initial header state
    console.log('📸 1. Initial header state...');
    await page.screenshot({
      path: path.join(screenshotDir, '1-initial-header.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 430, height: 300 },
    });

    // 2. Click download toggle to open dropdown
    console.log('📸 2. Opening download dropdown...');
    await page.click('#download-toggle');
    await page.waitForTimeout(500); // Wait for animation

    await page.screenshot({
      path: path.join(screenshotDir, '2-dropdown-open.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 430, height: 400 },
    });

    // 3. Full header area with dropdown
    console.log('📸 3. Full header area with dropdown...');
    await page.screenshot({
      path: path.join(screenshotDir, '3-full-header-dropdown.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 430, height: 500 },
    });

    // 4. Close dropdown
    console.log('📸 4. Closing dropdown...');
    await page.click('body'); // Click outside to close
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(screenshotDir, '4-dropdown-closed.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 430, height: 300 },
    });

    // 5. Check dark mode toggle visibility
    console.log('📸 5. Checking dark mode toggle...');
    const darkToggle = await page.$('#darkToggle');
    if (darkToggle) {
      const isVisible = await darkToggle.isVisible();
      console.log(`   Dark toggle visible: ${isVisible}`);

      // Try to click dark mode
      if (isVisible) {
        await darkToggle.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: path.join(screenshotDir, '5-dark-mode.png'),
          fullPage: false,
          clip: { x: 0, y: 0, width: 430, height: 300 },
        });
      }
    }

    // 6. Full page screenshot
    console.log('📸 6. Full page mobile view...');
    await page.screenshot({
      path: path.join(screenshotDir, '6-full-page.png'),
      fullPage: true,
    });

    console.log('✅ Screenshots saved to:', screenshotDir);

    // Analyze header structure
    console.log('\n🔍 Analyzing header structure...');

    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      const downloadToggle = document.querySelector('#download-toggle');
      const downloadMenu = document.querySelector('#download-menu');
      const darkToggle = document.querySelector('#darkToggle');

      return {
        headerHeight: header ? header.offsetHeight : 0,
        downloadTogglePosition: downloadToggle
          ? downloadToggle.getBoundingClientRect()
          : null,
        downloadMenuPosition: downloadMenu
          ? downloadMenu.getBoundingClientRect()
          : null,
        darkTogglePosition: darkToggle
          ? darkToggle.getBoundingClientRect()
          : null,
        isDropdownOpen: downloadMenu
          ? downloadMenu.style.display !== 'none'
          : false,
      };
    });

    console.log('Header analysis:', JSON.stringify(headerInfo, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

captureMobileHeaderScreenshots().catch(console.error);
