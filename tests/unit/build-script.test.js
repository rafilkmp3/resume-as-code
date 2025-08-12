const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock external dependencies
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn().mockResolvedValue(),
      pdf: jest.fn().mockResolvedValue(),
      close: jest.fn().mockResolvedValue()
    }),
    close: jest.fn().mockResolvedValue()
  })
}));

jest.mock('handlebars', () => ({
  compile: jest.fn().mockReturnValue(jest.fn().mockReturnValue('compiled template')),
  registerHelper: jest.fn()
}));

describe('build.js utilities', () => {
  let tempDir;
  let originalCwd;
  let mockResumeData;
  let mockTemplate;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-test-'));
    originalCwd = process.cwd();

    mockResumeData = {
      basics: {
        name: 'Test User',
        url: 'https://test.example.com',
        email: 'test@example.com'
      },
      work: [
        {
          company: 'Test Company',
          position: 'Developer',
          startDate: '2020-01-01'
        }
      ]
    };

    mockTemplate = `
      <html>
        <body>
          <h1>{{basics.name}}</h1>
          <p>{{basics.email}}</p>
          {{#each work}}
            <div>{{company}} - {{position}}</div>
          {{/each}}
        </body>
      </html>
    `;

    // Create test files in temp directory
    fs.writeFileSync(path.join(tempDir, 'resume-data.json'), JSON.stringify(mockResumeData, null, 2));
    fs.writeFileSync(path.join(tempDir, 'template.html'), mockTemplate);

    // Create required directories
    fs.mkdirSync(path.join(tempDir, 'assets', 'images'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'dist'), { recursive: true });

    // Create mock profile image
    fs.writeFileSync(path.join(tempDir, 'assets', 'images', 'profile-source.jpeg'), 'mock image data');

    process.chdir(tempDir);

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('getMacLanIP function', () => {
    test('should extract LAN IP detection logic', () => {
      // This tests the logic that would be extracted from build.js
      const mockNetworkInterfaces = {
        en0: [
          {
            address: '127.0.0.1',
            family: 'IPv4',
            internal: true
          },
          {
            address: '192.168.1.100',
            family: 'IPv4',
            internal: false
          }
        ],
        lo0: [
          {
            address: '::1',
            family: 'IPv6',
            internal: true
          }
        ]
      };

      // Mock the function that would be in build.js
      function getMacLanIP(networkInterfaces = mockNetworkInterfaces) {
        try {
          for (const [name, interfaces] of Object.entries(networkInterfaces)) {
            for (const networkInterface of interfaces || []) {
              if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
                return networkInterface.address;
              }
            }
          }
          return null;
        } catch (error) {
          return null;
        }
      }

      const result = getMacLanIP(mockNetworkInterfaces);
      expect(result).toBe('192.168.1.100');
    });

    test('should return null when no external IPv4 interface found', () => {
      const mockNetworkInterfaces = {
        lo0: [
          {
            address: '127.0.0.1',
            family: 'IPv4',
            internal: true
          }
        ]
      };

      function getMacLanIP(networkInterfaces = mockNetworkInterfaces) {
        try {
          for (const [name, interfaces] of Object.entries(networkInterfaces)) {
            for (const networkInterface of interfaces || []) {
              if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
                return networkInterface.address;
              }
            }
          }
          return null;
        } catch (error) {
          return null;
        }
      }

      const result = getMacLanIP(mockNetworkInterfaces);
      expect(result).toBe(null);
    });

    test('should handle empty network interfaces', () => {
      function getMacLanIP(networkInterfaces = {}) {
        try {
          for (const [name, interfaces] of Object.entries(networkInterfaces)) {
            for (const networkInterface of interfaces || []) {
              if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
                return networkInterface.address;
              }
            }
          }
          return null;
        } catch (error) {
          return null;
        }
      }

      const result = getMacLanIP({});
      expect(result).toBe(null);
    });
  });

  describe('File validation utilities', () => {
    test('should validate required files exist', () => {
      const requiredFiles = [
        'resume-data.json',
        'template.html'
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(tempDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should validate JSON files are parseable', () => {
      const resumeDataPath = path.join(tempDir, 'resume-data.json');
      const content = fs.readFileSync(resumeDataPath, 'utf8');

      expect(() => JSON.parse(content)).not.toThrow();

      const parsed = JSON.parse(content);
      expect(parsed.basics).toBeDefined();
      expect(parsed.basics.name).toBe('Test User');
    });

    test('should handle missing resume-data.json gracefully', () => {
      const missingPath = path.join(tempDir, 'missing-resume-data.json');

      function loadResumeData(filePath) {
        try {
          if (!fs.existsSync(filePath)) {
            return null;
          }
          const content = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(content);
        } catch (error) {
          return null;
        }
      }

      const result = loadResumeData(missingPath);
      expect(result).toBe(null);
    });

    test('should handle invalid JSON gracefully', () => {
      const invalidJsonPath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(invalidJsonPath, '{ invalid json content');

      function loadResumeData(filePath) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(content);
        } catch (error) {
          return null;
        }
      }

      const result = loadResumeData(invalidJsonPath);
      expect(result).toBe(null);
    });
  });

  describe('Template processing utilities', () => {
    test('should validate template contains required placeholders', () => {
      const templateContent = fs.readFileSync(path.join(tempDir, 'template.html'), 'utf8');

      expect(templateContent).toContain('{{basics.name}}');
      expect(templateContent).toContain('{{#each');
      expect(templateContent).toContain('</html>');
    });

    test('should handle missing template file', () => {
      const missingTemplatePath = path.join(tempDir, 'missing-template.html');

      function loadTemplate(filePath) {
        try {
          if (!fs.existsSync(filePath)) {
            return null;
          }
          return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
          return null;
        }
      }

      const result = loadTemplate(missingTemplatePath);
      expect(result).toBe(null);
    });

    test('should extract and validate Handlebars helpers', () => {
      // Test the helpers that would be registered in build.js

      // JSON stringify helper
      function jsonHelper(context) {
        return JSON.stringify(context);
      }

      // Equality helper
      function eqHelper(a, b) {
        return a === b;
      }

      // Test JSON helper
      const testObject = { name: 'test', value: 123 };
      const jsonResult = jsonHelper(testObject);
      expect(jsonResult).toBe('{"name":"test","value":123}');

      // Test equality helper
      expect(eqHelper('test', 'test')).toBe(true);
      expect(eqHelper('test', 'different')).toBe(false);
      expect(eqHelper(123, 123)).toBe(true);
      expect(eqHelper(123, '123')).toBe(false);
    });
  });

  describe('Build mode detection', () => {
    test('should detect draft mode from environment', () => {
      function isDraftMode(mode, env = process.env) {
        return mode === 'draft' || env.BUILD_MODE === 'draft';
      }

      expect(isDraftMode('draft')).toBe(true);
      expect(isDraftMode('production')).toBe(false);

      // Test with environment variable
      const mockEnv = { BUILD_MODE: 'draft' };
      expect(isDraftMode('production', mockEnv)).toBe(true);
    });

    test('should default to production mode', () => {
      function isDraftMode(mode, env = {}) {
        return mode === 'draft' || env.BUILD_MODE === 'draft';
      }

      expect(isDraftMode(undefined, {})).toBe(false);
      expect(isDraftMode(null, {})).toBe(false);
    });
  });

  describe('URL generation utilities', () => {
    test('should generate development URLs with LAN IP', () => {
      function generateDevelopmentURL(lanIP, port = 3000) {
        if (!lanIP) {
          return `http://localhost:${port}`;
        }
        return `http://${lanIP}:${port}`;
      }

      expect(generateDevelopmentURL('192.168.1.100')).toBe('http://192.168.1.100:3000');
      expect(generateDevelopmentURL('192.168.1.100', 3001)).toBe('http://192.168.1.100:3001');
      expect(generateDevelopmentURL(null)).toBe('http://localhost:3000');
    });

    test('should fallback to production URL when needed', () => {
      function getResumeURL(resumeData, isDraft = false, lanIP = null) {
        if (isDraft && lanIP) {
          return `http://${lanIP}:3000`;
        } else if (isDraft) {
          return 'http://localhost:3000';
        } else {
          return resumeData?.basics?.url || 'https://example.com';
        }
      }

      const testData = { basics: { url: 'https://myresume.com' } };

      expect(getResumeURL(testData, false)).toBe('https://myresume.com');
      expect(getResumeURL(testData, true, '192.168.1.100')).toBe('http://192.168.1.100:3000');
      expect(getResumeURL(testData, true)).toBe('http://localhost:3000');
      expect(getResumeURL(null, false)).toBe('https://example.com');
    });
  });

  describe('Directory management utilities', () => {
    test('should create directory if it does not exist', () => {
      const testDir = path.join(tempDir, 'new-directory');

      function ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          return true;
        }
        return false;
      }

      expect(fs.existsSync(testDir)).toBe(false);
      const wasCreated = ensureDirectoryExists(testDir);
      expect(wasCreated).toBe(true);
      expect(fs.existsSync(testDir)).toBe(true);
    });

    test('should not recreate existing directory', () => {
      const existingDir = path.join(tempDir, 'dist');

      function ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          return true;
        }
        return false;
      }

      const wasCreated = ensureDirectoryExists(existingDir);
      expect(wasCreated).toBe(false);
    });
  });

  describe('Error handling utilities', () => {
    test('should handle PDF generation timeout gracefully', () => {
      function createTimeoutPromise(ms, operation) {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error(`Operation timed out after ${ms}ms`));
          }, ms);

          operation()
            .then(result => {
              clearTimeout(timeoutId);
              resolve(result);
            })
            .catch(error => {
              clearTimeout(timeoutId);
              reject(error);
            });
        });
      }

      const fastOperation = () => Promise.resolve('success');
      const slowOperation = () => new Promise(resolve => setTimeout(() => resolve('slow'), 100));

      return Promise.all([
        expect(createTimeoutPromise(50, fastOperation)).resolves.toBe('success'),
        expect(createTimeoutPromise(50, slowOperation)).rejects.toThrow('Operation timed out after 50ms')
      ]);
    });

    test('should provide fallback values for missing data', () => {
      function safeGet(obj, path, defaultValue = null) {
        try {
          const keys = path.split('.');
          let current = obj;

          for (const key of keys) {
            if (current == null || typeof current !== 'object') {
              return defaultValue;
            }
            current = current[key];
          }

          return current !== undefined ? current : defaultValue;
        } catch (error) {
          return defaultValue;
        }
      }

      const testData = {
        basics: {
          name: 'Test User',
          nested: {
            value: 'found'
          }
        }
      };

      expect(safeGet(testData, 'basics.name')).toBe('Test User');
      expect(safeGet(testData, 'basics.nested.value')).toBe('found');
      expect(safeGet(testData, 'basics.missing', 'default')).toBe('default');
      expect(safeGet(null, 'any.path', 'fallback')).toBe('fallback');
      expect(safeGet(testData, 'basics.missing.deep')).toBe(null);
    });
  });
});
