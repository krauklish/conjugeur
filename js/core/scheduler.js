// Exercise scheduling: pure functions over a `stats` object
// (keyed by "<infinitive>|<formId>" → { seen, right, streak }). No storage, no DOM.

// Base weight every pair gets, so even mastered pairs come back occasionally.
const BASE_WEIGHT = 1;
// Extra weight scaled by the (smoothed) error rate: a pair always wrong tends to 1 + 4 = 5.
const ERROR_WEIGHT = 4;
// Laplace smoothing: acc = (right + PRIOR_RIGHT) / (seen + PRIOR_SEEN), so unseen = 0.5.
const PRIOR_RIGHT = 1;
const PRIOR_SEEN = 2;
// A current run of this many correct answers halves the weight.
const STREAK_THRESHOLD = 3;
const STREAK_FACTOR = 0.5;

export function pairKey(verb, formId) {
  return `${verb}|${formId}`;
}

export function record(stats, verb, formId, isRight) {
  const key = pairKey(verb, formId);
  const prev = stats?.[key] ?? { seen: 0, right: 0, streak: 0 };
  return {
    ...stats,
    [key]: {
      seen: prev.seen + 1,
      right: prev.right + (isRight ? 1 : 0),
      streak: isRight ? prev.streak + 1 : 0,
    },
  };
}

export function weight(entry) {
  const seen = entry?.seen ?? 0;
  const right = entry?.right ?? 0;
  const streak = entry?.streak ?? 0;
  const acc = (right + PRIOR_RIGHT) / (seen + PRIOR_SEEN);
  let w = BASE_WEIGHT + ERROR_WEIGHT * (1 - acc);
  if (streak >= STREAK_THRESHOLD) w *= STREAK_FACTOR;
  return w;
}

export function pick(selection, stats, opts = {}) {
  const random = opts.random ?? Math.random;
  const avoid = opts.avoid ?? null;
  const isAvailable = opts.isAvailable ?? (() => true);
  const eligible = [];
  for (const verb of selection?.verbs ?? []) {
    for (const formId of selection?.forms ?? []) {
      if (isAvailable(verb, formId)) eligible.push({ verb, formId });
    }
  }
  if (eligible.length === 0) return null;
  let pool = eligible;
  if (avoid && eligible.length > 1) {
    const rest = eligible.filter((p) => !(p.verb === avoid.verb && p.formId === avoid.formId));
    if (rest.length > 0) pool = rest;
  }
  const weights = pool.map((p) => weight(stats?.[pairKey(p.verb, p.formId)]));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r < 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function summary(stats, verbs, forms) {
  const pairs = [];
  let total = 0;
  let right = 0;
  for (const verb of verbs) {
    for (const formId of forms) {
      const e = stats?.[pairKey(verb, formId)];
      const seen = e?.seen ?? 0;
      const r = e?.right ?? 0;
      total += seen;
      right += r;
      pairs.push({ verb, formId, seen, right: r, rate: seen > 0 ? r / seen : null });
    }
  }
  return { total, right, rate: total > 0 ? right / total : null, pairs };
}

export function weakest(stats, verbs, forms, n = 5, minSeen = 3) {
  return summary(stats, verbs, forms)
    .pairs.map((p, i) => ({ p, i }))
    .filter(({ p }) => p.seen >= minSeen && p.seen > 0)
    .sort((a, b) => a.p.rate - b.p.rate || b.p.seen - a.p.seen || a.i - b.i)
    .slice(0, n)
    .map(({ p }) => p);
}
