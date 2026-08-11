// One-off script: process real event poster photos (saved by the user from
// Facebook) from C:\Users\roiis\Downloads\bowie into public/assets/posters/.
// These are used purely decoratively in the Past Shows collage/carousel —
// per the user's explicit instruction, NOT linked 1:1 to specific shows in
// shows.json. Verified via fresh-temp-path reads before use.
//
// Usage: node scripts/prepare-past-show-posters.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SOURCE_DIR = 'C:/Users/roiis/Downloads/bowie';
const OUT_DIR = join(REPO_ROOT, 'public/assets/posters');

// Source filename -> destination filename. Verified content this session
// (all 12 are real YADAYADAS show posters).
const POSTER_MAP = {
  '469012635_547217531412301_1963560740513941683_n.jpg': 'poster-nocturno-76-birthday.jpg',
  '475762914_587903097343301_102130723546999159_n.jpg': 'poster-tachanat-ruach.jpg',
  '480652239_600722362728041_982555412537409499_n.jpg': 'poster-traklin.jpg',
  '480813286_603429075790703_5662862433726904279_n.jpg': 'poster-pub-hapara.jpg',
  '480883173_606081048858839_6813560129227290009_n.jpg': 'poster-bella-ciao-jul2024.jpg',
  '481260421_613458811454396_2669600309552774973_n.jpg': 'poster-tassa.jpg',
  '481770157_609252071875070_3180494353288699544_n.jpg': 'poster-beit-hamarzeach.jpg',
  '481814704_611639418303002_874200671520956733_n.jpg': 'poster-ba-be-bar.jpg',
  '483542911_611726464960964_4575425166858969997_n.jpg': 'poster-bar-giyora-stardust.jpg',
  '532976440_729047589895517_908940509962286962_n.jpg': 'poster-babity-valentines.jpg',
  '577482003_796832966450312_6281166994826182901_n.jpg': 'poster-hobbit-bar.jpg',
  '734008820_982400727893534_3336072389950632894_n.jpg': 'poster-bella-ciao-eggroll-tour.jpg',
};

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [srcName, destName] of Object.entries(POSTER_MAP)) {
    const srcPath = join(SOURCE_DIR, srcName);
    const destPath = join(OUT_DIR, destName);
    await sharp(srcPath)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(destPath);
    console.log(`${srcName} -> assets/posters/${destName}`);
  }
  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
