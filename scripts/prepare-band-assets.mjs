// One-off script: process new band member photos, hero image, and logo
// from C:\Users\roiis\OneDrive\Pictures\band images into public/assets/.
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
// role: Dedi on keys, Gil on drums, Guy on sax, Itzik on guitar, Ofer on
// bass, Roi singing/percussion).
export const BAND_PHOTO_MAP = {
  'ROI ISAK.jpg': 'roi-isak.jpg',
  'guy wittenberg.jpg': 'guy-wittenberg.jpg',
  'gil idan.jpg': 'gil-idan.jpg',
  'DEDI KOVACH.jpg': 'dedi-kovetz.jpg',
  'ofer pal.jpg': 'ofer-pal.jpg',
  'itsik galanti.jpg': 'itzik-galanti.jpg',
};

const BAND_OUT_DIR = join(REPO_ROOT, 'public/assets/band');
const HERO_OUT_DIR = join(REPO_ROOT, 'public/assets/hero');
const LOGO_OUT_DIR = join(REPO_ROOT, 'public/assets/logo');

async function processBandPhotos() {
  mkdirSync(BAND_OUT_DIR, { recursive: true });
  for (const [srcName, destName] of Object.entries(BAND_PHOTO_MAP)) {
    const srcPath = join(SOURCE_DIR, srcName);
    const destPath = join(BAND_OUT_DIR, destName);
    await sharp(srcPath)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(destPath);
    console.log(`band photo: ${srcName} -> assets/band/${destName}`);
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

// --- Logo: remove solid-black background, output transparent PNG ----------
// LOGO.png source has no alpha channel (verified: hasAlpha=false), just a
// pure-black (0,0,0) background behind white/orange artwork. Luminance
// histogram is cleanly bimodal (background at 0, artwork at 225-255), so a
// simple max-channel alpha key with a soft edge band is sufficient — no
// AI background-removal tool needed for this asset.
async function processLogo() {
  mkdirSync(LOGO_OUT_DIR, { recursive: true });
  const srcPath = join(SOURCE_DIR, 'LOGO.png');
  const img = sharp(srcPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const LO = 12;
  const HI = 55;
  for (let i = 0; i < data.length; i += info.channels) {
    const maxChannel = Math.max(data[i], data[i + 1], data[i + 2]);
    const alpha = Math.max(0, Math.min(255, Math.round(((maxChannel - LO) / (HI - LO)) * 255)));
    data[i + 3] = alpha;
  }

  const destPath = join(LOGO_OUT_DIR, 'yadayadas-logo.png');
  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toFile(destPath);
  console.log('logo: LOGO.png -> assets/logo/yadayadas-logo.png (background removed)');

  // Favicon: crop to the lightning bolt mark (right portion of the wordmark),
  // which reads more clearly than the full wordmark at favicon sizes.
  const boltCrop = {
    left: Math.floor(info.width * 0.87),
    top: 0,
    width: info.width - Math.floor(info.width * 0.87),
    height: info.height,
  };
  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .extract(boltCrop)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(REPO_ROOT, 'public/favicon.png'));
  console.log('favicon: cropped bolt -> public/favicon.png');
}

async function main() {
  await processBandPhotos();
  await processHeroImage();
  await processLogo();
  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
