const fs = require('fs');
const path = require('path');

describe('Build Process Validation', () => {
  const requiredFiles = [
    'package.json',
    'template.html',
    'resume-data.json',
    'build.js',
    'server.js',
    'dev-server.js',
  ];

  const requiredDirectories = [
    'assets',
    'assets/images',
    'tests',
    'tests/unit',
    'scripts',
  ];

  describe('Required Files Exist', () => {
    requiredFiles.forEach(file => {
      test(`${file} should exist`, () => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Required Directories Exist', () => {
    requiredDirectories.forEach(dir => {
      test(`${dir} directory should exist`, () => {
        const dirPath = path.join(process.cwd(), dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });
  });

  describe('Configuration Files Are Valid', () => {
    test('package.json should be valid JSON', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf8');

      expect(() => JSON.parse(packageContent)).not.toThrow();

      const packageJson = JSON.parse(packageContent);
      expect(packageJson.name).toBe('resume-as-code');
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
    });

    test('resume-data.json should be valid JSON', () => {
      const resumeDataPath = path.join(process.cwd(), 'resume-data.json');
      const resumeDataContent = fs.readFileSync(resumeDataPath, 'utf8');

      expect(() => JSON.parse(resumeDataContent)).not.toThrow();

      const resumeData = JSON.parse(resumeDataContent);
      expect(resumeData.basics).toBeDefined();
      expect(resumeData.basics.name).toBeDefined();
    });

    test('template.html should contain required placeholders', () => {
      const templatePath = path.join(process.cwd(), 'template.html');
      const templateContent = fs.readFileSync(templatePath, 'utf8');

      // Check for essential Handlebars placeholders
      expect(templateContent).toContain('{{basics.name}}');
      expect(templateContent).toContain('{{#each');
      expect(templateContent).toContain('</html>');
    });
  });

  describe('Asset Files', () => {
    test('profile image should exist', () => {
      const profileImagePath = path.join(
        process.cwd(),
        'assets/images/profile.jpeg'
      );
      expect(fs.existsSync(profileImagePath)).toBe(true);
    });

    test('profile image should be reasonable size', () => {
      const profileImagePath = path.join(
        process.cwd(),
        'assets/images/profile.jpeg'
      );
      const stats = fs.statSync(profileImagePath);

      // Should be between 1KB and 5MB
      expect(stats.size).toBeGreaterThan(1024);
      expect(stats.size).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('Test Configuration', () => {
    test('playwright.config.js should exist and be valid', () => {
      const playwrightConfigPath = path.join(
        process.cwd(),
        'playwright.config.js'
      );
      expect(fs.existsSync(playwrightConfigPath)).toBe(true);

      // Basic syntax check by requiring the file
      expect(() => require(playwrightConfigPath)).not.toThrow();
    });

    test('jest.config.js should exist and be valid', () => {
      const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);

      // Basic syntax check by requiring the file
      expect(() => require(jestConfigPath)).not.toThrow();
    });
  });

  describe('Security and Git Configuration', () => {
    test('.gitignore should exist', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
    });

    test('.dockerignore should exist', () => {
      const dockerignorePath = path.join(process.cwd(), '.dockerignore');
      expect(fs.existsSync(dockerignorePath)).toBe(true);
    });

    test('.gitignore should contain essential patterns', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('coverage');
      expect(gitignoreContent).toContain('.env');
    });
  });
});
