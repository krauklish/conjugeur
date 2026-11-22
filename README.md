# Conjugeur

A small French conjugation trainer: mobile-first, web-based, works offline once loaded.
The user sees a sentence with a blank, works out which verb form the context requires, and types it.

## Running

No build step and no runtime dependencies. Node is used only for tests and data checks.

```bash
npm test
npm run validate
```

## Layout

```
js/data/     forms.js (form registry), verbs.js (conjugation tables)
js/core/     conjugator.js, french.js (elision, agreement, normalisation)
tests/       node:test suites
tools/       validate-data.mjs
```

## Status

- [x] 1. Core: forms registry, conjugator, French helpers, tests
- [x] 2. Verb data: 20 verbs, validator, cross-check (blind re-derivation + fr.wiktionary, 2026-11-22: no differences)
- [ ] 3. Sentence layer: subjects, frames, complements, generator
- [ ] 4. Practice screen
- [ ] 5. Settings, progress, scheduler
- [ ] 6. Offline: service worker, manifest
- [ ] 7. Device testing and deployment

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-11-22 | Vanilla HTML/CSS/JS with ES modules; no framework, no build step, zero runtime dependencies | Requirement: as few libraries as possible |
| 2026-11-22 | Offline via service worker precache plus web manifest; state in `localStorage` | App and data are a few dozen KB; no server needed |
| 2026-11-22 | Tests use Node's built-in `node:test` | No test dependency |
| 2026-11-22 | Sentence = frame + subject + verb form + complement, each a separate data layer | Adding verbs or forms later must not touch code |
| 2026-11-22 | Simple tenses stored as explicit tables; compound tenses derived from auxiliary + participle | The top 20 verbs are nearly all irregular; a rule engine would be mostly exceptions |
| 2026-11-22 | Data lives in JS modules, not JSON | Synchronous imports, same files usable from Node tests |
| 2026-11-22 | Verb list v1: être, avoir, faire, dire, pouvoir, aller, voir, savoir, vouloir, venir, devoir, prendre, trouver, donner, falloir, parler, mettre, passer, croire, aimer | 20 most used; `falloir` kept although impersonal (tables allow `null`) |
| 2026-11-22 | Forms v1: indicatif présent, passé composé, imparfait, futur simple; subjonctif présent, passé | Set by the owner |
| 2026-11-22 | The form name is hidden until the answer is checked | Deducing the form is the exercise |
| 2026-11-22 | A missing or wrong accent counts as wrong, but is reported as "accent only" | Goal includes writing the form correctly |
| 2026-11-22 | Where participle gender or number is unknown (je, tu, nous, vous, on), all agreeing variants are accepted | The sentence gives no way to decide |
| 2026-11-22 | A person is treated as missing for a verb when no simple tense has a form for it (drives `null` for falloir's compound forms) | Derived from the data, no special-casing of `impersonal` in code |
| 2026-11-22 | `passer` defaults to auxiliary avoir; sentences can override per complement (`opts.aux`) | Its auxiliary depends on meaning |
| 2026-11-22 | UI language is French | Owner's choice |
| 2026-11-22 | Hosting: GitHub Pages | Static HTTPS is all a service worker needs |
