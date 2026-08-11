// One-off script: process real band photography for the BandGallery section
// from C:\Users\roiis\OneDrive\Pictures\band images and
// C:\Users\roiis\Downloads\bowie into public/assets/gallery/.
//
// UPDATE (4th pass): "use all of them, and remove what's no longer there."
// The user replaced/removed several source photos since the last pass and
// added 2 new ones. This pass re-scanned both source folders and uses
// every genuine band photo currently present (13 total) — excluding only
// (a) event poster images (the Facebook-CDN-style `NNNNN..._n.jpg` files,
// already used as concert posters elsewhere, not band photos) and (b)
// pure David Bowie archival/reference photos (used for the Hero/Collage
// sections, not photos of YADAYADAS). Verified each candidate individually
// (fresh reads) before including it.
//
// IMG_5348.heic needed a one-time pre-conversion: the installed sharp/
// libvips build can read this file's metadata but has no HEVC decode
// plugin, so `sharp(...).toFile()` fails on it directly. Converted once via
// Windows' built-in WPF BitmapDecoder (PresentationCore, which uses the OS
// HEIF codec) to a full-resolution JPEG, then fed that JPEG through the
// same sharp pipeline as everything else below.
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
  // Dominant (2x2) cell — sharp, close backstage group shot, all 6 members,
  // strongest "personality + connection" photo in the current set. Source
  // is the pre-converted JPEG (see file header) since sharp can't decode
  // the original .heic directly.
  {
    src: 'C:/Users/roiis/AppData/Local/Temp/claude/C--GIT-Portfolio/94ddcd26-06c7-470f-96f3-fb00c1ba91b7/scratchpad/img5348-preview.jpg',
    dest: 'gallery-band-01.jpg',
    width: 2000,
  },
  // Full band, live: wide stage shot with audience + dramatic light burst.
  {
    src: 'C:/Users/roiis/Downloads/bowie/4A2465BA-4BBC-49D9-9CFD-785CE3301997.jpg',
    dest: 'gallery-band-02.jpg',
    width: 1600,
  },
  // Full band, live: outdoor B&W under trees, unique setting.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_9593.JPG',
    dest: 'gallery-band-03.jpg',
    width: 1600,
  },
  // Full band, live: outdoor grass stage, warm evening light.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_5396.JPG',
    dest: 'gallery-band-04.jpg',
    width: 1600,
  },
  // Full band, live: colorful stage lighting (green/blue crossed beams).
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_7165.JPG',
    dest: 'gallery-band-05.jpg',
    width: 1600,
  },
  // Live: violinist, singer, guitarist with a large Bowie image projected
  // behind them — strong "visual identity" shot.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_7879.JPG',
    dest: 'gallery-band-06.jpg',
    width: 1600,
  },
  // Full band, backstage candid on a couch — personality/fun.
  {
    src: 'C:/Users/roiis/Downloads/bowie/0a5b5357-e459-4f45-9878-83edf44437de.jpg',
    dest: 'gallery-band-07.jpg',
    width: 1600,
  },
  // Full band, candid selfie in an elevator after a show — personality.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_1648.JPG',
    dest: 'gallery-band-08.jpg',
    width: 1600,
  },
  // Trio, live: two singers + guitarist mid-song — connection/performance.
  {
    src: 'C:/Users/roiis/Downloads/bowie/b14b71d8-048c-4366-acef-3faa35d30b80.jpg',
    dest: 'gallery-band-09.jpg',
    width: 1600,
  },
  // Duo: bassist + singer in full Bowie face paint — ties directly into the
  // site's personas theme, strong "visual identity" shot.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_9334.JPG',
    dest: 'gallery-band-10.jpg',
    width: 1600,
  },
  // Duo, live: violinist + singer close performance moment — musicianship.
  {
    src: 'C:/Users/roiis/Downloads/bowie/IMG_1215.JPG',
    dest: 'gallery-band-11.jpg',
    width: 1600,
  },
  // Duo, live: acoustic guitarist + singer.
  {
    src: 'C:/Users/roiis/Downloads/bowie/f0c046ad-4d2c-4e2d-bb50-a4f38f937011.jpg',
    dest: 'gallery-band-12.jpg',
    width: 1600,
  },
  // Solo, live: dramatic performance shot (YDH Photography).
  {
    src: 'C:/Users/roiis/Downloads/bowie/c32006a7-0ad7-4b2d-8ba1-710c57062899.jpg',
    dest: 'gallery-band-13.jpg',
    width: 1600,
  },
];

async function main() {
  // Clean out the previous set first, so removed source photos don't leave
  // stale output files behind.
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
