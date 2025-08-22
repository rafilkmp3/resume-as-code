# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Documentation Structure

This project uses modular documentation for better maintainability:

- **[Commands & Development Workflow](docs/commands.md)** - Build, testing, and development commands
- **[Conventional Commits](docs/conventional-commits.md)** - Git workflow and commit standards  
- **[ARM64 Performance](docs/arm64-performance.md)** - ARM64 optimization and speedlight builds
- **[Reusable Workflows](docs/workflows-reusable.md)** - GitHub Actions reusable components
- **[Architecture Overview](docs/architecture.md)** - Technical stack and project structure
- **[Platform Engineering](docs/platform-engineering.md)** - CI/CD rules and deployment flows

## 🚀 Quick Start

### Essential Commands
```bash
# Clean environment (matches CI)
make clean

# Start development
make dev-start              # Background server
make get-lan-ip             # Mobile testing

# Test before push
make test-fast              # Quick validation
git pull --rebase           # MANDATORY before push
git push                    # Trigger CI pipeline
```

### Conventional Commits (MANDATORY)
```bash
# ✅ Valid formats - automatically enforced
git commit -m "feat: add new resume section"
git commit -m "fix: resolve QR code URL issue"
git commit -m "chore(deps): bump playwright version"

# ❌ Invalid - blocked by pre-commit hook
git commit -m "update stuff"
git commit -m "fixed bug"
```

## 🤖 AI-Friendly Development Workflow (Claude Code Optimized)

### Context7 Integration for Real-Time Documentation

This project includes Context7 MCP integration for enhanced AI assistance:

**Key Dependencies with Real-Time Docs:**
- **handlebars ^4.7.8**: Template engine with Context7 real-time documentation
- **puppeteer ^24.16.2**: PDF generation with up-to-date best practices  
- **sharp ^0.34.3**: Image optimization with latest technique guidance
- **playwright ^1.54.2**: E2E testing with current pattern recommendations

**Context7 Commands for Claude Code:**
```bash
# Get real-time documentation for any dependency
/context7 handlebars template helpers
/context7 puppeteer pdf generation best practices
/context7 sharp image optimization performance
/context7 playwright accessibility testing
```

### 💡 AI Assistant Guidelines

**For Claude Code Users:**
1. **Always use conventional commits** - the hooks will guide you with helpful errors
2. **Run `git pull --rebase` before any push** - prevents merge conflicts
3. **Use `make test-fast` for quick validation** - saves time during development
4. **Leverage Context7 integration** - get real-time docs for any dependency
5. **Use emergency SKIP only when truly stuck** - then fix immediately

**Common Workflow:**
```bash
# 1. Start development
git pull --rebase
make clean

# 2. Make changes, then validate
make test-fast

# 3. Commit with conventional format (AI-friendly validation)
git commit -m "feat: implement new feature with proper description"

# 4. Push (after rebase)
git pull --rebase
git push
```

### 🔧 Emergency Override for Broken Commits

If you get stuck with conventional commits validation:

```bash
# Use SKIP to bypass pre-commit hooks in emergencies
SKIP=conventional-pre-commit git commit -m "emergency: fix critical production issue"

# Then immediately fix with proper conventional commit:
git commit --amend -m "fix: resolve critical production deployment failure"
```

This setup ensures smooth AI-assisted development while maintaining code quality and automated releases.

---

## 📚 Quick Reference

For detailed information, see the modular documentation:

- **[Development Commands](docs/commands.md)** - Complete command reference
- **[Architecture](docs/architecture.md)** - Technical overview and project structure  
- **[Platform Engineering](docs/platform-engineering.md)** - CI/CD rules and deployment flows
- **[ARM64 Performance](docs/arm64-performance.md)** - Performance optimization details
- **[Reusable Workflows](docs/workflows-reusable.md)** - GitHub Actions components

## 🚨 Critical Rules (Never Ignore)

```bash
# ALWAYS rebase before push
git pull --rebase
git push

# ALWAYS use conventional commits
git commit -m "feat: describe your feature"

# ALWAYS clean before major changes  
make clean

# ALWAYS validate before push
make test-fast
```

**Note**: For full details on any topic above, refer to the corresponding documentation file in the `docs/` directory.