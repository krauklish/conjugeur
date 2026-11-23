// Answer checker: compares a typed answer with an Exercise and diagnoses mistakes.
//
// Ordering (first that applies wins):
//   1. correct      — exact (normalised) match of an accepted answer
//   2. wrong + note — exact match of a diagnosis (agreement, auxiliary, person, form)
//   3. accent       — matches an accepted answer once diacritics are stripped
//   4. wrong + note — diagnosis on diacritic-stripped strings
//   5. wrong, note null
// Exact diagnoses (2) beat accent (3): if the learner typed, letter for letter,
// a real other form of the verb (present "parle" where "parlé" is expected),
// that is a genuine confusion, not an accent slip.

import { FORMS, formById } from '../data/forms.js';
import { createConjugator } from './conjugator.js';
import { normalizeAnswer, stripDiacritics } from './french.js';

const otherAux = (a) => (a === 'être' ? 'avoir' : 'être');

export function createChecker({ verbs }) {
  const conj = createConjugator(verbs);

  // Candidate diagnoses in priority order: [{ note, answers }].
  function diagnoses(ex) {
    const verb = conj.getVerb(ex.infinitive);
    if (!verb) throw new Error(`Unknown verb: ${ex.infinitive}`);
    const aux = ex.aux ?? verb.aux;
    const form = formById(ex.formId);
    if (!form) throw new Error(`Unknown form id: ${ex.formId}`);
    const out = [];
    const safe = (f) => { try { return f() ?? []; } catch { return []; } };
    const any = (person) => ({ person, gender: null, number: null });

    if (form.kind === 'compound') {
      out.push({ note: { kind: 'agreement' },
        answers: safe(() => conj.conjugate(ex.infinitive, ex.formId, any(ex.person), { aux })) });
      out.push({ note: { kind: 'auxiliary', expected: aux },
        answers: safe(() => conj.conjugate(ex.infinitive, ex.formId, any(ex.person), { aux: otherAux(aux) })) });
    }
    for (let p = 0; p < 6; p++) {
      if (p === ex.person) continue;
      out.push({ note: { kind: 'person', person: p },
        answers: safe(() => conj.conjugate(ex.infinitive, ex.formId, any(p), form.kind === 'compound' ? { aux } : {})) });
    }
    // Other forms: default aux (allForms) plus the exercise's effective aux.
    const others = [];
    for (const { id, kind } of FORMS) {
      if (id === ex.formId) continue;
      for (let p = 0; p < 6; p++) {
        const answers = [];
        for (const a of kind === 'compound' ? [...new Set([verb.aux, aux])] : [null]) {
          answers.push(...safe(() => conj.conjugate(ex.infinitive, id, any(p), a ? { aux: a } : {})));
        }
        if (answers.length) others.push({ note: { kind: 'form', formId: id, person: p }, answers });
      }
    }
    others.sort((x, y) => (y.note.person === ex.person) - (x.note.person === ex.person)); // stable
    out.push(...others);
    return out;
  }

  function check(exercise, typedRaw) {
    const typed = normalizeAnswer(typedRaw ?? '');
    if (!typed) return null;
    const answers = exercise.answers.map(normalizeAnswer);
    const result = (verdict, note = null, expected = exercise.answers[0]) => ({ verdict, typed, expected, note });
    const diags = diagnoses(exercise); // also validates the verb
    if (answers.includes(typed)) return result('correct');

    const find = (key) => {
      const t = key(typed);
      return diags.find((d) => d.answers.some((a) => key(normalizeAnswer(a)) === t))?.note ?? null;
    };
    const exact = find((s) => s);
    if (exact) return result('wrong', exact);
    const bare = stripDiacritics(typed);
    // For an accent slip, `expected` is the accepted answer the learner meant.
    const meant = answers.findIndex((a) => stripDiacritics(a) === bare);
    if (meant >= 0) return result('accent', null, exercise.answers[meant]);
    return result('wrong', find(stripDiacritics));
  }

  return { check };
}
