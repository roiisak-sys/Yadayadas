// One-off script: process the official BOWIE wordmark logo (red, lightning-
// bolt underline) from C:\Users\roiis\Downloads\bowie into public/assets/bowie/.
// Source already has a proper alpha channel (via PNG palette transparency),
// verified via fresh-temp-path read before use — see chat history around
// 2026-08-11 for the verification. Already tightly cropped to content, no
// trim needed.
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
  const destPath = join(OUT_DIR, 'bowie-wordmark.png');
  await sharp(SRC).ensureAlpha().resize({ width: 800, withoutEnlargement: true }).png().toFile(destPath);
  console.log(`bowie watermark.png -> assets/bowie/bowie-wordmark.png`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
