---
version: "1.0"
description: "Claude Code Custom Agents for Resume-as-Code Project"
orchestrator: "workflow-orchestrator"
last_updated: "2025-08-22"
---

# Claude Code Custom Agents

## Agent Orchestration System

### workflow-orchestrator
```yaml
name: workflow-orchestrator
type: orchestrator
purpose: Coordinate multi-agent workflows for complex development tasks
sub_agents:
  - conventional-committer
  - deployment-monitor
  - test-strategist
  - performance-analyzer
invocation: "@workflow-orchestrator <task-description>"
```

**Purpose**: Master orchestrator for coordinating complex multi-agent workflows  
**Description**: Analyzes tasks and delegates to appropriate specialized agents in optimal sequence  
**Use Cases**:
- Full feature development lifecycle (code → test → deploy → monitor)
- Complex debugging workflows requiring multiple specialist perspectives
- Release preparation with validation across all domains
- Multi-environment deployment coordination

**Example Orchestration**:
```bash
# User: "@workflow-orchestrator implement new PDF optimization feature"
# Step 1: performance-analyzer → benchmark current PDF generation
# Step 2: conventional-committer → analyze staged changes for commit message
# Step 3: test-strategist → recommend testing approach for PDF changes
# Step 4: deployment-monitor → track deployment across environments
```

## Development Workflow Agents

### conventional-committer
```yaml
name: conventional-committer
type: automation
purpose: Smart conventional commit message generation
dependencies: ["git", "node"]
files: [".claude/conventional-committer.js"]
invocation: "@conventional-committer [--dry-run] [--scope=<scope>]"
```

**Purpose**: Smart conventional commit agent  
**Description**: Analyzes staged changes and creates proper conventional commit messages following project standards  
**Use Cases**:
- Auto-generate commit messages from git diff
- Ensure 100% conventional commits compliance
- Follow project-specific commit patterns
- Include proper scope and breaking change detection

**Example Usage**:
```bash
# User: "@conventional-committer"
# Agent analyzes: modified .github/workflows/staging.yml
# Generates: "ci: enhance staging deployment with user-friendly summaries"

# With options:
# User: "@conventional-committer --dry-run --scope=ci"
# Shows preview without committing
```

**Integration Commands**:
```bash
node .claude/conventional-committer.js           # Auto-commit with generated message
node .claude/conventional-committer.js --dry-run # Preview only
node .claude/conventional-committer.js --scope=feat # Force specific scope
```

### deployment-monitor
**Purpose**: Comprehensive deployment monitoring agent  
**Description**: Monitors deployments across all environments (preview, staging, production) and provides real-time status updates  
**Use Cases**:
- Track deployment progress across environments
- Detect and report deployment failures
- Provide deployment URLs and validation results
- Monitor ARM64 performance metrics

**Example Usage**:
```bash
# User: "check deployment status"
# Agent: Monitors staging, production, checks version endpoints, reports ARM64 performance
```

### arm64-optimizer
**Purpose**: ARM64 performance optimization specialist  
**Description**: Analyzes workflows and code for ARM64 optimization opportunities  
**Use Cases**:
- Identify workflows that can benefit from ARM64 migration
- Suggest ARM64-specific optimizations
- Benchmark ARM64 vs AMD64 performance
- Recommend cost-effective runner usage

**Example Usage**:
```bash
# User: "optimize this workflow for ARM64"
# Agent: Analyzes workflow, suggests ARM64 runners, estimates performance gains
```

## Testing & Quality Agents

### test-strategist
**Purpose**: Smart testing strategy agent  
**Description**: Analyzes changes and recommends optimal testing approach (local vs CI, scope, etc.)  
**Use Cases**:
- Determine if changes need comprehensive testing
- Suggest test scope based on change impact
- Recommend local vs CI testing strategy
- Identify visual regression test requirements

**Example Usage**:
```bash
# User: "what tests should I run?"
# Agent: Analyzes git diff, recommends "npm run test:local + visual tests for CSS changes"
```

### release-assistant
**Purpose**: Release management and validation agent  
**Description**: Manages release-please PRs, validates releases, and coordinates deployments  
**Use Cases**:
- Review release-please PRs for completeness
- Validate changelog and version bumps
- Coordinate staging → production deployment flow
- Monitor post-release health

**Example Usage**:
```bash
# User: "prepare for release"
# Agent: Reviews release PR, validates staging, suggests approval strategy
```

### workflow-doctor
**Purpose**: GitHub Actions workflow diagnostics agent  
**Description**: Diagnoses workflow failures, suggests fixes, and optimizes workflow performance  
**Use Cases**:
- Analyze workflow failures and suggest fixes
- Optimize workflow performance and costs
- Validate workflow syntax and dependencies
- Recommend resilience patterns

**Example Usage**:
```bash
# User: "my workflow is failing"
# Agent: Analyzes logs, identifies "missing newline at end of YAML", provides fix
```

## Infrastructure & DevOps Agents

### environment-validator
**Purpose**: Multi-environment validation specialist  
**Description**: Validates consistency across preview, staging, and production environments  
**Use Cases**:
- Compare version.json across environments
- Validate environment-specific configurations
- Check endpoint accessibility and performance
- Ensure environment parity

**Example Usage**:
```bash
# User: "validate all environments"
# Agent: Checks staging, production endpoints, validates versions, reports discrepancies
```

### performance-analyzer
**Purpose**: Performance monitoring and optimization agent  
**Description**: Analyzes build performance, deployment times, and suggests optimizations  
**Use Cases**:
- Benchmark build and deployment performance
- Identify performance bottlenecks
- Suggest caching and optimization strategies
- Monitor ARM64 performance benefits

**Example Usage**:
```bash
# User: "why is my build slow?"
# Agent: Analyzes build times, suggests "speedlight caching" and ARM64 migration
```

### security-guardian
**Purpose**: Security scanning and compliance agent  
**Description**: Monitors security posture, validates secrets, and ensures compliance  
**Use Cases**:
- Scan for secrets and vulnerabilities
- Validate security configurations
- Monitor dependency security status
- Ensure GitHub Actions security best practices

**Example Usage**:
```bash
# User: "check security status"
# Agent: Runs security scans, validates no secrets in commits, reports vulnerability status
```

## Specialized Utility Agents

### context7-researcher
**Purpose**: Context7-powered documentation and best practices agent  
**Description**: Uses Context7 to research best practices and provide up-to-date documentation  
**Use Cases**:
- Research library best practices
- Find up-to-date documentation
- Suggest modern patterns and approaches
- Provide architecture recommendations

**Example Usage**:
```bash
# User: "how should I optimize Sharp for ARM64?"
# Agent: Uses Context7 to research Sharp ARM64 optimizations, provides specific recommendations
```

### dependency-curator
**Purpose**: Dependency management and optimization agent  
**Description**: Manages dependencies, suggests updates, and resolves conflicts  
**Use Cases**:
- Analyze dependency health and security
- Suggest safe dependency updates
- Resolve version conflicts
- Optimize dependency tree

**Example Usage**:
```bash
# User: "update dependencies safely"
# Agent: Analyzes deps, suggests safe updates, creates update strategy
```

### resume-optimizer
**Purpose**: Resume content and presentation optimization agent  
**Description**: Optimizes resume content, validates JSON schema, and suggests improvements  
**Use Cases**:
- Validate resume-data.json schema compliance
- Suggest content improvements
- Optimize PDF generation settings
- Enhance resume presentation

**Example Usage**:
```bash
# User: "optimize my resume"
# Agent: Validates JSON, suggests content improvements, optimizes PDF settings
```

## Agent Usage Patterns

### Proactive Agents
These agents should be invoked automatically:
- `conventional-committer`: When user says "commit" without message
- `deployment-monitor`: After any push to main
- `test-strategist`: When user asks "what tests should I run?"

### On-Demand Agents
These agents are invoked when explicitly requested:
- `arm64-optimizer`: For performance optimization tasks
- `context7-researcher`: For research and documentation tasks
- `security-guardian`: For security validation

### Emergency Agents
These agents are for critical situations:
- `workflow-doctor`: When workflows fail
- `environment-validator`: When deployments are inconsistent
- `release-assistant`: During release issues

## Agent Integration Examples

```bash
# Conventional commit workflow
User: "commit my staging changes"
→ conventional-committer analyzes diff
→ Generates: "feat: add staging results posting to release-please prs"

# Deployment workflow
User: "deploy to staging"
→ deployment-monitor triggered
→ Monitors deployment, posts results to PR, validates endpoints

# Performance optimization
User: "my build is slow"
→ performance-analyzer examines build logs
→ Suggests: "Enable ARM64 runners for 40% performance boost"
```