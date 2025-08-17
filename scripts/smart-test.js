#!/usr/bin/env node

// =============================================================================
// 🧪 Smart Testing Strategy - Leverage Unlimited GitHub Actions Minutes
// =============================================================================
// Local: Fast smoke tests for immediate feedback
// CI: Comprehensive long-running tests using unlimited minutes
// Strategy: Don't timeout locally, use CI power for thorough testing
// =============================================================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SmartTester {
  constructor() {
    this.isCI = !!process.env.CI;
    this.isLocal = !this.isCI;
    this.testMode = process.argv[2] || 'auto';
    
    console.log('🧪 SMART TESTING STRATEGY');
    console.log('========================');
    console.log(`Environment: ${this.isCI ? 'CI (unlimited minutes)' : 'Local (fast feedback)'}`);
    console.log(`Test Mode: ${this.testMode}`);
  }

  async runTests() {
    if (this.testMode === 'local' || (this.testMode === 'auto' && this.isLocal)) {
      await this.runLocalTests();
    } else if (this.testMode === 'ci' || (this.testMode === 'auto' && this.isCI)) {
      await this.runCITests();
    } else if (this.testMode === 'trigger-ci') {
      await this.triggerCITests();
    } else {
      this.showUsage();
    }
  }

  async runLocalTests() {
    console.log('\n🏠 LOCAL MODE: Fast smoke tests for immediate feedback');
    console.log('======================================================');
    
    const localTests = [
      {
        name: 'File existence check',
        command: 'test -f src/resume-data.json && test -f template.html',
        timeout: 5000,
      },
      {
        name: 'Resume data validation',
        command: 'node -e "JSON.parse(require(\'fs\').readFileSync(\'src/resume-data.json\', \'utf8\'))"',
        timeout: 5000,
      },
      {
        name: 'Template syntax check',
        command: 'node -e "const fs = require(\'fs\'); const Handlebars = require(\'handlebars\'); const template = fs.readFileSync(\'template.html\', \'utf8\'); Handlebars.compile(template); console.log(\'Template syntax valid\');"',
        timeout: 10000,
      },
      {
        name: 'Unit tests (fast)',
        command: 'npm run test:unit',
        timeout: 60000,
      },
    ];

    console.log('💨 Running fast local tests...');
    
    let results = { passed: 0, failed: 0, errors: [] };
    
    for (const test of localTests) {
      try {
        console.log(`⚡ ${test.name}...`);
        execSync(test.command, { 
          stdio: 'pipe',
          timeout: test.timeout,
          cwd: process.cwd(),
        });
        console.log(`✅ ${test.name}`);
        results.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message.split('\n')[0]}`);
        results.failed++;
        results.errors.push({
          test: test.name,
          error: error.message,
        });
      }
    }

    console.log('\n📊 LOCAL TEST RESULTS');
    console.log('=====================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\n🚨 Local tests failed. Run comprehensive CI tests:');
      console.log('node scripts/smart-test.js trigger-ci');
      process.exit(1);
    } else {
      console.log('\n🎉 All local tests passed!');
      console.log('💡 For comprehensive testing, use unlimited CI minutes:');
      console.log('gh workflow run "Comprehensive Testing" --ref main');
    }
  }

  async runCITests() {
    console.log('\n☁️ CI MODE: Comprehensive testing with unlimited minutes');
    console.log('========================================================');
    
    const ciTests = [
      {
        name: 'Unit tests with coverage',
        command: 'make test-unit',
        timeout: 300000, // 5 minutes
      },
      {
        name: 'Visual regression matrix (20 combinations)',
        command: 'make test-visual-matrix',
        timeout: 600000, // 10 minutes
      },
      {
        name: 'Cross-browser E2E tests',
        command: 'make test-e2e',
        timeout: 900000, // 15 minutes
      },
      {
        name: 'Accessibility audit',
        command: 'npm run accessibility:audit',
        timeout: 300000, // 5 minutes
      },
      {
        name: 'Performance testing',
        command: 'npm run perf:test',
        timeout: 600000, // 10 minutes
      },
      {
        name: 'PDF generation validation',
        command: 'make test-pdf',
        timeout: 300000, // 5 minutes
      },
    ];

    console.log('🚀 Running comprehensive CI tests (unlimited minutes)...');
    
    let results = { passed: 0, failed: 0, errors: [], artifacts: [] };
    
    for (const test of ciTests) {
      try {
        console.log(`⚡ ${test.name}...`);
        const output = execSync(test.command, { 
          stdio: 'pipe',
          timeout: test.timeout,
          cwd: process.cwd(),
          encoding: 'utf8',
        });
        
        console.log(`✅ ${test.name}`);
        results.passed++;
        
        // Collect artifacts
        if (test.name.includes('visual')) {
          results.artifacts.push('visual-evidence/**/*.png');
        }
        if (test.name.includes('coverage')) {
          results.artifacts.push('coverage/**/*');
        }
        if (test.name.includes('test-results')) {
          results.artifacts.push('test-results/**/*');
        }
        
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message.split('\n')[0]}`);
        results.failed++;
        results.errors.push({
          test: test.name,
          error: error.message,
          command: test.command,
        });
      }
    }

    // Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      environment: 'CI',
      results: results,
      artifacts: results.artifacts,
      summary: {
        total: ciTests.length,
        passed: results.passed,
        failed: results.failed,
        success_rate: Math.round((results.passed / ciTests.length) * 100),
      },
    };

    fs.writeFileSync('ci-test-report.json', JSON.stringify(report, null, 2));

    console.log('\n📊 COMPREHENSIVE CI TEST RESULTS');
    console.log('=================================');
    console.log(`✅ Passed: ${results.passed}/${ciTests.length}`);
    console.log(`❌ Failed: ${results.failed}/${ciTests.length}`);
    console.log(`📈 Success Rate: ${report.summary.success_rate}%`);
    
    if (results.failed > 0) {
      console.log('\n🚨 CI Test Failures:');
      results.errors.forEach(error => {
        console.log(`❌ ${error.test}`);
        console.log(`   Command: ${error.command}`);
        console.log(`   Error: ${error.error.substring(0, 200)}...`);
      });
      process.exit(1);
    } else {
      console.log('\n🎉 All comprehensive CI tests passed!');
      console.log(`📄 Report saved: ci-test-report.json`);
    }
  }

  async triggerCITests() {
    console.log('\n🚀 TRIGGERING CI TESTS: Leveraging unlimited GitHub Actions minutes');
    console.log('====================================================================');
    
    try {
      // Check if gh CLI is available
      execSync('gh --version', { stdio: 'pipe' });
      
      console.log('🔍 Available test workflows:');
      const workflows = execSync('gh workflow list', { encoding: 'utf8' });
      console.log(workflows);
      
      console.log('\n⚡ Triggering comprehensive testing workflows...');
      
      const testWorkflows = [
        'Netlify Staging Pipeline',
        '🎨 Visual Regression Testing',
        '🎯 Performance & Quality Monitoring',
        '🔒 Security Scanning',
      ];
      
      for (const workflow of testWorkflows) {
        try {
          console.log(`🚀 Triggering: ${workflow}`);
          execSync(`gh workflow run "${workflow}" --ref main`, { stdio: 'inherit' });
          console.log(`✅ Triggered: ${workflow}`);
        } catch (error) {
          console.log(`⚠️ Could not trigger: ${workflow} (${error.message.split('\n')[0]})`);
        }
      }
      
      console.log('\n📊 Monitor running workflows:');
      console.log('gh run list --limit 10');
      console.log('gh run watch <run-id>');
      
      console.log('\n💡 Benefits of CI testing:');
      console.log('• Unlimited GitHub Actions minutes (open source repo)');
      console.log('• Parallel execution across multiple runners');
      console.log('• No local resource consumption or timeouts');
      console.log('• Comprehensive cross-platform testing (AMD64 CI vs ARM64 local)');
      console.log('• Artifact collection and preservation');
      
    } catch (error) {
      console.log('❌ GitHub CLI not available. Install with: brew install gh');
      console.log('💡 Alternative: Push to main branch to trigger automatic CI tests');
      process.exit(1);
    }
  }

  showUsage() {
    console.log('\n📖 SMART TEST USAGE');
    console.log('===================');
    console.log('node scripts/smart-test.js [mode]');
    console.log('');
    console.log('Modes:');
    console.log('  auto        - Auto-detect: local = fast tests, CI = comprehensive');
    console.log('  local       - Fast smoke tests for immediate feedback');
    console.log('  ci          - Comprehensive tests (use unlimited CI minutes)');
    console.log('  trigger-ci  - Trigger CI workflows for comprehensive testing');
    console.log('');
    console.log('Strategy:');
    console.log('• Local: Fast feedback with essential tests (< 2 minutes)');
    console.log('• CI: Comprehensive testing with unlimited minutes (5-30 minutes)');
    console.log('• Leverage open source repo unlimited GitHub Actions minutes');
    console.log('• No timeouts locally, let CI handle long-running tests');
    console.log('');
    console.log('Examples:');
    console.log('  npm run test:smart           # Auto-detect mode');
    console.log('  npm run test:local           # Fast local tests only');
    console.log('  npm run test:ci              # Comprehensive CI tests');
    console.log('  npm run test:trigger         # Trigger CI workflows');
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new SmartTester();
  tester.runTests().catch(error => {
    console.error('❌ Smart test failed:', error.message);
    process.exit(1);
  });
}

module.exports = SmartTester;