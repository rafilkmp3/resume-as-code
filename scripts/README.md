# 📝 Scripts Directory

[![Shell](https://img.shields.io/badge/Shell-Validation%20Scripts-blue?style=flat-square&logo=gnu-bash)](https://www.gnu.org/software/bash/)
[![Node.js](https://img.shields.io/badge/Node.js-Validation%20Tools-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)

Automation and validation scripts for the Resume-as-Code project.

## 📁 Scripts

### **`validate-config.sh`**

Comprehensive configuration validation script that checks:

- **JSON Files**: Validates package.json and configuration files
- **YAML Files**: Validates GitHub workflow files
- **GitHub Actions Schema**: Validates workflow against official schema
- **Jest Configuration**: Validates Jest setup
- **Playwright Configuration**: Validates Playwright setup
- **Required Files**: Ensures all essential files exist
- **Makefile Targets**: Validates Make commands are accessible

**Usage:**

```bash
# Run full validation suite
./scripts/validate-config.sh

# Via Makefile (recommended)
make validate
```

**Features:**

- ✅ **JSON Validation**: Syntax checking for all JSON files
- ✅ **YAML Validation**: GitHub Actions workflow validation
- ✅ **Schema Validation**: GitHub Actions schema compliance (using ajv-cli)
- ✅ **File Existence**: Ensures required files are present
- ✅ **Makefile Validation**: Verifies Make targets are functional
- 🎨 **Colored Output**: Clear success/error indicators

### **`validate-workflows.js`** (Future)

Node.js-based workflow validation tool for advanced GitHub Actions validation.

## 🔧 Validation Categories

### **Configuration Files**

- `package.json` - npm package configuration
- `jest.config.js` - Jest testing configuration
- `playwright.config.js` - Playwright E2E testing
- `.github/workflows/*.yml` - GitHub Actions workflows

### **Required Files**

- `README.md` - Project documentation
- `Makefile` - Build automation
- `template.html` - Resume template
- `resume-data.json` - Resume content data
- `build.js` - Build script
- `dev-server.js` - Development server

### **Schema Validation**

- **GitHub Actions**: Validates against official GitHub Actions schema
- **Package.json**: Node.js package schema validation
- **Custom Schemas**: Project-specific validation rules

## 🚀 Integration

### **Pre-commit Hooks**

Validation scripts run automatically on:

- Git commits (via pre-commit hooks)
- CI/CD pipeline (GitHub Actions)
- Local development (via Make commands)

### **CI/CD Pipeline**

```yaml
- name: Validate Configuration
  run: ./scripts/validate-config.sh
```

## 🎯 Exit Codes

Scripts follow standard Unix exit codes:

- **0**: Success - all validations passed
- **1**: Error - validation failures detected

## 📊 Validation Output

Example output:

```bash
🔍 Configuration Validation Suite
==================================

📦 Validating package.json...
✅ package.json is valid

🔄 Validating GitHub workflows...
  Checking .github/workflows/ci.yml...
  ✅ .github/workflows/ci.yml is valid YAML

📋 Validating GitHub Actions schema...
  Schema validation for .github/workflows/ci.yml...
  ✅ .github/workflows/ci.yml passes GitHub Actions schema validation

🧪 Validating Jest configuration...
✅ jest.config.js is valid

🎭 Validating Playwright configuration...
✅ playwright.config.js is valid

📋 Checking required files...
  ✅ README.md exists
  ✅ package.json exists
  ✅ Makefile exists
  ✅ template.html exists
  ✅ resume-data.json exists
  ✅ build.js exists
  ✅ dev-server.js exists

🛠️ Validating Makefile targets...
✅ Makefile targets are accessible

🎉 All configuration files are valid!
✅ Ready for development
```

## 🔄 Adding New Validations

### **Adding File Validation**

1. Add file to `REQUIRED_FILES` array in `validate-config.sh`
2. Add specific validation logic if needed
3. Update documentation

### **Adding Schema Validation**

1. Identify schema source (JSON Schema, OpenAPI, etc.)
2. Add validation command using appropriate tool
3. Include in validation pipeline

## 🐛 Troubleshooting

### **Common Issues**

- **Missing Dependencies**: Install required tools (python3, npm, ajv-cli)
- **Permission Errors**: Ensure scripts are executable (`chmod +x`)
- **Path Issues**: Run from project root directory

### **Debug Mode**

```bash
# Enable verbose output
bash -x ./scripts/validate-config.sh
```

---

_Scripts ensure project integrity and configuration correctness across all environments._
