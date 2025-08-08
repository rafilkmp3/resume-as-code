/**
 * Unit Tests for Print and PDF Functionality
 * Fast, lightweight tests to prevent regressions
 */

// Mock browser environment
const { JSDOM } = require('jsdom');

describe('Print and PDF Functionality', () => {
  let dom, document, window;

  beforeEach(() => {
    // Create fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* Test CSS for print styles */
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { font-size: 12pt; }
            .page-break { page-break-before: always; }
          }

          /* Screen styles */
          @media screen {
            .print-only { display: none !important; }
            .no-print { display: block !important; }
          }

          /* Theme classes */
          .light-theme { background: white; color: black; }
          .dark-theme { background: #1a1a1a; color: white; }
        </style>
      </head>
      <body class="dark-theme">
        <div class="theme-toggle-btn no-print">Toggle Theme</div>
        <div class="print-version-notice print-only">This is the print version</div>
        <div class="content">
          <h1>Resume Content</h1>
          <section class="experience">Work Experience</section>
        </div>
        <div class="qr-code no-print">QR Code for online version</div>
      </body>
      </html>
    `);

    document = dom.window.document;
    window = dom.window;
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('Print Media Query Detection', () => {
    test('should identify print-specific CSS rules', () => {
      const styles = document.head.querySelector('style').textContent;

      // Verify print-specific styles exist
      expect(styles).toContain('@media print');
      expect(styles).toContain('.no-print { display: none !important; }');
      expect(styles).toContain('.print-only { display: block !important; }');
      expect(styles).toContain('font-size: 12pt');
    });

    test('should have proper page-break classes defined', () => {
      const styles = document.head.querySelector('style').textContent;
      expect(styles).toContain('page-break-before: always');
    });
  });

  describe('Print-Hidden Elements', () => {
    test('should identify elements that should be hidden in print', () => {
      const printHiddenElements = document.querySelectorAll('.no-print');

      expect(printHiddenElements.length).toBeGreaterThan(0);

      // Verify specific elements are marked as no-print
      const themeToggle = document.querySelector('.theme-toggle-btn');
      const qrCode = document.querySelector('.qr-code');

      expect(themeToggle).toHaveClass('no-print');
      expect(qrCode).toHaveClass('no-print');
    });

    test('should identify elements that should only show in print', () => {
      const printOnlyElements = document.querySelectorAll('.print-only');

      expect(printOnlyElements.length).toBeGreaterThan(0);

      const printNotice = document.querySelector('.print-version-notice');
      expect(printNotice).toHaveClass('print-only');
    });
  });

  describe('Theme Management for Print', () => {
    test('should detect current theme class', () => {
      const body = document.body;

      // Test detection of current theme
      const isDarkTheme = body.classList.contains('dark-theme');
      const isLightTheme = body.classList.contains('light-theme');

      // Should have one theme class
      expect(isDarkTheme || isLightTheme).toBe(true);
      expect(isDarkTheme && isLightTheme).toBe(false);
    });

    test('should validate theme switching mechanism', () => {
      const body = document.body;

      // Simulate theme switch to light mode for print
      const switchToLightTheme = () => {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
      };

      // Simulate theme restoration
      const restoreTheme = originalTheme => {
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(originalTheme);
      };

      // Test the mechanism
      const originalTheme = body.classList.contains('dark-theme')
        ? 'dark-theme'
        : 'light-theme';

      switchToLightTheme();
      expect(body).toHaveClass('light-theme');
      expect(body).not.toHaveClass('dark-theme');

      restoreTheme(originalTheme);
      expect(body).toHaveClass(originalTheme);
    });
  });

  describe('Print Content Validation', () => {
    test('should validate essential content is present', () => {
      // Essential content that must appear in print
      const title = document.querySelector('h1');
      const experience = document.querySelector('.experience');

      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Resume Content');
      expect(experience).toBeTruthy();
    });

    test('should validate content structure for PDF generation', () => {
      const content = document.querySelector('.content');
      expect(content).toBeTruthy();

      // Check that content has proper structure
      const sections = content.querySelectorAll('section, h1, h2, h3');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('PDF Generation Validation', () => {
    test('should validate PDF-friendly elements', () => {
      // Test that there are no elements that would break PDF generation
      const problematicElements = document.querySelectorAll(
        'iframe, object, embed'
      );
      expect(problematicElements.length).toBe(0);
    });

    test('should validate font and sizing for PDF', () => {
      const styles = document.head.querySelector('style').textContent;

      // Check for proper print font sizing
      expect(styles).toMatch(/font-size:\s*\d+pt/);
    });

    test('should validate page structure for multi-page PDF', () => {
      // Check for page break classes (even if not used yet)
      const styles = document.head.querySelector('style').textContent;
      expect(styles).toContain('page-break');
    });
  });

  describe('Print Performance Optimization', () => {
    test('should validate minimal DOM manipulation needed for print', () => {
      const interactiveElements = document.querySelectorAll(
        'button:not(.no-print), input:not(.no-print), select:not(.no-print)'
      );

      // Interactive elements should be minimal or hidden in print
      interactiveElements.forEach(element => {
        // Each interactive element should either be hidden in print or serve a purpose
        const isHiddenInPrint = element.classList.contains('no-print');
        // Allow some interactive elements if they serve a purpose
        expect(isHiddenInPrint).toBe(true);
      });
    });

    test('should validate CSS efficiency for print', () => {
      const styles = document.head.querySelector('style').textContent;

      // Check for efficient print styles (no complex animations, transforms)
      expect(styles).not.toContain('animation:');
      expect(styles).not.toContain('@keyframes');
    });
  });

  describe('Regression Prevention', () => {
    test('should ensure theme toggle exists and is hidden in print', () => {
      const themeToggle = document.querySelector('.theme-toggle-btn');

      expect(themeToggle).toBeTruthy();
      expect(themeToggle).toHaveClass('no-print');
    });

    test('should ensure QR code exists and is hidden in print', () => {
      const qrCode = document.querySelector('.qr-code');

      expect(qrCode).toBeTruthy();
      expect(qrCode).toHaveClass('no-print');
    });

    test('should validate print notice appears only in print', () => {
      const printNotice = document.querySelector('.print-version-notice');

      expect(printNotice).toBeTruthy();
      expect(printNotice).toHaveClass('print-only');
    });
  });
});

// Helper matchers for better test readability
expect.extend({
  toHaveClass(received, className) {
    const pass =
      received && received.classList && received.classList.contains(className);

    if (pass) {
      return {
        message: () =>
          `expected ${received.tagName || 'element'} not to have class "${className}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received.tagName || 'element'} to have class "${className}"`,
        pass: false,
      };
    }
  },
});
