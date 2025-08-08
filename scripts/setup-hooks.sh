#!/bin/bash
#
# Setup script for git hooks and development environment
#

echo "🔧 Setting up Resume-as-Code development environment..."

# Configure git hooks
echo "📎 Configuring git hooks..."
git config core.hooksPath .githooks
echo "✅ Git hooks configured to use .githooks directory"

# Make hooks executable
chmod +x .githooks/*
echo "✅ Made git hooks executable"

# Make scripts executable
chmod +x scripts/*.sh scripts/*.js
echo "✅ Made scripts executable"

# Test commit message validation
echo ""
echo "🧪 Testing commit message validation..."
echo "feat: add awesome new feature" | node scripts/validate-commit-msg.js
if [ $? -eq 0 ]; then
    echo "✅ Commit message validation is working"
else
    echo "❌ Commit message validation test failed"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Available commands:"
echo "  npm run version:auto     - Automatic semantic versioning based on commits"
echo "  npm run build           - Build the resume HTML and PDFs"
echo "  npm run dev             - Start development server"
echo "  npm run test            - Run all tests"
echo ""
echo "📚 Commit message format (Conventional Commits):"
echo "  feat: add new feature"
echo "  fix: resolve bug"
echo "  docs: update documentation"
echo "  chore: maintain codebase"
echo ""
echo "💡 The pre-commit hook will automatically validate your commit messages!"
