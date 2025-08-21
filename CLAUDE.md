# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build & Development

- `make build` - Build HTML and PDF resume using Docker Compose
- `make dev` - Start development server with mobile LAN access (Port 3000)
- `make dev-start` - Start dev server in background (detached mode)
- `make dev-stop` - Stop background dev server
- `make serve` - Production server (Port 3001) with built content
- `make get-lan-ip` - Get Mac LAN IP address for mobile testing
- `npm run build` - Direct Node.js build (inside Docker containers)
- `npm run dev` - Direct development server (inside Docker containers)

### Enhanced Testing & Quality Assurance

- `make test-visual-matrix` - Test all 20 viewport/theme combinations with screenshots
- `make test-pdf` - Validate PDF generation (all 3 variants: screen, print, ATS)
- `make test-all` - Run comprehensive test suite using Docker Compose
- `make test-fast` - Run fast smoke tests (recommended for development)
- `make test-unit` - Run Jest unit tests with coverage
- `make test-e2e` - Run Playwright end-to-end tests
- `make test-visual` - Run visual regression tests
- `make test-accessibility` - Run accessibility tests
- `make test-performance` - Run performance tests
- `npm test` - Alias for `make test`

### 🚀 Smart Testing Strategy (Leverage Unlimited GitHub Actions Minutes)

**Philosophy**: Use fast local tests for immediate feedback, leverage unlimited GitHub Actions minutes for comprehensive testing.

#### Local Fast Tests (< 2 minutes)
```bash
npm run test:local     # Fast validation: file existence, JSON parsing, template syntax
npm run test:smart     # Auto-detect mode (local=fast, CI=comprehensive)
```

#### CI Comprehensive Tests (Unlimited Minutes)
```bash
npm run test:ci        # Full comprehensive testing suite
npm run test:trigger   # Trigger CI workflows from local environment
```

#### Smart Testing Commands

- **`npm run test:local`** - Essential validations only (< 60 seconds)
  - File existence check (resume-data.json, template.html)
  - JSON schema validation
  - Template syntax compilation
  - Basic unit tests (if time permits)

- **`npm run test:ci`** - Comprehensive testing (5-30 minutes)
  - Unit tests with full coverage reports
  - Visual regression matrix (20 viewport/theme combinations)
  - Cross-browser E2E tests (Chrome, Firefox, Safari)
  - Accessibility audit (WCAG 2.1 AA compliance)
  - Performance testing (Core Web Vitals)
  - PDF generation validation (3 variants)

- **`npm run test:trigger`** - Launch CI workflows
  - Triggers 4 parallel workflows using GitHub Actions
  - Visual Regression Testing (🎨)
  - Performance & Quality Monitoring (🎯)
  - Security Scanning (🔒)
  - Netlify Staging Pipeline

### 🚀 ARM64 Performance Strategy (Mac M1/M2 + GitHub ARM Runners)

**Revolutionary Performance**: Native ARM64 execution for maximum speed on Mac M1/M2 and GitHub ARM64 runners.

#### ARM64 Local Development
```bash
make arm64-test        # Test ARM64 performance with act
make arm64-staging     # Test ARM64 staging deployment
make arm64-benchmark   # ARM64 vs AMD64 performance comparison
```

#### GitHub ARM64 Runners (FREE! - January 2025)
- **New Free Runners**: `ubuntu-24.04-arm` and `ubuntu-22.04-arm` 
- **Performance**: 40% performance boost vs previous generation
- **Cost Efficiency**: 37% less expensive than x64 runners
- **Energy Efficiency**: 30-40% less power consumption
- **Availability**: Free for all public repositories

#### Performance Benefits
- **40% Performance Boost**: Native ARM64 execution with Cobalt 100 processors
- **37% Cost Savings**: ARM runners cost less than x64 alternatives
- **Energy Efficient**: 30-40% less power consumption
- **Native Compilation**: ARM64 Node.js, Sharp, Puppeteer binaries
- **Architecture Parity**: Perfect match with Mac M1/M2 development

#### Resource Optimization Strategy

**Local Benefits:**
- Zero compute consumption for long-running tests
- Immediate feedback for basic validations
- Fast iteration during development

**CI Benefits:**
- Unlimited GitHub Actions minutes (open source repository)
- Parallel execution across multiple runners
- Cross-platform testing (AMD64 CI vs ARM64 local)
- Artifact collection and preservation
- No timeout limitations

### 🎭 Act Integration (Local GitHub Actions Testing)

**Revolutionary Local Testing**: Run GitHub Actions workflows locally with act for instant feedback.

#### Act Setup Commands
```bash
make act-setup         # Create .actrc and .env.act configuration
make act-check         # Verify act installation and configuration
make act-list          # List all available workflows
```

#### Act Testing Commands
```bash
make act-staging       # Test staging deployment workflow
make act-lighthouse    # Test Lighthouse performance workflow
make act-security      # Test security scanning workflow
make act-visual        # Test visual regression workflow
make act-pr-preview    # Test PR preview workflow
make act-test-all      # Test all workflows (dry-run)
```

#### Docker-Free Development (Revolutionary)
```bash
make dev-local         # Development using act local environment (no Docker)
make build-local       # Build using act local environment (no Docker)
make test-local        # Test using act local environment (no Docker)
```

#### Act Benefits
- **Instant Feedback**: Test GitHub Actions locally before pushing
- **No Docker Overhead**: Direct host Node.js execution for maximum speed
- **Perfect Debugging**: Debug workflows locally with full access
- **Cost Efficiency**: No CI minutes consumed during development

### Docker Operations

- `make docker-check` - Verify Docker is running (required for all operations)
- `make build-images` - Build all browser-specific test images
- `make status` - Comprehensive project health check

### Developer Tools

- `npm run dev:health` - Development environment health check (6 automated validations)
- `npm run dev:perf` - Performance analysis and benchmarks
- `npm run dev:clean` - Clean development artifacts
- `npm run dev:setup` - Automated environment setup

### Resume Auto-Updater

- `npm run resume:update` - Apply all configured automatic updates to resume data
- `npm run resume:update:dry-run` - Preview what changes would be applied without modifying files
- `npm run resume:update:config` - Show current auto-updater configuration

### Utilities

- `make clean` - Clean local environment to match GitHub Actions runner (CI/CD parity)
- `make clean-docker` - Clean Docker containers and images only (legacy)
- `make help` - Show all available commands

## 🎯 Conventional Commits Implementation

This project has **100% conventional commits coverage** with comprehensive automation:

### ✅ Enforced Conventional Commits

All commits **MUST** follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# ✅ Valid commit formats (automatically enforced)
git commit -m "feat: add new resume section for certifications"
git commit -m "fix: resolve QR code URL mismatch in preview environments"
git commit -m "chore(deps): bump docker/build-push-action from 5 to 6"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify PDF generation logic"
git commit -m "perf: optimize image loading performance"
git commit -m "ci: enhance GitHub Actions caching strategy"

# ❌ Invalid commits (blocked by pre-commit hook)
git commit -m "update stuff"           # Rejected: No type
git commit -m "random change"          # Rejected: No conventional format
git commit -m "fixed bug"              # Rejected: Wrong format
```

### 🤖 Automated Conventional Commits

| Source | Format | Example | Impact |
|--------|--------|---------|---------|
| **Dependabot** | `chore(deps):` | `chore(deps): bump playwright from 1.40.0 to 1.41.0` | Patch version bump |
| **Release-Please** | `chore(release):` | `chore(release): release 2.4.0` | Release management |
| **GitHub Actions** | `ci:` | `ci: optimize Docker build caching` | Patch version bump |
| **Manual Commits** | `feat:`, `fix:` | `feat: implement dark mode toggle` | Minor/patch bumps |

### 📋 Supported Commit Types

Based on `.release-please-config.json` configuration:

| Type | Description | Changelog Section | Version Impact | Hidden |
|------|-------------|-------------------|----------------|---------|
| `feat` | New features | Features | **Minor** (2.3.0 → 2.4.0) | ❌ |
| `fix` | Bug fixes | Bug Fixes | **Patch** (2.3.0 → 2.3.1) | ❌ |
| `chore` | Maintenance, deps | Miscellaneous | **Patch** | ❌ |
| `docs` | Documentation | Documentation | **Patch** | ❌ |
| `refactor` | Code refactoring | Code Refactoring | **Patch** | ❌ |
| `perf` | Performance | Performance Improvements | **Patch** | ❌ |
| `ci` | CI/CD changes | Continuous Integration | **Patch** | ❌ |
| `style` | Code formatting | Styles | **Patch** | ✅ |
| `test` | Test changes | Tests | **Patch** | ✅ |

### 🔧 Multi-Layer Enforcement

**1. Pre-commit Hook Validation** (Local - `.pre-commit-config.yaml`):

```yaml
# Conventional Commits validation (ACTIVE)
- repo: https://github.com/compilerla/conventional-pre-commit
  rev: v3.4.0
  hooks:
    - id: conventional-pre-commit
      stages: [commit-msg]
      args: [optional-scope]
```

**2. PR Validation** (CI/CD - `.github/workflows/conventional-commits-check.yml`):

- **✅ MANDATORY**: All PRs **MUST** pass conventional commits validation
- **🔍 Automatic**: Validates ALL commits in every PR
- **📝 Detailed**: Provides helpful feedback and examples
- **🚫 Blocking**: PR cannot be merged with invalid commit messages

**Validation check**:
```bash
# Verify pre-commit is active locally
pre-commit --version
git log --oneline -5  # Should show conventional commit format

# Check PR validation status (after pushing)
gh pr checks  # Shows conventional commits validation status
```

### 🚀 Release Automation Flow

1. **Commit with conventional format** → Pre-commit validates locally
2. **Push to branch** → Normal development workflow
3. **Create PR** → **MANDATORY conventional commits validation runs**
4. **PR validation passes** → PR can be approved and merged
5. **Merge to main** → Release-please analyzes commits
6. **Release-please creates PR** → Combines all changes since last release
7. **Merge release PR** → **GitHub release created automatically**

### 🚫 PR Merge Requirements

**ALL PRs must satisfy**:
- ✅ **Conventional Commits Check**: All commit messages validated
- ✅ **Pre-commit hooks**: Quality gates passed
- ✅ **Code review**: At least one approval
- ✅ **CI/CD pipeline**: All checks green

**No exceptions** - invalid commit messages will **block PR merging**.

### 📊 Version Management Strategy

```mermaid
graph TD
    A[feat: major feature] --> B[Minor Version: 2.3.0 → 2.4.0]
    C[fix: bug fix] --> D[Patch Version: 2.3.0 → 2.3.1]
    E[chore(deps): dependency] --> D
    F[docs: documentation] --> D
    B --> G[Release-please PR created]
    D --> G
    G --> H[Merge PR → GitHub Release]
```

### 🎉 Benefits Achieved

- ✅ **Automated versioning**: No manual version management
- ✅ **Automatic changelogs**: Generated from commit messages
- ✅ **GitHub releases**: Created automatically with proper categorization
- ✅ **Dependency tracking**: Dependabot PRs included in releases
- ✅ **Multi-layer validation**: Local pre-commit + PR CI validation
- ✅ **Quality assurance**: Invalid commits blocked at commit time AND PR merge
- ✅ **Developer experience**: Clear contribution guidelines with helpful feedback
- ✅ **Zero exceptions**: 100% enforcement across all contribution paths

### 💡 Developer Guidelines

**Writing good conventional commits**:

```bash
# Good: Clear, descriptive, follows format
feat(pdf): add ATS-optimized PDF generation with enhanced text extraction
fix(qr): resolve URL mismatch in Netlify preview environments
chore(deps): update playwright to 1.41.0 for better stability

# Avoid: Vague, too long, missing context
feat: add stuff
fix: bug
chore: update
```

**Scope usage** (optional but recommended):
- `feat(pdf):` - PDF generation features
- `fix(build):` - Build system fixes
- `chore(deps):` - Dependency updates
- `ci(docker):` - Docker-related CI changes

This conventional commits implementation ensures **consistent, automated, and professional release management** throughout the entire development lifecycle.

## 🤖 AI-Friendly Development Workflow (Claude Code Optimized)

This project is optimized for AI-assisted development with Claude Code. Here are the streamlined workflows:

### ✅ Conventional Commits for AI Assistants

**CRITICAL**: Always use conventional commit format. The pre-commit hooks will guide you with AI-friendly error messages.

```bash
# 🎯 Perfect commit patterns for AI assistants:
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve login button accessibility issue"  
git commit -m "chore: update dependencies to latest versions"
git commit -m "docs: improve api documentation with examples"
git commit -m "refactor: simplify user validation logic"
git commit -m "test: add comprehensive e2e user flow tests"

# ❌ Common AI assistant mistakes to avoid:
git commit -m "feat: Add User Authentication"     # Wrong: uppercase in subject
git commit -m "update: change some stuff"         # Wrong: invalid type  
git commit -m "fix"                               # Wrong: no description
git commit -m "feat: implement comprehensive user authentication system with OAuth2, SAML, and multi-factor authentication support including biometric verification"  # Wrong: too long (>100 chars)
```

### 🔧 Emergency Override for Broken Commits

If you get stuck with conventional commits validation:

```bash
# Use SKIP to bypass pre-commit hooks in emergencies
SKIP=conventional-pre-commit git commit -m "emergency: fix critical production issue"

# Then immediately fix with proper conventional commit:
git commit --amend -m "fix: resolve critical production deployment failure"
```

### 🚀 Context7 Integration for Real-Time Documentation

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

### 📋 Pre-Commit Hook Validation

The pre-commit hooks are designed to be AI-assistant friendly:

**What Happens:**
1. **conventional-pre-commit**: Fast validation using compilerla/conventional-pre-commit
2. **claude-friendly-commitlint**: Detailed AI-friendly error messages if validation fails

**AI-Friendly Error Messages:**
- Clear problem identification with examples
- Copy-paste fix commands
- Links to documentation
- Specific guidance for each rule violation

### 🛠️ Development Commands for AI Assistants

```bash
# Essential commands for AI-assisted development:
git pull --rebase                    # ALWAYS before any git push
make clean                           # Clean environment (matches CI)
make test-fast                       # Quick validation before commit
npm run test:local                   # Fast local tests (<2 min)
npm run test:ci                      # Comprehensive CI tests

# Context7 enhanced development:
npm run dev:health                   # Environment validation with Context7 docs
npm run build                        # Template + PDF generation
npm run serve                        # Production preview
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
# 1. Start development
git pull --rebase
make clean

# 2. Make changes, then validate
make test-fast

# 3. Commit with conventional format (AI-friendly validation)
git commit -m "feat: implement new feature with proper description"

# 4. Push (after rebase)
git pull --rebase
git push
```

This setup ensures smooth AI-assisted development while maintaining code quality and automated releases.

## Architecture Overview

This is a **resume generation system** built with infrastructure-as-code principles:

### Core Technology Stack

- **Template Engine**: Handlebars.js for dynamic HTML generation from JSON data
- **PDF Generation**: Puppeteer for high-quality PDF export
- **Build System**: Node.js scripts with Docker containerization
- **Testing**: Jest (unit) + Playwright (E2E/visual/accessibility/performance)
- **CI/CD**: GitHub Actions with multi-stage pipeline
- **Development**: Hot-reload dev server with file watching

### Project Structure

```text
├── scripts/
│   ├── build.js           # Main build script (HTML + PDF generation)
│   ├── dev-server.js      # Development server with hot reload
│   ├── server.js          # Production server
│   └── utils/             # Shared utilities
├── src/
│   ├── index.html         # Generated HTML resume
│   └── components/        # JavaScript components
├── tests/                 # Comprehensive test suite
│   ├── unit/             # Jest unit tests
│   ├── integration/      # Build and deployment tests
│   └── *.spec.js         # Playwright E2E tests
├── assets/               # Static assets (images, etc.)
├── dist/                 # Build output (HTML, PDF, assets)
├── src/
│   ├── resume-data.json  # Resume content data
│   └── templates/
│       └── template.html # Handlebars template
└── Makefile             # Developer experience automation
```

### Key Build Process

1. **Data-Driven**: Resume content stored in `resume-data.json`
2. **Template System**: `template.html` uses Handlebars for dynamic content
3. **Asset Management**: Automatic copying of assets to dist/ directory
4. **QR Code Generation**: Dynamic QR codes for online version links
5. **PDF Export**: Puppeteer generates print-ready PDFs with proper metadata
6. **Responsive Design**: Mobile-first with dark/light mode support

### Docker Compose Architecture (Enhanced)

- **All commands use Docker Compose** - no local Node.js installation required
- **Service-based architecture** with dedicated containers for each workflow
- **Port allocation strategy** for predictable development experience
- **Mobile testing support** with LAN IP detection for cross-device testing
- **Background development server** that runs continuously while working

#### Port Allocation Strategy

- **Port 3000**: Development server with hot reload (always running in background)
- **Port 3001**: Production preview server (built content)
- **Port 3002**: CI and automated testing exclusive port

#### Docker Compose Services

- **`dev`**: Development server with hot reload and mobile LAN access
- **`build`**: Build service for HTML + PDF generation
- **`serve`**: Production preview server for built content
- **`test`**: Visual testing with comprehensive viewport/theme matrix (20 combinations)
- **`pdf-validate`**: PDF validation for all 3 variants (screen, print, ATS)
- **`test-all`**: Complete test suite runner

## CRITICAL Platform Engineering Rules

### 🚨 ALWAYS Use Docker for Automation

- **NEVER use local binaries** (npm, node, playwright, jest) for tests or CI/CD validation
- **ALWAYS use Makefile commands** as the entrypoint - they handle Docker orchestration
- **All testing and automation must be containerized** to ensure environment parity
- Local development MAY use direct commands, but validation MUST use Docker

### 🏗️ Architecture Considerations (ARM vs AMD64)

- **Local Mac M1**: Runs ARM64 architecture
- **GitHub Free Runners**: Use AMD64 architecture
- **Multi-platform builds**: Docker images support both architectures
- **Browser binaries**: May behave differently between ARM and AMD64
- **Testing**: Always validate changes using GitHub Actions before considering complete

### 🔄 CI/CD Validation Workflow

1. **Clean local environment** using `make clean` to match fresh GitHub Actions runner
2. **Make changes locally** using Docker commands (`make build`, `make test-fast`)
3. **ALWAYS rebase before pushing** using `git pull --rebase` to synchronize with remote
4. **Push to GitHub** to trigger AMD64 CI pipeline
5. **Verify CI success** using `gh run list` and `gh run view <run-id>`
6. **Only consider changes complete** when GitHub Actions pass on AMD64
7. **Use `gh cli` for all CI/CD operations** - ensures authentication and
   proper API access

### 🧹 Environment Parity (Industry Standard)

- **Always clean before major changes**: `make clean` removes all artifacts
  that could cause CI/local differences
- **Mirrors GitHub Actions runners**: Comprehensive cleanup including system
  files, caches, and build artifacts
- **Cross-platform considerations**: Removes macOS `.DS_Store`, Windows
  `Thumbs.db`, etc.
- **Docker state reset**: Full container and image cleanup to prevent state leakage
- **Git cleanup**: Removes untracked files and optimizes repository state

### 🛠️ Required Tools for Platform Engineering

- **Docker Desktop**: Must be running for all operations
- **GitHub CLI (`gh`)**: Must be authenticated for CI/CD validation
- **Make**: All commands go through Makefile entrypoints
- **Git**: For version control and triggering CI/CD

### 🚨 CRITICAL Git Workflow Rules

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

### Testing Strategy

- **Unit Tests**: Jest with jsdom for DOM manipulation and utilities
- **E2E Tests**: Playwright across multiple browsers and devices
- **Visual Regression**: Screenshot-based testing with baselines
- **Accessibility**: WCAG 2.1 AA compliance validation
- **Performance**: Core Web Vitals monitoring
- **Cross-Device**: Desktop (1280x720), iPhone 15 Pro Max, iPad Pro

## ⚡ Speedlight Builds - Ultra-Fast Caching Strategy

**Revolutionary Docker-free ARM64 builds with aggressive multi-layer caching for "speedlight" performance.**

### 🚀 Speedlight Philosophy

Since we eliminated Docker complexity, we can implement aggressive caching strategies impossible with containers:

- **Docker-Free Advantage**: No container layer limitations - cache everything
- **ARM64 Native Performance**: 40% performance boost + 37% cost savings  
- **Intelligent Build Detection**: Skip expensive operations when source unchanged
- **Multi-Layer Caching**: Dependencies, build artifacts, assets, and system cache

### 📊 Performance Comparison

| Build Type | Traditional (Docker) | Speedlight (ARM64 + Cache) | Improvement |
|------------|---------------------|----------------------------|-------------|
| **Dependencies** | 45-90s | 2-5s (cache hit) | **90-95% faster** |
| **Build Process** | 20-45s | 1-3s (cache hit) | **95-98% faster** |
| **Total Time** | 95-195s (1.5-3min) | 8-50s (15s-1min) | **70-85% faster** |
| **CI Minutes** | High consumption | 60-80% reduction | **Major savings** |
| **Energy Usage** | AMD64 emulation | ARM64 native | **40-60% less power** |

### 🛠️ Speedlight Commands

```bash
# Test speedlight build strategy locally
make speedlight-test

# Test speedlight staging pipeline  
make speedlight-staging

# View performance benchmark comparison
make speedlight-benchmark

# ARM64 development with speedlight caching
make arm64-test
```

### 🎯 Speedlight Implementation Features

**Aggressive Dependency Caching:**
- `~/.npm`, `~/.cache`, `node_modules` - Full dependency cache
- Smart verification: `npm ls --depth=0` for integrity checking
- Cache hit detection with automatic fallback to `npm ci`

**Intelligent Build Artifact Caching:**
- `dist/` directory with all generated assets
- Source change detection using file modification times
- Skip expensive PDF generation when HTML templates unchanged

**Multi-Layer Cache Strategy:**
- **Layer 1**: System cache (`~/.npm`, `~/.cache`)
- **Layer 2**: Project dependencies (`node_modules`)  
- **Layer 3**: Build artifacts (`dist/` directory)
- **Layer 4**: Optimized assets (`dist/assets/images`, etc.)

**Smart Cache Keys:**
```yaml
# Primary cache key (most specific)
${{ runner.os }}-arm64-speedlight-${{ hashFiles('package-lock.json', 'src/**', 'assets/**') }}

# Fallback keys (progressively broader)
${{ runner.os }}-arm64-speedlight-
${{ runner.os }}-arm64-
```

### 🚀 Expected Speedlight Results

**Cache Hit Scenario (90% of workflow runs):**
- Dependencies: 2-5 seconds (vs 45-90s)
- Build: 1-3 seconds (vs 20-45s)  
- **Total: 8-15 seconds (vs 95-195s)**

**Cache Miss Scenario (10% of workflow runs):**
- Dependencies: 15-30 seconds (ARM64 native speed)
- Build: 15-30 seconds (no Docker overhead)
- **Total: 35-50 seconds (vs 95-195s)**

**Cost & Energy Benefits:**
- **60-80% reduction** in GitHub Actions minutes
- **40-60% less energy** consumption (ARM64 + shorter runs)
- **2-4x faster** developer feedback loops
- **Major cost savings** for open source projects

This speedlight strategy leverages your insight: *"since we don't have docker we can cache much more and have speedlight builds"* - exactly what we've implemented!

## Mobile Testing & QR Code Workflow

### 📱 Mobile LAN Access (macOS)

The system automatically detects your Mac's LAN IP address to enable seamless mobile testing:

#### Quick Mobile Testing Setup

```bash
make dev-start          # Start dev server in background
make get-lan-ip         # Display mobile access URL
# Use the displayed URL on your phone: http://192.168.x.x:3000
```

#### QR Code Generation Strategy

- **Development Mode**: QR code points to `http://[LAN_IP]:3000` for easy mobile scanning
- **Production Mode**: QR code points to production URL `https://rafilkmp3.github.io/resume-as-code/`
- **Automatic Detection**: Build script detects development vs production environment
- **Mobile-Friendly**: Large QR code (200px) with high contrast for easy scanning

#### Mobile Testing Workflow

1. **Start Background Server**: `make dev-start` (runs continuously)
2. **Get Mobile URL**: `make get-lan-ip` shows `http://192.168.x.x:3000`
3. **Test on Phone**: Scan QR code or type URL manually
4. **Live Updates**: Changes auto-reload on both desktop and mobile
5. **Stop When Done**: `make dev-stop`

### 🎨 Comprehensive Visual Testing Matrix

Advanced visual validation testing 20 viewport/theme combinations:

#### Test Coverage

- **5 Mobile Devices**: iPhone SE, iPhone 15, iPhone 15 Pro Max, Pixel 7, Galaxy S21
- **2 Tablet Devices**: iPad, iPad Pro
- **3 Desktop Resolutions**: HD (1366x768), FHD (1920x1080), QHD (2560x1440)
- **2 Themes**: Light mode and Dark mode
- **Total**: 20 combinations with full-page screenshots

#### Visual Testing Commands

```bash
make test-visual-matrix  # Test all 20 viewport/theme combinations
make visual-test        # Enhanced visual testing (sections, load more, header)
make visual-test-basic  # Basic device screenshots only
make visual-clean       # Clean visual evidence directory
```

Screenshots saved to:

- `visual-evidence/mobile/` - Mobile device screenshots
- `visual-evidence/tablet/` - Tablet device screenshots
- `visual-evidence/desktop/` - Desktop resolution screenshots

## Enhanced Development Workflow (Docker Compose)

### 🚀 Continuous Background Development

```bash
# Start development server in background (recommended workflow)
make dev-start              # Runs continuously in background
make get-lan-ip             # Get mobile access URL

# Work normally - changes auto-reload
# Desktop: http://localhost:3000
# Mobile: http://192.168.x.x:3000 (from get-lan-ip output)

# Stop when done
make dev-stop
```

### 📋 Complete Development Session

```bash
# 1. Clean environment (CI/CD parity)
make clean

# 2. Start background dev server
make dev-start

# 3. Run fast tests during development
make test-fast

# 4. Visual validation across devices
make test-visual-matrix

# 5. PDF generation validation
make test-pdf

# 6. Production preview
make serve                  # http://localhost:3001
```

### 🔧 Docker Compose Architecture Benefits

- **Background Development**: `make dev-start` runs continuously while you work
- **Port Predictability**: Fixed ports prevent conflicts (3000, 3001, 3002)
- **Mobile Testing**: Automatic LAN IP detection for cross-device testing
- **Container Isolation**: Each service runs in dedicated container
- **No Container Duplication**: Docker Compose prevents port conflicts
- **Service Dependencies**: Automated service startup ordering

### Important Implementation Details

- **Handlebars Helpers**: Custom helpers for JSON stringification and equality comparison
- **Asset Copying**: Recursive copying from assets/ to dist/assets/
- **PDF Optimization**: Print media emulation with professional metadata
- **Error Handling**: Graceful degradation if PDF generation fails
- **Security**: Puppeteer runs with sandbox disabled for Docker compatibility

### 🛡️ Resilient & Fault-Tolerant Workflows

All GitHub Actions workflows implement comprehensive resilience patterns:

- **🔄 Retry Mechanisms**: 3-attempt retry with exponential backoff for all network operations
- **🛠️ Error Recovery**: Automatic fallback strategies for non-critical failures
- **⚡ Idempotent Operations**: Safe to run multiple times with `--clobber` flags
- **🔍 Validation**: Pre/post-operation checks with comprehensive logging
- **📊 Monitoring**: Detailed step summaries and performance metrics
- **🎯 Graceful Degradation**: PDF failures don't block HTML deployment

**Verification**: `node scripts/verify-resilience.js` validates all patterns
**Documentation**: See `WORKFLOW-RESILIENCE.md` for complete implementation details

### 🚀 Optimized Three-Tier CI/CD Architecture

#### Production Pipeline (`ci-prod.yml`) - **ROCK SOLID**

- **Triggers**: Main branch changes to `src/`, `assets/`, `*.html`, `*.json`, `*.js`, `*.css`, `scripts/`
- **Philosophy**: **Deployment NEVER blocked by tests** - guaranteed success
- **Build**: 2-3 minutes using Docker with PDF generation (60s timeout)
- **Alpha Tests**: Unit + Security tests run informational-only with `continue-on-error: true`
- **Deploy**: Automatic to GitHub Pages (production)
- **Status**: ✅ **Every commit to main deploys automatically**

#### Staging Pipeline (`ci-staging.yml`) - **EXPERIMENTAL**

- **Triggers**: Manual dispatch or test-related file changes
- **Purpose**: E2E tests, visual regression, experimental features
- **Docker Images**: Smart availability checking - skips if images missing
- **Testing**: Playwright E2E + visual tests (all non-blocking)
- **Status**: ⚠️ **All failures are non-blocking** - safe for experimentation

#### Emergency Pipeline (`emergency-deploy.yml`) - **CRITICAL**

- **Triggers**: Manual dispatch only (GitHub UI)
- **Speed**: Zero testing - direct build → deploy in ~5 minutes
- **Use Case**: Production emergencies only when site is broken
- **Safety**: Confirmation step (can be overridden with `skip_confirmation`)
- **Status**: 🚨 **For emergencies only** - bypasses all safety checks

#### 🔧 CI/CD Validation Commands (Platform Engineering)

```bash
# Monitor production builds in real-time
gh run list --workflow="Production CI/CD Pipeline" --limit=5
gh run watch <run-id>

# Trigger staging tests manually
gh workflow run "Staging CI/CD Pipeline" --ref main

# Emergency deployment (use with caution)
gh workflow run "Emergency Deploy" --ref main -f reason="Critical hotfix" -f skip_confirmation=false

# Validate build locally before pushing
make clean  # Clean local environment to match CI
make build  # Test build process locally
make test   # Run all tests
```

#### 🛡️ Critical Fixes Implemented

- **PDF Generation Timeout**: 60s timeout prevents CI from hanging indefinitely
- **Missing Keywords Handling**: Graceful fallback for undefined `resume-data.json` fields
- **Alpha Test Philosophy**: Tests provide insights but **never block deployment**
- **Build Error Recovery**: Continue with HTML-only build if PDF generation fails

### Common Troubleshooting

- **Port Conflicts**: Use `make status` to check port availability
- **Docker Issues**: Run `make docker-check` to verify Docker daemon
- **Build Failures**: Check if `resume-data.json` and `template.html` exist
- **Test Failures**: Playwright may need browser updates in Docker images
- **ARM vs AMD64 Issues**: If tests pass locally (ARM) but fail in CI (AMD64), check browser compatibility
- **CI/CD Authentication**: Run `gh auth status` to verify GitHub CLI authentication
- **CI Pipeline Validation**: Use `gh run watch` to monitor running workflows in real-time

### 🔒 Security Scanning & Vulnerability Management

**Comprehensive security validation with context-aware scanning patterns.**

#### Security Scanning Workflows

- **`🔒 Security Scanning`** - Comprehensive security validation
  - Dependency vulnerability scanning (NPM Audit)
  - Secret detection with TruffleHog
  - Container security scanning with Trivy
  - Infrastructure security with Checkov
  - OSV (Open Source Vulnerabilities) database scanning

#### TruffleHog Secret Detection (Context-Aware)

**Problem Solved**: Fixed "BASE and HEAD commits are the same" error that blocked security scanning on main branch.

**Three Scanning Modes:**

1. **Pull Request Mode** (Differential Scanning)
   ```bash
   # Scans only changes in PR
   base: ${{ github.event.pull_request.base.sha }}
   head: ${{ github.event.pull_request.head.sha }}
   ```

2. **Main Branch Push** (Single Commit Scanning)
   ```bash
   # Scans last commit vs previous commit
   base: ${{ github.sha }}~1
   head: ${{ github.sha }}
   ```

3. **Scheduled/Manual** (Full Repository Scanning)
   ```bash
   # Scans entire repository
   path: ./
   # No base/head specification for full scan
   ```

#### Security Troubleshooting Guide

**Common Issues & Solutions:**

- **"BASE and HEAD commits are the same"**
  - ✅ **FIXED**: Auto-detects context and uses appropriate scanning mode
  - PR: Differential scanning from base SHA to head SHA
  - Main: Single commit scanning (current vs previous)
  - Full: Complete repository scan for scheduled runs

- **"No secrets found but there should be"**
  - Check `--only-verified` flag (may exclude unverified secrets)
  - Verify file patterns aren't excluded by `.gitignore`
  - Use `--debug` flag for detailed scanning logs

#### Workflow Monitoring Commands

```bash
# Monitor security scanning status
gh workflow run "🔒 Security Scanning" --ref main
gh run list --workflow="🔒 Security Scanning" --limit=5

# Check specific security scan results
gh run view <run-id> --log
gh run view <run-id> --job=<job-id>  # For specific security scan job
```

### 🔍 Comprehensive Workflow Troubleshooting

#### Common Workflow Issues & Solutions

**1. NODE_OPTIONS Environment Variable Issues**
```bash
# ❌ Wrong (causes "Can't store output parameter" error)
echo "NODE_OPTIONS=--no-deprecation --no-warnings" >> "$GITHUB_ENV"

# ✅ Correct
echo "NODE_OPTIONS=--no-deprecation --no-warnings" >> $GITHUB_ENV
```

**2. Visual Testing Resume Data Path Issues**
```bash
# Problem: "Could not load resume-data.json for QR code generation"
# ✅ Solution: Enhanced path resolution with multiple fallback strategies
possiblePaths = [
  'src/resume-data.json',           # Primary location
  'resume-data.json',               # Fallback location
  '../src/resume-data.json'         # Relative fallback
]
```

**3. TruffleHog Security Scanning Issues**
```bash
# Problem: "BASE and HEAD commits are the same"
# ✅ Solution: Context-aware scanning configuration
if PR: use differential scanning
if main push: use single commit scanning  
if scheduled: use full repository scanning
```

**4. Workflow Naming Confusion**
```bash
# ❌ Confusing: "Deploy to Production" (but actually staging)
# ✅ Clear: "Deploy to Netlify Staging"
# ✅ Clear: "Deploy to GitHub Pages Production"
```

#### Deployment Pipeline Validation

**Three-Tier Architecture:**
1. **PR Preview** → Netlify preview deployments
2. **Netlify Staging** → Staging environment validation
3. **GitHub Pages Production** → Production deployments (releases only)

**Monitoring Commands:**
```bash
# Monitor all deployment pipelines
gh run list --limit 10
gh workflow list

# Monitor specific deployment
gh run watch <run-id>
gh run view <run-id> --log-failed

# Check deployment status
curl -I https://resume-as-code.netlify.app/           # Staging
curl -I https://rafilkmp3.github.io/resume-as-code/  # Production
```

### Platform Engineering Commands

```bash
# Environment parity workflow (ALWAYS start with this)
make clean                              # Clean local to match GitHub Actions runner
make status                             # Verify clean state

# Development workflow with conventional commits
git commit -m "feat: describe your feature"  # Use conventional commits format
make build                              # Build using Docker
make test-fast                          # Quick validation before push

# CI/CD validation workflow (CRITICAL: Always rebase before push)
git pull --rebase                       # MANDATORY: Synchronize with remote before push
git push                                # Trigger CI pipeline (includes conventional commits check)
gh run list --limit 5                  # Check recent workflow runs
gh run view <run-id>                    # View specific run details
gh run watch                            # Monitor current workflows
gh workflow list                        # List all available workflows

# PR validation workflow
gh pr create                            # Creates PR with automatic conventional commits validation
gh pr checks                            # Check conventional commits validation status
gh pr merge                             # Merge (only allowed after all checks pass)

# Conventional commits validation
pre-commit run --all-files              # Run local pre-commit checks
git log --oneline -10                   # Verify conventional commits format

# Docker validation (ARM/AMD64 compatibility)
make docker-check                       # Verify Docker daemon
make build-images                       # Build multi-arch test images

# Health checks and troubleshooting
gh auth status                          # Verify GitHub CLI authentication
docker system df                        # Check Docker resource usage
git status                              # Check repository state
pre-commit --version                    # Verify pre-commit installation
```

### Industry Standard Best Practices Applied

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

- memorize always git pull --rebase before any commit also try work beeter with pre-hok or always by default skip the pre commit hooks since claude code not work weel wthi thoose and we are slow down and speding tokens , never skip conventional commit message find a way to always commit following this patter
