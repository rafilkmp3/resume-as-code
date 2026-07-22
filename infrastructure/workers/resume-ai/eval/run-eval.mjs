#!/usr/bin/env node
// Reply-validation harness for the resume-ai chatbot.
//
//   npm run worker:eval                          # against local `npm run worker:dev`
//   node .../run-eval.mjs --target https://resume.rafaracing.com.br
//
// Deterministic checks only (keyword any-of groups + banned substrings) — no
// LLM judge, no extra cost beyond the chat calls themselves. QUOTA WARNING:
// every uncached question is a real Workers AI call; the 12-question set is
// sized to be safe to run a few times a day. Repeat runs mostly hit the KV
// response cache (cached replies validate the same content).

import { readFileSync } from 'node:fs';

const target = (() => {
  const idx = process.argv.indexOf('--target');
  return idx !== -1 ? process.argv[idx + 1] : 'http://localhost:8787';
})();

const ORIGIN = 'http://localhost:4321'; // allowed dev origin; prod origins work too
const { questions } = JSON.parse(
  new TextDecoder().decode(readFileSync(new URL('./questions.json', import.meta.url))),
);

function checkReply(reply, q) {
  const lower = reply.toLowerCase();
  const failures = [];
  for (const group of q.mustInclude) {
    if (!group.some((alt) => lower.includes(alt.toLowerCase()))) {
      failures.push(`missing any of: [${group.join(' | ')}]`);
    }
  }
  for (const banned of q.mustNotInclude) {
    if (lower.includes(banned.toLowerCase())) {
      failures.push(`contains banned: "${banned}"`);
    }
  }
  return failures;
}

let passed = 0;
const results = [];

for (const q of questions) {
  let reply = '';
  let meta = '';
  let failures;
  try {
    const res = await fetch(`${target}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({ message: q.message }),
      signal: AbortSignal.timeout(60_000),
    });
    if (res.status === 429 || res.status === 503) {
      const body = await res.json().catch(() => ({}));
      console.error(`\n⛔ ${res.status} on "${q.id}" — ${body.error || 'rate/quota limited'}.`);
      console.error('Aborting eval to preserve quota. Re-run later.');
      process.exit(2);
    }
    const data = await res.json();
    reply = typeof data.reply === 'string' ? data.reply : '';
    meta = `${data.cached ? 'cached' : data.model}${data.degraded ? ' DEGRADED' : ''}`;
    failures = data.degraded
      ? ['degraded static fallback — model unavailable, reply not evaluated']
      : checkReply(reply, q);
  } catch (err) {
    failures = [`request failed: ${err.message}`];
  }
  const ok = failures.length === 0;
  if (ok) passed++;
  results.push({ q, ok, failures, reply, meta });
  console.log(`${ok ? '✅' : '❌'} [${q.category}] ${q.id} (${meta})`);
  for (const f of failures) console.log(`     ↳ ${f}`);
  if (!ok && reply) console.log(`     reply: ${reply.slice(0, 220).replace(/\n/g, ' ')}`);
}

const rate = Math.round((passed / questions.length) * 100);
console.log(`\n${passed}/${questions.length} passed (${rate}%) against ${target}`);
const THRESHOLD = 80;
if (rate < THRESHOLD) {
  console.error(`Below ${THRESHOLD}% threshold — reply quality regressed.`);
  process.exit(1);
}
