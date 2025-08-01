
const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, 'CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, 'utf-8');
const version = process.env.GITHUB_REF.replace('refs/tags/v', '');

const versionHeader = `## [${version}]`;
const startIndex = changelog.indexOf(versionHeader);

if (startIndex === -1) {
  console.error(`Could not find version ${version} in CHANGELOG.md`);
  process.exit(1);
}

const nextVersionIndex = changelog.indexOf('## [', startIndex + versionHeader.length);
const endIndex = nextVersionIndex === -1 ? changelog.length : nextVersionIndex;

const releaseNotes = changelog.substring(startIndex + versionHeader.length, endIndex).trim();

console.log(releaseNotes);
