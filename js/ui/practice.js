// Practice view: one sentence with an inline blank, check, feedback, next.

import { el, nextFrame } from './dom.js';
import { S, formName, cueParts, verbHint } from './strings.js';
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
  // On a wrong answer the correct one is shown in accent right after the typed text.
  const expected = el('span', { class: 'expected', hidden: true });
  const sentence = el('p', { class: 'sentence t-display' },
    before, el('span', { class: 'blank-wrap' }, mirror, input, expected), after);
  // Verb hint while answering; once checked, the form and why it is right.
  const caption = el('div', { class: 'caption', lang: 'fr', 'aria-live': 'polite' });
  // No submit button: the field is the only input, so Enter submits the form.
  const form = el('form', { class: 'practice', autocomplete: 'off', novalidate: true },
    el('div', { class: 'stage' }, sentence, caption));
  const empty = el('p', { class: 'empty-state', hidden: true }, S.empty);
  container.append(form, empty);

  const available = new Map();
  const isAvailable = (verb, formId) => {
    const k = `${verb}|${formId}`;
    if (!available.has(k)) available.set(k, ctx.generator.candidates(verb, formId).length > 0);
    return available.get(k);
  };

  let current = null;
  let phase = 'answering'; // 'answering' | 'checked'

  // Width of a string in the sentence's type.
  function textWidth(text) {
    mirror.textContent = text;
    return mirror.offsetWidth;
  }

  // The empty blank is as wide as the expected answer, and keeps that width as
  // its minimum while the learner types; longer input widens it, up to the
  // width of the line.
  function fit() {
    const caret = parseFloat(getComputedStyle(input).fontSize) / 4;
    // Once checked, the field holds only what was typed (or the accent-fixed answer).
    const base = current && phase === 'answering' ? textWidth(current.answers[0]) : 0;
    const typed = input.value ? textWidth(input.value) : 0;
    const line = sentence.clientWidth || Infinity; // 0 while the view is hidden
    input.style.width = `${Math.min(Math.max(base, typed) + caret, line)}px`;
    input.classList.toggle('is-filled', !!input.value);
  }
  // The first measure can run on the fallback font; redo it once Chivo is in.
  document.fonts?.ready.then(fit);

  const line = (...children) => el('p', {}, ...children);

  function paint(ex) {
    // Display uses the typographic apostrophe; the data keeps the plain one.
    before.textContent = ex.before.replaceAll("'", '’');
    after.textContent = ex.after.replaceAll("'", '’');
    caption.replaceChildren(line(verbHint(ex.infinitive, ctx.verbGroups.get(ex.infinitive))));
    input.value = '';
    expected.hidden = true;
    expected.textContent = '';
    phase = 'answering';
    fit();
    form.className = 'practice';
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
    // An accent-only slip counts as right: the accents are filled in.
    const right = r.verdict !== 'wrong';
    phase = 'checked';
    if (r.verdict === 'accent') { input.value = r.expected; }
    // Wrong: the typed text is struck through, the correct answer follows in accent.
    expected.textContent = right ? '' : r.expected;
    expected.hidden = right;
    fit();
    const cue = cueParts(current.cue);
    const name = formName(current.formId);
    caption.replaceChildren(line(name), ...(cue ? [line(...cue.map((p) => (p.italic ? el('em', {}, p.text) : p.text)))] : []));
    form.className = `practice is-checked ${right ? 'is-correct' : 'is-wrong'}`;
    if (!right) shake();
    ctx.stats = record(ctx.stats, current.ref.verb, current.formId, right);
    ctx.store.saveStats(ctx.stats);
  }

  form.addEventListener('submit', (e) => { // Enter in the field
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

  // Tapping anywhere on the sentence focuses the blank (on iOS this is what
  // raises the keyboard). Keep focus on mousedown so the keyboard doesn't blink.
  sentence.addEventListener('mousedown', (e) => { if (e.target !== input) e.preventDefault(); });
  sentence.addEventListener('click', () => { if (document.activeElement !== input) input.focus(); });

  // Swipe up (touch only) loads the next exercise, answered or not.
  const SWIPE_MIN = 60;
  let swipe = null;
  const active = () => !container.hidden && !form.hidden;
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    swipe = e.touches.length === 1 && active() ? { x: t.clientX, y: t.clientY } : null;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!swipe) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipe.x;
    const dy = t.clientY - swipe.y;
    swipe = null;
    if (dy < -SWIPE_MIN && Math.abs(dy) > Math.abs(dx) * 1.5) show(true);
  }, { passive: true });
  document.addEventListener('touchcancel', () => { swipe = null; }, { passive: true });

  // Browsers may ignore the first focus() before the page is loaded or touched
  // (iOS needs a gesture to raise the keyboard): retry on load and first tap.
  const refocus = () => { if (active() && document.activeElement !== input) input.focus(); };
  window.addEventListener('load', refocus, { once: true });
  window.addEventListener('pageshow', refocus);
  document.addEventListener('touchend', refocus, { once: true, passive: true });

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
