#!/bin/bash
# Dockerized pre-commit validation script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Docker Pre-commit Validation${NC}"
echo "================================="

# Get list of changed files (passed as arguments or from git)
if [ $# -gt 0 ]; then
    STAGED_FILES="$@"
else
    STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || find . -name "*.json" -o -name "*.yml" -o -name "*.yaml" | head -10)
fi

echo "📋 Files to validate: $STAGED_FILES"

# Track validation status
VALIDATION_FAILED=0

# Function to validate JSON files
validate_json() {
    local file="$1"
    echo -e "\n🔍 Validating JSON: $file"
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  File not found: $file${NC}"
        return 0
    fi
    
    # Use jsonlint for validation
    if jsonlint "$file" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $file is valid JSON${NC}"
        return 0
    else
        echo -e "${RED}❌ $file has invalid JSON syntax${NC}"
        jsonlint "$file" 2>&1 | head -3
        return 1
    fi
}

# Function to validate YAML files
validate_yaml() {
    local file="$1"
    echo -e "\n🔍 Validating YAML: $file"
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  File not found: $file${NC}"
        return 0
    fi
    
    # Use yamllint with relaxed rules for CI workflows
    if yamllint -d "{extends: default, rules: {line-length: {max: 120}, trailing-spaces: disable, truthy: disable, document-start: disable, empty-lines: {max: 3}, brackets: disable}}" "$file" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $file is valid YAML${NC}"
        return 0
    else
        echo -e "${RED}❌ $file has YAML issues${NC}"
        yamllint -d "{extends: default, rules: {line-length: {max: 120}, trailing-spaces: disable, truthy: disable, document-start: disable, empty-lines: {max: 3}, brackets: disable}}" "$file" 2>&1 | head -5
        return 1
    fi
}

# Function to validate GitHub Actions workflows
validate_github_workflow() {
    local file="$1"
    echo -e "\n🔄 Validating GitHub Actions workflow: $file"
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  File not found: $file${NC}"
        return 0
    fi
    
    # First validate YAML syntax
    if ! validate_yaml "$file"; then
        return 1
    fi
    
    # Additional GitHub Actions specific validations
    echo "  🔍 Checking GitHub Actions specific patterns..."
    
    # Check for required fields
    if ! grep -q "^on:" "$file" && ! grep -q "^'on':" "$file"; then
        echo -e "${RED}  ❌ Missing 'on' trigger section${NC}"
        return 1
    fi
    
    if ! grep -q "^jobs:" "$file"; then
        echo -e "${RED}  ❌ Missing 'jobs' section${NC}"
        return 1
    fi
    
    # Check for common issues
    if grep -q "needs: \[\]" "$file"; then
        echo -e "${YELLOW}  ⚠️  Empty needs array found${NC}"
    fi
    
    echo -e "${GREEN}  ✅ GitHub Actions workflow structure looks good${NC}"
    return 0
}

# Function to check for sensitive information
check_sensitive_info() {
    local file="$1"
    echo -e "\n🔒 Checking for sensitive information in: $file"
    
    if [ ! -f "$file" ]; then
        return 0
    fi
    
    # Define sensitive patterns
    local patterns=(
        "password\s*[:=]\s*['\"][^'\"]*['\"]"
        "api[_-]?key\s*[:=]\s*['\"][^'\"]*['\"]"
        "secret\s*[:=]\s*['\"][^'\"]*['\"]"
        "token\s*[:=]\s*['\"][^'\"]*['\"]"
        "AKIA[0-9A-Z]{16}"  # AWS Access Key
        "AIza[0-9A-Za-z_-]{35}"  # Google API Key
        "sk_live_[0-9a-zA-Z]{24}"  # Stripe Live Key
        "ghp_[a-zA-Z0-9]{36}"  # GitHub Token
    )
    
    local found_sensitive=0
    for pattern in "${patterns[@]}"; do
        if grep -iE "$pattern" "$file" >/dev/null 2>&1; then
            echo -e "${RED}❌ Potential sensitive information found in $file${NC}"
            grep -iE "$pattern" "$file" | head -2
            found_sensitive=1
        fi
    done
    
    if [ $found_sensitive -eq 0 ]; then
        echo -e "${GREEN}✅ No sensitive information detected${NC}"
    fi
    
    return $found_sensitive
}

# Main validation loop
echo -e "\n${BLUE}🔍 Starting validation checks...${NC}"

for file in $STAGED_FILES; do
    # Skip if file doesn't exist
    if [ ! -f "$file" ]; then
        continue
    fi
    
    # Check for sensitive information in all files
    if ! check_sensitive_info "$file"; then
        VALIDATION_FAILED=1
    fi
    
    # Validate based on file extension
    case "$file" in
        *.json)
            if ! validate_json "$file"; then
                VALIDATION_FAILED=1
            fi
            ;;
        *.yml|*.yaml)
            if [[ "$file" == *"/.github/workflows/"* ]]; then
                if ! validate_github_workflow "$file"; then
                    VALIDATION_FAILED=1
                fi
            else
                if ! validate_yaml "$file"; then
                    VALIDATION_FAILED=1
                fi
            fi
            ;;
        *)
            echo -e "\n📄 Skipping validation for: $file (unsupported file type)"
            ;;
    esac
done

# Final result
echo -e "\n${BLUE}📊 Validation Summary${NC}"
echo "===================="

if [ $VALIDATION_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All validation checks passed!${NC}"
    echo -e "${GREEN}✅ Ready to commit${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation checks failed!${NC}"
    echo -e "${RED}Please fix the issues above before committing${NC}"
    exit 1
fi