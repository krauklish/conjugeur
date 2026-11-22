// Sentence generator: frame + subject + verb form + complement -> Exercise.
//
// Data contract: see js/data/subjects.js, frames.js, complements.js.
// A frame's text holds the contiguous sequence `{S} ___ {C}`; anything may
// precede or follow it.

import { createConjugator } from './conjugator.js';
import { elide, startsWithVowelSound } from './french.js';

const SLOT = '{S} ___ {C}';

// Splits a frame's text around `{S} ___ {C}`. Throws if the placeholder rule is broken.
export function splitFrame(text) {
  const count = (s) => text.split(s).length - 1;
  if (count('{S}') !== 1 || count('___') !== 1 || count('{C}') !== 1 || count(SLOT) !== 1) {
    throw new Error(`Frame text must contain exactly one "${SLOT}": ${JSON.stringify(text)}`);
  }
  const i = text.indexOf(SLOT);
  return { prefix: text.slice(0, i), suffix: text.slice(i + SLOT.length) };
}

function capitalise(s) {
  return s ? s[0].toLocaleUpperCase('fr') + s.slice(1) : s;
}

function tidy(s) {
  return s.replace(/\s+/g, ' ').replace(/ ([.,])/g, '$1');
}

export function createGenerator({ verbs, subjects, frames, complements, random = Math.random }) {
  const conj = createConjugator(verbs);
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const frameById = new Map(frames.map((f) => [f.id, f]));

  function requireVerb(inf) {
    const v = conj.getVerb(inf);
    if (!v) throw new Error(`Unknown verb: ${inf}`);
    return v;
  }

  // Returns the reason (string) a combination is invalid, or null when valid.
  function incompatibility(verb, formId, frame, subject, complement) {
    if (frame.form !== formId) return `frame ${frame.id} is for ${frame.form}, not ${formId}`;
    if (frame.notVerbs?.includes(verb.inf)) return `frame ${frame.id} excludes verb ${verb.inf}`;
    if (frame.notPersons?.includes(subject.person)) return `frame ${frame.id} excludes person ${subject.person}`;
    if (frame.notSubjects?.includes(subject.id)) return `frame ${frame.id} excludes subject ${subject.id}`;
    if (complement.notForms?.includes(formId)) return `complement "${complement.text}" excludes ${formId}`;
    if (complement.notFrames?.includes(frame.id)) return `complement "${complement.text}" excludes frame ${frame.id}`;
    if (verb.impersonal && subject.id !== 'il') return `impersonal verb ${verb.inf} takes only subject "il"`;
    const answers = conjugateFor(verb, formId, subject, complement);
    if (!answers || answers.length === 0) return `no form of ${verb.inf} ${formId} for subject ${subject.id}`;
    return null;
  }

  function conjugateFor(verb, formId, subject, complement) {
    const opts = complement.aux ? { aux: complement.aux } : {};
    const subj = { person: subject.person, gender: subject.gender ?? null };
    if ('number' in subject) subj.number = subject.number;
    return conj.conjugate(verb.inf, formId, subj, opts);
  }

  /**
   * Every valid combination for verb × form, as an array of
   *   { frameId, complementIndex, subjectIds: [id…] }   (subjectIds non-empty)
   * in data order (frames, then complements). Empty array if none.
   */
  function candidates(inf, formId) {
    const verb = requireVerb(inf);
    const comps = complements[inf] ?? [];
    const out = [];
    for (const frame of frames) {
      if (frame.form !== formId || frame.notVerbs?.includes(inf)) continue;
      comps.forEach((complement, complementIndex) => {
        const subjectIds = [];
        for (const subject of subjects) {
          let bad;
          try { bad = incompatibility(verb, formId, frame, subject, complement); } catch { bad = 'error'; }
          if (!bad) subjectIds.push(subject.id);
        }
        if (subjectIds.length) out.push({ frameId: frame.id, complementIndex, subjectIds });
      });
    }
    return out;
  }

  function build({ verb: inf, formId, frameId, subjectId, complementIndex }) {
    const verb = requireVerb(inf);
    const frame = frameById.get(frameId);
    if (!frame) throw new Error(`Unknown frame id: ${frameId}`);
    const subject = subjectById.get(subjectId);
    if (!subject) throw new Error(`Unknown subject id: ${subjectId}`);
    const complement = (complements[inf] ?? [])[complementIndex];
    if (!complement) throw new Error(`Unknown complement index ${complementIndex} for verb ${inf}`);
    const bad = incompatibility(verb, formId, frame, subject, complement);
    if (bad) throw new Error(`Incompatible combination: ${bad}`);

    const answers = conjugateFor(verb, formId, subject, complement);
    const vowel = startsWithVowelSound(answers[0]);
    if (answers.some((a) => startsWithVowelSound(a) !== vowel)) {
      throw new Error(`Accepted answers disagree on initial vowel sound: ${answers.join(', ')}`);
    }

    const { prefix, suffix } = splitFrame(frame.text);
    // Elide the word before the subject (que -> qu', si -> s'…). elide() looks at
    // the last space-separated token, so the whole trimmed prefix is passed.
    const lead = prefix.trim();
    let before = lead ? elide(lead, subject.text) : '';
    // Subject, with je -> j' before a vowel sound.
    let subj = subject.id === 'je' || (subject.pronoun && subject.text === 'je')
      ? elide(subject.text, answers[0])
      : subject.text + ' ';
    if (!lead) subj = capitalise(subj);
    before = tidy(before + subj);
    if (before.endsWith("' ")) before = before.slice(0, -1);
    const after = tidy(` ${complement.text}${suffix}`);

    return {
      before,
      after,
      infinitive: inf,
      answers,
      cue: frame.cue,
      formId,
      person: subject.person,
      ref: { verb: inf, frameId, subjectId, complementIndex },
    };
  }

  const pickOne = (arr) => arr[Math.min(arr.length - 1, Math.floor(random() * arr.length))];

  function generate({ verbs: verbSel, forms: formSel }, pick = {}) {
    const vs = pick.verb ? [pick.verb] : verbSel;
    const fs = pick.formId ? [pick.formId] : formSel;
    if (!vs?.length || !fs?.length) return null;
    // First try: uniform verb then form.
    const v0 = pickOne(vs);
    const f0 = pickOne(fs);
    let cands = candidates(v0, f0);
    let pair = [v0, f0];
    if (!cands.length) {
      // Fallback: uniformly among remaining pairs that have a combination.
      const pairs = [];
      for (const v of vs) for (const f of fs) {
        if (v === v0 && f === f0) continue;
        const c = candidates(v, f);
        if (c.length) pairs.push([v, f, c]);
      }
      if (!pairs.length) return null;
      const [v, f, c] = pickOne(pairs);
      pair = [v, f];
      cands = c;
    }
    const [verb, formId] = pair;
    // Uniform frame, then complement, then subject.
    const frameIds = [...new Set(cands.map((c) => c.frameId))];
    const frameId = pickOne(frameIds);
    const forFrame = cands.filter((c) => c.frameId === frameId);
    const c = pickOne(forFrame);
    const subjectId = pickOne(c.subjectIds);
    return build({ verb, formId, frameId, subjectId, complementIndex: c.complementIndex });
  }

  return { build, candidates, generate };
}
