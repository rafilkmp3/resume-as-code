# 🐳 Docker Multi-Architecture Guide

## Overview

This project provides comprehensive Docker support with **multi-architecture** images supporting both `linux/amd64` and `linux/arm64` platforms. This ensures optimal performance on both GitHub Actions runners (AMD64) and Mac Apple Silicon machines (ARM64).

## 🏗️ Architecture Overview

### Golden Base Image Strategy

Our Docker architecture uses a **golden base image** pattern that maximizes CI/CD performance:

```dockerfile
# Stage 1: Golden Base Image (stable dependencies, NO source code)
FROM node:22-slim AS golden-base

# Install system dependencies and npm packages (rarely changes)
COPY package*.json Makefile ./
RUN npm ci --ignore-scripts && npm cache clean --force

# ===== BROWSER STAGES (golden-base + source code + browser) =====
FROM golden-base AS chromium
# Copy source code (this layer changes per PR - after golden base)
COPY . .
# Install browser-specific dependencies
```

### Multi-Architecture Support

- **🍎 Mac Apple Silicon (M1/M2/M3)**: Native ARM64 performance
- **💻 GitHub Actions**: AMD64 compatibility for CI/CD
- **⚡ Layer Caching**: Golden base layers cached across architectures

## 📦 Available Images

### Browser-Specific Images (Multi-Arch)

| Image                                             | Platforms                | Size   | Purpose               |
| ------------------------------------------------- | ------------------------ | ------ | --------------------- |
| `ghcr.io/rafilkmp3/resume-as-code-chromium:1.8.0` | linux/amd64, linux/arm64 | ~350MB | Chromium testing      |
| `ghcr.io/rafilkmp3/resume-as-code-firefox:1.8.0`  | linux/amd64, linux/arm64 | ~400MB | Firefox testing       |
| `ghcr.io/rafilkmp3/resume-as-code-webkit:1.8.0`   | linux/amd64, linux/arm64 | ~500MB | WebKit/Safari testing |

### Image Tags

- `main` - Latest stable version from main branch
- `<branch-name>` - Branch-specific builds
- `<branch-name>-<sha>` - Commit-specific builds

## 🚀 Local Development

### Quick Start

```bash
# Auto-detects your architecture and runs the appropriate image
make docker-dev
# 🌐 Available at: http://localhost:3000

# Production environment
make docker-prod
# 🌐 Available at: http://localhost:3000
```

### Manual Docker Commands

```bash
# Check your architecture
docker version --format '{{.Server.Arch}}'

# Pull appropriate image (automatic architecture selection)
docker pull ghcr.io/rafilkmp3/resume-as-code-chromium:1.8.0

# Run development server
docker run --rm -p 3000:3000 ghcr.io/rafilkmp3/resume-as-code-chromium:1.8.0

# Run with volume mount for development
docker run --rm -p 3000:3000 -v "$(pwd):/workspace" ghcr.io/rafilkmp3/resume-as-code-chromium:1.8.0
```

### Building Images Locally

```bash
# Build all browser images (multi-architecture)
make build-images

# Build specific browser
make build-chromium
make build-firefox
make build-webkit

# Build for specific architecture
docker buildx build --platform linux/amd64 -f docker/Dockerfile.browsers -t test:chromium .
docker buildx build --platform linux/arm64 -f docker/Dockerfile.browsers -t test:chromium .
```

## 🧪 Testing with Docker

### Hello World Tests

Each image includes embedded "Hello World" tests that verify browser functionality:

```bash
# Run embedded hello world test
docker run --rm ghcr.io/rafilkmp3/resume-as-code-chromium:1.8.0

# Expected output:
# 🧪 Running Hello World test for chromium
# ✅ Hello World test passed for chromium
```

### Custom Test Execution

```bash
# Run your own tests
docker run --rm -v "$(pwd):/workspace" \
  ghcr.io/rafilkmp3/resume-as-code-chromium:1.8.0 \
  npx playwright test --project=desktop-chrome

# Run specific test file
docker run --rm -v "$(pwd):/workspace" \
  ghcr.io/rafilkmp3/resume-as-code-chromium:1.8.0 \
  npx playwright test tests/e2e/theme-toggle.spec.js
```

## ⚙️ CI/CD Integration

### GitHub Actions Workflow

Our Docker Images workflow (`.github/workflows/docker-images.yml`) provides:

#### Smart Change Detection

- Only builds when Docker-related files change:
  - `docker/Dockerfile.browsers`
  - `package.json` / `package-lock.json`
  - `config/playwright.config*.js`
  - Workflow file itself

#### Multi-Architecture Build Process

1. **AMD64 Build & Test**: Fast testing on GitHub Actions runners
2. **Multi-Arch Push**: Simultaneous build for AMD64 + ARM64
3. **Manifest Creation**: Docker automatically creates multi-arch manifests

#### Caching Strategy

```yaml
cache-from: |
  type=gha,scope=golden-base-${{ github.ref_name }}
  type=gha,scope=golden-base-main
  type=gha,scope=${{ matrix.browser }}-${{ github.ref_name }}
  type=gha,scope=${{ matrix.browser }}-main
cache-to: |
  type=gha,mode=max,scope=golden-base-${{ github.ref_name }}
  type=gha,mode=max,scope=${{ matrix.browser }}-${{ github.ref_name }}
```

### Performance Benefits

- **🚀 70% Faster CI**: Golden base caching eliminates redundant dependency installs
- **📦 Smaller Images**: Browser-specific containers (300-500MB vs 1.6GB monolithic)
- **⚡ Smart Rebuilds**: Only affected images rebuilt when changes detected

## 🔧 Advanced Usage

### Docker Compose

Use the provided `docker/docker-compose.yml`:

```bash
# Development with hot reload
docker-compose -f docker/docker-compose.yml up dev

# Production server
docker-compose -f docker/docker-compose.yml up prod
```

### Custom Dockerfile Variants

| File                         | Purpose               | Use Case           |
| ---------------------------- | --------------------- | ------------------ |
| `docker/Dockerfile`          | Main production build | Resume generation  |
| `docker/Dockerfile.browsers` | Multi-browser testing | E2E test execution |
| `docker/Dockerfile.fast`     | Quick development     | Fast iteration     |
| `docker/Dockerfile.base`     | Base image template   | Custom extensions  |

### Environment Variables

```bash
# Docker build args
DOCKER_BUILDKIT=1              # Enable BuildKit features
BUILDX_NO_DEFAULT_ATTESTATIONS=1   # Disable attestations for faster builds

# Container runtime
NODE_ENV=test                  # Set application environment
PLAYWRIGHT_BROWSERS_PATH=/opt/playwright   # Browser binary location
```

## 🛠️ Troubleshooting

### Common Issues

#### "Platform not supported" Error

```bash
# Problem: Trying to run ARM64 image on AMD64 or vice versa
# Solution: Use multi-arch manifest (pulls correct architecture automatically)
docker pull ghcr.io/rafilkmp3/resume-as-code-chromium:1.8.0
```

#### Slow Build Times

```bash
# Problem: Docker not using layer cache
# Solution: Enable BuildKit and use cache mounts
export DOCKER_BUILDKIT=1
docker buildx build --cache-from type=local,src=/path/to/cache ...
```

#### Permission Issues in Container

```bash
# Problem: File permissions when mounting volumes
# Solution: Use the testuser (uid=1001) built into images
docker run --user 1001:1001 ...
```

### Docker System Maintenance

```bash
# Clean unused images and containers
make docker-clean

# Remove all build cache
docker system prune -a

# Check disk usage
docker system df
```

## 📊 Performance Metrics

### Build Times (Approximate)

| Architecture | First Build | Cached Build | Golden Base Hit |
| ------------ | ----------- | ------------ | --------------- |
| AMD64        | 8-12 min    | 2-3 min      | 30-60 sec       |
| ARM64        | 10-15 min   | 3-4 min      | 45-90 sec       |

### Image Sizes

| Browser  | Compressed | Uncompressed | Layers |
| -------- | ---------- | ------------ | ------ |
| Chromium | ~120MB     | ~350MB       | 8-10   |
| Firefox  | ~140MB     | ~400MB       | 8-10   |
| WebKit   | ~180MB     | ~500MB       | 8-10   |

## 🔗 Related Documentation

- [Main README](../README.md) - Project overview and quick start
- [CI/CD Documentation](CI-CD.md) - Complete workflow documentation
- [Contributing Guide](CONTRIBUTING.md) - Development setup
- [Architecture Guide](ARCHITECTURE.md) - System design overview

## 💡 Best Practices

### Local Development

1. Use `make docker-dev` for consistent environment
2. Mount source code as volumes for fast iteration
3. Use browser-specific images for targeted testing

### CI/CD Integration

1. Let workflow auto-detect image availability
2. Use golden base caching for performance
3. Run smoke tests before publishing images

### Production Usage

1. Always use tagged versions, not `latest`
2. Pin to specific SHA for reproducible deployments
3. Use multi-arch manifests for platform flexibility

---

**Built with ❤️ for optimal performance across all platforms**

_Supporting both Mac Apple Silicon development and GitHub Actions CI/CD_
