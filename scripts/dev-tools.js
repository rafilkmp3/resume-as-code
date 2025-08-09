#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\033[0m',
  red: '\033[0;31m',
  green: '\033[0;32m',
  yellow: '\033[1;33m',
  blue: '\033[0;34m',
  purple: '\033[0;35m',
  cyan: '\033[0;36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class DevTools {
  constructor() {
    this.projectRoot = process.cwd();
    this.distDir = path.join(this.projectRoot, 'dist');
  }

  // Quick health check
  healthCheck() {
    log('🏥 Development Environment Health Check', 'cyan');
    console.log('==========================================');
    
    const checks = [
      { name: 'Docker Status', check: () => this.checkDocker() },
      { name: 'Node.js Version', check: () => this.checkNode() },
      { name: 'NPM Dependencies', check: () => this.checkDependencies() },
      { name: 'Required Files', check: () => this.checkRequiredFiles() },
      { name: 'Git Status', check: () => this.checkGitStatus() },
      { name: 'Port Availability', check: () => this.checkPorts() },
    ];

    checks.forEach(({ name, check }) => {
      try {
        const result = check();
        log(`✅ ${name}: ${result}`, 'green');
      } catch (error) {
        log(`❌ ${name}: ${error.message}`, 'red');
      }
    });
  }

  // Performance analysis
  analyzePerformance() {
    log('⚡ Performance Analysis', 'cyan');
    console.log('======================');
    
    try {
      // Build timing
      const buildStart = Date.now();
      log('🔄 Running production build...', 'yellow');
      execSync('make build', { stdio: 'pipe' });
      const buildTime = Date.now() - buildStart;
      log(`📊 Production Build: ${(buildTime/1000).toFixed(2)}s`, 'blue');

      // File sizes
      this.analyzeBuildOutput();
      
      // Test timing
      const testStart = Date.now();
      log('🔄 Running fast tests...', 'yellow');
      execSync('timeout 60s make test-fast', { stdio: 'pipe' });
      const testTime = Date.now() - testStart;
      log(`🧪 Fast Tests: ${(testTime/1000).toFixed(2)}s`, 'blue');
      
    } catch (error) {
      log(`⚠️ Performance analysis incomplete: ${error.message}`, 'yellow');
    }
  }

  // Analyze build output
  analyzeBuildOutput() {
    if (!fs.existsSync(this.distDir)) {
      throw new Error('dist/ directory not found - run build first');
    }

    const files = [
      { name: 'HTML', path: 'index.html' },
      { name: 'Screen PDF', path: 'resume.pdf' },
      { name: 'Print PDF', path: 'resume-print.pdf' },
      { name: 'ATS PDF', path: 'resume-ats.pdf' },
    ];

    files.forEach(({ name, path: filePath }) => {
      const fullPath = path.join(this.distDir, filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        log(`📄 ${name}: ${sizeKB}KB`, 'blue');
      } else {
        log(`⚠️ ${name}: Not found`, 'yellow');
      }
    });
  }

  // Clean development environment
  cleanDev() {
    log('🧹 Cleaning development environment...', 'cyan');
    
    const cleanupItems = [
      { path: 'dist', type: 'directory' },
      { path: 'coverage', type: 'directory' },
      { path: 'test-results', type: 'directory' },
      { path: '.nyc_output', type: 'directory' },
      { path: 'node_modules/.cache', type: 'directory' },
    ];

    cleanupItems.forEach(({ path: itemPath, type }) => {
      const fullPath = path.join(this.projectRoot, itemPath);
      if (fs.existsSync(fullPath)) {
        if (type === 'directory') {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        log(`🗑️ Removed ${itemPath}`, 'green');
      }
    });
  }

  // Check Docker status
  checkDocker() {
    try {
      execSync('docker info', { stdio: 'pipe' });
      const version = execSync('docker --version', { encoding: 'utf8' }).trim();
      return version;
    } catch {
      throw new Error('Docker not available or not running');
    }
  }

  // Check Node.js version
  checkNode() {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    if (major < 18) {
      throw new Error(`Node.js ${version} (require v18+)`);
    }
    return version;
  }

  // Check NPM dependencies
  checkDependencies() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const nodeModulesExists = fs.existsSync(path.join(this.projectRoot, 'node_modules'));
    
    if (!nodeModulesExists) {
      throw new Error('node_modules not found - run npm install');
    }
    
    const depCount = Object.keys(pkg.dependencies || {}).length;
    const devDepCount = Object.keys(pkg.devDependencies || {}).length;
    return `${depCount} prod + ${devDepCount} dev dependencies`;
  }

  // Check required files
  checkRequiredFiles() {
    const requiredFiles = [
      'package.json',
      'template.html',
      'resume-data.json',
      'scripts/build.js',
      'scripts/dev-server.js',
      'Dockerfile',
      'Makefile',
    ];

    const missing = requiredFiles.filter(file => 
      !fs.existsSync(path.join(this.projectRoot, file))
    );

    if (missing.length > 0) {
      throw new Error(`Missing files: ${missing.join(', ')}`);
    }

    return `${requiredFiles.length} files present`;
  }

  // Check Git status
  checkGitStatus() {
    try {
      const isRepo = fs.existsSync(path.join(this.projectRoot, '.git'));
      if (!isRepo) {
        throw new Error('Not a Git repository');
      }

      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const changes = status.trim().split('\n').filter(line => line.trim());
      
      if (changes.length === 0) {
        return 'Clean working directory';
      } else {
        return `${changes.length} uncommitted changes`;
      }
    } catch {
      throw new Error('Git not available');
    }
  }

  // Check port availability
  checkPorts() {
    const ports = [3000, 3001];
    const results = [];

    ports.forEach(port => {
      try {
        execSync(`lsof -i :${port}`, { stdio: 'pipe' });
        results.push(`${port}:BUSY`);
      } catch {
        results.push(`${port}:FREE`);
      }
    });

    return results.join(', ');
  }

  // Quick development setup
  quickStart() {
    log('🚀 Quick Development Setup', 'cyan');
    console.log('===========================');

    try {
      log('1. Installing dependencies...', 'yellow');
      execSync('npm install', { stdio: 'inherit' });

      log('2. Building initial version...', 'yellow');  
      execSync('make build', { stdio: 'inherit' });

      log('3. Running health check...', 'yellow');
      this.healthCheck();

      console.log('');
      log('🎉 Development environment ready!', 'green');
      log('Next steps:', 'cyan');
      log('  • make dev     - Start development server', 'blue');
      log('  • make test-fast - Run quick tests', 'blue');  
      log('  • make status  - Show project status', 'blue');

    } catch (error) {
      log(`❌ Setup failed: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// CLI interface
function main() {
  const devTools = new DevTools();
  const command = process.argv[2];

  switch (command) {
    case 'health':
      devTools.healthCheck();
      break;
    case 'perf':
      devTools.analyzePerformance();
      break;
    case 'clean':
      devTools.cleanDev();
      break;
    case 'setup':
      devTools.quickStart();
      break;
    default:
      log('🛠️ Resume-as-Code Developer Tools', 'cyan');
      console.log('Usage: node scripts/dev-tools.js <command>');
      console.log('');
      console.log('Commands:');
      log('  health  - Run development environment health check', 'blue');
      log('  perf    - Analyze build and test performance', 'blue');
      log('  clean   - Clean development artifacts', 'blue');
      log('  setup   - Quick development environment setup', 'blue');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = DevTools;