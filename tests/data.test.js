// Integration: the real verb data drives the conjugator without gaps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FORMS } from '../js/data/forms.js';
import { VERBS } from '../js/data/verbs.js';
import { createConjugator } from '../js/core/conjugator.js';

const c = createConjugator(VERBS);

test('every verb × form × person yields answers, or null only for impersonal verbs', () => {
  for (const verb of VERBS) {
    for (const form of FORMS) {
      for (let person = 0; person < 6; person++) {
        const answers = c.conjugate(verb.inf, form.id, { person });
        if (verb.impersonal && person !== 2) {
          assert.equal(answers, null, `${verb.inf} ${form.id} p${person}`);
        } else {
          assert.ok(Array.isArray(answers) && answers.length > 0, `${verb.inf} ${form.id} p${person}`);
          assert.equal(new Set(answers).size, answers.length, `${verb.inf} ${form.id} p${person} duplicates`);
        }
      }
    }
  }
});

test('spot checks on real data', () => {
  assert.deepEqual(c.conjugate('venir', 'ind.pc', { person: 5, gender: 'f' }), ['sont venues']);
  assert.deepEqual(c.conjugate('prendre', 'ind.pc', { person: 0 }), ['ai pris']);
  assert.deepEqual(c.conjugate('devoir', 'subj.passe', { person: 2, gender: 'f' }), ['ait dû']);
  assert.deepEqual(c.conjugate('falloir', 'ind.pc', { person: 2 }), ['a fallu']);
  assert.deepEqual(c.conjugate('passer', 'ind.pc', { person: 2, gender: 'f' }, { aux: 'être' }), ['est passée']);
  assert.deepEqual(c.conjugate('vouloir', 'subj.present', { person: 3 }), ['voulions']);
});
