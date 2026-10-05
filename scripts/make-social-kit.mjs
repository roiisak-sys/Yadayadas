// One-off script: builds profile pictures and banners for the STARDUST social
// pages (Instagram, Facebook, YouTube) from the site's logo + dust layer, using
// the same alignment as the hero (src/content/logo-layout.json).
//
// Output: social-kit/ (not part of the deployed site).
//
// Platform specs the sizes are based on:
//   - Instagram / Facebook / YouTube profile pictures are shown in a circle, so
//     everything important stays inside the centred circle.
//   - Facebook cover: shown ~820x312 on desktop and cropped taller on mobile,
//     so the logo sits in the middle with generous margins (uploaded at 1640x624).
//   - YouTube banner: 2560x1440, only the centre 1546x423 is visible on every
//     device, so the logo is kept well inside that.
//
// Usage: node scripts/make-social-kit.mjs
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'social-kit');
const LOGO = join(ROOT, 'public/assets/logo/stardust-logo.png');
const DUST = join(ROOT, 'public/assets/logo/stardust-dust.webp');
const layout = JSON.parse(readFileSync(join(ROOT, 'src/content/logo-layout.json'), 'utf8'));
const BG = '#0a0a0a';

async function brandCanvas(width, height, logoWidth, { logoCentreY = 0.5 } = {}) {
  const logoMeta = await sharp(LOGO).metadata();
  const logoHeight = Math.round((logoWidth * logoMeta.height) / logoMeta.width);
  const logoLeft = Math.round((width - logoWidth) / 2);
  const logoTop = Math.round(height * logoCentreY - logoHeight / 2);

  const dustW = Math.round(logoWidth * layout.dustWidthOfLogo);
  const dustH = Math.round(dustW * layout.dustAspect);
  const dustLeft = Math.round(logoLeft + logoWidth * layout.dustLeftOfLogo);
  const dustTop = Math.round(logoTop + logoHeight * layout.dustTopOfLogo);

  // Compose on a padded canvas so dust hanging past the edge is clipped, not an error.
  const pad = Math.max(dustW, dustH);
  const dust = await sharp(DUST).resize(dustW, dustH).png().toBuffer();
  const logo = await sharp(LOGO).resize(logoWidth, logoHeight).png().toBuffer();
  return sharp({ create: { width: width + pad * 2, height: height + pad * 2, channels: 4, background: BG } })
    .composite([
      { input: dust, left: dustLeft + pad, top: dustTop + pad },
      { input: logo, left: logoLeft + pad, top: logoTop + pad },
    ])
    .png()
    .toBuffer()
    .then((buf) => sharp(buf).extract({ left: pad, top: pad, width, height }).flatten({ background: BG }));
}

function starSvg(size) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? 0.46 * size : 0.19 * size;
    const ang = -Math.PI / 2 + (k * Math.PI) / 5;
    pts.push(`${(size / 2 + r * Math.cos(ang)).toFixed(1)},${(size / 2 + 0.04 * size + r * Math.sin(ang)).toFixed(1)}`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><polygon points="${pts.join(' ')}" fill="#fff"/></svg>`;
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  // Profile picture, logo version (all three platforms; circle-safe).
  (await brandCanvas(1080, 1080, 900)).png().toFile(join(OUT, 'profile-logo-1080.png'));
  console.log('profile-logo-1080.png');

  // Profile picture, star version (stays readable at tiny sizes).
  // No dust here: the dust layer has a stray bolt fragment that lands next to the star.
  const star = await sharp(Buffer.from(starSvg(620))).png().toBuffer();
  const glow = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="540" cy="540" r="520" fill="url(#g)"/></svg>'
  );
  await sharp({ create: { width: 1080, height: 1080, channels: 4, background: BG } })
    .composite([
      { input: glow, left: 0, top: 0 },
      { input: star, left: 230, top: 230 },
    ])
    .flatten({ background: BG })
    .png()
    .toFile(join(OUT, 'profile-star-1080.png'));
  console.log('profile-star-1080.png');

  // Facebook cover.
  (await brandCanvas(1640, 624, 880)).png().toFile(join(OUT, 'facebook-cover-1640x624.png'));
  console.log('facebook-cover-1640x624.png');

  // YouTube banner (safe area is the centre 1546x423).
  (await brandCanvas(2560, 1440, 1100)).png().toFile(join(OUT, 'youtube-banner-2560x1440.png'));
  console.log('youtube-banner-2560x1440.png');
}

main();
