#!/usr/bin/env node
/**
 * Workflow Orchestrator Agent
 * 
 * Master orchestrator for coordinating complex multi-agent workflows in the resume-as-code project.
 * Analyzes tasks and delegates to appropriate specialized agents in optimal sequence.
 * 
 * Usage:
 *   node .claude/workflow-orchestrator.js <task-description>
 *   node .claude/workflow-orchestrator.js --list-agents
 *   node .claude/workflow-orchestrator.js --dry-run <task-description>
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class WorkflowOrchestrator {
  constructor() {
    this.agents = {
      'conventional-committer': {
        file: '.claude/conventional-committer.js',
        capabilities: ['commit', 'conventional', 'git', 'analyze-changes'],
        triggers: ['commit', 'stage', 'changes', 'conventional'],
        description: 'Smart conventional commit message generation'
      },
      'deployment-monitor': {
        capabilities: ['deploy', 'monitor', 'status', 'environments'],
        triggers: ['deploy', 'staging', 'production', 'preview', 'monitor'],
        description: 'Deployment monitoring across all environments'
      },
      'test-strategist': {
        capabilities: ['test', 'strategy', 'coverage', 'validation'],
        triggers: ['test', 'validation', 'coverage', 'quality'],
        description: 'Smart testing strategy recommendations'
      },
      'performance-analyzer': {
        capabilities: ['performance', 'benchmark', 'optimize', 'arm64'],
        triggers: ['performance', 'speed', 'optimize', 'benchmark', 'arm64'],
        description: 'Performance analysis and optimization'
      },
      'security-guardian': {
        capabilities: ['security', 'vulnerabilities', 'secrets', 'compliance'],
        triggers: ['security', 'vulnerability', 'secrets', 'compliance'],
        description: 'Security scanning and compliance validation'
      },
      'context7-researcher': {
        capabilities: ['research', 'documentation', 'best-practices'],
        triggers: ['research', 'documentation', 'patterns', 'library'],
        description: 'Context7-powered research and documentation'
      }
    };

    this.workflows = {
      'full-feature-development': {
        description: 'Complete feature development lifecycle',
        sequence: ['test-strategist', 'conventional-committer', 'deployment-monitor', 'performance-analyzer'],
        conditions: ['has-code-changes', 'is-feature']
      },
      'hotfix-deployment': {
        description: 'Emergency hotfix workflow',
        sequence: ['conventional-committer', 'deployment-monitor', 'security-guardian'],
        conditions: ['is-urgent', 'has-code-changes']
      },
      'release-preparation': {
        description: 'Comprehensive release validation',
        sequence: ['test-strategist', 'performance-analyzer', 'security-guardian', 'deployment-monitor'],
        conditions: ['is-release', 'has-major-changes']
      },
      'research-and-optimize': {
        description: 'Research-driven optimization workflow',
        sequence: ['context7-researcher', 'performance-analyzer', 'test-strategist'],
        conditions: ['needs-research', 'optimization-focus']
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
   * Analyze task description to determine intent and required agents
   */
  analyzeTask(taskDescription) {
    const task = taskDescription.toLowerCase();
    const words = task.split(/\s+/);
    
    // Detect task intent
    const intents = {
      commit: words.some(w => ['commit', 'stage', 'conventional'].includes(w)),
      deploy: words.some(w => ['deploy', 'staging', 'production', 'release'].includes(w)),
      test: words.some(w => ['test', 'validation', 'coverage', 'quality'].includes(w)),
      performance: words.some(w => ['performance', 'speed', 'optimize', 'benchmark'].includes(w)),
      security: words.some(w => ['security', 'vulnerability', 'secrets'].includes(w)),
      research: words.some(w => ['research', 'documentation', 'patterns', 'library'].includes(w)),
      feature: words.some(w => ['feature', 'implement', 'add', 'create'].includes(w)),
      fix: words.some(w => ['fix', 'bug', 'hotfix', 'emergency'].includes(w)),
      release: words.some(w => ['release', 'version', 'changelog'].includes(w))
    };

    // Detect context conditions
    const hasCodeChanges = this.exec('git diff --cached --name-only').length > 0;
    const hasStagedFiles = hasCodeChanges;
    const isOnMainBranch = this.exec('git rev-parse --abbrev-ref HEAD') === 'main';
    
    const context = {
      'has-code-changes': hasCodeChanges,
      'has-staged-files': hasStagedFiles,
      'is-main-branch': isOnMainBranch,
      'is-feature': intents.feature,
      'is-urgent': intents.fix || words.includes('emergency'),
      'is-release': intents.release,
      'has-major-changes': hasStagedFiles && this.exec('git diff --cached --numstat | wc -l') > 10,
      'needs-research': intents.research,
      'optimization-focus': intents.performance
    };

    return { intents, context, words };
  }

  /**
   * Recommend optimal workflow based on task analysis
   */
  recommendWorkflow(analysis) {
    const { intents, context } = analysis;
    
    // Check predefined workflows
    for (const [workflowName, workflow] of Object.entries(this.workflows)) {
      const conditionsMet = workflow.conditions.every(condition => context[condition]);
      if (conditionsMet) {
        return {
          type: 'predefined',
          name: workflowName,
          workflow,
          confidence: 'high'
        };
      }
    }

    // Dynamic workflow generation
    const recommendedAgents = [];
    
    if (intents.commit && context['has-staged-files']) {
      recommendedAgents.push('conventional-committer');
    }
    
    if (intents.test || intents.feature) {
      recommendedAgents.push('test-strategist');
    }
    
    if (intents.deploy || intents.release) {
      recommendedAgents.push('deployment-monitor');
    }
    
    if (intents.performance) {
      recommendedAgents.push('performance-analyzer');
    }
    
    if (intents.security || intents.release) {
      recommendedAgents.push('security-guardian');
    }
    
    if (intents.research) {
      recommendedAgents.push('context7-researcher');
    }

    return {
      type: 'dynamic',
      agents: recommendedAgents,
      confidence: recommendedAgents.length > 0 ? 'medium' : 'low'
    };
  }

  /**
   * Execute agent workflow
   */
  async executeWorkflow(workflow, taskDescription, options = {}) {
    console.log('🤖 Workflow Orchestrator Started');
    console.log(`📋 Task: ${taskDescription}`);
    console.log(`🔧 Workflow Type: ${workflow.type}`);
    
    if (options.dryRun) {
      console.log('🔍 DRY RUN: Would execute the following workflow:');
    }

    let agentSequence;
    if (workflow.type === 'predefined') {
      agentSequence = workflow.workflow.sequence;
      console.log(`📊 Using predefined workflow: ${workflow.name}`);
      console.log(`📝 Description: ${workflow.workflow.description}`);
    } else {
      agentSequence = workflow.agents;
      console.log(`🔀 Using dynamic workflow with ${agentSequence.length} agents`);
    }

    console.log(`\n🚀 Agent Execution Sequence:`);
    agentSequence.forEach((agent, index) => {
      const agentInfo = this.agents[agent];
      console.log(`  ${index + 1}. ${agent} - ${agentInfo?.description || 'Custom agent'}`);
    });

    if (options.dryRun) {
      console.log('\n🔍 Dry run complete. Use --execute to run the actual workflow.');
      return true;
    }

    // Execute agents in sequence
    for (let i = 0; i < agentSequence.length; i++) {
      const agentName = agentSequence[i];
      const agent = this.agents[agentName];
      
      console.log(`\n⚡ Executing Agent ${i + 1}/${agentSequence.length}: ${agentName}`);
      
      if (agent?.file && fs.existsSync(agent.file)) {
        try {
          console.log(`🔧 Running: node ${agent.file}`);
          const result = this.exec(`node ${agent.file}`);
          console.log(`✅ Agent ${agentName} completed successfully`);
          if (result) {
            console.log(`📋 Output:\n${result}`);
          }
        } catch (error) {
          console.log(`❌ Agent ${agentName} failed: ${error.message}`);
          if (!options.continueOnError) {
            console.log('🛑 Workflow stopped due to agent failure');
            return false;
          }
        }
      } else {
        console.log(`📝 Agent ${agentName}: ${agent?.description || 'Not implemented yet'}`);
        console.log('   → This agent is documented but not yet implemented');
      }
    }

    console.log('\n🎉 Workflow orchestration completed successfully!');
    
    // Show next steps
    console.log('\n🚀 Recommended next steps:');
    console.log('  git status                    # Check current state');
    console.log('  git pull --rebase            # Sync with remote');
    console.log('  git push                     # Push changes');
    
    return true;
  }

  /**
   * List available agents and workflows
   */
  listAgents() {
    console.log('🤖 Available Agents:\n');
    
    Object.entries(this.agents).forEach(([name, agent]) => {
      const status = agent.file && fs.existsSync(agent.file) ? '✅' : '📝';
      console.log(`${status} ${name}`);
      console.log(`   ${agent.description}`);
      console.log(`   Capabilities: ${agent.capabilities.join(', ')}`);
      console.log(`   Triggers: ${agent.triggers.join(', ')}`);
      console.log('');
    });

    console.log('🔄 Available Workflows:\n');
    
    Object.entries(this.workflows).forEach(([name, workflow]) => {
      console.log(`🔧 ${name}`);
      console.log(`   ${workflow.description}`);
      console.log(`   Sequence: ${workflow.sequence.join(' → ')}`);
      console.log(`   Conditions: ${workflow.conditions.join(', ')}`);
      console.log('');
    });
  }

  /**
   * Main orchestration method
   */
  async orchestrate(taskDescription, options = {}) {
    if (options.listAgents) {
      this.listAgents();
      return true;
    }

    if (!taskDescription) {
      console.log('❌ Task description required');
      console.log('\nUsage:');
      console.log('  node .claude/workflow-orchestrator.js "implement new feature"');
      console.log('  node .claude/workflow-orchestrator.js "commit my changes"');
      console.log('  node .claude/workflow-orchestrator.js --list-agents');
      return false;
    }

    console.log('🧠 Analyzing task requirements...');
    const analysis = this.analyzeTask(taskDescription);
    
    console.log('\n📊 Task Analysis:');
    console.log(`  Detected intents: ${Object.entries(analysis.intents).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
    console.log(`  Context conditions: ${Object.entries(analysis.context).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
    
    const workflow = this.recommendWorkflow(analysis);
    console.log(`\n🎯 Recommended workflow: ${workflow.type} (confidence: ${workflow.confidence})`);
    
    if (workflow.confidence === 'low') {
      console.log('⚠️ Low confidence workflow recommendation. Consider being more specific about your task.');
    }

    return await this.executeWorkflow(workflow, taskDescription, options);
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  let taskDescription = '';

  // Parse arguments
  const nonFlagArgs = [];
  args.forEach(arg => {
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--list-agents') options.listAgents = true;
    else if (arg === '--continue-on-error') options.continueOnError = true;
    else if (arg === '--execute') options.execute = true;
    else nonFlagArgs.push(arg);
  });

  taskDescription = nonFlagArgs.join(' ');

  const orchestrator = new WorkflowOrchestrator();
  orchestrator.orchestrate(taskDescription, options).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = WorkflowOrchestrator;