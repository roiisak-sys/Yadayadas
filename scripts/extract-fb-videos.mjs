import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const DEFAULT_ZIP_PATH =
  'C:\\Users\\roiis\\Downloads\\facebook-YadayadasIL-09_08_2026-1ldiFay8.zip';

const FB_PREFIX = "this_profile's_activity_across_facebook/posts/media/videos/";

// Map of { <exact zip-internal source path> : <output filename in public/assets/video/> }.
// The ID below was confirmed by structurally parsing profile_posts_1.html for the Aug 9, 2026
// "Under Pressure" live video post and reading its <video src="..."> attribute directly.
export const SELECTED_VIDEOS = {
  [`${FB_PREFIX}1722341842302100.mp4`]: 'under-pressure.mp4',
};

export function buildOutputFilename(sourcePath, selectionMap) {
  return selectionMap[sourcePath] ?? null;
}

function main() {
  const zipPath = process.argv[2] ?? DEFAULT_ZIP_PATH;
  if (!existsSync(zipPath)) {
    console.error(`Zip not found at ${zipPath}. Pass the path as the first argument.`);
    process.exit(1);
  }

  const outDir = join(PROJECT_ROOT, 'public', 'assets', 'video');
  mkdirSync(outDir, { recursive: true });

  const zip = new AdmZip(zipPath);

  for (const [sourcePath, outputName] of Object.entries(SELECTED_VIDEOS)) {
    const entry = zip.getEntry(sourcePath);
    if (!entry) {
      console.warn(`Entry not found in zip: ${sourcePath} — skipping ${outputName}.`);
      continue;
    }
    const outputPath = join(outDir, outputName);
    console.log(`Extracting ${sourcePath} -> ${outputPath}`);
    writeFileSync(outputPath, entry.getData());
  }

  console.log('Done. Remember to compress large clips (H.264, web-reasonable bitrate) before deploying.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
