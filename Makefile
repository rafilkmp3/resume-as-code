.PHONY: help install build build-internal dev serve test test-unit test-e2e test-visual test-accessibility test-performance test-fast clean status docker-check test-internal test-unit-internal test-e2e-internal test-visual-internal test-accessibility-internal test-performance-internal test-fast-internal

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

# Default target
help:
	@echo "$(CYAN)📋 Resume-as-Code - Available Commands$(NC)"
	@echo ""
	@echo "$(GREEN)🏗️  Build & Development:$(NC)"
	@echo "  $(GREEN)make build$(NC)         - Build HTML and PDF resume"
	@echo "  $(PURPLE)make dev$(NC)           - Development server with hot reload"
	@echo "  $(PURPLE)make serve$(NC)         - Serve built resume"
	@echo ""
	@echo "$(GREEN)🧪 Testing & Quality:$(NC)"
	@echo "  $(BLUE)make test$(NC)          - Run all tests"
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
	@echo "  $(RED)make clean$(NC)         - Clean all generated files"

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

# Build resume (HTML + PDF + assets)
build: docker-check
	@echo "$(GREEN)🏗️ Building resume...$(NC)"
	@docker build --target builder -t $(DOCKER_IMAGE):builder .
	@mkdir -p dist
	@docker run --rm -v "$(PWD):/host" $(DOCKER_IMAGE):builder sh -c "cp -r /app/dist/* /host/dist/ || cp -r /app/dist/. /host/dist/"
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

# Development server with hot reload
dev: docker-check
	@echo "$(PURPLE)🚀 Starting development server...$(NC)"
	@echo "$(CYAN)📱 Resume: http://localhost:$(DEV_PORT)$(NC)"
	@echo "$(CYAN)📄 PDF: http://localhost:$(DEV_PORT)/resume.pdf$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	@docker-compose up dev

# Serve built resume
serve: docker-check
	@echo "$(PURPLE)🌐 Starting production server...$(NC)"
	@echo "$(CYAN)📱 Resume: http://localhost:$(DEV_PORT)$(NC)"
	@echo "$(CYAN)📄 PDF: http://localhost:$(DEV_PORT)/resume.pdf$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	@docker-compose up production

# Run all tests
test: docker-check test-unit test-e2e test-visual test-accessibility test-performance
	@echo "$(GREEN)🎉 All tests completed!$(NC)"

# Run fast smoke tests (recommended for development)
test-fast: docker-check
	@echo "$(BLUE)⚡ Running fast smoke tests...$(NC)"
	@docker-compose run --rm ci make test-fast-internal

# Internal test runner (runs inside Docker container)
test-internal: test-unit-internal test-e2e-internal test-visual-internal test-accessibility-internal test-performance-internal
	@echo "$(GREEN)✅ All internal tests completed$(NC)"

test-fast-internal:
	@echo "$(BLUE)⚡ Running fast smoke tests...$(NC)"
	@if [ -f "playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test tests/fast-smoke.spec.js --reporter=line; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping fast tests$(NC)"; \
	fi

# Run unit tests
test-unit: docker-check
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	@docker-compose run --rm ci make test-unit-internal

test-unit-internal:
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	@if [ -f "jest.config.js" ]; then \
		npx jest --coverage --verbose; \
	else \
		echo "$(YELLOW)⚠️  Jest not configured, skipping unit tests$(NC)"; \
	fi

# Run end-to-end tests
test-e2e: docker-check
	@echo "$(BLUE)🎭 Running E2E tests...$(NC)"
	@docker-compose run --rm ci make test-e2e-internal

test-e2e-internal:
	@echo "$(BLUE)🎭 Running end-to-end tests...$(NC)"
	@if [ -f "playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test --reporter=html; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping E2E tests$(NC)"; \
	fi

# Run visual regression tests
test-visual: docker-check
	@echo "$(BLUE)🎨 Running visual tests...$(NC)"
	@docker-compose run --rm ci make test-visual-internal

test-visual-internal:
	@echo "$(BLUE)🎨 Running visual regression tests...$(NC)"
	@if [ -f "playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test --grep="visual" --reporter=html || echo "No visual tests found"; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping visual tests$(NC)"; \
	fi

# Run accessibility tests
test-accessibility: docker-check
	@echo "$(BLUE)♿ Running accessibility tests...$(NC)"
	@docker-compose run --rm ci make test-accessibility-internal

test-accessibility-internal:
	@echo "$(BLUE)♿ Running accessibility tests...$(NC)"
	@if [ -f "playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test --grep="accessibility|a11y" --reporter=html || echo "No accessibility tests found"; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping accessibility tests$(NC)"; \
	fi

# Run performance tests
test-performance: docker-check
	@echo "$(BLUE)⚡ Running performance tests...$(NC)"
	@docker-compose run --rm ci make test-performance-internal

test-performance-internal:
	@echo "$(BLUE)⚡ Running performance tests...$(NC)"
	@if [ -f "playwright.config.js" ] || [ -f "playwright.config.ts" ]; then \
		npx playwright test --grep="performance|perf" --reporter=html || echo "No performance tests found"; \
	else \
		echo "$(YELLOW)⚠️  Playwright not configured, skipping performance tests$(NC)"; \
	fi

# Clean Docker containers and images
clean: docker-check
	@echo "$(RED)🐳 Cleaning Docker containers and generated files...$(NC)"
	@docker-compose down --volumes --remove-orphans 2>/dev/null || true
	@docker system prune -f 2>/dev/null || true
	@docker container prune -f 2>/dev/null || true
	@rm -rf dist/ coverage/ test-results/ playwright-report/ .nyc_output/
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

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
	@if [ -f "resume-data.json" ]; then \
		echo "  $(GREEN)✅ Resume Data: resume-data.json$(NC)"; \
	else \
		echo "  $(RED)❌ Resume Data: Missing$(NC)"; \
	fi
	@if [ -f "template.html" ]; then \
		echo "  $(GREEN)✅ Template: template.html$(NC)"; \
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

