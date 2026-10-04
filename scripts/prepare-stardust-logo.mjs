// One-off script: builds the STARDUST hero assets from two user-supplied files.
//
//   1. stardust-logo.png  — the FINAL logo: white distressed lettering with a
//      thick black outline (S T star R D U bolt T). That file already has a real
//      transparent background, so it is only cropped to its alpha bounding box.
//      Used in the hero, the corner brand mark and the footer.
//   2. stardust-dust.webp — the galaxy streak, dust specks and little sparkle
//      stars, taken from the ORIGINAL white-on-black artwork (the outline logo
//      has no dust). Transparent, on a larger frame; sits BEHIND the logo in
//      the hero and gets animated there.
//
// Dust extraction (from the original artwork, 2000x1000 white on opaque black):
// threshold to a binary mask, label connected components, and treat the large
// ones as the old lettering. Measured on that source: the 8 letters/star/bolt
// are 11k-25k px each, one bolt fragment is ~900 px, and the biggest piece of
// dust is ~400 px — so an 800 px cut is unambiguous. The old lettering region
// (opened to drop fused specks, dilated a few px) is cleared from the dust
// layer, because the new logo sits over that area.
//
// Also writes src/content/logo-layout.json (where the logo sits inside the
// dust frame) so Hero.astro can align the layers, and a clean star favicon.
// The dust frame keeps the same position relative to the lettering as in the
// original artwork (scaled to the new logo's width, centred vertically).
//
// Usage: node scripts/prepare-stardust-logo.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DUST_SRC = 'C:/Users/roiis/Downloads/bowie/stardust-logo-source.webp'; // original artwork (dust)
const LOGO_SRC = 'C:/Users/roiis/Downloads/bowie/stardust-logo-outline-source.webp'; // final outlined logo (transparent)
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
  const { data, info } = await sharp(DUST_SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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

  // 3. reference box of the OLD lettering (used only to place the dust frame)
  const oldBox = {
    left: Math.max(0, bx0 - DILATE - LOGO_PAD),
    top: Math.max(0, by0 - DILATE - LOGO_PAD),
    right: Math.min(W - 1, bx1 + DILATE + LOGO_PAD),
    bottom: Math.min(H - 1, by1 + DILATE + LOGO_PAD),
  };
  oldBox.width = oldBox.right - oldBox.left + 1;
  oldBox.height = oldBox.bottom - oldBox.top + 1;

  const dustBuf = Buffer.alloc(W * H * 4, 255);
  for (let i = 0; i < W * H; i++) {
    dustBuf[i * 4 + 3] = zone[i] ? 0 : keyed[i];
  }

  // 3b. the final logo: crop the supplied transparent file to its alpha bbox
  const L = await sharp(LOGO_SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let lx0 = L.info.width, ly0 = L.info.height, lx1 = 0, ly1 = 0;
  for (let y = 0; y < L.info.height; y++) {
    for (let x = 0; x < L.info.width; x++) {
      if (L.data[(y * L.info.width + x) * 4 + 3] > 20) {
        if (x < lx0) lx0 = x;
        if (x > lx1) lx1 = x;
        if (y < ly0) ly0 = y;
        if (y > ly1) ly1 = y;
      }
    }
  }
  const logoCrop = {
    left: Math.max(0, lx0 - LOGO_PAD),
    top: Math.max(0, ly0 - LOGO_PAD),
    width: 0,
    height: 0,
  };
  logoCrop.width = Math.min(L.info.width - logoCrop.left, lx1 - lx0 + 1 + LOGO_PAD * 2);
  logoCrop.height = Math.min(L.info.height - logoCrop.top, ly1 - ly0 + 1 + LOGO_PAD * 2);
  await sharp(LOGO_SRC).ensureAlpha().extract(logoCrop).png().toFile(join(OUT_DIR, 'stardust-logo.png'));
  console.log(`logo: stardust-logo.png (${logoCrop.width}x${logoCrop.height})`);

  // The logo's box in dust-frame (source) coordinates: same left and width as
  // the old lettering, height from the new aspect ratio, centred vertically.
  const logoBox = {
    left: oldBox.left,
    width: oldBox.width,
    height: (oldBox.width * logoCrop.height) / logoCrop.width,
  };
  logoBox.top = oldBox.top + oldBox.height / 2 - logoBox.height / 2;

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
