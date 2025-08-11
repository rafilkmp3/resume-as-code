#!/usr/bin/env node

/**
 * Test specifically the load more button centering fix
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testButtonCentering() {
  console.log('🎯 Testing load more button centering...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // Ensure screenshots directory exists
    const screenshotsDir = './test-screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Test Desktop Layout
    console.log('🖥️  Testing Desktop Button Centering...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });
    await desktopPage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    // Wait for content to load
    await desktopPage.waitForSelector('.load-more-container', {
      timeout: 5000,
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Analyze button positioning
    const buttonAnalysis = await desktopPage.evaluate(() => {
      const container = document.querySelector('.load-more-container');
      const button = document.querySelector('.load-more-btn');
      const leftColumn = document.querySelector('.left-column');
      const mainContent = document.querySelector('.main-content');

      if (!container || !button) return { found: false };

      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const leftColumnRect = leftColumn.getBoundingClientRect();
      const mainContentRect = mainContent.getBoundingClientRect();

      // Calculate centers
      const containerCenter = containerRect.left + containerRect.width / 2;
      const leftColumnCenter = leftColumnRect.left + leftColumnRect.width / 2;
      const mainContentCenter =
        mainContentRect.left + mainContentRect.width / 2;
      const pageCenter = window.innerWidth / 2;

      return {
        found: true,
        containerWidth: containerRect.width,
        containerLeft: containerRect.left,
        containerCenter: containerCenter,
        leftColumnCenter: leftColumnCenter,
        mainContentCenter: mainContentCenter,
        pageCenter: pageCenter,
        buttonCenterRelativeToContainer:
          buttonRect.left + buttonRect.width / 2 - containerRect.left,
        buttonCenterRelativeToPage: buttonRect.left + buttonRect.width / 2,
        isCenteredInContainer:
          Math.abs(buttonRect.left + buttonRect.width / 2 - containerCenter) <
          5,
        isCenteredInLeftColumn:
          Math.abs(buttonRect.left + buttonRect.width / 2 - leftColumnCenter) <
          10,
        containerStyles: {
          justifyContent: window.getComputedStyle(container).justifyContent,
          marginRight: window.getComputedStyle(container).marginRight,
          paddingRight: window.getComputedStyle(container).paddingRight,
          width: window.getComputedStyle(container).width,
        },
      };
    });

    console.log('🎯 Button Centering Analysis:');
    console.log(
      `   Container width: ${Math.round(buttonAnalysis.containerWidth)}px`
    );
    console.log(
      `   Container center: ${Math.round(buttonAnalysis.containerCenter)}px`
    );
    console.log(
      `   Left column center: ${Math.round(buttonAnalysis.leftColumnCenter)}px`
    );
    console.log(
      `   Button centered in container: ${buttonAnalysis.isCenteredInContainer ? '✅ YES' : '❌ NO'}`
    );
    console.log(
      `   Button centered in left column: ${buttonAnalysis.isCenteredInLeftColumn ? '✅ YES' : '❌ NO'}`
    );
    console.log(
      `   Container justify-content: ${buttonAnalysis.containerStyles.justifyContent}`
    );
    console.log(
      `   Container margin-right: ${buttonAnalysis.containerStyles.marginRight}`
    );
    console.log(
      `   Container padding-right: ${buttonAnalysis.containerStyles.paddingRight}`
    );

    // Capture button area specifically
    const buttonSection = await desktopPage.$('#experience-section');
    if (buttonSection) {
      await buttonSection.screenshot({
        path: `${screenshotsDir}/load-more-button-centering-test.png`,
      });
    }

    console.log('✅ Button centering test complete');
    await desktopPage.close();
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testButtonCentering().catch(error => {
    console.error('❌ Failed to test button centering:', error);
    process.exit(1);
  });
}

module.exports = { testButtonCentering };
