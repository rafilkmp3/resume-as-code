#!/usr/bin/env node

// =============================================================================
// 🏢 INDUSTRY-STANDARD VERSION MANAGEMENT SYSTEM
// =============================================================================
// Following best practices from Google, Microsoft, GitHub, Netflix, and Spotify
// Implements dynamic git-based versioning with comprehensive build metadata
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

class IndustryVersionManager {
  constructor() {
    this.packageJson = this.loadPackageJson();
    this.gitInfo = this.calculateGitInfo();
    this.buildInfo = this.calculateBuildInfo();
    this.environment = this.detectEnvironment();
  }

  // Load package.json for base version
  loadPackageJson() {
    try {
      return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    } catch (error) {
      throw new Error(`Failed to load package.json: ${error.message}`);
    }
  }

  // Calculate comprehensive git information with secure command execution
  calculateGitInfo() {
    try {
      // Try git commands first
      let gitDescribe = this.executeGitCommand(['describe', '--tags', '--always', '--dirty']);
      let latestTag = this.executeGitCommand(['describe', '--tags', '--abbrev=0']);
      let commitHash = this.executeGitCommand(['rev-parse', 'HEAD']);
      let branchName = this.executeGitCommand(['rev-parse', '--abbrev-ref', 'HEAD']);
      
      // Fallback to environment variables if git is not available (Docker build context)
      if (!commitHash && process.env.GITHUB_SHA) {
        console.log('🔄 Git not available, using environment variables for version info');
        commitHash = this.sanitizeEnvVar(process.env.GITHUB_SHA);
        branchName = this.sanitizeEnvVar(process.env.GITHUB_REF_NAME) || 'unknown';
        latestTag = this.sanitizeEnvVar(process.env.LAST_RELEASE_TAG) || 'v0.0.0';
        gitDescribe = `${latestTag}-${this.sanitizeEnvVar(process.env.COMMITS_SINCE_RELEASE) || '0'}-g${commitHash ? commitHash.substring(0, 7) : 'unknown'}`;
      }
      
      // Set defaults if still not available
      gitDescribe = gitDescribe || 'v0.0.0-unknown';
      latestTag = latestTag || 'v0.0.0';
      commitHash = commitHash || 'unknown';
      branchName = branchName || 'unknown';

      // Calculate commits since tag
      let commitsSinceTag = 0;
      if (process.env.COMMITS_SINCE_RELEASE) {
        commitsSinceTag = parseInt(this.sanitizeEnvVar(process.env.COMMITS_SINCE_RELEASE)) || 0;
      } else if (latestTag && this.isValidGitTag(latestTag)) {
        const commitsOutput = this.executeGitCommand(['rev-list', '--count', `${latestTag}..HEAD`]);
        commitsSinceTag = parseInt(commitsOutput) || 0;
      }
      
      // If no valid tag, count all commits
      if (commitsSinceTag === 0 && latestTag === 'v0.0.0') {
        const allCommitsOutput = this.executeGitCommand(['rev-list', '--count', 'HEAD']);
        commitsSinceTag = parseInt(allCommitsOutput) || 0;
      }

      const commitShort = this.isValidCommitHash(commitHash) ? commitHash.substring(0, 7) : 'unknown';

      // Check if working directory is dirty - SECURE: using argument arrays
      const status = this.executeGitCommand(['status', '--porcelain']) || '';
      const isDirty = status.trim().length > 0;

      return {
        describe: this.sanitizeGitOutput(gitDescribe),
        latestTag: this.sanitizeGitOutput(latestTag),
        commitsSinceTag: Math.max(0, commitsSinceTag),
        commitHash: this.sanitizeGitOutput(commitHash),
        commitShort: this.sanitizeGitOutput(commitShort),
        branchName: this.sanitizeGitOutput(branchName),
        isDirty
      };
    } catch (error) {
      console.warn('⚠️ Git information not available - using environment fallbacks');
      
      // Final fallback using environment variables
      const envCommitHash = this.sanitizeEnvVar(process.env.GITHUB_SHA) || 'unknown';
      const envCommitShort = envCommitHash !== 'unknown' ? envCommitHash.substring(0, 7) : 'unknown';
      
      return {
        describe: 'unknown',
        latestTag: this.sanitizeEnvVar(process.env.LAST_RELEASE_TAG) || 'v0.0.0',
        commitsSinceTag: parseInt(this.sanitizeEnvVar(process.env.COMMITS_SINCE_RELEASE)) || 0,
        commitHash: envCommitHash,
        commitShort: envCommitShort,
        branchName: this.sanitizeEnvVar(process.env.GITHUB_REF_NAME) || 'unknown',
        isDirty: false
      };
    }
  }

  // SECURITY: Secure git command execution using spawnSync
  executeGitCommand(args, options = {}) {
    try {
      const result = spawnSync('git', args, {
        encoding: 'utf8',
        timeout: 10000, // 10 second timeout
        stdio: ['ignore', 'pipe', 'pipe'],
        ...options
      });
      
      if (result.status === 0 && result.stdout) {
        return result.stdout.trim();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // SECURITY: Validate git tag format
  isValidGitTag(tag) {
    const tagPattern = /^v?\d+\.\d+\.\d+.*$/;
    return typeof tag === 'string' && tag.length < 100 && tagPattern.test(tag);
  }

  // SECURITY: Validate commit hash format
  isValidCommitHash(hash) {
    const hashPattern = /^[a-f0-9]{7,40}$/;
    return typeof hash === 'string' && hashPattern.test(hash);
  }

  // SECURITY: Sanitize git output
  sanitizeGitOutput(output) {
    if (typeof output !== 'string') return 'unknown';
    // Remove any control characters and limit length
    return output.replace(/[\x00-\x1F\x7F]/g, '').substring(0, 200) || 'unknown';
  }

  // Calculate build information with secure environment variable handling
  calculateBuildInfo() {
    const buildDate = new Date();
    const buildTimestamp = buildDate.toISOString();
    const buildDateCompact = buildDate.toISOString().split('T')[0].replace(/-/g, '');
    
    return {
      timestamp: buildTimestamp,
      date: buildDate.toISOString().split('T')[0],
      dateCompact: buildDateCompact,
      time: buildDate.toISOString().split('T')[1].split('.')[0],
      epoch: Math.floor(buildDate.getTime() / 1000),
      runId: this.sanitizeEnvVar(process.env.GITHUB_RUN_ID) || '',
      runNumber: this.sanitizeEnvVar(process.env.GITHUB_RUN_NUMBER) || '',
      actor: this.sanitizeEnvVar(process.env.GITHUB_ACTOR) || 'local'
    };
  }

  // SECURITY: Sanitize environment variables
  sanitizeEnvVar(value) {
    if (typeof value !== 'string') return '';
    // Only allow alphanumeric, hyphens, underscores, and dots
    const sanitized = value.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, 100);
    return sanitized || '';
  }

  // Detect deployment environment with secure environment variable validation
  detectEnvironment() {
    // CI/CD Environment Detection - SECURE: validate boolean env vars
    const isCI = this.isValidBooleanEnv(process.env.CI) || this.isValidBooleanEnv(process.env.GITHUB_ACTIONS);
    const isNetlify = this.isValidBooleanEnv(process.env.NETLIFY);
    const isGitHubPages = this.isValidBooleanEnv(process.env.GITHUB_PAGES);
    
    // Context Detection - SECURE: sanitize context values
    const context = this.sanitizeEnvVar(process.env.CONTEXT) || '';
    const prNumber = this.sanitizeEnvVar(process.env.REVIEW_ID) || this.sanitizeEnvVar(process.env.PR_NUMBER) || '';
    
    let channel = 'development';
    let environment = 'development';
    let environmentDetails = 'Local Development';

    if (isNetlify && context === 'deploy-preview') {
      channel = 'preview';
      environment = 'preview';
      environmentDetails = `Netlify PR Preview (#${prNumber || 'unknown'})`;
    } else if (isNetlify && (context === 'staging' || (!context && !isGitHubPages))) {
      channel = 'staging';
      environment = 'staging';
      environmentDetails = 'Netlify Staging';
    } else if (isGitHubPages || context === 'production') {
      channel = 'stable';
      environment = 'production';
      environmentDetails = 'GitHub Pages Production';
    } else if (isCI) {
      channel = 'ci';
      environment = 'ci';
      environmentDetails = 'CI/CD Build Environment';
    }

    return {
      channel: this.sanitizeEnvVar(channel),
      environment: this.sanitizeEnvVar(environment),
      environmentDetails: this.sanitizeEnvVar(environmentDetails),
      isCI,
      isNetlify,
      isGitHubPages,
      context: this.sanitizeEnvVar(context),
      prNumber: this.sanitizeEnvVar(prNumber)
    };
  }

  // SECURITY: Validate boolean environment variables
  isValidBooleanEnv(value) {
    return value === 'true' || value === '1';
  }

  // Generate semantic version (base version from package.json)
  getSemanticVersion() {
    return this.packageJson.version;
  }

  // Generate enhanced version with build metadata (Google/Kubernetes style)
  getEnhancedVersion() {
    const baseVersion = this.getSemanticVersion();
    const { commitShort, commitsSinceTag, isDirty } = this.gitInfo;
    const { dateCompact } = this.buildInfo;
    const { channel, prNumber } = this.environment;

    let version = baseVersion;

    // Add pre-release channel for non-stable environments
    if (channel !== 'stable') {
      version += `-${channel}`;
      if (commitsSinceTag > 0) {
        version += `.${commitsSinceTag}`;
      }
    }

    // Add build metadata
    const metadata = [];
    metadata.push(dateCompact);
    metadata.push(commitShort);
    
    if (prNumber) {
      metadata.push(`pr-${prNumber}`);
    }
    
    if (isDirty) {
      metadata.push('dirty');
    }

    if (metadata.length > 0) {
      version += `+${metadata.join('.')}`;
    }

    return version;
  }

  // Generate display version based on environment
  getDisplayVersion() {
    const { channel } = this.environment;
    const { commitsSinceTag } = this.gitInfo;
    const baseVersion = this.getSemanticVersion();

    switch (channel) {
      case 'stable':
        // Production: Clean semantic version
        return baseVersion;
      
      case 'preview':
      case 'staging':
        // Preview/Staging: Show commits ahead
        if (commitsSinceTag > 0) {
          return `${baseVersion} +${commitsSinceTag}`;
        }
        return baseVersion;
      
      case 'development':
      case 'ci':
        // Development: Full enhanced version
        return this.getEnhancedVersion();
      
      default:
        return this.getEnhancedVersion();
    }
  }

  // Generate comprehensive version object (Netflix/GitHub style)
  getVersionObject() {
    return {
      // Core Version Information
      version: this.getSemanticVersion(),
      displayVersion: this.getDisplayVersion(),
      enhancedVersion: this.getEnhancedVersion(),
      
      // Git Information
      gitVersion: this.gitInfo.describe,
      gitCommit: this.gitInfo.commitHash,
      gitCommitShort: this.gitInfo.commitShort,
      gitBranch: this.gitInfo.branchName,
      gitTag: this.gitInfo.latestTag,
      gitCommitsSinceTag: this.gitInfo.commitsSinceTag,
      gitIsDirty: this.gitInfo.isDirty,
      
      // Build Information
      buildDate: this.buildInfo.timestamp,
      buildDateHuman: this.buildInfo.date,
      buildTime: this.buildInfo.time,
      buildEpoch: this.buildInfo.epoch,
      buildRunId: this.buildInfo.runId,
      buildRunNumber: this.buildInfo.runNumber,
      buildActor: this.buildInfo.actor,
      
      // Environment Information
      channel: this.environment.channel,
      environment: this.environment.environment,
      environmentDetails: this.environment.environmentDetails,
      deploymentContext: this.environment.context,
      prNumber: this.environment.prNumber,
      
      // Platform Information
      isCI: this.environment.isCI,
      isNetlify: this.environment.isNetlify,
      isGitHubPages: this.environment.isGitHubPages,
      
      // Metadata
      generator: 'resume-as-code',
      schema: '1.0.0',
      generatedAt: this.buildInfo.timestamp
    };
  }

  // Generate version API JSON (industry standard)
  generateVersionAPI() {
    const versionObject = this.getVersionObject();
    
    return {
      ...versionObject,
      // API-specific fields
      apiVersion: '1.0.0',
      links: {
        repository: this.packageJson.repository?.url || '',
        homepage: this.packageJson.homepage || '',
        issues: this.packageJson.bugs?.url || '',
        releases: this.packageJson.repository?.url ? `${this.packageJson.repository.url.replace('.git', '')}/releases` : '',
        commit: this.packageJson.repository?.url ? `${this.packageJson.repository.url.replace('.git', '')}/commit/${this.gitInfo.commitHash}` : ''
      }
    };
  }

  // Write version API file (.well-known/version.json) with secure path handling
  writeVersionAPI(outputDir = './dist') {
    try {
      const versionAPI = this.generateVersionAPI();
      
      // SECURITY: Validate and normalize output directory path
      const safeOutputDir = this.validateOutputPath(outputDir);
      const wellKnownDir = path.join(safeOutputDir, '.well-known');
      
      // SECURITY: Ensure directory creation is safe
      if (!fs.existsSync(wellKnownDir)) {
        fs.mkdirSync(wellKnownDir, { recursive: true, mode: 0o755 });
      }
      
      // SECURITY: Validate final file path
      const versionPath = path.join(wellKnownDir, 'version.json');
      const safePath = this.validateOutputPath(versionPath);
      
      // Write version.json with proper encoding
      fs.writeFileSync(safePath, JSON.stringify(versionAPI, null, 2), { encoding: 'utf8', mode: 0o644 });
      
      console.log(`📄 Version API written: ${safePath}`);
      return safePath;
    } catch (error) {
      console.error('❌ Failed to write version API:', error.message);
      throw new Error('Version API write failed');
    }
  }

  // SECURITY: Validate output paths to prevent directory traversal
  validateOutputPath(inputPath) {
    try {
      // Resolve and normalize the path
      const resolvedPath = path.resolve(inputPath);
      const normalizedPath = path.normalize(resolvedPath);
      
      // Ensure path is within current working directory or subdirectories
      const cwd = process.cwd();
      if (!normalizedPath.startsWith(cwd)) {
        throw new Error('Path outside working directory not allowed');
      }
      
      // Additional validation: no parent directory references
      if (normalizedPath.includes('..')) {
        throw new Error('Parent directory references not allowed');
      }
      
      return normalizedPath;
    } catch (error) {
      throw new Error(`Invalid path: ${error.message}`);
    }
  }

  // Display comprehensive version information
  displayVersionInfo() {
    const version = this.getVersionObject();
    
    console.log('🏢 INDUSTRY-STANDARD VERSION INFORMATION');
    console.log('========================================');
    console.log(`📦 Version: ${version.displayVersion}`);
    console.log(`🔖 Full Version: ${version.enhancedVersion}`);
    console.log(`🌍 Environment: ${version.environment} (${version.environmentDetails})`);
    console.log(`📋 Channel: ${version.channel}`);
    console.log(`🔗 Git: ${version.gitCommitShort} on ${version.gitBranch}`);
    console.log(`📅 Build: ${version.buildDateHuman} ${version.buildTime}`);
    
    if (version.gitCommitsSinceTag > 0) {
      console.log(`📈 Commits ahead: ${version.gitCommitsSinceTag} since ${version.gitTag}`);
    }
    
    if (version.prNumber) {
      console.log(`🔀 PR: #${version.prNumber}`);
    }
    
    if (version.buildRunId) {
      console.log(`🏗️ Build: ${version.buildRunId} (${version.buildRunNumber})`);
    }
    
    console.log('========================================');
    
    return version;
  }

  // Get version variables for template injection
  getTemplateVariables() {
    const version = this.getVersionObject();
    
    return {
      appVersion: version.displayVersion,
      enhancedVersion: version.enhancedVersion,
      commitHash: version.gitCommitShort,
      buildTimestamp: version.buildDate,
      commitsAhead: version.gitCommitsSinceTag,
      lastReleaseTag: version.gitTag,
      runId: version.buildRunId,
      runNumber: version.buildRunNumber,
      prNumber: version.prNumber,
      buildContext: version.environment,
      contextUrl: '',
      compareUrl: '',
      environment: version.environment,
      channel: version.channel
    };
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'info';
  
  const versionManager = new IndustryVersionManager();
  
  switch (command) {
    case 'info':
    case 'show':
      versionManager.displayVersionInfo();
      break;
      
    case 'json':
      console.log(JSON.stringify(versionManager.getVersionObject(), null, 2));
      break;
      
    case 'api':
      console.log(JSON.stringify(versionManager.generateVersionAPI(), null, 2));
      break;
      
    case 'write-api':
      const outputDir = args[1] || './dist';
      versionManager.writeVersionAPI(outputDir);
      break;
      
    case 'template':
      console.log(JSON.stringify(versionManager.getTemplateVariables(), null, 2));
      break;
      
    case 'version':
      console.log(versionManager.getDisplayVersion());
      break;
      
    case 'enhanced':
      console.log(versionManager.getEnhancedVersion());
      break;
      
    default:
      console.log('Usage: node scripts/version-manager.js [command]');
      console.log('Commands:');
      console.log('  info        - Display comprehensive version information (default)');
      console.log('  json        - Output version object as JSON');
      console.log('  api         - Output version API format');
      console.log('  write-api   - Write .well-known/version.json file');
      console.log('  template    - Output template variables');
      console.log('  version     - Output display version only');
      console.log('  enhanced    - Output enhanced version only');
      break;
  }
}

// Export for programmatic use
module.exports = IndustryVersionManager;

// Run CLI if called directly
if (require.main === module) {
  main();
}