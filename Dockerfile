# =============================================================================
# 🐳 UNIFIED MULTI-STAGE DOCKERFILE - Resume as Code
# =============================================================================
# Replaces 5 scattered Dockerfiles with a single, optimized architecture
# Eliminates 346 lines of duplication while maintaining all functionality
# =============================================================================

# =============================================================================
# 🏗️ STAGE 1: GOLDEN BASE - Shared Dependencies & Foundation
# =============================================================================
FROM node:22-slim AS golden-base

# Environment setup (shared across all stages)
ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/opt/playwright

# Install shared system dependencies (defined once, used everywhere)
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core runtime dependencies
    fonts-liberation \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    # Browser support libraries
    libgtk-3-0 \
    libgbm-dev \
    libnss3 \
    libgconf-2-4 \
    libxtst6 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgdk-pixbuf2.0-0 \
    # Development tools
    make \
    git \
    wget \
    curl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && mkdir -p /opt/playwright

WORKDIR /app

# Copy package files and install npm dependencies (stable caching layer)
COPY package*.json Makefile ./
RUN npm ci --ignore-scripts && npm cache clean --force

# Create standardized user (uid=1001 across all stages)
RUN groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser -m appuser && \
    chown -R appuser:appuser /app && \
    chown -R appuser:appuser /home/appuser && \
    chown -R appuser:appuser /opt/playwright

# =============================================================================
# 🚀 STAGE 2: PRODUCTION BUILDER - Optimized for PDF Generation
# =============================================================================
FROM golden-base AS builder

# Build arguments for version tracking
ARG GITHUB_SHA=dev-local
ARG GITHUB_REF_NAME=main
ARG NODE_ENV=production

# Set build environment
ENV GITHUB_SHA=${GITHUB_SHA} \
    GITHUB_REF_NAME=${GITHUB_REF_NAME} \
    NODE_ENV=${NODE_ENV} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Chromium for PDF generation (production requirement)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Copy source code and build (as appuser for security)
COPY --chown=appuser:appuser . .
USER appuser
RUN npm run build

# =============================================================================
# 🌐 STAGE 3: PRODUCTION RUNTIME - Lightweight Production Server
# =============================================================================
FROM node:22-slim AS production

# Runtime environment
ENV NODE_ENV=production \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    dumb-init \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && adduser --disabled-password --gecos '' --uid 1001 appuser

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/package*.json ./
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/scripts ./scripts

USER appuser
EXPOSE 3000

# Health check for production deployment
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "serve"]

# =============================================================================
# 🏭 STAGE 4: DEVELOPMENT - Full Development Environment
# =============================================================================
FROM golden-base AS development

# Development-specific environment
ENV NODE_ENV=development \
    CHOKIDAR_USEPOLLING=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install development browsers and tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    firefox-esr \
    && rm -rf /var/lib/apt/lists/*

# Install development dependencies
RUN npm install && npm cache clean --force

# Copy source code and set up development environment
COPY --chown=appuser:appuser . .
USER appuser

# Install Playwright browsers for development testing
RUN npx playwright install --with-deps chromium firefox webkit

EXPOSE 3000 3001
CMD ["npm", "run", "dev"]

# =============================================================================
# 🧪 STAGE 5: BROWSER TESTING BASE - Shared Browser Test Foundation
# =============================================================================
FROM golden-base AS test-base

# Testing environment setup
ENV NODE_ENV=test \
    CI=true

# Copy source code for testing
COPY --chown=appuser:appuser . .

# Create embedded Hello World test (browser-agnostic)
RUN mkdir -p tests/hello-world && \
    echo 'const { test, expect } = require("@playwright/test");' > tests/hello-world/hello-world.spec.js && \
    echo '' >> tests/hello-world/hello-world.spec.js && \
    echo 'test.describe("Hello World Browser Test", () => {' >> tests/hello-world/hello-world.spec.js && \
    echo '  test("should verify browser functionality", async ({ page, browserName }) => {' >> tests/hello-world/hello-world.spec.js && \
    echo '    console.log(`🧪 Testing ${browserName} browser functionality`);' >> tests/hello-world/hello-world.spec.js && \
    echo '    await page.setContent(`<!DOCTYPE html><html><head><title>Hello World Test</title></head><body><h1 id="greeting">Hello World!</h1><p id="status">Browser is working</p><button id="test-btn">Click me</button><script>document.getElementById("test-btn").onclick = function() { document.getElementById("status").textContent = "Button clicked!"; };</script></body></html>`);' >> tests/hello-world/hello-world.spec.js && \
    echo '    await expect(page.locator("#greeting")).toHaveText("Hello World!");' >> tests/hello-world/hello-world.spec.js && \
    echo '    await page.click("#test-btn");' >> tests/hello-world/hello-world.spec.js && \
    echo '    await expect(page.locator("#status")).toHaveText("Button clicked!");' >> tests/hello-world/hello-world.spec.js && \
    echo '    console.log(`✅ ${browserName} test passed`);' >> tests/hello-world/hello-world.spec.js && \
    echo '  });' >> tests/hello-world/hello-world.spec.js && \
    echo '});' >> tests/hello-world/hello-world.spec.js

USER appuser

# =============================================================================
# 🌐 STAGE 6: CHROMIUM TESTING - Specialized Chrome/Chromium Environment
# =============================================================================
FROM test-base AS chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Chromium and dependencies
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    chromium \
    && sudo rm -rf /var/lib/apt/lists/*

# Install Playwright Chromium
RUN npx playwright install chromium && \
    npx playwright install-deps chromium

CMD ["npx", "playwright", "test", "tests/hello-world/hello-world.spec.js", "--project=chromium"]

# =============================================================================
# 🦊 STAGE 7: FIREFOX TESTING - Specialized Firefox Environment
# =============================================================================
FROM test-base AS firefox

# Install Firefox and dependencies
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    firefox-esr \
    libdbus-glib-1-2 \
    && sudo rm -rf /var/lib/apt/lists/*

# Install Playwright Firefox
RUN npx playwright install firefox && \
    npx playwright install-deps firefox

CMD ["npx", "playwright", "test", "tests/hello-world/hello-world.spec.js", "--project=firefox"]

# =============================================================================
# 🍎 STAGE 8: WEBKIT TESTING - Specialized Safari/WebKit Environment
# =============================================================================
FROM test-base AS webkit

# Install WebKit-specific dependencies
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    libopus0 \
    libwebp7 \
    libenchant-2-2 \
    libgudev-1.0-0 \
    libsecret-1-0 \
    libhyphen0 \
    libegl1 \
    libnotify4 \
    libxslt1.1 \
    libevent-2.1-7 \
    libgles2-mesa \
    && sudo rm -rf /var/lib/apt/lists/*

# Install Playwright WebKit
RUN npx playwright install webkit && \
    npx playwright install-deps webkit

CMD ["npx", "playwright", "test", "tests/hello-world/hello-world.spec.js", "--project=webkit"]

# =============================================================================
# 🧪 STAGE 9: CI TESTING - Complete Testing Environment
# =============================================================================
FROM test-base AS ci

# Install all browsers for comprehensive testing
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    chromium \
    firefox-esr \
    libdbus-glib-1-2 \
    libopus0 \
    libwebp7 \
    && sudo rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install all Playwright browsers
RUN npx playwright install --with-deps chromium firefox webkit

CMD ["make", "test"]

# =============================================================================
# 📦 DEFAULT STAGE: PRODUCTION (for docker build without --target)
# =============================================================================
# When no --target is specified, build production-ready container
FROM production
