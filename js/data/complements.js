// Complements by infinitive: { text, aux? ('être', passer only), notForms? [form ids], notFrames? [frame ids] }
// Each must fit any subject and any of the six forms (minus notForms), in every frame not listed in notFrames.
const NOT_PERFECTIVE = ['ind.pc', 'subj.passe']; // stative meaning, odd as a completed event

// Named frame-id groups for notFrames.
const WISH_FRAMES = ['sp-il-faut', 'sp-important', 'sp-je-veux', 'sp-j-aimerais', 'sp-pour-que']; // wish / necessity / purpose
const DAILY_FRAMES = ['pr-habitude', 'pr-tous-les-jours', 'im-tous-les-jours'];                  // everyday habit
const HABIT_FRAMES = [...DAILY_FRAMES, 'pr-lundi', 'im-campagne'];                                // frequent (daily/weekly) habit
const TIMEPOINT_PC_FRAMES = ['pc-hier-soir', 'pc-semaine-derniere', 'pc-il-y-a', 'pc-samedi'];   // state: imparfait also natural
const COUNTED_PC_FRAMES = ['pc-premiere-fois', 'pc-une-seule-fois', 'pc-deux-fois', 'pc-trois-fois'];
const DURATION_PC_FRAMES = ['pc-pendant-deux-ans', 'pc-de-2015-a-2020', 'pc-toute-la-semaine', 'pc-tout-l-ete'];
const LONG_PC_FRAMES = ['pc-pendant-deux-ans', 'pc-de-2015-a-2020'];                           // years-long periods
const ONGOING_FRAMES = ['pr-depuis', 'pr-actuellement', 'pr-ces-jours-ci'];                                         // one-off event can't "go on"
const FAR_FUTURE_FRAMES = ['fu-un-jour', 'fu-quelques-annees'];                                 // everyday acts sound absurd there
const BIEN_QUE_FRAMES = ['spa-bien-que']; // trivial act: « bien que… rien n'a changé » has no concessive point
const NOW_FRAMES = ['pr-en-ce-moment', 'sp-normal', 'sp-surpris'];                                // « en ce moment »
const SUMMER_FRAMES = ['im-chaque-ete', 'fu-quand-beau', 'pc-tout-l-ete'];

export const COMPLEMENTS = {
  'être': [
    { text: 'en retard', notFrames: [...WISH_FRAMES, 'im-chaque-ete', ...FAR_FUTURE_FRAMES, 'pr-depuis', 'fu-quand-beau', 'fu-retraite', 'fu-quand-rentreras', ...LONG_PC_FRAMES, 'pc-tout-l-ete'] },
    { text: 'au travail', notFrames: [...FAR_FUTURE_FRAMES, ...COUNTED_PC_FRAMES, ...LONG_PC_FRAMES, 'fu-quand-beau', 'fu-retraite'] },
    { text: 'à Paris', notFrames: DAILY_FRAMES },
    { text: 'en vacances', notFrames: [...HABIT_FRAMES, ...LONG_PC_FRAMES, 'pc-deux-fois', 'pc-trois-fois'] },
    { text: 'à la maison', notFrames: [...LONG_PC_FRAMES, 'pc-premiere-fois', 'pc-une-seule-fois', 'pc-deux-fois', 'pc-trois-fois', 'fu-quand-beau', ...FAR_FUTURE_FRAMES] },
  ],
  'avoir': [
    { text: 'de la chance', notFrames: ['fu-quand-rentreras', 'pr-lundi'] },
    { text: 'un problème avec la voiture', notFrames: [...WISH_FRAMES, ...HABIT_FRAMES, 'fu-retraite', 'fu-quelques-annees', 'fu-quand-beau', 'fu-quand-rentreras', ...LONG_PC_FRAMES] },
    { text: 'rendez-vous chez le médecin', notFrames: [...DAILY_FRAMES, 'pr-depuis', 'im-autrefois', 'im-epoque', 'im-en-ce-temps-la', 'im-campagne', ...TIMEPOINT_PC_FRAMES, ...DURATION_PC_FRAMES, ...FAR_FUTURE_FRAMES, 'fu-quand-beau', 'fu-prochaine-fois', 'fu-retraite'] },
    { text: 'beaucoup de travail', notFrames: [...TIMEPOINT_PC_FRAMES, ...WISH_FRAMES, 'fu-quand-beau', 'fu-retraite'] },
    { text: 'du temps libre', notFrames: TIMEPOINT_PC_FRAMES },
  ],
  'faire': [
    { text: 'les courses', notFrames: FAR_FUTURE_FRAMES },
    { text: 'du sport' },
    { text: 'la cuisine', notFrames: ['fu-quand-beau'] },
    { text: 'une promenade', notFrames: [...ONGOING_FRAMES, ...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
    { text: 'le ménage', notFrames: [...FAR_FUTURE_FRAMES, 'fu-quand-beau'] },
  ],
  'dire': [
    { text: 'la vérité', notFrames: ['pr-lundi', 'pc-premiere-fois', 'pc-une-seule-fois', 'pc-deux-fois', 'pc-trois-fois'] },
    { text: 'bonjour aux voisins', notFrames: FAR_FUTURE_FRAMES },
    { text: 'merci au serveur', notFrames: [...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
    { text: 'au revoir à tout le monde', notFrames: [...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
  ],
  'pouvoir': [
    { text: 'travailler à la maison', notFrames: ['fu-quand-beau', 'fu-retraite'] },
    { text: 'sortir le soir', notFrames: ['sp-possible'] },
    { text: 'utiliser la voiture' },
    { text: 'aider les voisins' },
  ],
  'aller': [
    { text: 'au marché', notFrames: [...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
    { text: 'à la piscine', notFrames: [...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
    { text: 'chez le médecin', notFrames: [...DAILY_FRAMES, ...FAR_FUTURE_FRAMES, 'fu-quand-beau', 'fu-retraite'] },
    { text: 'au cinéma', notFrames: [...FAR_FUTURE_FRAMES, 'fu-quand-beau', ...BIEN_QUE_FRAMES] },
    { text: 'à Paris' },
  ],
  'voir': [
    { text: 'un bon film', notFrames: [...ONGOING_FRAMES, ...FAR_FUTURE_FRAMES, 'fu-quand-beau', ...BIEN_QUE_FRAMES] },
    { text: 'le médecin', notFrames: [...DAILY_FRAMES, ...FAR_FUTURE_FRAMES, 'fu-quand-beau', 'fu-retraite'] },
    { text: 'la mer', notFrames: [...ONGOING_FRAMES] },
    { text: 'un match de foot', notFrames: [...ONGOING_FRAMES, ...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
  ],
  'savoir': [
    { text: 'la vérité', notFrames: ['im-avant', 'im-autrefois', 'pr-en-ce-moment', 'pr-actuellement', 'sp-normal'] },
    { text: 'la réponse', notFrames: ['im-avant', 'im-autrefois', 'pr-en-ce-moment', 'pr-actuellement', 'sp-normal'] },
    { text: 'la nouvelle', notFrames: ['im-avant', 'im-autrefois', 'pr-en-ce-moment', 'pr-actuellement', 'sp-normal'] },
    { text: 'nager', notForms: NOT_PERFECTIVE, notFrames: [...NOW_FRAMES, 'fu-quand-rentreras', 'fu-prochaine-fois'] },
    { text: 'parler anglais', notForms: NOT_PERFECTIVE, notFrames: [...NOW_FRAMES, 'fu-quand-rentreras', 'fu-prochaine-fois'] },
  ],
  'vouloir': [
    { text: 'vivre à l\'étranger', notForms: ['subj.passe'], notFrames: ['pc-tout-l-ete'] },
    { text: 'partir en vacances' },
    { text: 'acheter une voiture' },
    { text: 'changer de travail', notForms: ['subj.passe'], notFrames: ['fu-retraite'] },
    { text: 'aller au cinéma', notForms: ['ind.pc', 'ind.futur'], notFrames: ['pr-depuis'] },
  ],
  'venir': [
    { text: 'à la fête', notForms: ['ind.present'], notFrames: HABIT_FRAMES },
    { text: 'en train', notFrames: [...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
    { text: 'à la réunion', notFrames: [...FAR_FUTURE_FRAMES, 'fu-retraite', 'fu-quand-beau'] },
    { text: 'au restaurant', notFrames: [...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
  ],
  'devoir': [
    { text: 'partir tôt' },
    { text: 'travailler tard' },
    { text: 'faire les courses' },
    { text: 'prendre le train' },
  ],
  'prendre': [
    { text: 'le bus', notFrames: [...FAR_FUTURE_FRAMES, 'fu-quand-beau', ...BIEN_QUE_FRAMES, 'fu-retraite'] },
    { text: 'un café', notFrames: [...FAR_FUTURE_FRAMES, 'im-chaque-ete', 'pr-depuis', 'pc-premiere-fois', ...BIEN_QUE_FRAMES, 'pr-actuellement', 'pr-ces-jours-ci', 'fu-retraite'] },
    { text: 'le train', notFrames: [...BIEN_QUE_FRAMES, ...FAR_FUTURE_FRAMES] },
    { text: 'des photos', notFrames: [...BIEN_QUE_FRAMES, ...FAR_FUTURE_FRAMES] },
  ],
  'trouver': [
    { text: 'ce film intéressant' },
    { text: 'ce cours utile' },
    { text: 'ce quartier agréable' },
    { text: 'cette idée géniale' },
  ],
  'donner': [
    { text: 'des fleurs à la voisine', notFrames: [...ONGOING_FRAMES, ...FAR_FUTURE_FRAMES] },
    { text: 'des conseils aux étudiants', notFrames: ['fu-quand-rentreras'] },
    { text: 'à manger au chat', notFrames: ['pc-premiere-fois', ...FAR_FUTURE_FRAMES] },
    { text: 'des cours de français', notFrames: ['fu-quand-rentreras'] },
  ],
  'falloir': [
    { text: 'partir tôt' },
    { text: 'rester à la maison' },
    { text: 'attendre longtemps' },
    { text: 'prendre le bus', notFrames: FAR_FUTURE_FRAMES },
  ],
  'parler': [
    { text: 'au directeur', notFrames: [...FAR_FUTURE_FRAMES, 'fu-retraite'] },
    { text: 'anglais' },
    { text: 'avec les voisins', notFrames: FAR_FUTURE_FRAMES },
    { text: 'au téléphone', notFrames: [...FAR_FUTURE_FRAMES, 'fu-retraite'] },
  ],
  'mettre': [
    { text: 'la table', notFrames: [...FAR_FUTURE_FRAMES, ...BIEN_QUE_FRAMES] },
    { text: 'un manteau', notFrames: [...FAR_FUTURE_FRAMES, ...SUMMER_FRAMES, ...BIEN_QUE_FRAMES, 'sp-pour-que'] },
    { text: 'du sel dans la soupe', notFrames: FAR_FUTURE_FRAMES },
    { text: 'les clés sur la table', notFrames: [...FAR_FUTURE_FRAMES, 'sp-rare', ...BIEN_QUE_FRAMES, 'sp-normal', 'sp-pour-que'] },
  ],
  'passer': [
    { text: 'un examen', notForms: ['ind.imparfait'], notFrames: [...HABIT_FRAMES, 'fu-retraite', 'fu-quand-beau'] },
    { text: 'la soirée chez des amis', notFrames: FAR_FUTURE_FRAMES },
    { text: 'deux heures à la bibliothèque', notFrames: [...FAR_FUTURE_FRAMES, 'fu-quand-beau'] },
    { text: 'par Paris', aux: 'être', notFrames: [...DAILY_FRAMES, ...BIEN_QUE_FRAMES] },
    { text: 'à la boulangerie', aux: 'être', notFrames: [...FAR_FUTURE_FRAMES, 'pc-premiere-fois', ...BIEN_QUE_FRAMES, 'fu-retraite'] },
  ],
  'croire': [
    { text: 'cette histoire', notFrames: ['fu-dix-ans'] },
    { text: 'le médecin', notFrames: ['fu-quelques-annees'] },
    { text: 'les journalistes', notFrames: ['fu-quelques-annees'] },
  ],
  'aimer': [
    { text: 'ce restaurant' },
    { text: 'ce film' },
    { text: 'ce livre', notFrames: ['fu-prochaine-fois'] },
    { text: 'le chocolat', notForms: NOT_PERFECTIVE, notFrames: ['fu-prochaine-fois'] },
    { text: 'voyager', notForms: NOT_PERFECTIVE, notFrames: ['fu-prochaine-fois'] },
  ],
};
