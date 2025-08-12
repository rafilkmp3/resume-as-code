#!/bin/bash

# Install git hooks for resume-as-code project
# This script sets up pre-push hooks to prevent conflicts

echo "🪝 Installing Git hooks for resume-as-code..."

# Ensure .git/hooks directory exists
mkdir -p .git/hooks

# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# Pre-push hook that automatically pulls before pushing
# Prevents push conflicts and keeps local branch synchronized

echo "🔄 Pre-push: Checking for remote changes..."

# Get current branch name
current_branch=$(git branch --show-current)

# Get remote name (usually 'origin')
remote=$(git remote | head -n1)

if [ -z "$remote" ]; then
    echo "⚠️  No remote configured, skipping pull"
    exit 0
fi

# Check if remote branch exists
if ! git ls-remote --exit-code --heads "$remote" "$current_branch" >/dev/null 2>&1; then
    echo "🆕 New branch - no remote to pull from"
    exit 0
fi

echo "🔄 Pulling latest changes from $remote/$current_branch..."

# Stash any uncommitted changes temporarily
stash_needed=false
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "💾 Stashing uncommitted changes..."
    git stash push -m "pre-push-auto-stash-$(date +%s)" --include-untracked
    stash_needed=true
fi

# Pull with rebase to maintain linear history
if git pull --rebase "$remote" "$current_branch"; then
    echo "✅ Successfully pulled and rebased with remote"

    # Restore stashed changes if any
    if [ "$stash_needed" = true ]; then
        echo "🔄 Restoring stashed changes..."
        if git stash pop; then
            echo "✅ Stashed changes restored"
        else
            echo "⚠️  Merge conflicts in stashed changes - you may need to resolve manually after push"
        fi
    fi

    echo "🚀 Proceeding with push..."
    exit 0
else
    echo "❌ Failed to pull/rebase. Push cancelled."
    echo "💡 Please resolve conflicts manually:"
    echo "   git pull --rebase $remote $current_branch"
    echo "   # resolve conflicts"
    echo "   git rebase --continue"
    echo "   git push"

    # Restore stashed changes if any
    if [ "$stash_needed" = true ]; then
        echo "🔄 Restoring stashed changes..."
        git stash pop
    fi

    exit 1
fi
EOF

# Make the hook executable
chmod +x .git/hooks/pre-push

echo "✅ Pre-push hook installed successfully!"
echo ""
echo "📋 What this hook does:"
echo "  • Automatically pulls latest changes before pushing"
echo "  • Uses git rebase to maintain linear history"
echo "  • Stashes/restores uncommitted changes during pull"
echo "  • Prevents push conflicts and version tag issues"
echo ""
echo "💡 To disable temporarily: git push --no-verify"
echo "🗑️  To remove: rm .git/hooks/pre-push"
