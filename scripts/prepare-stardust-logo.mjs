// One-off script: build the STARDUST logo + favicon from the user-supplied
// wordmark (white distressed lettering on black, 2000x1000 canvas with lots
// of empty padding; star = "A", lightning bolt merged with the final "T").
//
// Source has no alpha (opaque black), so key it with max(R,G,B) as alpha
// (white-on-black — same technique as processLogo() in prepare-band-assets),
// then crop to the lettering so the logo doesn't render tiny inside its own
// padding.
//
// Usage: node scripts/prepare-stardust-logo.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SRC = 'C:/Users/roiis/Downloads/bowie/stardust-logo-source.webp';
const OUT_DIR = join(REPO_ROOT, 'public/assets/logo');

const LO = 12;
const HI = 70;

// Crop box in source coordinates: the lettering (star-A, bolt-T) plus the
// bolt's tip, with a little dust margin. Measured from the 2000x1000 source;
// an automatic bounding box was tried first, but stray dust specks stretched
// it and the sparse bolt tip got cut off.
const CROP = { left: 330, top: 335, width: 1340, height: 415 };
// Dust is cut by the crop, so fade alpha to 0 over this many px along the
// left/top/right edges (not the bottom: the bolt tip reaches it).
const FEATHER = 40;

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      const a = Math.max(0, Math.min(255, Math.round(((max - LO) / (HI - LO)) * 255)));
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = a;
    }
  }

  const { data: logo, info: li } = await sharp(data, { raw: { width, height, channels } })
    .extract(CROP)
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let y = 0; y < li.height; y++) {
    for (let x = 0; x < li.width; x++) {
      const edge = Math.min(x, li.width - 1 - x, y);
      const f = Math.min(1, edge / FEATHER);
      const idx = (y * li.width + x) * li.channels + 3;
      logo[idx] = Math.round(logo[idx] * f);
    }
  }
  await sharp(logo, { raw: { width: li.width, height: li.height, channels: li.channels } })
    .png()
    .toFile(join(OUT_DIR, 'stardust-logo.png'));
  console.log(`logo: -> assets/logo/stardust-logo.png (${li.width}x${li.height})`);

  // Favicon: a clean white five-point star (the logo's "A"). A bolt crop read
  // as a stray "T" at favicon size, and the logo's own star is overlapped by
  // neighbouring letters so it can't be cut out cleanly.
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? 112 : 46;
    const ang = -Math.PI / 2 + (k * Math.PI) / 5;
    pts.push(`${(128 + r * Math.cos(ang)).toFixed(1)},${(136 + r * Math.sin(ang)).toFixed(1)}`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><polygon points="${pts.join(' ')}" fill="#fff"/></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(REPO_ROOT, 'public/favicon.png'));
  console.log('favicon: star -> public/favicon.png');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
