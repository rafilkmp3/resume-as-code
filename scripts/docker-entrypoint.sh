#!/bin/bash
set -e

# =============================================================================
# 🐳 Docker Entrypoint - Resume as Code
# =============================================================================
# Simple entrypoint for Docker containers with bind mount support
# =============================================================================

echo "🔧 Docker environment ready"

# Execute the original command
exec "$@"
