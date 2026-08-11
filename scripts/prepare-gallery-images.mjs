// One-off script: process real band photography for the new BandGallery
// section from C:\Users\roiis\OneDrive\Pictures\band images into
// public/assets/gallery/. Re-crops individual member shots differently
// than their Band Members section usage (tighter/closer) so the gallery
// doesn't repeat the exact same images back-to-back with that section.
//
// Usage: node scripts/prepare-gallery-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SOURCE_DIR = 'C:/Users/roiis/OneDrive/Pictures/band images';
const OUT_DIR = join(REPO_ROOT, 'public/assets/gallery');

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // Dominant image: full band on stage, blue/yellow stage light, crowd
  // silhouettes in foreground. Verified content this session.
  await sharp(join(SOURCE_DIR, 'ebbbddb8-a363-4189-a243-c9de0d54d7c9.jpg'))
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(OUT_DIR, 'gallery-dominant-full-band.jpg'));
  console.log('dominant: ebbbddb8... -> gallery-dominant-full-band.jpg');

  // Supporting crops: same source photos as Band Members, but cropped
  // tighter (closer to the performer, less surrounding stage) so they
  // read as a distinct set, not a repeat.
  const supportingCrops = [
    { src: 'ROI ISAK.jpg', dest: 'gallery-roi-isak-crop.jpg' },
    { src: 'itsik galanti.jpg', dest: 'gallery-itzik-galanti-crop.jpg' },
    { src: 'gil idan.jpg', dest: 'gallery-gil-idan-crop.jpg' },
  ];
  for (const { src, dest } of supportingCrops) {
    await sharp(join(SOURCE_DIR, src))
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(join(OUT_DIR, dest));
    console.log(`supporting: ${src} -> ${dest}`);
  }

  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
