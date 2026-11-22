import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SW_PATH, expected, parseConstants, renderConstants, rewrite,
} from '../tools/build-sw.mjs';

const src = readFileSync(SW_PATH, 'utf8');
const actual = parseConstants(src);
const want = expected();

test('sw.js PRECACHE matches the files on disk', () => {
  assert.deepEqual(actual.precache, ['./', ...want.files],
    'sw.js PRECACHE is stale: run `npm run sw`');
});

test('sw.js VERSION matches the content hash', () => {
  assert.equal(actual.version, want.version, 'sw.js VERSION is stale: run `npm run sw`');
});

test('render step is idempotent', () => {
  const block = renderConstants(want.version, want.files);
  const once = rewrite(src, block);
  assert.equal(rewrite(once, block), once);
  assert.deepEqual(parseConstants(once).precache, ['./', ...want.files]);
});

test('every PRECACHE entry is a relative URL', () => {
  for (const u of actual.precache) {
    assert.ok(!u.startsWith('/') && !/^[a-z]+:/i.test(u), `not relative: ${u}`);
  }
  assert.ok(!actual.precache.includes('sw.js'));
  assert.ok(actual.precache.includes('index.html'));
});
