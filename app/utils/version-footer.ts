import { execSync } from 'child_process';

export interface VersionFooterData {
  text: string;
  href: string;
  ariaLabel: string;
  isProduction: boolean;
}

/**
 * Get version footer data based on current environment
 *
 * Production (GitHub Pages): Links to specific release tag
 * PR Preview (Netlify): Links to PR discussion
 * Staging/Local: Links to commit SHA for exact code reference
 *
 * @returns VersionFooterData object with text, href, and aria-label
 */
export function getVersionFooterData(): VersionFooterData {
  const version = process.env.npm_package_version || 'unknown';
  const isProduction = process.env.GITHUB_PAGES === 'true';
  const prNumber = process.env.REVIEW_ID; // Set by astro-build action for PR previews

  if (isProduction) {
    // Production: Link to specific release tag
    return {
      text: `v${version} · Release notes`,
      href: `https://github.com/rafilkmp3/resume-as-code/releases/tag/v${version}`,
      ariaLabel: `View release notes for version ${version}`,
      isProduction: true
    };
  }

  // PR Preview: Link to PR discussion
  if (prNumber) {
    return {
      text: `v${version} · PR #${prNumber}`,
      href: `https://github.com/rafilkmp3/resume-as-code/pull/${prNumber}`,
      ariaLabel: `View pull request #${prNumber}`,
      isProduction: false
    };
  }

  // Staging/Local: Link to commit SHA (always valid)
  try {
    const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const shortSha = commitSha.substring(0, 7);

    return {
      text: `v${version} · ${shortSha}`,
      href: `https://github.com/rafilkmp3/resume-as-code/commit/${commitSha}`,
      ariaLabel: `View commit ${shortSha} on GitHub`,
      isProduction: false
    };
  } catch (error) {
    // Fallback if git commands fail (shouldn't happen in CI/CD, but safe)
    return {
      text: `v${version} · Development`,
      href: 'https://github.com/rafilkmp3/resume-as-code',
      ariaLabel: `View repository on GitHub`,
      isProduction: false
    };
  }
}
