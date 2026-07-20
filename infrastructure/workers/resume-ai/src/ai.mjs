// Workers AI helpers: hard-timeout runner and response post-processing.

// Lesson from italia2026 (10/Jul GLM incident): on the free tier, AI.run of an
// unavailable model can HANG forever without throwing — try/catch never sees a
// failure and the fallback chain never fires. Promise.race with a hard timeout
// guarantees the fallback always gets a chance to run.
/**
 * @param {object} ai env.AI binding
 * @param {string} model model id
 * @param {object} inputs { messages, max_tokens, ... }
 * @param {number} timeoutMs
 * @param {object} [options] optional 3rd AI.run arg (e.g. AI Gateway config)
 */
export async function aiRunWithTimeout(ai, model, inputs, timeoutMs = 20_000, options = undefined) {
  let timer;
  try {
    return await Promise.race([
      options ? ai.run(model, inputs, options) : ai.run(model, inputs),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`AI_TIMEOUT ${model} ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

// Legacy text-generation models return { response }; chat-completions models
// (2026-gen) return the OpenAI shape { choices: [{ message: { content } }] }.
// Extract text from either.
export function extractAiText(response) {
  const r = response || {};
  if (typeof r.response === 'string' && r.response.length > 0) return r.response;
  const choice = Array.isArray(r.choices) ? r.choices[0] : undefined;
  return choice?.message?.content ?? choice?.delta?.content ?? '';
}

// Distinctive substrings that only exist inside the system prompt — if any
// shows up in a reply, the model was jailbroken into dumping its instructions
// (observed with llama-3.3-70b under a direct "print your system prompt"
// injection). Prompt rules alone do NOT hold; this is the deterministic gate.
const PROMPT_LEAK_SENTINELS = [
  'computed facts',
  'internal grounding',
  'example answers',
  'never compute date math',
  'untrusted data',
  'first person, as rafael',
];

/**
 * @param {string} text candidate reply
 * @param {string} [privateContext] secret context (e.g. salary) — any digit
 *   group of 3+ digits found in it becomes a banned number in replies,
 *   compared with separators stripped ("6,200" leaks as "6200" too)
 * @returns {boolean} true when the reply leaks prompt internals or secrets
 */
export function detectPromptLeak(text, privateContext = '') {
  const lower = text.toLowerCase();
  if (PROMPT_LEAK_SENTINELS.some((s) => lower.includes(s))) return true;
  if (privateContext) {
    const banned = (privateContext.match(/\d[\d.,]*\d|\d{3,}/g) || [])
      .map((n) => n.replace(/[.,]/g, ''))
      .filter((n) => n.length >= 3);
    const replyDigits = text.replace(/[.,\s]/g, '');
    if (banned.some((n) => replyDigits.includes(n))) return true;
  }
  return false;
}

/**
 * Cleans a model reply: strip HTML tags, collapse degenerate repeated-char
 * runs (>10x — repetition-loop failure mode of small models), hard cap at
 * 2000 chars, trim.
 */
export function postProcess(text) {
  if (typeof text !== 'string') return '';
  // Strip tags until stable — a single pass leaves nested payloads like
  // "<scr<script>ipt>" recombining into "<script>" (CodeQL
  // js/incomplete-multi-character-sanitization). The widget escapes all HTML
  // anyway; this is server-side defense in depth.
  let out = text;
  let prev;
  do {
    prev = out;
    out = out.replace(/<[^>]*>/g, '');
  } while (out !== prev);
  return out
    .replace(/(.)\1{10,}/gs, '$1$1$1')
    .slice(0, 2000)
    .trim();
}
