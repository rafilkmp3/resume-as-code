# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build & Development
- `make build` - Build HTML and PDF resume using Docker
- `make dev` - Start development server with hot reload on port 3000
- `make serve` - Serve built resume on port 3000
- `npm run build` - Direct Node.js build (inside Docker containers)
- `npm run dev` - Direct development server (inside Docker containers)

### Testing
- `make test` - Run complete test suite (unit + E2E + visual + accessibility + performance)
- `make test-fast` - Run fast smoke tests (recommended for development)
- `make test-unit` - Run Jest unit tests with coverage
- `make test-e2e` - Run Playwright end-to-end tests
- `make test-visual` - Run visual regression tests
- `npm test` - Alias for `make test`
- `npm run test:unit` - Jest unit tests directly
- `npm run test:e2e` - Playwright tests directly

### Docker Operations
- `make docker-check` - Verify Docker is running (required for all operations)
- `make build-images` - Build all browser-specific test images
- `make status` - Comprehensive project health check

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

### Docker-First Development
- **All commands use Docker** - no local Node.js installation required
- **Browser-specific images** for E2E testing (Chromium, Firefox, WebKit)
- **Development containers** with hot reload and file watching
- **Production containers** for serving built resume

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

### Development Workflow
1. **File Watching**: `make dev` watches `template.html` and `resume-data.json`
2. **Auto-Rebuild**: Changes trigger automatic rebuild via `scripts/build.js`
3. **Hot Reload**: Development server serves updated content immediately
4. **Port Strategy**: Port 3000 for dev, Port 3001 for testing

### Important Implementation Details
- **Handlebars Helpers**: Custom helpers for JSON stringification and equality comparison
- **Asset Copying**: Recursive copying from assets/ to dist/assets/
- **PDF Optimization**: Print media emulation with professional metadata
- **Error Handling**: Graceful degradation if PDF generation fails
- **Security**: Puppeteer runs with sandbox disabled for Docker compatibility

### CI/CD Pipeline
- **Path-Based Triggers**: Different workflows for Docker vs source changes  
- **Browser Matrix**: Parallel testing across Chromium, Firefox, WebKit
- **Quality Gates**: All tests must pass before deployment
- **GitHub Pages**: Automated deployment on main branch
- **Visual Monitoring**: Cross-device screenshot analysis

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