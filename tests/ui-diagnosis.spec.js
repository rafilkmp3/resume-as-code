import { test, expect } from '@playwright/test';

test.describe('UI/UX Diagnosis', () => {
  const PREVIEW_URL = 'https://deploy-preview-79--resume-as-code.netlify.app/';
  const LOCAL_URL = 'http://localhost:4321/';

  // Test both preview and local (comment out if local not running)
  const testUrls = [
    { name: 'Preview', url: PREVIEW_URL },
    // { name: 'Local', url: LOCAL_URL }
  ];

  for (const { name, url } of testUrls) {
    test(`${name}: Dark mode button consistency`, async ({ page }) => {
      await page.goto(url);
      
      // Wait for page to load
      await page.waitForSelector('main');
      
      // Take screenshot in light mode
      await page.screenshot({ 
        path: `test-results/${name.toLowerCase()}-light-mode.png`,
        fullPage: true
      });
      
      // Switch to dark mode
      await page.click('#theme-toggle');
      await page.waitForTimeout(1000); // Wait for transition
      
      // Take screenshot in dark mode
      await page.screenshot({ 
        path: `test-results/${name.toLowerCase()}-dark-mode.png`,
        fullPage: true
      });
      
      // Check all buttons have consistent styling
      const buttons = await page.locator('.glass-button-modern').all();
      console.log(`Found ${buttons.length} glass buttons`);
      
      // Check computed styles of each button
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const styles = await button.evaluate(el => {
          const computed = getComputedStyle(el);
          return {
            background: computed.background,
            border: computed.border,
            backdropFilter: computed.backdropFilter
          };
        });
        console.log(`Button ${i} styles:`, styles);
      }
    });

    test(`${name}: PDF button functionality`, async ({ page }) => {
      await page.goto(url);
      await page.waitForSelector('main');
      
      // Monitor network requests
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('/api/pdf/') || request.url().includes('/pdf-')) {
          requests.push({
            url: request.url(),
            method: request.method()
          });
        }
      });
      
      // Monitor responses
      const responses = [];
      page.on('response', response => {
        if (response.url().includes('/api/pdf/') || response.url().includes('/pdf-')) {
          responses.push({
            url: response.url(),
            status: response.status()
          });
        }
      });
      
      // Try to click each PDF button
      const pdfButtons = await page.locator('a[href*="/api/pdf/"]').all();
      console.log(`Found ${pdfButtons.length} PDF buttons`);
      
      if (pdfButtons.length > 0) {
        // Test first PDF button (Screen PDF)
        const firstButton = pdfButtons[0];
        const href = await firstButton.getAttribute('href');
        console.log(`Testing PDF button with href: ${href}`);
        
        // Don't actually click (would download), just check if URL exists
        const response = await page.request.get(url + href.replace('/', ''));
        console.log(`PDF route response status: ${response.status()}`);
      }
      
      console.log('PDF requests:', requests);
      console.log('PDF responses:', responses);
    });

    test(`${name}: QR modal functionality`, async ({ page }) => {
      await page.goto(url);
      await page.waitForSelector('main');
      
      // Look for QR button
      const qrButton = page.locator('button[onclick*="showQRModal"]');
      const qrButtonExists = await qrButton.count() > 0;
      console.log(`QR button exists: ${qrButtonExists}`);
      
      if (qrButtonExists) {
        // Check if QR image exists
        const response = await page.request.get(url + 'assets/images/qr-code-modal.png');
        console.log(`QR image response status: ${response.status()}`);
        
        // Try to click QR button
        try {
          await qrButton.click();
          await page.waitForTimeout(1000);
          
          // Check if modal opened
          const modal = page.locator('#qr-modal');
          const modalVisible = await modal.evaluate(el => 
            getComputedStyle(el).display !== 'none'
          );
          console.log(`QR modal opened: ${modalVisible}`);
          
          if (modalVisible) {
            // Take screenshot of modal
            await page.screenshot({ 
              path: `test-results/${name.toLowerCase()}-qr-modal.png`
            });
            
            // Try to close modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            const modalClosed = await modal.evaluate(el => 
              getComputedStyle(el).display === 'none'
            );
            console.log(`QR modal closed: ${modalClosed}`);
          }
        } catch (error) {
          console.log(`QR modal error: ${error.message}`);
        }
      }
    });
  }
});