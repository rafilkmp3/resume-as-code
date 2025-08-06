module.exports = {
  // Root directory
  rootDir: '..',
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test files
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/unit/**/*.spec.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.js',
    'build.js',
    'dev-server.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!node_modules/**'
  ],
  
  coverageDirectory: 'coverage',
  
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Coverage thresholds disabled for build scripts
  // coverageThreshold: {
  //   global: {
  //     branches: 10,
  //     functions: 10,
  //     lines: 10,
  //     statements: 10
  //   }
  // },
  
  // Module file extensions
  moduleFileExtensions: [
    'js',
    'json',
    'html'
  ],
  
  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/test-results/'
  ],
  
  // Verbose output
  verbose: true,
  
  // Setup files for mocking global APIs
};