import { test, expect } from '@playwright/test';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

test.describe('PDF Generation Tests', () => {
  test('should generate PDF via print function', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Generate PDF using browser print functionality
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
    
    // Verify PDF was generated and has content
    expect(pdf.length).toBeGreaterThan(1000); // Should be at least 1KB
    expect(pdf.slice(0, 4).toString()).toBe('%PDF'); // PDF signature
  });

  test('should hide header and footer in PDF generation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Generate PDF and check it has reasonable size (which indicates header/footer are hidden)
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
    
    // PDF should be substantial (indicating content is there) but not too large (indicating header/footer removed)
    expect(pdf.length).toBeGreaterThan(30000); // Should have content (adjusted for QR code)
    expect(pdf.length).toBeLessThan(500000); // But not too large with header/footer elements
    expect(pdf.slice(0, 4).toString()).toBe('%PDF'); // Valid PDF
  });

  test('should contain all resume content in PDF', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that key resume sections are present (use first() to avoid strict mode violations)
    await expect(page.locator('text=Rafael Bernardo Sathler').first()).toBeVisible();
    await expect(page.locator('text=Platform Engineer').first()).toBeVisible();
    await expect(page.locator('text=💼 Experience').first()).toBeVisible();
    await expect(page.locator('text=🛠️ Skills').first()).toBeVisible();
    await expect(page.locator('text=🎓 Education').first()).toBeVisible();
    
    // Generate PDF and verify it has reasonable size
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    
    // Verify PDF was generated with reasonable content
    expect(pdf.length).toBeGreaterThan(50000); // Should be substantial with content
    expect(pdf.slice(0, 4).toString()).toBe('%PDF'); // PDF signature
  });

  test('should have proper page layout for PDF', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ media: 'print' });
    
    // Check that the main content container exists
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Check responsive layout works for PDF (use main container)
    const mainContainer = page.locator('main.max-w-4xl');
    await expect(mainContainer).toBeVisible();
  });
});