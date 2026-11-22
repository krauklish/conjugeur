// Registry of verb forms available for training.
//
// kind: 'simple'   -> forms are stored explicitly in each verb's `simple` table
// kind: 'compound' -> derived: auxiliary conjugated in `auxForm` + past participle
//
// Adding a compound tense is one entry here. Adding a simple tense is one entry
// here plus one row of six forms per verb in verbs.js.

export const FORMS = [
  { id: 'ind.present', mood: 'Indicatif', label: 'Présent', kind: 'simple' },
  { id: 'ind.pc', mood: 'Indicatif', label: 'Passé composé', kind: 'compound', auxForm: 'ind.present' },
  { id: 'ind.imparfait', mood: 'Indicatif', label: 'Imparfait', kind: 'simple' },
  { id: 'ind.futur', mood: 'Indicatif', label: 'Futur simple', kind: 'simple' },
  { id: 'subj.present', mood: 'Subjonctif', label: 'Présent', kind: 'simple' },
  { id: 'subj.passe', mood: 'Subjonctif', label: 'Passé', kind: 'compound', auxForm: 'subj.present' },
];

export const SIMPLE_FORM_IDS = FORMS.filter((f) => f.kind === 'simple').map((f) => f.id);

const byId = new Map(FORMS.map((f) => [f.id, f]));

export function formById(id) {
  return byId.get(id) ?? null;
}
