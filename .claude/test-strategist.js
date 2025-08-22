#!/usr/bin/env node
/**
 * Test Strategist Agent
 * 
 * Smart testing strategy agent that analyzes changes and recommends optimal testing approach.
 * Determines if changes need comprehensive testing, suggests scope, and recommends local vs CI strategy.
 * 
 * Usage:
 *   node .claude/test-strategist.js
 *   node .claude/test-strategist.js --analyze-changes
 *   node .claude/test-strategist.js --recommend-strategy
 *   node .claude/test-strategist.js --execute-recommended
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestStrategist {
  constructor() {
    this.testTypes = {
      unit: {
        command: 'npm run test:unit',
        description: 'Jest unit tests with coverage',
        time: '30-60s',
        scope: 'Individual functions and utilities'
      },
      integration: {
        command: 'make test-fast',
        description: 'Fast integration tests',
        time: '60-120s',
        scope: 'Build process and basic workflows'
      },
      e2e: {
        command: 'make test-e2e',
        description: 'End-to-end browser tests',
        time: '2-5 minutes',
        scope: 'Full user workflows and interactions'
      },
      visual: {
        command: 'make test-visual-matrix',
        description: 'Visual regression across 20 viewport/theme combinations',
        time: '3-8 minutes',
        scope: 'UI consistency and responsive design'
      },
      performance: {
        command: 'make test-performance',
        description: 'Core Web Vitals and performance metrics',
        time: '2-4 minutes',
        scope: 'Page load speed and performance'
      },
      accessibility: {
        command: 'make test-accessibility',
        description: 'WCAG 2.1 AA compliance validation',
        time: '1-3 minutes',
        scope: 'Screen reader and accessibility compliance'
      },
      pdf: {
        command: 'make test-pdf',
        description: 'PDF generation validation (3 variants)',
        time: '1-2 minutes',
        scope: 'PDF creation and QR code generation'
      }
    };

    this.filePatterns = {
      // Critical files that need comprehensive testing
      critical: [
        /src\/resume-data\.json$/,
        /src\/templates\/template\.html$/,
        /scripts\/build\.js$/,
        /package(-lock)?\.json$/
      ],
      
      // UI/visual changes
      visual: [
        /\.css$/,
        /\.html$/,
        /assets\/.*\.(png|jpg|jpeg|svg)$/,
        /src\/templates\//
      ],
      
      // Build and infrastructure
      infrastructure: [
        /\.github\/workflows\//,
        /Dockerfile/,
        /docker-compose/,
        /scripts\//,
        /Makefile$/
      ],
      
      // Documentation (low test priority)
      documentation: [
        /\.md$/,
        /README/,
        /docs\//
      ],
      
      // Test files (need test validation)
      testing: [
        /tests?\//,
        /\.spec\.js$/,
        /\.test\.js$/,
        /playwright\.config/,
        /jest\.config/
      ]
    };

    this.strategies = {
      minimal: {
        description: 'Quick validation for low-risk changes',
        tests: ['unit', 'integration'],
        timeEstimate: '2-3 minutes',
        confidence: 'medium'
      },
      standard: {
        description: 'Standard testing for normal development',
        tests: ['unit', 'integration', 'pdf'],
        timeEstimate: '3-5 minutes',
        confidence: 'high'
      },
      comprehensive: {
        description: 'Full testing suite for critical changes',
        tests: ['unit', 'integration', 'e2e', 'visual', 'pdf'],
        timeEstimate: '8-15 minutes',
        confidence: 'very high'
      },
      visual_focused: {
        description: 'UI-focused testing for visual changes',
        tests: ['unit', 'visual', 'accessibility', 'pdf'],
        timeEstimate: '5-10 minutes',
        confidence: 'high'
      },
      release_ready: {
        description: 'Production-ready validation for releases',
        tests: ['unit', 'integration', 'e2e', 'visual', 'performance', 'accessibility', 'pdf'],
        timeEstimate: '12-20 minutes',
        confidence: 'maximum'
      }
    };
  }

  /**
   * Execute shell command and return output
   */
  exec(command) {
    try {
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error) {
      return '';
    }
  }

  /**
   * Get list of changed files
   */
  getChangedFiles() {
    // Try staged files first
    let files = this.exec('git diff --cached --name-only');
    if (!files) {
      // Fall back to unstaged changes
      files = this.exec('git diff --name-only');
    }
    if (!files) {
      // Fall back to recent commits
      files = this.exec('git diff HEAD~1 --name-only');
    }
    
    return files ? files.split('\n').filter(f => f.trim()) : [];
  }

  /**
   * Analyze change impact
   */
  analyzeChanges(files) {
    if (files.length === 0) {
      return {
        category: 'no-changes',
        risk: 'none',
        description: 'No changes detected'
      };
    }

    const analysis = {
      categories: [],
      files: files.length,
      risk: 'low',
      patterns: {}
    };

    // Categorize files
    for (const [category, patterns] of Object.entries(this.filePatterns)) {
      const matchingFiles = files.filter(file => 
        patterns.some(pattern => pattern.test(file))
      );
      
      if (matchingFiles.length > 0) {
        analysis.categories.push(category);
        analysis.patterns[category] = matchingFiles;
      }
    }

    // Determine risk level
    if (analysis.categories.includes('critical')) {
      analysis.risk = 'high';
      analysis.description = 'Critical files modified - comprehensive testing recommended';
    } else if (analysis.categories.includes('visual') || analysis.categories.includes('infrastructure')) {
      analysis.risk = 'medium';
      analysis.description = 'UI or infrastructure changes - targeted testing recommended';
    } else if (analysis.categories.includes('testing')) {
      analysis.risk = 'medium';
      analysis.description = 'Test files modified - test validation required';
    } else if (analysis.categories.includes('documentation')) {
      analysis.risk = 'low';
      analysis.description = 'Documentation changes - minimal testing needed';
    } else {
      analysis.risk = 'medium';
      analysis.description = 'General changes - standard testing recommended';
    }

    return analysis;
  }

  /**
   * Recommend testing strategy based on analysis
   */
  recommendStrategy(analysis) {
    if (analysis.category === 'no-changes') {
      return {
        strategy: 'minimal',
        reason: 'No changes detected',
        tests: ['unit'],
        priority: 'low'
      };
    }

    // Strategy selection logic
    if (analysis.risk === 'high' || analysis.categories.includes('critical')) {
      if (analysis.categories.includes('visual')) {
        return {
          strategy: 'comprehensive',
          reason: 'Critical files + visual changes require full validation',
          tests: this.strategies.comprehensive.tests,
          priority: 'high'
        };
      } else {
        return {
          strategy: 'comprehensive',
          reason: 'Critical file modifications require comprehensive testing',
          tests: this.strategies.comprehensive.tests,
          priority: 'high'
        };
      }
    }

    if (analysis.categories.includes('visual')) {
      return {
        strategy: 'visual_focused',
        reason: 'Visual changes require UI-focused testing',
        tests: this.strategies.visual_focused.tests,
        priority: 'medium'
      };
    }

    if (analysis.categories.includes('infrastructure')) {
      return {
        strategy: 'standard',
        reason: 'Infrastructure changes need build validation',
        tests: this.strategies.standard.tests,
        priority: 'medium'
      };
    }

    if (analysis.categories.includes('testing')) {
      return {
        strategy: 'standard',
        reason: 'Test modifications require validation',
        tests: this.strategies.standard.tests,
        priority: 'medium'
      };
    }

    if (analysis.risk === 'low') {
      return {
        strategy: 'minimal',
        reason: 'Low-risk changes need basic validation',
        tests: this.strategies.minimal.tests,
        priority: 'low'
      };
    }

    // Default to standard strategy
    return {
      strategy: 'standard',
      reason: 'Standard testing for normal development changes',
      tests: this.strategies.standard.tests,
      priority: 'medium'
    };
  }

  /**
   * Generate testing recommendations
   */
  async analyzeAndRecommend() {
    console.log('🧪 Test Strategist Analysis Started');
    console.log(`📅 ${new Date().toLocaleString()}`);

    // Get changed files
    const files = this.getChangedFiles();
    console.log(`\n📁 Changed Files (${files.length}):`);
    if (files.length > 0) {
      files.forEach(file => console.log(`   📄 ${file}`));
    } else {
      console.log('   📋 No changes detected');
    }

    // Analyze changes
    const analysis = this.analyzeChanges(files);
    console.log(`\n🔍 Change Analysis:`);
    console.log(`   Risk Level: ${analysis.risk.toUpperCase()}`);
    console.log(`   Description: ${analysis.description}`);
    console.log(`   Categories: ${analysis.categories.join(', ') || 'none'}`);

    // Show detailed file categorization
    if (Object.keys(analysis.patterns).length > 0) {
      console.log(`\n📊 File Categorization:`);
      for (const [category, matchingFiles] of Object.entries(analysis.patterns)) {
        console.log(`   ${category}: ${matchingFiles.length} files`);
        matchingFiles.forEach(file => console.log(`     • ${file}`));
      }
    }

    // Get recommendation
    const recommendation = this.recommendStrategy(analysis);
    const strategy = this.strategies[recommendation.strategy];

    console.log(`\n🎯 Recommended Strategy: ${recommendation.strategy.toUpperCase()}`);
    console.log(`   ${strategy.description}`);
    console.log(`   Reason: ${recommendation.reason}`);
    console.log(`   Priority: ${recommendation.priority.toUpperCase()}`);
    console.log(`   Time Estimate: ${strategy.timeEstimate}`);
    console.log(`   Confidence: ${strategy.confidence}`);

    console.log(`\n🧪 Recommended Tests:`);
    recommendation.tests.forEach(testType => {
      const test = this.testTypes[testType];
      console.log(`   ✅ ${testType}: ${test.description}`);
      console.log(`      Command: ${test.command}`);
      console.log(`      Time: ${test.time}`);
    });

    // Execution recommendations
    console.log(`\n🚀 Execution Strategy:`);
    if (recommendation.priority === 'low') {
      console.log('   💡 Local execution recommended (fast feedback)');
      console.log('   📝 Optional: Trigger CI for comprehensive validation');
    } else if (recommendation.priority === 'medium') {
      console.log('   💡 Local + CI execution recommended');
      console.log('   📝 Run key tests locally, full suite in CI');
    } else {
      console.log('   💡 Comprehensive CI execution recommended');
      console.log('   📝 Critical changes require full validation');
    }

    // Next steps
    console.log(`\n💻 Commands to Execute:`);
    if (recommendation.tests.length <= 3) {
      console.log('   # Quick local validation:');
      recommendation.tests.forEach(testType => {
        console.log(`   ${this.testTypes[testType].command}`);
      });
    } else {
      console.log('   # Recommended approach:');
      console.log('   npm run test:local                    # Fast local tests');
      console.log('   npm run test:ci                       # Trigger comprehensive CI');
    }

    console.log('\n🔄 Alternative commands:');
    console.log('   npm run test:local                     # Fast local tests only');
    console.log('   npm run test:ci                        # Comprehensive CI tests');
    console.log('   make test-visual-matrix                # Visual regression only');
    console.log('   node .claude/test-strategist.js --execute-recommended  # Auto-execute');

    return {
      analysis,
      recommendation,
      strategy
    };
  }

  /**
   * Execute recommended tests
   */
  async executeRecommended() {
    const { recommendation } = await this.analyzeAndRecommend();
    
    console.log(`\n⚡ Executing Recommended Tests...`);
    
    let passed = 0;
    let failed = 0;
    
    for (const testType of recommendation.tests) {
      const test = this.testTypes[testType];
      console.log(`\n🧪 Running ${testType}: ${test.description}`);
      console.log(`⏰ Estimated time: ${test.time}`);
      
      try {
        console.log(`🔧 Command: ${test.command}`);
        const result = this.exec(test.command);
        console.log(`✅ ${testType} passed`);
        passed++;
        
        if (result) {
          // Show condensed output for successful tests
          const lines = result.split('\n');
          if (lines.length > 10) {
            console.log(`📋 Output (last 5 lines):`);
            lines.slice(-5).forEach(line => console.log(`   ${line}`));
          } else {
            console.log(`📋 Output:\n${result}`);
          }
        }
      } catch (error) {
        console.log(`❌ ${testType} failed: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\n📊 Test Execution Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log(`\n🔧 Next Steps for Failures:`);
      console.log(`   • Review error messages above`);
      console.log(`   • Fix issues and re-run: node .claude/test-strategist.js --execute-recommended`);
      console.log(`   • Or run individual tests: make test-<type>`);
    } else {
      console.log(`\n🎉 All recommended tests passed! Ready for commit.`);
      console.log(`   • git add .`);
      console.log(`   • node .claude/conventional-committer.js`);
      console.log(`   • git push`);
    }
    
    return failed === 0;
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse arguments
  args.forEach(arg => {
    if (arg === '--analyze-changes') options.analyzeChanges = true;
    else if (arg === '--recommend-strategy') options.recommendStrategy = true;
    else if (arg === '--execute-recommended') options.executeRecommended = true;
  });

  const strategist = new TestStrategist();
  
  if (options.executeRecommended) {
    strategist.executeRecommended().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    strategist.analyzeAndRecommend().then(() => {
      process.exit(0);
    });
  }
}

module.exports = TestStrategist;