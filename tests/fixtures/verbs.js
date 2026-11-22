export const VERBS = [
  { inf: 'être', aux: 'avoir', pp: 'été', simple: {
    'ind.present': ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    'ind.imparfait': ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
    'ind.futur': ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
    'subj.present': ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
  } },
  { inf: 'avoir', aux: 'avoir', pp: 'eu', simple: {
    'ind.present': ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    'ind.imparfait': ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
    'ind.futur': ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
    'subj.present': ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
  } },
  { inf: 'aller', aux: 'être', pp: 'allé', simple: {
    'ind.present': ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
    'ind.imparfait': ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'],
    'ind.futur': ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'],
    'subj.present': ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
  } },
  { inf: 'faire', aux: 'avoir', pp: 'fait', simple: {
    'ind.present': ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
    'ind.imparfait': ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
    'ind.futur': ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'],
    'subj.present': ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
  } },
  { inf: 'passer', aux: 'avoir', pp: 'passé', simple: {
    'ind.present': ['passe', 'passes', 'passe', 'passons', 'passez', 'passent'],
    'ind.imparfait': ['passais', 'passais', 'passait', 'passions', 'passiez', 'passaient'],
    'ind.futur': ['passerai', 'passeras', 'passera', 'passerons', 'passerez', 'passeront'],
    'subj.present': ['passe', 'passes', 'passe', 'passions', 'passiez', 'passent'],
  } },
  { inf: 'falloir', aux: 'avoir', pp: 'fallu', impersonal: true, simple: {
    'ind.present': [null, null, 'faut', null, null, null],
    'ind.imparfait': [null, null, 'fallait', null, null, null],
    'ind.futur': [null, null, 'faudra', null, null, null],
    'subj.present': [null, null, 'faille', null, null, null],
  } },
];
