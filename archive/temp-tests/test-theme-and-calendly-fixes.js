const puppeteer = require('puppeteer');

async function testThemeToggleAndCalendlyFixes() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1280, height: 720 });

  console.log('🔍 Testing theme toggle and Calendly link fixes...');

  // Test Calendly link text
  console.log('📅 Checking Calendly link text...');
  const calendlyLink = await page.$eval('a[href*="calendly"]', el => ({
    text: el.textContent.trim(),
    href: el.href,
    visible: el.offsetWidth > 0 && el.offsetHeight > 0
  }));

  console.log('Calendly Link Info:', calendlyLink);

  // Test theme toggle button
  console.log('🎨 Testing theme toggle functionality...');
  const themeToggle = await page.$('#darkToggle');

  if (themeToggle) {
    // Check initial state
    let currentTheme = await page.evaluate(() =>
      document.body.getAttribute('data-theme') || 'light'
    );
    console.log(`Initial theme: ${currentTheme}`);

    // Take screenshot of initial state
    await page.screenshot({
      path: './visual-evidence/theme-toggle-initial.png',
      fullPage: true
    });

    // Test toggle functionality
    await themeToggle.click();
    await page.waitForTimeout(500);

    let newTheme = await page.evaluate(() =>
      document.body.getAttribute('data-theme') || 'light'
    );
    console.log(`Theme after toggle: ${newTheme}`);

    // Take screenshot after toggle
    await page.screenshot({
      path: './visual-evidence/theme-toggle-after-click.png',
      fullPage: true
    });

    // Check for any text overflow in theme toggle
    const themeToggleInfo = await page.evaluate(() => {
      const toggle = document.getElementById('darkToggle');
      if (!toggle) return { error: 'Toggle not found' };

      return {
        width: toggle.offsetWidth,
        height: toggle.offsetHeight,
        textContent: toggle.textContent.trim(),
        innerHTML: toggle.innerHTML.substring(0, 200) + '...',
        computedStyle: {
          overflow: getComputedStyle(toggle).overflow,
          textOverflow: getComputedStyle(toggle).textOverflow,
          whiteSpace: getComputedStyle(toggle).whiteSpace
        }
      };
    });

    console.log('Theme Toggle Info:', themeToggleInfo);

    // Test both themes
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => {
        document.body.setAttribute('data-theme', theme === 'light' ? '' : theme);
      }, theme);

      await page.waitForTimeout(500);

      // Take focused screenshot of contact section
      const contactSection = await page.$('#contact');
      if (contactSection) {
        await contactSection.screenshot({
          path: `./visual-evidence/contact-section-${theme}-fixed.png`
        });
      }

      // Take focused screenshot of theme toggle area
      const themeUtility = await page.$('.theme-utility');
      if (themeUtility) {
        await themeUtility.screenshot({
          path: `./visual-evidence/theme-toggle-${theme}-fixed.png`
        });
      }
    }
  }

  await browser.close();
  console.log('✅ Theme toggle and Calendly fixes test completed');
}

testThemeToggleAndCalendlyFixes().catch(console.error);
