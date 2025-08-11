#!/usr/bin/env node

/**
 * Test final layout fixes including date display and load more button centering
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testFinalFixes() {
  console.log('🔍 Testing final layout fixes...');

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
    console.log('🖥️  Testing Final Desktop Layout...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });
    await desktopPage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    // Wait for content to load
    await desktopPage.waitForSelector('.work-item', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test date display fixes
    const dateAnalysis = await desktopPage.evaluate(() => {
      const workDates = document.querySelectorAll('.work-date');
      const loadMoreBtns = document.querySelectorAll('.load-more-btn');
      const loadMoreContainers = document.querySelectorAll(
        '.load-more-container'
      );

      return {
        dateElements: workDates.length,
        loadMoreButtons: loadMoreBtns.length,
        loadMoreContainers: loadMoreContainers.length,
        dateStyles:
          workDates.length > 0
            ? {
                hasComplexPopup:
                  document.querySelector('.duration-details') !== null,
                hasOverlayBadge:
                  document.querySelector('.duration-badge') !== null,
                isSimplified: workDates[0].children.length <= 2,
              }
            : null,
        loadMoreCentering:
          loadMoreContainers.length > 0
            ? {
                justifyContent: window.getComputedStyle(loadMoreContainers[0])
                  .justifyContent,
                textAlign: window.getComputedStyle(loadMoreContainers[0])
                  .textAlign,
                display: window.getComputedStyle(loadMoreContainers[0]).display,
              }
            : null,
      };
    });

    console.log('📊 Final Layout Analysis:');
    console.log(`   Date elements found: ${dateAnalysis.dateElements}`);
    console.log(`   Load more buttons: ${dateAnalysis.loadMoreButtons}`);

    if (dateAnalysis.dateStyles) {
      console.log(
        `   Date popup complexity: ${dateAnalysis.dateStyles.hasComplexPopup ? '❌ Still complex' : '✅ Simplified'}`
      );
      console.log(
        `   Date overlay badges: ${dateAnalysis.dateStyles.hasOverlayBadge ? '❌ Still present' : '✅ Removed'}`
      );
      console.log(
        `   Date structure simplified: ${dateAnalysis.dateStyles.isSimplified ? '✅ YES' : '❌ Still complex'}`
      );
    }

    if (dateAnalysis.loadMoreCentering) {
      console.log(
        `   Load more centering: ${dateAnalysis.loadMoreCentering.justifyContent === 'center' ? '✅ Centered' : '❌ Not centered'}`
      );
    }

    // Capture full page
    await desktopPage.screenshot({
      path: `${screenshotsDir}/final-layout-desktop-complete.png`,
      fullPage: true,
    });

    // Capture work experience section specifically
    const workSection = await desktopPage.$('#experience-section');
    if (workSection) {
      await workSection.screenshot({
        path: `${screenshotsDir}/final-work-experience-section.png`,
      });
    }

    console.log('✅ Desktop testing complete');
    await desktopPage.close();

    console.log('🎉 All final fixes tested!');
    console.log(`📂 Screenshots saved in: ${screenshotsDir}/`);
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testFinalFixes().catch(error => {
    console.error('❌ Failed to test final fixes:', error);
    process.exit(1);
  });
}

module.exports = { testFinalFixes };
