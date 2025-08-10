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

### Docker Operations

- `make docker-check` - Verify Docker is running (required for all operations)
- `make build-images` - Build all browser-specific test images
- `make status` - Comprehensive project health check

### Developer Tools

- `npm run dev:health` - Development environment health check (6 automated validations)
- `npm run dev:perf` - Performance analysis and benchmarks
- `npm run dev:clean` - Clean development artifacts
- `npm run dev:setup` - Automated environment setup

### Utilities

- `make clean` - Clean local environment to match GitHub Actions runner (CI/CD parity)
- `make clean-docker` - Clean Docker containers and images only (legacy)
- `make help` - Show all available commands

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

```
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
├── resume-data.json      # Resume content data
├── template.html         # Handlebars template
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
3. **Push to GitHub** to trigger AMD64 CI pipeline
4. **Verify CI success** using `gh run list` and `gh run view <run-id>`
5. **Only consider changes complete** when GitHub Actions pass on AMD64
6. **Use `gh cli` for all CI/CD operations** - ensures authentication and proper API access

### 🧹 Environment Parity (Industry Standard)

- **Always clean before major changes**: `make clean` removes all artifacts that could cause CI/local differences
- **Mirrors GitHub Actions runners**: Comprehensive cleanup including system files, caches, and build artifacts
- **Cross-platform considerations**: Removes macOS `.DS_Store`, Windows `Thumbs.db`, etc.
- **Docker state reset**: Full container and image cleanup to prevent state leakage
- **Git cleanup**: Removes untracked files and optimizes repository state

### 🛠️ Required Tools for Platform Engineering

- **Docker Desktop**: Must be running for all operations
- **GitHub CLI (`gh`)**: Must be authenticated for CI/CD validation
- **Make**: All commands go through Makefile entrypoints
- **Git**: For version control and triggering CI/CD

### Testing Strategy

- **Unit Tests**: Jest with jsdom for DOM manipulation and utilities
- **E2E Tests**: Playwright across multiple browsers and devices
- **Visual Regression**: Screenshot-based testing with baselines
- **Accessibility**: WCAG 2.1 AA compliance validation
- **Performance**: Core Web Vitals monitoring
- **Cross-Device**: Desktop (1280x720), iPhone 15 Pro Max, iPad Pro

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

### Platform Engineering Commands

```bash
# Environment parity workflow (ALWAYS start with this)
make clean                              # Clean local to match GitHub Actions runner
make status                             # Verify clean state

# Development workflow
make build                              # Build using Docker
make test-fast                          # Quick validation before push

# CI/CD validation workflow
git push                                # Trigger CI pipeline
gh run list --limit 5                  # Check recent workflow runs
gh run view <run-id>                    # View specific run details
gh run watch                            # Monitor current workflows
gh workflow list                        # List all available workflows

# Docker validation (ARM/AMD64 compatibility)
make docker-check                       # Verify Docker daemon
make build-images                       # Build multi-arch test images

# Health checks and troubleshooting
gh auth status                          # Verify GitHub CLI authentication
docker system df                        # Check Docker resource usage
git status                              # Check repository state
```

### Industry Standard Best Practices Applied

- **Clean Slate Principle**: `make clean` ensures local environment matches fresh CI runners
- **Fail Fast**: `make test-fast` provides quick feedback before pushing to CI
- **Environment Parity**: Identical setup between local and CI eliminates "works on my machine" issues
- **Cross-Architecture Testing**: Docker handles ARM (local) vs AMD64 (CI) differences
- **Comprehensive Cleanup**: Removes all possible sources of state contamination
- **Git Hygiene**: Automatic cleanup of untracked files and repository optimization
- **Directory Structure Preservation**: `.gitkeep` files maintain important folder structure
- **Optimized Docker Context**: Comprehensive `.dockerignore` reduces build context size
- **Security by Default**: Excludes secrets, credentials, and sensitive files from Docker builds
