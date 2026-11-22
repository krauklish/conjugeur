// Conjugation data for the 20 most frequent French verbs.
// Person index: 0 je, 1 tu, 2 il/elle/on, 3 nous, 4 vous, 5 ils/elles.
// Only simple tenses are stored; compound tenses derive from `aux` + `pp`.
// Validate with `npm run validate` (add `-- --list` to proofread).

export const VERBS = [
  {
    inf: 'être', aux: 'avoir', pp: 'été',
    simple: {
      'ind.present':   ['suis',    'es',      'est',     'sommes',   'êtes',    'sont'],
      'ind.imparfait': ['étais',   'étais',   'était',   'étions',   'étiez',   'étaient'],
      'ind.futur':     ['serai',   'seras',   'sera',    'serons',   'serez',   'seront'],
      'subj.present':  ['sois',    'sois',    'soit',    'soyons',   'soyez',   'soient'],
    },
  },
  {
    inf: 'avoir', aux: 'avoir', pp: 'eu',
    simple: {
      'ind.present':   ['ai',      'as',      'a',       'avons',    'avez',    'ont'],
      'ind.imparfait': ['avais',   'avais',   'avait',   'avions',   'aviez',   'avaient'],
      'ind.futur':     ['aurai',   'auras',   'aura',    'aurons',   'aurez',   'auront'],
      'subj.present':  ['aie',     'aies',    'ait',     'ayons',    'ayez',    'aient'],
    },
  },
  {
    inf: 'faire', aux: 'avoir', pp: 'fait',
    simple: {
      'ind.present':   ['fais',    'fais',    'fait',    'faisons',  'faites',  'font'],
      'ind.imparfait': ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
      'ind.futur':     ['ferai',   'feras',   'fera',    'ferons',   'ferez',   'feront'],
      'subj.present':  ['fasse',   'fasses',  'fasse',   'fassions', 'fassiez', 'fassent'],
    },
  },
  {
    inf: 'dire', aux: 'avoir', pp: 'dit',
    simple: {
      'ind.present':   ['dis',     'dis',     'dit',     'disons',   'dites',   'disent'],
      'ind.imparfait': ['disais',  'disais',  'disait',  'disions',  'disiez',  'disaient'],
      'ind.futur':     ['dirai',   'diras',   'dira',    'dirons',   'direz',   'diront'],
      'subj.present':  ['dise',    'dises',   'dise',    'disions',  'disiez',  'disent'],
    },
  },
  {
    inf: 'pouvoir', aux: 'avoir', pp: 'pu',
    simple: {
      'ind.present':   ['peux',    'peux',    'peut',    'pouvons',  'pouvez',  'peuvent'],
      'ind.imparfait': ['pouvais', 'pouvais', 'pouvait', 'pouvions', 'pouviez', 'pouvaient'],
      'ind.futur':     ['pourrai', 'pourras', 'pourra',  'pourrons', 'pourrez', 'pourront'],
      'subj.present':  ['puisse',  'puisses', 'puisse',  'puissions','puissiez','puissent'],
    },
  },
  {
    inf: 'aller', aux: 'être', pp: 'allé',
    simple: {
      'ind.present':   ['vais',    'vas',     'va',      'allons',   'allez',   'vont'],
      'ind.imparfait': ['allais',  'allais',  'allait',  'allions',  'alliez',  'allaient'],
      'ind.futur':     ['irai',    'iras',    'ira',     'irons',    'irez',    'iront'],
      'subj.present':  ['aille',   'ailles',  'aille',   'allions',  'alliez',  'aillent'],
    },
  },
  {
    inf: 'voir', aux: 'avoir', pp: 'vu',
    simple: {
      'ind.present':   ['vois',    'vois',    'voit',    'voyons',   'voyez',   'voient'],
      'ind.imparfait': ['voyais',  'voyais',  'voyait',  'voyions',  'voyiez',  'voyaient'],
      'ind.futur':     ['verrai',  'verras',  'verra',   'verrons',  'verrez',  'verront'],
      'subj.present':  ['voie',    'voies',   'voie',    'voyions',  'voyiez',  'voient'],
    },
  },
  {
    inf: 'savoir', aux: 'avoir', pp: 'su',
    simple: {
      'ind.present':   ['sais',    'sais',    'sait',    'savons',   'savez',   'savent'],
      'ind.imparfait': ['savais',  'savais',  'savait',  'savions',  'saviez',  'savaient'],
      'ind.futur':     ['saurai',  'sauras',  'saura',   'saurons',  'saurez',  'sauront'],
      'subj.present':  ['sache',   'saches',  'sache',   'sachions', 'sachiez', 'sachent'],
    },
  },
  {
    inf: 'vouloir', aux: 'avoir', pp: 'voulu',
    simple: {
      'ind.present':   ['veux',    'veux',    'veut',    'voulons',  'voulez',  'veulent'],
      'ind.imparfait': ['voulais', 'voulais', 'voulait', 'voulions', 'vouliez', 'voulaient'],
      'ind.futur':     ['voudrai', 'voudras', 'voudra',  'voudrons', 'voudrez', 'voudront'],
      'subj.present':  ['veuille', 'veuilles','veuille', 'voulions', 'vouliez', 'veuillent'],
    },
  },
  {
    inf: 'venir', aux: 'être', pp: 'venu',
    simple: {
      'ind.present':   ['viens',   'viens',   'vient',   'venons',   'venez',   'viennent'],
      'ind.imparfait': ['venais',  'venais',  'venait',  'venions',  'veniez',  'venaient'],
      'ind.futur':     ['viendrai','viendras','viendra', 'viendrons','viendrez','viendront'],
      'subj.present':  ['vienne',  'viennes', 'vienne',  'venions',  'veniez',  'viennent'],
    },
  },
  {
    inf: 'devoir', aux: 'avoir', pp: 'dû',
    simple: {
      'ind.present':   ['dois',    'dois',    'doit',    'devons',   'devez',   'doivent'],
      'ind.imparfait': ['devais',  'devais',  'devait',  'devions',  'deviez',  'devaient'],
      'ind.futur':     ['devrai',  'devras',  'devra',   'devrons',  'devrez',  'devront'],
      'subj.present':  ['doive',   'doives',  'doive',   'devions',  'deviez',  'doivent'],
    },
  },
  {
    inf: 'prendre', aux: 'avoir', pp: 'pris',
    simple: {
      'ind.present':   ['prends',  'prends',  'prend',   'prenons',  'prenez',  'prennent'],
      'ind.imparfait': ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient'],
      'ind.futur':     ['prendrai','prendras','prendra', 'prendrons','prendrez','prendront'],
      'subj.present':  ['prenne',  'prennes', 'prenne',  'prenions', 'preniez', 'prennent'],
    },
  },
  {
    inf: 'trouver', aux: 'avoir', pp: 'trouvé',
    simple: {
      'ind.present':   ['trouve',  'trouves', 'trouve',  'trouvons', 'trouvez', 'trouvent'],
      'ind.imparfait': ['trouvais','trouvais','trouvait','trouvions','trouviez','trouvaient'],
      'ind.futur':     ['trouverai','trouveras','trouvera','trouverons','trouverez','trouveront'],
      'subj.present':  ['trouve',  'trouves', 'trouve',  'trouvions','trouviez','trouvent'],
    },
  },
  {
    inf: 'donner', aux: 'avoir', pp: 'donné',
    simple: {
      'ind.present':   ['donne',   'donnes',  'donne',   'donnons',  'donnez',  'donnent'],
      'ind.imparfait': ['donnais', 'donnais', 'donnait', 'donnions', 'donniez', 'donnaient'],
      'ind.futur':     ['donnerai','donneras','donnera', 'donnerons','donnerez','donneront'],
      'subj.present':  ['donne',   'donnes',  'donne',   'donnions', 'donniez', 'donnent'],
    },
  },
  {
    inf: 'falloir', aux: 'avoir', pp: 'fallu', impersonal: true,
    simple: {
      'ind.present':   [null, null, 'faut',    null, null, null],
      'ind.imparfait': [null, null, 'fallait', null, null, null],
      'ind.futur':     [null, null, 'faudra',  null, null, null],
      'subj.present':  [null, null, 'faille',  null, null, null],
    },
  },
  {
    inf: 'parler', aux: 'avoir', pp: 'parlé',
    simple: {
      'ind.present':   ['parle',   'parles',  'parle',   'parlons',  'parlez',  'parlent'],
      'ind.imparfait': ['parlais', 'parlais', 'parlait', 'parlions', 'parliez', 'parlaient'],
      'ind.futur':     ['parlerai','parleras','parlera', 'parlerons','parlerez','parleront'],
      'subj.present':  ['parle',   'parles',  'parle',   'parlions', 'parliez', 'parlent'],
    },
  },
  {
    inf: 'mettre', aux: 'avoir', pp: 'mis',
    simple: {
      'ind.present':   ['mets',    'mets',    'met',     'mettons',  'mettez',  'mettent'],
      'ind.imparfait': ['mettais', 'mettais', 'mettait', 'mettions', 'mettiez', 'mettaient'],
      'ind.futur':     ['mettrai', 'mettras', 'mettra',  'mettrons', 'mettrez', 'mettront'],
      'subj.present':  ['mette',   'mettes',  'mette',   'mettions', 'mettiez', 'mettent'],
    },
  },
  {
    // Default auxiliary avoir (transitive); the app overrides to être per sentence.
    inf: 'passer', aux: 'avoir', pp: 'passé',
    simple: {
      'ind.present':   ['passe',   'passes',  'passe',   'passons',  'passez',  'passent'],
      'ind.imparfait': ['passais', 'passais', 'passait', 'passions', 'passiez', 'passaient'],
      'ind.futur':     ['passerai','passeras','passera', 'passerons','passerez','passeront'],
      'subj.present':  ['passe',   'passes',  'passe',   'passions', 'passiez', 'passent'],
    },
  },
  {
    inf: 'croire', aux: 'avoir', pp: 'cru',
    simple: {
      'ind.present':   ['crois',   'crois',   'croit',   'croyons',  'croyez',  'croient'],
      'ind.imparfait': ['croyais', 'croyais', 'croyait', 'croyions', 'croyiez', 'croyaient'],
      'ind.futur':     ['croirai', 'croiras', 'croira',  'croirons', 'croirez', 'croiront'],
      'subj.present':  ['croie',   'croies',  'croie',   'croyions', 'croyiez', 'croient'],
    },
  },
  {
    inf: 'aimer', aux: 'avoir', pp: 'aimé',
    simple: {
      'ind.present':   ['aime',    'aimes',   'aime',    'aimons',   'aimez',   'aiment'],
      'ind.imparfait': ['aimais',  'aimais',  'aimait',  'aimions',  'aimiez',  'aimaient'],
      'ind.futur':     ['aimerai', 'aimeras', 'aimera',  'aimerons', 'aimerez', 'aimeront'],
      'subj.present':  ['aime',    'aimes',   'aime',    'aimions',  'aimiez',  'aiment'],
    },
  },
];
