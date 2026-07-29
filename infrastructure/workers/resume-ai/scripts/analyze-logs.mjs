// Self-improvement loop: mines the chat-log corpus (D1 `chats` + `feedback`
// tables — full conversation history with metadata) and diffs what REAL
// visitors ask against the hero suggestion cards and the eval corpus — so
// cards, curated answers, and evals evolve from production usage, not guesses.
//
// Usage:  npm run worker:logs                 (human report)
//         npm run worker:logs -- --json       (machine-readable, for tooling)
//         npm run worker:logs -- --threads    (every conversation, full text)
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
const NOISE_RE =
  /\b(?:ping|diag|probe|tokenless|gate-live|rotated-secret|e2e|gw ?test|gwtest|gw \d|reachability|prod unified|post-guardrail)\b|\b\d{4,}\b/i;

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
  'SELECT id, ts, session_id, source, q, reply, reply_len, model, ms, cached, degraded, turnstile, geo_country, geo_city, network_org FROM chats ORDER BY id',
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

// Conversation threads — the corpus's raison d'être: one recruiter tab = one
// session. Noise-only sessions (our own diagnostics) drop out entirely.
const threadMap = new Map();
for (const l of logs) {
  if (!l.session_id) continue;
  if (!threadMap.has(l.session_id)) threadMap.set(l.session_id, []);
  threadMap.get(l.session_id).push(l);
}
const threads = [...threadMap.values()]
  .filter((rows) => rows.some((r) => !NOISE_RE.test(r.q)))
  .map((rows) => ({
    sessionId: rows[0].session_id,
    started: rows[0].ts,
    city: rows[0].geo_city,
    country: rows[0].geo_country,
    org: rows[0].network_org,
    turns: rows.map((r) => ({
      ts: r.ts,
      q: r.q,
      reply: r.reply || '',
      source: r.source,
      cached: r.cached === 1,
      turnstile: r.turnstile,
      ms: r.ms,
    })),
  }))
  .sort((a, b) => (a.started < b.started ? 1 : -1));

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
    conversations: threads.length,
    feedback: feedback.length,
  },
  topics: Object.fromEntries(Object.entries(byTopic).map(([t, qs]) => [t, qs.length])),
  questionsByTopic: byTopic,
  uncoveredTopics: gaps,
  graduationCandidates,
  topNetworkOrgs: Object.fromEntries(topOrgs),
  conversations: threads,
  downvoted: downvoted.map((f) => ({ q: f.question, reply: (f.reply || '').slice(0, 160) })),
  degradedReplies: degraded.map((l) => ({ q: l.q, model: l.model })),
  slowReplies: slow.map((l) => ({ q: l.q, ms: l.ms })),
};

const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const when = (ts) => ts.slice(0, 16).replace('T', ' ');

function printThread(t, { full = false } = {}) {
  const where = [t.city, t.country].filter(Boolean).join(', ');
  const head = [when(t.started), where || null, t.org || null, `${t.turns.length} turn${t.turns.length === 1 ? '' : 's'}`]
    .filter(Boolean)
    .join('  ·  ');
  console.log(`  ┌─ ${head}`);
  for (const turn of t.turns) {
    const tags = [turn.source, turn.cached ? 'cached' : null, turn.turnstile === 'pass' ? '✓' : null]
      .filter(Boolean)
      .join(',');
    console.log(`  │ Q ${full ? turn.q : clip(turn.q, 76)}${tags ? `  (${tags})` : ''}`);
    const reply = turn.reply.replace(/\s+/g, ' ');
    if (full) {
      console.log(`  │ A ${reply}`);
    } else {
      console.log(`  │ A ${clip(reply, 76)}`);
    }
  }
  console.log('  └─');
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else if (process.argv.includes('--threads')) {
  console.log(`\n💬 resume-ai — every conversation (${threads.length}), newest first\n`);
  for (const t of threads) printThread(t, { full: true });
} else {
  const T = report.totals;
  console.log('\n📊 resume-ai — chat corpus report (D1)');
  console.log('══════════════════════════════════════════════════════════');
  console.log(
    `   ${T.realUserQuestions} real questions · ${T.conversations} conversations · ${T.feedback} feedback · ${T.rows} rows total\n`,
  );

  if (threads.length) {
    console.log(`💬 recent conversations (${Math.min(threads.length, 5)} of ${threads.length}) — full text: npm run worker:logs -- --threads`);
    for (const t of threads.slice(0, 5)) printThread(t);
    console.log();
  }

  console.log('🧭 what visitors ask (by topic)');
  for (const [topic, qs] of Object.entries(byTopic).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`   ${topic} (${qs.length})`);
    for (const q of [...new Set(qs)].slice(0, 3)) console.log(`     · ${clip(q, 70)}`);
  }
  if (topOrgs.length) {
    console.log('\n🏢 top visitor networks');
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
  if (slow.length) console.log(`🐢 replies >8s (uncached): ${slow.length}`);
  console.log('\nNext: fold graduation candidates into eval/questions.json and, if card-worthy, into the hero cards + seed-cards.mjs.');
}
