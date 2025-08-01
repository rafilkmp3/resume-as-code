#!/bin/bash

# Resume-as-Code Release Helper
# Follows semantic versioning principles

set -e

CURRENT_VERSION=$(node -p "require('./package.json').version")

echo "Current version: $CURRENT_VERSION"
echo ""
echo "What type of release is this?"
echo "1) patch (bug fixes) - e.g., 1.1.0 → 1.1.1"
echo "2) minor (new features) - e.g., 1.1.0 → 1.2.0"  
echo "3) major (breaking changes) - e.g., 1.1.0 → 2.0.0"
echo ""

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        RELEASE_TYPE="patch"
        ;;
    2)
        RELEASE_TYPE="minor"
        ;;
    3)
        RELEASE_TYPE="major"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "Please ensure:"
echo "1. CHANGELOG.md is updated with changes"
echo "2. All changes are committed"
echo "3. Tests pass (if any)"
echo ""

read -p "Continue with $RELEASE_TYPE release? (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "Release cancelled."
    exit 0
fi

echo "Creating $RELEASE_TYPE release..."

# Update package.json version and create git tag
npm version $RELEASE_TYPE

NEW_VERSION=$(node -p "require('./package.json').version")

echo ""
echo "✅ Release $NEW_VERSION created successfully!"
echo ""
echo "Next steps:"
echo "1. Push to remote: git push origin main --follow-tags"
echo "2. Create GitHub release if needed"
echo "3. Deploy if automated deployment is not set up"

# Optionally push automatically (uncomment if desired)
# echo "Pushing to remote..."
# git push origin main --follow-tags
# echo "✅ Pushed to remote successfully!"