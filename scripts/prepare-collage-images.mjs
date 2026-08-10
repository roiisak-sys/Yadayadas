// One-off script: process the verified Bowie collage photos from
// C:\Users\roiis\Downloads\bowie into public/assets/bowie/.
//
// Source set was verified by direct sequential visual read in the design
// session (see docs/superpowers/specs/2026-08-11-yadayadas-redesign-design.md
// §4) — do NOT add files to this map without the same verification; the
// earlier OneDrive-sourced version of this folder had an unresolved
// content-mapping bug traced to unreliable cloud-sync reads.
//
// Usage: node scripts/prepare-collage-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SOURCE_DIR = 'C:/Users/roiis/Downloads/bowie';
const OUT_DIR = join(REPO_ROOT, 'public/assets/bowie');

// Filename -> destination filename. Verified content via fresh, uniquely-named
// temp-file copies (bypassing an observed Read-tool image-caching bug where a
// previously-viewed path can render stale content on a later read — this bit
// this exact folder twice in one session; see spec doc "Open Items"/Task 1
// notes). Trust only this mapping, not any earlier in-conversation read.
export const COLLAGE_IMAGE_MAP = {
  '1973_aladdinsane.webp': 'bowie-aladdin-sane.jpg',
  'images (3).jpeg': 'bowie-ziggy-stardust.jpg',
  'images (8).jpeg': 'bowie-live-guitar-scarf.jpg',
  'images (6).jpeg': 'bowie-live-earthling-era.jpg',
  'David_Bowie-06.webp': 'bowie-portrait-stark-bw.jpg',
  '1983-cannes_2445749k.jpg': 'bowie-lets-dance-era-portrait.jpg',
  'GLOBAL-FAP-8X12_scaled-bordered_850.jpg': 'bowie-live-union-jack-coat.jpg',
  'images (5).jpeg': 'bowie-live-bw-profile-mic.jpg',
};

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [srcName, destName] of Object.entries(COLLAGE_IMAGE_MAP)) {
    const srcPath = join(SOURCE_DIR, srcName);
    const destPath = join(OUT_DIR, destName);
    await sharp(srcPath)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(destPath);
    console.log(`${srcName} -> assets/bowie/${destName}`);
  }
  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
