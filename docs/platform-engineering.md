# CRITICAL Platform Engineering Rules

## 🚨 ALWAYS Use Docker for Automation

- **NEVER use local binaries** (npm, node, playwright, jest) for tests or CI/CD validation
- **ALWAYS use Makefile commands** as the entrypoint - they handle Docker orchestration
- **All testing and automation must be containerized** to ensure environment parity
- Local development MAY use direct commands, but validation MUST use Docker

## 🏗️ Architecture Considerations (ARM vs AMD64)

- **Local Mac M1**: Runs ARM64 architecture
- **GitHub Free Runners**: Use AMD64 architecture
- **Multi-platform builds**: Docker images support both architectures
- **Browser binaries**: May behave differently between ARM and AMD64
- **Testing**: Always validate changes using GitHub Actions before considering complete

## 🔄 CI/CD Validation Workflow

1. **Clean local environment** using `make clean` to match fresh GitHub Actions runner
2. **Make changes locally** using Docker commands (`make build`, `make test-fast`)
3. **ALWAYS rebase before pushing** using `git pull --rebase` to synchronize with remote
4. **Push to GitHub** to trigger AMD64 CI pipeline
5. **Verify CI success** using `gh run list` and `gh run view <run-id>`
6. **Only consider changes complete** when GitHub Actions pass on AMD64
7. **Use `gh cli` for all CI/CD operations** - ensures authentication and proper API access

## 🧹 Environment Parity (Industry Standard)

- **Always clean before major changes**: `make clean` removes all artifacts that could cause CI/local differences
- **Mirrors GitHub Actions runners**: Comprehensive cleanup including system files, caches, and build artifacts
- **Cross-platform considerations**: Removes macOS `.DS_Store`, Windows `Thumbs.db`, etc.
- **Docker state reset**: Full container and image cleanup to prevent state leakage
- **Git cleanup**: Removes untracked files and optimizes repository state

## 🛠️ Required Tools for Platform Engineering

- **Docker Desktop**: Must be running for all operations
- **GitHub CLI (`gh`)**: Must be authenticated for CI/CD validation
- **Make**: All commands go through Makefile entrypoints
- **Git**: For version control and triggering CI/CD

## 🚨 CRITICAL Git Workflow Rules

- **NEVER push without rebasing first**: Always run `git pull --rebase` before any `git push`
- **This prevents merge conflicts and ensures clean commit history**
- **Essential for maintaining workflow reliability and preventing push failures**
- **Required for proper integration with release-please and automated versioning**

```bash
# ✅ CORRECT workflow (ALWAYS do this)
git pull --rebase
git push

# ❌ WRONG workflow (causes conflicts and failures)
git push  # Without rebase - can fail and cause issues
```

## Industry Standard Best Practices Applied

- **Clean Slate Principle**: `make clean` ensures local environment matches fresh CI runners
- **Fail Fast**: `make test-fast` provides quick feedback before pushing to CI
- **Environment Parity**: Identical setup between local and CI eliminates "works on my machine" issues
- **Cross-Architecture Testing**: Docker handles ARM (local) vs AMD64 (CI) differences
- **Comprehensive Cleanup**: Removes all possible sources of state contamination
- **Git Hygiene**: Automatic cleanup of untracked files and repository optimization
- **Conventional Commits Enforcement**: Multi-layer validation (local + CI) ensures 100% compliance
- **Automated Release Management**: Zero-touch versioning and changelog generation
- **Quality Gates**: Pre-commit hooks + PR validation prevent issues from reaching production
- **Directory Structure Preservation**: `.gitkeep` files maintain important folder structure
- **Optimized Docker Context**: Comprehensive `.dockerignore` reduces build context size
- **Security by Default**: Excludes secrets, credentials, and sensitive files from Docker builds

## 🚨 CRITICAL: Deployment Flow Anti-Regression Documentation

**NEVER ALLOW DUPLICATE DEPLOYMENTS**. This section documents critical deployment flow logic to prevent regression.

### 🔄 Proper Release-Please Flow (DO NOT BREAK)

**✅ CORRECT FLOW:**
```
Regular PR Merge → staging-deployment.yml → Deploy to Netlify Staging
Release-Please Merge → release-please.yml → Deploy to GitHub Pages Production
```

**❌ BROKEN FLOW (FIXED in Aug 2025):**
```
Release-Please Merge → BOTH staging-deployment.yml AND release-please.yml trigger simultaneously
```

### 🛡️ Release-Please Detection Logic (staging-deployment.yml:57-80)

**Critical Implementation:**
- `check-release-context` job MUST analyze commit messages and authors
- **Patterns to detect**: `chore(release):`, `chore: release`, author: `release-please`
- **Action**: Skip entire staging workflow when release-please detected
- **Reason**: Prevents duplicate staging + production deployments

### 🚨 Anti-Regression Rules

1. **NEVER remove `check-release-context` job** from staging-deployment.yml
2. **NEVER allow staging deployment** on release-please commits
3. **ALWAYS test deployment flow** after workflow changes
4. **User reported issue**: "staging and prod deploy at same time" - this is the fix
5. **Staging = Development**, **Production = Releases only**

### ✅ Validation Commands

```bash
# Test deployment flow after changes
git log --oneline -5  # Check recent commits
gh run list --limit 5  # Verify no duplicate deployments
```

**Date Fixed**: August 21, 2025  
**Root Cause**: Both workflows triggered on main branch push  
**Fix**: Release-please detection with smart workflow skipping