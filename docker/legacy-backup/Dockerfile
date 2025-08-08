# Builder stage - standalone build for local development
FROM node:22-slim AS builder

WORKDIR /app

# Install system dependencies needed for Puppeteer
RUN apt-get update && apt-get install -y \
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
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set Puppeteer to use system chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code and build
COPY . .
RUN npm run build

# Production stage - optimized using pre-built golden-base
FROM ghcr.io/rafilkmp3/resume-as-code:production AS production

# Accept build arguments for version tracking
ARG GITHUB_SHA=dev-local
ARG GITHUB_REF_NAME=main

# Update only commit tracking (golden-base has everything else)
ENV GITHUB_SHA=${GITHUB_SHA} GITHUB_REF_NAME=${GITHUB_REF_NAME}

# Copy and build from source (leverages cached deps)
COPY . .
RUN npm run build

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

# Development command - use npm script directly to avoid Docker-in-Docker issues
CMD ["npm", "run", "dev"]

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
