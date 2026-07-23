# resume-ai — Cloudflare Worker

Standalone Cloudflare Worker (not Pages Functions) that powers the AI chatbot
on Rafael's resume site. Plain ES modules, JSDoc types, **zero npm
dependencies** — the AI runs on the native Workers AI binding (`env.AI.run`),
no API tokens anywhere.

- Prod: `https://resume.rafaracing.com.br` (custom domain route)
- Local: `http://localhost:8787`

## API

| Endpoint | Method | Notes |
|---|---|---|
| `/api/chat` | POST | `{message, history?}` → `{reply, model, cached, degraded?}` |
| `/api/feedback` | POST | `{verdict: "up"\|"down", question?, reply?}` → 204 |
| `/api/health` | GET | `{ok:true}`, no AI call |

POSTs require an allowed `Origin` (GitHub Pages prod, Netlify staging,
`deploy-preview-N` previews, `localhost:4321` / `127.0.0.1:4321`, and RFC1918
LAN IPs on `:4321` for `make get-lan-ip` mobile testing); anything else → 403.
Any other `GET` (e.g. a human opening `resume.rafaracing.com.br`) is 302'd to
the resume site.

Full contract — `POST /api/chat` body `{message: 1..500 chars, history?: up to
6 × {role: user|assistant, content ≤400 chars}}`; errors are JSON `{error}`
with 400 (invalid), 403 (origin), 413 (too long), 429 (+`retryAfterSeconds`),
503 (daily AI quota exhausted).

## Local dev

```bash
npm run worker:dev
# = npx wrangler dev -c infrastructure/workers/resume-ai/wrangler.toml
```

⚠️ **`env.AI` is remote even in local dev** (`[ai] remote = true` — Workers AI
has no local simulator). Every chat request during `wrangler dev` consumes
real free-tier quota (~10k neurons/day). KV is simulated locally.

```bash
# smoke test against the dev server
curl -s http://localhost:8787/api/health
curl -s http://localhost:8787/api/chat \
  -H 'Origin: http://localhost:4321' -H 'Content-Type: application/json' \
  -d '{"message":"How many years of Kubernetes experience does Rafael have?"}'
```

## Tests (no Worker runtime needed)

```bash
npm run worker:test   # node --test over test/*.test.mjs (pure modules only)
```

## Self-improvement loop (real-user log mining)

Every production Q&A is logged to KV (`log:*`, 30-day TTL, no client
identifiers) and thumbs-up/down feedback to `fb:*`. Mine them with:

```bash
npm run worker:logs            # human report
npm run worker:logs -- --json  # machine-readable
```

The report buckets real questions by topic (noise-filtered), lists downvoted /
degraded / slow answers, and flags topics that neither the hero cards nor
`eval/questions.json` cover. The loop:

1. Run `npm run worker:logs` periodically (or before any prompt change).
2. Fold frequent real questions into `eval/questions.json` as new cases.
3. Promote the most-asked ones into `app/data/chat-cards.json` — either as a
   hero card, an alias of an existing card, or a `seeded` (cache-only) Q&A.
   That one file feeds the hero UI, the worker's long-TTL cache detection,
   and the KV seeding — no strings to keep in sync by hand.
4. Fix downvoted answers via prompt tweaks, then `npm run worker:eval`.

## Deploy

```bash
npm run worker:deploy
# = npx wrangler deploy -c infrastructure/workers/resume-ai/wrangler.toml
```

Requires `wrangler login` (or `CLOUDFLARE_API_TOKEN`) on the account
`b76ee39565…`. The custom domain `resume.rafaracing.com.br` is created
automatically from the route config on first deploy.

## Enabling AI Gateway later (currently OFF)

The commented `gatewayOpts` block in `src/index.mjs` is intentionally disabled:
passing a gateway id that does not exist makes **every** `AI.run` call fail
(italia2026 lesson B-397b). To enable:

1. Cloudflare dashboard → **AI** → **AI Gateway** → *Create gateway*, slug
   exactly `resume-ai`.
2. Uncomment `gatewayOpts` in `src/index.mjs` and pass it as the last arg of
   `aiRunWithTimeout(...)` calls.
3. Deploy. Gateway adds analytics + an extra edge cache layer (`cacheTtl` 7d).

## Architecture / security summary

- **Facts in code, not in the model** (`src/facts.mjs`): total years,
  per-role tenure, and a per-skill-keyword experience table are computed
  deterministically from `app/data/resume.json` (bundled at deploy time) and
  embedded in the system prompt as the authoritative numbers — LLMs are bad at
  date math.
- **Model chain with hard timeouts** (`src/ai.mjs`): llama-3.3-70b-fp8-fast
  (15s) → llama-4-scout (12s) → llama-3.1-8b-fast (8s) → static friendly
  fallback returned as HTTP **200 + `degraded:true`** (never 500 — avoids
  client retry storms). Free-tier models can hang forever without throwing, so
  every call is raced against a timeout. Quota errors
  (`/3040|quota|capacity|rate.?limit/i`) → 503. Worst-case chain (~35s) stays
  under the widget's 45s abort.
- **KV (`RESUME_AI_KV`)**: per-IP fixed-window rate limit 10/10min (chat) and
  20/10min (feedback), global daily budget of 200 model **attempts** (cache
  hits free; fallback retries count), daily feedback-write cap of 100,
  7-day response cache for history-less questions, 30-day Q&A/feedback logs
  (no client identifier stored at all). Per-IP limits fail open on KV errors;
  the daily budgets fail **closed** so exhausting KV can't disable the quota
  guards. KV counters are best-effort (no atomic increment) — throttles, not
  exact quotas.
- **CORS**: strict origin allowlist, `Vary: Origin` always, `Origin` echoed
  only when allowed; `no-store`, `nosniff`, `strict-origin-when-cross-origin`
  on every `/api/*` response.
- **Prompt hardening**: answers only from resume data, user content treated as
  data (prompt-injection resistant), `[TODO` placeholders stripped, off-topic
  and salary questions deflected, replies post-processed (HTML stripped,
  repetition collapsed, 2000-char cap).
