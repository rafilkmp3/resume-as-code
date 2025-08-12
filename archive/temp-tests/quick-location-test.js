const puppeteer = require('puppeteer');

async function testLocation() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Wait for dev server
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Mobile view
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Screenshot just the header area
  const header = await page.$('.header');
  if (header) {
    await header.screenshot({
      path: './visual-evidence/location-test-mobile.png'
    });
    console.log('📸 Mobile header screenshot saved');
  }

  // Desktop view
  await page.setViewport({ width: 1280, height: 720 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (header) {
    await header.screenshot({
      path: './visual-evidence/location-test-desktop.png'
    });
    console.log('📸 Desktop header screenshot saved');
  }

  await browser.close();
  console.log('✅ Location test completed');
}

testLocation().catch(console.error);
