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

/**
 * Cleans a model reply: strip HTML tags, collapse degenerate repeated-char
 * runs (>10x — repetition-loop failure mode of small models), hard cap at
 * 2000 chars, trim.
 */
export function postProcess(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/(.)\1{10,}/gs, '$1$1$1')
    .slice(0, 2000)
    .trim();
}
