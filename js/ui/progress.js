// Progress view: summary, weakest pairs, verb × form success table.

import { el } from './dom.js';
import { S, pct, summaryLine, shortForm, formTitle } from './strings.js';
import { summary, weakest } from '../core/scheduler.js';

export function mountProgress(container, ctx) {
  const line = el('p');
  const weak = el('div');
  const table = el('table', { });
  const clear = el('button', { type: 'button', class: 'link' }, S.progress.clear);

  container.append(
    el('h1', { class: 't-display' }, S.progress.title),
    el('section', {}, line),
    el('section', {}, el('div', { class: 'row' }, el('span', { }, S.progress.review)), weak),
    el('section', {},
      el('div', { class: 'row' }, el('span', { }, S.progress.table)),
      el('div', { class: 'table-wrap' }, table)),
    el('section', {}, clear),
  );

  function render() {
    const verbs = ctx.allVerbs;
    const forms = ctx.allForms;
    const formIds = forms.map((f) => f.id);
    const sum = summary(ctx.stats, verbs, formIds);
    line.textContent = summaryLine(sum.total, sum.rate);

    const worst = weakest(ctx.stats, verbs, formIds, 5, 3);
    weak.replaceChildren(worst.length
      ? el('ul', { class: 'list' }, ...worst.map((p) => el('li', {},
        el('span', {}, p.verb),
        el('span', {}, formTitle(p.formId).toLowerCase()),
        el('span', {}, pct(p.rate)))))
      : el('p', {}, S.progress.notEnough));

    const cell = new Map(sum.pairs.map((p) => [`${p.verb}|${p.formId}`, p]));
    const head = el('tr', {}, el('th', { scope: 'col' }, S.progress.verb),
      ...forms.map((f) => el('th', { scope: 'col', title: formTitle(f.id) },
        el('abbr', { title: formTitle(f.id) }, shortForm(f.id)))));
    const rows = verbs.map((v) => el('tr', {}, el('td', { lang: 'fr' }, v),
      ...forms.map((f) => {
        const p = cell.get(`${v}|${f.id}`);
        return el('td', {}, p && p.seen && p.rate != null ? String(Math.round(p.rate * 100)) : S.progress.unseen);
      })));
    table.replaceChildren(el('thead', {}, head), el('tbody', {}, ...rows));
  }

  clear.addEventListener('click', () => {
    if (!confirm(S.progress.confirmClear)) return;
    ctx.store.clearStats();
    ctx.stats = {};
    render();
  });

  render();
  return { onShow: render };
}
