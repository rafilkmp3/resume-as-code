/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // Enhanced type enforcement for better changelog generation
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New features (MINOR version bump)
        'fix',      // Bug fixes (PATCH version bump) 
        'perf',     // Performance improvements (PATCH version bump)
        'revert',   // Reverts a previous commit (PATCH version bump)
        'docs',     // Documentation only changes (no version bump)
        'style',    // Changes that don't affect code meaning (no version bump)
        'refactor', // Code refactoring without new features or bug fixes (no version bump)
        'test',     // Adding/correcting tests (no version bump)
        'build',    // Changes to build system or external dependencies (no version bump)
        'ci',       // Changes to CI configuration files and scripts (no version bump)
        'chore'     // Other changes that don't modify src or test files (no version bump)
      ]
    ],
    
    // Stricter formatting for consistent changelog
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-empty': [0], // Allow commits without scope
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-min-length': [2, 'always', 10], // Enforce meaningful descriptions
    'subject-max-length': [2, 'always', 50], // Keep subjects concise
    'header-max-length': [2, 'always', 72],
    
    // Body formatting for detailed changelogs
    'body-leading-blank': [2, 'always'], // Enforced (not warning)
    'body-case': [0], // Allow any case in body
    'body-max-line-length': [2, 'always', 100],
    'body-min-length': [0], // Allow empty body
    
    // Footer formatting for breaking changes and references
    'footer-leading-blank': [2, 'always'], // Enforced for breaking changes
    'footer-max-line-length': [2, 'always', 100],
    
    // References and breaking changes
    'references-empty': [0], // Allow commits without issue references
    'signed-off-by': [0] // Allow but don't require sign-off
  },

  ignores: [
    // Enhanced ignores for automated commits
    (commit) => commit.includes('Merge pull request'),
    (commit) => commit.includes('Merge branch'),
    (commit) => commit.includes('Merge remote-tracking'),
    (commit) => /^v\d+\.\d+\.\d+/.test(commit), // Version tags
    (commit) => /^chore\(release\)/.test(commit), // Release commits
    (commit) => /^chore\(deps\)/.test(commit.split('\n')[0]) && commit.includes('dependabot'), // Dependabot commits
    (commit) => commit.includes('🤖 Generated with [Claude Code]'),
    (commit) => commit.includes('Initial commit'),
    (commit) => /^Revert "/.test(commit) // Git revert messages
  ],

  defaultIgnores: true,
  
  // Enhanced help message with changelog guidance
  helpUrl: 'https://www.conventionalcommits.org/',
  
  // Prompt configuration for interactive commits
  prompt: {
    settings: {},
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit'
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: '✨ A new feature (triggers MINOR release)',
            title: 'Features',
            emoji: '✨'
          },
          fix: {
            description: '🐛 A bug fix (triggers PATCH release)',
            title: 'Bug Fixes', 
            emoji: '🐛'
          },
          perf: {
            description: '⚡ A code change that improves performance (triggers PATCH release)',
            title: 'Performance Improvements',
            emoji: '⚡'
          },
          revert: {
            description: '⏪ Reverts a previous commit (triggers PATCH release)',
            title: 'Reverts',
            emoji: '⏪'
          },
          docs: {
            description: '📚 Documentation only changes (no release)',
            title: 'Documentation',
            emoji: '📚'
          },
          style: {
            description: '💎 Changes that do not affect the meaning of code (no release)',
            title: 'Styles',
            emoji: '💎'
          },
          refactor: {
            description: '📦 A code change that neither fixes a bug nor adds a feature (no release)',
            title: 'Code Refactoring',
            emoji: '📦'
          },
          test: {
            description: '🚨 Adding missing tests or correcting existing tests (no release)',
            title: 'Tests',
            emoji: '🚨'
          },
          build: {
            description: '🛠 Changes that affect the build system or external dependencies (no release)',
            title: 'Builds',
            emoji: '🛠'
          },
          ci: {
            description: '⚙️ Changes to CI configuration files and scripts (no release)',
            title: 'Continuous Integrations',
            emoji: '⚙️'
          },
          chore: {
            description: '♻️ Other changes that don\'t modify src or test files (no release)',
            title: 'Chores',
            emoji: '♻️'
          }
        }
      },
      scope: {
        description: 'What is the scope of this change (e.g. component, file name, feature area):'
      },
      subject: {
        description: 'Write a short, imperative tense description of the change (10-50 chars):'
      },
      body: {
        description: 'Provide a longer description of the change (optional):'
      },
      isBreaking: {
        description: 'Are there any breaking changes? (triggers MAJOR release)'
      },
      breakingBody: {
        description: 'A BREAKING CHANGE commit requires a body. Please enter a longer description:'
      },
      breaking: {
        description: 'Describe the breaking changes:'
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?'
      },
      issuesBody: {
        description: 'If issues are closed, the commit requires a body. Please enter a longer description:'
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123"):'
      }
    }
  }
};