import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/core/store.js';

const KEY = 'conjugeur.v1';
function memStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    raw: m,
  };
}
const V = ['aller', 'être', 'avoir'];
const F = ['ind.pres', 'ind.pc'];

test('round-trip selection and stats across instances', () => {
  const st = memStorage();
  const s1 = createStore(st);
  assert.deepEqual(s1.loadSelection(V, F), { verbs: V, forms: F });
  assert.deepEqual(s1.loadStats(), {});
  s1.saveSelection({ verbs: ['avoir', 'aller'], forms: ['ind.pc'] }, V, F);
  s1.saveStats({ 'aller|ind.pc': { seen: 3, right: 2, streak: 1 } });
  const s2 = createStore(st);
  assert.deepEqual(s2.loadSelection(V, F), { verbs: ['aller', 'avoir'], forms: ['ind.pc'] });
  assert.deepEqual(s2.loadStats(), { 'aller|ind.pc': { seen: 3, right: 2, streak: 1 } });
  assert.deepEqual(JSON.parse(st.raw.get(KEY)).off, { verbs: ['être'], forms: ['ind.pres'] });
});

test('off semantics: new verb appears selected; unknown ids ignored; order preserved', () => {
  const st = memStorage({ [KEY]: JSON.stringify({ off: { verbs: ['être', 'ghost'], forms: [] }, stats: {} }) });
  const s = createStore(st);
  assert.deepEqual(s.loadSelection(['venir', ...V], F).verbs, ['venir', 'aller', 'avoir']);
  s.saveSelection({ verbs: ['avoir', 'nope'], forms: F }, V, F);
  assert.deepEqual(createStore(st).loadSelection(V, F).verbs, ['avoir']);
});

test('saving one part keeps the other; clearStats keeps selection', () => {
  const st = memStorage();
  const s = createStore(st);
  s.saveStats({ 'a|x': { seen: 1, right: 1, streak: 1 } });
  s.saveSelection({ verbs: ['aller'], forms: F }, V, F);
  assert.deepEqual(createStore(st).loadStats(), { 'a|x': { seen: 1, right: 1, streak: 1 } });
  s.saveStats({ 'b|x': { seen: 2, right: 0, streak: 0 } });
  assert.deepEqual(createStore(st).loadSelection(V, F).verbs, ['aller']);
  s.clearStats();
  const fresh = createStore(st);
  assert.deepEqual(fresh.loadStats(), {});
  assert.deepEqual(fresh.loadSelection(V, F).verbs, ['aller']);
});

test('corrupt JSON and wrong types behave as empty', () => {
  for (const bad of ['{not json', 'null', '42', '[]', JSON.stringify({ off: 'x', stats: [] }), JSON.stringify({ off: { verbs: 'aller', forms: [1, 'ind.pc'] } })]) {
    const s = createStore(memStorage({ [KEY]: bad }));
    const sel = s.loadSelection(V, F);
    assert.deepEqual(sel.verbs, V);
    assert.deepEqual(s.loadStats(), {});
    s.saveStats({ 'a|x': { seen: 1, right: 0, streak: 0 } });
    assert.deepEqual(s.loadStats(), { 'a|x': { seen: 1, right: 0, streak: 0 } });
  }
});

test('throwing storage: never throws, works in memory', () => {
  const boom = () => { throw new Error('blocked'); };
  const s = createStore({ getItem: boom, setItem: boom, removeItem: boom });
  assert.deepEqual(s.loadSelection(V, F), { verbs: V, forms: F });
  s.saveSelection({ verbs: ['aller'], forms: F }, V, F);
  s.saveStats({ 'a|x': { seen: 2, right: 1, streak: 0 } });
  assert.deepEqual(s.loadSelection(V, F).verbs, ['aller']);
  assert.deepEqual(s.loadStats(), { 'a|x': { seen: 2, right: 1, streak: 0 } });
  s.clearStats();
  assert.deepEqual(s.loadStats(), {});
});

test('createStore(undefined) works in memory', () => {
  const s = createStore(undefined);
  s.saveSelection({ verbs: ['être'], forms: ['ind.pc'] }, V, F);
  assert.deepEqual(s.loadSelection(V, F), { verbs: ['être'], forms: ['ind.pc'] });
  s.saveStats({ 'a|x': { seen: 1, right: 1, streak: 1 } });
  assert.equal(s.loadStats()['a|x'].seen, 1);
});

test('loadStats sanitises entries and returns a copy', () => {
  const stats = {
    ok: { seen: 3, right: 2, streak: 1 },
    noStreak: { seen: 3, right: 2 },
    tooRight: { seen: 1, right: 2, streak: 0 },
    neg: { seen: -1, right: 0, streak: 0 },
    frac: { seen: 1.5, right: 0, streak: 0 },
    str: { seen: '3', right: 1, streak: 0 },
    notObj: 5,
    nul: null,
  };
  const s = createStore(memStorage({ [KEY]: JSON.stringify({ stats }) }));
  const got = s.loadStats();
  assert.deepEqual(got, { ok: { seen: 3, right: 2, streak: 1 }, noStreak: { seen: 3, right: 2, streak: 0 } });
  got.ok.seen = 99;
  assert.equal(s.loadStats().ok.seen, 3);
});
