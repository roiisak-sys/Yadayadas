// One-off script: process real band photography for the BandGallery section
// from C:\Users\roiis\OneDrive\Pictures\band images and
// C:\Users\roiis\Downloads\bowie into public/assets/gallery/.
//
// CORRECTION: an earlier version of this script mixed in individual member
// crops. Per explicit follow-up instruction, this section must contain ONLY
// full-band photos — no individual portraits, no single-member focus. All 5
// images below were verified (fresh-temp-path reads) to show the whole band
// together on stage.
//
// Usage: node scripts/prepare-gallery-images.mjs
import sharp from 'sharp';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const OUT_DIR = join(REPO_ROOT, 'public/assets/gallery');

const IMAGES = [
  {
    src: 'C:/Users/roiis/OneDrive/Pictures/band images/ebbbddb8-a363-4189-a243-c9de0d54d7c9.jpg',
    dest: 'gallery-full-band-01.jpg',
    width: 2000,
  },
  {
    src: 'C:/Users/roiis/Downloads/bowie/4A2465BA-4BBC-49D9-9CFD-785CE3301997.jpg',
    dest: 'gallery-full-band-02.jpg',
    width: 2000,
  },
  {
    src: 'C:/Users/roiis/Downloads/bowie/e9a98e4f-e80e-4737-a23b-675f28842995.jpg',
    dest: 'gallery-full-band-03.jpg',
    width: 1600,
  },
  {
    src: 'C:/Users/roiis/Downloads/bowie/3d84f8cf-26cc-4ca7-b180-7171498808ba.jpg',
    dest: 'gallery-full-band-04.jpg',
    width: 1600,
  },
  {
    src: 'C:/Users/roiis/Downloads/bowie/8182ff45-fd55-4ff6-92d6-d8529a0b7d49.jpg',
    dest: 'gallery-full-band-05.jpg',
    width: 1600,
  },
];

async function main() {
  // Clean out the old (individual-crop-containing) set first.
  if (existsSync(OUT_DIR)) {
    rmSync(OUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUT_DIR, { recursive: true });

  for (const { src, dest, width } of IMAGES) {
    await sharp(src)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(join(OUT_DIR, dest));
    console.log(`${src.split('/').pop()} -> gallery/${dest}`);
  }
  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
