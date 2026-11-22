// Small fixture sentence data for generator tests (pairs with fixtures/verbs.js).
export const SUBJECTS = [
  { id: 'je', text: 'je', person: 0, gender: null, pronoun: true },
  { id: 'vous', text: 'vous', person: 4, gender: null, pronoun: true },
  { id: 'on', text: 'on', person: 2, gender: null, number: null, pronoun: true },
  { id: 'il', text: 'il', person: 2, gender: 'm', pronoun: true },
  { id: 'elle', text: 'elle', person: 2, gender: 'f', pronoun: true },
  { id: 'marie', text: 'Marie', person: 2, gender: 'f', pronoun: false },
  { id: 'elles', text: 'elles', person: 5, gender: 'f', pronoun: true },
  { id: 'mes-parents', text: 'mes parents', person: 5, gender: 'm', pronoun: false },
];

export const FRAMES = [
  { id: 'pres-start', form: 'ind.present', text: '{S} ___ {C} tous les jours.', cue: 'habitude' },
  { id: 'pres-si', form: 'ind.present', text: 'Si {S} ___ {C}, tant mieux.', cue: 'condition' },
  { id: 'pc-hier', form: 'ind.pc', text: 'Hier, {S} ___ {C}.', cue: '« hier »', notPersons: [4] },
  { id: 'subj-faut', form: 'subj.present', text: 'Il faut que {S} ___ {C}.', cue: 'il faut que', notVerbs: ['falloir'] },
  { id: 'subj-bien', form: 'subj.present', text: 'Bien que {S} ___ {C} !', cue: 'bien que', notVerbs: ['falloir'] },
  { id: 'subj-imp', form: 'subj.present', text: 'Je crains qu’à la fin {S} ___ {C}.', cue: 'crainte', notPersons: [0, 1, 3, 4, 5] },
  { id: 'pc-start', form: 'ind.pc', text: '{S} ___ {C} hier.', cue: 'hier' },
];

export const COMPLEMENTS = {
  aller: [{ text: 'au marché' }, { text: 'en ville', notForms: ['ind.pc'] }],
  avoir: [{ text: 'faim' }],
  passer: [{ text: 'par Paris', aux: 'être' }, { text: 'un examen' }],
  falloir: [{ text: 'partir' }],
  // être, faire: no complements -> never usable.
};
