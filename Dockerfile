# Multi-stage Dockerfile for Resume-as-Code CI/CD
FROM node:18-alpine AS builder

# Install system dependencies for PDF generation
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    make

# Set environment for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY Makefile ./

# Install dependencies (including dev dependencies for build process)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the resume
RUN make build-internal

# Production stage
FROM node:18-alpine AS production

# Install minimal runtime dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# Set environment
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S resume -u 1001

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
FROM node:18-alpine AS development

# Install development dependencies including Playwright
RUN apk add --no-cache \
    chromium \
    firefox \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    make \
    git

# Set environment
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY Makefile ./

# Install all dependencies (including dev)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Install Playwright browsers (without --with-deps since we already have system deps)
RUN npx playwright install chromium

# Expose ports
EXPOSE 3000 3001

# Development command
CMD ["make", "dev"]

# CI/Test stage
FROM development AS ci

# Set CI environment
ENV CI=true \
    NODE_ENV=test

# Create test user
RUN addgroup -g 1001 -S testuser && \
    adduser -S testuser -u 1001 && \
    chown -R testuser:testuser /app

USER testuser

# Install Playwright browsers as testuser
RUN npx playwright install chromium

# Default CI command - run all tests
CMD ["make", "test"]