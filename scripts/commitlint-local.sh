#!/bin/bash
# AI-Friendly local commitlint validation that matches CI exactly
# This provides the same detailed error messages as GitHub Actions

set -euo pipefail

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE" 2>/dev/null || echo "")

if [ -z "$COMMIT_MSG" ]; then
  echo "❌ Error: Could not read commit message from file: $COMMIT_MSG_FILE"
  exit 1
fi

# Install commitlint if not present
if ! command -v commitlint >/dev/null 2>&1; then
  echo "📦 Installing commitlint for local validation..."
  npm install -g @commitlint/cli @commitlint/config-conventional >/dev/null 2>&1
fi

# Create commitlint config (matches CI exactly)
TEMP_CONFIG="/tmp/commitlint.config.js"
cat > "$TEMP_CONFIG" << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test', 'ci', 'build', 'revert']],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100]
  }
};
EOF

# Run commitlint with detailed error capture
TEMP_ERROR="/tmp/commitlint_error.txt"
TEMP_OUTPUT="/tmp/commitlint_output.txt"

# Run with both stdout and stderr capture
if echo "$COMMIT_MSG" | commitlint --config "$TEMP_CONFIG" --verbose >"$TEMP_OUTPUT" 2>"$TEMP_ERROR"; then
  echo "✅ Commit message follows conventional commits format!"
  rm -f "$TEMP_CONFIG" "$TEMP_ERROR" "$TEMP_OUTPUT"
  exit 0
fi

# Parse error output for AI-friendly messages
ERROR_OUTPUT=$(cat "$TEMP_ERROR" 2>/dev/null || echo "No error details available")
STDOUT_OUTPUT=$(cat "$TEMP_OUTPUT" 2>/dev/null || echo "No stdout available")

# Enhanced debugging with commit message analysis
echo "🔍 DETAILED COMMIT ANALYSIS:"
echo "📝 Original commit message: '$COMMIT_MSG'"
echo "📏 Message length: $(echo "$COMMIT_MSG" | wc -c | tr -d ' ') characters"
echo ""

# Basic format analysis
if [[ "$COMMIT_MSG" =~ ^[a-z]+(\([a-z0-9-]+\))?: ]]; then
  echo "✅ Basic format looks correct: type(scope): description"
else
  echo "❌ Basic format issue detected"
  echo "   Expected: type: description  OR  type(scope): description"
  echo "   Got: '$COMMIT_MSG'"
fi

# Check specific patterns
COMMIT_TYPE=$(echo "$COMMIT_MSG" | sed -n 's/^\([a-z]*\).*/\1/p')
if [ -n "$COMMIT_TYPE" ]; then
  echo "🏷️  Detected type: '$COMMIT_TYPE'"
  case "$COMMIT_TYPE" in
    feat|fix|chore|docs|style|refactor|perf|test|ci|build|revert)
      echo "✅ Valid commit type"
      ;;
    *)
      echo "❌ Invalid commit type - must be one of: feat, fix, chore, docs, style, refactor, perf, test, ci, build, revert"
      ;;
  esac
else
  echo "❌ No commit type detected"
fi

# Debug: Show what we got from commitlint
echo ""
echo "🐛 DEBUG: commitlint stderr:"
echo "$ERROR_OUTPUT"
echo ""
echo "🐛 DEBUG: commitlint stdout:"
echo "$STDOUT_OUTPUT"
echo "🐛 DEBUG: End of commitlint output"
echo ""

echo ""
echo "❌ CONVENTIONAL COMMITS VALIDATION FAILED (LOCAL)"
echo "📋 Commit message: '$COMMIT_MSG'"
echo ""

# Clear, actionable error messages for everyone  
if echo "$ERROR_OUTPUT" | grep -q "subject-case"; then
  echo "❌ PROBLEM: Your subject text has uppercase letters"
  echo "✅ SOLUTION: Make everything after the colon lowercase (including proper nouns)"
  echo "   WRONG: 'test: verify Chrome options fix'"
  echo "   RIGHT: 'test: verify chrome options fix'"
  echo "   WRONG: 'feat: Add New Feature'"  
  echo "   RIGHT: 'feat: add new feature'"
  echo "💡 TIP: Even product names like 'Chrome', 'Docker', 'GitHub' should be lowercase in subject"
  echo ""
fi

if echo "$ERROR_OUTPUT" | grep -q "type-enum"; then
  echo "❌ PROBLEM: Invalid commit type (word before the colon)"
  echo "✅ SOLUTION: Use one of these types:"
  echo "   feat     - New feature for users"
  echo "   fix      - Bug fix"
  echo "   chore    - Dependencies, maintenance"  
  echo "   docs     - Documentation changes"
  echo "   style    - Code formatting only"
  echo "   refactor - Code restructuring"
  echo "   test     - Adding/fixing tests"
  echo "   ci       - CI/CD changes"
  echo ""
fi

if echo "$ERROR_OUTPUT" | grep -q "subject-empty"; then
  echo "❌ PROBLEM: No description after the colon"
  echo "✅ SOLUTION: Add a clear description"
  echo "   WRONG: 'feat:'"
  echo "   RIGHT: 'feat: add dark mode toggle'"
  echo ""
fi

if echo "$ERROR_OUTPUT" | grep -q "header-max-length"; then
  CURRENT_LENGTH=$(echo "$COMMIT_MSG" | wc -c | tr -d ' ')
  echo "❌ PROBLEM: Commit message too long ($CURRENT_LENGTH characters, max 100)"
  echo "✅ SOLUTION: Shorten your message"
  echo "   TIP: Keep the important part, remove extra words"
  echo ""
fi

echo "🛠️  IMMEDIATE FIX (copy and paste this):"
echo "git commit --amend -m \"feat: your short description here\""
echo ""
echo "📚 DOCUMENTATION:"
echo "- 📖 Conventional Commits: https://www.conventionalcommits.org/"
echo "- 🔧 Commitlint Rules: https://commitlint.js.org/#/reference-rules"
echo "- 🎯 Project Guidelines: https://github.com/rafilkmp3/resume-as-code/blob/main/CLAUDE.md"
echo ""

# Clean up
rm -f "$TEMP_CONFIG" "$TEMP_ERROR" "$TEMP_OUTPUT"
exit 1