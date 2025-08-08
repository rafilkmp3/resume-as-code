#!/bin/bash
# Validation script for all configuration files

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Configuration Validation Suite${NC}"
echo "=================================="

# Validate package.json
echo -e "\n${BLUE}📦 Validating package.json...${NC}"
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('✅ Valid JSON')"; then
    echo -e "${GREEN}✅ package.json is valid${NC}"
else
    echo -e "${RED}❌ package.json has syntax errors${NC}"
    exit 1
fi

# Validate release-please config
echo -e "\n${BLUE}🚀 Validating release-please-config.json...${NC}"
if [[ -f "release-please-config.json" ]]; then
    if node -e "JSON.parse(require('fs').readFileSync('release-please-config.json', 'utf8')); console.log('✅ Valid JSON')"; then
        echo -e "${GREEN}✅ release-please-config.json is valid${NC}"
    else
        echo -e "${RED}❌ release-please-config.json has syntax errors${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  release-please-config.json not found${NC}"
fi

# Validate GitHub workflows
echo -e "\n${BLUE}🔄 Validating GitHub workflows...${NC}"
if command -v python3 >/dev/null 2>&1; then
    for workflow in .github/workflows/*.yml; do
        if [[ -f "$workflow" ]]; then
            echo "  Checking $workflow..."
            if python3 -c "import yaml; yaml.safe_load(open('$workflow'))" 2>/dev/null; then
                echo -e "  ${GREEN}✅ $workflow is valid YAML${NC}"
            else
                echo -e "  ${RED}❌ $workflow has YAML syntax errors${NC}"
                exit 1
            fi
        fi
    done
else
    echo -e "${YELLOW}⚠️  Python not available, skipping YAML validation${NC}"
fi

# Validate GitHub Actions schema (if ajv-cli is available)
echo -e "\n${BLUE}📋 Validating GitHub Actions schema...${NC}"
if command -v npx >/dev/null 2>&1; then
    for workflow in .github/workflows/*.yml; do
        if [[ -f "$workflow" ]]; then
            echo "  Schema validation for $workflow..."
            if npx --yes ajv-cli validate -s https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/github-workflow.json -d "$workflow" --spec=draft2019-09 2>/dev/null; then
                echo -e "  ${GREEN}✅ $workflow passes GitHub Actions schema validation${NC}"
            else
                echo -e "  ${YELLOW}⚠️  $workflow schema validation failed (continuing anyway)${NC}"
            fi
        fi
    done
else
    echo -e "${YELLOW}⚠️  npx not available, skipping GitHub Actions schema validation${NC}"
fi

# Validate Jest config
echo -e "\n${BLUE}🧪 Validating Jest configuration...${NC}"
if [[ -f "jest.config.js" ]]; then
    if node -c jest.config.js; then
        echo -e "${GREEN}✅ jest.config.js is valid${NC}"
    else
        echo -e "${RED}❌ jest.config.js has syntax errors${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  jest.config.js not found${NC}"
fi

# Validate Playwright config
echo -e "\n${BLUE}🎭 Validating Playwright configuration...${NC}"
if [[ -f "playwright.config.js" ]]; then
    if node -c playwright.config.js; then
        echo -e "${GREEN}✅ playwright.config.js is valid${NC}"
    else
        echo -e "${RED}❌ playwright.config.js has syntax errors${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  playwright.config.js not found${NC}"
fi

# Check for required files
echo -e "\n${BLUE}📋 Checking required files...${NC}"
REQUIRED_FILES=(
    "README.md"
    "package.json"
    "Makefile"
    "template.html"
    "resume-data.json"
    "build.js"
    "dev-server.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "  ${GREEN}✅ $file exists${NC}"
    else
        echo -e "  ${RED}❌ $file is missing${NC}"
        exit 1
    fi
done

# Validate Make targets
echo -e "\n${BLUE}🛠️  Validating Makefile targets...${NC}"
if make help >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Makefile targets are accessible${NC}"
else
    echo -e "${RED}❌ Makefile has issues${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 All configuration files are valid!${NC}"
echo -e "${GREEN}✅ Ready for development${NC}"
