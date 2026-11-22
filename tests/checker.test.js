import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VERBS } from './fixtures/verbs.js';
import { SUBJECTS, FRAMES, COMPLEMENTS } from './fixtures/sentences.js';
import { createGenerator } from '../js/core/generator.js';
import { createChecker } from '../js/core/checker.js';

const g = createGenerator({ verbs: VERBS, subjects: SUBJECTS, frames: FRAMES, complements: COMPLEMENTS });
const b = (verb, formId, frameId, subjectId, complementIndex = 0) =>
  g.build({ verb, formId, frameId, subjectId, complementIndex });
const c = createChecker({ verbs: VERBS });
const ex = (infinitive, formId, person, answers, aux = null) => ({ infinitive, formId, person, answers, aux });

test('correct, including all variants', () => {
  const e = b('aller', 'ind.pc', 'pc-start', 'vous');
  for (const a of ['êtes allé', 'êtes allée', 'êtes allés', 'êtes allées']) {
    assert.deepEqual(c.check(e, a), { verdict: 'correct', typed: a, expected: e.answers[0], note: null });
  }
});

test('normalisation and empty input', () => {
  const e = b('aller', 'ind.pc', 'pc-hier', 'elles');
  assert.equal(c.check(e, '  SONT   Allées ').verdict, 'correct');
  assert.equal(c.check(e, '  SONT   Allées ').typed, 'sont allées');
  const ai = ex('avoir', 'ind.present', 0, ["j'ai"]);
  assert.equal(c.check(ai, 'J’ai').verdict, 'correct');
  assert.equal(c.check(e, '   '), null);
  assert.equal(c.check(e, ''), null);
});

test('accent-only slips', () => {
  assert.deepEqual(c.check(ex('être', 'ind.imparfait', 2, ['était']), 'etait'),
    { verdict: 'accent', typed: 'etait', expected: 'était', note: null });
  assert.equal(c.check(b('aller', 'ind.pc', 'pc-hier', 'elles'), 'sont allees').verdict, 'accent');
});

test('agreement', () => {
  const r = c.check(b('aller', 'ind.pc', 'pc-hier', 'elles'), 'sont allés');
  assert.deepEqual(r.note, { kind: 'agreement' });
  assert.equal(r.verdict, 'wrong');
});

test('auxiliary both ways', () => {
  assert.deepEqual(c.check(b('aller', 'ind.pc', 'pc-hier', 'elles'), 'ont allé').note,
    { kind: 'auxiliary', expected: 'être' });
  assert.deepEqual(c.check(b('passer', 'ind.pc', 'pc-hier', 'marie', 0), 'a passé').note,
    { kind: 'auxiliary', expected: 'être' });
  assert.deepEqual(c.check(b('passer', 'ind.pc', 'pc-hier', 'marie', 1), 'est passée').note,
    { kind: 'auxiliary', expected: 'avoir' });
});

test('person', () => {
  assert.deepEqual(c.check(b('aller', 'ind.present', 'pres-start', 'je'), 'va').note, { kind: 'person', person: 2 });
  assert.deepEqual(c.check(b('aller', 'ind.present', 'pres-start', 'elles'), 'vas').note, { kind: 'person', person: 1 });
  assert.deepEqual(c.check(ex('faire', 'ind.present', 2, ['fait']), 'fais').note, { kind: 'person', person: 0 });
});

test('form, preferring the same person', () => {
  // "allions" is imparfait p3 and subj.present p3; exercise person 3 → first in FORMS order.
  assert.deepEqual(c.check(ex('aller', 'ind.present', 3, ['allons']), 'allions').note,
    { kind: 'form', formId: 'ind.imparfait', person: 3 });
  // "passe" is subj.present p0 and p2; exercise is ind.futur p2 → same person p2 preferred.
  assert.deepEqual(c.check(ex('passer', 'ind.futur', 2, ['passera']), 'passe').note,
    { kind: 'form', formId: 'ind.present', person: 2 });
  // No same-person match: first in FORMS then person order.
  assert.deepEqual(c.check(ex('aller', 'ind.present', 0, ['vais']), 'irons').note,
    { kind: 'form', formId: 'ind.futur', person: 3 });
  // Compound form with the effective (overridden) auxiliary.
  assert.deepEqual(c.check(b('passer', 'ind.present', 'pres-start', 'marie', 0), 'soit passée').note,
    { kind: 'form', formId: 'subj.passe', person: 2 });
});

test('form found only with stripped accents', () => {
  const r = c.check(ex('être', 'ind.present', 2, ['est']), 'etait');
  assert.deepEqual(r, { verdict: 'wrong', typed: 'etait', expected: 'est', note: { kind: 'form', formId: 'ind.imparfait', person: 2 } });
});

test('exact diagnosis beats accent', () => {
  const verbs = [...VERBS, { inf: 'parler', aux: 'avoir', pp: 'parlé', simple: {
    'ind.present': ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent'],
    'ind.imparfait': ['parlé', 'parlais', 'parlait', 'parlions', 'parliez', 'parlaient'], // synthetic
    'ind.futur': ['parlerai', 'parleras', 'parlera', 'parlerons', 'parlerez', 'parleront'],
    'subj.present': ['parle', 'parles', 'parle', 'parlions', 'parliez', 'parlent'],
  } }];
  const r = createChecker({ verbs }).check(ex('parler', 'ind.imparfait', 0, ['parlé']), 'parle');
  assert.deepEqual(r.note, { kind: 'form', formId: 'ind.present', person: 0 });
  assert.equal(r.verdict, 'wrong');
});

test('unrelated, subject typed, unknown verb', () => {
  const e = b('aller', 'ind.present', 'pres-start', 'je');
  assert.deepEqual(c.check(e, 'mange'), { verdict: 'wrong', typed: 'mange', expected: 'vais', note: null });
  assert.equal(c.check(e, 'je vais').note, null);
  assert.throws(() => c.check(ex('nope', 'ind.present', 0, ['x']), 'x'), /Unknown verb/);
});
