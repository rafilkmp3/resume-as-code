# Resume Auto-Updater

**Automatic resume data updates integrated with Release Please for industry-standard version management.**

## 🎯 Overview

The Resume Auto-Updater automatically keeps resume data current during the release process. It updates timestamps, project highlights, URLs, and other configurable fields to ensure your resume is always up-to-date without manual intervention.

## 🚀 Features

- **Automatic Updates**: Runs during every release process
- **Configurable Rules**: Control what gets updated and when
- **Smart Conditions**: Time-based and version-based update triggers
- **Dry Run Mode**: Preview changes before applying
- **Git Integration**: Automatic commits with descriptive messages

## 📋 What Gets Updated Automatically

### Default Updates

1. **Last Updated Timestamp** 
   - Field: `meta.lastUpdated`
   - Value: Current date (YYYY-MM-DD format)

2. **Availability Status**
   - Field: `meta.availability`
   - Configurable status (Open to Work / Currently Employed)

3. **Production URLs**
   - Ensures `basics.url` points to production
   - Updates project URLs to canonical versions

4. **Project Highlights**
   - Adds version milestones to Resume-as-Code project
   - Includes commit count achievements
   - Limits total highlights to maintain readability

## ⚙️ Configuration

Configuration is managed through `config/resume-auto-update.json`:

```json
{
  "enabled": true,
  "updateFields": {
    "lastUpdated": {
      "enabled": true,
      "format": "YYYY-MM-DD"
    },
    "availability": {
      "enabled": true,
      "value": "open_to_work"
    },
    "projectHighlights": {
      "enabled": true,
      "maxHighlights": 6
    }
  },
  "conditionalUpdates": {
    "timeBased": {
      "enabled": true,
      "minimumDaysBetweenUpdates": 30
    },
    "versionBased": {
      "enabled": true,
      "triggerOnVersionTypes": ["major", "minor"]
    }
  }
}
```

## 🔧 Usage

### Command Line Usage

```bash
# Apply all configured updates
npm run resume:update

# Preview changes without applying them
npm run resume:update:dry-run

# Show current configuration
npm run resume:update:config

# Direct script usage
node scripts/resume-auto-updater.js
node scripts/resume-auto-updater.js --dry-run
node scripts/resume-auto-updater.js --config
```

### Automatic Integration

The updater runs automatically during the release process:

1. **Triggered**: On push to main branch (before Release Please)
2. **Updates Applied**: Based on configuration rules
3. **Commit Created**: If changes detected
4. **Release Continues**: With updated resume data

## 📊 Update Rules

### Time-Based Updates

- **Minimum Interval**: 30 days between automatic updates
- **Purpose**: Prevents excessive updates on frequent releases
- **Override**: Manual runs bypass time restrictions

### Version-Based Updates

- **Triggers**: Major and minor version releases only
- **Skips**: Patch releases (unless overridden)
- **Rationale**: Significant updates for significant releases

## 🎨 Customization

### Adding New Update Rules

1. **Edit Configuration**: Add new rules to `config/resume-auto-update.json`
2. **Implement Logic**: Extend `ResumeAutoUpdater` class if needed
3. **Test Changes**: Use dry-run mode to verify behavior

### Example Custom Rule

```json
{
  "updateFields": {
    "customField": {
      "enabled": true,
      "field": "basics.customData",
      "value": "dynamic_value",
      "description": "Updates custom field with dynamic value"
    }
  }
}
```

## 🔍 Integration with Release Process

### GitHub Actions Workflow

The updater is integrated into `.github/workflows/release-please.yml`:

```yaml
jobs:
  update-resume-data:
    runs-on: ubuntu-latest
    steps:
      - name: Run Resume Auto-Updater
        run: |
          node scripts/resume-auto-updater.js
          # Automatic commit if changes detected
```

### Release Please Integration

- **Extra Files**: `src/resume-data.json` included in releases
- **Automatic Updates**: Applied before release PR creation
- **Version Tracking**: Resume data stays synchronized with releases

## 🛡️ Safety Features

### Dry Run Mode

Always test changes before applying:

```bash
npm run resume:update:dry-run
```

### Conditional Logic

Updates only apply when conditions are met:
- Time since last update
- Version type (major/minor)
- Configuration enabled

### Backup Strategy

- Original data preserved during updates
- Git history maintains full change log
- Rollback possible through git revert

## 📈 Benefits

### For Resume Management

- **Always Current**: Timestamps and data automatically updated
- **Version Milestones**: Achievements tracked automatically
- **Professional URLs**: Production links maintained

### For Release Process

- **Streamlined**: No manual resume updates needed
- **Consistent**: Same update logic every release
- **Integrated**: Seamless part of CI/CD pipeline

### For Maintenance

- **Configurable**: Easy to modify what gets updated
- **Transparent**: Clear logging and git history
- **Reliable**: Runs consistently across environments

## 🚨 Troubleshooting

### Common Issues

1. **No Updates Applied**
   - Check if enough time has passed (30 days default)
   - Verify configuration is enabled
   - Use dry-run mode to debug

2. **Unexpected Changes**
   - Review configuration in `config/resume-auto-update.json`
   - Check git log for recent auto-updater commits
   - Use --config flag to view active settings

3. **CI/CD Integration Issues**
   - Ensure GitHub Actions has write permissions
   - Verify Node.js and dependencies are available
   - Check workflow logs for detailed error messages

### Debug Commands

```bash
# Show what would be updated
npm run resume:update:dry-run

# View current configuration
npm run resume:update:config

# Check git history of auto-updates
git log --grep="resume-auto-updater" --oneline

# Verify resume data structure
node -e "console.log(JSON.stringify(require('./src/resume-data.json'), null, 2))"
```

## 🔄 Version History

- **v1.0.0** (2025-08-18): Initial implementation with basic update rules
- **Integration**: Seamlessly integrated with existing Release Please workflow
- **Future**: Planned enhancements for more sophisticated update logic

---

This auto-updater ensures your resume stays current and professional while maintaining the industry-standard release process established for this project.