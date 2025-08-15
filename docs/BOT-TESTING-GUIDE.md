# 🧪 Bot Testing Guide - Complete Validation Strategy

*Comprehensive testing strategy for all automation bots before deployment*

## 🎯 Overview

This guide provides step-by-step instructions for testing all automation bots using GitHub CLI and validates that every workflow functions correctly before merging changes.

## 🚀 Prerequisites

### Required Tools
```bash
# Install GitHub CLI
brew install gh  # macOS
# or
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh  # Ubuntu/Debian
```

### Authentication Setup
```bash
# Authenticate with GitHub
gh auth login

# Verify authentication
gh auth status

# Check repository access
gh repo view rafilkmp3/resume-as-code
```

## 📋 Pre-Merge Testing Checklist

### ✅ Phase 1: Workflow Validation
```bash
# 1. List all workflows to ensure they're detected
gh workflow list

# 2. Check for syntax errors in workflow files
find .github/workflows -name "*.yml" -exec yamllint {} \;

# 3. Validate all workflows have manual triggers
grep -r "workflow_dispatch:" .github/workflows/ || echo "Missing manual triggers"
```

### ✅ Phase 2: Bot Testing Suite Execution
```bash
# Run comprehensive bot testing (dry run mode)
gh workflow run "🧪 Bot Testing Suite" \
  --ref main \
  -f test_scope=all \
  -f dry_run=true \
  -f create_test_pr=false

# Monitor the test execution
gh run watch
```

### ✅ Phase 3: Individual Bot Testing
```bash
# Test Code Quality Bots
gh workflow run "🎯 Code Quality Bots" \
  --ref main \
  -f analysis_type=full \
  -f target_branch=main

# Test PR Automation (dry run)
gh workflow run "🚀 PR Automation Bot" \
  --ref main \
  -f automation_type=maintenance \
  -f dry_run=true

# Test Repository Maintenance
gh workflow run "🔧 Repository Maintenance Bot" \
  --ref main \
  -f maintenance_type=daily
```

### ✅ Phase 4: Security & Performance Validation
```bash
# Test Security Scanning
gh workflow run "🛡️ Comprehensive Security Scan" --ref main

# Test Performance Monitoring
gh workflow run "⚡ Performance Budget & Core Web Vitals" --ref main

# Test Visual Regression
gh workflow run "🎨 Visual Regression Testing" --ref main
```

## 🧪 Detailed Testing Procedures

### 1. 🎯 Code Quality Bots Testing

#### Full Analysis Test
```bash
gh workflow run "🎯 Code Quality Bots" \
  --ref main \
  -f analysis_type=full \
  -f target_branch=main

# Wait for completion and check results
gh run list --workflow="🎯 Code Quality Bots" --limit 1
```

#### Security-Only Test
```bash
gh workflow run "🎯 Code Quality Bots" \
  --ref main \
  -f analysis_type=security-only

# Check SARIF results upload
gh run view --log | grep -i "sarif\|security"
```

#### Formatting Test
```bash
gh workflow run "🎯 Code Quality Bots" \
  --ref main \
  -f analysis_type=formatting-only

# Verify no formatting issues
gh run view --log | grep -i "prettier\|format"
```

### 2. 🚀 PR Automation Bot Testing

#### Maintenance Mode Test
```bash
gh workflow run "🚀 PR Automation Bot" \
  --ref main \
  -f automation_type=maintenance \
  -f dry_run=true

# Check for stale PR detection
gh run view --log | grep -i "stale\|maintenance"
```

#### Label Testing
```bash
gh workflow run "🚀 PR Automation Bot" \
  --ref main \
  -f automation_type=label-all-prs \
  -f dry_run=true

# Verify labeling logic
gh run view --log | grep -i "label\|conventional"
```

#### Auto-Merge Testing
```bash
gh workflow run "🚀 PR Automation Bot" \
  --ref main \
  -f automation_type=auto-merge-ready \
  -f dry_run=true

# Check merge criteria validation
gh run view --log | grep -i "merge\|checks"
```

### 3. 🔧 Repository Maintenance Testing

#### Daily Health Check
```bash
gh workflow run "🔧 Repository Maintenance Bot" \
  --ref main \
  -f maintenance_type=daily

# Verify health metrics generation
gh run view --log | grep -i "health\|metrics"
```

#### Deep Cleanup Test
```bash
gh workflow run "🔧 Repository Maintenance Bot" \
  --ref main \
  -f maintenance_type=deep-clean

# Check cleanup operations
gh run view --log | grep -i "cleanup\|optimization"
```

#### Security Audit
```bash
gh workflow run "🔧 Repository Maintenance Bot" \
  --ref main \
  -f maintenance_type=security-audit

# Verify compliance checks
gh run view --log | grep -i "compliance\|security"
```

### 4. 🧪 Integration Testing with Test PR

#### Create Test PR for Automation Validation
```bash
gh workflow run "🧪 Bot Testing Suite" \
  --ref main \
  -f test_scope=pr-automation \
  -f dry_run=false \
  -f create_test_pr=true

# Monitor test PR creation
gh pr list --label "test"
```

#### Validate PR Automation
```bash
# Check if test PR was created and labeled correctly
TEST_PR=$(gh pr list --label "test" --json number --jq '.[0].number')
echo "Test PR: #$TEST_PR"

# Test PR commands
gh pr comment $TEST_PR --body "/rerun-checks"
gh pr comment $TEST_PR --body "/label automation validation"

# Verify automation responses
gh pr view $TEST_PR --comments
```

## 📊 Results Validation

### Success Criteria Checklist

#### ✅ Workflow Execution
- [ ] All workflows listed in `gh workflow list`
- [ ] All workflows have `workflow_dispatch` triggers
- [ ] No YAML syntax errors detected
- [ ] All manual triggers accept expected parameters

#### ✅ Bot Functionality
- [ ] Code quality analysis completes successfully
- [ ] PR automation applies labels correctly
- [ ] Repository maintenance generates health reports
- [ ] Security scanning produces SARIF results
- [ ] Performance monitoring tracks budgets

#### ✅ GitHub CLI Integration
- [ ] All workflows can be triggered via `gh workflow run`
- [ ] Parameters are correctly passed and processed
- [ ] Workflow status can be monitored via `gh run watch`
- [ ] Results can be viewed via `gh run view`

#### ✅ Conventional Commits Compliance
- [ ] All bot-generated commits follow conventional format
- [ ] Commit messages include proper scope and description
- [ ] Claude Code attribution present in commit messages
- [ ] Co-authored-by headers included for bot commits

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### Authentication Problems
```bash
# Re-authenticate if needed
gh auth logout
gh auth login --with-token < token.txt

# Check permissions
gh api repos/rafilkmp3/resume-as-code --jq .permissions
```

#### Workflow Trigger Failures
```bash
# Check workflow file syntax
yamllint .github/workflows/code-quality-bots.yml

# Verify workflow dispatch configuration
grep -A 10 "workflow_dispatch:" .github/workflows/code-quality-bots.yml
```

#### Missing Workflow Runs
```bash
# Check if workflow is enabled
gh workflow view "🎯 Code Quality Bots" --json state

# Enable if disabled
gh workflow enable "🎯 Code Quality Bots"
```

#### Parameter Validation Errors
```bash
# Check required parameters
gh workflow view "🎯 Code Quality Bots" --json

# Use correct parameter format
gh workflow run "🎯 Code Quality Bots" \
  --ref main \
  -f analysis_type=full \
  -f target_branch=main
```

## 🎯 Post-Testing Actions

### After Successful Testing
```bash
# 1. Clean up test PR if created
TEST_PR=$(gh pr list --label "test" --json number --jq '.[0].number')
if [ ! -z "$TEST_PR" ]; then
  gh pr close $TEST_PR --comment "Test completed successfully"
  gh pr view $TEST_PR --json headRefName --jq .headRefName | xargs git push origin --delete
fi

# 2. Generate testing report
gh run list --limit 10 --json conclusion,name,startedAt > testing-report.json

# 3. Verify all workflows are ready for production
gh workflow list --json name,state | jq '.[] | select(.state != "active")'
```

### Before Merging to Main
```bash
# Final validation checklist
echo "🔍 Final Pre-Merge Validation:"
echo "✅ All workflows tested successfully"
echo "✅ GitHub CLI integration confirmed"
echo "✅ Conventional commits compliance verified"
echo "✅ Security scanning operational"
echo "✅ Performance monitoring active"
echo "✅ PR automation functional"
echo "✅ Repository maintenance scheduled"
echo ""
echo "🚀 Ready for merge to main branch!"
```

## 📈 Continuous Monitoring

### Post-Merge Monitoring Commands
```bash
# Monitor workflow health
gh run list --status=failure --limit 5

# Check automation effectiveness
gh pr list --label "automated" --limit 10

# Verify scheduled workflows
gh workflow list --json name | jq -r '.[] | select(.name | contains("🤖"))'

# Monitor security alerts
gh api repos/rafilkmp3/resume-as-code/security-advisories
```

## 🎉 Success Validation

Once all tests pass successfully, you'll have:

- ✅ **Fully functional automation bots** with GitHub CLI integration
- ✅ **Comprehensive testing suite** for ongoing validation
- ✅ **Enterprise-grade automation** with conventional commits compliance
- ✅ **BRT timezone optimization** for Brazilian developer workflow
- ✅ **Non-blocking quality gates** that enhance without disrupting
- ✅ **Complete documentation** and troubleshooting guides

**Your repository automation is now enterprise-ready!** 🚀

---

*Generated by Bot Testing Suite - Optimized for Rio de Janeiro (BRT) timezone workflow*