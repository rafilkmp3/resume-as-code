# Development Commands

## Build & Development

- `make build` - Build HTML and PDF resume using Docker Compose
- `make dev` - Start development server with mobile LAN access (Port 3000)
- `make dev-start` - Start dev server in background (detached mode)
- `make dev-stop` - Stop background dev server
- `make serve` - Production server (Port 3001) with built content
- `make get-lan-ip` - Get Mac LAN IP address for mobile testing
- `npm run build` - Direct Node.js build (inside Docker containers)
- `npm run dev` - Direct development server (inside Docker containers)

## Testing & Quality Assurance

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

## 🚀 Smart Testing Strategy

**Philosophy**: Use fast local tests for immediate feedback, leverage unlimited GitHub Actions minutes for comprehensive testing.

### Local Fast Tests (< 2 minutes)
```bash
npm run test:local     # Fast validation: file existence, JSON parsing, template syntax
npm run test:smart     # Auto-detect mode (local=fast, CI=comprehensive)
```

### CI Comprehensive Tests (Unlimited Minutes)
```bash
npm run test:ci        # Full comprehensive testing suite
npm run test:trigger   # Trigger CI workflows from local environment
```

### Smart Testing Commands

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

## Docker Operations

- `make docker-check` - Verify Docker is running (required for all operations)
- `make build-images` - Build all browser-specific test images
- `make status` - Comprehensive project health check

## Developer Tools

- `npm run dev:health` - Development environment health check (6 automated validations)
- `npm run dev:perf` - Performance analysis and benchmarks
- `npm run dev:clean` - Clean development artifacts
- `npm run dev:setup` - Automated environment setup

## Resume Auto-Updater

- `npm run resume:update` - Apply all configured automatic updates to resume data
- `npm run resume:update:dry-run` - Preview what changes would be applied without modifying files
- `npm run resume:update:config` - Show current auto-updater configuration

## Utilities

- `make clean` - Clean local environment to match GitHub Actions runner (CI/CD parity)
- `make clean-docker` - Clean Docker containers and images only (legacy)
- `make help` - Show all available commands

## Platform Engineering Commands

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