import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeFacts } from '../src/facts.mjs';
import { buildSystemPrompt } from '../src/prompt.mjs';

const realResume = JSON.parse(
  readFileSync(new URL('../../../../app/data/resume.json', import.meta.url), 'utf8'),
);

// Controlled fixture: exact day counts so duration math is assertable.
const fixture = {
  basics: { name: 'Test Person', email: 'test@example.com', profiles: [] },
  work: [
    {
      name: 'Alpha',
      position: 'Platform Engineer',
      startDate: '2020-01',
      endDate: '2022-01',
      summary: 'Cloud work on AWS.',
      highlights: ['Built AWS pipelines'],
    },
    {
      name: 'Beta',
      position: 'DevOps Engineer',
      startDate: '2022-01',
      // no endDate — current role
      summary: 'Kubernetes platform plus AWS automation.',
      highlights: [],
    },
  ],
  skills: [{ name: 'Cloud', keywords: ['AWS', 'Kubernetes', 'Fortran'] }],
  meta: { availability: { text: 'Open to Work', types: ['Remote'] } },
};

test('contiguous roles: summed tenure equals career span', () => {
  const facts = computeFacts(fixture, '2024-01-01');
  // 2020-01-01 → 2024-01-01 = 1461 days = exactly 4.0 years at 365.25 d/y
  assert.equal(facts.totalYears, 4.0);
  assert.equal(facts.careerSpanYears, 4.0);
});

test('employment gaps count toward career span but NOT total tenure', () => {
  const r = {
    work: [
      { name: 'A', position: 'Eng', startDate: '2020-01', endDate: '2021-01' },
      // one-year gap
      { name: 'B', position: 'Eng', startDate: '2022-01', endDate: '2024-01' },
    ],
    skills: [],
  };
  const facts = computeFacts(r, '2024-01-01');
  assert.equal(facts.totalYears, 3.0); // 1 + 2, gap excluded
  assert.equal(facts.careerSpanYears, 4.0); // first start → today
});

test('overlapping roles are not double-counted in tenure or keyword years', () => {
  const r = {
    work: [
      { name: 'A', position: 'Eng', startDate: '2020-01', endDate: '2022-01', summary: 'AWS work' },
      { name: 'B', position: 'Eng', startDate: '2021-01', endDate: '2023-01', summary: 'More AWS work' },
    ],
    skills: [{ name: 'Cloud', keywords: ['AWS'] }],
  };
  const facts = computeFacts(r, '2024-01-01');
  assert.equal(facts.totalYears, 3.0); // union 2020-01→2023-01, not 2+2
  const aws = facts.keywordExperience.find((k) => k.keyword === 'AWS');
  assert.equal(aws.years, 3.0);
  assert.equal(aws.roleCount, 2);
});

test('nameless work entry with a keyword match must not crash (regression)', () => {
  const r = {
    work: [
      // name omitted — optional in the JSON Resume schema; old lookup-by-name crashed here
      { position: 'Cloud Engineer', startDate: '2020-01', endDate: '2022-01', summary: 'AWS platform' },
    ],
    skills: [{ name: 'Cloud', keywords: ['AWS'] }],
  };
  const facts = computeFacts(r, '2024-01-01');
  const aws = facts.keywordExperience.find((k) => k.keyword === 'AWS');
  assert.equal(aws.years, 2.0);
});

test('duplicate name+startDate entries each contribute their own duration (regression)', () => {
  const r = {
    work: [
      { name: 'Same Co', position: 'Eng I', startDate: '2020-01', endDate: '2021-01', summary: 'AWS' },
      { name: 'Same Co', position: 'Eng II', startDate: '2020-01', endDate: '2024-01', summary: 'AWS' },
    ],
    skills: [{ name: 'Cloud', keywords: ['AWS'] }],
  };
  const facts = computeFacts(r, '2024-01-01');
  const aws = facts.keywordExperience.find((k) => k.keyword === 'AWS');
  // merged coverage 2020-01→2024-01 — the old by-(name,start) lookup bound both
  // matches to the first role and reported 2.0
  assert.equal(aws.years, 4.0);
});

test('invalid dates are skipped — no NaN reaches the facts block', () => {
  const r = {
    work: [
      { name: 'Bad', position: 'Eng', startDate: '2025-99', endDate: '2026-01', summary: 'AWS' },
      { name: 'Good', position: 'Eng', startDate: '2020-01', endDate: '2022-01', summary: 'AWS' },
    ],
    skills: [{ name: 'Cloud', keywords: ['AWS'] }],
  };
  const facts = computeFacts(r, '2024-01-01');
  assert.ok(Number.isFinite(facts.totalYears));
  assert.equal(facts.totalYears, 2.0);
  assert.equal(facts.roles.length, 1);
  const prompt = buildSystemPrompt(r, facts, '2024-01-01');
  assert.ok(!prompt.includes('NaN'));
});

test('per-role durations and current role with missing endDate', () => {
  const facts = computeFacts(fixture, '2024-01-01');
  const alpha = facts.roles.find((r) => r.company === 'Alpha');
  const beta = facts.roles.find((r) => r.company === 'Beta');
  assert.equal(alpha.years, 2.0);
  assert.equal(alpha.current, false);
  assert.equal(beta.years, 2.0); // endDate missing → today
  assert.equal(beta.current, true);
  assert.equal(beta.end, null);
  assert.deepEqual(facts.currentRole, { company: 'Beta', position: 'DevOps Engineer', years: 2.0 });
});

test('keyword table: matching keyword sums roles, nonsense keyword absent', () => {
  const facts = computeFacts(fixture, '2024-01-01');
  const aws = facts.keywordExperience.find((k) => k.keyword === 'AWS');
  assert.ok(aws, 'AWS entry present');
  assert.equal(aws.years, 4.0); // 2.0 (Alpha) + 2.0 (Beta)
  assert.equal(aws.roleCount, 2);
  assert.deepEqual(aws.companies, ['Alpha', 'Beta']);
  assert.equal(aws.line, 'AWS: explicitly mentioned in 2 roles covering 4.0 years (Alpha, Beta)');

  const k8s = facts.keywordExperience.find((k) => k.keyword === 'Kubernetes');
  assert.ok(k8s, 'Kubernetes entry present');
  assert.equal(k8s.roleCount, 1);

  const fortran = facts.keywordExperience.find((k) => k.keyword === 'Fortran');
  assert.equal(fortran, undefined, 'keyword with zero work matches is omitted');
});

test('keyword matching respects alphanumeric boundaries (Go must not match Google)', () => {
  const r = {
    work: [
      {
        name: 'Gamma',
        position: 'Engineer',
        startDate: '2020-01',
        endDate: '2021-01',
        summary: 'Worked with Google Cloud and GitOps.',
        highlights: [],
      },
    ],
    skills: [{ name: 'Lang', keywords: ['Go'] }],
  };
  const facts = computeFacts(r, '2024-01-01');
  assert.equal(facts.keywordExperience.find((k) => k.keyword === 'Go'), undefined);
});

test('real resume: AWS present in keyword table, current role is DrAnsay', () => {
  const facts = computeFacts(realResume, '2026-07-20');
  const aws = facts.keywordExperience.find((k) => k.keyword === 'AWS');
  assert.ok(aws, 'AWS entry present for real resume');
  assert.ok(aws.years > 0);
  assert.equal(facts.currentRole.company, 'DrAnsay');
  assert.ok(facts.totalYears > 10, `expected >10 years total, got ${facts.totalYears}`);
});

test('prompt strips [TODO placeholders and embeds facts + contact info', () => {
  const facts = computeFacts(realResume, '2026-07-20');
  const prompt = buildSystemPrompt(realResume, facts, '2026-07-20');
  assert.ok(!prompt.includes('[TODO'), 'no TODO placeholder leaks into the prompt');
  assert.ok(prompt.includes('rafaelbsathler@gmail.com'));
  assert.ok(prompt.includes('linkedin.com/in/rafaelbsathler'));
  assert.ok(prompt.includes(`My total professional experience: ${facts.totalYears.toFixed(1)} years`));
  assert.ok(prompt.includes('Open to Work'));
  // meta stripped except availability
  assert.ok(!prompt.includes('lastUpdated'));
});

test('prompt extracts FULL resume content: every work/education/training/project/skill entry present', () => {
  const facts = computeFacts(realResume, '2026-07-20');
  const prompt = buildSystemPrompt(realResume, facts, '2026-07-20');
  for (const w of realResume.work) {
    assert.ok(prompt.includes(w.name), `work entry missing: ${w.name}`);
    assert.ok(prompt.includes(w.position), `position missing: ${w.position}`);
  }
  for (const e of realResume.education) {
    assert.ok(prompt.includes(e.institution), `education missing: ${e.institution}`);
  }
  for (const t of realResume.training) {
    assert.ok(prompt.includes(t.name), `training missing: ${t.name}`);
  }
  for (const p of realResume.projects) {
    assert.ok(prompt.includes(p.name), `project missing: ${p.name}`);
  }
  for (const s of realResume.skills) {
    for (const kw of s.keywords) assert.ok(prompt.includes(kw), `skill keyword missing: ${kw}`);
  }
  // no raw JSON dump — content must be extracted plaintext
  assert.ok(!prompt.includes('"highlights":'), 'raw JSON leaked into prompt');
});

test('prompt stays within a sane token budget for free-tier models', () => {
  const facts = computeFacts(realResume, '2026-07-20');
  const prompt = buildSystemPrompt(realResume, facts, '2026-07-20');
  // ~4 chars/token heuristic; llama free-tier context is 24k+, keep prompt ≤8k tokens
  const approxTokens = Math.ceil(prompt.length / 4);
  assert.ok(approxTokens <= 8000, `prompt too large: ~${approxTokens} tokens`);
});

test('prompt speaks as Rafael in the first person', () => {
  const facts = computeFacts(realResume, '2026-07-20');
  const prompt = buildSystemPrompt(realResume, facts, '2026-07-20');
  assert.ok(prompt.includes('FIRST PERSON'));
  assert.ok(prompt.includes('My total professional experience'));
  assert.ok(prompt.includes('My current role'));
});

test('prompt keeps non-TODO part of a string containing a TODO fragment', () => {
  const facts = computeFacts(fixture, '2024-01-01');
  const r = structuredClone(fixture);
  r.work[0].summary = 'Real achievement here. [TODO: refine summary]';
  r.work[0].highlights = ['[TODO: achievement #1]', 'Kept highlight'];
  const prompt = buildSystemPrompt(r, facts, '2024-01-01');
  assert.ok(prompt.includes('Real achievement here.'));
  assert.ok(prompt.includes('Kept highlight'));
  assert.ok(!prompt.includes('[TODO'));
});
