module.exports = {
  // Root directory
  rootDir: '..',

  // Test environment
  testEnvironment: 'jsdom',

  // Only run essential tests for fast execution
  testMatch: [
    '<rootDir>/tests/unit/build-utils.test.js',
    '<rootDir>/tests/unit/file-validation.test.js',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],

  // Disable coverage for speed
  collectCoverage: false,

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/test-results/'],

  // Fast execution settings
  verbose: false,
  silent: true,
  maxWorkers: 1,
};