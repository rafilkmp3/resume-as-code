// Seeds curated answers for the hero suggestion cards straight into KV, so
// they answer INSTANTLY, never spend neurons, and survive quota exhaustion.
//
// Keys use the current content signature (cache-version.mjs), so a resume edit
// changes the keys and these get re-seeded under the new signature on the next
// deploy. Writes a wrangler-bulk file; the npm `seed:cards` script uploads it.
//
// Card strings + curated answers live in app/data/chat-cards.json (single
// source of truth shared with the hero and the worker). Each entry's aliases —
// real phrasings mined from production logs (`npm run worker:logs`) — are
// seeded to the SAME answer, so the most common real-user questions are
// KV cache hits that never touch the model.

import { writeFileSync } from 'node:fs';
import resume from '../../../../app/data/resume.json' with { type: 'json' };
import chatCards from '../../../../app/data/chat-cards.json' with { type: 'json' };
import { normalizeQuestion, hashString } from '../src/guards.mjs';
import { cacheKey } from '../src/cache-version.mjs';

const TTL = 400 * 24 * 60 * 60; // ~400 days — effectively "forever" for a card

const entries = [];
const seen = new Set();
for (const { q, a, aliases } of [...chatCards.cards, ...chatCards.seeded]) {
  for (const question of [q, ...(aliases || [])]) {
    const key = cacheKey(resume, hashString(normalizeQuestion(question)));
    if (seen.has(key)) continue; // aliases that normalize identically collapse to one write
    seen.add(key);
    entries.push({
      key,
      value: JSON.stringify({ reply: a, model: 'curated' }),
      expiration_ttl: TTL,
    });
  }
}

const outPath = new URL('../.cards-bulk.json', import.meta.url);
writeFileSync(outPath, JSON.stringify(entries));
for (const e of entries) console.log(`  ${e.key}`);
console.log(`✅ wrote ${entries.length} card entries → ${outPath.pathname}`);
