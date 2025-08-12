# =============================================================================
# 🐳 UNIFIED MULTI-STAGE DOCKERFILE - Resume as Code
# =============================================================================
# Replaces 5 scattered Dockerfiles with a single, optimized architecture
# Eliminates 346 lines of duplication while maintaining all functionality
# =============================================================================

# =============================================================================
# 🏗️ STAGE 1: GOLDEN BASE - Shared Dependencies & Foundation
# =============================================================================
# Phase 2A: Multi-architecture optimization with build platform awareness
FROM --platform=$BUILDPLATFORM node:24-slim AS golden-base

# Phase 2A: Build arguments for advanced caching strategies
ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETARCH

# Environment setup (shared across all stages)
ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/opt/playwright \
    TARGETPLATFORM=${TARGETPLATFORM} \
    TARGETARCH=${TARGETARCH}

# Phase 2A Optimization: Multi-layer caching strategy for better cache hit rates
# Layer 1: Package repository update (changes least frequently)
RUN apt-get update

# Layer 2: Core runtime dependencies (stable, rarely changes)
RUN apt-get install -y --no-install-recommends \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2

# Layer 3: Browser support libraries (moderate change frequency)
RUN apt-get install -y --no-install-recommends \
    libgtk-3-0 \
    libgbm-dev \
    libnss3 \
    libgconf-2-4 \
    libxtst6 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgdk-pixbuf2.0-0

# Layer 4: Development tools and Canvas dependencies (changes most frequently)
RUN apt-get install -y --no-install-recommends \
    make \
    git \
    wget \
    curl \
    dumb-init \
    # Canvas dependencies for image optimization
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config

# Layer 5: Cleanup and final setup (always last)
RUN rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && mkdir -p /opt/playwright

WORKDIR /app

# Phase 2A: Optimized npm caching strategy
# Layer 6: Copy only package files first (most stable layer)
COPY package*.json ./

# Layer 7: Install npm dependencies with BuildKit cache mount optimization
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts && npm cache clean --force

# Layer 8: Copy Makefile separately (changes more frequently than packages)
COPY Makefile ./

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
ARG APP_VERSION=dev
ARG COMMITS_SINCE_RELEASE=0
ARG LAST_RELEASE_TAG=none
ARG GITHUB_PAGES=false
ARG NETLIFY=false
ARG NETLIFY_ENV=
ARG CONTEXT=development
ARG DEPLOY_URL=http://localhost:3000

# Set build environment
ENV GITHUB_SHA=${GITHUB_SHA} \
    GITHUB_REF_NAME=${GITHUB_REF_NAME} \
    APP_VERSION=${APP_VERSION} \
    COMMITS_SINCE_RELEASE=${COMMITS_SINCE_RELEASE} \
    LAST_RELEASE_TAG=${LAST_RELEASE_TAG} \
    GITHUB_PAGES=${GITHUB_PAGES} \
    NETLIFY=${NETLIFY} \
    NETLIFY_ENV=${NETLIFY_ENV} \
    CONTEXT=${CONTEXT} \
    DEPLOY_URL=${DEPLOY_URL} \
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

# Build application (profile images will now work with Git LFS)

RUN npm run build

# =============================================================================
# 🌐 STAGE 3: PRODUCTION RUNTIME - Lightweight Production Server
# =============================================================================
FROM node:24-slim AS production

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

# Copy source code first to ensure package.json is current
COPY --chown=appuser:appuser . .

# Install all dependencies including devDependencies for development
RUN --mount=type=cache,target=/root/.npm \
    npm ci && npm cache clean --force

# Install Playwright browsers as root (needs system dependencies)
RUN npx playwright install --with-deps chromium firefox webkit

# Create dist directory with proper permissions
RUN mkdir -p /app/dist && chown -R appuser:appuser /app/dist

# Switch to appuser for running the development server
USER appuser

EXPOSE 3000 3001
CMD ["npm", "run", "dev"]

# =============================================================================
# 🧪 STAGE 5: BROWSER TESTING BASE - Shared Browser Test Foundation
# =============================================================================
FROM golden-base AS test-base

# Testing environment setup
ENV NODE_ENV=test \
    CI=true

# Install development dependencies for testing
RUN --mount=type=cache,target=/root/.npm \
    npm ci && npm cache clean --force

# Copy source code for testing, preserving npm dependencies from golden-base
COPY --chown=appuser:appuser assets/ ./assets/
COPY --chown=appuser:appuser tests/ ./tests/
COPY --chown=appuser:appuser scripts/ ./scripts/
COPY --chown=appuser:appuser config/ ./config/
COPY --chown=appuser:appuser templates/ ./templates/
COPY --chown=appuser:appuser *.json *.js ./

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

# Install Chromium and dependencies as root
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright dependencies as root, then browsers as appuser
RUN npx playwright install-deps chromium

USER appuser
RUN npx playwright install chromium

CMD ["npx", "playwright", "test", "tests/hello-world/hello-world.spec.js", "--project=chromium"]

# =============================================================================
# 🦊 STAGE 7: FIREFOX TESTING - Specialized Firefox Environment
# =============================================================================
FROM test-base AS firefox

# Install Firefox and dependencies as root
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    firefox-esr \
    libdbus-glib-1-2 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright dependencies as root, then browsers as appuser
RUN npx playwright install-deps firefox

USER appuser
RUN npx playwright install firefox

CMD ["npx", "playwright", "test", "tests/hello-world/hello-world.spec.js", "--project=firefox"]

# =============================================================================
# 🍎 STAGE 8: WEBKIT TESTING - Specialized Safari/WebKit Environment
# =============================================================================
FROM test-base AS webkit

# Install WebKit-specific dependencies as root
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
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
    && rm -rf /var/lib/apt/lists/*

# Install Playwright dependencies as root, then browsers as appuser
RUN npx playwright install-deps webkit

USER appuser
RUN npx playwright install webkit

CMD ["npx", "playwright", "test", "tests/hello-world/hello-world.spec.js", "--project=webkit"]

# =============================================================================
# 🧪 STAGE 9: CI TESTING - Complete Testing Environment
# =============================================================================
FROM test-base AS ci

# Install all browsers for comprehensive testing as root
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    firefox-esr \
    libdbus-glib-1-2 \
    libopus0 \
    libwebp7 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Playwright system dependencies as root, then browsers as appuser
RUN npx playwright install-deps chromium firefox webkit

USER appuser
RUN npx playwright install chromium firefox webkit

CMD ["make", "test"]

# =============================================================================
# 📦 DEFAULT STAGE: PRODUCTION (for docker build without --target)
# =============================================================================
# When no --target is specified, build production-ready container
FROM production
