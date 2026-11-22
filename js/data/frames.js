// Frames: { id, form, text (contains '{S} ___ {C}' once), cue, notPersons?, notVerbs?, notSubjects? }
// Each frame's context must force its form; see the cue for the trigger.

const NO_HABIT = ['savoir', 'croire', 'aimer', 'vouloir', 'trouver']; // stative/perfective verbs odd with repeated-habit markers
const NO_COUNTED = ['savoir', 'vouloir', 'croire', 'aimer'];          // odd with "pour la première fois", "deux fois"…
const NO_OFTEN = ['savoir', 'vouloir', 'aimer', 'trouver'];           // odd with "plus souvent"
const OPINION = ['trouver', 'aimer', 'croire'];                       // opinions/feelings: cannot be ordered or arranged
const MODALS = ['falloir', 'devoir', 'vouloir'];                      // modal + modal (« il faut qu'il faille… »)
// Action verbs: with « maintenant » the passé composé is also possible; with a long duration they need a habit reading.
const ACTION = ['faire', 'dire', 'aller', 'voir', 'venir', 'prendre', 'donner', 'parler', 'mettre', 'passer'];
// Stative/modal verbs: with a bare past time point (« hier soir »…) the imparfait is equally natural.
const NO_TIMEPOINT_PC = ['être', 'devoir', 'falloir', 'pouvoir', 'vouloir'];
// « Pendant » + bounded duration frames exist for the stative/modal verbs; action verbs have enough PC frames.
const NO_DURATION_PC = [...ACTION, 'savoir', 'trouver'];
const NO_SHORT_DURATION_PC = [...NO_DURATION_PC, 'aimer', 'croire']; // a week / a summer is too short for liking or believing

export const FRAMES = [
  // ── Indicatif présent ──
  { id: 'pr-en-ce-moment', form: 'ind.present', text: 'En ce moment, {S} ___ {C}.', cue: '« En ce moment » : action actuelle → présent' },
  { id: 'pr-actuellement', form: 'ind.present', text: 'Actuellement, {S} ___ {C}.', cue: '« Actuellement » : situation présente → présent', notVerbs: ['dire', 'mettre'] },
  { id: 'pr-habitude', form: 'ind.present', text: "D'habitude, {S} ___ {C}.", cue: '« D\'habitude » : habitude actuelle → présent', notVerbs: NO_HABIT },
  { id: 'pr-tous-les-jours', form: 'ind.present', text: '{S} ___ {C} tous les jours.', cue: '« Tous les jours » : habitude actuelle → présent', notVerbs: NO_HABIT },
  { id: 'pr-lundi', form: 'ind.present', text: 'Le lundi, {S} ___ {C}.', cue: '« Le lundi » (= chaque lundi) : habitude actuelle → présent', notVerbs: NO_HABIT },
  { id: 'pr-depuis', form: 'ind.present', text: 'Depuis deux mois, {S} ___ {C}.', cue: '« Depuis » + durée : situation qui continue aujourd\'hui → présent', notVerbs: ['passer', 'donner', 'trouver'] },
  { id: 'pr-maintenant', form: 'ind.present', text: 'Maintenant, {S} ___ {C}.', cue: '« Maintenant » + état actuel → présent', notVerbs: ACTION },
  { id: 'pr-ces-jours-ci', form: 'ind.present', text: 'Ces jours-ci, {S} ___ {C}.', cue: '« Ces jours-ci » : période actuelle → présent', notVerbs: ['savoir', 'croire'] },

  // ── Passé composé ──
  { id: 'pc-hier-soir', form: 'ind.pc', text: 'Hier soir, {S} ___ {C}.', cue: '« Hier soir » : action terminée à un moment précis du passé → passé composé', notVerbs: NO_TIMEPOINT_PC },
  { id: 'pc-semaine-derniere', form: 'ind.pc', text: '{S} ___ {C} la semaine dernière.', cue: '« La semaine dernière » : événement ponctuel terminé → passé composé', notVerbs: NO_TIMEPOINT_PC },
  { id: 'pc-il-y-a', form: 'ind.pc', text: 'Il y a deux jours, {S} ___ {C}.', cue: '« Il y a deux jours » : moment précis du passé → passé composé', notVerbs: NO_TIMEPOINT_PC },
  { id: 'pc-samedi', form: 'ind.pc', text: 'Samedi dernier, {S} ___ {C}.', cue: '« Samedi dernier » : événement terminé à une date précise → passé composé', notVerbs: NO_TIMEPOINT_PC },
  { id: 'pc-premiere-fois', form: 'ind.pc', text: "{S} ___ {C} pour la première fois l'année dernière.", cue: '« Pour la première fois » : événement unique et terminé → passé composé', notVerbs: [...NO_COUNTED, 'trouver', 'falloir'] },
  { id: 'pc-une-seule-fois', form: 'ind.pc', text: '{S} ___ {C} une seule fois cette année.', cue: '« Une seule fois » : événement compté, terminé → passé composé', notVerbs: [...NO_COUNTED, 'trouver'] },
  { id: 'pc-deux-fois', form: 'ind.pc', text: '{S} ___ {C} deux fois le mois dernier.', cue: '« Deux fois le mois dernier » : actions comptées et terminées → passé composé', notVerbs: [...NO_COUNTED, 'trouver'] },
  { id: 'pc-trois-fois', form: 'ind.pc', text: "{S} ___ {C} trois fois l'année dernière.", cue: '« Trois fois l\'année dernière » : actions comptées et terminées → passé composé', notVerbs: [...NO_COUNTED, 'trouver'] },
  { id: 'pc-pendant-deux-ans', form: 'ind.pc', text: 'Pendant deux ans, {S} ___ {C}.', cue: '« Pendant » + durée limitée et terminée → passé composé', notVerbs: NO_DURATION_PC },
  { id: 'pc-de-2015-a-2020', form: 'ind.pc', text: 'De 2015 à 2020, {S} ___ {C}.', cue: '« De 2015 à 2020 » : période limitée et terminée → passé composé', notVerbs: NO_DURATION_PC },
  { id: 'pc-toute-la-semaine', form: 'ind.pc', text: '{S} ___ {C} pendant toute la semaine dernière.', cue: '« Pendant toute la semaine dernière » : durée limitée et terminée → passé composé', notVerbs: [...NO_SHORT_DURATION_PC, 'vouloir'] },
  { id: 'pc-tout-l-ete', form: 'ind.pc', text: "{S} ___ {C} pendant tout l'été dernier.", cue: '« Pendant tout l\'été dernier » : durée limitée et terminée → passé composé', notVerbs: NO_SHORT_DURATION_PC },

  // ── Imparfait ──
  { id: 'im-autrefois', form: 'ind.imparfait', text: 'Autrefois, {S} ___ {C}.', cue: '« Autrefois » : situation ou habitude du passé → imparfait' },
  { id: 'im-epoque', form: 'ind.imparfait', text: 'À cette époque-là, {S} ___ {C}.', cue: '« À cette époque-là » : description du passé → imparfait' },
  { id: 'im-avant', form: 'ind.imparfait', text: "Avant, {S} ___ {C}, mais maintenant c'est différent.", cue: '« Avant… maintenant c\'est différent » : ancienne habitude → imparfait' },
  { id: 'im-en-ce-temps-la', form: 'ind.imparfait', text: 'En ce temps-là, {S} ___ {C}.', cue: '« En ce temps-là » : cadre du passé → imparfait' },
  { id: 'im-tous-les-jours', form: 'ind.imparfait', text: 'Autrefois, {S} ___ {C} tous les jours.', cue: '« Autrefois… tous les jours » : habitude passée → imparfait', notVerbs: NO_HABIT },
  { id: 'im-campagne', form: 'ind.imparfait', text: 'Quand nous habitions à la campagne, {S} ___ {C} tous les week-ends.', cue: '« Tous les week-ends » dans le passé : habitude passée → imparfait', notVerbs: NO_HABIT },
  { id: 'im-chaque-ete', form: 'ind.imparfait', text: "À l'époque, chaque été, {S} ___ {C}.", cue: '« À l\'époque, chaque été » : répétition dans le passé → imparfait', notVerbs: NO_HABIT },

  // ── Futur simple ──
  { id: 'fu-dix-ans', form: 'ind.futur', text: 'Dans dix ans, {S} ___ {C} plus souvent.', cue: '« Dans dix ans » : avenir lointain → futur simple', notVerbs: NO_OFTEN },
  { id: 'fu-un-jour', form: 'ind.futur', text: "Un jour, {S} ___ {C}, c'est sûr.", cue: '« Un jour » : avenir indéterminé → futur simple', notVerbs: ['devoir', 'falloir'] },
  { id: 'fu-retraite', form: 'ind.futur', text: 'Quand je serai à la retraite, {S} ___ {C}.', cue: '« Quand » + futur : l\'autre verbe se met aussi au futur simple', notVerbs: ['savoir', 'falloir', ...OPINION, 'mettre', 'dire', 'devoir', 'venir'] },
  { id: 'fu-quand-beau', form: 'ind.futur', text: 'Quand il fera beau, {S} ___ {C}.', cue: '« Quand » + futur : l\'autre verbe se met aussi au futur simple',
    notSubjects: ['il'], notVerbs: ['savoir', 'vouloir', ...OPINION, 'avoir', 'devoir', 'dire', 'donner', 'mettre', 'parler'] },
  { id: 'fu-quelques-annees', form: 'ind.futur', text: 'Normalement, {S} ___ {C} dans quelques années.', cue: '« Dans quelques années » : avenir lointain → futur simple', notVerbs: ['devoir', 'falloir', 'venir'] },
  { id: 'fu-prochaine-fois', form: 'ind.futur', text: 'Je suis sûr que la prochaine fois, {S} ___ {C}.', cue: '« La prochaine fois » : avenir → futur simple', notVerbs: ['vouloir'] },
  { id: 'fu-quand-rentreras', form: 'ind.futur', text: 'Quand tu rentreras, {S} ___ {C}.', cue: '« Quand » + futur : l\'autre verbe se met aussi au futur simple',
    notPersons: [1], notSubjects: ['marie-et-toi'], notVerbs: ['vouloir', ...OPINION] },

  // ── Subjonctif présent ──
  { id: 'sp-il-faut', form: 'subj.present', text: 'Il faut que {S} ___ {C}.', cue: '« Il faut que » : obligation → subjonctif présent', notVerbs: [...MODALS, ...OPINION] },
  { id: 'sp-important', form: 'subj.present', text: 'Il est important que {S} ___ {C}.', cue: '« Il est important que » : jugement → subjonctif présent', notVerbs: [...MODALS, ...OPINION] },
  { id: 'sp-je-veux', form: 'subj.present', text: 'Je veux que {S} ___ {C}.', cue: '« Je veux que » : volonté → subjonctif présent', notPersons: [0], notVerbs: MODALS },
  { id: 'sp-j-aimerais', form: 'subj.present', text: "J'aimerais que {S} ___ {C}.", cue: '« J\'aimerais que » : souhait → subjonctif présent', notPersons: [0], notVerbs: MODALS },
  { id: 'sp-pour-que', form: 'subj.present', text: 'Tout est prêt pour que {S} ___ {C}.', cue: '« Pour que » : but → subjonctif présent',
    notVerbs: [...MODALS, ...OPINION, 'être', 'avoir', 'savoir', 'dire'] },
  { id: 'sp-rare', form: 'subj.present', text: 'Il est rare que {S} ___ {C} le dimanche.', cue: '« Il est rare que » : jugement ; « le dimanche » = habitude actuelle → subjonctif présent', notVerbs: NO_HABIT },
  { id: 'sp-pense-pas', form: 'subj.present', text: 'Je ne pense pas que {S} ___ {C} demain.', cue: '« Je ne pense pas que » : doute ; « demain » = futur → subjonctif présent', notPersons: [0],
    notVerbs: ['savoir', 'vouloir', ...OPINION] },
  { id: 'sp-possible', form: 'subj.present', text: 'Il est possible que {S} ___ {C} demain soir.', cue: '« Il est possible que » : possibilité ; « demain soir » = futur → subjonctif présent',
    notVerbs: ['savoir', 'vouloir', ...OPINION] },
  { id: 'sp-normal', form: 'subj.present', text: 'Il est normal que {S} ___ {C} en ce moment.', cue: '« Il est normal que » : jugement ; « en ce moment » = actuel → subjonctif présent' },
  { id: 'sp-surpris', form: 'subj.present', text: 'Je suis surpris que {S} ___ {C} en ce moment.', cue: '« Je suis surpris que » : sentiment ; « en ce moment » = actuel → subjonctif présent', notPersons: [0, 3] },
  { id: 'sp-pas-sur', form: 'subj.present', text: 'Je ne suis pas sûr que {S} ___ {C} maintenant.', cue: '« Je ne suis pas sûr que » : doute ; « maintenant » = actuel → subjonctif présent',
    notPersons: [0, 3], notVerbs: ACTION },

  // ── Subjonctif passé ──
  { id: 'spa-etonnant', form: 'subj.passe', text: "C'est étonnant que {S} ___ {C} hier.", cue: '« C\'est étonnant que » + « hier » : fait accompli → subjonctif passé' },
  { id: 'spa-peu-probable', form: 'subj.passe', text: 'Il est peu probable que {S} ___ {C} la semaine dernière.', cue: '« Il est peu probable que » + « la semaine dernière » : fait passé incertain → subjonctif passé' },
  { id: 'spa-doute', form: 'subj.passe', text: 'Je doute que {S} ___ {C} hier soir.', cue: '« Je doute que » + « hier soir » : doute sur un fait passé → subjonctif passé', notPersons: [0, 3] },
  { id: 'spa-crois-pas', form: 'subj.passe', text: 'Je ne crois pas que {S} ___ {C} le week-end dernier.', cue: '« Je ne crois pas que » + « le week-end dernier » → subjonctif passé', notPersons: [0, 3] },
  { id: 'spa-bien-que', form: 'subj.passe', text: "Bien que {S} ___ {C} hier, rien n'a changé.", cue: '« Bien que » + « hier » : concession sur un fait passé → subjonctif passé', notVerbs: OPINION },
  { id: 'spa-surpris', form: 'subj.passe', text: 'Tout le monde est surpris que {S} ___ {C} samedi dernier.', cue: '« Être surpris que » + « samedi dernier » → subjonctif passé' },
  { id: 'spa-possible', form: 'subj.passe', text: 'Il est possible que {S} ___ {C} avant-hier.', cue: '« Il est possible que » + « avant-hier » : fait passé incertain → subjonctif passé' },
];
