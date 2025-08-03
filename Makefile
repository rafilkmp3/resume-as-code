.PHONY: help build dev serve clean install test test-dev test-fast test-pdf test-focused kill-port status

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m 
BLUE=\033[0;34m
PURPLE=\033[0;35m
CYAN=\033[0;36m
NC=\033[0m # No Color

# Default target
help:
	@echo "📋 Resume-as-Code Development Commands:"
	@echo ""
	@echo "🔥 Core Development:"
	@echo "  $(GREEN)make install$(NC)      - Install dependencies"
	@echo "  $(PURPLE)make dev$(NC)          - Start development server"
	@echo "  $(GREEN)make build$(NC)        - Build for production"
	@echo "  $(BLUE)make serve$(NC)         - Serve built application"
	@echo "  $(RED)make clean$(NC)         - Clean build directory"
	@echo ""
	@echo "🧪 Fast Testing (Fail-Fast Development):"
	@echo "  $(GREEN)make test-fast$(NC)    - Quick PWA tests (build + focused tests)"
	@echo "  $(BLUE)make test-focused$(NC)  - Run only PWA tests (fast)"
	@echo "  $(PURPLE)make test-pdf$(NC)     - Test PDF generation"
	@echo "  $(CYAN)make test-dev$(NC)      - All dev tests with 10 cores"
	@echo "  $(YELLOW)make test$(NC)         - Full test suite"
	@echo ""
	@echo "🛠️  Utilities:"
	@echo "  $(YELLOW)make kill-port$(NC)    - Kill processes on port 3000"
	@echo "  $(CYAN)make status$(NC)        - Show project status"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Build everything (Next.js)
build:
	@echo "🏗️  Building resume with Next.js..."
	npm run build

# Development server
dev: kill-port
	@echo "$(PURPLE)🚀 Starting Next.js development server...$(NC)"
	@echo "$(CYAN)📱 Resume available at: http://localhost:3000$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	npm run dev

# Serve built application
serve: kill-port
	@echo "$(BLUE)🌐 Starting server...$(NC)"
	@echo "$(CYAN)📱 Resume available at: http://localhost:3000$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	npm run serve

# Fast Testing Commands
test-fast:
	@echo "$(GREEN)🧪 Running fast PWA tests...$(NC)"
	npm run test:fast

test-focused:
	@echo "$(BLUE)🎯 Running focused PWA tests...$(NC)"
	npm run test:focused

test-pdf:
	@echo "$(PURPLE)📄 Testing PDF generation...$(NC)"
	npm run test:pdf

test-dev:
	@echo "$(CYAN)🚀 Running all development tests...$(NC)"
	npm run test:dev

test: build
	@echo "$(YELLOW)🧪 Running full test suite...$(NC)"
	npm run test

# Smart port cleanup for dev (only if not npm run dev)
kill-port:
	@echo "$(YELLOW)🔍 Checking for non-dev processes on port 3000...$(NC)"
	@if lsof -ti:3000 >/dev/null 2>&1; then \
		PROCESS_CMD=$$(ps -p $$(lsof -ti:3000) -o command= 2>/dev/null || echo ""); \
		if echo "$$PROCESS_CMD" | grep -q "npm run dev\|nodemon\|node.*dev"; then \
			echo "$(CYAN)ℹ️  Dev server already running on port 3000 - keeping alive$(NC)"; \
		else \
			echo "$(RED)💀 Killing non-dev process on port 3000...$(NC)"; \
			kill -9 $$(lsof -ti:3000) 2>/dev/null || true; \
			sleep 1; \
			echo "$(GREEN)✅ Port 3000 is now free$(NC)"; \
		fi; \
	else \
		echo "$(GREEN)✅ Port 3000 is already free$(NC)"; \
	fi

# Clean dist directory
clean:
	@echo "$(RED)🧹 Cleaning dist directory...$(NC)"
	rm -rf dist/
	@echo "$(GREEN)✅ Clean complete$(NC)"

# Show project status
status:
	@echo "$(CYAN)📊 Resume Project Status$(NC)"
	@echo "$(CYAN)========================$(NC)"
	@if [ -f "dist/index.html" ]; then \
		SIZE=$$(ls -lh dist/index.html | awk '{print $$5}'); \
		echo "$(GREEN)✅ HTML: dist/index.html ($$SIZE)$(NC)"; \
	else \
		echo "$(RED)❌ HTML: Missing$(NC)"; \
	fi
	@if [ -f "resume-data.json" ]; then \
		echo "$(GREEN)✅ Data: resume-data.json$(NC)"; \
	else \
		echo "$(RED)❌ Data: Missing$(NC)"; \
	fi
	@echo "$(CYAN)========================$(NC)"
	@if lsof -ti:3000 >/dev/null 2>&1; then \
		PID=$$(lsof -ti:3000); \
		echo "$(YELLOW)🟡 Port 3000: Occupied (PID: $$PID)$(NC)"; \
	else \
		echo "$(GREEN)✅ Port 3000: Available$(NC)"; \
	fi
	@if command -v node >/dev/null 2>&1; then \
		VERSION=$$(node --version); \
		echo "$(GREEN)✅ Node.js: $$VERSION$(NC)"; \
	else \
		echo "$(RED)❌ Node.js: Not installed$(NC)"; \
	fi