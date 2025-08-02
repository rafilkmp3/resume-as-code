import { test, expect } from '@playwright/test';

const SCREEN_SIZES = {
  // Mobile Phones
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12/13': { width: 390, height: 844 },
  'iPhone 14 Pro Max': { width: 430, height: 932 },
  'Samsung Galaxy S21': { width: 360, height: 800 },
  'Google Pixel 7': { width: 412, height: 915 },
  
  // Tablets  
  'iPad Mini': { width: 768, height: 1024 },
  'iPad Pro 11"': { width: 834, height: 1194 },
  'iPad Pro 12.9"': { width: 1024, height: 1366 },
  
  // Desktop
  'Laptop 13"': { width: 1280, height: 800 },
  'Desktop 1080p': { width: 1920, height: 1080 },
  'Desktop 1440p': { width: 2560, height: 1440 },
  'Ultrawide': { width: 3440, height: 1440 }
};

test('Detect and report layout issues', async ({ page }) => {
  const issues = [];
  
  for (const [deviceName, viewport] of Object.entries(SCREEN_SIZES)) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal overflow
    const horizontalOverflow = await page.evaluate(() => 
      document.body.scrollWidth > window.innerWidth
    );
    if (horizontalOverflow) {
      issues.push(`${deviceName}: Horizontal overflow detected`);
    }
    
    // Check text size on mobile
    if (viewport.width <= 768) {
      const smallTextElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const styles = window.getComputedStyle(el);
          const hasText = el.innerText && el.innerText.trim().length > 0;
          const fontSize = parseFloat(styles.fontSize);
          return hasText && fontSize < 16;
        }).length;
      });
      
      if (smallTextElements > 0) {
        issues.push(`${deviceName}: ${smallTextElements} elements with text smaller than 16px found`);
      }
    }
    
    // Check touch target sizes on mobile
    if (viewport.width <= 768) {
      const smallTargets = await page.evaluate(() => {
        const targets = Array.from(document.querySelectorAll('.contact-link, .skill-tag, .social-link, a, button'));
        return targets.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        }).length;
      });
      
      if (smallTargets > 0) {
        issues.push(`${deviceName}: ${smallTargets} touch targets smaller than 44px found`);
      }
    }
  }
  
  // Report issues for fixing
  if (issues.length > 0) {
    console.log('ISSUES FOUND:', issues);
    throw new Error(`Layout issues detected: ${issues.join(', ')}`);
  }
  
  console.log('No layout issues detected across all screen sizes');
});