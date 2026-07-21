// Request validation, CORS origin resolution, cache-key helpers.
// Pure module — no Worker APIs, node-testable.

const ALLOWED_ORIGINS = [
  // Primary prod — the site is served from this same origin (Workers Static
  // Assets), so its chat POSTs are same-origin and MUST be allowed.
  'https://resume.rafaracing.com.br',
  // Legacy origins kept allowed during the migration (they 301-redirect to the
  // domain above; harmless to keep on the list, avoids any transition breakage).
  'https://rafilkmp3.github.io',
  'https://resume-as-code.netlify.app',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
];
// Anchored — "https://deploy-preview-1--resume-as-code.netlify.app.evil.com" must NOT pass.
const PREVIEW_ORIGIN_RE = /^https:\/\/deploy-preview-\d+--resume-as-code\.netlify\.app$/;
// LAN mobile testing (`make get-lan-ip` flow): astro dev served on a private
// IPv4. RFC1918 ranges only, http, port 4321 — never routable from the internet.
const LAN_DEV_ORIGIN_RE =
  /^http:\/\/(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):4321$/;

/**
 * @param {string|null} originHeader raw Origin header
 * @returns {string|null} the origin to echo in Access-Control-Allow-Origin, or null if disallowed
 */
export function resolveCorsOrigin(originHeader) {
  if (!originHeader) return null;
  if (ALLOWED_ORIGINS.includes(originHeader)) return originHeader;
  if (PREVIEW_ORIGIN_RE.test(originHeader)) return originHeader;
  if (LAN_DEV_ORIGIN_RE.test(originHeader)) return originHeader;
  return null;
}

/**
 * Validates POST /api/chat body per the frozen API contract.
 * @param {unknown} body parsed JSON
 * @returns {{ok:true, message:string, history:Array<{role:string,content:string}>} | {error:string, status:number}}
 */
export function validateChatBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Invalid request body', status: 400 };
  }
  if (typeof body.message !== 'string' || body.message.trim().length === 0) {
    return { error: 'message is required', status: 400 };
  }
  const message = body.message.trim();
  if (message.length > 500) {
    return { error: 'message too long (max 500 characters)', status: 413 };
  }
  let history = [];
  if (body.history !== undefined) {
    if (!Array.isArray(body.history)) {
      return { error: 'history must be an array', status: 400 };
    }
    if (body.history.length > 6) {
      return { error: 'history too long (max 6 entries)', status: 400 };
    }
    for (const entry of body.history) {
      if (!entry || typeof entry !== 'object') {
        return { error: 'invalid history entry', status: 400 };
      }
      if (entry.role !== 'user' && entry.role !== 'assistant') {
        return { error: 'history role must be "user" or "assistant"', status: 400 };
      }
      if (typeof entry.content !== 'string' || entry.content.length > 400) {
        return { error: 'history content must be a string of max 400 characters', status: 400 };
      }
    }
    history = body.history.map((e) => ({ role: e.role, content: e.content }));
  }
  return { ok: true, message, history };
}

/**
 * Validates POST /api/feedback body per the frozen API contract.
 * @param {unknown} body parsed JSON
 * @returns {{ok:true, verdict:string, question:string|undefined, reply:string|undefined} | {error:string, status:number}}
 */
export function validateFeedbackBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Invalid request body', status: 400 };
  }
  if (body.verdict !== 'up' && body.verdict !== 'down') {
    return { error: 'verdict must be "up" or "down"', status: 400 };
  }
  if (body.question !== undefined && (typeof body.question !== 'string' || body.question.length > 500)) {
    return { error: 'question must be a string of max 500 characters', status: 400 };
  }
  if (body.reply !== undefined && (typeof body.reply !== 'string' || body.reply.length > 2000)) {
    return { error: 'reply must be a string of max 2000 characters', status: 400 };
  }
  return { ok: true, verdict: body.verdict, question: body.question, reply: body.reply };
}

/**
 * Normalizes a question for cache-key purposes: lowercase, strip punctuation
 * (unicode-aware — keeps letters/digits/whitespace), collapse whitespace, trim.
 * "How long at Uber??" and "  how long at uber " hit the same cache entry.
 */
export function normalizeQuestion(message) {
  return message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** djb2 hash → base36 string. Non-cryptographic — cache keys and IP pseudonyms only. */
export function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}
