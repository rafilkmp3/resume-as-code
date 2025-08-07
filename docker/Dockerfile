# Multi-stage Dockerfile for Resume-as-Code CI/CD
FROM node:22-slim AS builder

# Accept build arguments from GitHub Actions
ARG GITHUB_SHA=dev-local
ARG GITHUB_REF_NAME=main
ARG NODE_ENV=production

# Set environment for Puppeteer and build arguments
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    DEBIAN_FRONTEND=noninteractive \
    GITHUB_SHA=${GITHUB_SHA} \
    GITHUB_REF_NAME=${GITHUB_REF_NAME} \
    NODE_ENV=${NODE_ENV}

# Install system dependencies and create app directory in one layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        chromium \
        fonts-liberation \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libxss1 \
        libasound2 \
        make \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && mkdir -p /app

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json Makefile ./

# Install dependencies (including dev for build process)
RUN npm ci \
    && npm cache clean --force

# Copy source code
COPY . .

# Build the resume
RUN npm run build

# Production stage
FROM node:22-slim AS production

# Set environment and install runtime dependencies in one layer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies, create user, and setup app in one layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        chromium \
        fonts-liberation \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libxss1 \
        libasound2 \
        dumb-init \
        wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && addgroup --gid 1001 nodejs \
    && adduser --disabled-password --gecos '' --uid 1001 --gid 1001 resume \
    && mkdir -p /app \
    && chown resume:nodejs /app

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=resume:nodejs /app/dist ./dist
COPY --from=builder --chown=resume:nodejs /app/package*.json ./
COPY --from=builder --chown=resume:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER resume

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "serve"]

# Development stage
FROM node:22-slim AS development

# Install development dependencies including Playwright
RUN apt-get update && apt-get install -y \
    chromium \
    firefox-esr \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    make \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set environment
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY Makefile ./

# Install all dependencies (including dev)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Install Playwright browsers with system dependencies
RUN npx playwright install --with-deps chromium firefox webkit

# Expose ports
EXPOSE 3000 3001

# Development command
CMD ["make", "dev"]

# CI/Test stage
FROM development AS ci

# Set CI environment and Playwright browser path BEFORE installing browsers
ENV CI=true \
    NODE_ENV=test \
    PLAYWRIGHT_BROWSERS_PATH=/opt/playwright

# Create browsers directory and set permissions
RUN mkdir -p /opt/playwright

# Install Playwright browsers as root directly into /opt/playwright
RUN npx playwright install --with-deps chromium firefox webkit

# Create test user and fix permissions after browser installation
RUN groupadd -g 1001 testuser && \
    useradd -u 1001 -g testuser -m testuser && \
    chown -R testuser:testuser /app && \
    chown -R testuser:testuser /home/testuser && \
    chown -R testuser:testuser /opt/playwright

USER testuser

# Default CI command - run all tests
CMD ["make", "test"]