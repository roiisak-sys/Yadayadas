import AdmZip from 'adm-zip';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

ffmpeg.setFfmpegPath(ffmpegPath);

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

// The raw extracted clip is a multi-minute live recording, but it's used as a looping,
// full-bleed atmospheric background behind a section that's only in view for a few seconds
// of scroll. Trim to a short, representative loop and re-encode at a web-appropriate bitrate
// instead of shipping the full multi-minute/multi-megabyte original.
const TRIM_START_SECONDS = 30; // skip past likely stage-setup/count-in at the very start
const TRIM_DURATION_SECONDS = 12;
const OUTPUT_VIDEO_BITRATE = '800k';

export function buildOutputFilename(sourcePath, selectionMap) {
  return selectionMap[sourcePath] ?? null;
}

function trimAndCompress(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(TRIM_START_SECONDS)
      .duration(TRIM_DURATION_SECONDS)
      .videoCodec('libx264')
      .videoBitrate(OUTPUT_VIDEO_BITRATE)
      .noAudio()
      .outputOptions(['-preset veryfast', '-movflags +faststart'])
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

async function main() {
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
    const rawPath = `${outputPath}.raw.mp4`;
    console.log(`Extracting ${sourcePath} -> ${rawPath}`);
    writeFileSync(rawPath, entry.getData());

    console.log(
      `Trimming to a ${TRIM_DURATION_SECONDS}s loop starting at ${TRIM_START_SECONDS}s and re-encoding (H.264, ${OUTPUT_VIDEO_BITRATE}) -> ${outputPath}`
    );
    try {
      await trimAndCompress(rawPath, outputPath);
    } finally {
      rmSync(rawPath, { force: true });
    }
  }

  console.log('Done. Extracted clips are trimmed to short loops and re-encoded for web delivery.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
