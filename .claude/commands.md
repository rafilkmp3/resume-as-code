---
version: "1.0"
description: "Claude Code Custom Commands for Resume-as-Code Project"
last_updated: "2025-08-22"
agent_integration: true
---

# Claude Code Custom Commands

## 🤖 Agent Integration Commands

### Multi-Agent Workflows
- **`@workflow-orchestrator <task>`** - Coordinate complex multi-agent workflows
- **`@conventional-committer [--dry-run]`** - Smart conventional commit generation
- **`@deployment-monitor [--environment=<env>]`** - Monitor deployment status
- **`@test-strategist [--execute-recommended]`** - Analyze and recommend testing strategy
- **`@resume-optimizer [--aspect=<aspect>]`** - Comprehensive resume optimization with JSON Resume standards
- **`@project-memory [--update] [--context=<agent>]`** - Project memory and context management

### Agent Execution Examples
```bash
# Full feature development lifecycle
@workflow-orchestrator implement new PDF optimization feature

# Smart commit generation
@conventional-committer --dry-run

# Monitor specific environment
@deployment-monitor --environment=staging

# Smart testing recommendations
@test-strategist --execute-recommended
```

### Direct Agent Commands
```bash
# Workflow orchestration
node .claude/workflow-orchestrator.js "implement new feature"
node .claude/workflow-orchestrator.js --list-agents

# Conventional commits
node .claude/conventional-committer.js
node .claude/conventional-committer.js --dry-run --scope=ci

# Deployment monitoring
node .claude/deployment-monitor.js --check-all
node .claude/deployment-monitor.js --watch

# Test strategy
node .claude/test-strategist.js
node .claude/test-strategist.js --execute-recommended

# Resume optimization (based on JSON Resume ecosystem)
node .claude/resume-optimizer.js
node .claude/resume-optimizer.js --aspect=schema
node .claude/resume-optimizer.js --aspect=content

# Project memory and context
node .claude/project-memory.js --update
node .claude/project-memory.js --context=conventional-committer
node .claude/project-memory.js --summary
```

## Development Workflow Commands

### /build
**Description**: Build the resume with full validation  
**Command**: `make clean && make build && make test-fast`  
**Usage**: Quick build and validation before committing

### /dev
**Description**: Start development environment with mobile access  
**Command**: `make dev-start && make get-lan-ip`  
**Usage**: Start dev server and show mobile testing URL

### /clean-build
**Description**: Clean environment and rebuild (CI parity)  
**Command**: `make clean && make build && make test-visual-matrix`  
**Usage**: Full clean build with comprehensive testing

### /push-safe
**Description**: Safe push with rebase and validation  
**Command**: `make test-fast && git pull --rebase && git push`  
**Usage**: Validate, rebase, and push safely

## Testing Commands

### /test-local
**Description**: Fast local testing for immediate feedback  
**Command**: `npm run test:local`  
**Usage**: Quick validation without CI overhead

### /test-comprehensive
**Description**: Trigger comprehensive CI testing  
**Command**: `npm run test:ci`  
**Usage**: Full testing in GitHub Actions

### /test-visual
**Description**: Visual regression testing across all devices  
**Command**: `make test-visual-matrix`  
**Usage**: Test 20 viewport/theme combinations

### /test-arm64
**Description**: Test ARM64 performance locally  
**Command**: `make arm64-test && make arm64-benchmark`  
**Usage**: Validate ARM64 optimizations

## Deployment Commands

### /deploy-staging
**Description**: Trigger staging deployment manually  
**Command**: `gh workflow run "🚀 Staging Deploy (Netlify)" --ref main`  
**Usage**: Manual staging deployment trigger

### /deploy-status
**Description**: Check deployment status across environments  
**Command**: `make e2e-endpoints`  
**Usage**: Monitor all deployment endpoints

### /release-status
**Description**: Check release-please PR status  
**Command**: `gh pr list --search "chore(release)" --state open`  
**Usage**: Find and view release-please PRs

## Monitoring Commands

### /runs
**Description**: Monitor recent workflow runs  
**Command**: `gh run list --limit=10`  
**Usage**: Quick overview of CI/CD status

### /runs-watch
**Description**: Watch latest workflow run  
**Command**: `gh run list --limit=1 --json databaseId --jq '.[0].databaseId' | xargs gh run watch`  
**Usage**: Monitor running workflow in real-time

### /version-check
**Description**: Check version endpoints across environments  
**Command**: `curl -s https://resume-as-code.netlify.app/version.json | jq . && curl -s https://rafilkmp3.github.io/resume-as-code/version.json | jq .`  
**Usage**: Validate version consistency

## Git Workflow Commands

### /conventional-help
**Description**: Show conventional commit examples  
**Command**: `echo "Examples:\nfeat: add new feature\nfix: resolve bug\nchore: update dependencies\ndocs: improve documentation\nrefactor: simplify code\nperf: optimize performance\nci: update workflows\ntest: add tests"`  
**Usage**: Quick conventional commits reference

### /commit-check
**Description**: Validate recent commits follow conventions  
**Command**: `git log --oneline -10`  
**Usage**: Review recent commit message formats

### /branch-clean
**Description**: Clean up merged branches  
**Command**: `git branch --merged | grep -v main | xargs -n 1 git branch -d`  
**Usage**: Remove local merged branches

## Emergency Commands

### /emergency-deploy
**Description**: Emergency production deployment bypass  
**Command**: `gh workflow run "Emergency Deploy" --ref main -f reason="Emergency hotfix" -f skip_confirmation=false`  
**Usage**: Critical production fixes only

### /rollback
**Description**: Quick rollback to previous release  
**Command**: `gh release list --limit=2 --json tagName --jq '.[1].tagName' | xargs -I {} echo "Previous release: {}"`  
**Usage**: Identify rollback target

### /health-check
**Description**: Comprehensive system health validation  
**Command**: `npm run dev:health && make status && gh auth status`  
**Usage**: Validate entire development environment

## Performance Commands

### /perf-report
**Description**: Generate performance analysis report  
**Command**: `npm run dev:perf`  
**Usage**: Benchmark build and test performance

### /cache-clear
**Description**: Clear all caches and rebuild  
**Command**: `npm run dev:clean && make clean && npm ci`  
**Usage**: Force clean rebuild when issues arise

### /speedlight-test
**Description**: Test speedlight build optimizations  
**Command**: `make speedlight-test && make speedlight-benchmark`  
**Usage**: Validate ultra-fast caching strategies