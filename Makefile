.PHONY: help install build build-internal dev serve test test-unit test-e2e test-visual test-accessibility test-performance test-fast clean status docker-check test-internal test-unit-internal test-e2e-internal test-visual-internal test-accessibility-internal test-performance-internal test-fast-internal monitor act-check act-list act-production act-staging act-release act-lighthouse act-security act-visual act-pr-preview act-test-all act-setup act-workflow act-dry-run

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
PURPLE=\033[0;35m
CYAN=\033[0;36m
NC=\033[0m # No Color

# Configuration
DEV_PORT=3000
TEST_PORT=3001
DOCKER_IMAGE=resume-as-code
DOCKER_TAG=latest

# act configuration for local GitHub Actions testing
ACT_FLAGS=--container-architecture linux/amd64
ACT_LOCAL_FLAGS=--env RUN_LOCAL=true --bind

# Default target
help:
	@echo "$(CYAN)📋 Resume-as-Code - Available Commands$(NC)"
	@echo ""
	@echo "$(GREEN)🏗️  Build & Development:$(NC)"
	@echo "  $(GREEN)make build$(NC)         - Build HTML and PDF resume"
	@echo "  $(PURPLE)make dev$(NC)           - Development server with mobile LAN access"
	@echo "  $(PURPLE)make dev-start$(NC)     - Start dev server in background (mobile ready)"
	@echo "  $(PURPLE)make dev-stop$(NC)      - Stop background dev server"
	@echo "  $(PURPLE)make serve$(NC)         - Production server (Port 3001) with built content"
	@echo "  $(CYAN)make get-lan-ip$(NC)     - Get Mac LAN IP for mobile testing"
	@echo ""
	@echo "$(GREEN)🧪 Testing & Quality (Enhanced):$(NC)"
	@echo "  $(BLUE)make test-visual-matrix$(NC) - Test all 20 viewport/theme combinations"
	@echo "  $(BLUE)make test-pdf$(NC)      - Validate PDF generation (all 3 variants)"
	@echo "  $(BLUE)make test-all$(NC)      - Run comprehensive test suite"
	@echo "  $(BLUE)make test-fast$(NC)     - Run fast smoke tests (recommended)"
	@echo "  $(BLUE)make test-unit$(NC)     - Run unit tests with coverage"
	@echo "  $(BLUE)make test-e2e$(NC)      - Run end-to-end tests"
	@echo "  $(BLUE)make test-visual$(NC)   - Run visual regression tests"
	@echo "  $(BLUE)make test-accessibility$(NC) - Run accessibility tests"
	@echo "  $(BLUE)make test-performance$(NC) - Run performance tests"
	@echo ""
	@echo "$(GREEN)🐳 Docker:$(NC)"
	@echo "  $(CYAN)make docker-check$(NC)   - Check if Docker is running"
	@echo ""
	@echo "$(GREEN)🛠️  Utilities:$(NC)"
	@echo "  $(CYAN)make status$(NC)         - Show project status and health check"
	@echo "  $(PURPLE)make monitor$(NC)        - Run visual monitoring (non-blocking)"
	@echo "  $(RED)make clean$(NC)          - Clean local environment (CI/CD parity)"
	@echo "  $(RED)make clean-docker$(NC)   - Clean Docker only (legacy)"
	@echo ""
	@echo "$(GREEN)🧰 Developer Tools:$(NC)"
	@echo "  $(CYAN)npm run dev:health$(NC)  - Development environment health check"
	@echo "  $(CYAN)npm run dev:perf$(NC)    - Performance analysis and benchmarks"
	@echo "  $(CYAN)npm run dev:clean$(NC)   - Clean development artifacts"
	@echo "  $(CYAN)npm run dev:setup$(NC)   - Quick development environment setup"
	@echo ""
	@echo "$(GREEN)⚡ Local GitHub Actions Testing (act):$(NC)"
	@echo "  $(CYAN)make act-check$(NC)       - Check act installation and setup"
	@echo "  $(CYAN)make act-list$(NC)        - List all available workflows"
	@echo "  $(CYAN)make act-production$(NC)  - Test production workflow locally"
	@echo "  $(CYAN)make act-staging$(NC)     - Test staging deployment locally"
	@echo "  $(CYAN)make act-release$(NC)     - Test release workflow locally"
	@echo "  $(CYAN)make act-lighthouse$(NC)  - Test Lighthouse performance locally"
	@echo "  $(CYAN)make act-security$(NC)    - Test security scanning locally"
	@echo "  $(CYAN)make act-visual$(NC)      - Test visual regression locally"
	@echo "  $(CYAN)make act-pr-preview$(NC)  - Test PR preview workflow locally"
	@echo "  $(CYAN)make act-setup$(NC)       - Create .actrc and .env.act configuration"
	@echo "  $(CYAN)make act-test-all$(NC)    - Test all workflows (dry-run)"
	@echo ""
	@echo "$(GREEN)🚀 Local Development (No Docker):$(NC)"
	@echo "  $(CYAN)make dev-local$(NC)       - Development using act local environment"
	@echo "  $(CYAN)make build-local$(NC)     - Build using act local environment"
	@echo "  $(CYAN)make test-local$(NC)      - Test using act local environment"
	@echo ""
	@echo "$(GREEN)🚀 ARM64 Performance (Mac M1/M2):$(NC)"
	@echo "  $(CYAN)make arm64-test$(NC)      - Test ARM64 performance with act"
	@echo "  $(CYAN)make arm64-staging$(NC)   - Test ARM64 staging deployment"
	@echo "  $(CYAN)make arm64-benchmark$(NC) - ARM64 vs AMD64 performance comparison"
	@echo ""
	@echo "$(GREEN)📊 Performance & UX Monitoring:$(NC)"
	@echo "  $(CYAN)npm run perf:report$(NC) - Full performance analysis report"
	@echo "  $(CYAN)npm run perf:history$(NC)- Show performance history"
	@echo "  $(CYAN)npm run perf:build$(NC)  - Measure build time only"
	@echo "  $(CYAN)npm run perf:test$(NC)   - Measure test time only"
	@echo "  $(CYAN)npm run ux:analyze$(NC) - User experience analysis"
	@echo "  $(CYAN)npm run accessibility:audit$(NC) - Accessibility compliance check"
	@echo ""
	@echo "$(GREEN)📸 Visual Testing:$(NC)"
	@echo "  $(CYAN)make visual-test$(NC)    - Enhanced visual testing (sections, load more, header)"
	@echo "  $(CYAN)make visual-test-basic$(NC) - Basic device screenshots only"
	@echo "  $(CYAN)make visual-analyze$(NC) - Analyze visual improvements with consensus"
	@echo "  $(CYAN)make visual-clean$(NC)   - Clean visual evidence directory"

# Install dependencies (deprecated - Docker handles this)
install:
	@echo "$(YELLOW)⚠️  Local binary installation deprecated. Docker handles all dependencies.$(NC)"
	@echo "$(CYAN)Use 'make build' to build the Docker image with all dependencies.$(NC)"

# Check if Docker is running
docker-check:
	@echo "$(CYAN)🐳 Checking Docker status...$(NC)"
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)❌ Docker is not installed$(NC)"; exit 1; }
	@docker info >/dev/null 2>&1 || { echo "$(RED)❌ Docker daemon is not running. Please start Docker first.$(NC)"; exit 1; }
	@echo "$(GREEN)✅ Docker is running$(NC)"

# Build resume (HTML + PDF + assets) using docker-compose
build: docker-check
	@echo "$(GREEN)🏗️ Building resume...$(NC)"
	@COMPOSE_BAKE=true docker-compose -f docker/docker-compose.yml --profile build up --build build
	@echo "$(GREEN)✅ Build completed successfully!$(NC)"
	@echo "$(CYAN)📁 Output files:$(NC)"
	@echo "  - HTML: $(GREEN)./dist/index.html$(NC)"
	@echo "  - PDF:  $(GREEN)./dist/resume.pdf$(NC)"
	@echo "  - Assets: $(GREEN)./dist/assets/$(NC)"

# Build resume inside Docker container (no docker-check needed)
build-internal:
	@echo "$(GREEN)🏗️  Building resume...$(NC)"
	@npm run build
	@echo "$(GREEN)✅ Build completed successfully!$(NC)"

# Netlify-specific build (no Docker required)
build-netlify:
	@echo "$(GREEN)🏗️  Building resume for Netlify...$(NC)"
	@npm run build
	@echo "$(GREEN)✅ Netlify build completed successfully!$(NC)"
	@echo "$(CYAN)📁 Output files:$(NC)"
	@echo "  - HTML: $(GREEN)./dist/index.html$(NC)"
	@echo "  - PDFs: $(GREEN)./dist/*.pdf$(NC)"
	@echo "  - Assets: $(GREEN)./dist/assets/$(NC)"

# Development server with hot reload (draft mode for speed)
# Get Mac's LAN IP address for mobile testing
get-lan-ip:
	@echo "$(CYAN)🌐 Getting Mac LAN IP address...$(NC)"
	@LAN_IP=$$(ifconfig | grep -E "inet.*broadcast" | grep -v 127.0.0.1 | awk '{print $$2}' | head -n1); \
	if [ -n "$$LAN_IP" ]; then \
		echo "$(GREEN)📱 Mac LAN IP: $$LAN_IP$(NC)"; \
		echo "$(CYAN)🔗 Mobile access: http://$$LAN_IP:3000$(NC)"; \
		echo "$(YELLOW)💡 Use this URL on your phone to test the resume$(NC)"; \
	else \
		echo "$(RED)❌ Could not detect LAN IP$(NC)"; \
	fi

# Development server - Port 3000 (can run in background with -d)
dev: docker-check get-lan-ip
	@echo "$(PURPLE)🚀 Starting development server...$(NC)"
	@echo "$(CYAN)🔍 Cleaning up any existing containers on port 3000...$(NC)"
	@-docker-compose -f docker/docker-compose.yml down dev > /dev/null 2>&1 || true
	@-pkill -f "serve.*3000" > /dev/null 2>&1 || true
	@sleep 1
	@echo "$(CYAN)⚡ Draft Mode: Lightning-fast builds (HTML only)$(NC)"
	@echo "$(CYAN)🔥 Hot Reload: Browser auto-refresh on changes$(NC)"
	@echo "$(CYAN)🖥️  Desktop: http://localhost:3000$(NC)"
	@LAN_IP=$$(ifconfig | grep -E "inet.*broadcast" | grep -v 127.0.0.1 | awk '{print $$2}' | head -n1); \
	if [ -n "$$LAN_IP" ]; then \
		echo "$(GREEN)📱 Mobile: http://$$LAN_IP:3000$(NC)"; \
	fi
	@echo "$(YELLOW)📄 Note: PDF generation skipped in dev mode$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop (or use 'make dev-stop' for background)$(NC)"
	@echo "$(CYAN)💡 Tip: Use 'make dev-start' to run in background$(NC)"
	@COMPOSE_BAKE=true docker-compose -f docker/docker-compose.yml --profile dev up dev

# Start development server in background (detached)
dev-start: docker-check get-lan-ip
	@echo "$(PURPLE)🚀 Starting development server in background...$(NC)"
	@COMPOSE_BAKE=true docker-compose -f docker/docker-compose.yml --profile dev up -d dev
	@sleep 3
	@echo "$(GREEN)✅ Development server running in background$(NC)"
	@echo "$(CYAN)🖥️  Desktop: http://localhost:3000$(NC)"
	@LAN_IP=$$(ifconfig | grep -E "inet.*broadcast" | grep -v 127.0.0.1 | awk '{print $$2}' | head -n1); \
	if [ -n "$$LAN_IP" ]; then \
		echo "$(GREEN)📱 Mobile: http://$$LAN_IP:3000$(NC)"; \
		echo "$(YELLOW)📲 Scan QR code or type the mobile URL on your phone$(NC)"; \
	fi
	@echo "$(CYAN)🛑 Use 'make dev-stop' to stop$(NC)"

# Stop background development server
dev-stop:
	@echo "$(PURPLE)🛑 Stopping development server...$(NC)"
	@docker-compose -f docker/docker-compose.yml down dev || true
	@echo "$(GREEN)✅ Development server stopped$(NC)"

# Production server (serve built files) - Port 3001
serve: docker-check build
	@echo "$(PURPLE)🌐 Starting production server...$(NC)"
	@echo "$(CYAN)📱 Resume: http://localhost:3001$(NC)"
	@echo "$(CYAN)📄 PDF: http://localhost:3001/resume.pdf$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	@COMPOSE_BAKE=true docker-compose -f docker/docker-compose.yml --profile serve up serve

# Run all tests
test: docker-check test-unit test-e2e test-visual test-accessibility test-performance
	@echo "$(GREEN)🎉 All tests completed!$(NC)"

# Run comprehensive visual validation tests - Port 3002
test-visual-matrix: docker-check serve
	@echo "$(BLUE)🎨 Running comprehensive visual validation matrix...$(NC)"
	@echo "$(CYAN)📱 Testing 20 viewport/theme combinations...$(NC)"
	@mkdir -p docs/screenshots/visual-evidence/mobile docs/screenshots/visual-evidence/tablet docs/screenshots/visual-evidence/desktop test-results
	@COMPOSE_BAKE=true docker-compose -f docker/docker-compose.yml --profile test up test
	@echo "$(GREEN)✅ Visual matrix validation completed!$(NC)"

# Run PDF validation tests
test-pdf: docker-check build
	@echo "$(BLUE)📄 Running PDF validation tests...$(NC)"
	@COMPOSE_BAKE=true docker-compose -f docker/docker-compose.yml --profile pdf up pdf-validate
	@echo "$(GREEN)✅ PDF validation completed!$(NC)"

# Run all comprehensive tests
test-all: docker-check
	@echo "$(BLUE)🧪 Running all comprehensive tests...$(NC)"
	@COMPOSE_BAKE=true docker-compose -f docker/docker-compose.yml --profile test-all up test-all
	@echo "$(GREEN)✅ All comprehensive tests completed!$(NC)"

# Run fast smoke tests (recommended for development)
test-fast: docker-check
	@echo "$(BLUE)⚡ Running fast smoke tests...$(NC)"
	@mkdir -p test-results coverage && chmod 755 test-results coverage
	@HOST_UID=$$(id -u) HOST_GID=$$(id -g) docker-compose -f docker/docker-compose.yml run --rm test make test-fast-internal

# Internal test runner (runs inside Docker container)
test-internal: test-unit-internal test-e2e-internal test-visual-internal test-accessibility-internal test-performance-internal
	@echo "$(GREEN)✅ All internal tests completed$(NC)"

test-fast-internal:
	@echo "$(BLUE)⚡ Running fast smoke tests...$(NC)"
	@echo "$(BLUE)📋 Fast Unit Tests (Essential)$(NC)"
	@if [ -f "config/jest.fast.config.js" ]; then \
		npx jest --config=config/jest.fast.config.js || echo "$(YELLOW)⚠️  Unit tests failed$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Jest fast config not found$(NC)"; \
	fi
	@echo "$(BLUE)🌐 Fast E2E Tests (Chrome Only)$(NC)"
	@if [ -f "config/playwright.fast.config.js" ]; then \
		timeout 60s npx playwright test --config=config/playwright.fast.config.js || echo "$(YELLOW)⚠️  E2E tests failed$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Playwright fast config not found$(NC)"; \
	fi

# Run unit tests
test-unit: docker-check
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	@mkdir -p test-results coverage && chmod 755 test-results coverage
	@HOST_UID=$$(id -u) HOST_GID=$$(id -g) docker-compose -f docker/docker-compose.yml run --rm test make test-unit-internal

test-unit-internal:
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	@if [ -f "config/jest.config.js" ]; then \
		npx jest --coverage --verbose --config=config/jest.config.js; \
	else \
		echo "$(YELLOW)⚠️  Jest not configured, skipping unit tests$(NC)"; \
	fi

# Run end-to-end tests
test-e2e: docker-check
	@echo "$(BLUE)🎭 Running E2E tests...$(NC)"
	@mkdir -p test-results coverage && chmod 755 test-results coverage
	@HOST_UID=$$(id -u) HOST_GID=$$(id -g) docker-compose -f docker/docker-compose.yml run --rm test make test-e2e-internal

test-e2e-internal:
	@echo "$(BLUE)🎭 Running end-to-end tests...$(NC)"
	@if [ -f "config/playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test --reporter=html --config=config/playwright.config.js; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping E2E tests$(NC)"; \
	fi

# Run visual regression tests
test-visual: docker-check
	@echo "$(BLUE)🎨 Running visual tests...$(NC)"
	@mkdir -p test-results coverage && chmod 755 test-results coverage
	@HOST_UID=$$(id -u) HOST_GID=$$(id -g) docker-compose -f docker/docker-compose.yml run --rm test make test-visual-internal

test-visual-internal:
	@echo "$(BLUE)🎨 Running visual regression tests...$(NC)"
	@if [ -f "config/playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test --grep="visual" --reporter=html --config=config/playwright.config.js || echo "No visual tests found"; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping visual tests$(NC)"; \
	fi

# Run accessibility tests
test-accessibility: docker-check
	@echo "$(BLUE)♿ Running accessibility tests...$(NC)"
	@HOST_UID=$$(id -u) HOST_GID=$$(id -g) docker-compose -f docker/docker-compose.yml run --rm test make test-accessibility-internal

test-accessibility-internal:
	@echo "$(BLUE)♿ Running accessibility tests...$(NC)"
	@if [ -f "config/playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test --grep="accessibility|a11y" --reporter=html --config=config/playwright.config.js || echo "No accessibility tests found"; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping accessibility tests$(NC)"; \
	fi

# Run performance tests
test-performance: docker-check
	@echo "$(BLUE)⚡ Running performance tests...$(NC)"
	@HOST_UID=$$(id -u) HOST_GID=$$(id -g) docker-compose -f docker/docker-compose.yml run --rm test make test-performance-internal

test-performance-internal:
	@echo "$(BLUE)⚡ Running performance tests...$(NC)"
	@if [ -f "config/playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test --grep="performance|perf" --reporter=html --config=config/playwright.config.js || echo "No performance tests found"; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping performance tests$(NC)"; \
	fi

# Clean local environment to match GitHub Actions runner (CI/CD Parity)
clean:
	@echo "$(CYAN)🧹 Running comprehensive local cleanup (CI/CD parity)...$(NC)"
	@chmod +x scripts/clean-local.sh
	@scripts/clean-local.sh
	@echo "$(GREEN)✅ Local environment now matches fresh GitHub Actions runner$(NC)"

# Legacy clean command (Docker only)
clean-docker: docker-check
	@echo "$(RED)🐳 Cleaning Docker containers and generated files...$(NC)"
	@docker-compose -f docker/docker-compose.yml down --volumes --remove-orphans 2>/dev/null || true
	@docker system prune -f 2>/dev/null || true
	@docker container prune -f 2>/dev/null || true
	@rm -rf dist/ coverage/ test-results/ playwright-report/ .nyc_output/
	@echo "$(GREEN)✅ Docker cleanup completed$(NC)"

# Project status and health check
status:
	@echo "$(CYAN)📊 Resume Project Status$(NC)"
	@echo "$(CYAN)================================$(NC)"
	@echo ""
	@echo "$(GREEN)📁 File Status:$(NC)"
	@if [ -f "assets/images/profile.jpeg" ]; then \
		SIZE=$$(ls -lh assets/images/profile.jpeg | awk '{print $$5}'); \
		echo "  $(GREEN)✅ Profile Image: assets/images/profile.jpeg ($$SIZE)$(NC)"; \
	else \
		echo "  $(YELLOW)⚠️  Profile Image: Missing$(NC)"; \
	fi
	@if [ -f "src/resume-data.json" ]; then \
		echo "  $(GREEN)✅ Resume Data: src/resume-data.json$(NC)"; \
	else \
		echo "  $(RED)❌ Resume Data: Missing$(NC)"; \
	fi
	@if [ -f "src/templates/template.html" ]; then \
		echo "  $(GREEN)✅ Template: src/templates/template.html$(NC)"; \
	else \
		echo "  $(RED)❌ Template: Missing$(NC)"; \
	fi
	@echo ""
	@echo "$(GREEN)🏗️  Build Status:$(NC)"
	@if [ -f "dist/index.html" ]; then \
		SIZE=$$(ls -lh dist/index.html | awk '{print $$5}'); \
		echo "  $(GREEN)✅ HTML: dist/index.html ($$SIZE)$(NC)"; \
	else \
		echo "  $(RED)❌ HTML: Not built$(NC)"; \
	fi
	@if [ -f "dist/resume.pdf" ]; then \
		SIZE=$$(ls -lh dist/resume.pdf | awk '{print $$5}'); \
		echo "  $(GREEN)✅ PDF: dist/resume.pdf ($$SIZE)$(NC)"; \
	else \
		echo "  $(RED)❌ PDF: Not built$(NC)"; \
	fi
	@if [ -d "dist/assets" ]; then \
		echo "  $(GREEN)✅ Assets: dist/assets/$(NC)"; \
	else \
		echo "  $(RED)❌ Assets: Not copied$(NC)"; \
	fi
	@echo ""
	@echo "$(GREEN)🐳 Docker Environment:$(NC)"
	@if command -v docker >/dev/null 2>&1; then \
		VERSION=$$(docker --version | cut -d' ' -f3 | cut -d',' -f1); \
		echo "  $(GREEN)✅ Docker: $$VERSION$(NC)"; \
		if docker info >/dev/null 2>&1; then \
			echo "  $(GREEN)✅ Docker Daemon: Running$(NC)"; \
		else \
			echo "  $(RED)❌ Docker Daemon: Not running$(NC)"; \
		fi; \
	else \
		echo "  $(RED)❌ Docker: Not installed$(NC)"; \
	fi
	@echo "  $(CYAN)ℹ️  Local binaries deprecated - all commands use Docker$(NC)"
	@echo ""
	@echo "$(GREEN)🌐 Network:$(NC)"
	@if lsof -ti:$(DEV_PORT) >/dev/null 2>&1; then \
		PID=$$(lsof -ti:$(DEV_PORT)); \
		echo "  $(YELLOW)🟡 Port $(DEV_PORT): Occupied (PID: $$PID)$(NC)"; \
	else \
		echo "  $(GREEN)✅ Port $(DEV_PORT): Available$(NC)"; \
	fi
	@if lsof -ti:$(TEST_PORT) >/dev/null 2>&1; then \
		PID=$$(lsof -ti:$(TEST_PORT)); \
		echo "  $(YELLOW)🟡 Port $(TEST_PORT): Occupied (PID: $$PID)$(NC)"; \
	else \
		echo "  $(GREEN)✅ Port $(TEST_PORT): Available$(NC)"; \
	fi
	@echo ""
	@echo "$(GREEN)🧪 Test Status:$(NC)"
	@if [ -f "test-results/.last-run.json" ]; then \
		STATUS=$$(cat test-results/.last-run.json | grep -o '"status":"[^"]*"' | cut -d'"' -f4); \
		if [ "$$STATUS" = "passed" ]; then \
			echo "  $(GREEN)✅ Last Test Run: Passed$(NC)"; \
		else \
			echo "  $(RED)❌ Last Test Run: Failed$(NC)"; \
		fi; \
	else \
		echo "  $(YELLOW)⚠️  No test results available$(NC)"; \
	fi
	@echo "$(CYAN)================================$(NC)"

# Visual Testing Commands
visual-test: docker-check
	@echo "$(CYAN)📸 Running enhanced visual tests...$(NC)"
	@mkdir -p visual-evidence
	@node scripts/enhanced-visual-tester.js

visual-test-basic: docker-check
	@echo "$(CYAN)📸 Running basic visual tests...$(NC)"
	@mkdir -p visual-evidence
	@node scripts/visual-tester.js

visual-analyze: visual-test
	@echo "$(CYAN)🔍 Analyzing visual improvements with consensus...$(NC)"
	@node scripts/visual-analyzer.js

visual-clean:
	@echo "$(YELLOW)🧹 Cleaning visual evidence directory...$(NC)"
	@rm -rf docs/screenshots/visual-evidence/*
	@echo "$(GREEN)✅ Visual evidence cleared$(NC)"

# Smart build system - only build and push if images don't exist or deps changed
check-and-build-golden-base: docker-check
	@echo "$(CYAN)🔍 Checking if golden-base images need building...$(NC)"
	@if ! docker manifest inspect ghcr.io/rafilkmp3/resume-as-code:production >/dev/null 2>&1; then \
		echo "$(YELLOW)⚠️  Production image not found in registry, building...$(NC)"; \
		$(MAKE) build-and-push-production; \
	else \
		echo "$(GREEN)✅ Production image exists in registry$(NC)"; \
	fi

# Build and push production images to GHCR
build-and-push-production: docker-check
	@echo "$(CYAN)🏗️ Building and pushing production images...$(NC)"
	@echo "$(BLUE)📦 Building golden-base with production stage...$(NC)"
	@docker build --target builder \
		--build-arg GITHUB_SHA=$$(git rev-parse HEAD) \
		--build-arg GITHUB_REF_NAME=main \
		--build-arg NODE_ENV=production \
		-t ghcr.io/rafilkmp3/resume-as-code:production-builder .
	@docker build --target production \
		--build-arg GITHUB_SHA=$$(git rev-parse HEAD) \
		--build-arg GITHUB_REF_NAME=main \
		-t ghcr.io/rafilkmp3/resume-as-code:production .
	@echo "$(BLUE)📤 Pushing to GitHub Container Registry...$(NC)"
	@docker push ghcr.io/rafilkmp3/resume-as-code:production-builder
	@docker push ghcr.io/rafilkmp3/resume-as-code:production
	@echo "$(GREEN)✅ Production images pushed successfully!$(NC)"

# Run visual monitoring tests (non-blocking)
monitor: docker-check
	@echo "$(PURPLE)📸 Running visual monitoring...$(NC)"
	@echo "$(CYAN)Mode: Non-blocking monitoring$(NC)"
	@echo "$(CYAN)Purpose: Visual regression detection and layout improvement$(NC)"
	@echo ""
	@for project in desktop-chrome iphone-15-pro-max ipad-pro; do \
		echo "$(BLUE)🎭 Testing $$project...$(NC)"; \
		docker-compose -f docker/docker-compose.yml run --rm test \
			npx playwright test tests/visual-analysis.spec.js \
			--project=$$project \
			--workers=1 \
			--reporter=line \
			|| echo "$(YELLOW)⚠️ Visual differences detected in $$project (non-blocking)$(NC)"; \
		echo ""; \
	done
	@echo "$(GREEN)📊 Visual monitoring completed!$(NC)"
	@echo "$(CYAN)Check test-results/ for detailed screenshots and reports$(NC)"

# =============================================================================
# ⚡ Local GitHub Actions Testing with act
# =============================================================================

# Check if act is installed and configured
act-check:
	@echo "$(CYAN)⚡ Checking act installation and configuration...$(NC)"
	@command -v act >/dev/null 2>&1 || { echo "$(RED)❌ act is not installed. Install with: brew install act$(NC)"; exit 1; }
	@ACT_VERSION=$$(act --version | head -n1); echo "$(GREEN)✅ act installed: $$ACT_VERSION$(NC)"
	@if [ -f ".actrc" ]; then echo "$(GREEN)✅ .actrc configuration found$(NC)"; else echo "$(YELLOW)⚠️  .actrc not found$(NC)"; fi
	@if [ -f ".env.act" ]; then echo "$(GREEN)✅ .env.act environment file found$(NC)"; else echo "$(YELLOW)⚠️  .env.act not found$(NC)"; fi
	@echo "$(CYAN)💡 Use 'make act-list' to see available workflows$(NC)"

# List all available GitHub Actions workflows
act-list: act-check
	@echo "$(CYAN)📋 Available GitHub Actions workflows:$(NC)"
	@act --list $(ACT_FLAGS) 2>/dev/null || echo "$(YELLOW)⚠️  No workflows found or act configuration issue$(NC)"

# Test production workflow locally
act-production: act-check
	@echo "$(PURPLE)🚀 Testing Production Pipeline locally with act...$(NC)"
	@echo "$(YELLOW)⚠️  This will run the full production build locally$(NC)"
	@act push $(ACT_FLAGS) --workflows .github/workflows/production.yml --verbose

# Test release workflow locally
act-release: act-check
	@echo "$(PURPLE)📦 Testing Release Please Pipeline locally with act...$(NC)"
	@echo "$(YELLOW)⚠️  This will test release automation locally$(NC)"
	@act push $(ACT_FLAGS) --workflows .github/workflows/release-please.yml --verbose

# Test workflow with dry-run (see what would happen without running)
act-dry-run: act-check
	@echo "$(CYAN)🔍 Dry run - showing what act would do...$(NC)"
	@act push $(ACT_FLAGS) --dry-run

# Test specific workflow file
act-workflow: act-check
	@if [ -z "$(WORKFLOW)" ]; then \
		echo "$(RED)❌ Usage: make act-workflow WORKFLOW=.github/workflows/production.yml$(NC)"; \
		exit 1; \
	fi
	@echo "$(PURPLE)⚡ Testing workflow: $(WORKFLOW)$(NC)"
	@act push $(ACT_FLAGS) --workflows $(WORKFLOW) --verbose

# Test staging deployment workflow locally
act-staging: act-check
	@echo "$(PURPLE)🌐 Testing Staging Deployment locally with act...$(NC)"
	@echo "$(YELLOW)⚠️  This tests staging build and Netlify deployment$(NC)"
	@act push $(ACT_FLAGS) --workflows .github/workflows/staging-deployment.yml --verbose

# Test Lighthouse performance workflow locally
act-lighthouse: act-check
	@echo "$(PURPLE)🚀 Testing Lighthouse Performance locally with act...$(NC)"
	@echo "$(CYAN)💡 Requires TARGET_URL environment variable$(NC)"
	@act workflow_call $(ACT_FLAGS) --workflows .github/workflows/lighthouse-testing.yml --verbose

# Test security scanning workflow locally
act-security: act-check
	@echo "$(PURPLE)🔒 Testing Security Scanning locally with act...$(NC)"
	@echo "$(YELLOW)⚠️  This runs comprehensive security validation$(NC)"
	@act push $(ACT_FLAGS) --workflows .github/workflows/security-scanning.yml --verbose

# Test visual regression workflow locally
act-visual: act-check
	@echo "$(PURPLE)📸 Testing Visual Regression locally with act...$(NC)"
	@echo "$(CYAN)💡 Tests visual differences across viewports$(NC)"
	@act push $(ACT_FLAGS) --workflows .github/workflows/visual-regression.yml --verbose

# Test PR preview workflow locally (requires PR event)
act-pr-preview: act-check
	@echo "$(PURPLE)🔍 Testing PR Preview locally with act...$(NC)"
	@echo "$(YELLOW)⚠️  This simulates a pull request event$(NC)"
	@act pull_request $(ACT_FLAGS) --workflows .github/workflows/pr-preview.yml --verbose

# Test all modular workflows quickly (dry-run)
act-test-all: act-check
	@echo "$(CYAN)🧪 Testing all workflows (dry-run)...$(NC)"
	@for workflow in .github/workflows/*.yml; do \
		echo "$(BLUE)Testing: $$workflow$(NC)"; \
		act push $(ACT_FLAGS) --workflows $$workflow --dry-run || echo "$(YELLOW)⚠️ $$workflow failed dry-run$(NC)"; \
	done
	@echo "$(GREEN)✅ All workflows tested$(NC)"

# Setup act configuration files
act-setup: act-check
	@echo "$(CYAN)⚙️  Setting up act configuration...$(NC)"
	@if [ ! -f ".actrc" ]; then \
		echo "$(CYAN)Creating .actrc configuration...$(NC)"; \
		echo "# Act configuration for resume-as-code" > .actrc; \
		echo "--platform ubuntu-latest=catthehacker/ubuntu:act-latest" >> .actrc; \
		echo "--container-architecture linux/amd64" >> .actrc; \
		echo "--artifact-server-path /tmp/artifacts" >> .actrc; \
		echo "$(GREEN)✅ .actrc created$(NC)"; \
	else \
		echo "$(GREEN)✅ .actrc already exists$(NC)"; \
	fi
	@if [ ! -f ".env.act" ]; then \
		echo "$(CYAN)Creating .env.act environment file...$(NC)"; \
		echo "# Environment variables for act" > .env.act; \
		echo "GITHUB_TOKEN=your_github_token_here" >> .env.act; \
		echo "NODE_ENV=test" >> .env.act; \
		echo "NETLIFY_AUTH_TOKEN=your_netlify_token_here" >> .env.act; \
		echo "NETLIFY_SITE_ID=your_netlify_site_id_here" >> .env.act; \
		echo "$(GREEN)✅ .env.act created - Please update with your tokens$(NC)"; \
		echo "$(YELLOW)⚠️  Remember to add your actual tokens to .env.act$(NC)"; \
	else \
		echo "$(GREEN)✅ .env.act already exists$(NC)"; \
	fi

# =============================================================================
# 🚀 Local Development Without Docker (Revolutionary)
# =============================================================================

# Check if local dependencies are installed
check-local-deps:
	@echo "$(CYAN)🔍 Checking local dependencies...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js is not installed$(NC)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)❌ npm is not installed$(NC)"; exit 1; }
	@NODE_VERSION=$$(node --version); echo "$(GREEN)✅ Node.js: $$NODE_VERSION$(NC)"
	@NPM_VERSION=$$(npm --version); echo "$(GREEN)✅ npm: $$NPM_VERSION$(NC)"
	@if [ -f "package.json" ]; then echo "$(GREEN)✅ package.json found$(NC)"; else echo "$(YELLOW)⚠️ package.json not found$(NC)"; fi

# Install dependencies locally (no Docker)
install-local: check-local-deps
	@echo "$(CYAN)📦 Installing local dependencies...$(NC)"
	@npm ci
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

# Development server using act local environment
dev-local: act-check check-local-deps
	@echo "$(PURPLE)🚀 Starting development using act local environment...$(NC)"
	@echo "$(CYAN)⚡ No Docker required - using host Node.js environment$(NC)"
	@echo "$(YELLOW)💡 Environment: RUN_LOCAL=true$(NC)"
	@if [ ! -f "node_modules/.bin/nodemon" ]; then npm install; fi
	@RUN_LOCAL=true NODE_ENV=development npm run dev

# Build using act local environment
build-local: act-check check-local-deps
	@echo "$(GREEN)🏗️ Building using act local environment...$(NC)"
	@echo "$(CYAN)⚡ No Docker required - using host Node.js environment$(NC)"
	@RUN_LOCAL=true NODE_ENV=production npm run build
	@echo "$(GREEN)✅ Build completed successfully!$(NC)"
	@echo "$(CYAN)📁 Output files:$(NC)"
	@echo "  - HTML: $(GREEN)./dist/index.html$(NC)"
	@echo "  - PDF:  $(GREEN)./dist/resume.pdf$(NC)"
	@echo "  - Assets: $(GREEN)./dist/assets/$(NC)"

# Test using act local environment
test-local: act-check check-local-deps
	@echo "$(BLUE)🧪 Testing using act local environment...$(NC)"
	@echo "$(CYAN)⚡ No Docker required - using host Node.js environment$(NC)"
	@RUN_LOCAL=true npm test
	@echo "$(GREEN)✅ Tests completed successfully!$(NC)"

# Test build workflow using act with local environment
act-build-local: act-check
	@echo "$(PURPLE)🏗️ Testing build workflow with act (local environment)...$(NC)"
	@echo "$(CYAN)⚡ Using local Node.js instead of Docker containers$(NC)"
	@act push $(ACT_LOCAL_FLAGS) --job build --env RUN_LOCAL=true --verbose

# Comprehensive local development workflow  
dev-workflow-local: act-check
	@echo "$(PURPLE)🔄 Running complete development workflow locally...$(NC)"
	@echo "$(CYAN)Phase 1: Installing dependencies$(NC)"
	@$(MAKE) install-local
	@echo "$(CYAN)Phase 2: Building project$(NC)"
	@$(MAKE) build-local
	@echo "$(CYAN)Phase 3: Running tests$(NC)"
	@$(MAKE) test-local
	@echo "$(GREEN)🎉 Complete local workflow finished successfully!$(NC)"

# Compare Docker vs Local performance
benchmark-docker-vs-local: act-check docker-check
	@echo "$(CYAN)⚡ Benchmarking Docker vs Local performance...$(NC)"
	@echo "$(BLUE)Testing Docker build...$(NC)"
	@time $(MAKE) build > /dev/null 2>&1 || echo "$(YELLOW)Docker build failed$(NC)"
	@echo "$(BLUE)Testing Local build...$(NC)"
	@time $(MAKE) build-local > /dev/null 2>&1 || echo "$(YELLOW)Local build failed$(NC)"
	@echo "$(GREEN)✅ Benchmark completed!$(NC)"

# =============================================================================
# 🚀 ARM64 Performance Commands (Mac M1/M2 + GitHub ARM runners)
# =============================================================================

# Test ARM64 performance locally
arm64-test: act-check
	@echo "$(PURPLE)🚀 Testing ARM64 performance with act...$(NC)"
	@echo "$(CYAN)⚡ Simulating GitHub ARM64 runners locally$(NC)"
	@act workflow_dispatch $(ACT_LOCAL_FLAGS) --workflows .github/workflows/arm64-development.yml

# ARM64 staging deployment test
arm64-staging: act-check
	@echo "$(PURPLE)🚀 Testing ARM64 staging deployment...$(NC)"
	@echo "$(CYAN)⚡ Native ARM64 performance simulation$(NC)"
	@act push $(ACT_LOCAL_FLAGS) --workflows .github/workflows/staging-deployment.yml

# ARM64 performance comparison
arm64-benchmark: act-check
	@echo "$(CYAN)📊 ARM64 vs AMD64 Performance Analysis$(NC)"
	@echo "$(BLUE)🏠 Local Mac ARM64 build (native)...$(NC)"
	@time $(MAKE) build-local > /dev/null 2>&1 || echo "$(YELLOW)ARM64 build failed$(NC)"
	@echo "$(BLUE)☁️  GitHub ubuntu-24.04-arm simulation...$(NC)"
	@time $(MAKE) arm64-test > /dev/null 2>&1 || echo "$(YELLOW)CI ARM64 simulation failed$(NC)"
	@echo "$(GREEN)✅ ARM64 benchmark completed!$(NC)"
	@echo "$(CYAN)💡 GitHub ARM64 Benefits:$(NC)"
	@echo "  - 40% performance boost vs previous generation"
	@echo "  - 37% cost savings vs x64 runners"  
	@echo "  - 30-40% less power consumption"
	@echo "  - FREE for public repositories"
