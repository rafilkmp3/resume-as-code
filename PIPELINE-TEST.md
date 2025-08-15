# Three-Tier Pipeline Validation

This PR tests the complete three-tier deployment pipeline:

## Testing Checklist
- [ ] PR Preview deployment to Netlify
- [ ] Environment-aware QR codes pointing to preview URL
- [ ] Staging deployment after merge
- [ ] Production deployment via release

## Expected Pipeline Flow
1. **PR Preview**: deploy-preview-XX--resume-as-code.netlify.app  
2. **Staging**: resume-as-code.netlify.app (after merge)
3. **Production**: rafilkmp3.github.io/resume-as-code (after release)

🚀 Testing three-tier deployment pipeline implementation

