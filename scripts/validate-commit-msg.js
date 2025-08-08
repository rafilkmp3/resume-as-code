#!/usr/bin/env node
const fs = require('fs');

// Conventional commit pattern - more flexible for longer descriptions
const CONVENTIONAL_COMMIT_PATTERN =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?(!)?: .+/;

// Extended patterns for more specific validation
const PATTERNS = {
  type: /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)/,
  scope:
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))/,
  breaking:
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?(!):/,
  description: /.{1,50}$/,
};

const TYPE_DESCRIPTIONS = {
  feat: 'A new feature',
  fix: 'A bug fix',
  docs: 'Documentation only changes',
  style:
    'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
  refactor: 'A code change that neither fixes a bug nor adds a feature',
  perf: 'A code change that improves performance',
  test: 'Adding missing tests or correcting existing tests',
  build:
    'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
  ci: 'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
  chore: "Other changes that don't modify src or test files",
  revert: 'Reverts a previous commit',
};

function validateCommitMessage(message) {
  const lines = message.trim().split('\n');
  const firstLine = lines[0].trim();

  console.log(`🔍 Validating commit message: "${firstLine}"`);

  // Check if it matches the basic conventional commit pattern
  if (!CONVENTIONAL_COMMIT_PATTERN.test(firstLine)) {
    return {
      valid: false,
      error: 'Commit message does not follow Conventional Commits format',
      details: [
        'Expected format: <type>[optional scope]: <description>',
        '',
        'Example: feat(auth): add OAuth2 login support',
        '         fix: resolve memory leak in pagination',
        '         docs: update API documentation',
        '',
        'Valid types:',
        ...Object.entries(TYPE_DESCRIPTIONS).map(
          ([type, desc]) => `  ${type.padEnd(8)} - ${desc}`
        ),
      ],
    };
  }

  // Extract components - handle descriptions that might have special characters
  const match = firstLine.match(/^([a-zA-Z]+)(\([^)]+\))?(!)?: (.*)$/);
  if (!match) {
    return {
      valid: false,
      error: 'Failed to parse commit message components',
      details: [`First line: "${firstLine}"`],
    };
  }

  const [, type, scope, breaking, description] = match;

  // Validate type
  if (!TYPE_DESCRIPTIONS[type]) {
    return {
      valid: false,
      error: `Invalid commit type: "${type}"`,
      details: [
        'Valid types are:',
        ...Object.keys(TYPE_DESCRIPTIONS).map(t => `  ${t}`),
      ],
    };
  }

  // Validate description length
  if (description.length < 1) {
    return {
      valid: false,
      error: 'Description cannot be empty',
    };
  }

  // Allow longer descriptions but warn if subject line is too long
  if (description.length > 50) {
    console.log(
      `⚠️  Description is ${description.length} chars. Consider keeping the subject line under 50 chars for better readability.`
    );
    console.log(
      '💡 Long descriptions are fine for detailed commits - GitHub will wrap them appropriately.'
    );
  }

  // Check if description starts with lowercase (conventional style)
  if (description[0] !== description[0].toLowerCase()) {
    console.log(
      '⚠️  Description should start with lowercase letter (conventional style)'
    );
  }

  // Validate that description doesn't end with period
  if (description.endsWith('.')) {
    console.log(
      '⚠️  Description should not end with a period (conventional style)'
    );
  }

  console.log('✅ Commit message follows Conventional Commits format');

  if (breaking) {
    console.log(
      '🚨 BREAKING CHANGE detected - this will trigger a major version bump'
    );
  }

  if (type === 'feat') {
    console.log('✨ New feature - this will trigger a minor version bump');
  }

  if (['fix', 'perf'].includes(type)) {
    console.log(
      '🔧 Bug fix/performance improvement - this will trigger a patch version bump'
    );
  }

  return {
    valid: true,
    type,
    scope: scope ? scope.slice(1, -1) : null, // Remove parentheses
    breaking: !!breaking,
    description,
  };
}

function main() {
  // Get commit message from file or stdin
  let commitMessage = '';

  if (process.argv.length > 2) {
    // Read from commit message file (used by git hooks)
    const commitMsgFile = process.argv[2];
    try {
      commitMessage = fs.readFileSync(commitMsgFile, 'utf8');
    } catch (error) {
      console.error(`❌ Failed to read commit message file: ${commitMsgFile}`);
      process.exit(1);
    }
  } else {
    // Read from stdin (for testing)
    console.log('📝 Enter commit message (press Ctrl+D when done):');
    const stdin = process.stdin;
    stdin.setEncoding('utf8');

    return new Promise(resolve => {
      stdin.on('data', data => {
        commitMessage += data;
      });

      stdin.on('end', () => {
        processMessage(commitMessage.trim());
        resolve();
      });
    });
  }

  processMessage(commitMessage);
}

function processMessage(message) {
  if (!message || message.trim().length === 0) {
    console.error('❌ Empty commit message');
    process.exit(1);
  }

  const result = validateCommitMessage(message);

  if (result.valid) {
    console.log('🎉 Commit message is valid!');
    process.exit(0);
  } else {
    console.error(`❌ ${result.error}`);
    if (result.details) {
      console.error('');
      result.details.forEach(detail => console.error(detail));
    }
    console.error('');
    console.error(
      '📚 Learn more about Conventional Commits: https://www.conventionalcommits.org/'
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateCommitMessage };
