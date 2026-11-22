import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VERBS } from './fixtures/verbs.js';
import { SUBJECTS, FRAMES, COMPLEMENTS } from './fixtures/sentences.js';
import { createGenerator, splitFrame } from '../js/core/generator.js';

const gen = (random) => createGenerator({ verbs: VERBS, subjects: SUBJECTS, frames: FRAMES, complements: COMPLEMENTS, random });
const g = gen();
const b = (verb, formId, frameId, subjectId, complementIndex = 0) =>
  g.build({ verb, formId, frameId, subjectId, complementIndex });
const full = (e) => e.before + e.answers[0] + e.after;

test('splitFrame splits around {S} ___ {C}, keeping text after {C}', () => {
  assert.deepEqual(splitFrame('{S} ___ {C} tous les jours.'), { prefix: '', suffix: ' tous les jours.' });
  assert.deepEqual(splitFrame('Hier, {S} ___ {C}.'), { prefix: 'Hier, ', suffix: '.' });
  assert.throws(() => splitFrame('{S} {C} ___.'));
  assert.throws(() => splitFrame('{S} ___ {C} {S}.'));
});

test('basic rendering and punctuation', () => {
  const e = b('aller', 'ind.pc', 'pc-hier', 'elles');
  assert.equal(e.before, 'Hier, elles ');
  assert.equal(e.after, ' au marché.');
  assert.deepEqual(e.answers, ['sont allées']);
  assert.equal(e.cue, '« hier »');
  assert.equal(e.person, 5);
  assert.deepEqual(e.ref, { verb: 'aller', frameId: 'pc-hier', subjectId: 'elles', complementIndex: 0 });
  assert.equal(full(b('aller', 'ind.present', 'pres-si', 'marie')), 'Si Marie va au marché, tant mieux.');
});

test('elision before subject', () => {
  assert.equal(b('aller', 'subj.present', 'subj-faut', 'il').before, "Il faut qu'il ");
  assert.equal(b('aller', 'subj.present', 'subj-faut', 'elle').before, "Il faut qu'elle ");
  assert.equal(b('aller', 'subj.present', 'subj-faut', 'on').before, "Il faut qu'on ");
  assert.equal(b('aller', 'subj.present', 'subj-faut', 'marie').before, 'Il faut que Marie ');
  assert.equal(b('aller', 'subj.present', 'subj-bien', 'elle').before, "Bien qu'elle ");
  assert.equal(b('aller', 'ind.present', 'pres-si', 'il').before, "S'il ");
  assert.equal(b('aller', 'ind.present', 'pres-si', 'elle').before, 'Si elle ');
  assert.equal(full(b('aller', 'subj.present', 'subj-bien', 'elle')), "Bien qu'elle aille au marché !");
});

test('je elision and capitalisation', () => {
  assert.equal(b('avoir', 'ind.pc', 'pc-hier', 'je').before, "Hier, j'");
  assert.equal(full(b('avoir', 'ind.pc', 'pc-hier', 'je')), "Hier, j'ai eu faim.");
  assert.equal(b('aller', 'ind.present', 'pres-start', 'je').before, 'Je ');
  assert.equal(b('avoir', 'ind.present', 'pres-start', 'je').before, "J'");
  assert.equal(b('aller', 'ind.present', 'pres-si', 'je').before, 'Si je ');
  assert.equal(b('aller', 'ind.present', 'pres-start', 'mes-parents').before, 'Mes parents ');
  assert.equal(b('aller', 'ind.present', 'pres-start', 'marie').before, 'Marie ');
  assert.equal(full(b('aller', 'ind.present', 'pres-start', 'marie')), 'Marie va au marché tous les jours.');
});

test('agreement variants flow through', () => {
  assert.equal(b('aller', 'ind.pc', 'pc-start', 'vous').answers.length, 4);
  assert.deepEqual(b('aller', 'ind.pc', 'pc-start', 'elles').answers, ['sont allées']);
  assert.deepEqual(b('aller', 'ind.pc', 'pc-start', 'je').answers.sort(), ['suis allé', 'suis allée']);
});

test('complement aux override', () => {
  assert.deepEqual(b('passer', 'ind.pc', 'pc-hier', 'marie', 0).answers, ['est passée']);
  assert.deepEqual(b('passer', 'ind.pc', 'pc-hier', 'marie', 1).answers, ['a passé']);
  assert.equal(b('passer', 'ind.pc', 'pc-hier', 'marie', 0).aux, 'être');
  assert.equal(b('passer', 'ind.pc', 'pc-hier', 'marie', 1).aux, null);
});

test('notPersons, notVerbs, notForms, impersonal', () => {
  assert.throws(() => b('aller', 'ind.pc', 'pc-hier', 'vous'), /person 4/);
  assert.throws(() => b('falloir', 'subj.present', 'subj-faut', 'il'), /excludes verb/);
  assert.throws(() => b('aller', 'ind.pc', 'pc-hier', 'il', 1), /excludes ind\.pc/);
  assert.throws(() => b('falloir', 'ind.present', 'pres-start', 'elle'), /impersonal/);
  assert.equal(full(b('falloir', 'ind.present', 'pres-start', 'il')), 'Il faut partir tous les jours.');
});

test('notFrames on a complement excludes specific frames only', () => {
  const g2 = createGenerator({
    verbs: VERBS, subjects: SUBJECTS, frames: FRAMES,
    complements: { aller: [{ text: 'au marché', notFrames: ['pres-si'] }] },
  });
  assert.throws(() => g2.build({ verb: 'aller', formId: 'ind.present', frameId: 'pres-si', subjectId: 'il', complementIndex: 0 }), /excludes frame pres-si/);
  assert.deepEqual(g2.candidates('aller', 'ind.present').map((c) => c.frameId), ['pres-start']);
});

test('notSubjects on a frame excludes specific subjects by id', () => {
  const frames = [{ id: 'f', form: 'ind.present', text: 'Quand il fait beau, {S} ___ {C}.', cue: 'x', notSubjects: ['il'] }];
  const g2 = createGenerator({ verbs: VERBS, subjects: SUBJECTS, frames, complements: COMPLEMENTS });
  assert.throws(() => g2.build({ verb: 'aller', formId: 'ind.present', frameId: 'f', subjectId: 'il', complementIndex: 0 }), /excludes subject il/);
  assert.ok(!g2.candidates('aller', 'ind.present')[0].subjectIds.includes('il'));
  assert.deepEqual(g2.candidates('falloir', 'ind.present'), []);
});

test('build errors', () => {
  assert.throws(() => b('nope', 'ind.present', 'pres-start', 'il'), /Unknown verb/);
  assert.throws(() => b('aller', 'ind.present', 'nope', 'il'), /Unknown frame/);
  assert.throws(() => b('aller', 'ind.present', 'pres-start', 'nope'), /Unknown subject/);
  assert.throws(() => b('aller', 'ind.present', 'pres-start', 'il', 9), /Unknown complement/);
  assert.throws(() => b('aller', 'ind.futur', 'pres-start', 'il'), /is for ind\.present/);
  assert.throws(() => b('aller', 'ind.present', 'pc-hier', 'il'), /Incompatible/);
});

test('candidates enumerate exactly the valid combinations', () => {
  const allIds = SUBJECTS.map((s) => s.id);
  assert.deepEqual(g.candidates('falloir', 'subj.present'), [
    { frameId: 'subj-imp', complementIndex: 0, subjectIds: ['il'] },
  ]);
  assert.deepEqual(g.candidates('aller', 'ind.pc'), [
    { frameId: 'pc-hier', complementIndex: 0, subjectIds: allIds.filter((id) => id !== 'vous') },
    { frameId: 'pc-start', complementIndex: 0, subjectIds: allIds },
  ]);
  assert.deepEqual(g.candidates('être', 'ind.present'), []);
  assert.deepEqual(g.candidates('aller', 'ind.futur'), []);
  // Brute force: every (frame, complement, subject) builds iff listed.
  for (const verb of ['aller', 'passer', 'falloir', 'avoir']) {
    for (const formId of ['ind.present', 'ind.pc', 'subj.present']) {
      const listed = new Set(g.candidates(verb, formId).flatMap((c) =>
        c.subjectIds.map((s) => `${c.frameId}|${c.complementIndex}|${s}`)));
      for (const f of FRAMES) for (let ci = 0; ci < COMPLEMENTS[verb].length; ci++) for (const s of SUBJECTS) {
        const key = `${f.id}|${ci}|${s.id}`;
        let ok = true;
        try { g.build({ verb, formId, frameId: f.id, subjectId: s.id, complementIndex: ci }); } catch { ok = false; }
        assert.equal(ok, listed.has(key), `${verb} ${formId} ${key}`);
      }
    }
  }
});

function seeded(seed) {
  return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
}

test('generate is deterministic with a seeded random and honours pick', () => {
  const sel = { verbs: ['aller', 'passer', 'avoir'], forms: ['ind.present', 'ind.pc'] };
  const a = Array.from({ length: 20 }, ((gg) => () => gg.generate(sel))(gen(seeded(7))));
  const c = Array.from({ length: 20 }, ((gg) => () => gg.generate(sel))(gen(seeded(7))));
  assert.deepEqual(a, c);
  for (const e of a) assert.ok(sel.verbs.includes(e.infinitive) && sel.forms.includes(e.formId));
  const gp = gen(seeded(3));
  for (let i = 0; i < 10; i++) {
    const e = gp.generate(sel, { verb: 'passer', formId: 'ind.pc' });
    assert.equal(e.infinitive, 'passer');
    assert.equal(e.formId, 'ind.pc');
  }
  const g0 = gen(() => 0);
  const e = g0.generate({ verbs: ['aller'], forms: ['ind.present'] });
  assert.deepEqual(e.ref, { verb: 'aller', frameId: 'pres-start', subjectId: 'je', complementIndex: 0 });
});

test('generate falls back, and returns null when nothing is possible', () => {
  const g0 = gen(() => 0); // would pick être × ind.futur first
  const e = g0.generate({ verbs: ['être', 'aller'], forms: ['ind.futur', 'ind.present'] });
  assert.equal(e.infinitive, 'aller');
  assert.equal(e.formId, 'ind.present');
  assert.equal(g0.generate({ verbs: ['être', 'faire'], forms: ['ind.present'] }), null);
  assert.equal(g0.generate({ verbs: ['aller'], forms: ['ind.futur'] }), null);
});
