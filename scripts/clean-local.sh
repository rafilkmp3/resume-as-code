#!/bin/bash

# Clean Local Environment Script
# Mirrors GitHub Actions runner clean state for local development
# Based on industry standards for CI/CD environment parity

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧹 Cleaning Local Environment (CI/CD Parity)${NC}"
echo -e "${CYAN}==============================================${NC}"

# Function to safely remove directories/files
safe_remove() {
    local path="$1"
    local description="$2"

    if [ -e "$path" ]; then
        echo -e "${YELLOW}🗑️  Removing: $description${NC}"
        rm -rf "$path"
        echo -e "${GREEN}   ✅ Removed: $path${NC}"
    else
        echo -e "${BLUE}   ⏭️  Skip: $path (not found)${NC}"
    fi
}

# Function to stop and remove Docker containers
docker_cleanup() {
    echo -e "${CYAN}🐳 Docker Cleanup${NC}"

    # Stop and remove containers (non-blocking)
    if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
        echo -e "${YELLOW}🛑 Stopping Docker containers...${NC}"
        docker-compose down --volumes --remove-orphans 2>/dev/null || true

        echo -e "${YELLOW}🧹 Pruning Docker containers...${NC}"
        docker container prune -f 2>/dev/null || true

        echo -e "${YELLOW}🧹 Pruning Docker system...${NC}"
        docker system prune -f 2>/dev/null || true

        echo -e "${GREEN}   ✅ Docker cleanup completed${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Docker not available - skipping Docker cleanup${NC}"
    fi
}

# Build artifacts and outputs (mirrors .gitignore)
echo -e "${CYAN}🏗️  Build Artifacts${NC}"
safe_remove "dist/" "Build output directory"
safe_remove "build/" "Alternative build directory"
safe_remove "out/" "Output directory"
safe_remove "temp/" "Temporary files"
safe_remove "*.pdf" "Generated PDF files"

# Test artifacts and reports
echo -e "${CYAN}🧪 Test Artifacts${NC}"
safe_remove "test-results/" "Playwright test results"
safe_remove "test-reports/" "Test reports"
safe_remove "playwright-report/" "Playwright HTML reports"
safe_remove "playwright/.cache/" "Playwright cache"
safe_remove "coverage/" "Jest coverage reports"
safe_remove ".nyc_output/" "NYC coverage output"
safe_remove "jest_*.json" "Jest cache files"

# Node.js artifacts
echo -e "${CYAN}📦 Node.js Artifacts${NC}"
safe_remove ".npm/" "NPM cache"
safe_remove ".cache/" "General cache directory"
safe_remove ".parcel-cache/" "Parcel cache"
safe_remove "*.tsbuildinfo" "TypeScript build info"
safe_remove ".eslintcache" "ESLint cache"
safe_remove ".stylelintcache" "Stylelint cache"

# Logs and debugging
echo -e "${CYAN}📋 Logs and Debug Files${NC}"
safe_remove "logs/" "Log directory"
safe_remove "*.log" "Log files"
safe_remove "npm-debug.log*" "NPM debug logs"
safe_remove "yarn-debug.log*" "Yarn debug logs"
safe_remove "yarn-error.log*" "Yarn error logs"
safe_remove "lerna-debug.log*" "Lerna debug logs"

# Performance and monitoring
echo -e "${CYAN}⚡ Performance Artifacts${NC}"
safe_remove "lighthouse-reports/" "Lighthouse reports"
safe_remove "*.lighthouse.json" "Lighthouse JSON reports"

# System files (especially important for macOS)
echo -e "${CYAN}🖥️  System Files${NC}"
safe_remove ".DS_Store" "macOS system files"
safe_remove ".DS_Store?" "macOS system files (alternative)"
safe_remove "._*" "macOS resource forks"
safe_remove ".Spotlight-V100" "macOS Spotlight"
safe_remove ".Trashes" "macOS trash"
safe_remove "ehthumbs.db" "Windows thumbnails"
safe_remove "Thumbs.db" "Windows thumbnails"

# Backup and temporary files
echo -e "${CYAN}💾 Backup Files${NC}"
safe_remove "*.backup" "Backup files"
safe_remove "*.bak" "Backup files"
safe_remove "*.orig" "Original files"
safe_remove "*.tmp" "Temporary files"

# Docker cleanup
docker_cleanup

# Reset file permissions (important for cross-platform compatibility)
echo -e "${CYAN}🔒 File Permissions${NC}"
if [ -d "scripts/" ]; then
    echo -e "${YELLOW}🔧 Fixing script permissions...${NC}"
    chmod +x scripts/*.sh 2>/dev/null || chmod +x scripts/*.js 2>/dev/null || true
    echo -e "${GREEN}   ✅ Script permissions updated${NC}"
fi

# Git cleanup (optional but recommended)
echo -e "${CYAN}📝 Git Cleanup${NC}"
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔧 Git cleanup...${NC}"
    git clean -fd 2>/dev/null || true
    git gc --auto 2>/dev/null || true
    echo -e "${GREEN}   ✅ Git cleanup completed${NC}"
else
    echo -e "${BLUE}   ⏭️  Not a git repository - skipping git cleanup${NC}"
fi

echo -e "${GREEN}🎉 Local Environment Cleaned Successfully!${NC}"
echo -e "${CYAN}Environment now matches fresh GitHub Actions runner${NC}"
echo -e "${YELLOW}💡 Next steps: run 'make status' to verify clean state${NC}"
