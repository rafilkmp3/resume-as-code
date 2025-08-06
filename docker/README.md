# 🐳 Docker Containerization Suite

Professional Docker setup for consistent development, testing, and deployment environments. This directory contains all Docker-related configurations organized for enterprise-grade containerization.

## 📁 Container Architecture

### **🏗️ Multi-Stage Production Dockerfile**

#### `Dockerfile`
- **Purpose**: Main production and development container
- **Stages**:
  - `builder`: Builds the resume (HTML + PDF + assets)
  - `production`: Lightweight production server
  - `development`: Full development environment with hot reload
  - `ci`: Testing environment with browsers and test tools

### **🎭 Browser-Specific Testing Images**

#### `Dockerfile.browsers`
- **Purpose**: Specialized containers for cross-browser testing
- **Targets**:
  - `base`: Common dependencies and embedded Hello World test
  - `chromium`: Chrome/Chromium testing environment
  - `firefox`: Firefox testing environment  
  - `webkit`: Safari/WebKit testing environment
- **Optimization**: Each image is 300-500MB vs 1.6GB monolithic alternative

### **⚡ Specialized Build Variants**

#### `Dockerfile.fast`
- **Purpose**: Rapid development builds
- **Features**: Minimal dependencies for quick iteration

#### `Dockerfile.base`
- **Purpose**: Base image for shared dependencies
- **Features**: Common layers for build optimization

## 🚀 Service Orchestration

### **`docker-compose.yml`**
Multi-service container orchestration:

#### Services Available:
- **`dev`**: Development server with hot reload (port 3000)
- **`production`**: Production server (port 3000)  
- **`ci`**: CI/CD testing environment
- **`builder`**: Build artifacts generation

#### Volume Management:
- **Source code**: Live mounting for development
- **Test results**: Persistent test artifacts  
- **Coverage**: Code coverage reports
- **Build output**: Generated resume files

## 🛠️ Usage Examples

### **Development Workflow**
```bash
# Start development environment
make dev
# OR directly with compose
docker-compose -f docker/docker-compose.yml up dev

# Production testing
make serve  
# OR directly with compose
docker-compose -f docker/docker-compose.yml up production
```

### **Build Specialized Images**
```bash
# Build all browser images
make build-images

# Build specific browsers
make build-chromium
make build-firefox  
make build-webkit

# Build base image only
make build-base
```

### **Testing Environments**
```bash
# Run tests in containerized environment
make test-fast
# Uses: docker-compose -f docker/docker-compose.yml run --rm ci make test-fast-internal

# Manual container testing
docker-compose -f docker/docker-compose.yml run --rm ci bash
```

## 🏗️ Build Strategy

### **Multi-Stage Benefits**
1. **Optimized Images**: Each stage purpose-built
2. **Layer Caching**: Efficient rebuilds with dependency caching
3. **Security**: Minimal production attack surface
4. **Performance**: Specialized images for specific use cases

### **Browser Testing Architecture**
- **Base Image**: Shared dependencies (Node.js, system packages)
- **Browser Images**: Specific browser + Playwright installations
- **Smart Rebuilding**: Only changed Dockerfiles trigger rebuilds
- **Smoke Testing**: Each image validated before publishing

## 🔧 Docker Context Migration

This directory was created during repository reorganization:

### **Context Changes**
- **Build Context**: Changed from `.` to `..` (parent directory)
- **Dockerfile Path**: Now `docker/Dockerfile` instead of root
- **Volume Mapping**: Updated for new directory structure

### **Backward Compatibility**
All existing `make` commands work unchanged:
- Commands automatically use new Docker file paths
- CI/CD pipelines updated to use new structure
- No functionality changes - only organizational improvements

## 📊 Performance Optimizations

### **Image Size Optimization**
- **Production**: ~400MB (Node.js + minimal dependencies)
- **Browser Images**: 300-500MB each (vs 1.6GB monolithic)
- **Development**: ~800MB (full development tools)

### **Build Time Optimization**
- **Layer Caching**: npm install cached when package.json unchanged
- **Multi-stage**: Only rebuild affected stages
- **Parallel Builds**: Browser images built concurrently

## 🔗 Integration Points

### **CI/CD Pipeline Integration**
- **Path-Based Triggers**: Docker changes trigger dedicated workflows
- **Smart Building**: Only changed images are rebuilt
- **Quality Gates**: Smoke tests validate images before publishing
- **Registry Publishing**: GHCR.io integration for image distribution

### **Development Integration**
- **Live Reload**: Source code changes reflected immediately
- **Port Management**: Consistent port allocation (3000 dev, 3001 test)
- **Volume Optimization**: Excludes node_modules for performance

## 🔗 Related Documentation
- [Main README](../README.md) - Full project overview
- [Makefile Commands](../Makefile) - Docker command automation
- [CI/CD Workflows](../.github/workflows/) - Docker build automation
- [Testing Guide](../tests/README.md) - Container testing strategies