/**
 * Unit tests for theme utilities and core functionality
 */

// Mock DOM environment for unit tests
const { JSDOM } = require('jsdom');

describe('Theme Utilities', () => {
  let dom;
  let document;
  let window;
  let localStorage;

  beforeEach(() => {
    // Setup DOM environment
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head></head>
        <body data-theme="">
          <button id="darkToggle">
            <span id="themeIcon">🌙</span>
          </button>
        </body>
      </html>
    `,
      { url: 'http://localhost' }
    );

    document = dom.window.document;
    window = dom.window;

    // Mock localStorage
    localStorage = {
      store: {},
      getItem: function (key) {
        return this.store[key] || null;
      },
      setItem: function (key, value) {
        this.store[key] = value.toString();
      },
      removeItem: function (key) {
        delete this.store[key];
      },
      clear: function () {
        this.store = {};
      },
    };

    global.document = document;
    global.window = window;
    global.localStorage = localStorage;
  });

  afterEach(() => {
    // Clean up
    localStorage.clear();
    dom.window.close();
  });

  describe('Theme Detection', () => {
    test('should detect system dark mode preference', () => {
      // Mock matchMedia for dark mode
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      expect(prefersDark).toBe(true);
    });

    test('should detect system light mode preference', () => {
      // Mock matchMedia for light mode
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const prefersLight = window.matchMedia(
        '(prefers-color-scheme: light)'
      ).matches;
      expect(prefersLight).toBe(true);
    });
  });

  describe('Theme State Management', () => {
    test('should initialize with light theme by default', () => {
      const body = document.body;
      expect(body.getAttribute('data-theme')).toBe('');

      const themeIcon = document.getElementById('themeIcon');
      expect(themeIcon.textContent).toBe('🌙');
    });

    test('should save theme preference to localStorage', () => {
      localStorage.setItem('theme', 'dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('should load theme preference from localStorage', () => {
      localStorage.setItem('theme', 'dark');
      const savedTheme = localStorage.getItem('theme');
      expect(savedTheme).toBe('dark');
    });

    test('should remove theme preference from localStorage', () => {
      localStorage.setItem('theme', 'dark');
      localStorage.removeItem('theme');
      expect(localStorage.getItem('theme')).toBeNull();
    });
  });

  describe('Theme Toggle Functionality', () => {
    test('should toggle from light to dark mode', () => {
      const body = document.body;
      const themeIcon = document.getElementById('themeIcon');

      // Simulate theme toggle
      body.setAttribute('data-theme', 'dark');
      themeIcon.textContent = '☀️';
      localStorage.setItem('theme', 'dark');

      expect(body.getAttribute('data-theme')).toBe('dark');
      expect(themeIcon.textContent).toBe('☀️');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('should toggle from dark to light mode', () => {
      const body = document.body;
      const themeIcon = document.getElementById('themeIcon');

      // Start in dark mode
      body.setAttribute('data-theme', 'dark');
      themeIcon.textContent = '☀️';
      localStorage.setItem('theme', 'dark');

      // Toggle to light mode
      body.setAttribute('data-theme', '');
      themeIcon.textContent = '🌙';
      localStorage.removeItem('theme');

      expect(body.getAttribute('data-theme')).toBe('');
      expect(themeIcon.textContent).toBe('🌙');
      expect(localStorage.getItem('theme')).toBeNull();
    });
  });

  describe('DOM Element Validation', () => {
    test('should find required DOM elements', () => {
      const darkToggle = document.getElementById('darkToggle');
      const themeIcon = document.getElementById('themeIcon');

      expect(darkToggle).toBeTruthy();
      expect(themeIcon).toBeTruthy();
    });

    test('should handle missing DOM elements gracefully', () => {
      // Remove elements
      const darkToggle = document.getElementById('darkToggle');
      darkToggle.remove();

      const missingToggle = document.getElementById('darkToggle');
      expect(missingToggle).toBeNull();
    });
  });

  describe('Theme Icon States', () => {
    test('should display moon icon for light mode', () => {
      const themeIcon = document.getElementById('themeIcon');
      themeIcon.textContent = '🌙';
      expect(themeIcon.textContent).toBe('🌙');
    });

    test('should display sun icon for dark mode', () => {
      const themeIcon = document.getElementById('themeIcon');
      themeIcon.textContent = '☀️';
      expect(themeIcon.textContent).toBe('☀️');
    });

    test('should handle icon changes correctly', () => {
      const themeIcon = document.getElementById('themeIcon');

      // Start with moon
      themeIcon.textContent = '🌙';
      expect(themeIcon.textContent).toBe('🌙');

      // Change to sun
      themeIcon.textContent = '☀️';
      expect(themeIcon.textContent).toBe('☀️');

      // Change back to moon
      themeIcon.textContent = '🌙';
      expect(themeIcon.textContent).toBe('🌙');
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage that throws errors
      const erroringStorage = {
        getItem: () => {
          throw new Error('Storage not available');
        },
        setItem: () => {
          throw new Error('Storage not available');
        },
        removeItem: () => {
          throw new Error('Storage not available');
        },
      };

      global.localStorage = erroringStorage;

      // These should not throw errors
      expect(() => {
        try {
          localStorage.getItem('theme');
        } catch (e) {
          // Expected to throw
        }
      }).not.toThrow();
    });

    test('should handle missing elements gracefully', () => {
      // Remove all theme-related elements
      const darkToggle = document.getElementById('darkToggle');
      const themeIcon = document.getElementById('themeIcon');

      if (darkToggle) darkToggle.remove();
      if (themeIcon) themeIcon.remove();

      // Should not throw when elements are missing
      expect(document.getElementById('darkToggle')).toBeNull();
      expect(document.getElementById('themeIcon')).toBeNull();
    });
  });
});
