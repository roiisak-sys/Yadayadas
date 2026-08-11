// One-off script: process real event poster photos (saved by the user from
// Facebook) from C:\Users\roiis\Downloads\bowie into public/assets/posters/.
// These are used purely decoratively in the Past Shows collage — per the
// user's explicit instruction, NOT linked 1:1 to specific shows in
// shows.json.
//
// CORRECTION (2nd pass): three of these were originally saved as tiny
// Facebook thumbnails (4-7KB, some as small as 168x112) and have since been
// re-saved by the user at full resolution (~960px). Reprocessed from the
// new source files. Two posters that were never re-saved at higher
// resolution (nocturno-76-birthday, 168x112px; tachanat-ruach, source file
// no longer exists in the folder) are dropped entirely rather than shipping
// a blurry thumbnail — this is a decorative-only collage with no fixed
// count, so removing a couple of unfixable low-res entries is the right
// call over displaying something that doesn't meet "sharp and high
// quality." One new poster (mishmarot) was also added.
//
// Usage: node scripts/prepare-past-show-posters.mjs
import sharp from 'sharp';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SOURCE_DIR = 'C:/Users/roiis/Downloads/bowie';
const OUT_DIR = join(REPO_ROOT, 'public/assets/posters');

// Source filename -> destination filename. Verified content this session
// (all real YADAYADAS show posters). Dropped: 469012635 (nocturno, 168x112,
// no replacement provided), 475762914 (tachanat-ruach, source file deleted).
const POSTER_MAP = {
  '480652239_600722362728041_982555412537409499_n.jpg': 'poster-traklin.jpg',
  '480813286_603429075790703_5662862433726904279_n.jpg': 'poster-pub-hapara.jpg',
  '480883173_606081048858839_6813560129227290009_n.jpg': 'poster-bella-ciao-jul2024.jpg',
  '481260421_613458811454396_2669600309552774973_n.jpg': 'poster-tassa.jpg',
  '481346621_604455942354683_2638411520024136163_n.jpg': 'poster-mishmarot.jpg',
  '481770157_609252071875070_3180494353288699544_n.jpg': 'poster-beit-hamarzeach.jpg',
  '481814704_611639418303002_874200671520956733_n.jpg': 'poster-ba-be-bar.jpg',
  '483542911_611726464960964_4575425166858969997_n.jpg': 'poster-bar-giyora-stardust.jpg',
  '532976440_729047589895517_908940509962286962_n.jpg': 'poster-babity-valentines.jpg',
  '577482003_796832966450312_6281166994826182901_n.jpg': 'poster-hobbit-bar.jpg',
  '734008820_982400727893534_3336072389950632894_n.jpg': 'poster-bella-ciao-eggroll-tour.jpg',
};

async function main() {
  if (existsSync(OUT_DIR)) {
    rmSync(OUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [srcName, destName] of Object.entries(POSTER_MAP)) {
    const srcPath = join(SOURCE_DIR, srcName);
    const destPath = join(OUT_DIR, destName);
    await sharp(srcPath)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(destPath);
    console.log(`${srcName} -> assets/posters/${destName}`);
  }
  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
