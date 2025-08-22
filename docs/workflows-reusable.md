# 🔄 Reusable Workflows & Composite Actions

This document describes the modular workflow architecture with reusable components.

## Reusable Workflows

### 🏗️ Build Workflow (`_build.yml`)

**Purpose**: Standardized build process across all environments with ARM64 optimization.

**Inputs**:
- `runner_type`: Runner architecture (default: `ubuntu-24.04-arm`)
- `node_version`: Node.js version (default: `22`)
- `build_mode`: Build mode - production, development, draft (default: `production`)
- `environment_name`: Environment name - production, staging, preview (default: `production`)
- `context`: Build context - deploy, preview, staging (default: `deploy`)
- `cache_key_suffix`: Additional cache key suffix (default: `''`)
- `upload_artifacts`: Whether to upload build artifacts (default: `true`)
- `artifact_name`: Name of the build artifact (default: `build-artifacts`)
- `timeout_minutes`: Job timeout in minutes (default: `10`)

**Outputs**:
- `build_success`: Whether the build succeeded
- `build_size`: Size of the build output
- `pdf_count`: Number of PDFs generated
- `deployment_url`: Expected deployment URL

**Usage Example**:
```yaml
uses: ./.github/workflows/_build.yml
with:
  runner_type: 'ubuntu-24.04-arm'
  node_version: '22'
  build_mode: 'production'
  environment_name: 'staging'
  context: 'deploy'
  cache_key_suffix: '-staging'
  upload_artifacts: true
  artifact_name: 'staging-build'
  timeout_minutes: 10
```

### 📊 Shared Deployment Status (`shared-deployment-status.yml`)

**Purpose**: Consistent deployment status reporting across environments.

**Inputs**:
- `deployment_status`: Status - building, ready, failure
- `deployment_url`: The deployment URL
- `deployment_environment`: Environment name
- `additional_info`: Additional markdown content

**Usage Example**:
```yaml
uses: ./.github/workflows/shared-deployment-status.yml
with:
  deployment_status: 'ready'
  deployment_url: 'https://resume-as-code.netlify.app'
  deployment_environment: 'staging'
  additional_info: |
    ### 🧪 Staging Test Results
    - ✅ **Build**: ARM64 reusable workflow successful
    - ✅ **Deploy**: Netlify staging deployment complete
```

## Composite Actions

### 🚀 Node.js Build Setup (`node-build`)

**Purpose**: Standardized Node.js setup with ARM64 optimization and caching.

**Inputs**:
- `node_version`: Node.js version (default: `22`)
- `runner_type`: Runner architecture
- `cache_key_suffix`: Additional cache key suffix

**Features**:
- ARM64-optimized caching strategy
- Speedlight build performance
- Cross-platform compatibility
- Intelligent cache invalidation

**Usage Example**:
```yaml
- name: 🚀 ARM64 Node.js Build Setup
  uses: ./.github/actions/node-build
  with:
    node_version: '22'
    runner_type: 'ubuntu-24.04-arm'
    cache_key_suffix: '-staging'
```

## Workflow Patterns

### Build → Deploy Pattern

Most deployment workflows follow this pattern:

1. **Use reusable build workflow**
2. **Download artifacts**
3. **Deploy to target environment**
4. **Report status via shared workflow**

Example:
```yaml
jobs:
  build:
    uses: ./.github/workflows/_build.yml
    with:
      environment_name: 'staging'
      
  deploy:
    needs: build
    # ... deployment steps
    
  status:
    needs: [build, deploy]
    uses: ./.github/workflows/shared-deployment-status.yml
    with:
      deployment_status: ${{ needs.deploy.result == 'success' && 'ready' || 'failure' }}
```

### Context-Aware Building

The build workflow adapts based on environment:

- **Production**: GitHub Pages URLs, production assets
- **Staging**: Netlify URLs, staging configuration
- **Preview**: Preview URLs, development settings

## Benefits of Reusable Components

✅ **Consistency**: Same build process across all environments
✅ **Maintainability**: Single source of truth for build logic
✅ **Performance**: ARM64 optimization in all workflows
✅ **Reliability**: Tested and proven build patterns
✅ **DRY Principle**: No duplicate workflow code
✅ **Scalability**: Easy to add new environments
✅ **Debugging**: Centralized troubleshooting

## Migration Guide

To use reusable workflows in existing workflows:

1. **Replace build jobs** with `uses: ./.github/workflows/_build.yml`
2. **Add status reporting** with `shared-deployment-status.yml`
3. **Update artifact handling** to use standardized names
4. **Migrate to ARM64 runners** for performance benefits

## Common Patterns

### PR Preview Workflow
```yaml
build-preview:
  uses: ./.github/workflows/_build.yml
  with:
    environment_name: 'preview'
    context: 'deploy-preview'
    cache_key_suffix: '-pr-${{ github.event.number }}'
```

### Staging Deployment
```yaml
build-staging:
  uses: ./.github/workflows/_build.yml
  with:
    environment_name: 'staging'
    context: 'deploy'
    cache_key_suffix: '-staging'
```

### Production Release
```yaml
build-production:
  uses: ./.github/workflows/_build.yml
  with:
    environment_name: 'production'
    context: 'production'
    upload_artifacts: false  # Direct deploy
```