# UX Simplification & Bowie Imagery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address direct client feedback on the merged YADAYADAS site: remove the confusing
horizontal-scroll-pin mechanic (replace with straightforward vertical scrolling everywhere), make
the "this is a David Bowie tribute show" framing explicit rather than implicit, and integrate 18
client-provided, licensed David Bowie photos across six sections of the site.

**Architecture:** Simplify `QuestionAndBowies.astro` by deleting its horizontal-scroll/pin logic
entirely (both CSS and script), replacing it with the same vertical fade-reveal pattern already
used in `Story.astro`. Add a one-off asset-preparation script (mirroring the established
`extract-fb-videos.mjs` pattern) that copies and optimizes the 18 source images from the client's
local folder into `public/assets/bowie/` with clean, descriptive filenames. Wire specific images
into Hero, the Many Bowies eras, the music-starts transition, Story, Editorial Quotes, and Final
Scene — each using the same img+scrim background pattern already established in `Hero.astro`.

**Tech Stack:** Same as the existing site — Astro, GSAP + ScrollTrigger, vanilla CSS with design
tokens, `sharp` (already a dependency) for one-off image optimization. No new dependencies.

---

## Source Assets

18 Shutterstock-licensed David Bowie photos currently live at
`C:\Users\roiis\OneDrive\Pictures\bowie\`. Task 1 copies and renames them into the project. The
mapping (source filename → clean destination name) is:

| Source | Destination |
|---|---|
| `Bowie-hero.jpg` | `bowie-space-oddity-profile.jpg` |
| `02-david-bowie-makeup.webp` | `bowie-ziggy-makeup-backstage.jpg` |
| `1969_manofwords.webp` | `bowie-early-man-of-words.jpg` |
| `1973_aladdinsane.webp` | `bowie-aladdin-sane-cover.jpg` |
| `1983-cannes_2445749k.jpg` | `bowie-lets-dance-era-portrait.jpg` |
| `7PSpxXJyzycvsLSPYKK4JT.jpg` | `bowie-union-jack-coat-live.jpg` |
| `David_Bowie-06.webp` | `bowie-portrait-stark-bw.jpg` |
| `GLOBAL-FAP-8X12_scaled-bordered_850.jpg` | `bowie-live-stage-guitar.jpg` |
| `Lvd4yWGHJrmptjYiwvLp7c-960-80.jpg` | `bowie-profile-cosmic.jpg` |
| `images (10).jpeg` | `bowie-blackstar-era.jpg` |
| `images (2).jpeg` | `bowie-ziggy-stardust-red.jpg` |
| `images (3).jpeg` | `bowie-diamond-dogs-pose.jpg` |
| `images (4).jpeg` | `bowie-live-bw-mic.jpg` |
| `images (5).jpeg` | `bowie-live-earthling-era.jpg` |
| `images (6).jpeg` | `bowie-deram-debut-1967.jpg` |
| `images (7).jpeg` | `bowie-live-white-guitar.jpg` |
| `images (8).jpeg` | `bowie-eyepatch-portrait.jpg` |
| `images (9).jpeg` | `bowie-live-purple-light.jpg` |

Placement across sections (11 of the 18 are used; the remaining 7 are prepared as a reserve for
future use, not forced into a section they don't fit):

| Section | Image(s) used |
|---|---|
| Hero background | `bowie-space-oddity-profile.jpg` (replaces the band photo) |
| Music-starts transition background | `bowie-live-stage-guitar.jpg` |
| Many Bowies — ZIGGY | `bowie-ziggy-stardust-red.jpg` |
| Many Bowies — THE THIN WHITE DUKE | `bowie-profile-cosmic.jpg` |
| Many Bowies — BERLIN | `bowie-portrait-stark-bw.jpg` |
| Many Bowies — LET'S DANCE | `bowie-lets-dance-era-portrait.jpg` |
| Many Bowies — BLACKSTAR | `bowie-blackstar-era.jpg` |
| Story interlude (after beat index 4, "the persona was supposed to be a mask") | `bowie-diamond-dogs-pose.jpg` |
| Story interlude (after beat index 10, Berlin Trilogy) | `bowie-eyepatch-portrait.jpg` |
| Editorial Quotes background | `bowie-live-purple-light.jpg` |
| Final Scene background | `bowie-union-jack-coat-live.jpg` |

---

## Task 1: Prepare & Optimize Bowie Image Assets

**Files:**
- Create: `scripts/prepare-bowie-images.mjs`
- Create: `scripts/prepare-bowie-images.test.mjs`
- Create: `public/assets/bowie/.gitkeep`

### Step 1: Write the failing test for the filename-mapping logic

```javascript
import { describe, it, expect } from 'vitest';
import { BOWIE_IMAGE_MAP } from './prepare-bowie-images.mjs';

describe('BOWIE_IMAGE_MAP', () => {
  it('has exactly 18 entries', () => {
    expect(Object.keys(BOWIE_IMAGE_MAP)).toHaveLength(18);
  });

  it('every destination filename ends in .jpg', () => {
    for (const dest of Object.values(BOWIE_IMAGE_MAP)) {
      expect(dest).toMatch(/\.jpg$/);
    }
  });

  it('every destination filename is unique', () => {
    const values = Object.values(BOWIE_IMAGE_MAP);
    expect(new Set(values).size).toBe(values.length);
  });

  it('maps the hero source photo to the expected destination name', () => {
    expect(BOWIE_IMAGE_MAP['Bowie-hero.jpg']).toBe('bowie-space-oddity-profile.jpg');
  });
});
```

### Step 2: Run the test to verify it fails

Run: `npx vitest run scripts/prepare-bowie-images.test.mjs`
Expected: FAIL — `prepare-bowie-images.mjs` doesn't exist yet.

### Step 3: Write `scripts/prepare-bowie-images.mjs`

```javascript
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const DEFAULT_SOURCE_DIR = 'C:\\Users\\roiis\\OneDrive\\Pictures\\bowie';

const BOWIE_IMAGE_MAP = {
  'Bowie-hero.jpg': 'bowie-space-oddity-profile.jpg',
  '02-david-bowie-makeup.webp': 'bowie-ziggy-makeup-backstage.jpg',
  '1969_manofwords.webp': 'bowie-early-man-of-words.jpg',
  '1973_aladdinsane.webp': 'bowie-aladdin-sane-cover.jpg',
  '1983-cannes_2445749k.jpg': 'bowie-lets-dance-era-portrait.jpg',
  '7PSpxXJyzycvsLSPYKK4JT.jpg': 'bowie-union-jack-coat-live.jpg',
  'David_Bowie-06.webp': 'bowie-portrait-stark-bw.jpg',
  'GLOBAL-FAP-8X12_scaled-bordered_850.jpg': 'bowie-live-stage-guitar.jpg',
  'Lvd4yWGHJrmptjYiwvLp7c-960-80.jpg': 'bowie-profile-cosmic.jpg',
  'images (10).jpeg': 'bowie-blackstar-era.jpg',
  'images (2).jpeg': 'bowie-ziggy-stardust-red.jpg',
  'images (3).jpeg': 'bowie-diamond-dogs-pose.jpg',
  'images (4).jpeg': 'bowie-live-bw-mic.jpg',
  'images (5).jpeg': 'bowie-live-earthling-era.jpg',
  'images (6).jpeg': 'bowie-deram-debut-1967.jpg',
  'images (7).jpeg': 'bowie-live-white-guitar.jpg',
  'images (8).jpeg': 'bowie-eyepatch-portrait.jpg',
  'images (9).jpeg': 'bowie-live-purple-light.jpg',
};

async function main() {
  const sourceDir = process.argv[2] ?? DEFAULT_SOURCE_DIR;
  if (!existsSync(sourceDir)) {
    console.error(`Source directory not found at ${sourceDir}. Pass it as the first argument.`);
    process.exit(1);
  }

  const outDir = join(PROJECT_ROOT, 'public', 'assets', 'bowie');
  mkdirSync(outDir, { recursive: true });

  const availableFiles = new Set(readdirSync(sourceDir));

  for (const [sourceName, destName] of Object.entries(BOWIE_IMAGE_MAP)) {
    if (!availableFiles.has(sourceName)) {
      console.warn(`Source file not found: ${sourceName} — skipping ${destName}.`);
      continue;
    }
    const sourcePath = join(sourceDir, sourceName);
    const destPath = join(outDir, destName);
    console.log(`Processing ${sourceName} -> ${destName}`);
    await sharp(sourcePath)
      .resize({ width: 2000, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(destPath);
  }

  console.log('Done. All source images resized to max 2000px width, re-encoded as JPEG q82.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { BOWIE_IMAGE_MAP };
```

(The `pathToFileURL` entry-point guard matches the pattern already established in
`scripts/extract-fb-videos.mjs` for exactly the same Windows-path-comparison reason — a plain
`` `file://${process.argv[1]}` `` string comparison never matches on Windows because
`process.argv[1]` uses backslashes.)

### Step 4: Run the unit test to verify it passes

Run: `npx vitest run scripts/prepare-bowie-images.test.mjs`
Expected: PASS.

### Step 5: Create `public/assets/bowie/.gitkeep`

Empty file — keeps the directory tracked in git since the actual `.jpg` files will be gitignored
(same pattern as `public/assets/video/`).

### Step 6: Update `.gitignore`

Add these two lines (near the existing `public/assets/video/*.mp4` lines):

```
public/assets/bowie/*.jpg
!public/assets/bowie/.gitkeep
```

### Step 7: Run the real extraction

```bash
node scripts/prepare-bowie-images.mjs
```

Expected: `public/assets/bowie/` now contains 18 `.jpg` files matching the destination names in
`BOWIE_IMAGE_MAP`. Verify with `ls -la public/assets/bowie/` — spot-check that
`bowie-union-jack-coat-live.jpg` (the largest source file, originally 4.3MB/4000×3961) is now
under 2000px wide and a reasonable file size (expect well under 1MB after resize+re-encode).

### Step 8: Verify the build picks up the new assets

Run `npm run build`. Confirm `dist/assets/bowie/` contains all 18 processed images (this only
works if the earlier `public/assets/...` infrastructure fix from the original build is in place —
it is, this project already serves `public/assets/photos/` and `public/assets/video/` the same
way).

### Step 9: Commit

```bash
git add scripts/prepare-bowie-images.mjs scripts/prepare-bowie-images.test.mjs public/assets/bowie/.gitkeep .gitignore
git commit -m "Add Bowie image asset preparation script"
```

Confirm the actual `.jpg` files are NOT part of this commit (check `git status` — they should be
gitignored, same as the video asset).

## Context

Task 1 of 6. This is a one-off dev-time script (like `extract-fb-videos.mjs`) that processes the
client's locally-stored, Shutterstock-licensed Bowie photos into the project. No component wiring
happens in this task — that's Tasks 3-5.

## Before You Begin

If `C:\Users\roiis\OneDrive\Pictures\bowie\` doesn't contain files matching the 18 source names in
`BOWIE_IMAGE_MAP`, stop and report BLOCKED rather than guessing at alternative filenames — list
what's actually there so the controller can reconcile.

## Report Format

Report:
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- What you implemented
- What you tested and results (including confirmation all 18 files processed, and the size
  reduction on the largest source file)
- Files changed
- Self-review findings
- The git commit SHA

---

## Task 2: Simplify Many Bowies Section — Remove Horizontal Scroll, Add Era Images

**Files:**
- Modify: `src/content/copy.en.json`
- Modify: `src/content/copy.he.json`
- Modify: `src/content.schema.test.ts`
- Modify: `src/components/QuestionAndBowies.astro`

This task removes the horizontal-scroll-pin mechanic entirely (the client found it confusing) and
replaces it with the same straightforward vertical fade-reveal already used in `Story.astro`. It
also adds a Bowie photo to each of the 5 era cards.

### Step 1: Add an `image` field to each era in the content files

In `src/content/copy.en.json`, update the `bowies.eras` array to:

```json
"bowies": {
  "eras": [
    { "name": "ZIGGY", "line": "Color. Energy. Theatricality.", "image": "/assets/bowie/bowie-ziggy-stardust-red.jpg" },
    { "name": "THE THIN WHITE DUKE", "line": "ZIGGY HAD TO DIE.", "image": "/assets/bowie/bowie-profile-cosmic.jpg" },
    { "name": "BERLIN", "line": "THE THIN WHITE DUKE HAD TO DISAPPEAR.", "image": "/assets/bowie/bowie-portrait-stark-bw.jpg" },
    { "name": "LET'S DANCE", "line": "Color. Movement. Pop.", "image": "/assets/bowie/bowie-lets-dance-era-portrait.jpg" },
    { "name": "BLACKSTAR", "line": "Mystery. Mortality. Art.", "image": "/assets/bowie/bowie-blackstar-era.jpg" }
  ]
}
```

In `src/content/copy.he.json`, update the `bowies.eras` array to:

```json
"bowies": {
  "eras": [
    { "name": "זיגי", "line": "צבע. אנרגיה. תיאטרליות.", "image": "/assets/bowie/bowie-ziggy-stardust-red.jpg" },
    { "name": "הדוכס הצנום הלבן", "line": "זיגי היה צריך למות.", "image": "/assets/bowie/bowie-profile-cosmic.jpg" },
    { "name": "ברלין", "line": "הדוכס הצנום הלבן היה צריך להיעלם.", "image": "/assets/bowie/bowie-portrait-stark-bw.jpg" },
    { "name": "LET'S DANCE", "line": "צבע. תנועה. פופ.", "image": "/assets/bowie/bowie-lets-dance-era-portrait.jpg" },
    { "name": "BLACKSTAR", "line": "מסתורין. תמותה. אמנות.", "image": "/assets/bowie/bowie-blackstar-era.jpg" }
  ]
}
```

(Image paths are identical between locales — photos aren't language-specific.)

### Step 2: Update the schema test for the new field

In `src/content.schema.test.ts`, find the existing test:

```typescript
  it('both locales define 5 Bowie eras with name and line', () => {
    expect(copyHe.bowies.eras).toHaveLength(5);
    expect(copyEn.bowies.eras).toHaveLength(5);
    for (const era of [...copyHe.bowies.eras, ...copyEn.bowies.eras]) {
      expect(era.name).toBeTruthy();
      expect(era.line).toBeTruthy();
    }
  });
```

Replace it with:

```typescript
  it('both locales define 5 Bowie eras with name, line, and image', () => {
    expect(copyHe.bowies.eras).toHaveLength(5);
    expect(copyEn.bowies.eras).toHaveLength(5);
    for (const era of [...copyHe.bowies.eras, ...copyEn.bowies.eras]) {
      expect(era.name).toBeTruthy();
      expect(era.line).toBeTruthy();
      expect(era.image).toMatch(/^\/assets\/bowie\/.+\.jpg$/);
    }
  });
```

### Step 3: Run the test to verify it fails, then passes

Run: `npx vitest run src/content.schema.test.ts`
Expected: FAIL first (before Step 1's JSON edits are saved, `era.image` is undefined). Apply Step 1
and Step 2 together, then run again.

Run: `npx vitest run src/content.schema.test.ts`
Expected: PASS.

### Step 4: Rewrite `src/components/QuestionAndBowies.astro`

Replace the entire file with:

```astro
---
interface Era {
  name: string;
  line: string;
  image: string;
}
interface Props {
  heading: string;
  fragments: string[];
  eras: Era[];
}
const { heading, fragments, eras } = Astro.props;
---

<section id="question-and-bowies" class="qab">
  <h2 class="qab__heading">{heading}</h2>

  <div class="qab__track">
    {fragments.map((f) => (
      <div class="qab__panel qab__panel--fragment" data-qab-panel>
        <span class="qab__word">{f}</span>
      </div>
    ))}
    {eras.map((era, i) => (
      <div class={`qab__panel qab__panel--era qab__panel--era-${i % 3}`} data-qab-panel>
        <img src={era.image} alt="" class="qab__era-image" loading="lazy" />
        <span class="qab__era-name">{era.name}</span>
        <span class="qab__era-line">{era.line}</span>
      </div>
    ))}
  </div>

  <noscript>
    <style is:global>
      #question-and-bowies .qab__panel {
        opacity: 1 !important;
        transform: none !important;
      }
    </style>
  </noscript>
</section>

<style>
  .qab {
    background: var(--color-black);
    padding-block: var(--space-xl);
  }

  .qab__heading {
    font-family: var(--font-display);
    font-size: var(--size-display-md);
    text-align: center;
    margin: 0 0 var(--space-lg);
  }

  .qab__track {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    max-width: 40rem;
    margin-inline: auto;
    padding-inline: var(--space-md);
  }

  .qab__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-md);
    opacity: 0;
    transform: translateY(24px);
  }

  .qab__word {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-lg);
  }

  .qab__era-image {
    width: 100%;
    max-width: 20rem;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    margin-bottom: var(--space-md);
  }

  .qab__era-name {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-md);
    margin-bottom: var(--space-sm);
  }

  .qab__era-line {
    font-family: var(--font-mono);
    font-size: var(--size-body);
    opacity: 0.8;
  }

  .qab__panel--era-0 .qab__era-name {
    color: var(--color-accent-green);
  }

  .qab__panel--era-1 .qab__era-name {
    color: var(--color-accent-purple);
  }

  .qab__panel--era-2 .qab__era-name {
    color: var(--color-accent-red);
  }

  @media (prefers-reduced-motion: reduce) {
    .qab__panel {
      opacity: 1;
      transform: none;
    }
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  gsap.registerPlugin(ScrollTrigger);

  const panels = gsap.utils.toArray('[data-qab-panel]') as HTMLElement[];

  if (!prefersReducedMotion()) {
    panels.forEach((panel) => {
      gsap.to(panel, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
        },
      });
    });

    if ('fonts' in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
</script>
```

This deletes: the `@media (min-width: 900px)` horizontal-row layout, the `qab__panel--fragment`/
`qab__panel--era` 100vw/100vh sizing, and the entire GSAP `ScrollTrigger` pin/scrub/teardown-and-
rebuild/resize-listener logic that drove the horizontal scroll. What's added: a straightforward
vertical `flex-direction: column` track (same on every screen size, no breakpoint), a Bowie era
image per era panel, and a simple per-panel fade/rise reveal — the exact pattern already
established and reviewed in `Story.astro` (CSS-first `opacity: 0` baseline, reduced-motion
override, noscript fallback, per-element `ScrollTrigger`, font-ready refresh).

### Step 5: Verify

Run `npm run build`. Confirm success. Inspect built `dist/he/index.html` / `dist/en/index.html`:
- Confirm NO `@media (min-width: 900px)` rule remains anywhere in the compiled CSS for `.qab__*`
  selectors (grep the compiled CSS file).
- Confirm each era panel now contains an `<img src="/assets/bowie/...">` tag with the correct
  filename per era (ZIGGY → `bowie-ziggy-stardust-red.jpg`, etc.).
- Confirm the 6 fragment words and 5 era names/lines still render correctly per locale.
- Confirm exactly one `<h1>` per page still holds.

Run `npx vitest run` — confirm all tests pass (should be 29, unchanged count, since this task
modifies an existing test rather than adding a new one). Run `npx astro check` — confirm 0 errors.

Also verify at both a desktop (1280px) and mobile (375px) viewport width via DOM/computed-style
inspection that the layout is now IDENTICAL at both widths (vertical stack, no horizontal
scrolling, no `pin-spacer` element created by GSAP) — this is the core client-requested fix, so
confirm it thoroughly.

### Step 6: Commit

```bash
git add src/content/copy.en.json src/content/copy.he.json src/content.schema.test.ts src/components/QuestionAndBowies.astro
git commit -m "Remove horizontal-scroll pin from Many Bowies section, add era images"
```

## Context

Task 2 of 6. Depends on Task 1 only for the image file paths being correct (the images themselves
don't need to physically exist yet for this task's build to succeed — Astro doesn't validate
`<img src>` paths at build time, same as how `Sound.astro` referenced a not-yet-extracted video
path earlier in this project's history — but Task 1 should run first in practice since this plan
lists it first). This is the client's most concrete UX complaint: the desktop-only horizontal-
scroll-pin effect in this section felt "cumbersome with unclear UX." This task removes it entirely
rather than trying to make it clearer — replacing scroll-jacking with normal, predictable vertical
scrolling.

## Before You Begin

Read the current `src/components/QuestionAndBowies.astro` first to confirm it matches the
horizontal-scroll version described in this project's history before rewriting it — ask questions
if it looks substantially different from what's assumed here.

## Report Format

Report:
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- What you implemented
- What you tested and results (explicitly confirm no horizontal scrolling remains at any width)
- Files changed
- Self-review findings
- The git commit SHA

---

## Task 3: Hero — Direct Tribute-Show Copy + Bowie Background

**Files:**
- Modify: `src/content/copy.en.json`
- Modify: `src/content/copy.he.json`
- Modify: `src/components/Hero.astro`

### Step 1: Update the Hero tagline copy for directness

In `src/content/copy.en.json`, find:
```json
"hero": { "question": "WHO WAS DAVID BOWIE?", "title": "BOWIE", "subtitle": "YADAYADAS", "tagline": "A LIVE EXPERIENCE" },
```
Change `tagline` to:
```json
"hero": { "question": "WHO WAS DAVID BOWIE?", "title": "BOWIE", "subtitle": "YADAYADAS", "tagline": "A DAVID BOWIE TRIBUTE SHOW" },
```

In `src/content/copy.he.json`, find:
```json
"hero": { "question": "מי היה דייויד בואי?", "title": "BOWIE", "subtitle": "YADAYADAS", "tagline": "מופע חי" },
```
Change `tagline` to:
```json
"hero": { "question": "מי היה דייויד בואי?", "title": "BOWIE", "subtitle": "YADAYADAS", "tagline": "מופע מחווה לדייויד בואי" },
```

(The question line "WHO WAS DAVID BOWIE?"/"מי היה דייויד בואי?" already names Bowie explicitly and
stays unchanged — this edit makes the closing tagline state plainly that it's a tribute show,
rather than the more ambiguous "a live experience.")

### Step 2: Swap the Hero background image

In `src/components/Hero.astro`, find:
```astro
    <img
      src="/assets/photos/photo_01.jpg"
      alt=""
      class="hero__bg-image"
      data-hero-bg-image
      fetchpriority="high"
    />
```
Change the `src` to:
```astro
    <img
      src="/assets/bowie/bowie-space-oddity-profile.jpg"
      alt=""
      class="hero__bg-image"
      data-hero-bg-image
      fetchpriority="high"
    />
```

(This replaces the band rehearsal photo with a genuine David Bowie image as the very first thing
visitors see — directly addressing the client's "more emphasis this is a special tribute show"
request. The band's own photography remains prominently used in the Band section itself, so
nothing about the band's presence on the site is lost.)

### Step 3: Verify

Run `npm run build`. Confirm success. Inspect `dist/he/index.html` / `dist/en/index.html` — confirm
the hero tagline text is updated per locale, and the hero background `<img src>` now points to
`/assets/bowie/bowie-space-oddity-profile.jpg`. Run `npx vitest run` — confirm all tests pass. Run
`npx astro check` — confirm 0 errors.

### Step 4: Commit

```bash
git add src/content/copy.en.json src/content/copy.he.json src/components/Hero.astro
git commit -m "Make Hero tagline explicitly name the tribute show, swap background to Bowie photo"
```

## Context

Task 3 of 6. Depends on Task 1 for the `bowie-space-oddity-profile.jpg` file to exist for a real
visual (the build succeeds either way, same reasoning as Task 2). This directly addresses the
client's second and third pieces of feedback together: clearer tribute framing, and a real Bowie
image where the site previously led with the band's own rehearsal photo.

## Report Format

Report:
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- What you implemented
- What you tested and results
- Files changed
- Self-review findings
- The git commit SHA

---

## Task 4: Bowie Imagery — Music-Starts Transition + Story Interludes

**Files:**
- Modify: `src/components/MusicStartsAndBand.astro`
- Modify: `src/components/Story.astro`

### Step 1: Add a background image to the music-starts transition

In `src/components/MusicStartsAndBand.astro`, find:
```astro
<section id="music-starts" class="transition has-grain">
  <p class="label transition__label">{label}</p>
</section>
```
Change it to:
```astro
<section id="music-starts" class="transition has-grain">
  <div class="transition__bg" aria-hidden="true">
    <img src="/assets/bowie/bowie-live-stage-guitar.jpg" alt="" class="transition__bg-image" loading="lazy" />
  </div>
  <div class="transition__scrim" aria-hidden="true"></div>
  <p class="label transition__label">{label}</p>
</section>
```

Find the existing `.transition` CSS rule:
```css
  .transition {
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-charcoal);
  }
```
Change it to add `position: relative` and `overflow: hidden` (needed for the new absolutely-
positioned background layers):
```css
  .transition {
    position: relative;
    overflow: hidden;
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-charcoal);
  }
```

Add these new rules after the existing `.transition__label` rule:
```css
  .transition__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .transition__bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.45;
  }

  .transition__scrim {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: linear-gradient(180deg, rgba(10, 10, 10, 0.5) 0%, rgba(10, 10, 10, 0.75) 100%);
  }
```

Find the existing `.transition__label` rule and confirm it has (or add) `position: relative;
z-index: 1;` so the label text stays above the new background layers:
```css
  .transition__label {
    position: relative;
    z-index: 1;
    font-size: var(--size-body);
  }
```

(No animation needed here — the image is static, matching this short transition beat's simple
role. `opacity: 0.45` on the image plus the scrim keeps the label text legible.)

### Step 2: Add two Bowie image interludes to the Story section

In `src/components/Story.astro`, find the frontmatter:
```astro
---
interface Beat {
  order: number;
  he: string;
  en: string;
}
interface Props {
  locale: 'he' | 'en';
  heading: string;
  beats: Beat[];
}
const { locale, heading, beats } = Astro.props;
const sorted = [...beats].sort((a, b) => a.order - b.order);
---
```
Add an interludes map after the `sorted` line:
```astro
---
interface Beat {
  order: number;
  he: string;
  en: string;
}
interface Props {
  locale: 'he' | 'en';
  heading: string;
  beats: Beat[];
}
const { locale, heading, beats } = Astro.props;
const sorted = [...beats].sort((a, b) => a.order - b.order);

const interludes: Record<number, string> = {
  4: '/assets/bowie/bowie-diamond-dogs-pose.jpg',
  10: '/assets/bowie/bowie-eyepatch-portrait.jpg',
};
---
```

Find the existing beats-rendering markup:
```astro
  <div class="story__beats">
    {sorted.map((b) => (
      <p class="story__beat" data-story-beat>{locale === 'he' ? b.he : b.en}</p>
    ))}
  </div>
```
Change it to interleave an image after beats at index 4 and 10 (array index, not the beat's
`order` field — they're the same here since the array is already sorted by `order` starting at 0):
```astro
  <div class="story__beats">
    {sorted.map((b, i) => (
      <Fragment>
        <p class="story__beat" data-story-beat>{locale === 'he' ? b.he : b.en}</p>
        {interludes[i] && (
          <div class="story__interlude" data-story-beat>
            <img src={interludes[i]} alt="" class="story__interlude-image" loading="lazy" />
          </div>
        )}
      </Fragment>
    ))}
  </div>
```

Add `import { Fragment } from 'astro'` — actually, Astro's `Fragment` is a global built-in in
`.astro` templates and does NOT need an import statement. Do not add an import for it; using
`<Fragment>` directly in the template (or the shorthand `<>...</>`) works out of the box in Astro
components. If `astro check` reports an error about `Fragment` being undefined, use the shorthand
`<>...</>` syntax instead:
```astro
  <div class="story__beats">
    {sorted.map((b, i) => (
      <>
        <p class="story__beat" data-story-beat>{locale === 'he' ? b.he : b.en}</p>
        {interludes[i] && (
          <div class="story__interlude" data-story-beat>
            <img src={interludes[i]} alt="" class="story__interlude-image" loading="lazy" />
          </div>
        )}
      </>
    ))}
  </div>
```

Note the interlude `<div>` reuses the `data-story-beat` attribute (not a new `data-story-interlude`
attribute) so it's automatically picked up by the existing GSAP reveal script without any script
changes — it gets the same fade/rise treatment as the text beats, which is the desired effect (a
consistent one-thing-at-a-time reveal rhythm through the whole section).

Add CSS for the new elements. Find the existing `.story__beat` rule and add this new rule right
after it in the `<style>` block:
```css
  .story__interlude {
    display: flex;
    justify-content: center;
    opacity: 0;
    transform: translateY(24px);
  }

  .story__interlude-image {
    width: 100%;
    max-width: 26rem;
    aspect-ratio: 4 / 5;
    object-fit: cover;
  }
```

Find the existing `@media (prefers-reduced-motion: reduce)` block:
```css
  @media (prefers-reduced-motion: reduce) {
    .story__beat {
      opacity: 1;
      transform: none;
    }
  }
```
Extend it to include the new class:
```css
  @media (prefers-reduced-motion: reduce) {
    .story__beat,
    .story__interlude {
      opacity: 1;
      transform: none;
    }
  }
```

Find the existing `<noscript>` block:
```astro
  <noscript>
    <style is:global>
      #story .story__beat {
        opacity: 1 !important;
        transform: none !important;
      }
    </style>
  </noscript>
```
Extend it:
```astro
  <noscript>
    <style is:global>
      #story .story__beat,
      #story .story__interlude {
        opacity: 1 !important;
        transform: none !important;
      }
    </style>
  </noscript>
```

The existing GSAP script already selects `[data-story-beat]` generically, and since the interlude
divs reuse that same attribute, no script changes are needed — they're automatically included in
the existing per-element reveal loop.

### Step 3: Verify

Run `npm run build`. Confirm success. Inspect built HTML: confirm the music-starts transition now
has a background `<img>`, confirm the Story section now has exactly 2 `.story__interlude` divs
containing the correct image paths, positioned after the 5th and 11th rendered beats (array indices
4 and 10). Run `npx vitest run` — confirm all tests pass. Run `npx astro check` — confirm 0 errors,
paying particular attention to whether `<Fragment>` or `<>...</>` was needed (use whichever the
type-checker accepts cleanly).

### Step 4: Commit

```bash
git add src/components/MusicStartsAndBand.astro src/components/Story.astro
git commit -m "Add Bowie imagery to music-starts transition and Story interludes"
```

## Context

Task 4 of 6. Depends on Task 1 for the image files. Continues spreading Bowie imagery through the
site's "documentary" sections per the client's request — the transition beat right before the Band
section, and two visual breathing points within the otherwise text-only Thin White Duke/Berlin
narrative.

## Report Format

Report:
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- What you implemented
- What you tested and results
- Files changed
- Self-review findings
- The git commit SHA

---

## Task 5: Bowie Imagery — Editorial Quotes + Final Scene Backgrounds

**Files:**
- Modify: `src/components/EditorialQuotes.astro`
- Modify: `src/components/FinalScene.astro`

### Step 1: Add a background image to Editorial Quotes

In `src/components/EditorialQuotes.astro`, find:
```astro
<section id="editorial-quote" class="quote has-grain">
  <div class="quote__accent" aria-hidden="true"></div>
  <p class="quote__text">{quote}</p>
</section>
```
Change it to:
```astro
<section id="editorial-quote" class="quote has-grain">
  <div class="quote__bg" aria-hidden="true">
    <img src="/assets/bowie/bowie-live-purple-light.jpg" alt="" class="quote__bg-image" loading="lazy" />
  </div>
  <div class="quote__scrim" aria-hidden="true"></div>
  <div class="quote__accent" aria-hidden="true"></div>
  <p class="quote__text">{quote}</p>
</section>
```

Find the existing `.quote` CSS rule:
```css
  .quote {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
  }
```
Add `position: relative; overflow: hidden;`:
```css
  .quote {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
  }
```

Add these new rules after `.quote`:
```css
  .quote__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .quote__bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.3;
    filter: grayscale(0.4);
  }

  .quote__scrim {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: radial-gradient(ellipse at center, rgba(10, 10, 10, 0.4) 0%, rgba(10, 10, 10, 0.9) 100%);
  }
```

Find `.quote__accent` and `.quote__text` and add `position: relative; z-index: 1;` to both so they
stay above the new background layers:
```css
  .quote__accent {
    position: relative;
    z-index: 1;
    width: 4rem;
    height: 3px;
    background: var(--color-accent-red);
    margin-bottom: var(--space-lg);
  }
```
```css
  .quote__text {
    position: relative;
    z-index: 1;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-lg);
    line-height: 1.05;
    text-align: center;
    max-width: 60rem;
    margin: 0;
  }
```

### Step 2: Add a background image to Final Scene

In `src/components/FinalScene.astro`, find:
```astro
<section id="final-scene" class="final">
  <p class="final__line1" data-final-line>{line1}</p>
  <p class="final__line2" data-final-line>{line2}</p>
  <a class="final__cta" href="#events" data-final-cta>{cta}</a>
```
Change it to:
```astro
<section id="final-scene" class="final">
  <div class="final__bg" aria-hidden="true">
    <img src="/assets/bowie/bowie-union-jack-coat-live.jpg" alt="" class="final__bg-image" loading="lazy" />
  </div>
  <div class="final__scrim" aria-hidden="true"></div>
  <p class="final__line1" data-final-line>{line1}</p>
  <p class="final__line2" data-final-line>{line2}</p>
  <a class="final__cta" href="#events" data-final-cta>{cta}</a>
```
(Leave the `<noscript>` block and everything else in the file as-is — only the section body above
gets the two new divs prepended.)

Find the existing `.final` CSS rule:
```css
  .final {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
    text-align: center;
  }
```
Add `position: relative; overflow: hidden;`:
```css
  .final {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
    text-align: center;
  }
```

Add these new rules after `.final`:
```css
  .final__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .final__bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;
  }

  .final__scrim {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: linear-gradient(180deg, rgba(10, 10, 10, 0.6) 0%, var(--color-black) 100%);
  }
```

Find `.final__line1, .final__line2` and `.final__cta` and add `position: relative; z-index: 1;` to
both rules so they stay above the new background layers:
```css
  .final__line1,
  .final__line2 {
    position: relative;
    z-index: 1;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-md);
    margin: 0;
    opacity: 0;
  }
```
```css
  .final__cta {
    position: relative;
    z-index: 1;
    margin-top: var(--space-lg);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-black);
    background: var(--color-accent-green);
    padding: var(--space-sm) var(--space-lg);
    text-decoration: none;
    opacity: 0;
  }
```

### Step 3: Verify

Run `npm run build`. Confirm success. Inspect built HTML: confirm Editorial Quotes and Final Scene
both now have background `<img>` tags with the correct Bowie photo paths. Confirm the existing
`<noscript>`/reduced-motion fallbacks for both sections' text elements still work correctly (the
new background images are static — no opacity:0 baseline, no reveal animation needed for them,
only the existing text elements need the fallback treatment, which is unchanged). Run
`npx vitest run` — confirm all tests pass. Run `npx astro check` — confirm 0 errors.

### Step 4: Commit

```bash
git add src/components/EditorialQuotes.astro src/components/FinalScene.astro
git commit -m "Add Bowie imagery to Editorial Quotes and Final Scene backgrounds"
```

## Context

Task 5 of 6. Depends on Task 1 for the image files. Completes the Bowie-imagery placement across
all 6 targeted sections (Hero, music-starts, Many Bowies ×5, Story ×2, Editorial Quotes, Final
Scene — 11 image placements total, using 11 of the 18 prepared images).

## Report Format

Report:
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- What you implemented
- What you tested and results
- Files changed
- Self-review findings
- The git commit SHA

---

## Task 6: Full Verification Pass

**Files:** none (verification-only task)

### Step 1: Run the full test suite

Run: `npm test`
Expected: all 29 tests pass (4 test files) plus the 4 new tests from Task 1's
`prepare-bowie-images.test.mjs` = 33 tests across 5 test files. `pretest` builds automatically
first.

### Step 2: Type-check

Run: `npx astro check`
Expected: 0 errors, 0 warnings, 0 hints.

### Step 3: Build

Run: `npm run build`
Expected: builds without errors, `dist/he/index.html` and `dist/en/index.html` both exist.

### Step 4: Confirm the horizontal-scroll removal, end to end

This is the client's primary complaint — verify it thoroughly. Run `npm run preview`, load both
locales in the Browser preview tooling at both a desktop (1280px) and mobile (375px) width. Confirm
via DOM inspection: no `.pin-spacer` element exists anywhere on the page at any width (this element
only ever appeared when GSAP's ScrollTrigger pin was active — it should no longer exist at all
since the pin logic was deleted, not just made conditional). Confirm the page's total scrollable
height is the sum of all sections stacked normally (no artificially-inflated scroll height from a
pinned horizontal section).

### Step 5: Confirm Bowie imagery coverage

Count `<img src="/assets/bowie/...">` occurrences in the built `dist/he/index.html`. Expected: 11
(1 Hero + 1 music-starts + 5 Many Bowies eras + 2 Story interludes + 1 Editorial Quotes + 1 Final
Scene). Confirm the same count in `dist/en/index.html`.

### Step 6: Confirm the tribute-show copy change

Confirm `dist/en/index.html` contains the text "A DAVID BOWIE TRIBUTE SHOW" and `dist/he/index.html`
contains "מופע מחווה לדייויד בואי" in the hero section.

### Step 7: Report findings

Summarize: test/build/type-check status, confirmation the horizontal scroll is fully gone (not
just hidden/disabled), confirmation of the 11-image count in both locales, confirmation of the
updated tagline copy, and any other observations worth flagging — this task doesn't fix issues, it
reports them for the controller.

---

## Plan Self-Review Notes

- **Spec coverage**: horizontal-scroll removal (client feedback #1) = Task 2. Direct tribute
  framing (client feedback #2) = Task 3 (Hero tagline) — the client's request was specifically
  about clarity of framing, which is a copy change; no other section's copy needed changing since
  Hero is where a first-time visitor forms their understanding of what the site is. Bowie imagery
  throughout (client feedback #3) = Tasks 1, 3, 4, 5 (asset prep + 6 sections).
- **Known content-model change**: `bowies.eras` now carries an `image` field, which is a genuine
  schema extension (Task 2) — the schema test was updated in the same task to enforce it, not left
  as a silent, untested addition.
- **Type/signature consistency**: `Era` interface in `QuestionAndBowies.astro` (Task 2) gains
  `image: string`, matching the JSON structure defined in the same task. The `interludes: Record<number, string>`
  map in `Story.astro` (Task 4) is a component-local addition, not a content-schema change — it
  intentionally does NOT touch `story-beats.json`, keeping the narrative content free of
  presentation concerns per the existing separation the codebase already established.
- **Placeholder scan**: no TBD/TODO patterns; every step shows complete, exact code.
