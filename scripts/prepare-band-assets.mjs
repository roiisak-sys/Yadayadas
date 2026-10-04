// One-off script: process band member photos and the hero poster image into
// public/assets/. Sources: C:\Users\roiis\OneDrive\Pictures\band images, plus
// full-path overrides for photos supplied later from Downloads/bowie.
//
// NOTE: the old logo/favicon step that used to live here was removed — it
// wrote the previous YADAYADAS logo and a bolt favicon, and re-running it
// would clobber the STARDUST assets. Logo + favicon + dust layer are now built
// by scripts/prepare-stardust-logo.mjs.
//
// Usage: node scripts/prepare-band-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SOURCE_DIR = 'C:/Users/roiis/OneDrive/Pictures/band images';

// --- Band member portraits -------------------------------------------------
// Filename -> destination filename. Verified by visual read against
// band-members.json instrument/name (photo content matches each member's
// role: Dedi on keys, Gil on drums, Guy on sax, Ron on guitar, Ofer on
// bass, Roi singing/percussion).
//
// Entries that are a full path (contain ":/") live outside the OneDrive
// band-images folder; resolvePhotoSrc() below handles both.
//   - Roi's photo was replaced in a follow-up.
//   - Ron Yona replaced Itzik Galanti on guitar; his photo is a portrait
//     (1333x2000), pre-cropped to the card's 4:5 below.
export const BAND_PHOTO_MAP = {
  'C:/Users/roiis/Downloads/bowie/Gemini_Generated_Image_dqn9zcdqn9zcdqn9.jpeg': 'roi-isak.jpg',
  'guy wittenberg.jpg': 'guy-wittenberg.jpg',
  'gil idan.jpg': 'gil-idan.jpg',
  'DEDI KOVACH.jpg': 'dedi-kovetz.jpg',
  'ofer pal.jpg': 'ofer-pal.jpg',
  'C:/Users/roiis/Downloads/bowie/ron-yona.jpg': 'ron-yona.jpg',
};

// Explicit 4:5 crops (full width, `top` px from the top). The member card
// shows photos at 4:5 with a centred object-fit: cover crop, which on this
// 2:3 portrait would shave ~170px off the top and cut into the head — so the
// crop is chosen here instead: head fully in frame with headroom, and the
// photographer's watermark in the bottom corner falls outside the frame.
const BAND_PHOTO_CROPS = {
  'ron-yona.jpg': { top: 30 },
};

const BAND_OUT_DIR = join(REPO_ROOT, 'public/assets/band');
const HERO_OUT_DIR = join(REPO_ROOT, 'public/assets/hero');

function resolvePhotoSrc(key) {
  return key.includes(':/') ? key : join(SOURCE_DIR, key);
}

async function processBandPhotos() {
  mkdirSync(BAND_OUT_DIR, { recursive: true });
  for (const [srcKey, destName] of Object.entries(BAND_PHOTO_MAP)) {
    const srcPath = resolvePhotoSrc(srcKey);
    const destPath = join(BAND_OUT_DIR, destName);
    let pipeline = sharp(srcPath).rotate();
    const crop = BAND_PHOTO_CROPS[destName];
    if (crop) {
      const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
      pipeline = sharp(data).extract({
        left: 0,
        top: crop.top,
        width: info.width,
        height: Math.round((info.width * 5) / 4),
      });
    }
    await pipeline
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(destPath);
    console.log(`band photo: ${srcKey.split('/').pop()} -> assets/band/${destName}`);
  }
}

async function processHeroImage() {
  mkdirSync(HERO_OUT_DIR, { recursive: true });
  const destPath = join(HERO_OUT_DIR, 'hero-band-live.jpg');
  await sharp(join(SOURCE_DIR, 'HERO IMAGE.JPG'))
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(destPath);
  console.log('hero image: HERO IMAGE.JPG -> assets/hero/hero-band-live.jpg');
}

async function main() {
  await processBandPhotos();
  await processHeroImage();
  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
