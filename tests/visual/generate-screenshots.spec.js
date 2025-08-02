import { test } from '@playwright/test';

const SCREEN_SIZES = {
  // Mobile Phones
  'iPhone-SE': { width: 375, height: 667 },
  'iPhone-12': { width: 390, height: 844 },
  'iPhone-14-Pro-Max': { width: 430, height: 932 },
  'Samsung-Galaxy-S21': { width: 360, height: 800 },
  'Google-Pixel-7': { width: 412, height: 915 },
  
  // Tablets  
  'iPad-Mini': { width: 768, height: 1024 },
  'iPad-Pro-11': { width: 834, height: 1194 },
  'iPad-Pro-12.9': { width: 1024, height: 1366 },
  
  // Desktop
  'Laptop-13': { width: 1280, height: 800 },
  'Desktop-1080p': { width: 1920, height: 1080 },
  'Desktop-1440p': { width: 2560, height: 1440 },
  'Ultrawide': { width: 3440, height: 1440 }
};

const THEMES = ['light', 'dark'];

test.describe('Generate documentation screenshots', () => {
  for (const theme of THEMES) {
    test(`Generate ${theme} theme screenshots`, async ({ page }) => {
      // Set theme
      if (theme === 'dark') {
        await page.emulateMedia({ colorScheme: 'dark' });
      } else {
        await page.emulateMedia({ colorScheme: 'light' });
      }

      for (const [deviceName, viewport] of Object.entries(SCREEN_SIZES)) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        
        // Wait for theme to apply
        await page.waitForTimeout(500);
        
        // Take full page screenshot
        const screenshotPath = `docs/screenshots/${deviceName}-${theme}-theme.png`;
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: true,
          animations: 'disabled'
        });
        
        console.log(`✅ Generated: ${screenshotPath}`);
      }
    });
  }
  
  test('Generate print preview screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);
    
    // Take print preview screenshot
    await page.screenshot({ 
      path: 'docs/screenshots/print-preview.png', 
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log('✅ Generated: docs/screenshots/print-preview.png');
  });
  
  test('Generate mobile controls demo', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Highlight the mobile controls
    await page.evaluate(() => {
      const controls = document.querySelector('.controls');
      if (controls) {
        controls.style.border = '2px solid #ff6b6b';
        controls.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.5)';
      }
    });
    
    await page.waitForTimeout(200);
    
    // Screenshot focused on the bottom right where controls are
    await page.screenshot({ 
      path: 'docs/screenshots/mobile-controls-demo.png',
      clip: { x: 0, y: 400, width: 390, height: 444 }
    });
    
    console.log('✅ Generated: docs/screenshots/mobile-controls-demo.png');
  });
});