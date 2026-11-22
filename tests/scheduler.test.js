import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pairKey, record, weight, pick, summary, weakest } from '../js/core/scheduler.js';

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('pairKey', () => assert.equal(pairKey('aller', 'ind.pc'), 'aller|ind.pc'));

test('record: new key, right/wrong, streak reset, immutability', () => {
  const s0 = {};
  const s1 = record(s0, 'aller', 'ind.pc', true);
  assert.deepEqual(s0, {});
  assert.deepEqual(s1['aller|ind.pc'], { seen: 1, right: 1, streak: 1 });
  const s2 = record(s1, 'aller', 'ind.pc', true);
  assert.deepEqual(s2['aller|ind.pc'], { seen: 2, right: 2, streak: 2 });
  assert.deepEqual(s1['aller|ind.pc'], { seen: 1, right: 1, streak: 1 });
  const s3 = record(s2, 'aller', 'ind.pc', false);
  assert.deepEqual(s3['aller|ind.pc'], { seen: 3, right: 2, streak: 0 });
  const s4 = record(s3, 'être', 'ind.pres', false);
  assert.deepEqual(s4['être|ind.pres'], { seen: 1, right: 0, streak: 0 });
  assert.deepEqual(s4['aller|ind.pc'], s3['aller|ind.pc']);
});

test('weight: weak > unseen > strong; streak halves', () => {
  const unseen = weight(undefined);
  assert.equal(unseen, 3);
  const weak = weight({ seen: 6, right: 1, streak: 0 });
  const strong = weight({ seen: 6, right: 6, streak: 2 });
  assert.ok(weak > unseen && unseen > strong && strong > 0);
  const e = { seen: 6, right: 5, streak: 2 };
  assert.equal(weight({ ...e, streak: 3 }), weight(e) / 2);
});

const sel = { verbs: ['a', 'b'], forms: ['x', 'y'] };

test('pick: deterministic with stubbed random', () => {
  assert.deepEqual(pick(sel, {}, { random: () => 0 }), { verb: 'a', formId: 'x' });
  assert.deepEqual(pick(sel, {}, { random: () => 0.999 }), { verb: 'b', formId: 'y' });
  assert.deepEqual(pick(sel, {}, { random: () => 0.3 }), { verb: 'a', formId: 'y' });
  assert.deepEqual(pick(sel, {}, { random: () => 0.3 }), pick(sel, {}, { random: () => 0.3 }));
});

test('pick: avoid', () => {
  const avoid = { verb: 'a', formId: 'x' };
  for (const r of [0, 0.25, 0.5, 0.99]) {
    assert.notDeepEqual(pick(sel, {}, { random: () => r, avoid }), avoid);
  }
  const one = { verbs: ['a'], forms: ['x'] };
  assert.deepEqual(pick(one, {}, { random: () => 0.5, avoid }), avoid);
  // only remaining available pair is the avoided one
  assert.deepEqual(pick(sel, {}, { avoid, isAvailable: (v, f) => v === 'a' && f === 'x' }), avoid);
});

test('pick: isAvailable and empty', () => {
  const rnd = mulberry32(1);
  for (let i = 0; i < 50; i++) {
    assert.equal(pick(sel, {}, { random: rnd, isAvailable: (v) => v === 'b' }).verb, 'b');
  }
  assert.equal(pick({ verbs: [], forms: ['x'] }, {}), null);
  assert.equal(pick(sel, {}, { isAvailable: () => false }), null);
});

test('pick: weak pair drawn clearly more often than mastered one', () => {
  const s = {
    'a|x': { seen: 10, right: 2, streak: 0 },
    'b|x': { seen: 10, right: 10, streak: 10 },
  };
  const rnd = mulberry32(42);
  const counts = { a: 0, b: 0 };
  for (let i = 0; i < 5000; i++) counts[pick({ verbs: ['a', 'b'], forms: ['x'] }, s, { random: rnd }).verb]++;
  assert.ok(counts.b > 0, 'mastered still appears');
  assert.ok(counts.a > counts.b * 4, JSON.stringify(counts));
});

test('summary', () => {
  const s = { 'a|x': { seen: 4, right: 3, streak: 1 }, 'b|y': { seen: 2, right: 0, streak: 0 }, 'z|x': { seen: 9, right: 9, streak: 9 } };
  const r = summary(s, ['a', 'b'], ['x', 'y']);
  assert.equal(r.total, 6);
  assert.equal(r.right, 3);
  assert.equal(r.rate, 0.5);
  assert.deepEqual(r.pairs.map((p) => [p.verb, p.formId, p.seen, p.right, p.rate]), [
    ['a', 'x', 4, 3, 0.75], ['a', 'y', 0, 0, null], ['b', 'x', 0, 0, null], ['b', 'y', 2, 0, 0],
  ]);
  assert.equal(summary({}, ['a'], ['x']).rate, null);
});

test('weakest: minSeen, ties, n', () => {
  const s = {
    'a|x': { seen: 4, right: 2, streak: 0 }, // 0.5
    'a|y': { seen: 8, right: 4, streak: 0 }, // 0.5, more seen
    'b|x': { seen: 2, right: 0, streak: 0 }, // below minSeen
    'b|y': { seen: 3, right: 3, streak: 3 }, // 1
    'c|x': { seen: 4, right: 2, streak: 0 }, // 0.5 tie with a|x, later
    'c|y': { seen: 5, right: 1, streak: 0 }, // 0.2
  };
  const keys = (l) => l.map((p) => pairKey(p.verb, p.formId));
  assert.deepEqual(keys(weakest(s, ['a', 'b', 'c'], ['x', 'y'])), ['c|y', 'a|y', 'a|x', 'c|x', 'b|y']);
  assert.deepEqual(keys(weakest(s, ['a', 'b', 'c'], ['x', 'y'], 2)), ['c|y', 'a|y']);
  assert.deepEqual(keys(weakest(s, ['a', 'b', 'c'], ['x', 'y'], 10, 2)).includes('b|x'), true);
  assert.deepEqual(weakest({}, ['a'], ['x']), []);
  assert.deepEqual(weakest(s, ['a'], ['x'], 5, 0).length, 1); // minSeen 0 still excludes null rates
});
