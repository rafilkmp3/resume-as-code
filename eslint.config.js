// ESLint configuration for resume-as-code project
// Simplified config without external dependencies

module.exports = [
  // Apply to all JavaScript files
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script', // Default to script for Node.js
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        // Browser globals for build scripts that may use Puppeteer
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      // Basic recommended rules
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off', // Allow console for build scripts
      'no-debugger': 'error',
      'no-unreachable': 'error',
      'no-duplicate-keys': 'error',
      'no-empty': 'error',
      'no-extra-semi': 'error',
      'no-func-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',

      // Additional rules for code quality
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: 'error',
      curly: 'error',

      // Style rules (will be handled by Prettier)
      indent: 'off',
      quotes: 'off',
      semi: 'off',
    },
  },

  // Special configuration for ES modules
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },

  // Test files configuration
  {
    files: ['test*.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.git/**',
      'coverage/**',
      '.cache/**',
      'test-screenshots/**',
    ],
  },
];
