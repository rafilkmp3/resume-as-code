// Cache-version signature — shared by the Worker (cache read/write) and the
// card-seed script so both compute the SAME keys.
//
// The signature folds in:
//   - PROMPT_VERSION: bump by hand when prompt/answer LOGIC changes (wording,
//     rules, model chain) without a resume edit.
//   - a hash of the bundled resume CONTENT: so ANY resume.json edit (e.g.
//     filling in the DrAnsay placeholders) automatically busts every cached
//     answer — no manual step. Stale answers can never outlive a content change.
//
// On deploy, the seed step re-writes the 4 curated card answers under the
// current signature, so the suggestion cards are always instant AND current.

import { hashString } from './guards.mjs';

export const PROMPT_VERSION = 'p7';

/** @param {object} resume the bundled JSON Resume object */
export function contentSig(resume) {
  return `${PROMPT_VERSION}-${hashString(JSON.stringify(resume))}`;
}

/**
 * Full cache key for a question under the current content signature.
 * @param {object} resume
 * @param {string} keyHash hashString(normalizeQuestion(message))
 */
export function cacheKey(resume, keyHash) {
  return `chat:${contentSig(resume)}:${keyHash}`;
}
