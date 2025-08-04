.PHONY: help install build dev serve test test-unit test-e2e test-visual test-accessibility test-performance clean status docker-dev docker-prod docker-build docker-clean verify-tools

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

# Default target
help:
	@echo "$(CYAN)📋 Resume-as-Code - Available Commands$(NC)"
	@echo ""
	@echo "$(GREEN)🔧 Setup & Dependencies:$(NC)"
	@echo "  $(CYAN)make install$(NC)        - Install all dependencies"
	@echo "  $(CYAN)make verify-tools$(NC)   - Verify required tools are installed"
	@echo ""
	@echo "$(GREEN)🏗️  Build & Development:$(NC)"
	@echo "  $(GREEN)make build$(NC)         - Build HTML and PDF resume"
	@echo "  $(PURPLE)make dev$(NC)           - Hot reload development server (port $(DEV_PORT))"
	@echo "  $(PURPLE)make serve$(NC)         - Serve built resume (port $(DEV_PORT))"
	@echo ""
	@echo "$(GREEN)🧪 Testing & Quality:$(NC)"
	@echo "  $(BLUE)make test$(NC)          - Run all tests (unit + e2e + visual + accessibility)"
	@echo "  $(BLUE)make test-unit$(NC)     - Run unit tests with coverage"
	@echo "  $(BLUE)make test-e2e$(NC)      - Run end-to-end tests"
	@echo "  $(BLUE)make test-visual$(NC)   - Run visual regression tests"
	@echo "  $(BLUE)make test-accessibility$(NC) - Run accessibility tests"
	@echo "  $(BLUE)make test-performance$(NC) - Run performance tests"
	@echo ""
	@echo "$(GREEN)🐳 Docker Development:$(NC)"
	@echo "  $(PURPLE)make docker-dev$(NC)    - Run development server in Docker"
	@echo "  $(PURPLE)make docker-prod$(NC)   - Run production server in Docker"
	@echo "  $(CYAN)make docker-build$(NC)   - Build Docker images"
	@echo "  $(RED)make docker-clean$(NC)   - Clean Docker containers and images"
	@echo ""
	@echo "$(GREEN)🛠️  Utilities:$(NC)"
	@echo "  $(CYAN)make status$(NC)         - Show project status and health check"
	@echo "  $(RED)make clean$(NC)         - Clean all generated files"

# Install dependencies
install: verify-tools
	@echo "$(GREEN)📦 Installing Node.js dependencies...$(NC)"
	@npm ci
	@echo "$(GREEN)🎭 Installing Playwright browsers...$(NC)"
	@npx playwright install --with-deps chromium
	@echo "$(GREEN)✅ All dependencies installed successfully!$(NC)"

# Verify required tools are available
verify-tools:
	@echo "$(CYAN)🔍 Verifying required tools...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js is required but not installed$(NC)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)❌ npm is required but not installed$(NC)"; exit 1; }
	@command -v docker >/dev/null 2>&1 || echo "$(YELLOW)⚠️  Docker is not installed (optional for Docker targets)$(NC)"
	@echo "$(GREEN)✅ Required tools verified$(NC)"

# Build resume (HTML + PDF + assets)
build:
	@echo "$(GREEN)🏗️  Building resume...$(NC)"
	@npm run build
	@echo "$(GREEN)✅ Build completed successfully!$(NC)"
	@echo "$(CYAN)📁 Output files:$(NC)"
	@echo "  - HTML: $(GREEN)./dist/index.html$(NC)"
	@echo "  - PDF:  $(GREEN)./dist/resume.pdf$(NC)"
	@echo "  - Assets: $(GREEN)./dist/assets/$(NC)"

# Development server with hot reload
dev:
	@echo "$(PURPLE)🚀 Starting development server...$(NC)"
	@echo "$(CYAN)📱 Resume: http://localhost:$(DEV_PORT)$(NC)"
	@echo "$(CYAN)📄 PDF: http://localhost:$(DEV_PORT)/resume.pdf$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	@npm run dev

# Serve built resume
serve: build
	@echo "$(PURPLE)🌐 Starting static server...$(NC)"
	@echo "$(CYAN)📱 Resume: http://localhost:$(DEV_PORT)$(NC)"
	@echo "$(CYAN)📄 PDF: http://localhost:$(DEV_PORT)/resume.pdf$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	@npm run serve

# Run all tests
test: test-unit test-e2e test-visual test-accessibility test-performance
	@echo "$(GREEN)🎉 All tests completed!$(NC)"

# Run unit tests
test-unit:
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	@if [ -f "jest.config.js" ]; then \
		npx jest --coverage --verbose; \
	else \
		echo "$(YELLOW)⚠️  Jest not configured, skipping unit tests$(NC)"; \
	fi

# Run end-to-end tests
test-e2e: build
	@echo "$(BLUE)🎭 Running end-to-end tests...$(NC)"
	@timeout 60s npm run serve:test > /dev/null 2>&1 & \
	SERVER_PID=$$!; \
	sleep 3; \
	npx playwright test tests/dark-mode.spec.js tests/layout-analysis.spec.js tests/mobile-layout.spec.js --reporter=dot || TEST_FAILED=1; \
	kill $$SERVER_PID 2>/dev/null || true; \
	[ -z "$$TEST_FAILED" ] || { echo "$(RED)❌ E2E tests failed$(NC)"; exit 1; }
	@echo "$(GREEN)✅ E2E tests passed$(NC)"

# Run visual regression tests
test-visual: build
	@echo "$(BLUE)🎨 Running visual regression tests...$(NC)"
	@timeout 60s npm run serve:test > /dev/null 2>&1 & \
	SERVER_PID=$$!; \
	sleep 3; \
	npx playwright test tests/visual-regression.spec.js --reporter=dot || TEST_FAILED=1; \
	kill $$SERVER_PID 2>/dev/null || true; \
	[ -z "$$TEST_FAILED" ] || { echo "$(RED)❌ Visual tests failed$(NC)"; exit 1; }
	@echo "$(GREEN)✅ Visual regression tests passed$(NC)"

# Run accessibility tests
test-accessibility: build
	@echo "$(BLUE)♿ Running accessibility tests...$(NC)"
	@timeout 60s npm run serve:test > /dev/null 2>&1 & \
	SERVER_PID=$$!; \
	sleep 3; \
	npx playwright test tests/accessibility.spec.js --reporter=dot || TEST_FAILED=1; \
	kill $$SERVER_PID 2>/dev/null || true; \
	[ -z "$$TEST_FAILED" ] || { echo "$(RED)❌ Accessibility tests failed$(NC)"; exit 1; }
	@echo "$(GREEN)✅ Accessibility tests passed$(NC)"

# Run performance tests
test-performance: build
	@echo "$(BLUE)⚡ Running performance tests...$(NC)"
	@timeout 60s npm run serve:test > /dev/null 2>&1 & \
	SERVER_PID=$$!; \
	sleep 3; \
	npx playwright test tests/performance.spec.js --reporter=dot || TEST_FAILED=1; \
	kill $$SERVER_PID 2>/dev/null || true; \
	[ -z "$$TEST_FAILED" ] || { echo "$(RED)❌ Performance tests failed$(NC)"; exit 1; }
	@echo "$(GREEN)✅ Performance tests passed$(NC)"

# Docker development server
docker-dev:
	@echo "$(PURPLE)🐳 Starting Docker development server...$(NC)"
	@docker-compose up --build dev

# Docker production server
docker-prod:
	@echo "$(PURPLE)🐳 Starting Docker production server...$(NC)"
	@docker-compose up --build production

# Build Docker images
docker-build:
	@echo "$(CYAN)🐳 Building Docker images...$(NC)"
	@docker-compose build
	@echo "$(GREEN)✅ Docker images built successfully$(NC)"

# Clean Docker containers and images
docker-clean:
	@echo "$(RED)🐳 Cleaning Docker containers and images...$(NC)"
	@docker-compose down --volumes --remove-orphans 2>/dev/null || true
	@docker system prune -f 2>/dev/null || true
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
	@echo "$(GREEN)🔧 Environment:$(NC)"
	@if command -v node >/dev/null 2>&1; then \
		VERSION=$$(node --version); \
		echo "  $(GREEN)✅ Node.js: $$VERSION$(NC)"; \
	else \
		echo "  $(RED)❌ Node.js: Not installed$(NC)"; \
	fi
	@if command -v npm >/dev/null 2>&1; then \
		VERSION=$$(npm --version); \
		echo "  $(GREEN)✅ npm: $$VERSION$(NC)"; \
	else \
		echo "  $(RED)❌ npm: Not installed$(NC)"; \
	fi
	@if command -v docker >/dev/null 2>&1; then \
		VERSION=$$(docker --version | cut -d' ' -f3 | cut -d',' -f1); \
		echo "  $(GREEN)✅ Docker: $$VERSION$(NC)"; \
	else \
		echo "  $(YELLOW)⚠️  Docker: Not installed$(NC)"; \
	fi
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

# Clean all generated files
clean:
	@echo "$(RED)🧹 Cleaning generated files...$(NC)"
	@rm -rf dist/ coverage/ test-results/ playwright-report/ .nyc_output/
	@echo "$(GREEN)✅ Cleanup completed$(NC)"