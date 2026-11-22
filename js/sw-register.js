// Service worker registration and the update notice.
//
// Development guard: on localhost / 127.0.0.1 the worker is NOT registered
// unless the URL has ?sw=1. The worker serves cache-first, so while
// developing it would keep handing back stale files.
//
// Updates never reload on their own: a new version shows a one-line notice,
// and only « Mettre à jour » activates it and reloads (once).

import { el, nextFrame } from './ui/dom.js';
import { S } from './ui/strings.js';

export function registerServiceWorker(nav) {
  if (!('serviceWorker' in navigator)) return;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (local && new URLSearchParams(location.search).get('sw') !== '1') return;

  window.addEventListener('load', async () => {
    let reg;
    try { reg = await navigator.serviceWorker.register('./sw.js'); } catch { return; }

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!requested || reloading) return;
      reloading = true;
      location.reload();
    });

    let requested = false;
    let notice = null;
    const offer = (worker) => {
      if (notice) { notice.worker = worker; return; }
      notice = showNotice(nav, () => {
        requested = true;
        notice.worker.postMessage({ type: 'SKIP_WAITING' });
      });
      notice.worker = worker;
    };

    // A worker already waiting at page load.
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);

    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', () => {
        // With no controller this is the first install, not an update.
        if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
      });
    });
  });
}

function showNotice(nav, onConfirm) {
  const button = el('button', { type: 'button', class: 'link' }, S.update.action);
  const box = el('div', { class: 'update t-caption', role: 'status' },
    el('div', {}, el('p', {}, el('span', {}, S.update.text), button)));
  // Must not take focus away from the answer field.
  button.addEventListener('pointerdown', (e) => e.preventDefault());
  button.addEventListener('click', () => { button.disabled = true; onConfirm(); });
  nav.after(box);
  nextFrame(() => box.classList.add('is-open'));
  return {};
}
