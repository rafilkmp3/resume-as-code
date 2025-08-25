#!/bin/bash
set -euo pipefail

# Broken Window Strategy: Zero Tolerance for Workflow Errors
# This script systematically checks workflow annotations and reports any issues

REPO="rafilkmp3/resume-as-code"
LATEST_RUNS_COUNT=${1:-5}

echo "🔍 BROKEN WINDOW STRATEGY - Checking Latest $LATEST_RUNS_COUNT Workflow Runs"
echo "=============================================================================="

# Function to check annotations for a specific run
check_run_annotations() {
    local run_id=$1
    local run_name=$2
    local conclusion=$3
    
    echo "📋 Checking Run: $run_name (ID: $run_id)"
    echo "   Status: $conclusion"
    
    # For startup failures, check for workflow-level errors
    if [[ "$conclusion" == "startup_failure" ]]; then
        echo "   ❌ STARTUP FAILURE DETECTED"
        echo "   🔗 Check annotations at: https://github.com/$REPO/actions/runs/$run_id"
        return 1
    fi
    
    # For successful/failed runs, check job-level annotations  
    local jobs_response=$(gh api repos/$REPO/actions/runs/$run_id/jobs || echo '{"jobs":[]}')
    local jobs_count=$(echo "$jobs_response" | jq -r '.jobs | length')
    
    if [[ "$jobs_count" -eq 0 ]]; then
        echo "   ⚠️  No jobs found (likely startup failure)"
        return 1
    fi
    
    # Check each job for issues
    local issues_found=0
    echo "$jobs_response" | jq -r '.jobs[] | {name: .name, conclusion: .conclusion, html_url: .html_url}' | \
    while IFS= read -r job; do
        local job_name=$(echo "$job" | jq -r '.name')
        local job_conclusion=$(echo "$job" | jq -r '.conclusion')
        local job_url=$(echo "$job" | jq -r '.html_url')
        
        if [[ "$job_conclusion" != "success" ]]; then
            echo "   ❌ Job Failed: $job_name ($job_conclusion)"
            echo "      🔗 $job_url"
            issues_found=1
        else
            echo "   ✅ Job Passed: $job_name"
        fi
    done
    
    return $issues_found
}

# Get latest workflow runs
echo "🎯 Fetching latest workflow runs..."
runs_data=$(gh run list --limit $LATEST_RUNS_COUNT --json databaseId,name,conclusion,status --repo $REPO)

# Check each run
total_issues=0
while IFS= read -r run; do
    run_id=$(echo "$run" | jq -r '.databaseId')
    run_name=$(echo "$run" | jq -r '.name')
    conclusion=$(echo "$run" | jq -r '.conclusion')
    
    if ! check_run_annotations "$run_id" "$run_name" "$conclusion"; then
        ((total_issues++))
    fi
    echo ""
done <<< "$(echo "$runs_data" | jq -c '.[]')"

echo "=============================================================================="
if [[ $total_issues -eq 0 ]]; then
    echo "✅ BROKEN WINDOW CHECK PASSED - No issues found in latest $LATEST_RUNS_COUNT runs"
    exit 0
else
    echo "❌ BROKEN WINDOW VIOLATION - $total_issues issues found in latest $LATEST_RUNS_COUNT runs"
    echo "🚨 IMMEDIATE ACTION REQUIRED - Fix all issues before proceeding"
    exit 1
fi