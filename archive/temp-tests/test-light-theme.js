const puppeteer = require('puppeteer');

async function testLightTheme() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Switch to light theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });

  await page.setViewport({ width: 1280, height: 720 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Full page screenshot to see theme toggle and location badge
  await page.screenshot({
    path: './visual-evidence/light-theme-full.png'
  });
  console.log('📸 Light theme full page saved');

  // Header only in light theme
  const header = await page.$('.header');
  if (header) {
    await header.screenshot({
      path: './visual-evidence/light-theme-header.png'
    });
    console.log('📸 Light theme header saved');
  }

  await browser.close();
  console.log('✅ Light theme test completed');
}

testLightTheme().catch(console.error);
