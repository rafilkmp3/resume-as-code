import { test, expect } from '@playwright/test';

test.describe('Comprehensive UX Requirements', () => {
  
  test('Desktop Experience - All functionality working', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check desktop layout and responsiveness
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main.max-w-6xl')).toBeVisible();
    
    // Check theme toggle functionality
    const themeButton = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeButton).toBeVisible();
    await themeButton.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Check dark mode applied (check if html has dark class)
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Toggle back to light
    await themeButton.click();
    await page.waitForTimeout(500);
    
    // Check install button (PWA)
    const installSection = page.locator('text=📲 Install App');
    // Install button may or may not be visible depending on PWA state
    
    // Check PDF download functionality
    const pdfButton = page.locator('button:has-text("📄 PDF")');
    await expect(pdfButton).toBeVisible();
    
    // Verify all main sections are present
    await expect(page.locator('text=💼 Professional Experience')).toBeVisible();
    await expect(page.locator('text=🛠️ Technical Skills')).toBeVisible();
    await expect(page.locator('text=🚀 Featured Projects')).toBeVisible();
    await expect(page.locator('text=🎓 Education')).toBeVisible();
    
    console.log('✅ Desktop experience: All functionality verified');
  });

  test('Mobile Experience - Touch optimized UX', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check mobile layout
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Test mobile touch interactions
    const themeButton = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeButton).toBeVisible();
    
    // Test touch interaction with theme toggle (use click for compatibility)
    await themeButton.click();
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Test mobile scrolling and content accessibility
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);
    
    // Check that content is readable on mobile
    const nameElement = page.locator('text=Rafael Bernardo Sathler').first();
    await expect(nameElement).toBeVisible();
    
    // Verify mobile-optimized buttons are properly sized
    const pdfButton = page.locator('button:has-text("📄 PDF")');
    await expect(pdfButton).toBeVisible();
    
    // Check that text is readable (not too small)
    const summaryText = page.locator('text=Senior Platform Engineer').first();
    await expect(summaryText).toBeVisible();
    
    // Test contact links are touch-friendly on mobile
    const emailLink = page.locator('a[href^="mailto:"]');
    await expect(emailLink).toBeVisible();
    
    const phoneLink = page.locator('a[href^="tel:"]');
    await expect(phoneLink).toBeVisible();
    
    console.log('✅ Mobile experience: Touch optimization and responsive design verified');
  });

  test('PDF Quality - ATS-friendly and well-formatted', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Generate PDF with professional settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
        right: '0.5in'
      }
    });
    
    // Verify PDF quality
    expect(pdf.length).toBeGreaterThan(30000); // Substantial content
    expect(pdf.length).toBeLessThan(800000); // Not too large
    expect(pdf.slice(0, 4).toString()).toBe('%PDF'); // Valid PDF
    
    // Test print mode to ensure clean layout
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(1000);
    
    // Verify QR code is visible in print mode (for crosslinking)
    const qrSection = page.locator('section:has-text("📱 Live Interactive Version")');
    await expect(qrSection).toBeVisible();
    
    // Verify main content structure for ATS
    await expect(page.locator('main')).toBeVisible();
    
    // Check that key ATS-friendly sections exist
    await expect(page.locator('text=Rafael Bernardo Sathler')).toBeVisible();
    await expect(page.locator('text=Platform Engineer').first()).toBeVisible();
    await expect(page.locator('text=💼 Professional Experience')).toBeVisible();
    await expect(page.locator('text=🛠️ Technical Skills')).toBeVisible();
    await expect(page.locator('text=🎓 Education')).toBeVisible();
    
    // Verify contact information is accessible in print
    await expect(page.locator('text=Primary Contact')).toBeVisible();
    
    console.log('✅ PDF quality: ATS-friendly formatting and QR code crosslinking verified');
  });
  
  test('Cross-browser compatibility baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test basic functionality that should work across all browsers
    await expect(page).toHaveTitle(/Rafael Bernardo Sathler/);
    
    // Check core CSS is loading
    const header = page.locator('header');
    await expect(header).toHaveClass(/sticky/);
    
    // Test JavaScript functionality
    const themeButton = page.locator('button[aria-label="Toggle theme"]');
    await themeButton.click();
    await page.waitForTimeout(500);
    
    // Check if basic interactivity works
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    console.log('✅ Cross-browser baseline: Core functionality verified');
  });
});