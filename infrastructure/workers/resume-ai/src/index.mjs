// resume-ai — standalone Cloudflare Worker powering the resume-site chatbot.
// Zero npm dependencies. Native Workers AI binding (env.AI), KV for rate
// limiting / caching / budget / logs. See README.md for the API contract.

// Import attribute keeps this file loadable by BOTH wrangler's esbuild
// (bundles the JSON at deploy time) and plain Node (smoke tests).
import resume from '../../../../app/data/resume.json' with { type: 'json' };
import { computeFacts } from './facts.mjs';
import { buildSystemPrompt } from './prompt.mjs';
import {
  validateChatBody,
  validateFeedbackBody,
  resolveCorsOrigin,
  normalizeQuestion,
  hashString,
} from './guards.mjs';
import { aiRunWithTimeout, extractAiText, postProcess, detectPromptLeak } from './ai.mjs';

// Fallback chain — free-tier models hang/fail routinely; every step has a hard
// timeout so the next one always gets a chance (see ai.mjs).
// Worst-case chain total (15+12+8 = 35s) must stay under the widget's 45s
// AbortController timeout, or slow fallbacks get aborted client-side after
// the budget was already spent server-side.
const MODEL_CHAIN = [
  { model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', timeoutMs: 15_000, temperature: 0.1 },
  { model: '@cf/meta/llama-4-scout-17b-16e-instruct', timeoutMs: 12_000, temperature: 0.3 },
  { model: '@cf/meta/llama-3.1-8b-instruct-fast', timeoutMs: 8_000 },
];

// Workers AI free-tier quota/capacity errors (error 3040 et al.).
const QUOTA_RE = /3040|quota|capacity|rate.?limit/i;

const RATE_LIMIT_CHAT = { max: 20, ttl: 600 }; // 20 req / 10 min per IP (active recruiter chats + the 12-question eval fit in one window)
const RATE_LIMIT_FEEDBACK = { max: 20, ttl: 600 }; // 20 req / 10 min per IP
// Counted per AI.run ATTEMPT (a request can burn up to 3 on fallback). Also
// sized so a fully-spent day stays under the KV free tier's ~1000 writes/day
// (each request costs ~3-4 KV writes: rate-limit, budget, log, cache).
const DAILY_BUDGET = 200;
const DAILY_FEEDBACK_BUDGET = 100; // caps fb:* KV writes so feedback spam can't exhaust the KV write quota
const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days
const LOG_TTL = 30 * 24 * 60 * 60; // 30 days

// Where humans land when they open the API host in a browser.
const SITE_URL = 'https://rafilkmp3.github.io/resume-as-code/';

const STATIC_FALLBACK_REPLY =
  "I'm having trouble reaching my AI brain right now. You can reach me directly at rafaelbsathler@gmail.com or on LinkedIn: https://www.linkedin.com/in/rafaelbsathler/ — I'll be happy to answer your questions.";

const QUOTA_MESSAGE =
  "I've hit my free daily AI quota. Please try again tomorrow, or contact me directly at rafaelbsathler@gmail.com or https://www.linkedin.com/in/rafaelbsathler/.";

const LEAK_REFUSAL_REPLY =
  "Nice try 🙂 — my internal notes stay with me. Ask me anything about my experience, skills, or availability, or reach me directly at rafaelbsathler@gmail.com.";

// AI Gateway — NOT provisioned yet (same lesson as italia2026 B-397b: passing
// a gateway id that does not exist makes EVERY AI.run call fail). Enable ONLY
// after creating the gateway slug "resume-ai" in the Cloudflare dashboard
// (AI > AI Gateway > Create gateway), then pass gatewayOpts as the 3rd arg of
// AI.run (the `options` param of aiRunWithTimeout).
// const gatewayOpts = { gateway: { id: 'resume-ai', cacheTtl: 604800 } };

function baseHeaders(corsOrigin, { json = true } = {}) {
  const headers = {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    Vary: 'Origin',
  };
  if (json) headers['Content-Type'] = 'application/json';
  if (corsOrigin) headers['Access-Control-Allow-Origin'] = corsOrigin;
  return headers;
}

function jsonResponse(status, body, corsOrigin) {
  return new Response(JSON.stringify(body), { status, headers: baseHeaders(corsOrigin) });
}

function preflightResponse(corsOrigin) {
  return new Response(null, {
    status: 204,
    headers: {
      ...baseHeaders(corsOrigin, { json: false }),
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// KV counter. Read-modify-write is NOT atomic (KV has no increment), so all
// limits here are best-effort throttles, not exact quotas. failClosed governs
// KV-outage behavior: convenience limits (per-IP) fail open so a KV blip never
// takes the chatbot down, but quota-protecting checks (daily budgets) fail
// CLOSED — otherwise exhausting the KV write quota would switch every guard
// off exactly when the system is under attack.
async function bumpCounter(kv, key, max, ttl, failClosed = false) {
  try {
    const count = parseInt((await kv.get(key)) ?? '0', 10);
    if (count >= max) return false;
    await kv.put(key, String(count + 1), { expirationTtl: ttl });
    return true;
  } catch {
    return !failClosed;
  }
}

// Fixed-window per-IP limit. The window index in the key means counts
// accumulate within a window and expire with it — unlike a rolling TTL
// refresh, which never decays under steady traffic and silently turns
// "10 per 10 min" into "10 per activity session".
async function rateLimit(kv, prefix, ip, { max, ttl }) {
  const now = Date.now();
  const windowIndex = Math.floor(now / (ttl * 1000));
  const retryAfterSeconds = ttl - (Math.floor(now / 1000) % ttl);
  const allowed = await bumpCounter(kv, `${prefix}:${ip}:${windowIndex}`, max, ttl * 2, false);
  return { allowed, retryAfterSeconds };
}

async function handleChat(request, env, ctx, corsOrigin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' }, corsOrigin);
  }
  const validated = validateChatBody(body);
  if (!validated.ok) {
    return jsonResponse(validated.status, { error: validated.error }, corsOrigin);
  }
  const { message, history } = validated;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rl = await rateLimit(env.RESUME_AI_KV, 'rl', ip, RATE_LIMIT_CHAT);
  if (!rl.allowed) {
    return jsonResponse(
      429,
      { error: 'Rate limit exceeded — please wait a few minutes.', retryAfterSeconds: rl.retryAfterSeconds },
      corsOrigin,
    );
  }

  // Response cache — only for history-less questions (a follow-up depends on
  // conversation context, so caching it would serve wrong answers).
  // Version-suffixed — bump whenever prompt/facts logic changes, or stale
  // cached answers keep serving for CACHE_TTL (italia2026 lesson).
  const cacheKey = `chat:v4:${hashString(normalizeQuestion(message))}`;
  if (history.length === 0) {
    try {
      const cached = await env.RESUME_AI_KV.get(cacheKey, 'json');
      if (cached && cached.reply) {
        return jsonResponse(200, { reply: cached.reply, model: cached.model, cached: true }, corsOrigin);
      }
    } catch {
      // fail open — treat as cache miss
    }
  }

  const day = new Date().toISOString().slice(0, 10);
  const todayISO = day;
  // SALARY_CONTEXT is a Worker secret (wrangler secret put / .dev.vars) — the
  // repo is public, so compensation data must never appear in code.
  const privateContext = env.SALARY_CONTEXT || '';
  const systemPrompt = buildSystemPrompt(resume, computeFacts(resume, todayISO), todayISO, privateContext);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  const started = Date.now();
  let reply = null;
  let modelUsed = null;
  for (const step of MODEL_CHAIN) {
    // Global daily budget, counted per AI.run ATTEMPT (fallback retries burn
    // real neurons too) and checked AFTER the cache so cache hits are free.
    // Fail-closed: a KV outage must not disable the quota guard.
    if (!(await bumpCounter(env.RESUME_AI_KV, `budget:${day}`, DAILY_BUDGET, 172_800, true))) {
      return jsonResponse(503, { error: QUOTA_MESSAGE }, corsOrigin);
    }
    try {
      const inputs = { messages, max_tokens: 500 };
      if (step.temperature !== undefined) inputs.temperature = step.temperature;
      const raw = await aiRunWithTimeout(env.AI, step.model, inputs, step.timeoutMs /* , gatewayOpts */);
      const text = postProcess(extractAiText(raw));
      if (text && detectPromptLeak(text, privateContext)) {
        // Jailbroken reply (prompt dump or secret numbers) — deterministic
        // refusal; prompt-side rules alone do not hold against injection.
        console.warn(`[resume-ai] leak guard tripped on ${step.model}`);
        reply = LEAK_REFUSAL_REPLY;
        modelUsed = 'leak-guard';
        break;
      }
      if (text) {
        reply = text;
        modelUsed = step.model;
        break;
      }
      console.warn(`[resume-ai] ${step.model} returned empty text, trying next`);
    } catch (err) {
      const msg = String(err?.message || err);
      if (QUOTA_RE.test(msg)) {
        console.warn(`[resume-ai] quota exhausted on ${step.model}: ${msg}`);
        return jsonResponse(503, { error: QUOTA_MESSAGE }, corsOrigin);
      }
      console.warn(`[resume-ai] ${step.model} failed: ${msg}`);
    }
  }

  const ms = Date.now() - started;
  const degraded = reply === null;
  if (degraded) {
    // 200 (not 5xx) on total model failure — avoids client retry storms.
    reply = STATIC_FALLBACK_REPLY;
    modelUsed = 'fallback-static';
  }

  if (!degraded && history.length === 0) {
    ctx.waitUntil(
      env.RESUME_AI_KV.put(cacheKey, JSON.stringify({ reply, model: modelUsed }), {
        expirationTtl: CACHE_TTL,
      }).catch(() => {}),
    );
  }
  // Fire-and-forget Q&A log — learning/eval corpus. Deliberately NO client
  // identifier: a djb2 "hash" of an IPv4 is brute-forceable in minutes, so
  // storing it would be storing the IP.
  const logKey = `log:${new Date().toISOString()}:${Math.random().toString(36).slice(2, 8)}`;
  ctx.waitUntil(
    env.RESUME_AI_KV.put(
      logKey,
      JSON.stringify({ q: message, replyLen: reply.length, model: modelUsed, ms, cached: false }),
      { expirationTtl: LOG_TTL },
    ).catch(() => {}),
  );

  const payload = { reply, model: modelUsed, cached: false };
  if (degraded) payload.degraded = true;
  return jsonResponse(200, payload, corsOrigin);
}

async function handleFeedback(request, env, ctx, corsOrigin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' }, corsOrigin);
  }
  const validated = validateFeedbackBody(body);
  if (!validated.ok) {
    return jsonResponse(validated.status, { error: validated.error }, corsOrigin);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rl = await rateLimit(env.RESUME_AI_KV, 'rlf', ip, RATE_LIMIT_FEEDBACK);
  if (!rl.allowed) {
    return jsonResponse(
      429,
      { error: 'Rate limit exceeded — please wait a few minutes.', retryAfterSeconds: rl.retryAfterSeconds },
      corsOrigin,
    );
  }

  // Daily cap on feedback persistence (fail-closed): without it, feedback spam
  // could exhaust the KV free tier's write quota and knock out every KV-backed
  // guard. Over cap → feedback is silently dropped, response stays 204.
  const day = new Date().toISOString().slice(0, 10);
  if (await bumpCounter(env.RESUME_AI_KV, `budget-fb:${day}`, DAILY_FEEDBACK_BUDGET, 172_800, true)) {
    const fbKey = `fb:${new Date().toISOString()}:${Math.random().toString(36).slice(2, 8)}`;
    ctx.waitUntil(
      env.RESUME_AI_KV.put(
        fbKey,
        JSON.stringify({
          verdict: validated.verdict,
          question: validated.question,
          reply: validated.reply,
        }),
        { expirationTtl: LOG_TTL },
      ).catch(() => {}),
    );
  }

  return new Response(null, { status: 204, headers: baseHeaders(corsOrigin, { json: false }) });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsOrigin = resolveCorsOrigin(request.headers.get('Origin'));

    if (request.method === 'OPTIONS') {
      return preflightResponse(corsOrigin);
    }

    if (url.pathname === '/api/health') {
      if (request.method !== 'GET') {
        return jsonResponse(405, { error: 'Method not allowed' }, corsOrigin);
      }
      return jsonResponse(200, { ok: true }, corsOrigin);
    }

    if (url.pathname === '/api/chat' || url.pathname === '/api/feedback') {
      if (request.method !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed' }, corsOrigin);
      }
      // POSTs from a missing or disallowed Origin are rejected outright.
      if (!corsOrigin) {
        return jsonResponse(403, { error: 'Origin not allowed' }, null);
      }
      try {
        return url.pathname === '/api/chat'
          ? await handleChat(request, env, ctx, corsOrigin)
          : await handleFeedback(request, env, ctx, corsOrigin);
      } catch (err) {
        // Belt-and-braces: never leak a raw 1101 exception page. Chat degrades
        // to a friendly 200 (avoids client retry storms); feedback is
        // best-effort so a swallowed 204 is fine.
        console.error('[resume-ai] unhandled error:', err);
        if (url.pathname === '/api/feedback') {
          return new Response(null, { status: 204, headers: baseHeaders(corsOrigin, { json: false }) });
        }
        return jsonResponse(
          200,
          { reply: STATIC_FALLBACK_REPLY, model: 'fallback-static', cached: false, degraded: true },
          corsOrigin,
        );
      }
    }

    // Humans opening resume.rafaracing.com.br in a browser land on the resume
    // site instead of a JSON 404. API-looking paths still get a 404.
    if (!url.pathname.startsWith('/api/') && request.method === 'GET') {
      return Response.redirect(SITE_URL, 302);
    }

    return jsonResponse(404, { error: 'Not found' }, corsOrigin);
  },
};
