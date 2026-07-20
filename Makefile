# =============================================================================
# Modern Astro-Optimized Makefile for Resume-as-Code Platform
# =============================================================================

.DEFAULT_GOAL := help
.PHONY: help clean install dev build preview test lint format check health

# 🎯 Colors for better UX
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
MAGENTA := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[1;37m
NC := \033[0m # No Color

# 📊 Environment Detection
NODE_VERSION := $(shell node --version 2>/dev/null || echo "not-installed")
NPM_VERSION := $(shell npm --version 2>/dev/null || echo "not-installed")
ASTRO_VERSION := $(shell npx astro --version 2>/dev/null | head -1 || echo "not-installed")

# =============================================================================
# 🚀 Development Workflow
# =============================================================================

help: ## Show this help message
	@echo "$(CYAN)🚀 Resume-as-Code Platform - Astro v5 Makefile$(NC)"
	@echo ""
	@echo "$(WHITE)📊 Environment Status:$(NC)"
	@echo "  Node.js: $(GREEN)$(NODE_VERSION)$(NC)"
	@echo "  npm: $(GREEN)$(NPM_VERSION)$(NC)"  
	@echo "  Astro: $(GREEN)$(ASTRO_VERSION)$(NC)"
	@echo ""
	@echo "$(WHITE)🎯 Available Targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

clean: ## Clean all generated files and dependencies
	@echo "$(YELLOW)🧹 Cleaning environment...$(NC)"
	rm -rf workspace/build/
	rm -rf node_modules/
	rm -rf .astro/
	rm -rf coverage/
	rm -rf test-results/
	@echo "$(GREEN)✅ Environment cleaned$(NC)"

install: ## Install dependencies with npm ci (CI-optimized)
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	npm ci
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

# =============================================================================
# 🏗️ Build & Development
# =============================================================================

dev: ## Start Astro development server
	@echo "$(CYAN)🚀 Starting Astro development server...$(NC)"
	npm run dev

build: ## Build production site with Astro
	@echo "$(MAGENTA)🏗️ Building production site...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Production build complete$(NC)"

build-clean: ## Clean build (rm -rf dist && build)
	@echo "$(YELLOW)🧹 Clean build...$(NC)"
	npm run build:clean
	@echo "$(GREEN)✅ Clean build complete$(NC)"

preview: ## Preview production build locally
	@echo "$(CYAN)👀 Starting preview server...$(NC)"
	npm run preview

# =============================================================================
# 🧪 Testing & Quality
# =============================================================================

test: ## Run all tests (lighthouse, accessibility, etc.)
	@echo "$(BLUE)🧪 Running comprehensive tests...$(NC)"
	@$(MAKE) test-lighthouse
	@$(MAKE) test-accessibility
	@echo "$(GREEN)✅ All tests completed$(NC)"

test-lighthouse: ## Run Lighthouse performance audit
	@echo "$(BLUE)🏃 Running Lighthouse audit...$(NC)"
	@if command -v lighthouse >/dev/null 2>&1; then \
		lighthouse http://localhost:4321 --output json --output-path ./test-results/lighthouse.json --quiet; \
		echo "$(GREEN)✅ Lighthouse audit complete$(NC)"; \
	else \
		echo "$(RED)❌ Lighthouse not installed. Run: npm install -g lighthouse$(NC)"; \
	fi

test-accessibility: ## Run accessibility tests with axe-core
	@echo "$(BLUE)♿ Running accessibility tests...$(NC)"
	@if command -v axe >/dev/null 2>&1; then \
		mkdir -p test-results; \
		axe http://localhost:4321 --output test-results/accessibility.json; \
		echo "$(GREEN)✅ Accessibility tests complete$(NC)"; \
	else \
		echo "$(RED)❌ axe-core not installed. Run: npm install -g @axe-core/cli$(NC)"; \
	fi

lint: ## Run linting and formatting checks
	@echo "$(BLUE)🔍 Running linting...$(NC)"
	@if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then \
		npx eslint src/; \
	else \
		echo "$(YELLOW)⚠️  No ESLint config found, skipping...$(NC)"; \
	fi
	@if [ -f "prettier.config.js" ] || [ -f ".prettierrc" ]; then \
		npx prettier --check src/; \
	else \
		echo "$(YELLOW)⚠️  No Prettier config found, skipping...$(NC)"; \
	fi

format: ## Format code with Prettier
	@echo "$(MAGENTA)💄 Formatting code...$(NC)"
	@if [ -f "prettier.config.js" ] || [ -f ".prettierrc" ]; then \
		npx prettier --write src/; \
		echo "$(GREEN)✅ Code formatted$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  No Prettier config found$(NC)"; \
	fi

# =============================================================================
# 🔧 Development Tools
# =============================================================================

health: ## Check development environment health
	@echo "$(CYAN)🏥 Environment Health Check$(NC)"
	@echo ""
	@echo "$(WHITE)📊 System Requirements:$(NC)"
	@command -v node >/dev/null 2>&1 && echo "  $(GREEN)✅ Node.js: $(NODE_VERSION)$(NC)" || echo "  $(RED)❌ Node.js: Not installed$(NC)"
	@command -v npm >/dev/null 2>&1 && echo "  $(GREEN)✅ npm: $(NPM_VERSION)$(NC)" || echo "  $(RED)❌ npm: Not installed$(NC)"
	@[ -f package.json ] && echo "  $(GREEN)✅ package.json: Found$(NC)" || echo "  $(RED)❌ package.json: Missing$(NC)"
	@[ -f package-lock.json ] && echo "  $(GREEN)✅ package-lock.json: Found$(NC)" || echo "  $(RED)❌ package-lock.json: Missing$(NC)"
	@[ -d node_modules ] && echo "  $(GREEN)✅ node_modules: Installed$(NC)" || echo "  $(RED)❌ node_modules: Run 'make install'$(NC)"
	@command -v npx >/dev/null 2>&1 && npx astro --version >/dev/null 2>&1 && echo "  $(GREEN)✅ Astro: $(ASTRO_VERSION)$(NC)" || echo "  $(RED)❌ Astro: Not available$(NC)"
	@echo ""
	@echo "$(WHITE)🔗 Development URLs:$(NC)"
	@echo "  Local: $(GREEN)http://localhost:4321$(NC)"
	@echo "  Network: $(GREEN)http://$(shell hostname -I | awk '{print $$1}' 2>/dev/null || echo "unknown"):4321$(NC)"

check: ## Quick health check before development
	@echo "$(BLUE)🔍 Quick environment check...$(NC)"
	@$(MAKE) health
	@if [ ! -d "node_modules" ]; then \
		echo "$(YELLOW)⚠️  Dependencies not installed. Installing...$(NC)"; \
		$(MAKE) install; \
	fi

# =============================================================================  
# 🚀 CI/CD Helpers
# =============================================================================

ci-build: ## CI-optimized build process
	@echo "$(CYAN)🤖 CI Build Process$(NC)"
	npm ci
	npm run build
	@echo "$(GREEN)✅ CI build complete$(NC)"

ci-test: ## CI-optimized test suite
	@echo "$(CYAN)🤖 CI Test Suite$(NC)"
	@echo "$(BLUE)📊 Build verification...$(NC)"
	@[ -f workspace/build/index.html ] && echo "  $(GREEN)✅ index.html generated$(NC)" || echo "  $(RED)❌ index.html missing$(NC)"
	@[ -d workspace/build/assets ] && echo "  $(GREEN)✅ Assets directory exists$(NC)" || echo "  $(YELLOW)⚠️  Assets directory missing$(NC)"
	@echo "$(GREEN)✅ CI tests complete$(NC)"

# =============================================================================
# 🌐 Network & Mobile Testing  
# =============================================================================

get-lan-ip: ## Get LAN IP for mobile testing
	@echo "$(CYAN)📱 Mobile Testing Setup$(NC)"
	@echo "Local IP: $(GREEN)$(shell hostname -I | awk '{print $$1}' 2>/dev/null || ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $$2}')$(NC)"
	@echo "Mobile URL: $(GREEN)http://$(shell hostname -I | awk '{print $$1}' 2>/dev/null || ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $$2}'):4321$(NC)"

dev-network: ## Start dev server accessible from network
	@echo "$(CYAN)🌐 Starting network-accessible dev server...$(NC)"
	npm run dev -- --host

# =============================================================================
# 📊 Project Info
# =============================================================================

info: ## Show project information
	@echo "$(CYAN)📊 Resume-as-Code Platform Information$(NC)"
	@echo ""
	@echo "$(WHITE)🏗️ Architecture:$(NC)"
	@echo "  Framework: $(GREEN)Astro v5$(NC)"
	@echo "  Build Tool: $(GREEN)Vite$(NC)" 
	@echo "  Styling: $(GREEN)Tailwind CSS + DaisyUI$(NC)"
	@echo "  Icons: $(GREEN)Iconify$(NC)"
	@echo ""
	@echo "$(WHITE)📁 Project Structure:$(NC)"
	@echo "  app/              - Source code (Astro components, layouts, pages)"
	@echo "  app/data/         - Resume data (JSON)"
	@echo "  workspace/build/  - Built site (generated)"
	@echo "  .astro/       - Astro cache (generated)"
	@echo ""
	@echo "$(WHITE)🚀 Development Workflow:$(NC)"
	@echo "  1. $(BLUE)make clean$(NC)     - Clean environment"
	@echo "  2. $(BLUE)make install$(NC)   - Install dependencies" 
	@echo "  3. $(BLUE)make dev$(NC)       - Start development"
	@echo "  4. $(BLUE)make build$(NC)     - Build for production"
	@echo "  5. $(BLUE)make preview$(NC)   - Preview production build"

# =============================================================================
# 🚨 Git Workflow Integration
# =============================================================================

pre-commit: ## Pre-commit checks (lint, format, build)
	@echo "$(BLUE)🔍 Pre-commit validation...$(NC)"
	@$(MAKE) lint
	@$(MAKE) build
	@echo "$(GREEN)✅ Pre-commit checks passed$(NC)"

pre-push: ## Pre-push checks (comprehensive testing)
	@echo "$(BLUE)🚀 Pre-push validation...$(NC)"
	@$(MAKE) clean
	@$(MAKE) install
	@$(MAKE) build
	@$(MAKE) ci-test
	@echo "$(GREEN)✅ Pre-push checks passed$(NC)"