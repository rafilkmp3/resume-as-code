# Pull Request

## 📋 Summary

<!-- Provide a brief description of the changes in this PR -->

**Type of Change:**
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Refactoring (no functional changes, no api changes)
- [ ] 🎨 UI/UX improvements
- [ ] ⚡ Performance improvements
- [ ] 🔒 Security improvements

## 🚀 Changes Made

<!-- Describe what you changed and why -->

### Core Changes:
- 
- 
- 

### Files Modified:
<!-- List key files changed -->
- 
- 

## 🧪 Testing

### Pre-Submission Testing Checklist:
- [ ] **Environment Cleanup**: Ran `make clean` to match fresh CI environment
- [ ] **Build Validation**: `make build` completes successfully
- [ ] **Fast Tests**: `make test-fast` passes locally
- [ ] **Docker Compatibility**: All Docker commands work (ARM64 → AMD64 compatibility verified)

### Testing Performed:
<!-- Describe your testing approach -->
- [ ] Unit tests pass (`npm run test:unit`)
- [ ] E2E tests pass locally (`npm run test:e2e`)
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)
- [ ] Mobile testing (if applicable)

### Test Coverage:
<!-- If applicable, describe test coverage -->
- Existing tests: ✅ / ❌
- New tests added: ✅ / ❌ / N/A
- Coverage maintained/improved: ✅ / ❌ / N/A

## 🏗️ CI/CD Considerations

### Architecture Impact:
- [ ] **No Breaking Changes**: Existing functionality preserved
- [ ] **Docker Compatibility**: Works on both ARM64 (local) and AMD64 (CI)
- [ ] **Build Process**: No impact on existing `make build` workflow
- [ ] **Version Compatibility**: Follows semantic versioning principles

### CI Pipeline Validation:
- [ ] **GitHub Actions**: Will trigger appropriate workflows
- [ ] **Multi-Arch**: Docker images build for both architectures
- [ ] **Deployment**: Changes compatible with GitHub Pages deployment

## 📊 Performance Impact

<!-- Check one -->
- [ ] ⚡ Performance improved
- [ ] 📊 No performance impact
- [ ] ⚠️ Minor performance impact (justified below)
- [ ] 🚨 Significant performance impact (requires discussion)

**Performance Details:**
<!-- If performance impact, explain and justify -->

## 🔒 Security Considerations

- [ ] **No Security Impact**: Changes don't affect security posture
- [ ] **Security Improved**: Changes enhance security
- [ ] **Security Review Needed**: Changes require security assessment

**Security Notes:**
<!-- Describe any security implications -->

## 📚 Documentation

- [ ] **Documentation Updated**: Relevant docs updated for changes
- [ ] **README Updates**: README.md updated if needed
- [ ] **API Documentation**: API changes documented
- [ ] **Comments Added**: Complex code properly commented

### Documentation Changes:
<!-- List documentation updates -->
- 
- 

## 🔄 Version Management

### Versioning Strategy:
- [ ] **Patch**: Bug fixes, small improvements
- [ ] **Minor**: New features, non-breaking changes  
- [ ] **Major**: Breaking changes, significant refactoring

### Version Impact:
<!-- If this affects versioning -->
- Current Version: 
- Suggested Next Version: 
- Versioning Rationale: 

## 🎯 Pre-Merge Validation

### Code Quality Checklist:
- [ ] **Code Style**: Follows existing conventions and patterns
- [ ] **Error Handling**: Comprehensive error handling implemented
- [ ] **Resource Cleanup**: Proper resource management (no leaks)
- [ ] **Logging**: Appropriate logging levels used
- [ ] **Comments**: Complex logic documented with comments

### Platform Engineering Checklist:
- [ ] **Docker First**: All automation uses Docker (no local binaries)
- [ ] **Multi-Architecture**: ARM64/AMD64 compatibility verified
- [ ] **CI/CD Integration**: Proper integration with existing pipelines
- [ ] **Environment Parity**: Local changes tested in CI-like environment

## 🚨 Breaking Changes

<!-- If breaking changes, provide migration guide -->

### Migration Required:
- [ ] No migration required
- [ ] Migration guide provided below
- [ ] Backward compatibility maintained

**Migration Steps:**
<!-- Provide step-by-step migration instructions -->

## 📝 Reviewer Notes

### Review Focus Areas:
<!-- Guide reviewers on what to focus on -->
- [ ] Architecture decisions
- [ ] Security implications  
- [ ] Performance impact
- [ ] Documentation completeness
- [ ] Test coverage

### Specific Review Requests:
<!-- Any specific areas where you want feedback -->
- 
- 

## 🔗 Related Issues

<!-- Link related issues -->
- Closes #
- Related to #
- Fixes #

## 📸 Screenshots

<!-- If UI changes, provide before/after screenshots -->

### Before:
<!-- Screenshots of current state -->

### After:  
<!-- Screenshots of new state -->

## 🚀 Deployment Notes

### Deployment Checklist:
- [ ] **Zero Downtime**: Deployment won't cause service interruption
- [ ] **Rollback Plan**: Can be rolled back if issues arise
- [ ] **Environment Variables**: No new environment variables required
- [ ] **Database Changes**: No database migrations required

### Post-Deployment Verification:
<!-- Steps to verify deployment success -->
- [ ] Build artifacts generated correctly
- [ ] PDF generation working
- [ ] All pages load correctly
- [ ] Performance metrics maintained

---

## 📋 Review Checklist (For Reviewers)

### Code Review:
- [ ] Code follows project conventions
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Error handling comprehensive
- [ ] Documentation adequate

### Platform Engineering Review:
- [ ] Docker-first approach maintained
- [ ] Multi-architecture compatibility verified
- [ ] CI/CD integration appropriate
- [ ] No breaking changes to existing workflows

### Final Approval:
- [ ] All tests pass in CI
- [ ] Documentation complete
- [ ] Ready for production deployment

---

**PR Author:** @<!-- GitHub username -->
**Target Branch:** `main`
**Estimated Review Time:** <!-- e.g., 30 minutes, 1 hour -->

<!-- 
🎯 REMINDER FOR PR AUTHOR:
1. Run `make clean && make build && make test-fast` before submitting
2. Ensure all CI checks pass before requesting review
3. Verify changes work on both ARM64 (local) and AMD64 (CI)
4. Update CHANGELOG.md if this is a significant change
-->