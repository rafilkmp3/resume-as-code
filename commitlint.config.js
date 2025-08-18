module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New features
        'fix',      // Bug fixes
        'chore',    // Maintenance, dependencies
        'docs',     // Documentation
        'style',    // Code formatting (hidden in changelog)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Test changes (hidden in changelog)
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert'    // Revert commits
      ]
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100]
  }
};
