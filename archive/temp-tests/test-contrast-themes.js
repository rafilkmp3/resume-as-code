const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function testContrastAndThemes() {
  console.log('🔍 Testing light/dark themes across mobile and desktop...');

  const browser = await chromium.launch({ headless: true });

  try {
    const screenshotDir = path.join(
      __dirname,
      'visual-evidence',
      'contrast-accessibility'
    );
    await fs.mkdir(screenshotDir, { recursive: true });

    const testConfigs = [
      {
        name: 'mobile-light',
        viewport: { width: 430, height: 932 },
        deviceScaleFactor: 3,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        hasTouch: true,
        isMobile: true,
        theme: 'light',
      },
      {
        name: 'mobile-dark',
        viewport: { width: 430, height: 932 },
        deviceScaleFactor: 3,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        hasTouch: true,
        isMobile: true,
        theme: 'dark',
      },
      {
        name: 'desktop-light',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        hasTouch: false,
        isMobile: false,
        theme: 'light',
      },
      {
        name: 'desktop-dark',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        hasTouch: false,
        isMobile: false,
        theme: 'dark',
      },
    ];

    const results = {};

    for (const config of testConfigs) {
      console.log(`\n📱 Testing ${config.name} (${config.theme} theme)...`);

      const context = await browser.newContext({
        viewport: config.viewport,
        deviceScaleFactor: config.deviceScaleFactor,
        userAgent: config.userAgent,
        hasTouch: config.hasTouch,
        isMobile: config.isMobile,
      });

      const page = await context.newPage();
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Apply theme
      if (config.theme === 'dark') {
        await page.evaluate(() => {
          document.body.setAttribute('data-theme', 'dark');
          // Force dark mode activation
          localStorage.setItem('theme', 'dark');
        });
        await page.waitForTimeout(1000);
      }

      // 1. Full page screenshot
      console.log(`📸 1. ${config.name} - Full page...`);
      await page.screenshot({
        path: path.join(screenshotDir, `${config.name}-full-page.png`),
        fullPage: true,
      });

      // 2. Header section (critical for readability)
      console.log(`📸 2. ${config.name} - Header section...`);
      const headerHeight = config.isMobile ? 600 : 400;
      await page.screenshot({
        path: path.join(screenshotDir, `${config.name}-header.png`),
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: config.viewport.width,
          height: headerHeight,
        },
      });

      // 3. Interactive elements section
      console.log(`📸 3. ${config.name} - Interactive elements...`);
      const skillsPosition = config.isMobile ? 800 : 500;
      await page.screenshot({
        path: path.join(screenshotDir, `${config.name}-interactive.png`),
        fullPage: false,
        clip: {
          x: 0,
          y: skillsPosition,
          width: config.viewport.width,
          height: 400,
        },
      });

      // 4. Test dropdown functionality
      console.log(`📸 4. ${config.name} - Testing dropdown...`);
      try {
        await page.click('#download-toggle');
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(screenshotDir, `${config.name}-dropdown-open.png`),
          fullPage: false,
          clip: {
            x: 0,
            y: headerHeight - 100,
            width: config.viewport.width,
            height: 300,
          },
        });
        // Close dropdown
        await page.click('body');
        await page.waitForTimeout(300);
      } catch (error) {
        console.warn(
          `⚠️  Dropdown test failed for ${config.name}:`,
          error.message
        );
      }

      // 5. Analyze contrast and accessibility
      console.log(`🔍 5. ${config.name} - Analyzing contrast...`);
      const analysis = await page.evaluate(themeName => {
        const getContrastRatio = (color1, color2) => {
          // Simple contrast ratio calculation (simplified)
          const getLuminance = color => {
            const rgb = color.match(/\\d+/g);
            if (!rgb || rgb.length < 3) return 0;
            const [r, g, b] = rgb.map(c => {
              c = parseInt(c) / 255;
              return c <= 0.03928
                ? c / 12.92
                : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };

          const l1 = getLuminance(color1);
          const l2 = getLuminance(color2);
          return l1 > l2
            ? (l1 + 0.05) / (l2 + 0.05)
            : (l2 + 0.05) / (l1 + 0.05);
        };

        const elements = {
          body: document.body,
          skillTags: document.querySelectorAll('.skill-tag'),
          loadMoreBtns: document.querySelectorAll('.load-more-btn'),
          linkItems: document.querySelectorAll('.link-item'),
          downloadToggle: document.querySelector('.download-toggle'),
          workItems: document.querySelectorAll('.work-item'),
        };

        const styles = getComputedStyle(document.documentElement);
        const bodyStyles = getComputedStyle(elements.body);

        return {
          theme: themeName,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          cssVariables: {
            backgroundBase: styles.getPropertyValue('--color-background-base'),
            accentPrimary: styles.getPropertyValue('--color-accent-primary'),
            textDefault: styles.getPropertyValue('--color-text-default'),
            surfaceRaised: styles.getPropertyValue('--color-surface-raised'),
          },
          computedStyles: {
            bodyBackground: bodyStyles.backgroundColor,
            bodyColor: bodyStyles.color,
          },
          elementCounts: {
            skillTags: elements.skillTags.length,
            loadMoreBtns: elements.loadMoreBtns.length,
            linkItems: elements.linkItems.length,
            workItems: elements.workItems.length,
          },
          interactiveElements: {
            skillTag: elements.skillTags[0]
              ? {
                  backgroundColor: getComputedStyle(elements.skillTags[0])
                    .backgroundColor,
                  color: getComputedStyle(elements.skillTags[0]).color,
                  fontSize: getComputedStyle(elements.skillTags[0]).fontSize,
                }
              : null,
            loadMoreBtn: elements.loadMoreBtns[0]
              ? {
                  backgroundColor: getComputedStyle(elements.loadMoreBtns[0])
                    .backgroundColor,
                  color: getComputedStyle(elements.loadMoreBtns[0]).color,
                  fontSize: getComputedStyle(elements.loadMoreBtns[0]).fontSize,
                }
              : null,
            downloadToggle: elements.downloadToggle
              ? {
                  backgroundColor: getComputedStyle(elements.downloadToggle)
                    .backgroundColor,
                  color: getComputedStyle(elements.downloadToggle).color,
                  fontSize: getComputedStyle(elements.downloadToggle).fontSize,
                }
              : null,
          },
        };
      }, config.theme);

      results[config.name] = analysis;

      await context.close();
      console.log(`✅ ${config.name} complete`);
    }

    // Save analysis results
    await fs.writeFile(
      path.join(screenshotDir, 'contrast-analysis.json'),
      JSON.stringify(results, null, 2)
    );

    console.log('\n✅ All theme tests completed!');
    console.log('📁 Screenshots and analysis saved to:', screenshotDir);

    // Summary analysis
    console.log('\n📊 SUMMARY ANALYSIS:');
    Object.entries(results).forEach(([config, data]) => {
      console.log(`\n${config.toUpperCase()}:`);
      console.log(`  Theme: ${data.theme}`);
      console.log(`  Viewport: ${data.viewport.width}x${data.viewport.height}`);
      console.log(
        `  Interactive Elements: ${data.elementCounts.skillTags} skills, ${data.elementCounts.loadMoreBtns} buttons`
      );
      console.log(`  Background: ${data.computedStyles.bodyBackground}`);
      console.log(`  Text Color: ${data.computedStyles.bodyColor}`);
      if (data.interactiveElements.skillTag) {
        console.log(
          `  Skill Tag: ${data.interactiveElements.skillTag.backgroundColor} on ${data.interactiveElements.skillTag.color}`
        );
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testContrastAndThemes().catch(console.error);
