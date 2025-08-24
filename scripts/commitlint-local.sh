#!/bin/bash

# 🤖 Claude Code - Developer-Friendly Conventional Commits Helper
# Context7 best practices for helpful pre-commit validation

set -e

COMMIT_MSG_FILE="$1"
if [ -z "$COMMIT_MSG_FILE" ]; then
    echo "❌ Error: No commit message file provided"
    exit 1
fi

if [ ! -f "$COMMIT_MSG_FILE" ]; then
    echo "❌ Error: Commit message file not found: $COMMIT_MSG_FILE"
    exit 1
fi

COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Run commitlint with verbose output
COMMITLINT_OUTPUT=$(npx commitlint --edit "$COMMIT_MSG_FILE" --verbose 2>&1)
COMMITLINT_EXIT_CODE=$?

if [ $COMMITLINT_EXIT_CODE -eq 0 ]; then
    echo "✅ Perfect conventional commit! 🎉"
    echo "📝 $COMMIT_MSG"
    exit 0
else
    echo ""
    echo "🔧 DEVELOPER-FRIENDLY COMMIT HELPER"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 Your commit message:"
    echo "   \"$COMMIT_MSG\""
    echo ""
    
    # Parse specific errors and provide helpful suggestions
    if echo "$COMMITLINT_OUTPUT" | grep -q "type-enum"; then
        echo "🎯 ISSUE: Invalid commit type detected"
        echo "✨ Valid types: feat, fix, chore, docs, style, refactor, test, ci, build, perf, revert"
        echo ""
        echo "💡 QUICK FIXES:"
        if echo "$COMMIT_MSG" | grep -iq "update\|change\|modify"; then
            echo "   git commit --amend -m \"feat: $COMMIT_MSG\""
            echo "   git commit --amend -m \"fix: $COMMIT_MSG\""
        elif echo "$COMMIT_MSG" | grep -iq "add\|new"; then
            echo "   git commit --amend -m \"feat: $COMMIT_MSG\""
        elif echo "$COMMIT_MSG" | grep -iq "fix\|bug\|issue"; then
            echo "   git commit --amend -m \"fix: $COMMIT_MSG\""
        else
            echo "   git commit --amend -m \"feat: $COMMIT_MSG\""
            echo "   git commit --amend -m \"fix: $COMMIT_MSG\""
            echo "   git commit --amend -m \"chore: $COMMIT_MSG\""
        fi
    elif echo "$COMMITLINT_OUTPUT" | grep -q "subject-case"; then
        echo "🎯 ISSUE: Subject case format"
        echo "✨ Use lowercase for subject (after the colon)"
        echo "💡 QUICK FIX:"
        FIXED_MSG=$(echo "$COMMIT_MSG" | sed 's/: \([A-Z]\)/: \L\1/')
        echo "   git commit --amend -m \"$FIXED_MSG\""
    elif echo "$COMMITLINT_OUTPUT" | grep -q "header-max-length"; then
        echo "🎯 ISSUE: Commit message too long (max 72 characters)"
        echo "✨ Keep it concise and clear"
        echo "💡 QUICK FIX:"
        echo "   git commit --amend -m \"$(echo "$COMMIT_MSG" | cut -c1-65)...\""
    else
        echo "🎯 ISSUE: General format issue"
        echo "✨ Format: type(scope): description"
        echo "💡 QUICK FIXES:"
        echo "   git commit --amend -m \"feat: $COMMIT_MSG\""
        echo "   git commit --amend -m \"fix: $COMMIT_MSG\""
        echo "   git commit --amend -m \"chore: $COMMIT_MSG\""
    fi
    
    echo ""
    echo "🚀 DEVELOPMENT-FRIENDLY TIPS:"
    echo "   • Use 'feat:' for new features"
    echo "   • Use 'fix:' for bug fixes" 
    echo "   • Use 'chore:' for maintenance tasks"
    echo "   • Keep it under 72 characters"
    echo "   • Start description with lowercase"
    echo ""
    echo "📚 Learn more: https://www.conventionalcommits.org/"
    echo "🤖 This hook helps ensure consistent git history for better CI/CD automation"
    echo ""
    exit 1
fi