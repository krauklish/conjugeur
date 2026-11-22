// Bootstrap: data -> generator + checker, app shell with a view registry.

import { VERBS } from './data/verbs.js';
import { FORMS } from './data/forms.js';
import { SUBJECTS } from './data/subjects.js';
import { FRAMES } from './data/frames.js';
import { COMPLEMENTS } from './data/complements.js';
import { createGenerator } from './core/generator.js';
import { createChecker } from './core/checker.js';
import { createStore } from './core/store.js';
import { el, nextFrame } from './ui/dom.js';
import { S, score } from './ui/strings.js';
import { mountPractice } from './ui/practice.js';
import { mountSettings } from './ui/settings.js';
import { mountProgress } from './ui/progress.js';
import { registerServiceWorker } from './sw-register.js';

const FADE_MS = 200;

const ALL_VERBS = VERBS.map((v) => v.inf);
const ALL_FORM_IDS = FORMS.map((f) => f.id);
const store = createStore();

// Shared state. Views read ctx.selection on every new exercise; the settings
// view mutates it in place (it stays one object).
const ctx = {
  store,
  allVerbs: ALL_VERBS,
  allForms: FORMS,
  stats: store.loadStats(),
  generator: createGenerator({ verbs: VERBS, subjects: SUBJECTS, frames: FRAMES, complements: COMPLEMENTS }),
  checker: createChecker({ verbs: VERBS }),
  selection: store.loadSelection(ALL_VERBS, ALL_FORM_IDS),
  score: { right: 0, total: 0 },
  onScore: () => {},
};

// View registry: { id, label, mount(container, ctx) -> { onShow? }? , onShow? }.
// First entry is shown at start.
const VIEWS = [
  { id: 'practice', label: S.views.practice, mount: mountPractice },
  { id: 'settings', label: S.views.settings, mount: mountSettings },
  { id: 'progress', label: S.views.progress, mount: mountProgress },
];

function start(root) {
  const nav = el('nav', { class: 't-caption', 'aria-label': S.navLabel });
  const scoreEl = el('span', { class: 'score', 'aria-label': S.scoreLabel }, score(0, 0));
  ctx.onScore = () => { scoreEl.textContent = score(ctx.score.right, ctx.score.total); };

  const views = new Map();
  for (const v of VIEWS) {
    const button = el('button', { type: 'button' }, v.label);
    button.addEventListener('click', () => go(v.id));
    nav.append(button);
    const container = el('main', { class: 'view', id: `view-${v.id}`, hidden: true });
    views.set(v.id, { def: v, button, container, api: null });
  }
  nav.append(scoreEl);
  root.append(nav, ...[...views.values()].map((v) => v.container));

  let current = null;
  function mountIfNeeded(entry) {
    if (!entry.api) entry.api = entry.def.mount(entry.container, ctx) ?? {};
  }
  function onShow(entry) {
    (entry.api.onShow ?? entry.def.onShow)?.call(entry.def, ctx);
  }
  function mark(id) {
    for (const [vid, v] of views) {
      if (vid === id) v.button.setAttribute('aria-current', 'page');
      else v.button.removeAttribute('aria-current');
    }
  }

  function go(id) {
    if (id === current) return;
    const to = views.get(id);
    mark(id);
    if (!current) {
      current = id;
      to.container.hidden = false;
      mountIfNeeded(to);
      return;
    }
    const from = views.get(current);
    current = id;
    from.container.classList.add('is-leaving');
    setTimeout(() => {
      from.container.hidden = true;
      from.container.classList.remove('is-leaving');
      const fresh = !to.api;
      to.container.classList.add('is-entering');
      to.container.hidden = false;
      mountIfNeeded(to);
      if (!fresh) onShow(to);
      nextFrame(() => to.container.classList.remove('is-entering'));
    }, FADE_MS);
  }

  go(VIEWS[0].id);
  registerServiceWorker(nav);
}

start(document.getElementById('app'));
