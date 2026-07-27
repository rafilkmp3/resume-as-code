// Self-improvement loop: mines the chat-log corpus (D1 `chats` + `feedback`
// tables — full conversation history with metadata) and diffs what REAL
// visitors ask against the hero suggestion cards and the eval corpus — so
// cards, curated answers, and evals evolve from production usage, not guesses.
//
// Usage:  npm run worker:logs            (human report)
//         npm run worker:logs -- --json  (machine-readable, for tooling)
//
// Auth: same wrangler OAuth/API token as every other worker script.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ACCOUNT_ID = 'b76ee39565b02457698bb56c4ed12363';
const DB_NAME = 'resume-ai-logs';

const CONFIG_PATH = new URL('../wrangler.toml', import.meta.url).pathname;
const CARDS_PATH = new URL('../src/index.mjs', import.meta.url);
const EVAL_PATH = new URL('../eval/questions.json', import.meta.url);

// Test/diagnostic noise we generate ourselves — never "real user" signal.
const NOISE_RE = /\b(?:ping|diag|gw ?test|gwtest|gw \d|reachability|prod unified|post-guardrail)\b|\b\d{4,}\b/i;

function d1Query(sql) {
  const out = execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB_NAME, '--remote', '--json', '--command', sql, '-c', CONFIG_PATH],
    {
      encoding: 'utf8',
      env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID },
      // stderr piped (not ignored): wrangler flakes occasionally and a
      // swallowed stderr turns a transient network error into a mystery.
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  const parsed = JSON.parse(out.slice(out.indexOf('[')));
  return parsed[0]?.results ?? [];
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

const logs = d1Query(
  'SELECT ts, session_id, source, q, reply, reply_len, model, ms, cached, degraded, geo_country, geo_city, network_org FROM chats ORDER BY ts',
).filter((l) => typeof l.q === 'string');
const feedback = d1Query('SELECT ts, session_id, verdict, question, reply FROM feedback ORDER BY ts');
console.error(`fetched ${logs.length} chat rows + ${feedback.length} feedback rows from D1…`);

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

// Card/eval graduation candidates: TYPED questions asked in >= 3 distinct
// sessions (card clicks excluded — they would only echo the cards back).
const normalize = (q) => q.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const typedBySessions = new Map();
for (const l of real) {
  if (l.source === 'card' || !l.session_id) continue;
  const key = normalize(l.q);
  if (!typedBySessions.has(key)) typedBySessions.set(key, { q: l.q, sessions: new Set() });
  typedBySessions.get(key).sessions.add(l.session_id);
}
const graduationCandidates = [...typedBySessions.values()]
  .filter((e) => e.sessions.size >= 3)
  .map((e) => ({ q: e.q, distinctSessions: e.sessions.size }))
  .sort((a, b) => b.distinctSessions - a.distinctSessions);

// Conversation + audience shape (coarse request.cf metadata — company-level).
const sessions = new Set(real.filter((l) => l.session_id).map((l) => l.session_id));
const orgCounts = {};
for (const l of real) if (l.network_org) orgCounts[l.network_org] = (orgCounts[l.network_org] || 0) + 1;
const topOrgs = Object.entries(orgCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

const downvoted = feedback.filter((f) => f.verdict === 'down');
const degraded = logs.filter((l) => l.degraded === 1 || l.model === 'fallback-static' || l.model === 'leak-guard');
const slow = real.filter((l) => l.cached !== 1 && l.ms > 8000);

const report = {
  totals: {
    rows: logs.length,
    realUserQuestions: real.length,
    distinctSessions: sessions.size,
    feedback: feedback.length,
  },
  topics: Object.fromEntries(Object.entries(byTopic).map(([t, qs]) => [t, qs.length])),
  questionsByTopic: byTopic,
  uncoveredTopics: gaps,
  graduationCandidates,
  topNetworkOrgs: Object.fromEntries(topOrgs),
  downvoted: downvoted.map((f) => ({ q: f.question, reply: (f.reply || '').slice(0, 160) })),
  degradedReplies: degraded.map((l) => ({ q: l.q, model: l.model })),
  slowReplies: slow.map((l) => ({ q: l.q, ms: l.ms })),
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('\n📊 resume-ai — real-user question mining (D1 corpus)');
  console.log(
    `   ${report.totals.realUserQuestions} real questions in ${report.totals.distinctSessions} sessions (${report.totals.rows} rows, noise filtered)\n`,
  );
  for (const [topic, qs] of Object.entries(byTopic).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`   ${topic} (${qs.length})`);
    for (const q of [...new Set(qs)].slice(0, 5)) console.log(`     · ${q}`);
  }
  if (topOrgs.length) {
    console.log('\n🏢 top visitor networks (request.cf asOrganization):');
    for (const [org, n] of topOrgs.slice(0, 5)) console.log(`     · ${org} (${n})`);
  }
  if (gaps.length) console.log(`\n⚠️  topics users ask that cards/eval do not cover: ${gaps.join(', ')}`);
  if (graduationCandidates.length) {
    console.log('\n🎓 card/eval graduation candidates (typed by ≥3 distinct sessions):');
    for (const c of graduationCandidates.slice(0, 5))
      console.log(`     · ${c.q} (${c.distinctSessions} sessions)`);
  }
  if (downvoted.length) {
    console.log(`\n👎 downvoted answers (${downvoted.length}) — fix these first:`);
    for (const f of downvoted) console.log(`     · ${f.q}`);
  }
  if (degraded.length) console.log(`\n🩹 degraded/guarded replies: ${degraded.length}`);
  if (slow.length) console.log(`🐢 replies >8s: ${slow.length}`);
  console.log('\nNext: fold graduation candidates into eval/questions.json and, if card-worthy, into the hero cards + seed-cards.mjs.');
}
