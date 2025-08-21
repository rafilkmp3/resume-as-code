#!/usr/bin/env node

/**
 * E2E Pipeline Orchestrator
 * 
 * Utility script for automating the full workflow testing cycle:
 * PR → preview → staging → production
 * 
 * Usage:
 * npm run e2e:test                    # Full cycle test
 * npm run e2e:test -- --scope pr-flow-only
 * npm run e2e:test -- --dry-run
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORKFLOW_FILE = 'e2e-pipeline-validation.yml';
const DEFAULT_SCOPE = 'full-cycle';

class E2EPipelineOrchestrator {
  constructor(options = {}) {
    this.scope = options.scope || DEFAULT_SCOPE;
    this.dryRun = options.dryRun || false;
    this.skipPrCreation = options.skipPrCreation || false;
    this.prNumber = options.prNumber || '';
    this.verbose = options.verbose || false;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔧'
    }[type];
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async validateEnvironment() {
    this.log('Validating environment prerequisites...', 'info');

    try {
      // Check GitHub CLI authentication
      execSync('gh auth status', { stdio: 'pipe' });
      this.log('GitHub CLI authenticated', 'success');
    } catch (error) {
      this.log('GitHub CLI not authenticated. Run: gh auth login', 'error');
      process.exit(1);
    }

    try {
      // Check if workflow file exists
      const workflowPath = path.join('.github', 'workflows', WORKFLOW_FILE);
      if (!fs.existsSync(workflowPath)) {
        this.log(`Workflow file not found: ${workflowPath}`, 'error');
        process.exit(1);
      }
      this.log('E2E workflow file found', 'success');
    } catch (error) {
      this.log(`Error checking workflow file: ${error.message}`, 'error');
      process.exit(1);
    }

    // Check repository status
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim() && !this.dryRun) {
        this.log('Working directory has uncommitted changes', 'warning');
        this.log('Consider committing changes before running E2E tests', 'warning');
      }
    } catch (error) {
      this.log(`Error checking git status: ${error.message}`, 'error');
    }
  }

  async triggerE2EWorkflow() {
    this.log(`Triggering E2E Pipeline Validation (scope: ${this.scope})`, 'info');

    const workflowInputs = [
      `test_scope=${this.scope}`,
      `dry_run=${this.dryRun}`,
      `skip_pr_creation=${this.skipPrCreation}`
    ];

    if (this.prNumber) {
      workflowInputs.push(`pr_number=${this.prNumber}`);
    }

    const command = [
      'gh workflow run',
      WORKFLOW_FILE,
      '--ref main',
      ...workflowInputs.map(input => `-f ${input}`)
    ].join(' ');

    try {
      if (this.verbose) {
        this.log(`Executing: ${command}`, 'debug');
      }

      execSync(command, { stdio: 'pipe' });
      this.log('E2E workflow triggered successfully', 'success');
      
      // Wait a moment then get the run ID
      await new Promise(resolve => setTimeout(resolve, 2000));
      return this.getLatestWorkflowRun();

    } catch (error) {
      this.log(`Failed to trigger workflow: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  getLatestWorkflowRun() {
    try {
      const output = execSync(
        `gh run list --workflow="${WORKFLOW_FILE}" --limit=1 --json databaseId,url,status`,
        { encoding: 'utf8' }
      );
      
      const runs = JSON.parse(output);
      if (runs.length > 0) {
        const latestRun = runs[0];
        this.log(`Workflow run started: ${latestRun.url}`, 'success');
        return latestRun;
      }
    } catch (error) {
      this.log(`Error getting workflow run: ${error.message}`, 'warning');
    }
    return null;
  }

  async monitorWorkflow(runInfo) {
    if (!runInfo) {
      this.log('No workflow run to monitor', 'warning');
      return;
    }

    this.log(`Monitoring workflow run: ${runInfo.databaseId}`, 'info');
    this.log(`View progress: ${runInfo.url}`, 'info');

    if (this.dryRun) {
      this.log('Dry run mode - monitoring disabled', 'info');
      return;
    }

    try {
      // Use gh run watch to monitor the workflow
      execSync(`gh run watch ${runInfo.databaseId}`, { stdio: 'inherit' });
    } catch (error) {
      this.log(`Workflow monitoring ended: ${error.message}`, 'warning');
    }
  }

  async getWorkflowResults(runInfo) {
    if (!runInfo) return null;

    try {
      const output = execSync(
        `gh run view ${runInfo.databaseId} --json jobs,conclusion`,
        { encoding: 'utf8' }
      );
      
      const runData = JSON.parse(output);
      return {
        conclusion: runData.conclusion,
        jobs: runData.jobs.map(job => ({
          name: job.name,
          conclusion: job.conclusion,
          status: job.status
        }))
      };
    } catch (error) {
      this.log(`Error getting workflow results: ${error.message}`, 'error');
      return null;
    }
  }

  displayResults(results) {
    if (!results) {
      this.log('No results available', 'warning');
      return;
    }

    this.log('E2E Pipeline Validation Results:', 'info');
    this.log('================================', 'info');
    this.log(`Overall Status: ${results.conclusion}`, results.conclusion === 'success' ? 'success' : 'error');
    this.log('', 'info');

    this.log('Job Results:', 'info');
    results.jobs.forEach(job => {
      const status = job.conclusion || job.status;
      const type = status === 'success' ? 'success' : status === 'failure' ? 'error' : 'warning';
      this.log(`  ${job.name}: ${status}`, type);
    });
  }

  async run() {
    try {
      this.log('Starting E2E Pipeline Orchestrator', 'info');
      this.log(`Configuration: scope=${this.scope}, dryRun=${this.dryRun}`, 'debug');

      await this.validateEnvironment();
      const runInfo = await this.triggerE2EWorkflow();
      await this.monitorWorkflow(runInfo);
      
      // Get final results
      if (runInfo && !this.dryRun) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for completion
        const results = await this.getWorkflowResults(runInfo);
        this.displayResults(results);
      }

      this.log('E2E Pipeline Orchestrator completed', 'success');
    } catch (error) {
      this.log(`E2E Pipeline Orchestrator failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI argument parsing
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--scope':
        options.scope = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--skip-pr-creation':
        options.skipPrCreation = true;
        break;
      case '--pr-number':
        options.prNumber = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
E2E Pipeline Orchestrator

Usage:
  node pipeline-orchestrator.js [options]

Options:
  --scope <scope>           Test scope (full-cycle, pr-flow-only, staging-only, release-flow-only, endpoints-only)
  --dry-run                 Run in dry-run mode (validation only)
  --skip-pr-creation        Skip automated PR creation
  --pr-number <number>      Use existing PR number
  --verbose                 Enable verbose logging
  --help                    Show this help message

Examples:
  node pipeline-orchestrator.js
  node pipeline-orchestrator.js --scope pr-flow-only
  node pipeline-orchestrator.js --dry-run --verbose
  node pipeline-orchestrator.js --skip-pr-creation --pr-number 123
        `);
        process.exit(0);
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseCliArgs();
  const orchestrator = new E2EPipelineOrchestrator(options);
  orchestrator.run().catch(error => {
    console.error('❌ Orchestrator failed:', error.message);
    process.exit(1);
  });
}

module.exports = E2EPipelineOrchestrator;