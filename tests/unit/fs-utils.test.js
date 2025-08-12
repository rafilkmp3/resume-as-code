const fs = require('fs');
const path = require('path');
const os = require('os');
const { copyRecursive } = require('../../scripts/utils/fs-utils');

describe('fs-utils', () => {
  let tempDir;
  let sourceDir;
  let destDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-utils-test-'));
    sourceDir = path.join(tempDir, 'source');
    destDir = path.join(tempDir, 'dest');

    fs.mkdirSync(sourceDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('copyRecursive', () => {
    test('should copy a single file', () => {
      const testFile = path.join(sourceDir, 'test.txt');
      const expectedDest = path.join(destDir, 'test.txt');

      fs.writeFileSync(testFile, 'test content');
      fs.mkdirSync(destDir, { recursive: true });

      copyRecursive(sourceDir, destDir);

      expect(fs.existsSync(expectedDest)).toBe(true);
      expect(fs.readFileSync(expectedDest, 'utf8')).toBe('test content');
    });

    test('should copy multiple files', () => {
      const testFile1 = path.join(sourceDir, 'file1.txt');
      const testFile2 = path.join(sourceDir, 'file2.js');

      fs.writeFileSync(testFile1, 'content 1');
      fs.writeFileSync(testFile2, 'content 2');
      fs.mkdirSync(destDir, { recursive: true });

      copyRecursive(sourceDir, destDir);

      expect(fs.existsSync(path.join(destDir, 'file1.txt'))).toBe(true);
      expect(fs.existsSync(path.join(destDir, 'file2.js'))).toBe(true);
      expect(fs.readFileSync(path.join(destDir, 'file1.txt'), 'utf8')).toBe('content 1');
      expect(fs.readFileSync(path.join(destDir, 'file2.js'), 'utf8')).toBe('content 2');
    });

    test('should copy nested directories recursively', () => {
      const nestedDir = path.join(sourceDir, 'nested', 'deep');
      const nestedFile = path.join(nestedDir, 'nested-file.txt');

      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(nestedFile, 'nested content');
      fs.mkdirSync(destDir, { recursive: true });

      copyRecursive(sourceDir, destDir);

      const expectedNestedFile = path.join(destDir, 'nested', 'deep', 'nested-file.txt');
      expect(fs.existsSync(expectedNestedFile)).toBe(true);
      expect(fs.readFileSync(expectedNestedFile, 'utf8')).toBe('nested content');
    });

    test('should create destination directories that do not exist', () => {
      const testFile = path.join(sourceDir, 'test.txt');
      fs.writeFileSync(testFile, 'test content');

      // Don't create destDir beforehand
      copyRecursive(sourceDir, destDir);

      expect(fs.existsSync(destDir)).toBe(true);
      expect(fs.existsSync(path.join(destDir, 'test.txt'))).toBe(true);
    });

    test('should handle empty directories', () => {
      const emptyDir = path.join(sourceDir, 'empty');
      fs.mkdirSync(emptyDir);
      fs.mkdirSync(destDir, { recursive: true });

      copyRecursive(sourceDir, destDir);

      expect(fs.existsSync(path.join(destDir, 'empty'))).toBe(true);
      expect(fs.statSync(path.join(destDir, 'empty')).isDirectory()).toBe(true);
    });

    test('should handle complex directory structures', () => {
      const structure = [
        'file1.txt',
        'dir1/file2.txt',
        'dir1/subdir/file3.js',
        'dir2/file4.css',
        'dir2/subdir1/subdir2/file5.html'
      ];

      // Create the structure
      structure.forEach(filePath => {
        const fullPath = path.join(sourceDir, filePath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, `content of ${filePath}`);
      });

      fs.mkdirSync(destDir, { recursive: true });
      copyRecursive(sourceDir, destDir);

      // Verify all files were copied
      structure.forEach(filePath => {
        const expectedPath = path.join(destDir, filePath);
        expect(fs.existsSync(expectedPath)).toBe(true);
        expect(fs.readFileSync(expectedPath, 'utf8')).toBe(`content of ${filePath}`);
      });
    });

    test('should preserve file permissions', () => {
      const executableFile = path.join(sourceDir, 'executable.sh');
      fs.writeFileSync(executableFile, '#!/bin/bash\necho "test"');
      fs.chmodSync(executableFile, 0o755);

      fs.mkdirSync(destDir, { recursive: true });
      copyRecursive(sourceDir, destDir);

      const copiedFile = path.join(destDir, 'executable.sh');
      expect(fs.existsSync(copiedFile)).toBe(true);

      const originalStats = fs.statSync(executableFile);
      const copiedStats = fs.statSync(copiedFile);
      expect(copiedStats.mode).toBe(originalStats.mode);
    });

    test('should handle source directory that does not exist', () => {
      const nonExistentSource = path.join(tempDir, 'nonexistent');

      expect(() => {
        copyRecursive(nonExistentSource, destDir);
      }).toThrow();
    });

    test('should overwrite existing files in destination', () => {
      const testFile = path.join(sourceDir, 'test.txt');
      const destFile = path.join(destDir, 'test.txt');

      fs.writeFileSync(testFile, 'new content');
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(destFile, 'old content');

      copyRecursive(sourceDir, destDir);

      expect(fs.readFileSync(destFile, 'utf8')).toBe('new content');
    });
  });
});
