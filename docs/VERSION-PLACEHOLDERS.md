# Version Placeholders System

This document explains the automated version injection system used throughout the documentation.

## 🎯 Overview

To ensure **consistent and trackeable versioning** across all documentation, we use placeholder tokens that are automatically replaced by CI with the current semantic version.

## 📝 Placeholders

| Placeholder           | Description           | Example |
| --------------------- | --------------------- | ------- |
| `{{VERSION}}`         | Full semantic version | `1.5.0` |
| `{{MAJOR}}`           | Major version number  | `1`     |
| `{{MINOR}}`           | Minor version number  | `5`     |
| `{{PATCH}}`           | Patch version number  | `0`     |
| `{{MAJOR}}.{{MINOR}}` | Major.minor version   | `1.5`   |

## 🔄 How It Works

### 1. Source Documentation (Git Repository)

Documentation files contain placeholders:

```markdown
# Pull the Docker image

docker pull ghcr.io/rafilkmp3/resume-as-code-firefox:{{VERSION}}

# Run tests

docker run --rm ghcr.io/rafilkmp3/resume-as-code-chromium:{{VERSION}}
```

### 2. CI Processing

During CI/CD pipeline:

1. **Version Injection**: `scripts/inject-version.js` processes all documentation
2. **Placeholder Replacement**: All `{{VERSION}}` tokens → current version
3. **Deployment**: Updated documentation goes live with real versions

### 3. Live Documentation (Deployed)

Users see actual versions:

```bash
# Pull the Docker image
docker pull ghcr.io/rafilkmp3/resume-as-code-firefox:1.5.0

# Run tests
docker run --rm ghcr.io/rafilkmp3/resume-as-code-chromium:1.5.0
```

## 🎨 Benefits

### ✅ **Consistency**

- All Docker image references use the same version
- No version drift between different documentation files
- No manual updates required

### ✅ **Automation**

- CI automatically updates all references
- Version bumps automatically propagate everywhere
- Zero manual maintenance

### ✅ **Traceability**

- Clear audit trail of which version was deployed when
- Docker images match documentation versions exactly
- Reproducible deployment instructions

## 📂 Files Using Placeholders

- `docs/DOCKER.md` - Docker usage examples
- `docs/CONTRIBUTING.md` - Development setup instructions
- `docs/CI-CD.md` - CI/CD pipeline documentation
- `docs/ARCHITECTURE.md` - System architecture diagrams
- `README.md` - Main project documentation

## 🛠️ Development Workflow

### For Contributors

```bash
# ✅ Use placeholders in documentation
docker pull ghcr.io/rafilkmp3/resume-as-code-firefox:{{VERSION}}

# ❌ Don't hardcode versions
docker pull ghcr.io/rafilkmp3/resume-as-code-firefox:1.5.0
```

### For CI/CD

```bash
# Automatic version injection during build
node scripts/inject-version.js
```

### Testing Version Injection

```bash
# Test locally (replaces placeholders with current package.json version)
npm run version:inject
```

## 🔧 Technical Implementation

### Version Injection Script

- **Location**: `scripts/inject-version.js`
- **Trigger**: CI/CD build process
- **Input**: `package.json` version
- **Output**: Updated documentation with real versions

### CI Integration

- **Pipeline**: Production CI/CD Pipeline
- **Step**: "Inject version into documentation"
- **Timing**: After checkout, before build
- **Effect**: All deployed documentation shows current version

## 📋 Maintenance

### Adding New Placeholders

1. Add new documentation with `{{VERSION}}` placeholders
2. Update `scripts/inject-version.js` if new placeholder types needed
3. CI automatically processes new files

### Version Updates

1. Conventional commits trigger semantic versioning
2. CI bumps version in `package.json`
3. Version injection script updates all documentation
4. Docker images tagged with new version
5. Documentation shows updated references

## 🎯 Example: Version 1.5.0 → 1.6.0

### Before (Git Repository)

```markdown
docker pull ghcr.io/rafilkmp3/resume-as-code-firefox:{{VERSION}}
```

### After CI Processing (Deployed Docs)

```bash
# Version 1.6.0 deployment
docker pull ghcr.io/rafilkmp3/resume-as-code-firefox:1.6.0
```

This ensures users always get instructions for the **current, deployed version** of all Docker images and artifacts! 🎉
