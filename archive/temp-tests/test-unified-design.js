const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function testUnifiedDesign() {
  console.log('🎨 Testing unified design consistency...');

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
      'unified-design'
    );
    await fs.mkdir(screenshotDir, { recursive: true });

    // 1. Header with unified download button
    console.log('📸 1. Header with unified download button...');
    await page.screenshot({
      path: path.join(screenshotDir, '1-unified-header-buttons.png'),
      fullPage: false,
      clip: { x: 0, y: 350, width: 430, height: 400 },
    });

    // 2. Skills section with unified tags
    console.log('📸 2. Skills section with unified tags...');
    await page.screenshot({
      path: path.join(screenshotDir, '2-unified-skill-tags.png'),
      fullPage: false,
      clip: { x: 0, y: 800, width: 430, height: 600 },
    });

    // 3. Scroll down to find load more button
    console.log('📸 3. Scrolling to find load more button...');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotDir, '3-unified-load-more.png'),
      fullPage: false,
      clip: { x: 0, y: 200, width: 430, height: 400 },
    });

    // 4. Contact links with unified styling
    console.log('📸 4. Contact links with unified styling...');
    await page.screenshot({
      path: path.join(screenshotDir, '4-unified-contact-links.png'),
      fullPage: false,
      clip: { x: 0, y: 600, width: 430, height: 300 },
    });

    // 5. Full page showing all unified elements
    console.log('📸 5. Full page with unified design...');
    await page.screenshot({
      path: path.join(screenshotDir, '5-unified-full-page.png'),
      fullPage: true,
    });

    console.log('✅ Unified design screenshots saved to:', screenshotDir);

    // Analyze button/tag consistency
    console.log('\n🎯 Analyzing design consistency...');

    const consistencyAnalysis = await page.evaluate(() => {
      const elements = {
        skillTags: [...document.querySelectorAll('.skill-tag')],
        loadMoreButtons: [...document.querySelectorAll('.load-more-btn')],
        linkItems: [...document.querySelectorAll('.link-item')],
        downloadToggle: document.querySelector('.download-toggle'),
      };

      const getStyles = element => {
        if (!element) return null;
        const styles = getComputedStyle(element);
        return {
          backgroundColor: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          color: styles.color,
          fontWeight: styles.fontWeight,
          border: styles.border,
        };
      };

      return {
        skillTag: getStyles(elements.skillTags[0]),
        loadMoreButton: getStyles(elements.loadMoreButtons[0]),
        linkItem: getStyles(elements.linkItems[0]),
        downloadToggle: getStyles(elements.downloadToggle),
        counts: {
          skillTags: elements.skillTags.length,
          loadMoreButtons: elements.loadMoreButtons.length,
          linkItems: elements.linkItems.length,
        },
      };
    });

    console.log(
      'Design consistency analysis:',
      JSON.stringify(consistencyAnalysis, null, 2)
    );
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testUnifiedDesign().catch(console.error);
