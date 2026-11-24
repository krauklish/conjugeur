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
import { S } from './ui/strings.js';
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
  verbGroups: new Map(VERBS.map((v) => [v.inf, v.group])),
  stats: store.loadStats(),
  generator: createGenerator({ verbs: VERBS, subjects: SUBJECTS, frames: FRAMES, complements: COMPLEMENTS }),
  checker: createChecker({ verbs: VERBS }),
  selection: store.loadSelection(ALL_VERBS, ALL_FORM_IDS),
};

// View registry: { id, label, mount(container, ctx) -> { onShow? }? , onShow? }.
// First entry is shown at start.
const VIEWS = [
  { id: 'practice', label: S.views.practice, mount: mountPractice },
  { id: 'settings', label: S.views.settings, mount: mountSettings },
  { id: 'progress', label: S.views.progress, mount: mountProgress },
];

function start(root) {
  // Hidden for now: the views are still mounted and reachable in code.
  const nav = el('nav', { 'aria-label': S.navLabel, hidden: true });

  const views = new Map();
  for (const v of VIEWS) {
    const button = el('button', { type: 'button' }, v.label);
    button.addEventListener('click', () => go(v.id));
    nav.append(button);
    const container = el('main', { class: 'view', id: `view-${v.id}`, hidden: true });
    views.set(v.id, { def: v, button, container, api: null });
  }
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

// Sizes the app to the visible area, so the practice view's button sits above
// the on-screen keyboard. Android Chrome also resizes via interactive-widget in
// the viewport meta; iOS only reports it through visualViewport.
function followViewport(root) {
  const vv = window.visualViewport;
  if (!vv) return;
  const sync = () => {
    root.style.setProperty('--app-h', `${vv.height}px`);
    // iOS pans the page when the keyboard opens; the practice view fits, so pin it.
    if (!document.getElementById('view-practice')?.hidden) window.scrollTo(0, 0);
  };
  vv.addEventListener('resize', sync);
  sync();
}

const root = document.getElementById('app');
followViewport(root);
start(root);
