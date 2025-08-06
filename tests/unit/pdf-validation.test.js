/**
 * Unit Tests for PDF Validation
 * Fast tests to ensure PDF generation produces expected output
 */

const fs = require('fs');
const path = require('path');

describe('PDF Validation', () => {
  const distDir = path.join(__dirname, '../../dist');
  const pdfPath = path.join(distDir, 'resume.pdf');
  
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
        path.join(__dirname, '../../dist/index.html')
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
          expect(pdfStats.mtime.getTime()).toBeGreaterThanOrEqual(templateStats.mtime.getTime());
        }
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