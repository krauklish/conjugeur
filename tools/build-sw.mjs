// Regenerates VERSION and PRECACHE in sw.js from the files on disk.
// Usage: npm run sw. Idempotent.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SW_PATH = join(ROOT, 'sw.js');
const ROOT_FILES = ['index.html', 'manifest.webmanifest'];
const DIRS = ['css', 'js', 'icons'];
const START = '// <generated>';
const END = '// </generated>';

function walk(dir, rel) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => !d.name.startsWith('.'))
    .flatMap((d) => (d.isDirectory()
      ? walk(join(dir, d.name), `${rel}/${d.name}`)
      : [`${rel}/${d.name}`]));
}

// Precached files (relative paths, sorted), without './'.
export function listFiles(root = ROOT) {
  return [...ROOT_FILES, ...DIRS.flatMap((d) => walk(join(root, d), d))].sort();
}

// Short SHA-256 over every path and its content.
export function computeVersion(files, root = ROOT) {
  const h = createHash('sha256');
  for (const f of files) {
    h.update(f); h.update('\0');
    h.update(readFileSync(join(root, f))); h.update('\0');
  }
  return h.digest('hex').slice(0, 12);
}

export function renderConstants(version, files) {
  const list = ['./', ...files].map((f) => `  '${f}',`).join('\n');
  return `${START}\nconst VERSION = '${version}';\nconst PRECACHE = [\n${list}\n];\n${END}`;
}

// Replaces the generated block in sw.js source text.
export function rewrite(source, block) {
  const a = source.indexOf(START);
  const b = source.indexOf(END);
  if (a < 0 || b < a) throw new Error('sw.js: generated markers not found');
  return source.slice(0, a) + block + source.slice(b + END.length);
}

// Reads VERSION and PRECACHE back out of sw.js source text.
export function parseConstants(source) {
  const version = /const VERSION = '([^']*)';/.exec(source)?.[1];
  const body = /const PRECACHE = \[([\s\S]*?)\];/.exec(source)?.[1] ?? '';
  const precache = [...body.matchAll(/'([^']*)'/g)].map((m) => m[1]);
  return { version, precache };
}

export function expected(root = ROOT) {
  const files = listFiles(root);
  return { version: computeVersion(files, root), files };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { version, files } = expected();
  const src = readFileSync(SW_PATH, 'utf8');
  const out = rewrite(src, renderConstants(version, files));
  if (out !== src) writeFileSync(SW_PATH, out);
  console.log(`sw.js: VERSION ${version}, ${files.length + 1} URLs${out === src ? ' (unchanged)' : ''}`);
}
