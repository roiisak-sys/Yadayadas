// One-off script: process real band photography for the BandGallery section
// from C:\Users\roiis\OneDrive\Pictures\band images and
// C:\Users\roiis\Downloads\bowie into public/assets/gallery/.
//
// UPDATE (3rd pass): expanded from 5 to 10 photos per explicit follow-up
// instruction ("add more photos of the band not only with all — make it
// 9-10"), which relaxes the earlier full-band-only rule. The set now mixes
// full-band shots (still the majority, for band identity) with a few
// duo/solo/trio performance moments that read as strong "personality" or
// "rock 'n' roll" images on their own — verified individually (fresh reads)
// against the "live energy / connection / personality / performance /
// visual identity" brief, and checked against each other to avoid
// near-duplicate shots. Renamed gallery-full-band-NN.jpg -> gallery-band-NN
// since not every image is a full-band shot anymore.
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
  // Dominant (2x2) cell — sharp backstage group shot, all 6 members, best
  // overall "connection + personality" photo of the whole pool.
  {
    src: 'C:/Users/roiis/Downloads/bowie/5R1A5638.jpeg',
    dest: 'gallery-band-01.jpg',
    width: 2000,
  },
  // Full band, live: wide stage shot with audience + dramatic light burst.
  {
    src: 'C:/Users/roiis/Downloads/bowie/4A2465BA-4BBC-49D9-9CFD-785CE3301997.jpg',
    dest: 'gallery-band-02.jpg',
    width: 1600,
  },
  // Full band, live: B&W, huge Bowie image projected behind the band.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_9486.JPG',
    dest: 'gallery-band-03.jpg',
    width: 1600,
  },
  // Full band: post-show curtain-call line-up, arms linked.
  {
    src: 'C:/Users/roiis/Downloads/bowie/3d84f8cf-26cc-4ca7-b180-7171498808ba.jpg',
    dest: 'gallery-band-04.jpg',
    width: 1600,
  },
  // Full band, live: outdoor B&W under trees, unique setting.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_9593.JPG',
    dest: 'gallery-band-05.jpg',
    width: 1600,
  },
  // Duo: bassist + singer in full Bowie face paint — ties directly into the
  // site's personas theme, strong "visual identity" shot.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_9334.JPG',
    dest: 'gallery-band-06.jpg',
    width: 1600,
  },
  // Solo, live: singer mid-performance, dramatic lighting, Bowie-graphic
  // shirt — strong "rock 'n' roll / performance" energy.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_9458.JPG',
    dest: 'gallery-band-07.jpg',
    width: 1600,
  },
  // Duo, live: violinist + singer close performance moment — musicianship.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_1215.JPG',
    dest: 'gallery-band-08.jpg',
    width: 1600,
  },
  // Trio, live: two singers + guitarist mid-song — connection/performance.
  {
    src: 'C:/Users/roiis/Downloads/bowie/b14b71d8-048c-4366-acef-3faa35d30b80.jpg',
    dest: 'gallery-band-09.jpg',
    width: 1600,
  },
  // Full band, backstage candid on a couch — personality/fun.
  {
    src: 'C:/Users/roiis/Downloads/bowie/0a5b5357-e459-4f45-9878-83edf44437de.jpg',
    dest: 'gallery-band-10.jpg',
    width: 1600,
  },
];

async function main() {
  // Clean out the old 5-photo set first.
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
