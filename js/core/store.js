// localStorage wrapper. Never throws: on any storage problem it keeps working
// from an in-memory copy for the session.

const KEY = 'conjugeur.v1';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const strArr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
const nat = (v) => Number.isInteger(v) && v >= 0;

function sanitizeStats(raw) {
  const out = {};
  if (!isObj(raw)) return out;
  for (const [k, e] of Object.entries(raw)) {
    if (!isObj(e) || !nat(e.seen) || !nat(e.right) || e.right > e.seen) continue;
    out[k] = { seen: e.seen, right: e.right, streak: nat(e.streak) ? e.streak : 0 };
  }
  return out;
}

function sanitize(raw) {
  const off = isObj(raw) && isObj(raw.off) ? raw.off : {};
  return {
    off: { verbs: strArr(off.verbs), forms: strArr(off.forms) },
    stats: sanitizeStats(isObj(raw) ? raw.stats : null),
  };
}

export function createStore(storage = globalThis.localStorage) {
  let state = null; // in-memory copy, source of truth after first read

  function read() {
    if (state) return state;
    let raw = null;
    try {
      const text = storage?.getItem(KEY);
      if (typeof text === 'string') raw = JSON.parse(text);
    } catch {
      raw = null;
    }
    state = sanitize(raw);
    return state;
  }

  function write() {
    try {
      storage?.setItem(KEY, JSON.stringify(state));
    } catch {
      // quota / blocked: keep the in-memory copy
    }
  }

  return {
    loadSelection(allVerbs = [], allForms = []) {
      const { off } = read();
      const offV = new Set(off.verbs);
      const offF = new Set(off.forms);
      return {
        verbs: allVerbs.filter((v) => !offV.has(v)),
        forms: allForms.filter((f) => !offF.has(f)),
      };
    },
    saveSelection(selection, allVerbs = [], allForms = []) {
      read();
      const onV = new Set(selection?.verbs ?? []);
      const onF = new Set(selection?.forms ?? []);
      state.off = {
        verbs: allVerbs.filter((v) => !onV.has(v)),
        forms: allForms.filter((f) => !onF.has(f)),
      };
      write();
    },
    loadStats() {
      return structuredClone(read().stats);
    },
    saveStats(stats) {
      read();
      state.stats = sanitizeStats(stats);
      write();
    },
    clearStats() {
      read();
      state.stats = {};
      write();
    },
  };
}
