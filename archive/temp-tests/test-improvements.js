const puppeteer = require('puppeteer');

async function testImprovements() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Desktop view
  await page.setViewport({ width: 1280, height: 720 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Header test
  const header = await page.$('.header');
  if (header) {
    await header.screenshot({
      path: './visual-evidence/header-fixed-desktop.png'
    });
    console.log('📸 Header fixed - desktop saved');
  }

  // Contact section test
  const contact = await page.$('#contact');
  if (contact) {
    await contact.screenshot({
      path: './visual-evidence/contact-improved-desktop.png'
    });
    console.log('📸 Contact improved - desktop saved');
  }

  // Mobile view
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (header) {
    await header.screenshot({
      path: './visual-evidence/header-fixed-mobile.png'
    });
    console.log('📸 Header fixed - mobile saved');
  }

  if (contact) {
    await contact.screenshot({
      path: './visual-evidence/contact-improved-mobile.png'
    });
    console.log('📸 Contact improved - mobile saved');
  }

  await browser.close();
  console.log('✅ All improvements tested');
}

testImprovements().catch(console.error);
