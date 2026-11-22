import { FORMS, formById } from '../data/forms.js';
import { agreeParticiple } from './french.js';

const SIMPLE_IDS = FORMS.filter((f) => f.kind === 'simple').map((f) => f.id);

// Number when the subject doesn't say: vous may be polite singular or plural.
function numbersFor(person, number) {
  if (number === 's' || number === 'p') return [number];
  const dflt = person === 3 || person === 5 ? 'p' : 's';
  if (number === undefined && person !== 4) return [dflt];
  return dflt === 's' ? ['s', 'p'] : ['p', 's'];
}

export function createConjugator(verbs) {
  const byInf = new Map(verbs.map((v) => [v.inf, v]));

  function getVerb(inf) {
    return byInf.get(inf) ?? null;
  }

  function requireVerb(inf) {
    const v = getVerb(inf);
    if (!v) throw new Error(`Unknown verb: ${inf}`);
    return v;
  }

  // A person is missing (defective verb) when no simple tense has a form for it.
  function personExists(verb, person) {
    return SIMPLE_IDS.some((id) => verb.simple[id]?.[person] != null);
  }

  function conjugate(inf, formId, subject, opts = {}) {
    const verb = requireVerb(inf);
    const form = formById(formId);
    if (!form) throw new Error(`Unknown form id: ${formId}`);
    const person = subject?.person;
    if (!Number.isInteger(person) || person < 0 || person > 5) {
      throw new Error(`Bad person: ${person} (expected 0..5)`);
    }

    if (form.kind === 'simple') {
      const table = verb.simple[formId];
      if (!table) throw new Error(`Verb ${inf} has no table for ${formId}`);
      return table[person] == null ? null : [table[person]];
    }

    if (!personExists(verb, person)) return null;
    const auxInf = opts.aux ?? verb.aux;
    if (auxInf !== 'être' && auxInf !== 'avoir') throw new Error(`Bad auxiliary: ${auxInf}`);
    const auxForms = conjugate(auxInf, form.auxForm, { person });
    if (!auxForms) return null;
    const aux = auxForms[0];

    if (auxInf === 'avoir') return [`${aux} ${verb.pp}`]; // no preceding direct objects in v1
    const genders = subject.gender ? [subject.gender] : ['m', 'f'];
    const out = new Set();
    for (const n of numbersFor(person, subject.number)) {
      for (const g of genders) out.add(`${aux} ${agreeParticiple(verb.pp, g, n)}`);
    }
    return [...out];
  }

  function allForms(inf) {
    requireVerb(inf);
    const result = [];
    for (const { id } of FORMS) {
      for (let person = 0; person < 6; person++) {
        const answers = conjugate(inf, id, { person });
        if (answers) result.push({ formId: id, person, answers });
      }
    }
    return result;
  }

  return { conjugate, allForms, getVerb };
}
