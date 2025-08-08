#!/usr/bin/env node

/**
 * Comprehensive final test for all layout improvements
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testAllFinalFixes() {
  console.log('🎯 Testing ALL final layout improvements...');

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
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test ALL improvements
    const comprehensiveAnalysis = await desktopPage.evaluate(() => {
      const results = {};

      // 1. Skills Column Scrollbar Check
      const rightColumn = document.querySelector('.right-column');
      results.skillsScrollbar = {
        hasScrollbar: rightColumn.scrollHeight > rightColumn.clientHeight,
        overflow: window.getComputedStyle(rightColumn).overflow,
      };

      // 2. PDF Buttons Styling Check
      const pdfButtons = document.querySelectorAll('.pdf-button');
      const socialButtons = document.querySelectorAll(
        '.link-item:not(.pdf-button)'
      );
      results.pdfButtons = {
        count: pdfButtons.length,
        socialCount: socialButtons.length,
        useSameLinkItemClass:
          pdfButtons.length > 0 &&
          pdfButtons[0].classList.contains('link-item'),
      };

      // 3. Date Display Simplification Check
      const workDates = document.querySelectorAll('.work-date');
      results.dateDisplay = {
        count: workDates.length,
        hasComplexPopup: document.querySelector('.duration-details') !== null,
        hasOverlayBadge: document.querySelector('.duration-badge') !== null,
        isSimplified: workDates.length > 0 && workDates[0].children.length <= 2,
      };

      // 4. Load More Button Centering Check
      const loadMoreContainer = document.querySelector('.load-more-container');
      const loadMoreButton = document.querySelector('.load-more-btn');
      if (loadMoreContainer && loadMoreButton) {
        const containerRect = loadMoreContainer.getBoundingClientRect();
        const buttonRect = loadMoreButton.getBoundingClientRect();
        const pageCenter = window.innerWidth / 2;
        const buttonCenter = buttonRect.left + buttonRect.width / 2;

        results.loadMoreCentering = {
          found: true,
          containerWidth: containerRect.width,
          buttonCenterDistance: Math.abs(buttonCenter - pageCenter),
          isCenteredInPage: Math.abs(buttonCenter - pageCenter) < 20, // 20px tolerance
          containerJustifyContent:
            window.getComputedStyle(loadMoreContainer).justifyContent,
        };
      } else {
        results.loadMoreCentering = { found: false };
      }

      // 5. Experience Counter Check
      const shownCount = document.getElementById('shown-count');
      const totalCount = document.getElementById('total-count');
      const workItems = document.querySelectorAll(
        '.work-item:not(.project-item)'
      );
      const visibleWorkItems = Array.from(workItems).filter(
        item =>
          window.getComputedStyle(item).display !== 'none' &&
          !item.classList.contains('hidden')
      );

      results.experienceCounter = {
        shownCountText: shownCount ? shownCount.textContent : 'not found',
        totalCountText: totalCount ? totalCount.textContent : 'not found',
        actualWorkItems: workItems.length,
        actualVisibleItems: visibleWorkItems.length,
        counterAccurate:
          shownCount &&
          parseInt(shownCount.textContent) === visibleWorkItems.length,
      };

      return results;
    });

    // Report results
    console.log('📊 COMPREHENSIVE LAYOUT ANALYSIS:');
    console.log('');

    console.log('1️⃣  SKILLS COLUMN SCROLLBAR:');
    console.log(
      `   Has scrollbar: ${comprehensiveAnalysis.skillsScrollbar.hasScrollbar ? '❌ YES (problematic)' : '✅ NO (fixed)'}`
    );
    console.log(
      `   Overflow setting: ${comprehensiveAnalysis.skillsScrollbar.overflow}`
    );
    console.log('');

    console.log('2️⃣  PDF BUTTONS STYLING:');
    console.log(
      `   PDF buttons found: ${comprehensiveAnalysis.pdfButtons.count}`
    );
    console.log(
      `   Uses link-item class: ${comprehensiveAnalysis.pdfButtons.useSameLinkItemClass ? '✅ YES (consistent)' : '❌ NO (inconsistent)'}`
    );
    console.log('');

    console.log('3️⃣  DATE DISPLAY SIMPLIFICATION:');
    console.log(`   Date elements: ${comprehensiveAnalysis.dateDisplay.count}`);
    console.log(
      `   Complex popups removed: ${!comprehensiveAnalysis.dateDisplay.hasComplexPopup ? '✅ YES (simplified)' : '❌ NO (still complex)'}`
    );
    console.log(
      `   Overlay badges removed: ${!comprehensiveAnalysis.dateDisplay.hasOverlayBadge ? '✅ YES (clean)' : '❌ NO (still present)'}`
    );
    console.log(
      `   Structure simplified: ${comprehensiveAnalysis.dateDisplay.isSimplified ? '✅ YES (clean)' : '❌ NO (still complex)'}`
    );
    console.log('');

    console.log('4️⃣  LOAD MORE BUTTON CENTERING:');
    if (comprehensiveAnalysis.loadMoreCentering.found) {
      console.log(
        `   Container width: ${Math.round(comprehensiveAnalysis.loadMoreCentering.containerWidth)}px`
      );
      console.log(
        `   Distance from page center: ${Math.round(comprehensiveAnalysis.loadMoreCentering.buttonCenterDistance)}px`
      );
      console.log(
        `   Properly centered: ${comprehensiveAnalysis.loadMoreCentering.isCenteredInPage ? '✅ YES (centered)' : '❌ NO (off-center)'}`
      );
      console.log(
        `   Justify content: ${comprehensiveAnalysis.loadMoreCentering.containerJustifyContent}`
      );
    } else {
      console.log('   ❌ Load more button not found');
    }
    console.log('');

    console.log('5️⃣  EXPERIENCE COUNTER ACCURACY:');
    console.log(
      `   Counter shows: "${comprehensiveAnalysis.experienceCounter.shownCountText} of ${comprehensiveAnalysis.experienceCounter.totalCountText}"`
    );
    console.log(
      `   Actual visible items: ${comprehensiveAnalysis.experienceCounter.actualVisibleItems}`
    );
    console.log(
      `   Counter accurate: ${comprehensiveAnalysis.experienceCounter.counterAccurate ? '✅ YES (correct)' : '❌ NO (incorrect)'}`
    );
    console.log('');

    // Capture comprehensive screenshot
    await desktopPage.screenshot({
      path: `${screenshotsDir}/final-comprehensive-layout-test.png`,
      fullPage: true,
    });

    console.log('✅ Desktop comprehensive test complete');
    await desktopPage.close();

    // Test Mobile Layout
    console.log('📱 Testing Mobile Profile Spacing...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 430, height: 932 });
    await mobilePage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    await mobilePage.waitForSelector('.profile-photo', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test mobile profile spacing
    const mobileSpacing = await mobilePage.evaluate(() => {
      const profilePhoto = document.querySelector('.profile-photo');
      const headerContent = document.querySelector('.header-content');

      if (!profilePhoto || !headerContent) return { found: false };

      const photoRect = profilePhoto.getBoundingClientRect();
      const contentRect = headerContent.getBoundingClientRect();
      const spacingBetween =
        contentRect.top - (photoRect.top + photoRect.height);

      return {
        found: true,
        photoMarginBottom: window.getComputedStyle(profilePhoto).marginBottom,
        spacingBetween: spacingBetween,
        isWellSpaced: spacingBetween >= 20, // At least 20px spacing
      };
    });

    console.log('6️⃣  MOBILE PROFILE SPACING:');
    if (mobileSpacing.found) {
      console.log(`   Photo margin-bottom: ${mobileSpacing.photoMarginBottom}`);
      console.log(
        `   Actual spacing: ${Math.round(mobileSpacing.spacingBetween)}px`
      );
      console.log(
        `   Well spaced: ${mobileSpacing.isWellSpaced ? '✅ YES (good spacing)' : '❌ NO (too tight)'}`
      );
    } else {
      console.log('   ❌ Mobile profile elements not found');
    }

    // Capture mobile header
    const mobileHeader = await mobilePage.$('.header');
    if (mobileHeader) {
      await mobileHeader.screenshot({
        path: `${screenshotsDir}/final-mobile-profile-spacing.png`,
      });
    }

    console.log('✅ Mobile testing complete');
    await mobilePage.close();

    console.log('');
    console.log('🎉 ALL COMPREHENSIVE LAYOUT TESTS COMPLETE!');
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
  testAllFinalFixes().catch(error => {
    console.error('❌ Failed to test final fixes:', error);
    process.exit(1);
  });
}

module.exports = { testAllFinalFixes };
