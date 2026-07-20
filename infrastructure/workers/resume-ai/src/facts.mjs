// Deterministic facts derived from JSON Resume work history.
// LLMs are unreliable at date arithmetic — every duration the model quotes
// must come precomputed from here (embedded in the system prompt).
// Pure module: no Worker APIs, runs under `node --test`.

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/**
 * @param {string} isoDate "YYYY-MM" or "YYYY-MM-DD"
 * @returns {Date|null} null when the string does not parse to a valid date
 */
function toDate(isoDate) {
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Raw (unrounded) years between two valid Date objects. */
function yearsBetweenDates(start, end) {
  return (end.getTime() - start.getTime()) / MS_PER_YEAR;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// Substring match with alphanumeric-boundary guard: "Go" must not match
// "Google"/"GitOps", but "AWS" still matches inside "AWS/GCP".
function textHasKeyword(text, keyword) {
  const hay = text.toLowerCase();
  const kw = keyword.toLowerCase();
  const isAlnum = (c) => c !== undefined && /[a-z0-9]/.test(c);
  let idx = hay.indexOf(kw);
  while (idx !== -1) {
    if (!isAlnum(hay[idx - 1]) && !isAlnum(hay[idx + kw.length])) return true;
    idx = hay.indexOf(kw, idx + 1);
  }
  return false;
}

// Sum of non-overlapping [startMs, endMs] coverage — overlapping roles are not
// double-counted, employment gaps are not counted at all.
function mergedIntervalYears(intervals) {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  let total = 0;
  let curStart = null;
  let curEnd = null;
  for (const [s, e] of sorted) {
    if (curEnd === null || s > curEnd) {
      if (curEnd !== null) total += curEnd - curStart;
      curStart = s;
      curEnd = e;
    } else if (e > curEnd) {
      curEnd = e;
    }
  }
  if (curEnd !== null) total += curEnd - curStart;
  return total / MS_PER_YEAR;
}

/**
 * @typedef {object} Facts
 * @property {string} todayISO
 * @property {number} totalYears summed non-overlapping employment (gaps excluded), 1 decimal
 * @property {number} careerSpanYears earliest work startDate → today, 1 decimal
 * @property {Array<{company:string, position:string, start:string, end:string|null, years:number, current:boolean}>} roles
 * @property {{company:string, position:string, years:number}|null} currentRole
 * @property {Array<{keyword:string, years:number, roleCount:number, companies:string[], line:string}>} keywordExperience
 */

/**
 * @param {object} resume JSON Resume object (basics, work[], skills[], ...)
 * @param {string} todayISO "YYYY-MM-DD" — injected so results are deterministic/testable
 * @returns {Facts}
 */
export function computeFacts(resume, todayISO) {
  const work = Array.isArray(resume.work) ? resume.work : [];
  const today = toDate(todayISO);

  // Role + its searchable text built in ONE pass — keyword matching later works
  // by reference, never by re-finding via (name, startDate) equality (which
  // crashed on nameless entries and mis-bound duplicate name+startDate pairs).
  const roleEntries = [];
  for (const w of work) {
    if (!w.startDate) continue;
    const start = toDate(w.startDate);
    const end = w.endDate ? toDate(w.endDate) : today;
    // Invalid/unparseable dates would leak NaN into the "authoritative" facts
    // block — skip the entry instead.
    if (!start || !end) continue;
    const rawYears = yearsBetweenDates(start, end);
    roleEntries.push({
      role: {
        company: w.name || '',
        position: w.position || '',
        start: w.startDate,
        end: w.endDate || null,
        years: round1(rawYears),
        current: !w.endDate,
      },
      rawYears,
      startMs: start.getTime(),
      endMs: end.getTime(),
      text: [w.position, w.summary, ...(w.highlights || [])].filter(Boolean).join(' '),
    });
  }

  const roles = roleEntries.map((e) => e.role);

  // Summed tenure (merged intervals) vs career span: the resume itself says
  // "10+ years" while first-role→today is ~12 — expose both, clearly labeled,
  // so the model never presents gap time as experience.
  const totalYears = round1(mergedIntervalYears(roleEntries.map((e) => [e.startMs, e.endMs])));
  const earliest = roleEntries.reduce((min, e) => (min === null || e.startMs < min ? e.startMs : min), null);
  const careerSpanYears = earliest !== null && today ? round1((today.getTime() - earliest) / MS_PER_YEAR) : 0;

  const currentEntry = roles.find((r) => r.current) || null;
  const currentRole = currentEntry
    ? { company: currentEntry.company, position: currentEntry.position, years: currentEntry.years }
    : null;

  // Keyword-experience table: for every skills[].keywords entry, sum durations
  // of work entries whose position+summary+highlights mention the keyword.
  // Keywords with zero matches are omitted (no "0 years" noise).
  const keywordExperience = [];
  const seen = new Set();
  for (const group of resume.skills || []) {
    for (const keyword of group.keywords || []) {
      if (seen.has(keyword.toLowerCase())) continue;
      seen.add(keyword.toLowerCase());
      const matches = roleEntries.filter((e) => textHasKeyword(e.text, keyword));
      if (matches.length === 0) continue;
      const years = round1(mergedIntervalYears(matches.map((e) => [e.startMs, e.endMs])));
      const companies = matches.map((e) => e.role.company);
      keywordExperience.push({
        keyword,
        years,
        roleCount: matches.length,
        companies,
        line: `${keyword}: explicitly mentioned in ${matches.length} role${matches.length === 1 ? '' : 's'} covering ${years.toFixed(1)} years (${companies.join(', ')})`,
      });
    }
  }

  return {
    todayISO,
    totalYears,
    careerSpanYears,
    roles,
    currentRole,
    keywordExperience,
  };
}
