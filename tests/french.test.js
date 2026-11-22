import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAnswer, stripDiacritics, startsWithVowelSound, agreeParticiple, elide, joinElided, H_ASPIRE,
} from '../js/core/french.js';

test('normalizeAnswer', () => {
  assert.equal(normalizeAnswer('  J’AI   Été  '), "j'ai été");
  assert.equal(normalizeAnswer("j ' ai"), "j'ai");
  assert.equal(normalizeAnswer('qu‘il ʼa'), "qu'il'a");
  assert.equal(normalizeAnswer('ÉTÉ'), 'été'); // NFD input
  assert.equal(normalizeAnswer('sont\tallées\n'), 'sont allées');
  assert.equal(normalizeAnswer('ÇA'), 'ça');
});

test('stripDiacritics', () => {
  assert.equal(stripDiacritics('été çà où île âme'), 'ete ca ou ile ame');
  assert.equal(stripDiacritics('cœur Œuvre æ'), 'coeur OEuvre ae');
  assert.equal(stripDiacritics('naïf dû'), 'naif du');
});

test('startsWithVowelSound', () => {
  for (const w of ['ai', 'est', 'Été', 'île', 'ouvre', 'usine', 'œuvre', 'âme', 'homme', 'hiver', 'habite', 'y', 'yeux', 'Ils'])
    assert.equal(startsWithVowelSound(w), true, w);
  for (const w of ['vais', 'tu', 'héros', 'haïr', 'hais', 'Haut', 'hautes', 'huit', 'hall', 'hors', 'yaourt', 'yoga', 'yachts', ''])
    assert.equal(startsWithVowelSound(w), false, w);
  assert.ok(H_ASPIRE.has('hibou'));
});

test('agreeParticiple', () => {
  const all = (pp) => [['m', 's'], ['f', 's'], ['m', 'p'], ['f', 'p']].map(([g, n]) => agreeParticiple(pp, g, n));
  assert.deepEqual(all('allé'), ['allé', 'allée', 'allés', 'allées']);
  assert.deepEqual(all('venu'), ['venu', 'venue', 'venus', 'venues']);
  assert.deepEqual(all('pris'), ['pris', 'prise', 'pris', 'prises']);
  assert.deepEqual(all('mis'), ['mis', 'mise', 'mis', 'mises']);
  assert.deepEqual(all('dû'), ['dû', 'due', 'dus', 'dues']);
  assert.deepEqual(all('crû'), ['crû', 'crue', 'crus', 'crues']);
  assert.deepEqual(all('mû'), ['mû', 'mue', 'mus', 'mues']);
  assert.deepEqual(all('redû'), ['redû', 'redue', 'redus', 'redues']);
});

test('elide: monosyllables', () => {
  assert.equal(elide('je', 'ai') + 'ai', "j'ai");
  assert.equal(elide('je', 'vais') + 'vais', 'je vais');
  assert.equal(elide('Je', 'ai'), "J'");
  for (const w of ['me', 'te', 'se', 'le', 'la', 'ne', 'de', 'que', 'ce'])
    assert.equal(elide(w, 'est'), w.slice(0, -1) + "'", w);
  assert.equal(joinElided('je', 'hais'), 'je hais');
  assert.equal(joinElided('je', 'habite'), "j'habite");
  assert.equal(joinElided('le', 'héros'), 'le héros');
  assert.equal(joinElided('je', 'y'), "j'y");
  assert.equal(joinElided('le', 'yaourt'), 'le yaourt');
});

test('elide: que compounds', () => {
  assert.equal(joinElided('jusque', 'à'), "jusqu'à");
  assert.equal(joinElided('bien que', 'il'), "bien qu'il");
  assert.equal(joinElided('parce que', 'elle'), "parce qu'elle");
  assert.equal(joinElided('avant que', 'on'), "avant qu'on");
  assert.equal(joinElided('bien que', 'tu'), 'bien que tu');
  assert.equal(joinElided('Bien que', 'il'), "Bien qu'il");
  for (const w of ['lorsque', 'puisque', 'quoique']) {
    for (const n of ['il', 'ils', 'elle', 'elles', 'on', 'un', 'une', 'en']) assert.equal(elide(w, n), w.slice(0, -1) + "'");
    assert.equal(elide(w, 'avec'), w + ' ');
    assert.equal(elide(w, 'tu'), w + ' ');
  }
});

test('elide: si and non-elidable', () => {
  assert.equal(joinElided('si', 'il'), "s'il");
  assert.equal(joinElided('si', 'ils'), "s'ils");
  assert.equal(joinElided('si', 'elle'), 'si elle');
  assert.equal(joinElided('si', 'on'), 'si on');
  assert.equal(joinElided('tu', 'as'), 'tu as');
  assert.equal(joinElided('nous', 'avons'), 'nous avons');
  assert.equal(joinElided('il', 'a'), 'il a');
});
