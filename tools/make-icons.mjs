// Generates the app icons as PNGs with Node's zlib only (no dependencies).
// Design: white square, a thick black bar (the exercise's "blank") in the
// lower middle, and an accent-colour caret standing on it. Everything stays
// inside a circle of radius 40 % (the maskable safe zone), so one drawing
// serves every variant. Opaque RGB: no transparency. Usage: npm run icons.

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');
const INK = [0, 0, 0];
const PAPER = [255, 255, 255];
const ACCENT = [0x14, 0x40, 0xff];

// Shapes as fractions of the side: [x0, y0, x1, y1, colour].
const SHAPES = [
  [0.25, 0.60, 0.75, 0.67, INK], // the blank
  [0.33, 0.36, 0.37, 0.57, ACCENT], // caret
];

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
export function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

export function encodePNG(size, pixel) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 3); // filter byte 0
    for (let x = 0; x < size; x++) raw.set(pixel(x, y), row + 1 + x * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export function drawIcon(size) {
  const px = SHAPES.map(([x0, y0, x1, y1, c]) =>
    [Math.round(x0 * size), Math.round(y0 * size), Math.round(x1 * size), Math.round(y1 * size), c]);
  return encodePNG(size, (x, y) => {
    for (const [x0, y0, x1, y1, c] of px) if (x >= x0 && x < x1 && y >= y0 && y < y1) return c;
    return PAPER;
  });
}

const FILES = {
  'icon-192.png': 192,
  'icon-512.png': 512,
  'icon-maskable-512.png': 512,
  'apple-touch-icon.png': 180,
};

mkdirSync(OUT, { recursive: true });
for (const [name, size] of Object.entries(FILES)) {
  const png = drawIcon(size);
  writeFileSync(join(OUT, name), png);
  console.log(`icons/${name}: ${size}×${size}, ${png.length} bytes`);
}
