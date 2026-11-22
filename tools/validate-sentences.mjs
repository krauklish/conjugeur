#!/usr/bin/env node
// Validates js/data/{subjects,frames,complements}.js against verbs and forms.
// Usage: node tools/validate-sentences.mjs   (exit 1 on any error)
import { FORMS } from '../js/data/forms.js';
import { VERBS } from '../js/data/verbs.js';
import { createGenerator, splitFrame } from '../js/core/generator.js';

async function load(name, key) {
  try {
    return (await import(`../js/data/${name}.js`))[key];
  } catch (e) {
    console.error(`Cannot load js/data/${name}.js (${e.code ?? e.message}). Sentence content missing?`);
    process.exit(1);
  }
}
const SUBJECTS = await load('subjects', 'SUBJECTS');
const FRAMES = await load('frames', 'FRAMES');
const COMPLEMENTS = await load('complements', 'COMPLEMENTS');

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const formIds = new Set(FORMS.map((f) => f.id));
const verbInfs = new Set(VERBS.map((v) => v.inf));

function checkText(where, t) {
  if (typeof t !== 'string' || !t) return err(`${where}: text must be a non-empty string`);
  if (t !== t.normalize('NFC')) err(`${where}: text not NFC`);
  if (t !== t.trim()) err(`${where}: text not trimmed`);
  if (/\s{2,}/.test(t)) err(`${where}: double spaces`);
}
function checkUnique(list, what) {
  const seen = new Set();
  for (const x of list) {
    if (typeof x.id !== 'string' || !x.id) err(`${what}: missing id`);
    else if (seen.has(x.id)) err(`${what} ${x.id}: duplicate id`);
    seen.add(x.id);
  }
}

if (!Array.isArray(SUBJECTS) || !Array.isArray(FRAMES) || !COMPLEMENTS || typeof COMPLEMENTS !== 'object') {
  console.error('SUBJECTS/FRAMES must be arrays, COMPLEMENTS an object.');
  process.exit(1);
}

// Subjects
checkUnique(SUBJECTS, 'subject');
for (const s of SUBJECTS) {
  const w = `subject ${s.id}`;
  checkText(w, s.text);
  if (!Number.isInteger(s.person) || s.person < 0 || s.person > 5) err(`${w}: person must be 0..5`);
  if (![null, 'm', 'f'].includes(s.gender)) err(`${w}: gender must be 'm' | 'f' | null`);
  if ('number' in s && ![null, 's', 'p'].includes(s.number)) err(`${w}: number must be 's' | 'p' | null`);
  if (typeof s.pronoun !== 'boolean') err(`${w}: pronoun must be boolean`);
}
if (!SUBJECTS.some((s) => s.id === 'il')) err('subject "il" missing');

// Frames
checkUnique(FRAMES, 'frame');
for (const f of FRAMES) {
  const w = `frame ${f.id}`;
  if (!formIds.has(f.form)) err(`${w}: unknown form ${f.form}`);
  checkText(w, f.text);
  if (typeof f.text === 'string') {
    try { splitFrame(f.text); } catch (e) { err(`${w}: ${e.message}`); }
    if (!/[.!?]$/.test(f.text)) err(`${w}: must end with . ! or ?`);
  }
  if (typeof f.cue !== 'string' || !f.cue.trim()) err(`${w}: cue must be a non-empty string`);
  if (f.notPersons !== undefined && (!Array.isArray(f.notPersons) || f.notPersons.some((p) => !Number.isInteger(p) || p < 0 || p > 5))) err(`${w}: bad notPersons`);
  if (f.notSubjects !== undefined) {
    if (!Array.isArray(f.notSubjects)) err(`${w}: notSubjects must be an array`);
    else for (const id of f.notSubjects) if (!SUBJECTS.some((s) => s.id === id)) err(`${w}: notSubjects has unknown subject ${id}`);
  }
  if (f.notVerbs !== undefined) {
    if (!Array.isArray(f.notVerbs)) err(`${w}: notVerbs must be an array`);
    else for (const v of f.notVerbs) if (!verbInfs.has(v)) err(`${w}: notVerbs has unknown verb ${v}`);
  }
}
for (const id of formIds) {
  const n = FRAMES.filter((f) => f.form === id).length;
  if (n < 5) err(`form ${id}: only ${n} frames (need ≥ 5)`);
}

// Complements
for (const [inf, list] of Object.entries(COMPLEMENTS)) {
  if (!verbInfs.has(inf)) { err(`complements: unknown verb ${inf}`); continue; }
  if (!Array.isArray(list)) { err(`complements ${inf}: must be an array`); continue; }
  list.forEach((c, i) => {
    const w = `complement ${inf}[${i}]`;
    checkText(w, c.text);
    if (c.aux !== undefined && c.aux !== 'être' && c.aux !== 'avoir') err(`${w}: aux must be être | avoir`);
    if (c.notForms !== undefined) {
      if (!Array.isArray(c.notForms)) err(`${w}: notForms must be an array`);
      else for (const id of c.notForms) if (!formIds.has(id)) err(`${w}: notForms has unknown form ${id}`);
    }
    if (c.notFrames !== undefined) {
      if (!Array.isArray(c.notFrames)) err(`${w}: notFrames must be an array`);
      else for (const id of c.notFrames) if (!FRAMES.some((f) => f.id === id)) err(`${w}: notFrames has unknown frame ${id}`);
    }
  });
}
for (const v of VERBS) {
  const n = (COMPLEMENTS[v.inf] ?? []).length;
  if (n < 3) err(`verb ${v.inf}: only ${n} complements (need ≥ 3)`);
}

// Coverage (only meaningful if structure is sound)
let total = 0;
if (!errors.length) {
  const g = createGenerator({ verbs: VERBS, subjects: SUBJECTS, frames: FRAMES, complements: COMPLEMENTS });
  for (const v of VERBS) for (const { id } of FORMS) {
    const c = g.candidates(v.inf, id);
    if (!c.length) { err(`${v.inf} × ${id}: no valid combination`); continue; }
    const frames = new Set(c.map((x) => x.frameId)).size;
    if (frames < 3) warnings.push(`${v.inf} × ${id}: only ${frames} usable frame(s)`);
    for (const x of c) for (const s of x.subjectIds) {
      total++;
      try { g.build({ verb: v.inf, formId: id, frameId: x.frameId, subjectId: s, complementIndex: x.complementIndex }); }
      catch (e) { err(`${v.inf} × ${id} × ${x.frameId} × c${x.complementIndex} × ${s}: ${e.message}`); }
    }
  }
}

console.log(`Sentences: ${SUBJECTS.length} subjects, ${FRAMES.length} frames, ${Object.values(COMPLEMENTS).flat().length} complements, ${total} exercises.`);
for (const w of warnings) console.log(`warning: ${w}`);
for (const e of errors) console.log(`error: ${e}`);
console.log(errors.length ? `${errors.length} error(s), ${warnings.length} warning(s).` : `OK (${warnings.length} warning(s)).`);
process.exit(errors.length ? 1 : 0);
