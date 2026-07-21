// Seeds curated answers for the 4 hero suggestion cards straight into KV, so
// they answer INSTANTLY, never spend neurons, and survive quota exhaustion.
//
// Keys use the current content signature (cache-version.mjs), so a resume edit
// changes the keys and these get re-seeded under the new signature on the next
// deploy. Writes a wrangler-bulk file; the npm `seed:cards` script uploads it.
//
// Curated answers are grounded in the real resume, first-person, and end with a
// hook — the same contract the live model follows. Update them here whenever
// the resume content they reference changes.

import { writeFileSync } from 'node:fs';
import resume from '../../../../app/data/resume.json' with { type: 'json' };
import { normalizeQuestion, hashString } from '../src/guards.mjs';
import { cacheKey } from '../src/cache-version.mjs';

const TTL = 400 * 24 * 60 * 60; // ~400 days — effectively "forever" for a card

// EXACT card strings (must match the hero and the worker's CARD_QUESTIONS).
const CARDS = [
  {
    q: "How's your AWS experience?",
    a: "AWS is one of my core cloud platforms — I've worked with it throughout my 10+ years in DevOps and platform engineering, including a dedicated AWS cloud role at Triumph and large-scale infrastructure at Uber and Bluecore (EKS, Terraform, plus spot-instance and rightsizing cost work). Want me to go deeper on a specific service or project?",
  },
  {
    q: "What's your current role?",
    a: "I'm currently a Platform Engineer at DrAnsay, a telehealth platform, where I own infrastructure and developer-experience work. Before this I was at Bluecore and Uber, running platform and CI/CD at scale. Want the bigger picture of my career, or details on what I'm building now?",
  },
  {
    q: 'Are you open to new opportunities?',
    a: "I'm currently at DrAnsay, but the right opportunity can absolutely change my mind — full-time, contract, or remote all work for me. What role do you have in mind, and what salary range are you working with?",
  },
  {
    q: 'Tell me about your DevOps toolbox',
    a: "My daily toolbox: Kubernetes (EKS/GKE) with Helm and ArgoCD for delivery, Terraform and Ansible for infrastructure-as-code, GitHub Actions / GitLab CI / Jenkins for pipelines, and Prometheus / Grafana / Datadog for observability — across AWS and GCP. I've used this stack to drive an 8,000-repo CI migration and zero-downtime Kubernetes upgrades. Want to dig into any part of it?",
  },
];

const entries = CARDS.map(({ q, a }) => ({
  key: cacheKey(resume, hashString(normalizeQuestion(q))),
  value: JSON.stringify({ reply: a, model: 'curated' }),
  expiration_ttl: TTL,
}));

const outPath = new URL('../.cards-bulk.json', import.meta.url);
writeFileSync(outPath, JSON.stringify(entries));
for (const e of entries) console.log(`  ${e.key}`);
console.log(`✅ wrote ${entries.length} card entries → ${outPath.pathname}`);
