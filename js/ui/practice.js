// Practice view: one sentence with an inline blank, check, feedback, next.

import { el, nextFrame } from './dom.js';
import { S, explanation } from './strings.js';
import { pick, record } from '../core/scheduler.js';

const SWAP_MS = 180;
const REDRAWS = 5;

const keyOf = (ex) => `${ex.ref.verb}|${ex.formId}|${ex.ref.frameId}`;

// Draws an exercise: the scheduler picks verb + form (avoiding the previous
// pair), the generator builds the sentence; the same verb + form + frame is not
// repeated twice in a row.
export function drawExercise(ctx, previous, isAvailable) {
  const avoid = previous ? { verb: previous.ref.verb, formId: previous.formId } : undefined;
  const choice = pick(ctx.selection, ctx.stats, { avoid, isAvailable });
  if (!choice) return null;
  let ex = ctx.generator.generate(ctx.selection, choice);
  if (!ex || !previous) return ex;
  for (let i = 0; i < REDRAWS && keyOf(ex) === keyOf(previous); i++) {
    const again = ctx.generator.generate(ctx.selection, choice);
    if (!again) break;
    ex = again;
  }
  return ex;
}

export function mountPractice(container, ctx) {
  const before = el('span');
  const after = el('span');
  const mirror = el('span', { class: 'mirror', 'aria-hidden': 'true' });
  const input = el('input', {
    class: 'blank', type: 'text', lang: 'fr', inputmode: 'text', enterkeyhint: 'go',
    autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
    'aria-label': S.answerLabel,
  });
  const sentence = el('p', { class: 'sentence t-display' },
    before, el('span', { class: 'blank-wrap' }, mirror, input), after);
  const hint = el('p', { class: 'hint t-caption', 'aria-label': S.hintLabel });
  const verdict = el('p', { class: 'verdict t-caption' });
  const correct = el('p', { class: 'answer t-display', lang: 'fr' });
  const why = el('div', { class: 'why' });
  const feedback = el('div', { class: 'feedback', 'aria-live': 'polite' },
    el('div', {}, verdict, correct, why));
  const action = el('button', { class: 'action', type: 'submit' }, S.check);
  const form = el('form', { autocomplete: 'off', novalidate: true }, sentence, hint, feedback, action);
  const empty = el('p', { class: 'empty', hidden: true }, S.empty);
  container.append(form, empty);

  const available = new Map();
  const isAvailable = (verb, formId) => {
    const k = `${verb}|${formId}`;
    if (!available.has(k)) available.set(k, ctx.generator.candidates(verb, formId).length > 0);
    return available.get(k);
  };

  let current = null;
  let phase = 'answering'; // 'answering' | 'checked'

  function fit() {
    mirror.textContent = input.value;
    input.style.width = input.value ? `calc(${mirror.offsetWidth}px + 0.5ch)` : '';
  }

  function paint(ex) {
    // Display uses the typographic apostrophe; the data keeps the plain one.
    before.textContent = ex.before.replaceAll("'", '’');
    after.textContent = ex.after.replaceAll("'", '’');
    hint.textContent = ex.infinitive;
    input.value = '';
    fit();
    form.className = '';
    verdict.textContent = '';
    correct.textContent = '';
    why.replaceChildren();
    action.textContent = S.check;
    phase = 'answering';
  }

  function show(animate) {
    const ex = drawExercise(ctx, current, isAvailable);
    current = ex;
    form.hidden = !ex;
    empty.hidden = !!ex;
    if (!ex) return;
    if (!animate) { paint(ex); input.focus(); return; }
    // The same input keeps focus during the swap so the phone keyboard stays open.
    sentence.classList.add('is-out');
    setTimeout(() => {
      paint(ex);
      sentence.classList.remove('is-out');
      sentence.classList.add('is-in');
      nextFrame(() => sentence.classList.remove('is-in'));
      input.focus();
    }, SWAP_MS);
  }

  function shake() {
    form.classList.remove('is-shaking');
    void form.offsetWidth;
    form.classList.add('is-shaking');
  }

  function check() {
    const r = ctx.checker.check(current, input.value);
    if (!r) { shake(); return; }
    const cls = { correct: 'is-correct', accent: 'is-almost', wrong: 'is-wrong' }[r.verdict];
    verdict.textContent = S.verdicts[r.verdict];
    correct.textContent = r.verdict === 'correct' ? '' : r.expected;
    why.replaceChildren(...explanation(current, r).map((t) => el('p', {}, t)));
    form.className = `is-checked ${cls}`;
    if (r.verdict === 'wrong') shake();
    action.textContent = S.next;
    phase = 'checked';
    // An accent-only slip counts as not right, for the score and the stats.
    const right = r.verdict === 'correct';
    ctx.score.total += 1;
    if (right) ctx.score.right += 1;
    ctx.stats = record(ctx.stats, current.ref.verb, current.formId, right);
    ctx.store.saveStats(ctx.stats);
    ctx.onScore();
  }

  form.addEventListener('submit', (e) => { // Enter in the field, or the button
    e.preventDefault();
    if (phase === 'answering') check(); else show(true);
    input.focus();
  });
  form.addEventListener('animationend', () => form.classList.remove('is-shaking'));
  input.addEventListener('input', fit);
  input.addEventListener('beforeinput', (e) => {
    // Lock the text once checked, but let Enter through: it submits the form.
    if (phase === 'checked' && e.inputType !== 'insertLineBreak') e.preventDefault();
  });
  // The button must not take focus away from the field.
  action.addEventListener('pointerdown', (e) => e.preventDefault());

  const inSelection = (ex) => ex
    && ctx.selection.verbs.includes(ex.infinitive) && ctx.selection.forms.includes(ex.formId);

  show(false);

  return {
    onShow() {
      // The selection may have changed: keep the exercise if still valid.
      if (!inSelection(current)) show(false);
      else input.focus();
    },
  };
}
