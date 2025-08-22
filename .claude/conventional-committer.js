#!/usr/bin/env node
/**
 * Conventional Committer Agent
 * 
 * Smart agent that analyzes staged changes and generates proper conventional commit messages
 * following the project's specific patterns and standards.
 * 
 * Usage:
 *   node .claude/conventional-committer.js
 *   node .claude/conventional-committer.js --dry-run
 *   node .claude/conventional-committer.js --scope=ci
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ConventionalCommitter {
  constructor() {
    this.projectPatterns = {
      // File patterns and their associated types/scopes
      workflows: { pattern: /\.github\/workflows\/.*\.yml$/, type: 'ci', scope: null },
      resumeData: { pattern: /src\/resume-data\.json$/, type: 'feat', scope: 'resume' },
      templates: { pattern: /src\/templates\/.*\.html$/, type: 'feat', scope: 'ui' },
      scripts: { pattern: /scripts\/.*\.js$/, type: 'feat', scope: 'build' },
      tests: { pattern: /tests\/.*\.(js|spec\.js)$/, type: 'test', scope: null },
      docs: { pattern: /(README|\.md)$/, type: 'docs', scope: null },
      package: { pattern: /package(-lock)?\.json$/, type: 'chore', scope: 'deps' },
      assets: { pattern: /assets\/.*/, type: 'feat', scope: 'assets' },
      docker: { pattern: /(Dockerfile|docker-compose\.yml)$/, type: 'ci', scope: 'docker' },
      claude: { pattern: /\.claude\/.*/, type: 'feat', scope: 'dx' }
    };

    this.typeDescriptions = {
      feat: 'New features or enhancements',
      fix: 'Bug fixes and corrections',
      chore: 'Maintenance, dependencies, or administrative tasks',
      docs: 'Documentation updates',
      ci: 'CI/CD pipeline changes',
      test: 'Test additions or modifications',
      refactor: 'Code refactoring without functional changes',
      perf: 'Performance improvements',
      style: 'Code formatting and style changes'
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
   * Get staged files
   */
  getStagedFiles() {
    const output = this.exec('git diff --cached --name-only');
    return output ? output.split('\n').filter(f => f.trim()) : [];
  }

  /**
   * Get file change statistics
   */
  getChangeStats() {
    const output = this.exec('git diff --cached --numstat');
    if (!output) return { added: 0, deleted: 0, files: 0 };

    const lines = output.split('\n');
    let added = 0, deleted = 0;
    
    lines.forEach(line => {
      const [a, d] = line.split('\t');
      if (a !== '-' && d !== '-') {
        added += parseInt(a) || 0;
        deleted += parseInt(d) || 0;
      }
    });

    return { added, deleted, files: lines.length };
  }

  /**
   * Analyze file to determine type and scope
   */
  analyzeFile(filePath) {
    for (const [category, config] of Object.entries(this.projectPatterns)) {
      if (config.pattern.test(filePath)) {
        return {
          type: config.type,
          scope: config.scope,
          category,
          confidence: 'high'
        };
      }
    }

    // Fallback analysis
    if (filePath.includes('test')) return { type: 'test', scope: null, category: 'test', confidence: 'medium' };
    if (filePath.endsWith('.md')) return { type: 'docs', scope: null, category: 'docs', confidence: 'medium' };
    if (filePath.includes('config')) return { type: 'chore', scope: 'config', category: 'config', confidence: 'medium' };
    
    return { type: 'feat', scope: null, category: 'unknown', confidence: 'low' };
  }

  /**
   * Generate intelligent commit description based on changes
   */
  generateDescription(stagedFiles, analysis) {
    const stats = this.getChangeStats();
    const primaryType = analysis.type;
    const primaryScope = analysis.scope;

    // Get diff content for better description
    const diffOutput = this.exec('git diff --cached');
    
    // ARM64 optimization patterns
    if (diffOutput.includes('arm64') || diffOutput.includes('ARM64')) {
      if (primaryType === 'ci') {
        return 'migrate workflows to arm64 runners for enhanced performance';
      }
      return 'add arm64 optimization support';
    }

    // Staging/deployment patterns
    if (diffOutput.includes('staging') && diffOutput.includes('release-please')) {
      return 'add staging results posting to release-please prs';
    }

    // User-friendly improvements
    if (diffOutput.includes('user-friendly') || diffOutput.includes('User-Friendly')) {
      return 'add user-friendly step summaries and enhanced deployment status';
    }

    // Workflow improvements
    if (primaryType === 'ci' && diffOutput.includes('workflow')) {
      if (diffOutput.includes('summary')) return 'enhance workflow summaries for better user experience';
      if (diffOutput.includes('deploy')) return 'improve deployment workflow reliability';
      return 'enhance ci/cd pipeline configuration';
    }

    // Resume content updates
    if (primaryScope === 'resume') {
      if (diffOutput.includes('arm64')) return 'update resume to reflect arm64 optimization work';
      if (diffOutput.includes('Context7')) return 'update resume with context7 integration experience';
      return 'update resume content and experience details';
    }

    // Test improvements
    if (primaryType === 'test') {
      if (stats.files > 3) return 'add comprehensive test coverage';
      return 'enhance test reliability and coverage';
    }

    // Documentation updates
    if (primaryType === 'docs') {
      if (diffOutput.includes('claude') || diffOutput.includes('agent')) {
        return 'add claude code commands and agents documentation';
      }
      return 'improve documentation and usage guides';
    }

    // Default descriptions based on type
    const defaults = {
      feat: stats.files > 2 ? 'implement multiple feature enhancements' : 'add new functionality',
      fix: 'resolve issues and improve reliability',
      chore: primaryScope === 'deps' ? 'update dependencies' : 'maintenance and administrative updates',
      refactor: 'improve code structure and maintainability',
      perf: 'optimize performance and efficiency'
    };

    return defaults[primaryType] || 'update project files';
  }

  /**
   * Analyze all staged changes
   */
  analyzeChanges(stagedFiles) {
    const analyses = stagedFiles.map(file => ({
      file,
      ...this.analyzeFile(file)
    }));

    // Determine primary type and scope
    const typeCounts = {};
    const scopeCounts = {};
    
    analyses.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
      if (a.scope) scopeCounts[a.scope] = (scopeCounts[a.scope] || 0) + 1;
    });

    const primaryType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b
    );

    const primaryScope = Object.keys(scopeCounts).length > 0 
      ? Object.keys(scopeCounts).reduce((a, b) => 
          scopeCounts[a] > scopeCounts[b] ? a : b
        )
      : null;

    return {
      type: primaryType,
      scope: primaryScope,
      analyses,
      confidence: analyses.every(a => a.confidence === 'high') ? 'high' : 'medium'
    };
  }

  /**
   * Generate conventional commit message
   */
  generateCommitMessage(options = {}) {
    const stagedFiles = this.getStagedFiles();
    
    if (stagedFiles.length === 0) {
      console.log('❌ No staged files found. Use "git add" to stage changes first.');
      return null;
    }

    console.log(`📋 Analyzing ${stagedFiles.length} staged files...`);
    stagedFiles.forEach(file => console.log(`   📄 ${file}`));

    const analysis = this.analyzeChanges(stagedFiles);
    const description = this.generateDescription(stagedFiles, analysis);

    // Build commit message
    let commitMessage = `${analysis.type}`;
    
    if (options.scope || analysis.scope) {
      const scope = options.scope || analysis.scope;
      commitMessage += `(${scope})`;
    }
    
    commitMessage += `: ${description}`;

    // Ensure subject is lowercase (conventional commits requirement)
    const parts = commitMessage.split(': ');
    if (parts.length === 2) {
      parts[1] = parts[1].charAt(0).toLowerCase() + parts[1].slice(1);
      commitMessage = parts.join(': ');
    }

    console.log('\n🤖 Generated Conventional Commit:');
    console.log(`   ${commitMessage}`);
    console.log(`\n📊 Analysis:`);
    console.log(`   Type: ${analysis.type} (${this.typeDescriptions[analysis.type]})`);
    console.log(`   Scope: ${analysis.scope || 'none'}`);
    console.log(`   Confidence: ${analysis.confidence}`);
    console.log(`   Files: ${stagedFiles.length}`);

    return commitMessage;
  }

  /**
   * Execute commit with generated message
   */
  commit(options = {}) {
    const message = this.generateCommitMessage(options);
    
    if (!message) return false;

    if (options.dryRun) {
      console.log('\n🔍 DRY RUN: Would execute:');
      console.log(`   git commit -m "${message}"`);
      return true;
    }

    try {
      console.log('\n⚡ Executing commit...');
      this.exec(`git commit -m "${message}"`);
      console.log('✅ Commit successful!');
      
      // Show next steps
      console.log('\n🚀 Next steps:');
      console.log('   git pull --rebase  # Sync with remote');
      console.log('   git push           # Push changes');
      
      return true;
    } catch (error) {
      console.log('❌ Commit failed:', error.message);
      return false;
    }
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse arguments
  args.forEach(arg => {
    if (arg === '--dry-run') options.dryRun = true;
    if (arg.startsWith('--scope=')) options.scope = arg.split('=')[1];
  });

  const committer = new ConventionalCommitter();
  committer.commit(options);
}

module.exports = ConventionalCommitter;