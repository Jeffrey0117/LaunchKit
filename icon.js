// Dynamic apple-touch-icon renderer — 180x180 PNG, themed per page.
// Pure Node (zlib only). Full-bleed primary square + white rocket + accent flame;
// iOS rounds the corners itself. Results are cached by color pair.
const zlib = require('zlib');

const SIZE = 180;
const cache = new Map();

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const tb = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(Buffer.concat([tb, data])), 0);
  return Buffer.concat([len, tb, data, crc]);
}

// Normalize "#6366f1" | "6366f1" | "63f" -> [r,g,b], or null if invalid.
function parseHex(input, fallback) {
  let h = String(input || '').replace(/^#/, '').trim();
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) h = fallback;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function inTri(px, py, [a, b, c]) {
  const s = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]);
  const d1 = s([px, py], a, b), d2 = s([px, py], b, c), d3 = s([px, py], c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

// rocket glyph (normalized 0..1)
const BODY = [[0.5, 0.24], [0.32, 0.66], [0.68, 0.66]];
const FIN_L = [[0.32, 0.56], [0.22, 0.72], [0.40, 0.66]];
const FIN_R = [[0.68, 0.56], [0.78, 0.72], [0.60, 0.66]];
const FLAME = [[0.42, 0.66], [0.5, 0.84], [0.58, 0.66]];
const WIN = { x: 0.5, y: 0.45, r: 0.075 };

function renderTouchIcon(primary, accent) {
  const [pr, pg, pb] = parseHex(primary, '6366f1');
  const [ar, ag, ab] = parseHex(accent, 'f59e0b');
  const key = `${pr},${pg},${pb}-${ar},${ag},${ab}`;
  if (cache.has(key)) return cache.get(key);

  const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
  let o = 0;
  for (let y = 0; y < SIZE; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < SIZE; x++) {
      const nx = (x + 0.5) / SIZE, ny = (y + 0.5) / SIZE;
      let r = pr, g = pg, b = pb;
      const white = inTri(nx, ny, BODY) || inTri(nx, ny, FIN_L) || inTri(nx, ny, FIN_R);
      if (white) { r = 255; g = 255; b = 255; }
      if (inTri(nx, ny, FLAME)) { r = ar; g = ag; b = ab; }
      const dx = nx - WIN.x, dy = ny - WIN.y;
      if (white && dx * dx + dy * dy <= WIN.r * WIN.r) { r = pr; g = pg; b = pb; }
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  cache.set(key, png);
  return png;
}

module.exports = { renderTouchIcon };
