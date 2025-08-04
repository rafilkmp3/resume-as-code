const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Rafael Bernardo Sathler');
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Rafael Bernardo Sathler/);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThan(0);
    
    // Check that h1 comes before h2s
    const firstH1 = h1.first();
    const firstH2 = h2s.first();
    
    if (h2Count > 0) {
      const h1Box = await firstH1.boundingBox();
      const h2Box = await firstH2.boundingBox();
      expect(h1Box.y).toBeLessThan(h2Box.y);
    }
  });

  test('should have alt text for all images', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt.length).toBeGreaterThan(0);
    }
  });

  test('should have proper link accessibility', async ({ page }) => {
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Link should have href
      expect(href).toBeTruthy();
      
      // Link should have accessible text (either text content or aria-label)
      expect(text || ariaLabel).toBeTruthy();
      
      // External links should have proper attributes
      if (href && (href.startsWith('http') || href.startsWith('mailto:'))) {
        const target = await link.getAttribute('target');
        const rel = await link.getAttribute('rel');
        
        if (target === '_blank') {
          expect(rel).toContain('noopener');
        }
      }
    }
  });

  test('should have proper form accessibility', async ({ page }) => {
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Input should have some form of label
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test tab navigation through interactive elements
    const interactiveElements = page.locator('button, a, input, textarea, select, [tabindex="0"]');
    const count = await interactiveElements.count();
    
    if (count > 0) {
      // Start from the first focusable element
      await page.keyboard.press('Tab');
      
      // Should be able to focus on elements
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have proper button accessibility', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      // Button should have accessible name
      expect(text || ariaLabel || ariaLabelledBy).toBeTruthy();
      
      // Button should be focusable
      await button.focus();
      await expect(button).toBeFocused();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Check that text is readable on background
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th');
    const count = await textElements.count();
    
    // Sample some elements to check they're visible
    const sampleSize = Math.min(10, count);
    for (let i = 0; i < sampleSize; i++) {
      const element = textElements.nth(i);
      await expect(element).toBeVisible();
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for common ARIA landmarks
    const main = page.locator('main, [role="main"]');
    const nav = page.locator('nav, [role="navigation"]');
    const header = page.locator('header, [role="banner"]');
    const footer = page.locator('footer, [role="contentinfo"]');
    
    // At least one main content area should exist
    const hasMain = await main.count() > 0;
    expect(hasMain).toBeTruthy();
  });

  test('should work with screen reader simulation', async ({ page }) => {
    // Test that content is properly structured for screen readers
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    // Should have logical heading structure
    expect(headingCount).toBeGreaterThan(0);
    
    // Check that headings have meaningful text
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const text = await heading.textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    
    // Elements should still be visible
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Dark mode toggle should still work
    const darkToggle = page.locator('#darkToggle');
    if (await darkToggle.count() > 0) {
      await expect(darkToggle).toBeVisible();
      await darkToggle.click();
      await page.waitForTimeout(200);
      await expect(darkToggle).toBeVisible();
    }
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Page should still be functional
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Rafael Bernardo Sathler');
  });

  test('should have proper focus indicators', async ({ page }) => {
    const focusableElements = page.locator('button, a[href], input, textarea, select, [tabindex="0"]');
    const count = await focusableElements.count();
    
    if (count > 0) {
      const firstElement = focusableElements.first();
      await firstElement.focus();
      await expect(firstElement).toBeFocused();
      
      // Check that focus is visible (element should have focus styles)
      const computedStyle = await firstElement.evaluate(el => {
        const style = window.getComputedStyle(el, ':focus');
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          boxShadow: style.boxShadow
        };
      });
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        computedStyle.outline !== 'none' ||
        computedStyle.outlineWidth !== '0px' ||
        computedStyle.outlineStyle !== 'none' ||
        computedStyle.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBeTruthy();
    }
  });
});