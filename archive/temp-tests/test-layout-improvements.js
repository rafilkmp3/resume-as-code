#!/usr/bin/env node

/**
 * Comprehensive Layout Improvements Test
 * - Fix Skills column scrollbar issue
 * - Improve PDF download buttons styling
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function analyzeLayoutIssues() {
  console.log('🔍 Analyzing layout issues...');

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

    // Test Desktop Layout Issues
    console.log('🖥️  Testing Desktop Layout (1920x1080)...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });
    await desktopPage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    // Wait for content to load
    await desktopPage.waitForSelector('.right-column', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Analyze Skills column scrollbar issue
    const skillsAnalysis = await desktopPage.evaluate(() => {
      const rightColumn = document.querySelector('.right-column');
      const skillsSection = document.querySelector('.right-column .section');

      if (!rightColumn)
        return { found: false, error: 'Right column not found' };

      const styles = window.getComputedStyle(rightColumn);
      const hasScrollbar = rightColumn.scrollHeight > rightColumn.clientHeight;

      return {
        found: true,
        scrollable: hasScrollbar,
        height: rightColumn.offsetHeight,
        scrollHeight: rightColumn.scrollHeight,
        clientHeight: rightColumn.clientHeight,
        overflow: styles.overflow,
        overflowY: styles.overflowY,
        maxHeight: styles.maxHeight,
        skillsSections: Array.from(
          document.querySelectorAll('.right-column .section')
        ).length,
      };
    });

    console.log('📊 Skills Column Analysis:');
    console.log(
      `   Has scrollbar: ${skillsAnalysis.scrollable ? '❌ YES (problematic)' : '✅ NO (good)'}`
    );
    console.log(`   Height: ${skillsAnalysis.height}px`);
    console.log(`   Scroll height: ${skillsAnalysis.scrollHeight}px`);
    console.log(
      `   Overflow: ${skillsAnalysis.overflow}, ${skillsAnalysis.overflowY}`
    );
    console.log(`   Max height: ${skillsAnalysis.maxHeight}`);

    // Analyze PDF download buttons
    const pdfButtonsAnalysis = await desktopPage.evaluate(() => {
      const pdfSection = document.querySelector('.pdf-download-group');
      const pdfButtons = document.querySelectorAll('.pdf-link');
      const socialButtons = document.querySelectorAll('.link-item');

      if (!pdfSection) return { found: false };

      return {
        found: true,
        pdfButtonCount: pdfButtons.length,
        socialButtonCount: socialButtons.length,
        pdfStyles:
          pdfButtons.length > 0
            ? {
                background: window.getComputedStyle(pdfButtons[0]).background,
                padding: window.getComputedStyle(pdfButtons[0]).padding,
                borderRadius: window.getComputedStyle(pdfButtons[0])
                  .borderRadius,
                fontSize: window.getComputedStyle(pdfButtons[0]).fontSize,
              }
            : null,
        socialStyles:
          socialButtons.length > 0
            ? {
                background: window.getComputedStyle(socialButtons[0])
                  .background,
                padding: window.getComputedStyle(socialButtons[0]).padding,
                borderRadius: window.getComputedStyle(socialButtons[0])
                  .borderRadius,
                fontSize: window.getComputedStyle(socialButtons[0]).fontSize,
              }
            : null,
      };
    });

    console.log('📊 PDF Buttons Analysis:');
    console.log(`   PDF buttons found: ${pdfButtonsAnalysis.pdfButtonCount}`);
    console.log(
      `   Social buttons found: ${pdfButtonsAnalysis.socialButtonCount}`
    );
    if (pdfButtonsAnalysis.pdfStyles && pdfButtonsAnalysis.socialStyles) {
      console.log(
        `   Style consistency: ${JSON.stringify(pdfButtonsAnalysis.pdfStyles) === JSON.stringify(pdfButtonsAnalysis.socialStyles) ? '✅ MATCH' : '❌ DIFFERENT'}`
      );
    }

    // Capture full page screenshot for analysis
    await desktopPage.screenshot({
      path: `${screenshotsDir}/layout-issues-desktop-full.png`,
      fullPage: true,
    });

    // Capture specific sections
    const rightColumn = await desktopPage.$('.right-column');
    if (rightColumn) {
      await rightColumn.screenshot({
        path: `${screenshotsDir}/skills-column-scrollbar-issue.png`,
      });
    }

    const headerSection = await desktopPage.$('.header');
    if (headerSection) {
      await headerSection.screenshot({
        path: `${screenshotsDir}/pdf-buttons-styling-issue.png`,
      });
    }

    console.log('✅ Desktop analysis complete');

    await desktopPage.close();

    console.log('🎉 Layout analysis complete!');
    console.log(`📂 Screenshots saved in: ${screenshotsDir}/`);
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the analysis
if (require.main === module) {
  analyzeLayoutIssues().catch(error => {
    console.error('❌ Failed to analyze layout:', error);
    process.exit(1);
  });
}

module.exports = { analyzeLayoutIssues };
