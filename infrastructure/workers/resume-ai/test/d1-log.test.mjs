import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyUserAgent,
  cfMetadata,
  logChat,
  REPLY_LOG_MAX,
  RETENTION_DAYS,
  SIZE_WATERMARK_BYTES,
} from '../src/d1-log.mjs';
import { sanitizeSessionId, sanitizeSource, validateChatBody } from '../src/guards.mjs';

// --- classifyUserAgent -------------------------------------------------------

test('UA: real browsers pass', () => {
  const chrome =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
  const iphone =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
  assert.equal(classifyUserAgent(chrome), 'browser');
  assert.equal(classifyUserAgent(iphone), 'browser');
});

test('UA: obvious scrapers/CLIs are bots', () => {
  for (const ua of [
    'curl/8.6.0',
    'Wget/1.21',
    'python-requests/2.32.0',
    'Scrapy/2.11 (+https://scrapy.org)',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    'facebookexternalhit/1.1 crawler',
    'Go-http-client/2.0',
    'okhttp/4.12.0',
  ]) {
    assert.equal(classifyUserAgent(ua), 'bot', ua);
  }
});

test('UA: missing UA on an API POST is bot-like', () => {
  assert.equal(classifyUserAgent(''), 'bot');
  assert.equal(classifyUserAgent(null), 'bot');
  assert.equal(classifyUserAgent(undefined), 'bot');
});

test('UA: Playwright/headless and node/undici must PASS (E2E + eval runner)', () => {
  const headless =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/126.0 Safari/537.36';
  assert.equal(classifyUserAgent(headless), 'browser');
  assert.equal(classifyUserAgent('node'), 'browser');
  assert.equal(classifyUserAgent('undici'), 'browser');
});

// --- cfMetadata --------------------------------------------------------------

test('cfMetadata: extracts coarse fields, clips length, nulls when absent', () => {
  const m = cfMetadata({
    cf: { country: 'DE', city: 'Munich', asOrganization: 'Deutsche Telekom AG' },
  });
  assert.deepEqual(m, { geoCountry: 'DE', geoCity: 'Munich', networkOrg: 'Deutsche Telekom AG' });
  assert.deepEqual(cfMetadata({}), { geoCountry: null, geoCity: null, networkOrg: null });
  assert.deepEqual(cfMetadata(undefined), { geoCountry: null, geoCity: null, networkOrg: null });
  const long = cfMetadata({ cf: { country: 'x'.repeat(300) } });
  assert.equal(long.geoCountry.length, 100);
});

// --- logChat (db stub) -------------------------------------------------------

function dbStub(captured) {
  return {
    prepare(sql) {
      captured.sql = sql;
      return {
        bind(...args) {
          captured.args = args;
          return { run: async () => ({ meta: { changes: 1 } }) };
        },
      };
    },
  };
}

test('logChat: truncates reply to REPLY_LOG_MAX but keeps true reply_len', async () => {
  const captured = {};
  const reply = 'r'.repeat(REPLY_LOG_MAX + 200);
  await logChat(dbStub(captured), {
    q: 'q',
    reply,
    geoCountry: null,
    geoCity: null,
    networkOrg: null,
  });
  const stored = captured.args[4];
  const storedLen = captured.args[5];
  assert.equal(stored.length, REPLY_LOG_MAX);
  assert.equal(storedLen, REPLY_LOG_MAX + 200);
});

test('logChat: booleans become 0/1, missing optionals become null', async () => {
  const captured = {};
  await logChat(dbStub(captured), {
    q: 'hello',
    reply: 'world',
    cached: true,
    geoCountry: 'BR',
    geoCity: null,
    networkOrg: null,
  });
  assert.equal(captured.args[0], null); // sessionId
  assert.equal(captured.args[8], 1); // cached
  assert.equal(captured.args[9], 0); // degraded
  assert.equal(captured.args[15], 'off'); // turnstile default
});

// --- retention constants (documented invariants) -----------------------------

test('retention: policy and fuse hold their documented values', () => {
  assert.equal(RETENTION_DAYS, 180);
  assert.equal(SIZE_WATERMARK_BYTES, Math.floor(0.75 * 500 * 1024 * 1024));
});

// --- guards: new optional chat-body fields -----------------------------------

test('sessionId: well-formed UUID accepted (lowercased), junk dropped to null', () => {
  const id = '9B2D8E1A-4C3F-4A5B-9C7D-1E2F3A4B5C6D';
  assert.equal(sanitizeSessionId(id), id.toLowerCase());
  assert.equal(sanitizeSessionId('not-a-uuid'), null);
  assert.equal(sanitizeSessionId('x'.repeat(500)), null);
  assert.equal(sanitizeSessionId(42), null);
  assert.equal(sanitizeSessionId(undefined), null);
});

test('source: known tags accepted, junk dropped to null', () => {
  assert.equal(sanitizeSource('typed'), 'typed');
  assert.equal(sanitizeSource('card'), 'card');
  assert.equal(sanitizeSource('retry'), 'retry');
  assert.equal(sanitizeSource('evil'), null);
  assert.equal(sanitizeSource(7), null);
});

test('chat body: metadata fields are optional and never reject a request', () => {
  const bare = validateChatBody({ message: 'hi' });
  assert.equal(bare.ok, true);
  assert.equal(bare.sessionId, null);
  assert.equal(bare.source, null);
  assert.equal(bare.turnstileToken, null);

  const full = validateChatBody({
    message: 'hi',
    sessionId: '9b2d8e1a-4c3f-4a5b-9c7d-1e2f3a4b5c6d',
    source: 'card',
    turnstileToken: 'tok',
  });
  assert.equal(full.ok, true);
  assert.equal(full.sessionId, '9b2d8e1a-4c3f-4a5b-9c7d-1e2f3a4b5c6d');
  assert.equal(full.source, 'card');
  assert.equal(full.turnstileToken, 'tok');

  // junk metadata degrades to null instead of 400 — old/hostile clients alike
  const junk = validateChatBody({ message: 'hi', sessionId: 'zzz', source: 'evil', turnstileToken: 'x'.repeat(3000) });
  assert.equal(junk.ok, true);
  assert.equal(junk.sessionId, null);
  assert.equal(junk.source, null);
  assert.equal(junk.turnstileToken, null);
});
