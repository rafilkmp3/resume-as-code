// Chat-log corpus (D1) + bot/Turnstile guards.
// D1 writes are fire-and-forget from the caller's ctx.waitUntil — a logging
// failure must never break a chat reply. Pure helpers stay node-testable.

export const RETENTION_DAYS = 180; // age purge — the retention POLICY
export const REPLY_LOG_MAX = 500; // reply text stored truncated; reply_len keeps the true size
// Size watermark FUSE: D1 free tier caps a database at 500 MB. Trim oldest
// rows in bounded batches when past 75% — SQLite file size does not shrink on
// DELETE (pages are reused), so never loop-until-under-watermark.
export const SIZE_WATERMARK_BYTES = Math.floor(0.75 * 500 * 1024 * 1024);
export const WATERMARK_BATCH = 10_000;

// Obvious non-browser scrapers/CLIs. Deliberately NARROW: no "headless"
// entries (Playwright E2E must pass) and nothing matching node/undici (the
// eval runner must pass). Real bot defense is Turnstile + zone-level Bot
// Fight Mode; this only stops drive-by curl spam from burning AI quota.
// "(?<!cu)bot\b" catches Googlebot/Bingbot/…bot while sparing Cubot phones.
const BOT_UA_RE =
  /(?<!cu)bot\b|crawler|spider|scrapy|python-requests|python-httpx|aiohttp|go-http-client|libwww|apache-httpclient|okhttp|^(?:curl|wget)\//i;

/** @returns {'browser'|'bot'} coarse UA class; missing UA on an API POST is bot-like */
export function classifyUserAgent(ua) {
  if (!ua || BOT_UA_RE.test(ua)) return 'bot';
  return 'browser';
}

/** Coarse request.cf metadata — company-level signal, never person-level. */
export function cfMetadata(request) {
  const cf = request?.cf || {};
  const clip = (v) => (typeof v === 'string' && v ? v.slice(0, 100) : null);
  return {
    geoCountry: clip(cf.country),
    geoCity: clip(cf.city),
    networkOrg: clip(cf.asOrganization),
  };
}

/**
 * Verify a Turnstile token. Env-gated by the caller: only runs when the
 * TURNSTILE_SECRET Worker secret is set. Verification-service outage fails
 * OPEN (availability of the chat beats bot filtering, same philosophy as the
 * per-IP rate limit); a definite "invalid token" verdict fails the request.
 *
 * Per Turnstile server-side best practices, a successful verdict also checks
 * the response's `action` and `hostname` (when present) — a valid token
 * minted by a DIFFERENT widget flow or on a different hostname must not be
 * replayable into the chat API.
 * @returns {Promise<'pass'|'fail'>}
 */
export const TURNSTILE_ACTION = 'chat';
export async function verifyTurnstile(secret, token, ip, expectedHostname) {
  try {
    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token || '');
    if (ip && ip !== 'unknown') form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return 'pass'; // siteverify outage — fail open
    const data = await res.json();
    if (!data.success) return 'fail';
    if (data.action && data.action !== TURNSTILE_ACTION) return 'fail';
    if (expectedHostname && data.hostname && data.hostname !== expectedHostname) return 'fail';
    return 'pass';
  } catch {
    return 'pass'; // network failure — fail open
  }
}

/** INSERT one chat turn. Caller wraps in ctx.waitUntil(...) — never awaited inline. */
export function logChat(db, e) {
  return db
    .prepare(
      `INSERT INTO chats (session_id, turn, source, q, reply, reply_len, model, ms,
         cached, degraded, gateway, history_len, geo_country, geo_city, network_org, turnstile)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      e.sessionId ?? null,
      e.turn ?? null,
      e.source ?? null,
      e.q,
      typeof e.reply === 'string' ? e.reply.slice(0, REPLY_LOG_MAX) : null,
      typeof e.reply === 'string' ? e.reply.length : null,
      e.model ?? null,
      e.ms ?? null,
      e.cached ? 1 : 0,
      e.degraded ? 1 : 0,
      e.gateway ? 1 : 0,
      e.historyLen ?? null,
      e.geoCountry,
      e.geoCity,
      e.networkOrg,
      e.turnstile ?? 'off',
    )
    .run();
}

/** INSERT one feedback verdict. Caller wraps in ctx.waitUntil(...). */
export function logFeedback(db, e) {
  return db
    .prepare(`INSERT INTO feedback (session_id, verdict, question, reply) VALUES (?, ?, ?, ?)`)
    .bind(e.sessionId ?? null, e.verdict, e.question ?? null, e.reply ?? null)
    .run();
}

/**
 * Weekly retention sweep (scheduled handler).
 * Age purge is the policy (GDPR storage limitation); the size watermark is a
 * bot-flood fuse that trims ONE bounded batch per run.
 */
export async function runRetention(db) {
  const purged = await db
    .prepare(`DELETE FROM chats WHERE ts < datetime('now', ?)`)
    .bind(`-${RETENTION_DAYS} days`)
    .run();
  await db
    .prepare(`DELETE FROM feedback WHERE ts < datetime('now', ?)`)
    .bind(`-${RETENTION_DAYS} days`)
    .run();

  const probe = await db.prepare('SELECT 1').run();
  let trimmed = 0;
  if ((probe.meta?.size_after ?? 0) > SIZE_WATERMARK_BYTES) {
    const res = await db
      .prepare(`DELETE FROM chats WHERE id IN (SELECT id FROM chats ORDER BY ts ASC LIMIT ?)`)
      .bind(WATERMARK_BATCH)
      .run();
    trimmed = res.meta?.changes ?? 0;
  }
  return { purged: purged.meta?.changes ?? 0, trimmed };
}
