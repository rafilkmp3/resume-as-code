# 🤖 Dependabot Preview Environments

This document explains how to deploy preview environments for Dependabot PRs, which normally can't access repository secrets.

## 🎯 Why This Is Needed

**The Problem**: Dependabot PRs run with restricted permissions and cannot access secrets like `NETLIFY_AUTH_TOKEN`, preventing automatic preview deployments.

**The Solution**: Manual trigger system that allows authorized users to deploy previews for dependency update PRs.

## 🚀 How to Use

### Method 1: Comment Trigger (Recommended)

1. **Go to any Dependabot PR**
2. **Add a comment**: `/preview`
3. **Wait for deployment** (takes ~5 minutes)
4. **Get preview URL** in response comment

Example:
```
/preview
```

### Method 2: Manual Workflow Dispatch

1. **Go to Actions tab**
2. **Select "🤖 Dependabot Preview Environment"**
3. **Click "Run workflow"**
4. **Enter PR number**
5. **Click "Run workflow"**

## 🔐 Security & Permissions

### Who Can Trigger Previews?

- ✅ **Repository owner** (automatic)
- ✅ **Collaborators with admin/write permissions**
- ❌ **External contributors** (security protection)

### What Gets Access?

- 🔑 **Full secret access** (same as regular PRs)
- 🌐 **Netlify deployment capabilities**
- 📦 **Complete build pipeline**

## 🛡️ Security Considerations

### Safe Practices:
- Only trusted maintainers can trigger previews
- Each preview uses isolated Netlify alias
- Previews are temporary and can be cleaned up
- Full audit trail in GitHub Actions logs

### What We Check:
1. **PR must exist** and be accessible
2. **User must have write/admin permissions**
3. **Comment must contain exact trigger phrase**
4. **Netlify secrets must be available**

## 🌐 Preview URLs

Dependabot previews use the standard Netlify preview URL pattern:
```
https://deploy-preview-{PR_NUMBER}--resume-as-code.netlify.app
```

Examples:
- PR #130: `https://deploy-preview-130--resume-as-code.netlify.app`  
- PR #129: `https://deploy-preview-129--resume-as-code.netlify.app`

## 🔧 Advanced Usage

### GitHub App Integration (Future)

For fully automated Dependabot previews, you can:

1. **Create GitHub App** with enhanced permissions
2. **Add app secrets**: `DEPENDABOT_APP_ID`, `DEPENDABOT_APP_PRIVATE_KEY`
3. **Modify workflow** to use app token for secret access
4. **Enable auto-deployment** for safe dependency updates

### Custom Triggers

You can customize the trigger phrase by editing `.github/workflows/dependabot-preview.yml`:

```yaml
# Change this line:
if (!comment.includes('/preview')) {
# To this:
if (!comment.includes('/deploy-dependabot')) {
```

## 🏗️ Architecture

```
Dependabot PR Created
       ↓
Manual Trigger (/preview comment or workflow_dispatch)
       ↓  
Permission Check (admin/write access required)
       ↓
Checkout PR Code
       ↓
Build Application (with updated dependencies)
       ↓
Deploy to Netlify (using repository secrets)
       ↓
Post Preview URL in PR Comment
```

## 🧪 Testing Strategy

### What to Test in Dependabot Previews:

1. **Functionality**: All features work with new dependencies
2. **Performance**: No performance regressions  
3. **Visual**: No UI/styling breakage
4. **Build**: Application compiles without errors
5. **Assets**: Images, fonts, and resources load correctly

### Example Testing Checklist:

- [ ] Home page loads correctly
- [ ] PDF downloads work
- [ ] Images display properly
- [ ] Mobile responsive layout intact
- [ ] No console errors
- [ ] Build time is reasonable
- [ ] All routes accessible

## ❓ Troubleshooting

### Preview Fails to Deploy

**Check:**
1. Netlify secrets are configured correctly
2. PR has no build-breaking changes  
3. Network connectivity to Netlify
4. Repository permissions are correct

### Permission Denied

**Solutions:**
1. Ask repository owner to trigger preview
2. Request admin/write access to repository
3. Use manual workflow dispatch if you have repository access

### Preview URL Not Loading

**Check:**
1. Wait 2-3 minutes for DNS propagation
2. Check Netlify deployment status
3. Verify build completed successfully
4. Try hard refresh (Ctrl+Shift+R)

## 📋 FAQ

**Q: Why can't Dependabot PRs deploy automatically?**
A: GitHub security model prevents Dependabot from accessing secrets, which is necessary for Netlify deployment.

**Q: Is this secure?**  
A: Yes, only authorized maintainers can trigger previews, and all activity is logged.

**Q: Can I automate this further?**
A: Yes, with GitHub Apps you can create fully automated flows while maintaining security.

**Q: How do I clean up old previews?**
A: Netlify previews can be managed through the Netlify dashboard or cleaned up automatically after PR closure.