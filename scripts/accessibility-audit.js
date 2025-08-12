#!/usr/bin/env node

// =============================================================================
// ♿ Accessibility Audit - Resume as Code
// =============================================================================
// WCAG 2.1 AA compliance assessment and UX improvement recommendations
// Analyzes HTML structure, CSS, and interactive elements
// =============================================================================

const fs = require('fs');
const path = require('path');

class AccessibilityAuditor {
  constructor() {
    this.auditResults = {
      wcagLevel: 'AA',
      timestamp: new Date().toISOString(),
      findings: {
        passed: [],
        warnings: [],
        failures: [],
      },
      recommendations: [],
      score: 0,
    };
  }

  auditHTML() {
    console.log('🔍 Analyzing HTML structure...');

    const templatePath = path.join(__dirname, '..', 'templates', 'template.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8');

    // 1. Language and Document Structure
    this.checkDocumentStructure(htmlContent);

    // 2. Headings Hierarchy
    this.checkHeadingsHierarchy(htmlContent);

    // 3. Images and Alt Text
    this.checkImages(htmlContent);

    // 4. Links and Navigation
    this.checkLinks(htmlContent);

    // 5. Interactive Elements
    this.checkInteractiveElements(htmlContent);

    // 6. Semantic HTML
    this.checkSemanticHTML(htmlContent);

    // 7. ARIA Usage
    this.checkARIAUsage(htmlContent);
  }

  checkDocumentStructure(html) {
    console.log('  📄 Document structure...');

    // Language attribute
    if (html.includes('<html lang="en">')) {
      this.auditResults.findings.passed.push('✅ HTML lang attribute present');
    } else {
      this.auditResults.findings.failures.push(
        '❌ Missing HTML lang attribute'
      );
    }

    // Viewport meta tag
    if (html.includes('name="viewport"')) {
      this.auditResults.findings.passed.push('✅ Viewport meta tag present');
    } else {
      this.auditResults.findings.failures.push('❌ Missing viewport meta tag');
    }

    // Title tag
    if (html.includes('<title>')) {
      this.auditResults.findings.passed.push('✅ Document title present');
    } else {
      this.auditResults.findings.failures.push('❌ Missing document title');
    }
  }

  checkHeadingsHierarchy(html) {
    console.log('  📝 Headings hierarchy...');

    const headings = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];

    if (headings.length === 0) {
      this.auditResults.findings.warnings.push(
        '⚠️  No headings found - consider adding semantic headings'
      );
      return;
    }

    // Check for h1
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 1) {
      this.auditResults.findings.passed.push('✅ Single H1 element present');
    } else if (h1Count === 0) {
      this.auditResults.findings.failures.push('❌ No H1 element found');
    } else {
      this.auditResults.findings.warnings.push(
        '⚠️  Multiple H1 elements found'
      );
    }

    console.log(`    Found ${headings.length} headings total`);
  }

  checkImages(html) {
    console.log('  🖼️  Images and alt text...');

    const images = html.match(/<img[^>]*>/gi) || [];
    let imagesWithAlt = 0;
    let imagesWithoutAlt = 0;

    images.forEach(img => {
      if (img.includes('alt="')) {
        imagesWithAlt++;
      } else {
        imagesWithoutAlt++;
      }
    });

    if (imagesWithoutAlt === 0 && images.length > 0) {
      this.auditResults.findings.passed.push(
        `✅ All ${images.length} images have alt attributes`
      );
    } else if (imagesWithoutAlt > 0) {
      this.auditResults.findings.failures.push(
        `❌ ${imagesWithoutAlt} images missing alt attributes`
      );
    }

    // Check for decorative images
    const decorativeImages = html.match(/alt=""/g) || [];
    if (decorativeImages.length > 0) {
      this.auditResults.findings.passed.push(
        `✅ ${decorativeImages.length} decorative images properly marked`
      );
    }
  }

  checkLinks(html) {
    console.log('  🔗 Links and navigation...');

    const externalLinks = html.match(/<a[^>]*target="_blank"[^>]*>/gi) || [];
    let secureExternalLinks = 0;

    externalLinks.forEach(link => {
      if (link.includes('rel="noopener noreferrer"')) {
        secureExternalLinks++;
      }
    });

    if (
      secureExternalLinks === externalLinks.length &&
      externalLinks.length > 0
    ) {
      this.auditResults.findings.passed.push(
        `✅ All ${externalLinks.length} external links are secure`
      );
    } else if (externalLinks.length > secureExternalLinks) {
      this.auditResults.findings.warnings.push(
        `⚠️  ${externalLinks.length - secureExternalLinks} external links missing security attributes`
      );
    }

    // Check for link text
    const emptyLinks = html.match(/<a[^>]*><\/a>/gi) || [];
    if (emptyLinks.length > 0) {
      this.auditResults.findings.failures.push(
        `❌ ${emptyLinks.length} empty links found`
      );
    } else {
      this.auditResults.findings.passed.push('✅ No empty links found');
    }
  }

  checkInteractiveElements(html) {
    console.log('  🎯 Interactive elements...');

    // Check for tabindex usage
    const tabindexElements = html.match(/tabindex="[^"]*"/gi) || [];
    console.log(`    Found ${tabindexElements.length} elements with tabindex`);

    // Check for buttons
    const buttons = html.match(/<button[^>]*>/gi) || [];
    let buttonsWithLabels = 0;

    buttons.forEach(button => {
      if (button.includes('aria-label="') || button.includes('title="')) {
        buttonsWithLabels++;
      }
    });

    if (buttonsWithLabels === buttons.length && buttons.length > 0) {
      this.auditResults.findings.passed.push(
        `✅ All ${buttons.length} buttons have accessible labels`
      );
    } else if (buttons.length > buttonsWithLabels) {
      this.auditResults.findings.warnings.push(
        `⚠️  ${buttons.length - buttonsWithLabels} buttons may need better labels`
      );
    }
  }

  checkSemanticHTML(html) {
    console.log('  🏗️  Semantic HTML...');

    const semanticElements = [
      'header',
      'nav',
      'main',
      'section',
      'article',
      'aside',
      'footer',
    ];

    let semanticCount = 0;
    semanticElements.forEach(element => {
      const count = (html.match(new RegExp(`<${element}[^>]*>`, 'gi')) || [])
        .length;
      semanticCount += count;
    });

    if (semanticCount > 5) {
      this.auditResults.findings.passed.push(
        '✅ Good use of semantic HTML elements'
      );
    } else if (semanticCount > 0) {
      this.auditResults.findings.warnings.push(
        '⚠️  Limited semantic HTML - consider adding more semantic elements'
      );
    } else {
      this.auditResults.findings.failures.push(
        '❌ No semantic HTML elements found'
      );
    }
  }

  checkARIAUsage(html) {
    console.log('  🎪 ARIA attributes...');

    const ariaAttributes = html.match(/aria-[a-z-]+="[^"]*"/gi) || [];
    const roleAttributes = html.match(/role="[^"]*"/gi) || [];

    console.log(`    Found ${ariaAttributes.length} ARIA attributes`);
    console.log(`    Found ${roleAttributes.length} role attributes`);

    if (ariaAttributes.length > 0 || roleAttributes.length > 0) {
      this.auditResults.findings.passed.push(
        '✅ ARIA attributes in use for enhanced accessibility'
      );
    } else {
      this.auditResults.findings.warnings.push(
        '⚠️  No ARIA attributes found - consider adding for better accessibility'
      );
    }
  }

  checkCSS() {
    console.log('🎨 Analyzing CSS for accessibility...');

    // Look for CSS files in the template
    const templatePath = path.join(__dirname, '..', 'templates', 'template.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Check for color contrast considerations
    this.checkColorContrast(htmlContent);

    // Check for responsive design
    this.checkResponsiveDesign(htmlContent);

    // Check for focus styles
    this.checkFocusStyles(htmlContent);
  }

  checkColorContrast(html) {
    console.log('  🌈 Color contrast...');

    // Look for CSS custom properties that suggest theme support
    if (html.includes('--color-') || html.includes('dark-mode')) {
      this.auditResults.findings.passed.push(
        '✅ Theme support detected - good for contrast flexibility'
      );
    }

    // Check for high contrast mode support
    if (html.includes('prefers-color-scheme') || html.includes('@media')) {
      this.auditResults.findings.passed.push(
        '✅ Media queries detected - responsive to user preferences'
      );
    }

    this.auditResults.recommendations.push(
      '💡 Consider automated color contrast testing with tools like axe-core'
    );
  }

  checkResponsiveDesign(html) {
    console.log('  📱 Responsive design...');

    if (html.includes('@media') || html.includes('responsive')) {
      this.auditResults.findings.passed.push(
        '✅ Responsive design patterns detected'
      );
    } else {
      this.auditResults.findings.warnings.push(
        '⚠️  No responsive design patterns detected'
      );
    }

    // Check for mobile-friendly viewport
    if (html.includes('width=device-width')) {
      this.auditResults.findings.passed.push(
        '✅ Mobile-friendly viewport configuration'
      );
    }
  }

  checkFocusStyles(html) {
    console.log('  🎯 Focus styles...');

    if (html.includes(':focus') || html.includes('focus-visible')) {
      this.auditResults.findings.passed.push('✅ Focus styles detected in CSS');
    } else {
      this.auditResults.findings.warnings.push(
        '⚠️  No focus styles detected - important for keyboard navigation'
      );
      this.auditResults.recommendations.push(
        '💡 Add visible focus indicators for all interactive elements'
      );
    }
  }

  generateRecommendations() {
    console.log('💡 Generating accessibility recommendations...');

    // General recommendations based on findings
    this.auditResults.recommendations.push(
      '♿ Add skip navigation links for keyboard users',
      '🔍 Implement proper heading hierarchy (h1 → h2 → h3...)',
      '🎨 Ensure 4.5:1 color contrast ratio for normal text',
      '📱 Test with screen readers (VoiceOver, NVDA, JAWS)',
      '⌨️  Ensure all functionality is keyboard accessible',
      '🔊 Add live regions for dynamic content updates',
      '📏 Ensure touch targets are at least 44px × 44px',
      '🏷️  Add descriptive labels for form elements'
    );
  }

  calculateScore() {
    const passed = this.auditResults.findings.passed.length;
    const warnings = this.auditResults.findings.warnings.length;
    const failures = this.auditResults.findings.failures.length;

    const totalChecks = passed + warnings + failures;
    if (totalChecks === 0) return 0;

    // Score calculation: Passed = 100%, Warnings = 50%, Failures = 0%
    const score = Math.round(
      ((passed * 100 + warnings * 50) / (totalChecks * 100)) * 100
    );
    return score;
  }

  generateReport() {
    console.log('\n♿ ACCESSIBILITY AUDIT REPORT');
    console.log('================================');

    this.auditHTML();
    this.checkCSS();
    this.generateRecommendations();

    this.auditResults.score = this.calculateScore();

    console.log('\n📊 AUDIT RESULTS:');
    console.log(`   Accessibility Score: ${this.auditResults.score}%`);
    console.log(`   WCAG Level Target: ${this.auditResults.wcagLevel}`);

    console.log('\n✅ PASSED CHECKS:');
    this.auditResults.findings.passed.forEach(item =>
      console.log(`   ${item}`)
    );

    if (this.auditResults.findings.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.auditResults.findings.warnings.forEach(item =>
        console.log(`   ${item}`)
      );
    }

    if (this.auditResults.findings.failures.length > 0) {
      console.log('\n❌ FAILURES:');
      this.auditResults.findings.failures.forEach(item =>
        console.log(`   ${item}`)
      );
    }

    console.log('\n💡 RECOMMENDATIONS:');
    this.auditResults.recommendations.forEach(item =>
      console.log(`   ${item}`)
    );

    // Save results
    const resultsPath = path.join(
      __dirname,
      '..',
      'accessibility-audit-results.json'
    );
    fs.writeFileSync(resultsPath, JSON.stringify(this.auditResults, null, 2));

    console.log(`\n📁 Full results saved to: ${resultsPath}`);
    console.log('================================\n');

    return this.auditResults;
  }
}

// CLI Interface
if (require.main === module) {
  const auditor = new AccessibilityAuditor();
  auditor.generateReport();
}

module.exports = AccessibilityAuditor;
