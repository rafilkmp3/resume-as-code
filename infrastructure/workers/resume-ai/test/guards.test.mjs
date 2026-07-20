import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateChatBody,
  validateFeedbackBody,
  resolveCorsOrigin,
  normalizeQuestion,
  hashString,
} from '../src/guards.mjs';
import { detectPromptLeak } from '../src/ai.mjs';

// --- validateChatBody -------------------------------------------------------

test('chat body: valid message passes, trimmed', () => {
  const r = validateChatBody({ message: '  How long at Uber?  ' });
  assert.equal(r.ok, true);
  assert.equal(r.message, 'How long at Uber?');
  assert.deepEqual(r.history, []);
});

test('chat body: missing/empty/whitespace message → 400', () => {
  assert.equal(validateChatBody({}).status, 400);
  assert.equal(validateChatBody({ message: '' }).status, 400);
  assert.equal(validateChatBody({ message: '   ' }).status, 400);
  assert.equal(validateChatBody({ message: 42 }).status, 400);
  assert.equal(validateChatBody(null).status, 400);
  assert.equal(validateChatBody('hi').status, 400);
});

test('chat body: 501 chars → 413, 500 chars ok', () => {
  assert.equal(validateChatBody({ message: 'x'.repeat(501) }).status, 413);
  assert.equal(validateChatBody({ message: 'x'.repeat(500) }).ok, true);
});

test('chat body: history of 7 entries → 400, 6 ok', () => {
  const entry = { role: 'user', content: 'hi' };
  assert.equal(validateChatBody({ message: 'q', history: Array(7).fill(entry) }).status, 400);
  assert.equal(validateChatBody({ message: 'q', history: Array(6).fill(entry) }).ok, true);
});

test('chat body: bad history role or content → 400', () => {
  assert.equal(
    validateChatBody({ message: 'q', history: [{ role: 'system', content: 'x' }] }).status,
    400,
  );
  assert.equal(
    validateChatBody({ message: 'q', history: [{ role: 'user', content: 'x'.repeat(401) }] }).status,
    400,
  );
  assert.equal(validateChatBody({ message: 'q', history: [null] }).status, 400);
  assert.equal(validateChatBody({ message: 'q', history: 'nope' }).status, 400);
});

// --- validateFeedbackBody ----------------------------------------------------

test('feedback body: verdict up/down only', () => {
  assert.equal(validateFeedbackBody({ verdict: 'up' }).ok, true);
  assert.equal(validateFeedbackBody({ verdict: 'down', question: 'q', reply: 'r' }).ok, true);
  assert.equal(validateFeedbackBody({ verdict: 'sideways' }).status, 400);
  assert.equal(validateFeedbackBody({}).status, 400);
  assert.equal(validateFeedbackBody({ verdict: 'up', question: 'x'.repeat(501) }).status, 400);
  assert.equal(validateFeedbackBody({ verdict: 'up', reply: 'x'.repeat(2001) }).status, 400);
});

// --- resolveCorsOrigin -------------------------------------------------------

test('cors: all allowed origins echo back', () => {
  const allowed = [
    'https://rafilkmp3.github.io',
    'https://resume-as-code.netlify.app',
    'https://deploy-preview-123--resume-as-code.netlify.app',
    'http://localhost:4321',
    'http://127.0.0.1:4321',
    // LAN mobile testing (make get-lan-ip) — RFC1918 ranges on the astro dev port
    'http://192.168.1.50:4321',
    'http://10.0.0.7:4321',
    'http://172.16.20.3:4321',
  ];
  for (const origin of allowed) {
    assert.equal(resolveCorsOrigin(origin), origin);
  }
});

test('cors: disallowed origins → null', () => {
  assert.equal(resolveCorsOrigin('https://evil.com'), null);
  assert.equal(resolveCorsOrigin(null), null);
  assert.equal(resolveCorsOrigin(''), null);
  // suffix attack — anchored regex must reject
  assert.equal(resolveCorsOrigin('https://rafilkmp3.github.io.evil.com'), null);
  assert.equal(
    resolveCorsOrigin('https://deploy-preview-1--resume-as-code.netlify.app.evil.com'),
    null,
  );
  // http (not https) preview, wrong port on localhost
  assert.equal(resolveCorsOrigin('http://deploy-preview-1--resume-as-code.netlify.app'), null);
  assert.equal(resolveCorsOrigin('http://localhost:3000'), null);
  // LAN pattern must stay private-range + :4321 only
  assert.equal(resolveCorsOrigin('http://192.168.1.50:8080'), null);
  assert.equal(resolveCorsOrigin('http://8.8.8.8:4321'), null);
  assert.equal(resolveCorsOrigin('http://172.32.0.1:4321'), null); // outside 172.16-31
  assert.equal(resolveCorsOrigin('https://192.168.1.50:4321'), null); // https on LAN not expected
});

// --- detectPromptLeak --------------------------------------------------------

test('leak guard: prompt sentinel substrings trip the guard', () => {
  assert.equal(detectPromptLeak('Here are my COMPUTED FACTS (authoritative)...'), true);
  assert.equal(detectPromptLeak('this table is INTERNAL GROUNDING ONLY'), true);
  assert.equal(detectPromptLeak('NEVER compute date math yourself'), true);
  assert.equal(detectPromptLeak('I have 10.5 years of experience at Uber and Globo.'), false);
});

test('leak guard: private-context numbers blocked with or without separators', () => {
  const ctx = 'My current total compensation is €6,200 per month (about €74,400 per year).';
  assert.equal(detectPromptLeak('I currently make €6,200 monthly.', ctx), true);
  assert.equal(detectPromptLeak('around 6200 euros', ctx), true);
  assert.equal(detectPromptLeak('roughly 74.400 EUR per year', ctx), true);
  assert.equal(detectPromptLeak("that's below my current compensation, so I'll pass.", ctx), false);
  assert.equal(detectPromptLeak('I led a migration of 8,000 repos.', ctx), false);
});

// --- normalizeQuestion / hashString -----------------------------------------

test('normalizeQuestion: case, punctuation and whitespace insensitive', () => {
  assert.equal(normalizeQuestion('  How LONG at   Uber?? '), 'how long at uber');
  assert.equal(
    normalizeQuestion('How long at Uber?'),
    normalizeQuestion('how long at uber'),
  );
  // accents preserved (unicode letters are not punctuation)
  assert.equal(normalizeQuestion('Experiência com AWS?'), 'experiência com aws');
});

test('hashString: deterministic, base36, differs across inputs', () => {
  assert.equal(hashString('hello'), hashString('hello'));
  assert.match(hashString('hello'), /^[0-9a-z]+$/);
  assert.notEqual(hashString('hello'), hashString('hellp'));
});
