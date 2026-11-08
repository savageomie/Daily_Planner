import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Simple solid color PNG with rounded center checkmark
  const bytesPerPixel = 4;
  const rowBytes = width * bytesPerPixel;
  const rawData = Buffer.alloc(height * (rowBytes + 1));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0: None
    for (let x = 0; x < width; x++) {
      // Background indigo (#4f46e5 = 79, 70, 229)
      let pr = r;
      let pg = g;
      let pb = b;
      let pa = 255;

      // Draw rounded center white circle / checkmark motif
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      const radius = width * 0.38;

      if (Math.abs(dist - radius) < width * 0.035) {
        // Subtle outer orbit
        pr = 165; pg = 180; pb = 252;
      }

      // Checkmark geometry
      // Segment 1: from (0.35, 0.50) to (0.45, 0.65)
      // Segment 2: from (0.45, 0.65) to (0.68, 0.38)
      const u = x / width;
      const v = y / height;

      // Line distance check
      function distToSegment(px, py, x1, y1, x2, y2) {
        const l2 = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
        if (l2 === 0) return Math.hypot(px-x1, py-y1);
        let t = ((px-x1)*(x2-x1) + (py-y1)*(y2-y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t*(x2-x1)), py - (y1 + t*(y2-y1)));
      }

      const d1 = distToSegment(u, v, 0.32, 0.51, 0.45, 0.64);
      const d2 = distToSegment(u, v, 0.45, 0.64, 0.68, 0.38);
      const checkDist = Math.min(d1, d2);

      if (checkDist < 0.04) {
        pr = 255; pg = 255; pb = 255;
      }

      rawData[offset++] = pr;
      rawData[offset++] = pg;
      rawData[offset++] = pb;
      rawData[offset++] = pa;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC32
    let c = 0xffffffff;
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      let curr = n;
      for (let k = 0; k < 8; k++) {
        curr = (curr & 1) ? 0xedb88320 ^ (curr >>> 1) : curr >>> 1;
      }
      crcTable[n] = curr;
    }
    for (let i = 4; i < 8 + len; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    buf.writeInt32BE((c ^ 0xffffffff) | 0, 8 + len);
    return buf;
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 79, 70, 229));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 79, 70, 229));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 79, 70, 229));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 79, 70, 229));
console.log('PNG icon assets generated successfully in public/');
