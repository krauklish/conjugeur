// Pure French string helpers.

export function normalizeAnswer(s) {
  return String(s)
    .normalize('NFC')
    .replace(/[’‘ʼ]/g, "'")
    .toLocaleLowerCase('fr')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ ?' ?/g, "'");
}

// Ligatures are expanded (œ → oe, æ → ae) so "coeur" matches "cœur".
export function stripDiacritics(s) {
  return String(s)
    .replace(/œ/g, 'oe').replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae').replace(/Æ/g, 'AE')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC');
}

// Common words with h aspiré: no elision before them ("je hais", "le héros").
export const H_ASPIRE = new Set([
  'haïr', 'hais', 'hait', 'haïssons', 'haïssez', 'haïssent', 'héros', 'haut', 'hibou', 'huit',
  'honte', 'hasard', 'hurler', 'heurter', 'harceler', 'hache', 'haricot', 'hall', 'handicap',
  'hareng', 'harpe', 'hausse', 'hérisson', 'hors', 'houle', 'hublot', 'hutte', 'hamac',
  'hameau', 'hanche', 'hangar', 'hanter', 'hâte', 'hausser', 'hockey', 'homard', 'hongrois',
  'honteux', 'huer', 'hurlement',
]);

// 'y' counts as a vowel ("il y a", "les yeux" → "j'y vais") except these
// mostly borrowed words, where it is a consonant ("le yaourt").
export const Y_CONSONANT = new Set(['yaourt', 'yoga', 'yacht', 'yen', 'yankee', 'yod', 'yoyo', 'yéti']);

// Exact match, tolerating simple inflected endings (hautes, yachts…).
function inSet(set, w) {
  return [w, w.replace(/(es|s|x|e)$/, '')].some((x) => set.has(x));
}

export function startsWithVowelSound(word) {
  const w = String(word).normalize('NFC').toLocaleLowerCase('fr').trim().split(/[\s']/)[0];
  if (!w) return false;
  const c = w[0];
  if (c === 'h') return !inSet(H_ASPIRE, w);
  if (c === 'y') return !inSet(Y_CONSONANT, w);
  return /^[aeiouœæ]/.test(stripDiacritics(c).toLowerCase()) || c === 'œ' || c === 'æ';
}

// Circumflex kept only on the masculine singular (dû, due, dus, dues).
const CIRCUMFLEX_PP = { 'dû': 'du', 'crû': 'cru', 'mû': 'mu', 'redû': 'redu' };

export function agreeParticiple(pp, gender, number) {
  if (gender === 'm' && number === 's') return pp;
  const base = CIRCUMFLEX_PP[pp] ?? pp;
  if (gender === 'f') return number === 'p' ? base + 'es' : base + 'e';
  return /[sx]$/.test(base) ? base : base + 's';
}

const ELIDABLE = new Set(['je', 'me', 'te', 'se', 'le', 'la', 'ne', 'de', 'que', 'ce', 'jusque']);
// Strict usage: these elide only before il(s), elle(s), on, un(e), en.
const RESTRICTED = new Set(['lorsque', 'puisque', 'quoique']);
const RESTRICTED_NEXT = new Set(['il', 'ils', 'elle', 'elles', 'on', 'un', 'une', 'en']);

export function elide(word, next) {
  const tokens = String(word).split(' ');
  const last = tokens[tokens.length - 1];
  const lower = last.toLocaleLowerCase('fr');
  const nextWord = String(next).toLocaleLowerCase('fr').trim().split(/[\s']/)[0];
  let elides = false;
  if (ELIDABLE.has(lower)) elides = startsWithVowelSound(next);
  else if (RESTRICTED.has(lower)) elides = RESTRICTED_NEXT.has(nextWord);
  else if (lower === 'si') elides = nextWord === 'il' || nextWord === 'ils';
  if (!elides) return word + ' ';
  tokens[tokens.length - 1] = last.slice(0, -1) + "'";
  return tokens.join(' ');
}

export function joinElided(word, next) {
  return elide(word, next) + next;
}
