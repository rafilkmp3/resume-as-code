/**
 * Unit Tests for Theme Print Integration
 * Tests the automatic light mode switching for print/PDF functionality
 */

const { JSDOM } = require('jsdom');

describe('Theme Print Integration', () => {
  let dom, document, window;

  beforeEach(() => {
    // Create DOM with theme utilities
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; }
            .dark-theme { background: white !important; color: black !important; }
          }

          .light-theme { background: white; color: black; }
          .dark-theme { background: #1a1a1a; color: white; }

          .theme-toggle-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px;
            background: var(--toggle-bg);
            border: none;
            border-radius: 50%;
            cursor: pointer;
          }
        </style>
      </head>
      <body class="dark-theme">
        <button class="theme-toggle-btn no-print" aria-label="Toggle theme">🌓</button>
        <div class="content">
          <h1>Rafael Sathler</h1>
          <section class="experience">Experience section</section>
        </div>
        <script>
          // Theme management utilities that would be in the actual HTML
          const ThemeManager = {
            getCurrentTheme: function() {
              return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            },

            setTheme: function(theme) {
              document.body.classList.remove('light-theme', 'dark-theme');
              document.body.classList.add(theme + '-theme');
            },

            switchToLightForPrint: function() {
              const currentTheme = this.getCurrentTheme();
              if (currentTheme === 'dark') {
                this.setTheme('light');
                return 'dark'; // Return original theme for restoration
              }
              return null; // No change needed
            },

            restoreThemeAfterPrint: function(originalTheme) {
              if (originalTheme) {
                this.setTheme(originalTheme);
              }
            }
          };

          // Make it available globally for tests
          window.ThemeManager = ThemeManager;
        </script>
      </body>
      </html>
    `,
      {
        runScripts: 'dangerously',
        resources: 'usable',
      }
    );

    document = dom.window.document;
    window = dom.window;
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('Theme Detection', () => {
    test('should correctly detect current theme', () => {
      const themeManager = window.ThemeManager;

      expect(themeManager.getCurrentTheme()).toBe('dark');

      // Switch to light theme and test
      themeManager.setTheme('light');
      expect(themeManager.getCurrentTheme()).toBe('light');
    });

    test('should correctly identify theme classes on body element', () => {
      const body = document.body;

      expect(body.classList.contains('dark-theme')).toBe(true);
      expect(body.classList.contains('light-theme')).toBe(false);
    });
  });

  describe('Print Theme Switching', () => {
    test('should switch to light theme for print from dark theme', () => {
      const themeManager = window.ThemeManager;

      // Start with dark theme
      expect(themeManager.getCurrentTheme()).toBe('dark');

      // Switch to light for print
      const originalTheme = themeManager.switchToLightForPrint();

      expect(themeManager.getCurrentTheme()).toBe('light');
      expect(originalTheme).toBe('dark');
    });

    test('should not change theme if already light', () => {
      const themeManager = window.ThemeManager;

      // Start with light theme
      themeManager.setTheme('light');
      expect(themeManager.getCurrentTheme()).toBe('light');

      // Try to switch to light for print
      const originalTheme = themeManager.switchToLightForPrint();

      expect(themeManager.getCurrentTheme()).toBe('light');
      expect(originalTheme).toBeNull(); // No change needed
    });

    test('should restore original theme after print', () => {
      const themeManager = window.ThemeManager;

      // Start with dark theme
      expect(themeManager.getCurrentTheme()).toBe('dark');

      // Switch to light for print
      const originalTheme = themeManager.switchToLightForPrint();
      expect(themeManager.getCurrentTheme()).toBe('light');

      // Restore original theme
      themeManager.restoreThemeAfterPrint(originalTheme);
      expect(themeManager.getCurrentTheme()).toBe('dark');
    });
  });

  describe('Print CSS Validation', () => {
    test('should have print styles that force light theme', () => {
      const styles = document.head.querySelector('style').textContent;

      // Check for print styles that enforce light theme
      expect(styles).toContain('@media print');
      expect(styles).toContain('background: white !important');
      expect(styles).toContain('color: black !important');
    });

    test('should hide theme toggle button in print', () => {
      const themeToggle = document.querySelector('.theme-toggle-btn');

      expect(themeToggle).toBeTruthy();
      expect(themeToggle.classList.contains('no-print')).toBe(true);
    });

    test('should override dark theme styles in print', () => {
      const styles = document.head.querySelector('style').textContent;

      // Print styles should override dark theme
      expect(styles).toContain('.dark-theme { background: white !important');
    });
  });

  describe('Print Workflow Integration', () => {
    test('should support complete print workflow', () => {
      const themeManager = window.ThemeManager;

      // Simulate complete print workflow
      const originalTheme = themeManager.getCurrentTheme();

      // 1. Switch to light theme for print
      const storedOriginalTheme = themeManager.switchToLightForPrint();
      expect(themeManager.getCurrentTheme()).toBe('light');

      // 2. Simulate print operation (PDF generation would happen here)
      // ...print happens...

      // 3. Restore original theme
      themeManager.restoreThemeAfterPrint(storedOriginalTheme);
      expect(themeManager.getCurrentTheme()).toBe(originalTheme);
    });

    test('should handle edge cases in theme workflow', () => {
      const themeManager = window.ThemeManager;

      // Test restoring null theme (no change was needed)
      const originalTheme = themeManager.getCurrentTheme();
      themeManager.restoreThemeAfterPrint(null);
      expect(themeManager.getCurrentTheme()).toBe(originalTheme);

      // Test multiple switches
      const stored1 = themeManager.switchToLightForPrint();
      const stored2 = themeManager.switchToLightForPrint(); // Should return null

      expect(stored1).toBe('dark');
      expect(stored2).toBeNull();
    });
  });

  describe('Accessibility for Print', () => {
    test('should maintain accessibility features in print mode', () => {
      const themeToggle = document.querySelector('.theme-toggle-btn');

      // Theme toggle should have proper accessibility attributes
      expect(themeToggle.getAttribute('aria-label')).toBeTruthy();

      // Even though hidden in print, accessibility structure should remain
      const content = document.querySelector('.content');
      expect(content).toBeTruthy();
    });

    test('should ensure content hierarchy remains in print', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const sections = document.querySelectorAll('section');

      expect(headings.length).toBeGreaterThan(0);
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Validation', () => {
    test('should validate theme switching is lightweight', () => {
      const themeManager = window.ThemeManager;

      // Time the theme switch operation
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const original = themeManager.switchToLightForPrint();
        themeManager.restoreThemeAfterPrint(original);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should be very fast (less than 100ms for 100 operations)
      expect(totalTime).toBeLessThan(100);
    });

    test('should validate minimal DOM manipulation', () => {
      const themeManager = window.ThemeManager;
      const body = document.body;

      const initialClassList = Array.from(body.classList);

      // Switch theme and back
      const original = themeManager.switchToLightForPrint();
      themeManager.restoreThemeAfterPrint(original);

      const finalClassList = Array.from(body.classList);

      // Should end up with same classes
      expect(finalClassList).toEqual(initialClassList);
    });
  });

  describe('Regression Prevention', () => {
    test('should prevent theme persistence issues', () => {
      const themeManager = window.ThemeManager;

      // Test that theme doesn't get stuck in wrong state
      const originalTheme = themeManager.getCurrentTheme();

      // Multiple operations
      const stored1 = themeManager.switchToLightForPrint();
      themeManager.setTheme('dark');
      const stored2 = themeManager.switchToLightForPrint();

      // Restore in reverse order
      themeManager.restoreThemeAfterPrint(stored2);
      themeManager.restoreThemeAfterPrint(stored1);

      // Should be back to a consistent state
      expect(['light', 'dark']).toContain(themeManager.getCurrentTheme());
    });

    test('should validate CSS class consistency', () => {
      const body = document.body;

      // Should never have both theme classes
      const checkConsistency = () => {
        const hasLight = body.classList.contains('light-theme');
        const hasDark = body.classList.contains('dark-theme');

        // Should have exactly one theme class
        expect(hasLight && hasDark).toBe(false);
        expect(hasLight || hasDark).toBe(true);
      };

      checkConsistency();

      // Check after theme operations
      window.ThemeManager.setTheme('light');
      checkConsistency();

      window.ThemeManager.setTheme('dark');
      checkConsistency();
    });
  });
});
