// One-off script: process the official BOWIE wordmark logo (red, lightning-
// bolt underline) from C:\Users\roiis\Downloads\bowie into public/assets/bowie/.
//
// CORRECTION (see chat history): the source file's background was verified
// via raw pixel inspection to be solid opaque white (255,255,255), not
// transparent as first assumed from a visual glance. Background removal
// uses a min(R,G,B) chroma key rather than the max-channel key used for the
// black-background YADAYADAS logo elsewhere in this repo, because here the
// background is white/bright and the foreground (red) is NOT a pure
// grayscale-luminance case (red has a full-brightness R channel same as
// white) — min(R,G,B) correctly separates them since white has min=255,
// red has min=0.
//
// Usage: node scripts/prepare-bowie-logo.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SRC = 'C:/Users/roiis/Downloads/bowie/bowie watermark.png';
const OUT_DIR = join(REPO_ROOT, 'public/assets/bowie');

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const img = sharp(SRC).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const LO = 60; // min(R,G,B) below this -> fully opaque (real logo color)
  const HI = 200; // min(R,G,B) above this -> fully transparent (white bg)
  for (let i = 0; i < data.length; i += info.channels) {
    const minChannel = Math.min(data[i], data[i + 1], data[i + 2]);
    const alpha = 255 - Math.max(0, Math.min(255, Math.round(((minChannel - LO) / (HI - LO)) * 255)));
    data[i + 3] = alpha;
  }

  const destPath = join(OUT_DIR, 'bowie-wordmark.png');
  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .resize({ width: 800, withoutEnlargement: true })
    .png()
    .toFile(destPath);
  console.log('bowie watermark.png -> assets/bowie/bowie-wordmark.png (background removed)');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
