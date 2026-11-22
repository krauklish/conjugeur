#!/usr/bin/env node
// Prints generated sentences for proofreading. Deterministic output.
// Usage: node tools/dump-sentences.mjs [--verb inf[,inf]]… [--form id] [--all-subjects] [--count]
import { FORMS } from '../js/data/forms.js';
import { VERBS } from '../js/data/verbs.js';
import { createGenerator } from '../js/core/generator.js';

let SUBJECTS, FRAMES, COMPLEMENTS;
try {
  ({ SUBJECTS } = await import('../js/data/subjects.js'));
  ({ FRAMES } = await import('../js/data/frames.js'));
  ({ COMPLEMENTS } = await import('../js/data/complements.js'));
} catch (e) {
  console.error(`Cannot load sentence content (${e.code ?? e.message}).`);
  process.exit(1);
}

const args = process.argv.slice(2);
const verbFilter = [];
let formFilter = null;
let allSubjects = false;
let countOnly = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--verb') verbFilter.push(...String(args[++i] ?? '').split(',').filter(Boolean));
  else if (a === '--form') formFilter = args[++i];
  else if (a === '--all-subjects') allSubjects = true;
  else if (a === '--count') countOnly = true;
  else { console.error(`Unknown argument: ${a}`); process.exit(2); }
}
for (const v of verbFilter) if (!VERBS.some((x) => x.inf === v)) { console.error(`Unknown verb: ${v}`); process.exit(2); }
if (formFilter && !FORMS.some((f) => f.id === formFilter)) { console.error(`Unknown form: ${formFilter}`); process.exit(2); }

const g = createGenerator({ verbs: VERBS, subjects: SUBJECTS, frames: FRAMES, complements: COMPLEMENTS });
const subjText = new Map(SUBJECTS.map((s) => [s.id, s.text]));
const verbs = VERBS.filter((v) => !verbFilter.length || verbFilter.includes(v.inf));
const forms = FORMS.filter((f) => !formFilter || f.id === formFilter);

let grand = 0;
let rot = 0; // global rotation counter so every subject gets exercised
for (const v of verbs) for (const f of forms) {
  const cands = g.candidates(v.inf, f.id);
  const n = cands.reduce((s, c) => s + c.subjectIds.length, 0);
  grand += n;
  if (countOnly) { console.log(`${v.inf} | ${f.id} | ${n}`); continue; }
  for (const c of cands) {
    const ids = allSubjects ? c.subjectIds : [c.subjectIds[rot++ % c.subjectIds.length]];
    for (const s of ids) {
      const e = g.build({ verb: v.inf, formId: f.id, frameId: c.frameId, subjectId: s, complementIndex: c.complementIndex });
      console.log(`${v.inf} | ${f.id} | ${c.frameId} | c${c.complementIndex} | ${subjText.get(s)} | ${e.before}[${e.answers[0]}]${e.after}`);
    }
  }
}
if (countOnly) console.log(`total distinct exercises: ${grand}`);
