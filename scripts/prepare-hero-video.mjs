// One-off script: compress the user-provided hero background video clip
// for web use. Source is a phone/editor export — 1920x1080, ~21 Mbps,
// 64s, with an audio track — 170MB, far too large to ship as a page
// background (it would dominate the page weight and hurt load time).
// Background video is always rendered muted (autoplay requires it), so
// the audio track is dropped entirely rather than just not played.
//
// Re-encodes to 1280px-wide H.264, CRF 28 (visually fine once scaled down
// and sitting under the hero's dark gradient scrim), no audio, faststart
// for progressive playback. Existing hero-band-live.jpg is reused as the
// <video poster> / prefers-reduced-motion fallback — no separate poster
// frame needed.
//
// Usage: node scripts/prepare-hero-video.mjs
import ffmpegPath from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SRC = 'C:/Users/roiis/Downloads/bowie/Short Clip no text new - Made with Clipchamp.mp4';
const OUT_DIR = join(REPO_ROOT, 'public/assets/hero');
const DEST = join(OUT_DIR, 'hero-bg-video.mp4');

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const result = spawnSync(
    ffmpegPath,
    [
      '-y',
      '-i', SRC,
      '-vf', 'scale=1280:-2',
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'medium',
      '-an',
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      DEST,
    ],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) {
    throw new Error(`ffmpeg exited with code ${result.status}`);
  }

  const { size } = statSync(DEST);
  console.log(`hero-bg-video.mp4 -> ${(size / 1024 / 1024).toFixed(1)}MB`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
