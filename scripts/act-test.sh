#!/bin/bash
# Comprehensive Act Testing Script for CI/CD Workflows
# Since no one else is using this system, we can be aggressive with testing

set -e

echo "🧪 COMPREHENSIVE ACT CI/CD TESTING SUITE"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
PASSED=0
FAILED=0
SKIPPED=0

# Test function
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_result="${3:-success}" # success, failure, or skip

    echo ""
    echo -e "${BLUE}Testing: $test_name${NC}"
    echo "Command: $command"

    start_time=$(date +%s)

    if eval "$command"; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo -e "${GREEN}✅ PASSED${NC} ($duration seconds)"
        ((PASSED++))
    else
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo -e "${RED}❌ FAILED${NC} ($duration seconds)"
        ((FAILED++))
    fi
}

# Display test summary
show_summary() {
    echo ""
    echo "========================================"
    echo -e "${BLUE}TEST SUMMARY${NC}"
    echo "========================================"
    echo -e "Passed: ${GREEN}$PASSED${NC}"
    echo -e "Failed: ${RED}$FAILED${NC}"
    echo -e "Skipped: ${YELLOW}$SKIPPED${NC}"

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
        exit 0
    else
        echo -e "${RED}💥 $FAILED TEST(S) FAILED${NC}"
        exit 1
    fi
}

echo ""
echo "🔧 CONFIGURATION CHECK"
echo "======================"
echo "Act version: $(act --version)"
echo "Docker status: $(docker --version)"
echo "Current directory: $(pwd)"
echo ""

# Trap to show summary on exit
trap show_summary EXIT

echo "🚀 PHASE 1: CRITICAL STANDALONE JOBS"
echo "===================================="

# Test 1: Docker Images - Detect Changes
run_test "Docker Images: Detect Changes" \
    "act workflow_dispatch -W .github/workflows/docker-images.yml -j detect-changes --input force_rebuild=false"

# Test 2: Production - Version Check
run_test "Production: Version Management" \
    "act workflow_dispatch -W .github/workflows/production.yml -j version-check"

# Test 3: Docker Images - Detect Changes with Force Rebuild
run_test "Docker Images: Force Rebuild Detection" \
    "act workflow_dispatch -W .github/workflows/docker-images.yml -j detect-changes --input force_rebuild=true"

echo ""
echo "⚡ PHASE 2: EMERGENCY MODE TESTING"
echo "=================================="

# Test 4: Production Emergency Mode
run_test "Production: Emergency Mode Version Check" \
    "act workflow_dispatch -W .github/workflows/production.yml -j version-check --input deployment_mode=emergency --input emergency_reason='Act testing emergency scenario'"

echo ""
echo "🔥 PHASE 3: AGGRESSIVE EDGE CASE TESTING"
echo "========================================"

# Test 5: Production Build Job (this might fail due to Docker-in-Docker)
run_test "Production: Build Job (Expected Docker issues)" \
    "act workflow_dispatch -W .github/workflows/production.yml -j build --input deployment_mode=emergency"

# Test 6: PR Preview Deploy (this will likely fail due to GitHub Pages dependencies)
run_test "PR Preview: Deploy Job (Expected GitHub dependencies failure)" \
    "act pull_request -W .github/workflows/pr-preview.yml -j deploy-preview"

# Test 7: Visual Monitoring (testing matrix jobs)
run_test "Visual Monitoring: Matrix Job" \
    "act workflow_dispatch -W .github/workflows/visual-monitoring.yml -j visual-regression"

echo ""
echo "📊 PHASE 4: PERFORMANCE AND DRY RUN TESTS"
echo "=========================================="

# Test 8: Dry run of all workflows to check parsing
run_test "All Workflows: YAML Parsing Check" \
    "act -l >/dev/null 2>&1"

# Test 9: Dry run of production workflow
run_test "Production: Dry Run Full Workflow" \
    "act workflow_dispatch -W .github/workflows/production.yml -n"

# Test 10: Dry run of docker-images workflow
run_test "Docker Images: Dry Run Full Workflow" \
    "act workflow_dispatch -W .github/workflows/docker-images.yml -n"

echo ""
echo "🔬 PHASE 5: ADVANCED SCENARIO TESTING"
echo "====================================="

# Test 11: Different event types
run_test "Production: Push Event Simulation" \
    "act push -W .github/workflows/production.yml -j version-check"

# Test 12: Environment variable injection
run_test "Environment Variables: Custom Injection" \
    "PREVIEW_URL=https://test-act-preview.example.com act workflow_dispatch -W .github/workflows/production.yml -j build"

echo ""
echo "✨ Testing complete! Summary will be shown below..."
