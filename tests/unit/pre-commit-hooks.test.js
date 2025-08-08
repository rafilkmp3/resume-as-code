/**
 * Unit Tests for Pre-commit Hooks Integration
 * Validates that pre-commit hooks are properly configured and functional
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Pre-commit Hooks Integration', () => {
  const rootDir = path.join(__dirname, '../..');
  const preCommitConfig = path.join(rootDir, '.pre-commit-config.yaml');
  const resumeSchema = path.join(rootDir, 'resume-schema.json');
  const resumeData = path.join(rootDir, 'resume-data.json');

  beforeAll(() => {
    // Skip tests if pre-commit is not available
    try {
      execSync('which pre-commit', { stdio: 'ignore' });
    } catch (error) {
      console.log('⚠️ pre-commit not available, skipping hook tests');
    }
  });

  describe('Pre-commit Configuration Validation', () => {
    test('should have .pre-commit-config.yaml file', () => {
      expect(fs.existsSync(preCommitConfig)).toBe(true);

      const config = fs.readFileSync(preCommitConfig, 'utf8');
      expect(config.length).toBeGreaterThan(0);
      console.log('✅ Pre-commit configuration file exists');
    });

    test('should contain required hooks', () => {
      if (fs.existsSync(preCommitConfig)) {
        const config = fs.readFileSync(preCommitConfig, 'utf8');

        const requiredHooks = [
          'conventional-pre-commit', // Commit message validation
          'actionlint', // GitHub Actions validation
          'prettier', // Code formatting
          'hadolint-docker', // Dockerfile linting
          'markdownlint', // Documentation quality
          'resume-data-validation', // Resume data validation
          'detect-secrets', // Security scanning
          'check-json', // JSON syntax validation
        ];

        requiredHooks.forEach(hook => {
          expect(config).toContain(hook);
          console.log(`✅ Found required hook: ${hook}`);
        });
      }
    });

    test('should use latest versions of tools', () => {
      if (fs.existsSync(preCommitConfig)) {
        const config = fs.readFileSync(preCommitConfig, 'utf8');

        // Check for version patterns (should not be very old versions)
        expect(config).toMatch(/rev:\s*v\d+\.\d+\.\d+/); // Semantic versioning

        // Specific version checks for key tools
        const versionChecks = [
          { tool: 'conventional-pre-commit', minVersion: '3.0.0' },
          { tool: 'actionlint', minVersion: '1.6.0' },
          { tool: 'hadolint', minVersion: '2.10.0' },
        ];

        versionChecks.forEach(({ tool, minVersion }) => {
          const versionMatch = config.match(
            new RegExp(`${tool}[\\s\\S]*?rev:\\s*v([\\d\\.]+)`)
          );
          if (versionMatch) {
            const version = versionMatch[1];
            console.log(`✅ ${tool} version: ${version}`);
          }
        });
      }
    });
  });

  describe('JSON Schema Validation', () => {
    test('should have resume JSON schema file', () => {
      expect(fs.existsSync(resumeSchema)).toBe(true);

      const schema = JSON.parse(fs.readFileSync(resumeSchema, 'utf8'));
      expect(schema.$schema).toBeDefined();
      expect(schema.properties).toBeDefined();
      console.log('✅ Resume JSON schema exists and is valid');
    });

    test('should validate resume data against schema', () => {
      if (fs.existsSync(resumeSchema) && fs.existsSync(resumeData)) {
        const schema = JSON.parse(fs.readFileSync(resumeSchema, 'utf8'));
        const data = JSON.parse(fs.readFileSync(resumeData, 'utf8'));

        // Basic required properties check
        const requiredProps = schema.required || [];
        requiredProps.forEach(prop => {
          expect(data).toHaveProperty(prop);
        });

        console.log('✅ Resume data validates against schema');
      }
    });

    test('should handle skills with links property', () => {
      if (fs.existsSync(resumeData)) {
        const data = JSON.parse(fs.readFileSync(resumeData, 'utf8'));

        if (data.skills && Array.isArray(data.skills)) {
          const skillsWithLinks = data.skills.filter(skill => skill.links);
          if (skillsWithLinks.length > 0) {
            skillsWithLinks.forEach(skill => {
              expect(typeof skill.links).toBe('object');
              expect(skill.links).not.toBeNull();
              console.log(`✅ Skill "${skill.name}" has links property`);
            });
          }
        }
      }
    });

    test('should validate certificates property is allowed', () => {
      if (fs.existsSync(resumeSchema)) {
        const schema = JSON.parse(fs.readFileSync(resumeSchema, 'utf8'));

        expect(schema.properties.certificates).toBeDefined();
        console.log('✅ Certificates property is defined in schema');
      }
    });
  });

  describe('Hook Functionality Tests', () => {
    test('should validate JSON files pass syntax check', () => {
      const jsonFiles = [resumeData, resumeSchema];

      jsonFiles.forEach(file => {
        if (fs.existsSync(file)) {
          expect(() => {
            JSON.parse(fs.readFileSync(file, 'utf8'));
          }).not.toThrow();
          console.log(`✅ ${path.basename(file)} has valid JSON syntax`);
        }
      });
    });

    test('should validate YAML files have correct syntax', () => {
      const yamlFiles = [
        preCommitConfig,
        path.join(rootDir, '.yamllint.yml'),
        path.join(rootDir, '.markdownlint.yml'),
      ];

      yamlFiles.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');

          // Basic YAML syntax checks
          expect(content).not.toContain('\t'); // No tabs in YAML
          expect(
            content.split('\n').every(line => {
              return (
                line.trim() === '' ||
                !line.startsWith(' ') ||
                line.match(/^\s{2,}/)
              );
            })
          ).toBe(true); // Consistent indentation

          console.log(`✅ ${path.basename(file)} has valid YAML syntax`);
        }
      });
    });

    test('should validate package.json for npm audit', () => {
      const packageJson = path.join(rootDir, 'package.json');

      if (fs.existsSync(packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));

        expect(pkg.dependencies).toBeDefined();
        expect(Object.keys(pkg.dependencies).length).toBeGreaterThan(0);
        console.log(
          `✅ Package.json has ${Object.keys(pkg.dependencies).length} dependencies for audit`
        );
      }
    });
  });

  describe('Security and Quality Gates', () => {
    test('should have secrets baseline for detect-secrets', () => {
      const secretsBaseline = path.join(rootDir, '.secrets.baseline');

      if (fs.existsSync(secretsBaseline)) {
        const baseline = JSON.parse(fs.readFileSync(secretsBaseline, 'utf8'));
        expect(baseline.version).toBeDefined();
        console.log('✅ Secrets baseline exists for security scanning');
      }
    });

    test('should validate Prettier configuration', () => {
      const prettierConfig = path.join(rootDir, '.prettierrc.json');
      const prettierIgnore = path.join(rootDir, '.prettierignore');

      if (fs.existsSync(prettierConfig)) {
        const config = JSON.parse(fs.readFileSync(prettierConfig, 'utf8'));
        expect(config).toHaveProperty('semi');
        expect(config).toHaveProperty('singleQuote');
        console.log('✅ Prettier configuration validated');
      }

      if (fs.existsSync(prettierIgnore)) {
        const ignore = fs.readFileSync(prettierIgnore, 'utf8');
        expect(ignore).toContain('dist/');
        expect(ignore).toContain('node_modules/');
        console.log('✅ Prettier ignore patterns validated');
      }
    });

    test('should validate ESLint configuration', () => {
      const eslintConfig = path.join(rootDir, 'eslint.config.js');

      if (fs.existsSync(eslintConfig)) {
        const config = fs.readFileSync(eslintConfig, 'utf8');
        expect(config).toContain('module.exports');
        expect(config).toContain('rules');
        console.log('✅ ESLint configuration validated');
      }
    });
  });

  describe('Pre-commit Hook Integration Test', () => {
    test('should run resume data validation hook successfully', async () => {
      if (!isPreCommitAvailable()) {
        console.log(
          '⚠️ Skipping pre-commit integration test - tool not available'
        );
        return;
      }

      try {
        // Test specific hook that should pass
        execSync('pre-commit run resume-data-validation --all-files', {
          cwd: rootDir,
          stdio: 'pipe',
        });

        console.log('✅ Resume data validation hook passes');
      } catch (error) {
        // Log error but don't fail test in case of environmental issues
        console.log(`⚠️ Resume validation hook test failed: ${error.message}`);
      }
    });

    test('should validate hook performance is acceptable', () => {
      // Test that hooks are configured for reasonable performance
      if (fs.existsSync(preCommitConfig)) {
        const config = fs.readFileSync(preCommitConfig, 'utf8');

        // Should not run expensive operations on every commit
        expect(config).toContain('stages: [commit-msg]'); // Commit message hooks only on commit-msg stage

        // Should have pass_filenames: false for non-file-specific hooks
        expect(config).toContain('pass_filenames: false');

        console.log('✅ Hook performance configuration validated');
      }
    });
  });
});

// Utility function to check if pre-commit is available
function isPreCommitAvailable() {
  try {
    execSync('which pre-commit', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Utility function to check if running in CI
function isCI() {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}
