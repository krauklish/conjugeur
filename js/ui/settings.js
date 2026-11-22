// Settings view: toggle forms and verbs. Every toggle mutates ctx.selection in
// place (keeping data order) and is saved immediately.

import { el } from './dom.js';
import { S } from './strings.js';

function chip(label, pressed, onToggle) {
  const b = el('button', { type: 'button', class: 'chip', 'aria-pressed': String(pressed) }, label);
  b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    onToggle(on);
  });
  return b;
}

// Replaces arr's contents in place with the members of `order` that are in `set`.
function assignInOrder(arr, order, set) {
  arr.splice(0, arr.length, ...order.filter((x) => set.has(x)));
}

export function mountSettings(container, ctx) {
  const allVerbs = ctx.allVerbs;
  const allFormIds = ctx.allForms.map((f) => f.id);
  const sel = ctx.selection;

  const hint = el('p', { class: 'empty t-caption' }, S.settings.emptyHint);
  const formsBox = el('div');
  const verbsBox = el('div', { class: 'chips' });
  const all = el('button', { type: 'button' }, S.settings.all);
  const none = el('button', { type: 'button' }, S.settings.none);

  container.append(
    el('h1', { class: 't-display' }, S.settings.title),
    hint,
    el('section', {},
      el('div', { class: 'row' }, el('span', { class: 't-caption' }, S.settings.forms)),
      formsBox),
    el('section', {},
      el('div', { class: 'row' },
        el('span', { class: 't-caption' }, S.settings.verbs),
        el('span', { class: 'links t-caption' }, all, none)),
      verbsBox),
  );

  function save() {
    ctx.store.saveSelection(sel, allVerbs, allFormIds);
    hint.hidden = sel.verbs.length > 0 && sel.forms.length > 0;
  }

  function toggler(key, order) {
    return (id) => (on) => {
      const set = new Set(sel[key]);
      if (on) set.add(id); else set.delete(id);
      assignInOrder(sel[key], order, set);
      save();
    };
  }
  const toggleForm = toggler('forms', allFormIds);
  const toggleVerb = toggler('verbs', allVerbs);

  function render() {
    const moods = [...new Set(ctx.allForms.map((f) => f.mood))];
    formsBox.replaceChildren(...moods.map((mood) => el('div', { class: 'group' },
      el('span', { class: 't-caption' }, mood),
      el('div', { class: 'chips' }, ...ctx.allForms.filter((f) => f.mood === mood)
        .map((f) => chip(f.label, sel.forms.includes(f.id), toggleForm(f.id)))))));
    verbsBox.replaceChildren(...allVerbs.map((v) => chip(v, sel.verbs.includes(v), toggleVerb(v))));
    hint.hidden = sel.verbs.length > 0 && sel.forms.length > 0;
  }

  const setAll = (on) => () => {
    assignInOrder(sel.verbs, allVerbs, new Set(on ? allVerbs : []));
    save();
    for (const b of verbsBox.children) b.setAttribute('aria-pressed', String(on));
  };
  all.addEventListener('click', setAll(true));
  none.addEventListener('click', setAll(false));

  render();
  return { onShow: render };
}
