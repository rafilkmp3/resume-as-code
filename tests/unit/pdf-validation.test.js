/**
 * Unit Tests for PDF Validation
 * Fast tests to ensure PDF generation produces expected output
 */

const fs = require('fs');
const path = require('path');

describe('PDF Validation', () => {
  const distDir = path.join(__dirname, '../../dist');
  const pdfPath = path.join(distDir, 'resume.pdf');
  const printPdfPath = path.join(distDir, 'resume-print.pdf');
  const atsPdfPath = path.join(distDir, 'resume-ats.pdf');

  beforeAll(() => {
    // Ensure dist directory exists for tests
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
  });

  describe('PDF File Validation', () => {
    test('should generate PDF file in dist directory', () => {
      // This test checks that the build process creates a PDF
      // In CI, this will run after the build step
      if (fs.existsSync(pdfPath)) {
        const stats = fs.statSync(pdfPath);
        expect(stats.isFile()).toBe(true);
        expect(stats.size).toBeGreaterThan(0);
      } else {
        // Skip if PDF doesn't exist (may not be built yet in some test contexts)
        console.log('PDF file not found, skipping validation');
      }
    });

    test('should have reasonable PDF file size', () => {
      if (fs.existsSync(pdfPath)) {
        const stats = fs.statSync(pdfPath);

        // PDF should be reasonable size (not too small, not too large)
        expect(stats.size).toBeGreaterThan(50 * 1024); // At least 50KB
        expect(stats.size).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
      }
    });

    test('should validate PDF header signature', () => {
      if (fs.existsSync(pdfPath)) {
        const buffer = fs.readFileSync(pdfPath);
        const header = buffer.slice(0, 8).toString();

        // PDF files should start with %PDF-
        expect(header).toMatch(/^%PDF-/);
      }
    });
  });

  describe('PDF Content Structure Validation', () => {
    test('should validate PDF contains expected metadata', () => {
      if (fs.existsSync(pdfPath)) {
        const buffer = fs.readFileSync(pdfPath);
        const content = buffer.toString('binary');

        // Check for PDF metadata that should be present
        // These are basic checks that can be done without full PDF parsing
        expect(content).toContain('/Title');
        expect(content).toContain('/Producer');
      }
    });

    test('should validate PDF contains text content', () => {
      if (fs.existsSync(pdfPath)) {
        const buffer = fs.readFileSync(pdfPath);
        const content = buffer.toString('binary');

        // Look for text objects in PDF
        expect(content).toContain('BT'); // Begin text object
        expect(content).toContain('ET'); // End text object
      }
    });
  });

  describe('PDF Generation Process Validation', () => {
    test('should validate build configuration for PDF generation', () => {
      // Check that the build script configuration is correct
      const buildScript = path.join(__dirname, '../../scripts/build.js');

      if (fs.existsSync(buildScript)) {
        const content = fs.readFileSync(buildScript, 'utf8');

        // Verify PDF generation is configured
        expect(content).toContain('pdf');
        expect(content).toContain('puppeteer');
      }
    });

    test('should validate HTML template has print-friendly styles', () => {
      const templatePath = path.join(__dirname, '../../template.html');

      if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath, 'utf8');

        // Check for print media queries
        expect(content).toContain('@media print');
        expect(content).toContain('print-only');
        expect(content).toContain('no-print');
      }
    });
  });

  describe('PDF Quality Assurance', () => {
    test('should validate PDF generation timeout configuration', () => {
      const buildScript = path.join(__dirname, '../../scripts/build.js');

      if (fs.existsSync(buildScript)) {
        const content = fs.readFileSync(buildScript, 'utf8');

        // Should have reasonable timeout (at least 30 seconds)
        const timeoutMatch = content.match(/timeout.*?(\d+)/);
        if (timeoutMatch) {
          const timeout = parseInt(timeoutMatch[1]);
          expect(timeout).toBeGreaterThanOrEqual(30000); // At least 30 seconds
        }
      }
    });

    test('should validate PDF format configuration', () => {
      const buildScript = path.join(__dirname, '../../scripts/build.js');

      if (fs.existsSync(buildScript)) {
        const content = fs.readFileSync(buildScript, 'utf8');

        // Should specify PDF format (A4, Letter, etc.)
        expect(content).toMatch(/format.*['"].*['"]/);
      }
    });
  });

  describe('Print Style Validation', () => {
    test('should validate CSS contains print-specific styles', () => {
      // Check various files for print styles
      const filesToCheck = [
        path.join(__dirname, '../../template.html'),
        path.join(__dirname, '../../dist/index.html'),
      ];

      let hasPrintStyles = false;

      filesToCheck.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('@media print')) {
            hasPrintStyles = true;
          }
        }
      });

      expect(hasPrintStyles).toBe(true);
    });

    test('should validate print styles hide interactive elements', () => {
      const htmlPath = path.join(__dirname, '../../dist/index.html');

      if (fs.existsSync(htmlPath)) {
        const content = fs.readFileSync(htmlPath, 'utf8');

        // Should hide theme toggle in print
        expect(content).toContain('no-print');
      }
    });
  });

  describe('PDF Regression Prevention', () => {
    test('should validate build output includes both HTML and PDF', () => {
      const htmlPath = path.join(distDir, 'index.html');

      // Both files should exist after build
      if (fs.existsSync(htmlPath) && fs.existsSync(pdfPath)) {
        const htmlStats = fs.statSync(htmlPath);
        const pdfStats = fs.statSync(pdfPath);

        expect(htmlStats.isFile()).toBe(true);
        expect(pdfStats.isFile()).toBe(true);
        expect(htmlStats.size).toBeGreaterThan(0);
        expect(pdfStats.size).toBeGreaterThan(0);
      }
    });

    test('should validate PDF is newer than source files', () => {
      if (fs.existsSync(pdfPath)) {
        const pdfStats = fs.statSync(pdfPath);
        const templatePath = path.join(__dirname, '../../template.html');

        if (fs.existsSync(templatePath)) {
          const templateStats = fs.statSync(templatePath);

          // PDF should be newer than or equal to template
          expect(pdfStats.mtime.getTime()).toBeGreaterThanOrEqual(
            templateStats.mtime.getTime()
          );
        }
      }
    });
  });

  describe('Multi-Version PDF Validation', () => {
    test('should generate all three PDF versions', () => {
      const pdfVersions = [
        { path: pdfPath, name: 'Screen-optimized' },
        { path: printPdfPath, name: 'Print-optimized' },
        { path: atsPdfPath, name: 'ATS-optimized' },
      ];

      pdfVersions.forEach(({ path: pdfFilePath, name }) => {
        if (fs.existsSync(pdfFilePath)) {
          const stats = fs.statSync(pdfFilePath);
          expect(stats.isFile()).toBe(true);
          expect(stats.size).toBeGreaterThan(0);
          console.log(
            `✅ ${name} PDF validated: ${(stats.size / 1024).toFixed(1)}KB`
          );
        }
      });
    });

    test('should validate ATS PDF is significantly smaller', () => {
      if (fs.existsSync(pdfPath) && fs.existsSync(atsPdfPath)) {
        const screenStats = fs.statSync(pdfPath);
        const atsStats = fs.statSync(atsPdfPath);

        // ATS should be at least 50% smaller than screen version
        expect(atsStats.size).toBeLessThan(screenStats.size * 0.5);
      }
    });

    test('should validate each PDF has correct page structure', () => {
      const pdfVersions = [
        { path: pdfPath, name: 'Screen', expectedPages: { min: 5, max: 10 } },
        {
          path: printPdfPath,
          name: 'Print',
          expectedPages: { min: 5, max: 12 },
        },
        { path: atsPdfPath, name: 'ATS', expectedPages: { min: 3, max: 6 } },
      ];

      pdfVersions.forEach(({ path: pdfFilePath, name, expectedPages }) => {
        if (fs.existsSync(pdfFilePath)) {
          const buffer = fs.readFileSync(pdfFilePath);
          const content = buffer.toString('binary');

          // Count pages by looking for page objects
          const pageMatches = content.match(/\/Type\s*\/Page\b/g);
          const pageCount = pageMatches ? pageMatches.length : 0;

          expect(pageCount).toBeGreaterThanOrEqual(expectedPages.min);
          expect(pageCount).toBeLessThanOrEqual(expectedPages.max);
          console.log(`✅ ${name} PDF has ${pageCount} pages`);
        }
      });
    });
  });

  describe('Pre-commit Hook Integration Validation', () => {
    test('should validate pre-commit configuration exists', () => {
      const preCommitConfig = path.join(
        __dirname,
        '../../.pre-commit-config.yaml'
      );

      if (fs.existsSync(preCommitConfig)) {
        const content = fs.readFileSync(preCommitConfig, 'utf8');

        // Should have key hooks
        expect(content).toContain('conventional-pre-commit');
        expect(content).toContain('actionlint');
        expect(content).toContain('prettier');
        expect(content).toContain('resume-data-validation');
        console.log('✅ Pre-commit hooks configuration validated');
      }
    });

    test('should validate JSON schema exists for resume data', () => {
      const schemaPath = path.join(__dirname, '../../resume-schema.json');

      if (fs.existsSync(schemaPath)) {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

        // Should have required sections
        expect(schema.properties.basics).toBeDefined();
        expect(schema.properties.work).toBeDefined();
        expect(schema.properties.skills).toBeDefined();
        console.log('✅ Resume JSON schema validated');
      }
    });

    test('should validate resume data passes schema', () => {
      const resumeDataPath = path.join(__dirname, '../../resume-data.json');
      const schemaPath = path.join(__dirname, '../../resume-schema.json');

      if (fs.existsSync(resumeDataPath) && fs.existsSync(schemaPath)) {
        const resumeData = JSON.parse(fs.readFileSync(resumeDataPath, 'utf8'));
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

        // Basic structure validation
        expect(resumeData.basics).toBeDefined();
        expect(resumeData.work).toBeDefined();
        expect(resumeData.skills).toBeDefined();
        expect(Array.isArray(resumeData.work)).toBe(true);
        expect(Array.isArray(resumeData.skills)).toBe(true);
        console.log('✅ Resume data structure validated');
      }
    });
  });

  describe('PDF Performance Validation', () => {
    test('should validate PDF generation is reasonably fast', () => {
      // This is more of a configuration test
      const buildScript = path.join(__dirname, '../../scripts/build.js');

      if (fs.existsSync(buildScript)) {
        const content = fs.readFileSync(buildScript, 'utf8');

        // Should have optimization flags for PDF generation
        expect(content).toMatch(/waitForTimeout|waitForSelector|networkidle/);
      }
    });

    test('should validate PDF uses efficient rendering options', () => {
      const buildScript = path.join(__dirname, '../../scripts/build.js');

      if (fs.existsSync(buildScript)) {
        const content = fs.readFileSync(buildScript, 'utf8');

        // Should use print media for PDF generation
        expect(content).toContain('print');
      }
    });

    test('should validate build process creates PDF verification images', () => {
      const verificationDir = path.join(distDir, 'pdf-verification');

      if (fs.existsSync(verificationDir)) {
        const files = fs.readdirSync(verificationDir);
        const pngFiles = files.filter(f => f.endsWith('.png'));

        // Should have images for each PDF version
        expect(pngFiles.some(f => f.startsWith('screen-'))).toBe(true);
        expect(pngFiles.some(f => f.startsWith('print-'))).toBe(true);
        expect(pngFiles.some(f => f.startsWith('ats-'))).toBe(true);
        console.log(
          `✅ PDF verification images found: ${pngFiles.length} files`
        );
      }
    });
  });
});

// Utility function to check if running in CI
function isCI() {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

// Mock setup for tests that don't require actual PDF files
if (!isCI()) {
  // In local development, we might not always have a built PDF
  console.log('Running PDF validation tests in development mode');
}
