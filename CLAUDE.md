# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ Repository Structure (UPDATED)

The repository has been modernized with a new directory structure:

```
📁 Project Structure
├── app/                    # Astro components, pages, layouts, data
│   ├── components/         # Astro/React components
│   ├── data/              # Resume data and content
│   ├── layouts/           # Page templates
│   └── pages/             # Route pages
├── workspace/             # Build outputs and artifacts
│   └── build/             # Production build output
├── infrastructure/        # DevOps and build tooling
│   └── scripts/           # Build and utility scripts
└── .github/actions/       # Composite Actions (DRY CI/CD)
    ├── setup-build-environment/
    ├── astro-build/
    └── manage-artifacts/
```

⚠️ **IMPORTANT PATH CHANGES:**
- `src/` → `app/` (all source code)
- `dist/` → `workspace/build/` (build output)
- `scripts/` → `infrastructure/scripts/` (build tools)

## 📚 Documentation Structure

This project uses modular documentation for better maintainability:

- **[Commands & Development Workflow](docs/commands.md)** - Build, testing, and development commands
- **[Conventional Commits](docs/conventional-commits.md)** - Git workflow and commit standards  
- **[ARM64 Performance](docs/arm64-performance.md)** - ARM64 optimization and speedlight builds
- **[Reusable Workflows](docs/workflows-reusable.md)** - GitHub Actions reusable components
- **[Composite Actions Reference](docs/composite-actions.md)** - CI/CD building blocks documentation
- **[Architecture Overview](docs/architecture.md)** - Technical stack and project structure
- **[Platform Engineering](docs/platform-engineering.md)** - CI/CD rules and deployment flows

## 🚀 Quick Start

### Essential Commands
```bash
# Clean environment (matches CI)
make clean

# Start development (now uses app/ directory)
make dev-start              # Background server from app/
make get-lan-ip             # Mobile testing

# Build commands (outputs to workspace/build/)
npm run build               # Production build
npm run dev                 # Development server

# Test before push
make test-fast              # Quick validation
git pull --rebase           # MANDATORY before push
git push                    # Trigger CI pipeline
```

### Conventional Commits (MANDATORY)
```bash
# ✅ Valid formats - automatically enforced
git commit -m "feat: add new resume section"
git commit -m "fix: resolve QR code URL issue"
git commit -m "chore(deps): bump playwright version"

# ❌ Invalid - blocked by pre-commit hook
git commit -m "update stuff"
git commit -m "fixed bug"
```

## 🤖 AI-Friendly Development Workflow (Claude Code Optimized)

### Context7 Integration for Real-Time Documentation

This project includes Context7 MCP integration for enhanced AI assistance:

**Key Dependencies with Real-Time Docs:**
- **handlebars ^4.7.8**: Template engine with Context7 real-time documentation
- **puppeteer ^24.16.2**: PDF generation with up-to-date best practices  
- **sharp ^0.34.3**: Image optimization with latest technique guidance
- **playwright ^1.54.2**: E2E testing with current pattern recommendations

**Context7 Commands for Claude Code:**
```bash
# Get real-time documentation for any dependency
/context7 handlebars template helpers
/context7 puppeteer pdf generation best practices
/context7 sharp image optimization performance
/context7 playwright accessibility testing
```

### 💡 AI Assistant Guidelines

**For Claude Code Users:**
1. **Always use conventional commits** - the hooks will guide you with helpful errors
2. **Run `git pull --rebase` before any push** - prevents merge conflicts
3. **Use `make test-fast` for quick validation** - saves time during development
4. **Leverage Context7 integration** - get real-time docs for any dependency
5. **Use emergency SKIP only when truly stuck** - then fix immediately

**Common Workflow:**
```bash
# 1. Start development (uses app/ directory)
git pull --rebase
make clean

# 2. Make changes in app/ directory, then validate
make test-fast

# 3. Build artifacts go to workspace/build/
npm run build

# 4. Commit with conventional format (AI-friendly validation)
git commit -m "feat: implement new feature with proper description"

# 5. Push (after rebase)
git pull --rebase
git push
```

### 🔧 Emergency Override for Broken Commits

If you get stuck with conventional commits validation:

```bash
# Use SKIP to bypass pre-commit hooks in emergencies
SKIP=conventional-pre-commit git commit -m "emergency: fix critical production issue"

# Then immediately fix with proper conventional commit:
git commit --amend -m "fix: resolve critical production deployment failure"
```

This setup ensures smooth AI-assisted development while maintaining code quality and automated releases.

## 🔧 Composite Actions Architecture

The repository uses GitHub Actions composite actions to eliminate code duplication and provide consistent CI/CD patterns:

### Available Composite Actions

#### 1. setup-build-environment
**Purpose:** Standardized Node.js setup with dependency caching
```yaml
- name: Setup Build Environment
  uses: ./.github/actions/setup-build-environment
  with:
    cache-suffix: 'dev'     # Cache key suffix
    node-version: '24'      # Node.js version (default: 24)
    skip-install: 'false'   # Skip npm install (default: false)
```
**Outputs:** `cache-hit` - Whether cache was hit

#### 2. astro-build  
**Purpose:** Standardized Astro build with workspace/build/ output
```yaml
- name: Build Project
  uses: ./.github/actions/astro-build
  with:
    build-context: 'production'        # dev, pr, staging, production
    deploy-url: 'https://example.com'   # Target deployment URL
    pr-number: '123'                    # For PR builds (optional)
    clean-build: 'true'                 # Clean workspace/build/ first
```
**Outputs:** `build-duration`, `build-size`

#### 3. manage-artifacts
**Purpose:** Upload/download build artifacts with consistent naming
```yaml
# Upload
- name: Upload Build Artifacts
  uses: ./.github/actions/manage-artifacts
  with:
    action: 'upload'
    build-context: 'production'
    retention-days: '7'

# Download
- name: Download Build Artifacts  
  uses: ./.github/actions/manage-artifacts
  with:
    action: 'download'
    build-context: 'production'
```
**Outputs:** `artifact-name` - Generated artifact name

### Benefits
- **DRY Principle:** 10+ Node.js setups → 1 composite action
- **Consistency:** Same behavior across all workflows
- **Maintainability:** Single point of updates for CI patterns
- **Dependabot Integration:** Automatic updates to composite actions

---

## 🤖 Dependabot Preview Environments

**✅ WORKING SOLUTION**: Comment-triggered preview deployments for dependency updates!

### How It Works
- **❌ No Automatic Previews**: Dependabot PRs cannot access secrets due to GitHub's security model
- **✅ Comment Trigger**: Add `/preview` comment to any Dependabot PR
- **🤖 GitHub App**: Uses `resume-pipeline-bot` with enhanced permissions for secret access
- **🌐 Preview URLs**: `https://deploy-preview-{number}--resume-as-code.netlify.app`

### Usage Examples
```bash
# On any Dependabot PR, simply comment:
/preview

# Manual workflow dispatch also available via Actions tab
gh workflow run "🤖 Dependabot Preview Environment" --ref main -f pr_number=130

# Preview URLs follow this pattern:
# https://deploy-preview-130--resume-as-code.netlify.app
# https://deploy-preview-129--resume-as-code.netlify.app
```

### Security & Permissions  
- ✅ Repository owner/admin can trigger previews
- ✅ GitHub App provides full secret access (NETLIFY_AUTH_TOKEN, etc.)
- ✅ Complete audit trail in GitHub Actions logs
- ✅ Same deployment quality as regular PR previews

### Documentation
See **[docs/dependabot-previews.md](docs/dependabot-previews.md)** for complete usage guide and troubleshooting.

---

## 📚 Quick Reference

For detailed information, see the modular documentation:

- **[Development Commands](docs/commands.md)** - Complete command reference
- **[Architecture](docs/architecture.md)** - Technical overview and project structure  
- **[Platform Engineering](docs/platform-engineering.md)** - CI/CD rules and deployment flows
- **[ARM64 Performance](docs/arm64-performance.md)** - Performance optimization details
- **[Composite Actions](docs/composite-actions.md)** - CI/CD building blocks and usage examples
- **[Dependabot Previews](docs/dependabot-previews.md)** - Dependency update preview environments

## 🚨 Critical Rules (Never Ignore)

```bash
# ALWAYS rebase before push
git pull --rebase
git push

# ALWAYS use conventional commits
git commit -m "feat: describe your feature"

# ALWAYS clean before major changes  
make clean

# ALWAYS validate before push
make test-fast

# REMEMBER: New directory structure
# - Source code: app/ (not src/)
# - Build output: workspace/build/ (not dist/)
# - Scripts: infrastructure/scripts/ (not scripts/)
```

**Note**: For full details on any topic above, refer to the corresponding documentation file in the `docs/` directory.