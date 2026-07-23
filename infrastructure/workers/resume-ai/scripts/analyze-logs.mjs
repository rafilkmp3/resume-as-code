// Self-improvement loop: mines the Worker's KV Q&A logs (log:*) and feedback
// (fb:*) to surface what REAL visitors ask, then diffs that against the hero
// suggestion cards and the eval corpus — so cards, curated answers, and evals
// evolve from production usage instead of guesses.
//
// Usage:  npm run worker:logs            (human report)
//         npm run worker:logs -- --json  (machine-readable, for tooling)
//
// Auth: same wrangler OAuth/API token as every other worker script.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const NAMESPACE_ID = '1e15da87e1e94016a078b96292a99731';
const ACCOUNT_ID = 'b76ee39565b02457698bb56c4ed12363';

const CARDS_PATH = new URL('../src/index.mjs', import.meta.url);
const EVAL_PATH = new URL('../eval/questions.json', import.meta.url);

// Test/diagnostic noise we generate ourselves — never "real user" signal.
const NOISE_RE = /\b(?:ping|diag|gw ?test|gwtest|gw \d|reachability|prod unified|post-guardrail)\b|\b\d{4,}\b/i;

function kv(args) {
  return execFileSync('npx', ['wrangler', 'kv', ...args, '--namespace-id', NAMESPACE_ID, '--remote'], {
    encoding: 'utf8',
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID },
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 16 * 1024 * 1024,
  });
}

function listKeys(prefix) {
  const out = kv(['key', 'list', '--prefix', prefix]);
  return JSON.parse(out.slice(out.indexOf('['))).map((k) => k.name);
}

function getValue(key) {
  try {
    return JSON.parse(kv(['key', 'get', key]));
  } catch {
    return null;
  }
}

// Rough topic bucketing — enough to see coverage gaps at a glance.
const TOPICS = [
  ['availability', /open|opportunit|market|available|hiring|job/i],
  ['current-role', /current (role|company|position)|role right now|where.*work/i],
  ['salary', /salary|earn|compensation|rate|pay|budget/i],
  ['contact/scheduling', /contact|schedule|call|meet|reach|time with you/i],
  ['role-fit', /interested in .*(position|role)|junior|senior|fit/i],
  ['company-deep-dive', /uber|globo|bluecore|dransay|triumph|biggest impact|proud/i],
  ['skills', /skill|stack|toolbox|kubernetes|aws|gcp|terraform|devops|k8s/i],
  ['pdf/download', /pdf|download|copy of (the |your )?resume|cv/i],
  ['personal', /how old|age|family|where.*from|hobbies/i],
  ['injection', /ignore (all|previous)|system prompt|instructions/i],
];

function topicOf(q) {
  for (const [name, re] of TOPICS) if (re.test(q)) return name;
  return 'other';
}

const logKeys = listKeys('log:');
const fbKeys = listKeys('fb:');
console.error(`fetching ${logKeys.length} log + ${fbKeys.length} feedback entries from KV…`);

const logs = logKeys.map((k) => ({ key: k, ...getValue(k) })).filter((l) => typeof l.q === 'string');
const feedback = fbKeys.map((k) => ({ key: k, ...getValue(k) })).filter(Boolean);

const real = logs.filter((l) => !NOISE_RE.test(l.q));
const byTopic = {};
for (const l of real) (byTopic[topicOf(l.q)] ||= []).push(l.q);

// Coverage diff: which topics real users ask about that neither a hero card
// nor the eval corpus exercises.
const cardsSource = readFileSync(CARDS_PATH, 'utf8');
const evalQuestions = (JSON.parse(readFileSync(EVAL_PATH, 'utf8')).questions || [])
  .map((e) => e.message || '')
  .join('\n');
const coveredText = cardsSource + '\n' + evalQuestions;
const gaps = Object.keys(byTopic).filter(
  (t) => t !== 'other' && t !== 'injection' && !TOPICS.find(([n]) => n === t)?.[1].test(coveredText),
);

const downvoted = feedback.filter((f) => f.verdict === 'down');
const degraded = logs.filter((l) => l.model === 'fallback-static' || l.model === 'leak-guard');
const slow = real.filter((l) => l.ms > 8000);

const report = {
  totals: { logs: logs.length, realUserQuestions: real.length, feedback: feedback.length },
  topics: Object.fromEntries(Object.entries(byTopic).map(([t, qs]) => [t, qs.length])),
  questionsByTopic: byTopic,
  uncoveredTopics: gaps,
  downvoted: downvoted.map((f) => ({ q: f.question, reply: (f.reply || '').slice(0, 160) })),
  degradedReplies: degraded.map((l) => ({ q: l.q, model: l.model })),
  slowReplies: slow.map((l) => ({ q: l.q, ms: l.ms })),
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('\n📊 resume-ai — real-user question mining');
  console.log(`   ${report.totals.realUserQuestions} real questions (${report.totals.logs} logs, noise filtered)\n`);
  for (const [topic, qs] of Object.entries(byTopic).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`   ${topic} (${qs.length})`);
    for (const q of [...new Set(qs)].slice(0, 5)) console.log(`     · ${q}`);
  }
  if (gaps.length) console.log(`\n⚠️  topics users ask that cards/eval do not cover: ${gaps.join(', ')}`);
  if (downvoted.length) {
    console.log(`\n👎 downvoted answers (${downvoted.length}) — fix these first:`);
    for (const f of downvoted) console.log(`     · ${f.q}`);
  }
  if (degraded.length) console.log(`\n🩹 degraded/guarded replies: ${degraded.length}`);
  if (slow.length) console.log(`🐢 replies >8s: ${slow.length}`);
  console.log('\nNext: fold frequent uncovered questions into eval/questions.json and, if card-worthy, into the hero cards + seed-cards.mjs.');
}
