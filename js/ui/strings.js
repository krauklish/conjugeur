// All user-visible French text. Quotes are « » with non-breaking spaces ( ),
// apostrophes are typographic (’).

import { formById } from '../data/forms.js';

const NB = ' ';

export const S = {
  navLabel: 'Navigation',
  views: { practice: 'Exercice', settings: 'Réglages', progress: 'Progrès' },
  answerLabel: 'Votre réponse',
  check: 'Vérifier',
  next: 'Continuer',
  empty: 'Choisissez au moins un verbe et une forme dans les réglages.',
  settings: {
    title: 'Réglages',
    forms: 'Formes',
    verbs: 'Verbes',
    all: 'Tous',
    none: 'Aucun',
    emptyHint: 'Choisissez au moins un verbe et une forme.',
  },
  progress: {
    title: 'Progrès',
    none: 'Aucune réponse pour l’instant.',
    review: 'À revoir',
    notEnough: 'Pas encore assez de réponses.',
    table: `Réussite par verbe et par forme, en${NB}%`,
    verb: 'Verbe',
    unseen: '–',
    clear: 'Effacer la progression',
    confirmClear: `Effacer toute la progression${NB}?`,
  },
  update: {
    text: 'Nouvelle version disponible',
    action: 'Mettre à jour',
  },
  irregular: 'irrégulier',
  group1: '1er groupe',
};


const SHORT = {
  'ind.present': 'Prés.',
  'ind.pc': `P.${NB}c.`,
  'ind.imparfait': 'Imp.',
  'ind.futur': 'Fut.',
  'subj.present': `S.${NB}pr.`,
  'subj.passe': `S.${NB}pa.`,
};

// Short column label for a form; falls back to the first letters of its label.
export function shortForm(formId) {
  if (SHORT[formId]) return SHORT[formId];
  const f = formById(formId);
  return f ? `${f.label.slice(0, 4)}.` : formId;
}

export const pct = (rate) => `${Math.round(rate * 100)}${NB}%`;

export function summaryLine(total, rate) {
  if (!total) return S.progress.none;
  return `${total}${NB}réponse${total > 1 ? 's' : ''}, ${pct(rate ?? 0)} juste${total > 1 ? 's' : ''}.`;
}

// The indicatif is the default mood and is never named: « Passé composé »,
// but « Subjonctif · Présent ».
const isIndicatif = (f) => f.mood === 'Indicatif';

// Form name in running text: « passé composé », « subjonctif présent ».
export function formName(formId) {
  const f = formById(formId);
  if (!f) return formId;
  return (isIndicatif(f) ? f.label : `${f.mood} ${f.label}`).toLowerCase();
}

export function formTitle(formId) {
  const f = formById(formId);
  if (!f) return formId;
  return isIndicatif(f) ? f.label : `${f.mood} · ${f.label}`;
}

// Hint under the sentence: « aller · irrégulier », « parler · 1er groupe ».
export function verbHint(infinitive, group) {
  return `${infinitive} · ${group === 1 ? S.group1 : S.irregular}`;
}

// Ends a phrase with a period unless it already ends with terminal punctuation.
function sentenceEnd(s) {
  const t = s.trim();
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

// French punctuation takes a non-breaking space: before : ; ? ! » and after «.
// Applied at render time so content files can be written with plain spaces.
export function frenchSpacing(text) {
  return text.replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« ');
}

// The cue, without its trailing « → form », which the first line already names.
export function cueLine(cue) {
  if (!cue) return null;
  const i = cue.lastIndexOf(' → ');
  return frenchSpacing(sentenceEnd(i < 0 ? cue : cue.slice(0, i))).replaceAll("'", '’');
}
