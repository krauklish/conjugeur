#!/usr/bin/env node
// Validates js/data/verbs.js against js/data/forms.js. Zero dependencies.
// Usage: node tools/validate-data.mjs [--list]
import { SIMPLE_FORM_IDS } from '../js/data/forms.js';
import { VERBS } from '../js/data/verbs.js';

const errors = [];
const err = (inf, msg) => errors.push(`${inf}: ${msg}`);
const LETTERS = /^[a-zàâäçéèêëîïôöùûüÿœæ]+$/;
const PERSONS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

// Explicit exceptions where French is genuinely irregular.
const PRESENT_EXC = { 3: ['sommes'], 4: ['êtes', 'faites', 'dites'] };
const SUBJ_EXEMPT = new Set(['être', 'avoir']);

function checkEndings(inf, id, row, endings, slots) {
  let stem = null;
  for (const i of slots) {
    const f = row[i];
    if (typeof f !== 'string') continue;
    if (!f.endsWith(endings[i])) { err(inf, `${id}[${i}] "${f}" should end in -${endings[i]}`); continue; }
    const s = f.slice(0, -endings[i].length);
    if (stem === null) stem = s;
    else if (s !== stem) err(inf, `${id}[${i}] "${f}" stem "${s}" differs from "${stem}"`);
  }
}

const seen = new Set();
for (const v of VERBS) {
  const inf = v.inf ?? '(no inf)';
  if (seen.has(inf)) err(inf, 'duplicate inf');
  seen.add(inf);
  if (!['être', 'avoir'].includes(v.aux)) err(inf, `bad aux "${v.aux}"`);
  if (typeof v.pp !== 'string' || !v.pp) err(inf, 'empty pp');
  const keys = Object.keys(v.simple ?? {}).sort();
  const want = [...SIMPLE_FORM_IDS].sort();
  if (keys.join() !== want.join()) { err(inf, `simple keys [${keys}] != [${want}]`); continue; }
  const slots = v.impersonal ? [2] : [0, 1, 2, 3, 4, 5];

  for (const id of SIMPLE_FORM_IDS) {
    const row = v.simple[id];
    if (!Array.isArray(row) || row.length !== 6) { err(inf, `${id} must have 6 slots`); continue; }
    row.forEach((f, i) => {
      if (f === null) {
        if (!v.impersonal) err(inf, `${id}[${i}] is null but verb not impersonal`);
        else if (i === 2) err(inf, `${id}[2] must not be null`);
        return;
      }
      if (typeof f !== 'string') return err(inf, `${id}[${i}] not string/null`);
      if (v.impersonal && i !== 2) err(inf, `${id}[${i}] must be null (impersonal)`);
      if (!f || f !== f.toLowerCase() || f !== f.normalize('NFC') || !LETTERS.test(f))
        err(inf, `${id}[${i}] "${f}" invalid characters/case/normalization`);
    });
  }

  const s = v.simple;
  checkEndings(inf, 'ind.imparfait', s['ind.imparfait'], ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'], slots);
  checkEndings(inf, 'ind.futur', s['ind.futur'], ['rai', 'ras', 'ra', 'rons', 'rez', 'ront'], slots);
  const pr = s['ind.present'];
  if (!v.impersonal) {
    if (!pr[3].endsWith('ons') && !PRESENT_EXC[3].includes(pr[3])) err(inf, `ind.present nous "${pr[3]}"`);
    if (!pr[4].endsWith('ez') && !PRESENT_EXC[4].includes(pr[4])) err(inf, `ind.present vous "${pr[4]}"`);
    if (!pr[5].endsWith('nt')) err(inf, `ind.present ils "${pr[5]}"`);
  }
  if (!SUBJ_EXEMPT.has(inf)) {
    const sj = s['subj.present'];
    const ends = ['e', 'es', 'e', 'ions', 'iez', 'ent'];
    for (const i of slots) if (!sj[i].endsWith(ends[i])) err(inf, `subj.present[${i}] "${sj[i]}" should end in -${ends[i]}`);
    if (!v.impersonal && sj[0] !== sj[2]) err(inf, `subj.present je/il differ`);
  }
}
for (const req of ['être', 'avoir']) if (!seen.has(req)) err(req, 'required verb missing');

if (process.argv.includes('--list')) {
  for (const v of VERBS) {
    console.log(`\n== ${v.inf}  (aux ${v.aux}, pp ${v.pp}${v.impersonal ? ', impersonal' : ''})`);
    const w = 15;
    console.log('      ' + SIMPLE_FORM_IDS.map((id) => id.padEnd(w)).join(''));
    PERSONS.forEach((p, i) => {
      console.log(p.padEnd(6) + SIMPLE_FORM_IDS.map((id) => String(v.simple[id]?.[i] ?? '—').padEnd(w)).join(''));
    });
  }
  console.log();
}

console.log(`${VERBS.length} verbs, ${SIMPLE_FORM_IDS.length} simple forms checked.`);
if (errors.length) {
  console.error(`${errors.length} error(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log('OK');
