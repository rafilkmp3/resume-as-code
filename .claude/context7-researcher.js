#!/usr/bin/env node
/**
 * Context7 Researcher Agent
 * 
 * Context7-powered documentation and best practices agent.
 * Uses Context7 to research best practices and provide up-to-date documentation.
 * 
 * Usage:
 *   node .claude/context7-researcher.js <library-name>
 *   node .claude/context7-researcher.js handlebars --topic="template helpers"
 *   node .claude/context7-researcher.js --analyze-dependencies
 *   node .claude/context7-researcher.js --project-recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class Context7Researcher {
  constructor() {
    this.projectDependencies = {
      // Production dependencies that benefit from Context7 research
      'handlebars': {
        usage: 'Template engine for HTML generation',
        topics: ['template helpers', 'custom helpers', 'partials', 'performance optimization'],
        patterns: /src\/templates\//,
        priority: 'high'
      },
      'puppeteer': {
        usage: 'PDF generation and browser automation',
        topics: ['pdf generation', 'performance optimization', 'memory management', 'arm64 compatibility'],
        patterns: /scripts\/.*pdf/,
        priority: 'high'
      },
      'sharp': {
        usage: 'Image optimization and processing',
        topics: ['image optimization', 'performance', 'arm64 optimization', 'memory management'],
        patterns: /scripts\/.*image/,
        priority: 'high'
      },
      'playwright': {
        usage: 'End-to-end testing and browser automation',
        topics: ['e2e testing', 'visual regression', 'accessibility testing', 'performance testing'],
        patterns: /tests\/.*\.spec\.js/,
        priority: 'medium'
      },
      'jest': {
        usage: 'Unit testing framework',
        topics: ['unit testing', 'test coverage', 'mocking', 'performance'],
        patterns: /tests\/unit\//,
        priority: 'medium'
      },
      'express': {
        usage: 'Development and production servers',
        topics: ['server optimization', 'static file serving', 'middleware', 'performance'],
        patterns: /scripts\/.*server/,
        priority: 'low'
      }
    };

    this.researchAreas = {
      'performance': {
        description: 'Performance optimization strategies',
        keywords: ['optimization', 'performance', 'speed', 'memory', 'arm64'],
        priority: 'high'
      },
      'testing': {
        description: 'Testing best practices and patterns',
        keywords: ['testing', 'coverage', 'e2e', 'visual regression', 'accessibility'],
        priority: 'medium'
      },
      'build-optimization': {
        description: 'Build system and workflow optimization',
        keywords: ['build', 'webpack', 'bundling', 'caching', 'ci/cd'],
        priority: 'medium'
      },
      'arm64-compatibility': {
        description: 'ARM64 architecture optimization',
        keywords: ['arm64', 'apple silicon', 'native compilation', 'performance'],
        priority: 'high'
      },
      'accessibility': {
        description: 'Web accessibility best practices',
        keywords: ['accessibility', 'wcag', 'screen readers', 'aria'],
        priority: 'medium'
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
   * Get project package.json for dependency analysis
   */
  getProjectDependencies() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return {
          dependencies: packageJson.dependencies || {},
          devDependencies: packageJson.devDependencies || {}
        };
      }
    } catch (error) {
      console.log(`⚠️ Could not read package.json: ${error.message}`);
    }
    return { dependencies: {}, devDependencies: {} };
  }

  /**
   * Analyze current project context for research opportunities
   */
  analyzeProjectContext() {
    console.log('🔍 Analyzing project context for research opportunities...');
    
    const deps = this.getProjectDependencies();
    const allDeps = { ...deps.dependencies, ...deps.devDependencies };
    
    console.log(`\n📦 Project Dependencies Analysis:`);
    console.log(`   Production: ${Object.keys(deps.dependencies).length} packages`);
    console.log(`   Development: ${Object.keys(deps.devDependencies).length} packages`);

    // Find research opportunities
    const opportunities = [];
    
    for (const [depName, depInfo] of Object.entries(this.projectDependencies)) {
      if (allDeps[depName]) {
        opportunities.push({
          name: depName,
          version: allDeps[depName],
          usage: depInfo.usage,
          topics: depInfo.topics,
          priority: depInfo.priority
        });
      }
    }

    console.log(`\n🎯 Research Opportunities (${opportunities.length}):`);
    opportunities
      .sort((a, b) => {
        const priorities = { high: 3, medium: 2, low: 1 };
        return priorities[b.priority] - priorities[a.priority];
      })
      .forEach(opp => {
        console.log(`   ${opp.priority === 'high' ? '🔥' : opp.priority === 'medium' ? '📋' : '💡'} ${opp.name}@${opp.version}`);
        console.log(`      Usage: ${opp.usage}`);
        console.log(`      Research Topics: ${opp.topics.join(', ')}`);
      });

    return opportunities;
  }

  /**
   * Generate Context7 research suggestions
   */
  generateResearchSuggestions(opportunities) {
    console.log(`\n📚 Context7 Research Suggestions:`);

    // High priority suggestions
    const highPriority = opportunities.filter(o => o.priority === 'high');
    if (highPriority.length > 0) {
      console.log(`\n🔥 High Priority Research:`);
      highPriority.forEach(opp => {
        console.log(`\n   📖 ${opp.name} Research Commands:`);
        opp.topics.forEach(topic => {
          console.log(`      @context7-researcher ${opp.name} --topic="${topic}"`);
        });
      });
    }

    // Project-specific research areas
    console.log(`\n🎯 Project-Specific Research Areas:`);
    const projectAreas = [
      'Resume generation optimization patterns',
      'PDF generation best practices for ARM64',
      'Multi-format output strategies (HTML, PDF)',
      'GitHub Actions ARM64 optimization',
      'Visual regression testing patterns',
      'Accessibility compliance for resume websites'
    ];

    projectAreas.forEach(area => {
      console.log(`   💡 ${area}`);
    });

    // Context7 MCP integration examples
    console.log(`\n🔧 Context7 MCP Integration Examples:`);
    console.log(`   # Research handlebars optimization`);
    console.log(`   mcp__context7__resolve-library-id handlebars`);
    console.log(`   mcp__context7__get-library-docs '/handlebars/handlebars.js' --topic='performance'`);
    console.log(``);
    console.log(`   # Research puppeteer ARM64 optimization`);
    console.log(`   mcp__context7__resolve-library-id puppeteer`);
    console.log(`   mcp__context7__get-library-docs '/puppeteer/puppeteer' --topic='arm64'`);

    return projectAreas;
  }

  /**
   * Research specific library with Context7
   */
  async researchLibrary(libraryName, topic = null) {
    console.log(`🔍 Researching: ${libraryName}`);
    if (topic) {
      console.log(`🎯 Focus Topic: ${topic}`);
    }

    // Check if library is in our project
    const deps = this.getProjectDependencies();
    const allDeps = { ...deps.dependencies, ...deps.devDependencies };
    const projectInfo = this.projectDependencies[libraryName];

    if (allDeps[libraryName]) {
      console.log(`✅ ${libraryName}@${allDeps[libraryName]} found in project`);
      if (projectInfo) {
        console.log(`📋 Usage: ${projectInfo.usage}`);
        console.log(`🎯 Suggested Topics: ${projectInfo.topics.join(', ')}`);
      }
    } else {
      console.log(`⚠️ ${libraryName} not found in project dependencies`);
    }

    // Provide Context7 MCP command examples
    console.log(`\n🔧 Context7 Research Commands:`);
    console.log(`\n   # Step 1: Resolve library ID`);
    console.log(`   mcp__context7__resolve-library-id ${libraryName}`);
    
    console.log(`\n   # Step 2: Get documentation`);
    if (topic) {
      console.log(`   mcp__context7__get-library-docs '/org/${libraryName}' --topic='${topic}'`);
    } else {
      console.log(`   mcp__context7__get-library-docs '/org/${libraryName}'`);
      console.log(`   mcp__context7__get-library-docs '/org/${libraryName}' --topic='best practices'`);
      console.log(`   mcp__context7__get-library-docs '/org/${libraryName}' --topic='performance'`);
    }

    // Project-specific research suggestions
    if (projectInfo) {
      console.log(`\n💡 Project-Specific Research Suggestions:`);
      projectInfo.topics.forEach(suggestedTopic => {
        console.log(`   📖 ${suggestedTopic}:`);
        console.log(`      mcp__context7__get-library-docs '/org/${libraryName}' --topic='${suggestedTopic}'`);
      });
    }

    // Find related files in project
    console.log(`\n📂 Related Files in Project:`);
    try {
      const files = this.exec('find . -type f -name "*.js" -o -name "*.json" -o -name "*.html" | head -20');
      if (files) {
        const fileList = files.split('\n');
        const relatedFiles = fileList.filter(file => {
          if (projectInfo?.patterns) {
            return projectInfo.patterns.test(file);
          }
          return file.includes(libraryName) || 
                 file.includes('package.json') ||
                 file.includes('build') ||
                 file.includes('test');
        });

        if (relatedFiles.length > 0) {
          relatedFiles.forEach(file => console.log(`   📄 ${file}`));
        } else {
          console.log(`   💭 No obvious related files found`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Could not scan project files`);
    }

    return {
      libraryName,
      topic,
      isInProject: !!allDeps[libraryName],
      version: allDeps[libraryName],
      projectInfo
    };
  }

  /**
   * Generate project recommendations based on Context7 research
   */
  async generateProjectRecommendations() {
    console.log('💡 Generating Context7-Based Project Recommendations...');

    const opportunities = this.analyzeProjectContext();
    const suggestions = this.generateResearchSuggestions(opportunities);

    console.log(`\n🚀 Immediate Research Actions:`);
    
    // Top 3 high-impact research areas
    const topResearch = [
      {
        area: 'Puppeteer ARM64 Optimization',
        commands: [
          'mcp__context7__resolve-library-id puppeteer',
          'mcp__context7__get-library-docs \'/puppeteer/puppeteer\' --topic=\'arm64 optimization\''
        ],
        impact: 'High - PDF generation performance',
        files: ['scripts/build.js', 'scripts/utils/pdf-utils.js']
      },
      {
        area: 'Sharp Image Optimization',
        commands: [
          'mcp__context7__resolve-library-id sharp',
          'mcp__context7__get-library-docs \'/lovell/sharp\' --topic=\'performance optimization\''
        ],
        impact: 'High - Image processing speed',
        files: ['scripts/utils/image-optimization.js']
      },
      {
        area: 'Handlebars Template Performance',
        commands: [
          'mcp__context7__resolve-library-id handlebars',
          'mcp__context7__get-library-docs \'/handlebars/handlebars.js\' --topic=\'template helpers\''
        ],
        impact: 'Medium - Template rendering speed',
        files: ['src/templates/template.html', 'scripts/build.js']
      }
    ];

    topResearch.forEach((research, index) => {
      console.log(`\n   ${index + 1}. ${research.area}`);
      console.log(`      Impact: ${research.impact}`);
      console.log(`      Files: ${research.files.join(', ')}`);
      console.log(`      Commands:`);
      research.commands.forEach(cmd => console.log(`        ${cmd}`));
    });

    console.log(`\n📋 Research Workflow:`);
    console.log(`   1. Choose high-impact area above`);
    console.log(`   2. Run Context7 commands to get documentation`);
    console.log(`   3. Apply best practices to related files`);
    console.log(`   4. Test performance improvements`);
    console.log(`   5. Document findings in project`);

    return topResearch;
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  let libraryName = '';

  // Parse arguments
  const nonFlagArgs = [];
  args.forEach(arg => {
    if (arg.startsWith('--topic=')) {
      options.topic = arg.split('=')[1];
    } else if (arg === '--analyze-dependencies') {
      options.analyzeDependencies = true;
    } else if (arg === '--project-recommendations') {
      options.projectRecommendations = true;
    } else {
      nonFlagArgs.push(arg);
    }
  });

  libraryName = nonFlagArgs.join(' ');

  const researcher = new Context7Researcher();

  if (options.analyzeDependencies) {
    researcher.analyzeProjectContext();
  } else if (options.projectRecommendations) {
    researcher.generateProjectRecommendations();
  } else if (libraryName) {
    researcher.researchLibrary(libraryName, options.topic);
  } else {
    console.log('📚 Context7 Researcher Agent');
    console.log('\nUsage:');
    console.log('  node .claude/context7-researcher.js <library-name>');
    console.log('  node .claude/context7-researcher.js handlebars --topic="template helpers"');
    console.log('  node .claude/context7-researcher.js --analyze-dependencies');
    console.log('  node .claude/context7-researcher.js --project-recommendations');
    console.log('\nExamples:');
    console.log('  node .claude/context7-researcher.js puppeteer --topic="arm64 optimization"');
    console.log('  node .claude/context7-researcher.js sharp --topic="performance"');
    console.log('  node .claude/context7-researcher.js --project-recommendations');
  }
}

module.exports = Context7Researcher;