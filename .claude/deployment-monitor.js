#!/usr/bin/env node
/**
 * Deployment Monitor Agent
 * 
 * Comprehensive deployment monitoring across all environments (preview, staging, production).
 * Provides real-time status updates and validates deployment health.
 * 
 * Usage:
 *   node .claude/deployment-monitor.js
 *   node .claude/deployment-monitor.js --environment=staging
 *   node .claude/deployment-monitor.js --check-all
 *   node .claude/deployment-monitor.js --watch
 */

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

class DeploymentMonitor {
  constructor() {
    this.environments = {
      production: {
        name: 'GitHub Pages Production',
        url: 'https://rafilkmp3.github.io/resume-as-code/',
        endpoints: [
          '/',
          '/version.json',
          '/version.txt',
          '/resume.pdf',
          '/resume-print.pdf',
          '/resume-ats.pdf'
        ],
        healthChecks: ['version-endpoint', 'pdf-generation', 'main-site']
      },
      staging: {
        name: 'Netlify Staging',
        url: 'https://resume-as-code.netlify.app',
        endpoints: [
          '/',
          '/version.json',
          '/version.txt',
          '/resume.pdf',
          '/resume-print.pdf',
          '/resume-ats.pdf'
        ],
        healthChecks: ['version-endpoint', 'pdf-generation', 'main-site']
      },
      preview: {
        name: 'Netlify Preview',
        url: null, // Dynamic based on PR
        endpoints: [
          '/',
          '/resume.pdf',
          '/resume-print.pdf',
          '/resume-ats.pdf'
        ],
        healthChecks: ['pdf-generation', 'main-site']
      }
    };

    this.workflowPatterns = {
      staging: '.github/workflows/staging-deployment.yml',
      production: '.github/workflows/release-please.yml',
      preview: '.github/workflows/pr-preview.yml'
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
   * Make HTTP request with timeout
   */
  async httpRequest(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      const startTime = Date.now();
      
      const req = client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            data,
            responseTime,
            headers: res.headers
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(timeout, () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });
    });
  }

  /**
   * Check workflow run status
   */
  async checkWorkflowStatus(environment) {
    try {
      console.log(`🔍 Checking ${environment} workflow status...`);
      
      const workflows = this.exec('gh run list --limit=5 --json status,conclusion,workflowName,createdAt');
      if (!workflows) {
        console.log('⚠️ No workflow data available (gh cli not authenticated?)');
        return null;
      }

      const runs = JSON.parse(workflows);
      const envWorkflows = runs.filter(run => 
        run.workflowName.toLowerCase().includes(environment.toLowerCase())
      );

      if (envWorkflows.length === 0) {
        console.log(`📋 No recent ${environment} workflows found`);
        return null;
      }

      const latest = envWorkflows[0];
      console.log(`📊 Latest ${environment} workflow:`);
      console.log(`   Status: ${latest.status}`);
      console.log(`   Conclusion: ${latest.conclusion || 'In progress'}`);
      console.log(`   Created: ${new Date(latest.createdAt).toLocaleString()}`);

      return latest;
    } catch (error) {
      console.log(`❌ Error checking workflow status: ${error.message}`);
      return null;
    }
  }

  /**
   * Check environment health
   */
  async checkEnvironmentHealth(environment) {
    const env = this.environments[environment];
    if (!env || !env.url) {
      console.log(`⚠️ Environment ${environment} not configured or URL not available`);
      return false;
    }

    console.log(`\n🏥 Health Check: ${env.name}`);
    console.log(`🌐 Base URL: ${env.url}`);

    let healthyEndpoints = 0;
    let totalEndpoints = env.endpoints.length;

    for (const endpoint of env.endpoints) {
      const fullUrl = env.url + endpoint;
      try {
        const response = await this.httpRequest(fullUrl);
        const isHealthy = response.statusCode >= 200 && response.statusCode < 400;
        
        console.log(`   ${isHealthy ? '✅' : '❌'} ${endpoint} - ${response.statusCode} (${response.responseTime}ms)`);
        
        if (isHealthy) {
          healthyEndpoints++;
          
          // Additional validation for specific endpoints
          if (endpoint === '/version.json') {
            try {
              const versionData = JSON.parse(response.data);
              console.log(`      📊 Version: ${versionData.version || 'unknown'}`);
              console.log(`      🕐 Build: ${versionData.buildTime || 'unknown'}`);
            } catch (e) {
              console.log(`      ⚠️ Invalid JSON in version endpoint`);
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint} - Error: ${error.message}`);
      }
    }

    const healthScore = (healthyEndpoints / totalEndpoints) * 100;
    console.log(`\n📊 Health Score: ${healthScore.toFixed(1)}% (${healthyEndpoints}/${totalEndpoints} endpoints healthy)`);

    return healthScore >= 80; // Consider healthy if 80%+ endpoints work
  }

  /**
   * Monitor deployment status across environments
   */
  async monitorDeployments(options = {}) {
    console.log('🚀 Deployment Monitor Started');
    console.log(`📅 ${new Date().toLocaleString()}`);

    if (options.environment) {
      // Monitor specific environment
      console.log(`\n🎯 Monitoring ${options.environment} environment`);
      await this.checkWorkflowStatus(options.environment);
      await this.checkEnvironmentHealth(options.environment);
    } else {
      // Monitor all environments
      const environments = options.checkAll ? 
        Object.keys(this.environments) : 
        ['production', 'staging']; // Skip preview unless explicitly requested

      for (const env of environments) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🔍 Monitoring: ${this.environments[env].name}`);
        
        await this.checkWorkflowStatus(env);
        await this.checkEnvironmentHealth(env);
      }
    }

    // Check for any failing workflows
    console.log(`\n${'='.repeat(50)}`);
    console.log('🔍 Recent Workflow Summary');
    try {
      const recentRuns = this.exec('gh run list --limit=10 --json status,conclusion,workflowName,createdAt');
      if (recentRuns) {
        const runs = JSON.parse(recentRuns);
        const failed = runs.filter(r => r.conclusion === 'failure');
        const inProgress = runs.filter(r => r.status === 'in_progress');
        
        console.log(`📊 Recent activity: ${failed.length} failed, ${inProgress.length} in progress`);
        
        if (failed.length > 0) {
          console.log('❌ Recent failures:');
          failed.slice(0, 3).forEach(run => {
            console.log(`   • ${run.workflowName} - ${new Date(run.createdAt).toLocaleString()}`);
          });
        }
        
        if (inProgress.length > 0) {
          console.log('⚡ Currently running:');
          inProgress.forEach(run => {
            console.log(`   • ${run.workflowName}`);
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ Could not fetch workflow summary: ${error.message}`);
    }

    // Recommendations
    console.log(`\n${'='.repeat(50)}`);
    console.log('💡 Recommendations:');
    console.log('   gh run list                    # View recent workflows');
    console.log('   gh run watch                   # Watch current workflow');
    console.log('   make e2e-endpoints             # Comprehensive endpoint testing');
    console.log('   node .claude/deployment-monitor.js --watch  # Continuous monitoring');

    return true;
  }

  /**
   * Watch deployments continuously
   */
  async watchDeployments(interval = 60000) {
    console.log(`👁️ Starting continuous deployment monitoring (${interval/1000}s intervals)`);
    console.log('Press Ctrl+C to stop');

    while (true) {
      try {
        await this.monitorDeployments({ checkAll: false });
        console.log(`\n⏰ Next check in ${interval/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.log(`❌ Monitoring error: ${error.message}`);
        console.log('⏰ Retrying in 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }

  /**
   * Get preview deployment URL for current PR
   */
  async getPreviewUrl() {
    try {
      // Try to detect PR number
      const prInfo = this.exec('gh pr view --json number,url');
      if (prInfo) {
        const pr = JSON.parse(prInfo);
        return `https://deploy-preview-${pr.number}--resume-as-code.netlify.app`;
      }
    } catch (error) {
      console.log('⚠️ Could not detect PR context for preview URL');
    }
    return null;
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--environment=')) {
      options.environment = arg.split('=')[1];
    } else if (arg === '--check-all') {
      options.checkAll = true;
    } else if (arg === '--watch') {
      options.watch = true;
    }
  });

  const monitor = new DeploymentMonitor();
  
  if (options.watch) {
    monitor.watchDeployments().catch(console.error);
  } else {
    monitor.monitorDeployments(options).then(success => {
      process.exit(success ? 0 : 1);
    });
  }
}

module.exports = DeploymentMonitor;