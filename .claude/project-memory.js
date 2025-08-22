#!/usr/bin/env node
/**
 * Project Memory System
 * 
 * Centralized memory and context management for Claude Code agents.
 * Tracks project state, recent changes, performance metrics, and agent interactions.
 * Provides context-aware recommendations and learning from project patterns.
 * 
 * Usage:
 *   node .claude/project-memory.js
 *   node .claude/project-memory.js --update
 *   node .claude/project-memory.js --context=<agent-name>
 *   node .claude/project-memory.js --summary
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectMemory {
  constructor() {
    this.memoryPath = '.claude/memory.json';
    this.contextPath = '.claude/context.json';
    this.metricsPath = '.claude/metrics.json';
    
    // Initialize memory structure
    this.memoryStructure = {
      project: {
        name: 'resume-as-code',
        type: 'resume-generator',
        architecture: 'docker-compose-nodejs',
        lastUpdated: new Date().toISOString(),
        version: this.getProjectVersion()
      },
      agents: {
        interactions: [],
        preferences: {},
        performance: {}
      },
      development: {
        recentChanges: [],
        buildMetrics: {},
        testResults: {},
        deploymentHistory: []
      },
      patterns: {
        successfulWorkflows: [],
        commonIssues: [],
        optimizations: [],
        userPreferences: []
      },
      context: {
        currentSprint: null,
        activeFeatures: [],
        technicalDebt: [],
        knownIssues: []
      },
      ecosystem: {
        dependencies: {},
        vulnerabilities: [],
        updates: [],
        benchmarks: {}
      }
    };
  }

  /**
   * Load existing memory or create new
   */
  loadMemory() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const data = fs.readFileSync(this.memoryPath, 'utf8');
        return { ...this.memoryStructure, ...JSON.parse(data) };
      }
    } catch (error) {
      console.log(`⚠️ Error loading memory: ${error.message}`);
    }
    return this.memoryStructure;
  }

  /**
   * Save memory to disk
   */
  saveMemory(memory) {
    try {
      const memoryDir = path.dirname(this.memoryPath);
      if (!fs.existsSync(memoryDir)) {
        fs.mkdirSync(memoryDir, { recursive: true });
      }
      
      memory.project.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.memoryPath, JSON.stringify(memory, null, 2));
      return true;
    } catch (error) {
      console.log(`❌ Error saving memory: ${error.message}`);
      return false;
    }
  }

  /**
   * Get project version from package.json or git
   */
  getProjectVersion() {
    try {
      if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.version || '1.0.0';
      }
      
      // Fallback to git tag
      const gitTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0"', 
        { encoding: 'utf8' }).trim();
      return gitTag.replace('v', '');
    } catch (error) {
      return '1.0.0';
    }
  }

  /**
   * Update project memory with current state
   */
  async updateMemory() {
    console.log('🧠 Updating Project Memory...');
    
    const memory = this.loadMemory();
    
    // Update project information
    memory.project.version = this.getProjectVersion();
    memory.project.lastUpdated = new Date().toISOString();
    
    // Analyze recent changes
    await this.analyzeRecentChanges(memory);
    
    // Update dependency information
    await this.analyzeDependencies(memory);
    
    // Collect build metrics
    await this.collectBuildMetrics(memory);
    
    // Update deployment history
    await this.updateDeploymentHistory(memory);
    
    // Analyze patterns
    this.analyzePatterns(memory);
    
    // Save updated memory
    this.saveMemory(memory);
    
    console.log('✅ Project memory updated successfully');
    return memory;
  }

  /**
   * Analyze recent Git changes
   */
  async analyzeRecentChanges(memory) {
    try {
      // Get recent commits
      const commits = execSync('git log --oneline -10 --since="7 days ago"', 
        { encoding: 'utf8' }).trim();
      
      if (commits) {
        const commitLines = commits.split('\n');
        const recentChanges = commitLines.map(line => {
          const [hash, ...messageParts] = line.split(' ');
          return {
            hash: hash,
            message: messageParts.join(' '),
            timestamp: new Date().toISOString(), // Simplified
            type: this.classifyCommitType(messageParts.join(' '))
          };
        });
        
        memory.development.recentChanges = recentChanges;
        console.log(`   📝 Tracked ${recentChanges.length} recent changes`);
      }
      
      // Get changed files
      const changedFiles = execSync('git diff --name-only HEAD~5', 
        { encoding: 'utf8' }).trim();
      
      if (changedFiles) {
        const files = changedFiles.split('\n');
        memory.development.changedFiles = files.map(file => ({
          path: file,
          category: this.categorizeFile(file),
          lastModified: new Date().toISOString()
        }));
        console.log(`   📁 Tracked ${files.length} changed files`);
      }
    } catch (error) {
      console.log(`   ⚠️ Could not analyze recent changes: ${error.message}`);
    }
  }

  /**
   * Analyze project dependencies
   */
  async analyzeDependencies(memory) {
    try {
      if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        memory.ecosystem.dependencies = {
          production: pkg.dependencies || {},
          development: pkg.devDependencies || {},
          total: Object.keys(pkg.dependencies || {}).length + 
                 Object.keys(pkg.devDependencies || {}).length,
          lastAnalyzed: new Date().toISOString()
        };
        
        console.log(`   📦 Analyzed ${memory.ecosystem.dependencies.total} dependencies`);
        
        // Check for known high-impact dependencies
        const criticalDeps = ['puppeteer', 'sharp', 'handlebars', 'playwright'];
        memory.ecosystem.criticalDependencies = criticalDeps.filter(dep => 
          pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]
        );
      }
    } catch (error) {
      console.log(`   ⚠️ Could not analyze dependencies: ${error.message}`);
    }
  }

  /**
   * Collect build performance metrics
   */
  async collectBuildMetrics(memory) {
    try {
      // Check if dist directory exists and get metrics
      if (fs.existsSync('dist')) {
        const distStats = this.getDirectoryStats('dist');
        memory.development.buildMetrics = {
          outputSize: distStats.totalSize,
          fileCount: distStats.fileCount,
          lastBuild: fs.statSync('dist').mtime.toISOString(),
          performance: this.assessBuildPerformance(distStats)
        };
        
        console.log(`   ⚡ Build metrics: ${distStats.fileCount} files, ${(distStats.totalSize / 1024).toFixed(1)}KB`);
      }
      
      // Check for test results
      if (fs.existsSync('coverage')) {
        memory.development.testResults.lastRun = fs.statSync('coverage').mtime.toISOString();
        memory.development.testResults.hasResults = true;
      }
    } catch (error) {
      console.log(`   ⚠️ Could not collect build metrics: ${error.message}`);
    }
  }

  /**
   * Update deployment history from Git and CI
   */
  async updateDeploymentHistory(memory) {
    try {
      // Get recent tags (releases)
      const tags = execSync('git tag --sort=-version:refname | head -5', 
        { encoding: 'utf8' }).trim();
      
      if (tags) {
        const tagList = tags.split('\n').filter(tag => tag.trim());
        memory.development.deploymentHistory = tagList.map(tag => ({
          version: tag,
          type: 'release',
          timestamp: this.getTagDate(tag)
        }));
        
        console.log(`   🚀 Tracked ${tagList.length} recent releases`);
      }
    } catch (error) {
      console.log(`   ⚠️ Could not update deployment history: ${error.message}`);
    }
  }

  /**
   * Analyze patterns and learn from project behavior
   */
  analyzePatterns(memory) {
    console.log(`   🔍 Analyzing project patterns...`);
    
    // Analyze commit patterns
    if (memory.development.recentChanges) {
      const commitTypes = memory.development.recentChanges.reduce((acc, change) => {
        acc[change.type] = (acc[change.type] || 0) + 1;
        return acc;
      }, {});
      
      memory.patterns.commitPatterns = commitTypes;
      
      // Identify most common change type
      const mostCommonType = Object.entries(commitTypes)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (mostCommonType) {
        memory.patterns.primaryDevelopmentFocus = mostCommonType[0];
      }
    }
    
    // Analyze file change patterns
    if (memory.development.changedFiles) {
      const fileCategories = memory.development.changedFiles.reduce((acc, file) => {
        acc[file.category] = (acc[file.category] || 0) + 1;
        return acc;
      }, {});
      
      memory.patterns.fileChangePatterns = fileCategories;
    }
    
    // Project health indicators
    memory.patterns.healthIndicators = {
      hasRecentActivity: (memory.development.recentChanges?.length || 0) > 0,
      buildArtifacts: fs.existsSync('dist'),
      testCoverage: fs.existsSync('coverage'),
      documentation: fs.existsSync('README.md'),
      ci: fs.existsSync('.github/workflows'),
      docker: fs.existsSync('docker-compose.yml')
    };
  }

  /**
   * Get context for specific agent
   */
  getAgentContext(agentName) {
    const memory = this.loadMemory();
    
    console.log(`🤖 Loading context for: ${agentName}`);
    
    const context = {
      agent: agentName,
      timestamp: new Date().toISOString(),
      project: memory.project,
      recentActivity: memory.development.recentChanges?.slice(0, 5) || [],
      relevantPatterns: this.getRelevantPatterns(agentName, memory),
      recommendations: this.generateAgentRecommendations(agentName, memory),
      metrics: memory.development.buildMetrics || {}
    };
    
    // Record agent interaction
    if (!memory.agents.interactions) memory.agents.interactions = [];
    memory.agents.interactions.push({
      agent: agentName,
      timestamp: new Date().toISOString(),
      contextRequested: true
    });
    
    // Keep only last 50 interactions
    memory.agents.interactions = memory.agents.interactions.slice(-50);
    
    this.saveMemory(memory);
    
    return context;
  }

  /**
   * Get relevant patterns for specific agent
   */
  getRelevantPatterns(agentName, memory) {
    const patterns = {};
    
    switch (agentName) {
      case 'conventional-committer':
        patterns.commitTypes = memory.patterns.commitPatterns || {};
        patterns.primaryFocus = memory.patterns.primaryDevelopmentFocus || 'feat';
        break;
        
      case 'test-strategist':
        patterns.testResults = memory.development.testResults || {};
        patterns.changedAreas = memory.patterns.fileChangePatterns || {};
        break;
        
      case 'deployment-monitor':
        patterns.deploymentHistory = memory.development.deploymentHistory || [];
        patterns.buildMetrics = memory.development.buildMetrics || {};
        break;
        
      case 'performance-analyzer':
        patterns.buildMetrics = memory.development.buildMetrics || {};
        patterns.dependencies = memory.ecosystem.dependencies || {};
        break;
        
      case 'resume-optimizer':
        patterns.contentChanges = memory.development.changedFiles?.filter(f => 
          f.path.includes('resume-data.json') || f.path.includes('template')
        ) || [];
        break;
    }
    
    return patterns;
  }

  /**
   * Generate agent-specific recommendations
   */
  generateAgentRecommendations(agentName, memory) {
    const recommendations = [];
    
    // General project health recommendations
    const health = memory.patterns.healthIndicators || {};
    
    if (!health.hasRecentActivity) {
      recommendations.push('No recent activity detected - consider updating project');
    }
    
    if (!health.testCoverage && agentName === 'test-strategist') {
      recommendations.push('No test coverage detected - recommend running test suite');
    }
    
    if (!health.buildArtifacts && ['deployment-monitor', 'performance-analyzer'].includes(agentName)) {
      recommendations.push('No build artifacts found - recommend running build process');
    }
    
    // Agent-specific recommendations
    switch (agentName) {
      case 'conventional-committer':
        const commitTypes = memory.patterns.commitPatterns || {};
        if (commitTypes.fix > commitTypes.feat) {
          recommendations.push('More fixes than features recently - consider focusing on new development');
        }
        break;
        
      case 'resume-optimizer':
        const hasResumeChanges = memory.development.changedFiles?.some(f => 
          f.path.includes('resume-data.json')
        );
        if (hasResumeChanges) {
          recommendations.push('Resume data recently changed - recommend running optimization analysis');
        }
        break;
    }
    
    return recommendations;
  }

  /**
   * Display comprehensive project summary
   */
  displayProjectSummary() {
    const memory = this.loadMemory();
    
    console.log('🧠 Project Memory Summary');
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log(`${'='.repeat(50)}`);
    
    // Project info
    console.log(`\n📋 Project Information:`);
    console.log(`   Name: ${memory.project.name}`);
    console.log(`   Type: ${memory.project.type}`);
    console.log(`   Version: ${memory.project.version}`);
    console.log(`   Last Updated: ${new Date(memory.project.lastUpdated).toLocaleString()}`);
    
    // Recent activity
    if (memory.development.recentChanges?.length > 0) {
      console.log(`\n📝 Recent Activity (${memory.development.recentChanges.length} changes):`);
      memory.development.recentChanges.slice(0, 5).forEach(change => {
        console.log(`   ${change.type}: ${change.message.substring(0, 60)}...`);
      });
    }
    
    // Dependencies
    if (memory.ecosystem.dependencies) {
      const deps = memory.ecosystem.dependencies;
      console.log(`\n📦 Dependencies: ${deps.total} total`);
      console.log(`   Production: ${Object.keys(deps.production || {}).length}`);
      console.log(`   Development: ${Object.keys(deps.development || {}).length}`);
      
      if (memory.ecosystem.criticalDependencies?.length > 0) {
        console.log(`   Critical: ${memory.ecosystem.criticalDependencies.join(', ')}`);
      }
    }
    
    // Build metrics
    if (memory.development.buildMetrics) {
      const metrics = memory.development.buildMetrics;
      console.log(`\n⚡ Build Metrics:`);
      console.log(`   Output Size: ${(metrics.outputSize / 1024).toFixed(1)}KB`);
      console.log(`   File Count: ${metrics.fileCount}`);
      console.log(`   Last Build: ${new Date(metrics.lastBuild).toLocaleString()}`);
    }
    
    // Patterns
    if (memory.patterns.commitPatterns) {
      console.log(`\n🔍 Development Patterns:`);
      Object.entries(memory.patterns.commitPatterns).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} commits`);
      });
    }
    
    // Health indicators
    if (memory.patterns.healthIndicators) {
      console.log(`\n💚 Project Health:`);
      Object.entries(memory.patterns.healthIndicators).forEach(([indicator, status]) => {
        console.log(`   ${status ? '✅' : '❌'} ${indicator}`);
      });
    }
    
    // Agent interactions
    if (memory.agents.interactions?.length > 0) {
      console.log(`\n🤖 Recent Agent Activity:`);
      const recentAgents = memory.agents.interactions.slice(-5);
      recentAgents.forEach(interaction => {
        console.log(`   ${interaction.agent}: ${new Date(interaction.timestamp).toLocaleString()}`);
      });
    }
    
    return memory;
  }

  /**
   * Helper methods
   */
  
  classifyCommitType(message) {
    const msg = message.toLowerCase();
    if (msg.startsWith('feat')) return 'feat';
    if (msg.startsWith('fix')) return 'fix';
    if (msg.startsWith('chore')) return 'chore';
    if (msg.startsWith('docs')) return 'docs';
    if (msg.startsWith('ci')) return 'ci';
    if (msg.startsWith('refactor')) return 'refactor';
    if (msg.startsWith('test')) return 'test';
    if (msg.startsWith('perf')) return 'perf';
    return 'other';
  }

  categorizeFile(filePath) {
    if (filePath.includes('.github/workflows/')) return 'ci';
    if (filePath.includes('src/resume-data.json')) return 'content';
    if (filePath.includes('template')) return 'ui';
    if (filePath.includes('test')) return 'test';
    if (filePath.includes('script')) return 'build';
    if (filePath.includes('.md')) return 'docs';
    if (filePath.includes('package.json')) return 'deps';
    return 'other';
  }

  getDirectoryStats(dirPath) {
    let totalSize = 0;
    let fileCount = 0;
    
    const scanDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            scanDir(fullPath);
          } else {
            totalSize += stats.size;
            fileCount++;
          }
        });
      } catch (error) {
        // Ignore permission errors
      }
    };
    
    scanDir(dirPath);
    return { totalSize, fileCount };
  }

  assessBuildPerformance(stats) {
    // Simple performance assessment
    const sizePerFile = stats.totalSize / stats.fileCount;
    
    if (sizePerFile < 10000) return 'optimal';
    if (sizePerFile < 50000) return 'good';
    if (sizePerFile < 100000) return 'fair';
    return 'needs-optimization';
  }

  getTagDate(tag) {
    try {
      const date = execSync(`git log -1 --format=%ai ${tag}`, { encoding: 'utf8' }).trim();
      return new Date(date).toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse arguments
  args.forEach(arg => {
    if (arg === '--update') {
      options.update = true;
    } else if (arg.startsWith('--context=')) {
      options.context = arg.split('=')[1];
    } else if (arg === '--summary') {
      options.summary = true;
    }
  });

  const memory = new ProjectMemory();

  if (options.update) {
    memory.updateMemory();
  } else if (options.context) {
    const context = memory.getAgentContext(options.context);
    console.log(JSON.stringify(context, null, 2));
  } else if (options.summary) {
    memory.displayProjectSummary();
  } else {
    memory.displayProjectSummary();
  }
}

module.exports = ProjectMemory;