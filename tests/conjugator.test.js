import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConjugator } from '../js/core/conjugator.js';
import { FORMS } from '../js/data/forms.js';
import { VERBS } from './fixtures/verbs.js';

const c = createConjugator(VERBS);
const cj = (inf, f, subject, opts) => c.conjugate(inf, f, subject, opts);

test('getVerb', () => {
  assert.equal(c.getVerb('aller').pp, 'allé');
  assert.equal(c.getVerb('nope'), null);
});

test('simple forms', () => {
  assert.deepEqual(cj('aller', 'ind.present', { person: 0 }), ['vais']);
  assert.deepEqual(cj('aller', 'ind.futur', { person: 5 }), ['iront']);
  assert.deepEqual(cj('faire', 'subj.present', { person: 3 }), ['fassions']);
  assert.deepEqual(cj('être', 'ind.imparfait', { person: 4, gender: 'f' }), ['étiez']);
  assert.deepEqual(cj('falloir', 'ind.present', { person: 2 }), ['faut']);
});

test('compound forms with avoir never agree', () => {
  assert.deepEqual(cj('faire', 'ind.pc', { person: 0 }), ['ai fait']);
  assert.deepEqual(cj('faire', 'ind.pc', { person: 5, gender: 'f', number: 'p' }), ['ont fait']);
  assert.deepEqual(cj('faire', 'subj.passe', { person: 0, gender: 'f' }), ['aie fait']);
  assert.deepEqual(cj('être', 'ind.pc', { person: 4, number: null }), ['avez été']);
  assert.deepEqual(cj('avoir', 'subj.passe', { person: 2 }), ['ait eu']);
  assert.deepEqual(cj('falloir', 'ind.pc', { person: 2 }), ['a fallu']);
});

test('être agreement matrix', () => {
  const pc = (s) => cj('aller', 'ind.pc', s);
  assert.deepEqual(pc({ person: 0 }), ['suis allé', 'suis allée']);
  assert.deepEqual(pc({ person: 0, gender: 'f' }), ['suis allée']);
  assert.deepEqual(pc({ person: 1, gender: 'm' }), ['es allé']);
  assert.deepEqual(pc({ person: 2, gender: 'f' }), ['est allée']);
  assert.deepEqual(pc({ person: 3 }), ['sommes allés', 'sommes allées']);
  assert.deepEqual(pc({ person: 3, gender: 'f' }), ['sommes allées']);
  assert.deepEqual(pc({ person: 4 }), ['êtes allé', 'êtes allée', 'êtes allés', 'êtes allées']);
  assert.deepEqual(pc({ person: 4, number: 'p', gender: 'f' }), ['êtes allées']);
  assert.deepEqual(pc({ person: 4, number: 's' }), ['êtes allé', 'êtes allée']);
  assert.deepEqual(pc({ person: 5, gender: 'f' }), ['sont allées']);
  assert.deepEqual(pc({ person: 5 }), ['sont allés', 'sont allées']);
  // explicit null number: both, per-person default first
  assert.deepEqual(pc({ person: 2, number: null }), ['est allé', 'est allée', 'est allés', 'est allées']);
  assert.deepEqual(pc({ person: 2, gender: 'm', number: null }), ['est allé', 'est allés']);
  assert.deepEqual(pc({ person: 5, gender: 'f', number: null }), ['sont allées', 'sont allée']);
  assert.deepEqual(pc({ person: 4, gender: null, number: null }), ['êtes allé', 'êtes allée', 'êtes allés', 'êtes allées']);
  assert.deepEqual(cj('aller', 'subj.passe', { person: 0, gender: 'f' }), ['sois allée']);
  assert.deepEqual(cj('aller', 'subj.passe', { person: 3, gender: 'm' }), ['soyons allés']);
});

test('opts.aux override on passer', () => {
  assert.deepEqual(cj('passer', 'ind.pc', { person: 2, gender: 'f' }), ['a passé']);
  assert.deepEqual(cj('passer', 'ind.pc', { person: 2, gender: 'f' }, { aux: 'être' }), ['est passée']);
  assert.deepEqual(cj('passer', 'subj.passe', { person: 5 }, { aux: 'être' }), ['soient passés', 'soient passées']);
  assert.deepEqual(cj('aller', 'ind.pc', { person: 0, gender: 'f' }, { aux: 'avoir' }), ['ai allé']);
});

test('falloir defective persons', () => {
  for (const p of [0, 1, 3, 4, 5]) for (const { id } of FORMS) assert.equal(cj('falloir', id, { person: p }), null, `${id}/${p}`);
  assert.deepEqual(cj('falloir', 'subj.passe', { person: 2 }), ['ait fallu']);
});

test('errors', () => {
  assert.throws(() => cj('nope', 'ind.present', { person: 0 }), /Unknown verb/);
  assert.throws(() => cj('aller', 'ind.passe-simple', { person: 0 }), /Unknown form/);
  for (const p of [-1, 6, 1.5, '0', undefined]) assert.throws(() => cj('aller', 'ind.present', { person: p }), /Bad person/);
  assert.throws(() => cj('aller', 'ind.present'), /Bad person/);
  assert.throws(() => cj('aller', 'ind.pc', { person: 0 }, { aux: 'faire' }), /Bad auxiliary/);
  assert.throws(() => c.allForms('nope'), /Unknown verb/);
});

test('allForms', () => {
  const aller = c.allForms('aller');
  assert.equal(aller.length, FORMS.length * 6);
  assert.deepEqual(aller.find((f) => f.formId === 'ind.pc' && f.person === 4).answers,
    ['êtes allé', 'êtes allée', 'êtes allés', 'êtes allées']);
  assert.deepEqual(aller.find((f) => f.formId === 'ind.imparfait' && f.person === 3).answers, ['allions']);
  const falloir = c.allForms('falloir');
  assert.equal(falloir.length, FORMS.length);
  assert.ok(falloir.every((f) => f.person === 2));
  assert.deepEqual(falloir.map((f) => f.answers[0]), ['faut', 'a fallu', 'fallait', 'faudra', 'faille', 'ait fallu']);
});

test('every registry form is conjugable for aller', () => {
  for (const { id } of FORMS) for (let p = 0; p < 6; p++) {
    const a = cj('aller', id, { person: p });
    assert.ok(Array.isArray(a) && a.length > 0, `${id}/${p}`);
    assert.equal(new Set(a).size, a.length);
  }
});

test('fixture sanity: 6 slots per simple table, NFC lowercase', () => {
  for (const v of VERBS) for (const t of Object.values(v.simple)) {
    assert.equal(t.length, 6);
    for (const f of t) if (f !== null) assert.equal(f, f.normalize('NFC').toLowerCase());
  }
});
