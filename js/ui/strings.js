// All user-visible French text. Quotes are « » with non-breaking spaces ( ),
// apostrophes are typographic (’).

import { formById } from '../data/forms.js';

const NB = ' ';
export const q = (s) => `«${NB}${s}${NB}»`;

export const S = {
  navLabel: 'Navigation',
  scoreLabel: 'Réponses justes sur total',
  views: { practice: 'Exercice', settings: 'Réglages', progress: 'Progrès' },
  answerLabel: 'Votre réponse',
  hintLabel: 'Infinitif',
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
  verdicts: {
    correct: 'Correct',
    accent: `Presque${NB}: attention aux accents`,
    wrong: 'Incorrect',
  },
};

const FORM_NAMES = {
  'ind.present': 'le présent de l’indicatif',
  'ind.pc': 'le passé composé',
  'ind.imparfait': 'l’imparfait',
  'ind.futur': 'le futur simple',
  'subj.present': 'le subjonctif présent',
  'subj.passe': 'le subjonctif passé',
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

const PRONOUNS = ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'];

export function score(right, total) {
  return `${right}${NB}/${NB}${total}`;
}

export function formName(formId) {
  if (FORM_NAMES[formId]) return FORM_NAMES[formId];
  const f = formById(formId);
  return f ? `${f.mood.toLowerCase()} ${f.label.toLowerCase()}` : formId;
}

export function formTitle(formId) {
  const f = formById(formId);
  return f ? `${f.mood} · ${f.label}` : formId;
}

// Ends a phrase with a period unless it already ends with terminal punctuation.
function sentenceEnd(s) {
  const t = s.trim();
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

export function noteLine(note, typed) {
  if (!note) return null;
  switch (note.kind) {
    case 'form': return `${q(typed)} est ${formName(note.formId)}.`;
    case 'person': return `${q(typed)} est la forme pour ${q(PRONOUNS[note.person] ?? '?')}.`;
    case 'agreement': return 'Attention à l’accord du participe passé.';
    case 'auxiliary': return `Ici, le verbe se conjugue avec ${q(note.expected)}.`;
    default: return null;
  }
}

// French punctuation takes a non-breaking space: before : ; ? ! » and after «.
// Applied at render time so content files can be written with plain spaces.
export function frenchSpacing(text) {
  return text.replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« ');
}

// Explanation lines shown under the verdict, in order.
export function explanation(exercise, result) {
  const lines = [];
  const n = noteLine(result.note, result.typed);
  if (n) lines.push(n);
  const cue = exercise.cue ? ` ${frenchSpacing(sentenceEnd(exercise.cue))}` : '';
  lines.push(`${formTitle(exercise.formId)}.${cue}`);
  return lines;
}
