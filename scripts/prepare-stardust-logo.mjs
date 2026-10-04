// One-off script: split the user-supplied STARDUST wordmark into two layers:
//
//   1. stardust-logo.png  — the lettering only (S T ★ R D U ⚡ T), tight crop,
//      transparent. Used in the hero, the corner brand mark and the footer.
//   2. stardust-dust.webp — everything else (galaxy streak, dust specks,
//      little sparkle stars), transparent, on a larger frame. Sits BEHIND the
//      logo in the hero and gets animated there.
//
// Source: white distressed lettering on opaque black, 2000x1000.
//
// How the split works: threshold to a binary mask, label connected
// components, and keep the large ones as "lettering". Measured on the source:
// the 8 letters/star/bolt are 11k-25k px each, one bolt fragment is ~900 px,
// and the biggest piece of dust is ~400 px — so a 800 px cut is unambiguous.
// The kept mask is dilated a few px so anti-aliased edges and the bolt's soft
// glow stay with the logo, and the dust layer is cleared inside that same
// region (so distress holes in the letters show the page, not dust).
//
// Also writes src/content/logo-layout.json (where the logo sits inside the
// dust frame) so Hero.astro can align the layers, and a clean star favicon.
//
// Usage: node scripts/prepare-stardust-logo.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SRC = 'C:/Users/roiis/Downloads/bowie/stardust-logo-source.webp';
const OUT_DIR = join(REPO_ROOT, 'public/assets/logo');

const KEY_LO = 12; // max(R,G,B) -> alpha soft key (white on black)
const KEY_HI = 70;
const MASK_THRESHOLD = 128;
const MIN_LETTER_AREA = 800;
const DILATE = 3;
// Opening radius: removes dust specks fused to the lettering (features
// thinner than 2*OPEN+1 px) without touching the thick letter strokes.
const OPEN = 3;
const LOGO_PAD = 6;
// Dust frame in source coordinates (covers the galaxy streak and stars).
const DUST = { left: 300, top: 90, width: 1450, height: 810 };
const DUST_FEATHER = 90;

function dilate(mask, W, H, r) {
  const tmp = new Uint8Array(W * H);
  const out = new Uint8Array(W * H);
  // Separable square max filter (simple, and plenty fast for a one-off).
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      const a = Math.max(0, x - r);
      const b = Math.min(W - 1, x + r);
      for (let k = a; k <= b; k++) {
        if (mask[y * W + k]) {
          v = 1;
          break;
        }
      }
      tmp[y * W + x] = v;
    }
  }
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      let v = 0;
      const a = Math.max(0, y - r);
      const b = Math.min(H - 1, y + r);
      for (let k = a; k <= b; k++) {
        if (tmp[k * W + x]) {
          v = 1;
          break;
        }
      }
      out[y * W + x] = v;
    }
  }
  return out;
}

function erode(mask, W, H, r) {
  // erosion = complement of dilation of the complement
  const inv = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) inv[i] = mask[i] ? 0 : 1;
  const d = dilate(inv, W, H, r);
  const out = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) out[i] = d[i] ? 0 : 1;
  return out;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  // 1. binary mask + keyed alpha
  const mask = new Uint8Array(W * H);
  const keyed = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const p = i * C;
    const mx = Math.max(data[p], data[p + 1], data[p + 2]);
    mask[i] = mx > MASK_THRESHOLD ? 1 : 0;
    keyed[i] = Math.max(0, Math.min(255, Math.round(((mx - KEY_LO) / (KEY_HI - KEY_LO)) * 255)));
  }

  // 2. connected components (8-connectivity), keep the big ones
  const label = new Int32Array(W * H);
  const stack = new Int32Array(W * H);
  const keep = new Uint8Array(W * H);
  let kept = 0;
  let dropped = 0;
  let bx0 = W, by0 = H, bx1 = 0, by1 = 0;
  for (let s = 0; s < W * H; s++) {
    if (!mask[s] || label[s]) continue;
    let sp = 0;
    stack[sp++] = s;
    label[s] = 1;
    const members = [];
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    while (sp) {
      const v = stack[--sp];
      members.push(v);
      const x = v % W;
      const y = (v / W) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const u = ny * W + nx;
          if (mask[u] && !label[u]) {
            label[u] = 1;
            stack[sp++] = u;
          }
        }
      }
    }
    if (members.length >= MIN_LETTER_AREA) {
      kept++;
      for (const v of members) keep[v] = 1;
      bx0 = Math.min(bx0, x0);
      by0 = Math.min(by0, y0);
      bx1 = Math.max(bx1, x1);
      by1 = Math.max(by1, y1);
    } else {
      dropped++;
    }
  }
  console.log(`components kept as lettering: ${kept}, dropped as dust: ${dropped}`);

  const opened = dilate(erode(keep, W, H, OPEN), W, H, OPEN);
  const zone = dilate(opened, W, H, DILATE);

  // 3. logo layer: keyed alpha inside the lettering zone, white RGB
  const logoBox = {
    left: Math.max(0, bx0 - DILATE - LOGO_PAD),
    top: Math.max(0, by0 - DILATE - LOGO_PAD),
    right: Math.min(W - 1, bx1 + DILATE + LOGO_PAD),
    bottom: Math.min(H - 1, by1 + DILATE + LOGO_PAD),
  };
  logoBox.width = logoBox.right - logoBox.left + 1;
  logoBox.height = logoBox.bottom - logoBox.top + 1;

  const logoBuf = Buffer.alloc(W * H * 4, 255);
  const dustBuf = Buffer.alloc(W * H * 4, 255);
  for (let i = 0; i < W * H; i++) {
    logoBuf[i * 4 + 3] = zone[i] ? keyed[i] : 0;
    dustBuf[i * 4 + 3] = zone[i] ? 0 : keyed[i];
  }

  await sharp(logoBuf, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: logoBox.left, top: logoBox.top, width: logoBox.width, height: logoBox.height })
    .png()
    .toFile(join(OUT_DIR, 'stardust-logo.png'));
  console.log(`logo: stardust-logo.png (${logoBox.width}x${logoBox.height})`);

  // 4. dust layer: crop to the dust frame, feather the cut edges, save as webp
  const frame = await sharp(dustBuf, { raw: { width: W, height: H, channels: 4 } })
    .extract(DUST)
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let y = 0; y < frame.info.height; y++) {
    for (let x = 0; x < frame.info.width; x++) {
      const edge = Math.min(x, frame.info.width - 1 - x, y, frame.info.height - 1 - y);
      const f = Math.min(1, edge / DUST_FEATHER);
      const idx = (y * frame.info.width + x) * 4 + 3;
      frame.data[idx] = Math.round(frame.data[idx] * f);
    }
  }
  await sharp(frame.data, { raw: { width: frame.info.width, height: frame.info.height, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(join(OUT_DIR, 'stardust-dust.webp'));
  console.log(`dust: stardust-dust.webp (${frame.info.width}x${frame.info.height})`);

  // 5. layout: where the logo sits inside the dust frame (fractions of the
  // dust frame) and the dust frame's size relative to the logo box.
  const layout = {
    dustAspect: +(DUST.height / DUST.width).toFixed(5),
    dustWidthOfLogo: +(DUST.width / logoBox.width).toFixed(5),
    dustLeftOfLogo: +((DUST.left - logoBox.left) / logoBox.width).toFixed(5),
    dustTopOfLogo: +((DUST.top - logoBox.top) / logoBox.height).toFixed(5),
    logoInDust: {
      x: +((logoBox.left - DUST.left) / DUST.width).toFixed(5),
      y: +((logoBox.top - DUST.top) / DUST.height).toFixed(5),
      w: +(logoBox.width / DUST.width).toFixed(5),
      h: +(logoBox.height / DUST.height).toFixed(5),
    },
  };
  writeFileSync(join(REPO_ROOT, 'src/content/logo-layout.json'), JSON.stringify(layout, null, 2) + '\n');
  console.log('layout: src/content/logo-layout.json', layout);

  // 6. favicon: clean white five-point star (the logo's "A")
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? 112 : 46;
    const ang = -Math.PI / 2 + (k * Math.PI) / 5;
    pts.push(`${(128 + r * Math.cos(ang)).toFixed(1)},${(136 + r * Math.sin(ang)).toFixed(1)}`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><polygon points="${pts.join(' ')}" fill="#fff"/></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(REPO_ROOT, 'public/favicon.png'));
  console.log('favicon: star -> public/favicon.png');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
