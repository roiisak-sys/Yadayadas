# Redesign Phase 1 — Hero + Bowie Collage Implementation Plan

> **Amendment (during Task 1 execution):** the image filenames/labels below (`bowie-diamond-dogs-*`, `bowie-deram-debut-1967.jpg`, `bowie-live-stage-guitar.jpg`, and the "1967"/"DIAMOND DOGS"/"THE THIN WHITE DUKE"-style era names) turned out to be based on a stale/incorrect visual read — a Read-tool image-caching bug served wrong content for 4 of the 8 `Downloads\bowie` files on repeat reads within the same long conversation (confirmed by re-reading each source through a fresh, never-before-seen temp file path, which produced different, verifiably-correct content). The actual shipped mapping, filenames, and era names differ from what's written in Tasks 1–2 below — see the Task 1 commit message and the final `copy.*.json` content for what was actually built. Left the original text in place rather than rewriting history; treat Tasks 1–2's code blocks as the *intent*, not the final output.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Hero to make the YADAYADAS logo part of the composition and add the "A Live David Bowie Tribute Show" descriptor; replace `QuestionAndBowies.astro`'s horizontal-scroll era track with a new `BowieCollage.astro` — a vertical, no-side-scroll editorial photo grid using freshly-verified Bowie photography.

**Architecture:** Both changes live in `src/components/`. The collage image set is prepared by a new one-off `sharp`-based script (mirroring `scripts/prepare-band-assets.mjs`) that reads directly from `C:\Users\roiis\Downloads\bowie` and writes to `public/assets/bowie/`. Copy content for both sections lives in `src/content/copy.{he,en}.json`. Full spec: `docs/superpowers/specs/2026-08-11-yadayadas-redesign-design.md` (§3, §4).

**Tech Stack:** Astro 5, GSAP 3 + ScrollTrigger (existing patterns only — no new libraries), sharp (image processing, already a devDependency), Vitest.

---

## Task 1: Prepare Bowie collage images

**Files:**
- Create: `scripts/prepare-collage-images.mjs`
- Test: none (one-off asset script, same convention as `scripts/prepare-band-assets.mjs` — not unit tested, verified by running it and visually checking output)

- [ ] **Step 1: Write the script**

```js
// One-off script: process the verified Bowie collage photos from
// C:\Users\roiis\Downloads\bowie into public/assets/bowie/.
//
// Source set was verified by direct sequential visual read in the design
// session (see docs/superpowers/specs/2026-08-11-yadayadas-redesign-design.md
// §4) — do NOT add files to this map without the same verification; the
// earlier OneDrive-sourced version of this folder had an unresolved
// content-mapping bug traced to unreliable cloud-sync reads.
//
// Usage: node scripts/prepare-collage-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SOURCE_DIR = 'C:/Users/roiis/Downloads/bowie';
const OUT_DIR = join(REPO_ROOT, 'public/assets/bowie');

// Filename -> destination filename. Verified content, per the spec table.
export const COLLAGE_IMAGE_MAP = {
  '1973_aladdinsane.webp': 'bowie-aladdin-sane.jpg',
  'images (3).jpeg': 'bowie-diamond-dogs-pose.jpg',
  'images (8).jpeg': 'bowie-diamond-dogs-eyepatch.jpg',
  'images (6).jpeg': 'bowie-deram-debut-1967.jpg',
  'David_Bowie-06.webp': 'bowie-portrait-stark-bw.jpg',
  '1983-cannes_2445749k.jpg': 'bowie-lets-dance-era-portrait.jpg',
  'GLOBAL-FAP-8X12_scaled-bordered_850.jpg': 'bowie-live-stage-guitar.jpg',
  'images (5).jpeg': 'bowie-live-earthling-era.jpg',
};

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [srcName, destName] of Object.entries(COLLAGE_IMAGE_MAP)) {
    const srcPath = join(SOURCE_DIR, srcName);
    const destPath = join(OUT_DIR, destName);
    await sharp(srcPath)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(destPath);
    console.log(`${srcName} -> assets/bowie/${destName}`);
  }
  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
```

- [ ] **Step 2: Run it**

Run: `node scripts/prepare-collage-images.mjs`
Expected: 8 lines of `<source> -> assets/bowie/<dest>` output, then `Done.`, and `public/assets/bowie/` contains 8 new `.jpg` files.

- [ ] **Step 3: Spot-check output**

Read 2–3 of the output files (e.g. `public/assets/bowie/bowie-portrait-stark-bw.jpg`, `public/assets/bowie/bowie-aladdin-sane.jpg`) and visually confirm they match the table in the spec (§4) — a B&W studio portrait and a red-background lightning-bolt-makeup shot respectively. This is the check that would have caught the earlier OneDrive mapping bug; don't skip it.

- [ ] **Step 4: Commit**

```bash
git add scripts/prepare-collage-images.mjs public/assets/bowie/
git commit -m "Add prepared Bowie collage images from verified source set"
```

---

## Task 2: Update copy content for Hero descriptor + collage eras

**Files:**
- Modify: `src/content/copy.he.json`
- Modify: `src/content/copy.en.json`

- [ ] **Step 1: Add `hero.descriptor` to both files**

In `copy.en.json`, change:
```json
"hero": { "question": "WHO WAS DAVID BOWIE?", "title": "BOWIE", "subtitle": "YADAYADAS", "tagline": "A LIVE EXPERIENCE" },
```
to:
```json
"hero": { "question": "WHO WAS DAVID BOWIE?", "title": "BOWIE", "subtitle": "YADAYADAS", "descriptor": "A Live David Bowie Tribute Show", "tagline": "A LIVE EXPERIENCE" },
```

In `copy.he.json`, change:
```json
"hero": { "question": "מי היה דייויד בואי?", "title": "BOWIE", "subtitle": "YADAYADAS", "tagline": "מופע חי" },
```
to:
```json
"hero": { "question": "מי היה דייויד בואי?", "title": "BOWIE", "subtitle": "YADAYADAS", "descriptor": "מופע מחווה חי לדיוויד בואי", "tagline": "מופע חי" },
```

- [ ] **Step 2: Replace `bowies.eras` in both files (5 entries → 8, matching Task 1's image set)**

In `copy.en.json`, replace the `bowies` object:
```json
"bowies": {
  "eras": [
    { "name": "1967", "line": "The beginning.", "image": "/assets/bowie/bowie-deram-debut-1967.jpg" },
    { "name": "ZIGGY / ALADDIN SANE", "line": "Color. Energy. Theatricality.", "image": "/assets/bowie/bowie-aladdin-sane.jpg" },
    { "name": "DIAMOND DOGS", "line": "The character got stranger.", "image": "/assets/bowie/bowie-diamond-dogs-pose.jpg" },
    { "name": "DIAMOND DOGS", "line": "And stranger still.", "image": "/assets/bowie/bowie-diamond-dogs-eyepatch.jpg" },
    { "name": "LET'S DANCE", "line": "Color. Movement. Pop.", "image": "/assets/bowie/bowie-lets-dance-era-portrait.jpg" },
    { "name": "LIVE", "line": "On stage, the characters became one thing.", "image": "/assets/bowie/bowie-live-stage-guitar.jpg" },
    { "name": "EARTHLING", "line": "Reinvented again.", "image": "/assets/bowie/bowie-live-earthling-era.jpg" },
    { "name": "THE MAN", "line": "Behind every character, still David Jones.", "image": "/assets/bowie/bowie-portrait-stark-bw.jpg" }
  ]
},
```

In `copy.he.json`, replace the `bowies` object:
```json
"bowies": {
  "eras": [
    { "name": "1967", "line": "ההתחלה.", "image": "/assets/bowie/bowie-deram-debut-1967.jpg" },
    { "name": "זיגי / אלאדין סיין", "line": "צבע. אנרגיה. תיאטרליות.", "image": "/assets/bowie/bowie-aladdin-sane.jpg" },
    { "name": "DIAMOND DOGS", "line": "הדמות הפכה מוזרה יותר.", "image": "/assets/bowie/bowie-diamond-dogs-pose.jpg" },
    { "name": "DIAMOND DOGS", "line": "ומוזרה עוד יותר.", "image": "/assets/bowie/bowie-diamond-dogs-eyepatch.jpg" },
    { "name": "LET'S DANCE", "line": "צבע. תנועה. פופ.", "image": "/assets/bowie/bowie-lets-dance-era-portrait.jpg" },
    { "name": "LIVE", "line": "על הבמה, הדמויות הפכו לדבר אחד.", "image": "/assets/bowie/bowie-live-stage-guitar.jpg" },
    { "name": "EARTHLING", "line": "המצאה מחדש, שוב.", "image": "/assets/bowie/bowie-live-earthling-era.jpg" },
    { "name": "האיש", "line": "מאחורי כל דמות, עדיין דייויד ג'ונס.", "image": "/assets/bowie/bowie-portrait-stark-bw.jpg" }
  ]
},
```

- [ ] **Step 3: Commit**

```bash
git add src/content/copy.he.json src/content/copy.en.json
git commit -m "Add Hero descriptor copy and restructure Bowie eras with real photography"
```

---

## Task 3: Update schema test for the new eras shape

**Files:**
- Modify: `src/content.schema.test.ts:78-85`
- Test: this file IS the test — no separate test file

- [ ] **Step 1: Update the test**

Replace:
```ts
  it('both locales define 5 Bowie eras with name and line', () => {
    expect(copyHe.bowies.eras).toHaveLength(5);
    expect(copyEn.bowies.eras).toHaveLength(5);
    for (const era of [...copyHe.bowies.eras, ...copyEn.bowies.eras]) {
      expect(era.name).toBeTruthy();
      expect(era.line).toBeTruthy();
    }
  });
```
with:
```ts
  it('both locales define 8 Bowie eras with name, line, and image', () => {
    expect(copyHe.bowies.eras).toHaveLength(8);
    expect(copyEn.bowies.eras).toHaveLength(8);
    for (const era of [...copyHe.bowies.eras, ...copyEn.bowies.eras] as any[]) {
      expect(era.name).toBeTruthy();
      expect(era.line).toBeTruthy();
      expect(era.image).toMatch(/^\/assets\/bowie\/.+\.jpg$/);
    }
  });
```

- [ ] **Step 2: Run the test — expect it to fail until Task 2 lands**

Run: `npx vitest run src/content.schema.test.ts`
Expected: passes if Task 2 is already committed (it should be, tasks run in order); if run standalone before Task 2, FAILs with a length mismatch — that's expected, not a bug.

- [ ] **Step 3: Commit**

```bash
git add src/content.schema.test.ts
git commit -m "Update schema test for restructured 8-entry Bowie eras"
```

---

## Task 4: Rebuild Hero composition

**Files:**
- Modify: `src/components/Hero.astro`

- [ ] **Step 1: Update Props interface and template**

Add `descriptor: string` to the `Props` interface. Replace the plain-text title with the logo image, and add the descriptor line. New template body:

```astro
---
interface Props {
  question: string;
  title: string;
  subtitle: string;
  descriptor: string;
  tagline: string;
}
const { question, subtitle, descriptor } = Astro.props;
---

<section id="hero" class="hero has-grain">
  <div class="hero__bg" aria-hidden="true">
    <img
      src="/assets/hero/hero-band-live.jpg"
      alt=""
      class="hero__bg-image"
      data-hero-bg-image
      fetchpriority="high"
    />
  </div>
  <div class="hero__scrim" aria-hidden="true"></div>
  <p class="hero__question label">{question}</p>
  <img
    src="/assets/logo/yadayadas-logo.png"
    alt={subtitle}
    class="hero__logo"
    data-hero-logo
  />
  <p class="hero__descriptor">{descriptor}</p>
</section>
```

Note: `title` stays in the `Props` interface (callers still pass it — don't break the two `index.astro` call sites in Task 5) but is no longer rendered directly; the `<img alt>` on the logo carries the equivalent text (`subtitle`, i.e. "YADAYADAS") for accessibility. Drop `tagline` from the template (per spec §3, it read as redundant once `descriptor` exists) but keep it in `Props`/copy so `index.astro` doesn't need touching in this task — Task 5 removes the unused prop wiring.

- [ ] **Step 2: Update styles**

Replace `.hero__title`/`.hero__subtitle`/`.hero__tagline` rules with `.hero__logo`/`.hero__descriptor`:

```css
  .hero__logo {
    position: relative;
    z-index: 1;
    width: min(70vw, 420px);
    height: auto;
    margin: var(--space-md) 0;
  }

  .hero__descriptor {
    position: relative;
    z-index: 1;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--size-display-md);
    margin: 0;
  }

  .hero__question,
  .hero__logo,
  .hero__descriptor {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .hero__question,
    .hero__logo,
    .hero__descriptor,
    .hero__bg-image {
      opacity: 1;
      transform: none;
    }
  }
```

Also update the `<noscript>` block's selector list (`#hero .hero__question, #hero .hero__logo, #hero .hero__descriptor, #hero .hero__bg-image`) to match the renamed classes.

- [ ] **Step 3: Update the reveal script**

Retarget the timeline at the renamed elements — `.hero__title` → `.hero__logo` (keep the `scale: 0.85 → 1` treatment), `.hero__subtitle` → `.hero__descriptor`, drop the `.hero__tagline` tween entirely:

```js
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero__question', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 })
      .to(bgImage, { opacity: 1, scale: 1.05, duration: 1.6, ease: 'power2.out' }, '<')
      .fromTo('.hero__logo', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.1 }, '+=0.3')
      .fromTo('.hero__descriptor', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: still all passing — this task doesn't touch anything a unit test asserts on directly (a11y test checks `<h1>` count/alt attributes generically, both still satisfied: no `<h1>` was in Hero before or after, logo `<img>` has `alt`).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro
git commit -m "Rebuild Hero: logo becomes part of the composition, add tribute-show descriptor"
```

---

## Task 5: Build BowieCollage.astro and wire it in, retiring QuestionAndBowies

**Files:**
- Create: `src/components/BowieCollage.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`
- Delete: `src/components/QuestionAndBowies.astro`

- [ ] **Step 1: Create the component**

```astro
---
interface Era {
  name: string;
  line: string;
  image: string;
}
interface Props {
  locale: 'he' | 'en';
  heading: string;
  fragments: string[];
  eras: Era[];
}
const { locale, heading, fragments, eras } = Astro.props;
---

<section id="bowie-collage" class="collage has-grain">
  <h2 class="collage__heading">{heading}</h2>
  <p class="collage__fragments">{fragments.join(' · ')}</p>

  <div class="collage__grid" data-collage-grid>
    {eras.map((era, i) => (
      <div class={`collage__cell collage__cell--${i}`} data-collage-cell>
        <img
          src={era.image}
          alt={locale === 'he' ? `דייויד בואי — ${era.name}` : `David Bowie — ${era.name}`}
          loading="lazy"
          class="collage__image"
        />
        <span class="collage__label label">{era.name}</span>
      </div>
    ))}
  </div>
</section>

<noscript>
  <style is:global>
    #bowie-collage .collage__cell {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>

<style>
  .collage {
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
  }

  .collage__heading {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-md);
    text-align: center;
    margin: 0 0 var(--space-sm);
  }

  .collage__fragments {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    opacity: 0.6;
    margin: 0 0 var(--space-lg);
  }

  .collage__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 22vh;
    gap: var(--space-sm);
    max-width: 72rem;
    margin-inline: auto;
  }

  .collage__cell {
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(24px);
  }

  .collage__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: grayscale(1);
  }

  .collage__label {
    position: absolute;
    bottom: var(--space-xs);
    left: var(--space-xs);
    color: var(--color-off-white);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  }

  /* Asymmetric placement, desktop: mixed spans so it reads as an editorial
     grid rather than a uniform photo wall. Cell order matches Task 2's
     8-entry eras array. */
  @media (min-width: 700px) {
    .collage__cell--0 { grid-column: span 2; grid-row: span 2; }
    .collage__cell--1 { grid-column: span 2; grid-row: span 1; }
    .collage__cell--2 { grid-column: span 1; grid-row: span 1; }
    .collage__cell--3 { grid-column: span 1; grid-row: span 1; }
    .collage__cell--4 { grid-column: span 2; grid-row: span 1; }
    .collage__cell--5 { grid-column: span 2; grid-row: span 2; }
    .collage__cell--6 { grid-column: span 1; grid-row: span 1; }
    .collage__cell--7 { grid-column: span 1; grid-row: span 1; }
  }

  /* Mobile: two alternating widths so the asymmetry survives narrow
     viewports instead of collapsing to a uniform single column. */
  @media (max-width: 699px) {
    .collage__grid {
      grid-template-columns: 1fr;
      grid-auto-rows: 34vh;
    }
    .collage__cell--0,
    .collage__cell--2,
    .collage__cell--4,
    .collage__cell--6 {
      margin-inline-end: 12%;
    }
    .collage__cell--1,
    .collage__cell--3,
    .collage__cell--5,
    .collage__cell--7 {
      margin-inline-start: 12%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .collage__cell {
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

  const cells = gsap.utils.toArray('[data-collage-cell]') as HTMLElement[];

  if (prefersReducedMotion()) {
    cells.forEach((c) => {
      c.style.opacity = '1';
      c.style.transform = 'none';
    });
  } else {
    gsap.to(cells, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '[data-collage-grid]',
        start: 'top 80%',
      },
    });

    if ('fonts' in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
</script>
```

- [ ] **Step 2: Wire into both pages**

In `src/pages/he/index.astro` and `src/pages/en/index.astro`: replace the `QuestionAndBowies` import with `BowieCollage`, and replace:
```astro
    <QuestionAndBowies
      heading={copy.question.heading}
      fragments={copy.question.fragments}
      eras={copy.bowies.eras}
    />
```
with:
```astro
    <BowieCollage
      locale="he"
      heading={copy.question.heading}
      fragments={copy.question.fragments}
      eras={copy.bowies.eras}
    />
```
(`locale="en"` in the English page.)

Also in Task 4's Hero: pass the new `descriptor` prop at both call sites —
```astro
    <Hero
      question={copy.hero.question}
      title={copy.hero.title}
      subtitle={copy.hero.subtitle}
      descriptor={copy.hero.descriptor}
      tagline={copy.hero.tagline}
    />
```

- [ ] **Step 3: Delete the old component**

```bash
git rm src/components/QuestionAndBowies.astro
```

- [ ] **Step 4: Build and run full test suite**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass (including the a11y tests, which read from `dist/`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Replace QuestionAndBowies horizontal-scroll section with BowieCollage grid"
```

---

## Task 6: Visual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server and check both locales**

Run the dev server, open `/he/` and `/en/`, and confirm:
- Hero shows the live band photo, the YADAYADAS logo prominently in the composition (not tiny), and the new descriptor line, all revealing on load per the existing animation timing.
- Scrolling past Hero, the Bowie Collage section shows 8 photos in an asymmetric grid with era labels, no horizontal scroll or pinning at any viewport width (resize to ~375px and to desktop width — confirm no sideways scrollbar appears on the section at either).
- Both locales render correctly (RTL/LTR), collage labels in the correct language.

- [ ] **Step 2: Check reduced-motion and no-JS fallbacks**

Emulate `prefers-reduced-motion: reduce` (or check the CSS media query manually) and confirm Hero + Collage content is fully visible without motion. Confirm the `<noscript>` blocks in both components force full opacity.

- [ ] **Step 3: Report**

No commit for this task — it's a verification checkpoint. If issues are found, fix them as amendments to the relevant task's commit (or a new small commit) before moving to merge.
