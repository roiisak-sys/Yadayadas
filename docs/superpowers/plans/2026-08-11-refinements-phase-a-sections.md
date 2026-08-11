# Content Refinements Phase A — Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `Sound.astro`; merge `WhyStatement`/`Story`/`EditorialQuotes` into one short `BowieStory` section; add `BandGallery`; reorder the page flow per the brief. Full spec: `docs/superpowers/specs/2026-08-11-content-refinements-design.md` (§2, §3, §7).

**Architecture:** `MusicStartsAndBand.astro` splits into two single-purpose components — `MusicTransition.astro` (just the "then the music starts" label) and `BandMembers.astro` (just the grid, renamed) — because `BandGallery` now sits between them in the flow. `BowieStory.astro` is new. `BandGallery.astro` is new. Four components are deleted (`Sound`, `Story`, `EditorialQuotes`, `WhyStatement`) along with `story-beats.json`.

**Tech Stack:** Astro 5, GSAP 3 + ScrollTrigger (existing patterns only), sharp (asset prep).

---

## Task 1: Remove Sound.astro

**Files:**
- Delete: `src/components/Sound.astro`
- Modify: `src/content/copy.he.json`, `src/content/copy.en.json` (remove `sound` key)
- Modify: `src/pages/he/index.astro`, `src/pages/en/index.astro` (remove import + call site)

- [ ] **Step 1: Delete the component and remove its copy key**

```bash
git rm src/components/Sound.astro
```

Remove `"sound": { "words": [...] },` from both `copy.he.json` and `copy.en.json`.

- [ ] **Step 2: Remove the import and call site from both pages**

Remove `import Sound from '../../components/Sound.astro';` and the `<Sound words={copy.sound.words} />` line from both `src/pages/he/index.astro` and `src/pages/en/index.astro`.

- [ ] **Step 3: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds (no more 404 for `under-pressure.mp4` in dev — that video was only ever referenced by `Sound.astro`), all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Remove Sound section (video + word-cloud), per refinement brief section 1"
```

---

## Task 2: Delete Story, EditorialQuotes, WhyStatement, story-beats.json

**Files:**
- Delete: `src/components/Story.astro`, `src/components/EditorialQuotes.astro`, `src/components/WhyStatement.astro`, `src/content/story-beats.json`
- Modify: `src/content.schema.test.ts` (remove the `story-beats.json` describe block)
- Modify: `src/content/copy.he.json`, `src/content/copy.en.json` (remove `why`, `story`, `quotes` keys — replaced by `bowieStory` in Task 3)
- Modify: `src/pages/he/index.astro`, `src/pages/en/index.astro` (remove imports + call sites)

This task only removes; Task 3 adds the replacement. Doing it as a separate step keeps each commit's diff readable (removal vs. addition), matching how this project's other multi-part changes have been committed.

- [ ] **Step 1: Delete the components and data file**

```bash
git rm src/components/Story.astro src/components/EditorialQuotes.astro src/components/WhyStatement.astro src/content/story-beats.json
```

- [ ] **Step 2: Remove the `story-beats.json` test block**

In `src/content.schema.test.ts`, remove:
```ts
import storyBeats from './content/story-beats.json';
```
and the entire block:
```ts
describe('story-beats.json', () => {
  it('has at least 10 beats covering the Thin White Duke/Berlin arc', () => {
    expect((storyBeats as any[]).length).toBeGreaterThanOrEqual(10);
  });

  it('every beat has bilingual text and an order index', () => {
    (storyBeats as any[]).forEach((b, i) => {
      expect(b.he).toBeTruthy();
      expect(b.en).toBeTruthy();
      expect(b.order).toBe(i);
    });
  });
});
```

- [ ] **Step 3: Remove the now-orphaned copy keys**

Remove `"why": {...}`, `"story": {...}`, and `"quotes": {...}` from both `copy.he.json` and `copy.en.json`.

- [ ] **Step 4: Remove imports and call sites from both pages**

Remove these three imports and their corresponding JSX-like call sites from both `src/pages/he/index.astro` and `src/pages/en/index.astro`:
```astro
import WhyStatement from '../../components/WhyStatement.astro';
...
import Story from '../../components/Story.astro';
import EditorialQuotes from '../../components/EditorialQuotes.astro';
...
<WhyStatement line1={...} line2={...} line3={...} line4={...} />
...
<Story locale="he" heading={copy.story.heading} beats={storyBeats} />
<EditorialQuotes quote={copy.quotes.primary} />
```
Also remove `import storyBeats from '../../content/story-beats.json';` from both pages' frontmatter.

- [ ] **Step 5: Build — expect it to fail**

Run: `npm run build`
Expected: FAILS or produces an incomplete page — the flow now has a gap where `BowieStory` (Task 3) belongs. This is expected; don't try to make this task's build pass in isolation. Do not run the full test suite yet either — `content.schema.test.ts`'s key-parity test will fail until Task 3 adds matching `bowieStory` keys to both files.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Remove WhyStatement, Story, and EditorialQuotes (replaced by BowieStory in the next commit)"
```

---

## Task 3: Add BowieStory.astro

**Files:**
- Create: `src/components/BowieStory.astro`
- Modify: `src/content/copy.he.json`, `src/content/copy.en.json` (add `bowieStory`)
- Modify: `src/pages/he/index.astro`, `src/pages/en/index.astro` (import + call site)

- [ ] **Step 1: Add `bowieStory` copy to both files**

In `copy.en.json`, add (in place of where `why`/`story`/`quotes` used to be):
```json
"bowieStory": {
  "paragraph": "Bowie was never just music. Never just the characters he built and discarded. He kept crossing lines — between sound, image, identity — and became something new each time. Our show doesn't retell his biography. It follows that same instinct: through the music, the characters, the reinvention, again and again.",
  "pullQuote": "Who am I now? What happens if I become this person? When do I need to leave him behind? And who do I become next?"
},
```

In `copy.he.json`:
```json
"bowieStory": {
  "paragraph": "בואי מעולם לא היה רק מוזיקה. לא רק הדמויות שהוא בנה ונטש. הוא כל הזמן חצה גבולות — בין צליל, דימוי וזהות — והפך למשהו חדש בכל פעם מחדש. המופע שלנו לא מספר את הביוגרפיה שלו. הוא עוקב אחרי אותו אינסטינקט: דרך המוזיקה, הדמויות, ההמצאה מחדש, שוב ושוב.",
  "pullQuote": "מי אני עכשיו? מה קורה אם אני הופך לדמות הזו? מתי אני צריך לנטוש אותה? ומי אני הופך להיות אחר כך?"
},
```

- [ ] **Step 2: Create the component**

```astro
---
interface Props {
  paragraph: string;
  pullQuote: string;
}
const { paragraph, pullQuote } = Astro.props;
---

<section id="bowie-story" class="bowie-story has-grain">
  <p class="bowie-story__paragraph" data-story-line>{paragraph}</p>
  <p class="bowie-story__quote label" data-story-line>{pullQuote}</p>
</section>

<noscript>
  <style is:global>
    #bowie-story .bowie-story__paragraph,
    #bowie-story .bowie-story__quote {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>

<style>
  .bowie-story {
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
    max-width: 36rem;
    margin-inline: auto;
    text-align: center;
  }

  .bowie-story__paragraph {
    font-family: var(--font-body);
    font-style: italic;
    font-weight: 400;
    font-size: var(--size-display-md);
    line-height: 1.5;
    margin: 0;
    opacity: 0;
    transform: translateY(16px);
  }

  .bowie-story__quote {
    margin-top: var(--space-lg);
    opacity: 0;
    transform: translateY(12px);
  }

  @media (prefers-reduced-motion: reduce) {
    .bowie-story__paragraph,
    .bowie-story__quote {
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

  const lines = gsap.utils.toArray('[data-story-line]') as HTMLElement[];

  if (prefersReducedMotion()) {
    lines.forEach((l) => {
      l.style.opacity = '1';
      l.style.transform = 'none';
    });
  } else {
    gsap.to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.35,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#bowie-story',
        start: 'top 75%',
      },
    });

    if ('fonts' in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
</script>
```

Note `--size-display-md` here is deliberately the *smallest* of the site's display sizes and this section uses no `--size-display-lg`/`xl` at all — per the spec, this section should read as small/intimate relative to every other section on the page, none of which use anything under `--size-display-md` for their primary text.

- [ ] **Step 3: Wire into both pages**

In both `src/pages/he/index.astro` and `src/pages/en/index.astro`, add the import next to `BowieCollage`'s:
```astro
import BowieStory from '../../components/BowieStory.astro';
```
and add the call site immediately after `<BowieCollage ... />`:
```astro
    <BowieStory
      paragraph={copy.bowieStory.paragraph}
      pullQuote={copy.bowieStory.pullQuote}
    />
```

- [ ] **Step 4: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass (the key-parity test in `content.schema.test.ts` now passes again since both copy files have matching `bowieStory` shapes).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add BowieStory: short poetic replacement for the removed biography section"
```

---

## Task 4: Prepare Band Gallery images

**Files:**
- Create: `scripts/prepare-gallery-images.mjs`

- [ ] **Step 1: Write the script**

```js
// One-off script: process real band photography for the new BandGallery
// section from C:\Users\roiis\OneDrive\Pictures\band images into
// public/assets/gallery/. Re-crops individual member shots differently
// than their Band Members section usage (tighter/closer) so the gallery
// doesn't repeat the exact same images back-to-back with that section.
//
// Usage: node scripts/prepare-gallery-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SOURCE_DIR = 'C:/Users/roiis/OneDrive/Pictures/band images';
const OUT_DIR = join(REPO_ROOT, 'public/assets/gallery');

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // Dominant image: full band on stage, blue/yellow stage light, crowd
  // silhouettes in foreground. Verified content this session.
  await sharp(join(SOURCE_DIR, 'ebbbddb8-a363-4189-a243-c9de0d54d7c9.jpg'))
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(OUT_DIR, 'gallery-dominant-full-band.jpg'));
  console.log('dominant: ebbbddb8... -> gallery-dominant-full-band.jpg');

  // Supporting crops: same source photos as Band Members, but cropped
  // tighter (closer to the performer, less surrounding stage) so they
  // read as a distinct set, not a repeat.
  const supportingCrops = [
    { src: 'ROI ISAK.jpg', dest: 'gallery-roi-isak-crop.jpg' },
    { src: 'itsik galanti.jpg', dest: 'gallery-itzik-galanti-crop.jpg' },
    { src: 'gil idan.jpg', dest: 'gallery-gil-idan-crop.jpg' },
  ];
  for (const { src, dest } of supportingCrops) {
    await sharp(join(SOURCE_DIR, src))
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(join(OUT_DIR, dest));
    console.log(`supporting: ${src} -> ${dest}`);
  }

  console.log('Done.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
```

- [ ] **Step 2: Run it**

Run: `node scripts/prepare-gallery-images.mjs`
Expected: 4 lines of `... -> ...` output, then `Done.`, and `public/assets/gallery/` contains 4 new `.jpg` files.

- [ ] **Step 3: Spot-check via a fresh-path read**

Copy each of the 4 output files to a new, never-before-used temp filename (e.g. in the scratchpad directory) and view them from that fresh path before trusting them — this project has twice hit a Read-tool image-cache bug this session where a previously-viewed source path rendered stale content. Confirm: the dominant image shows the full band on a lit stage with crowd silhouettes; the three supporting crops show the correct named person (Roi, Itzik, Gil) performing.

- [ ] **Step 4: Commit**

```bash
git add scripts/prepare-gallery-images.mjs public/assets/gallery/
git commit -m "Add prepared Band Gallery images (dominant live shot + 3 supporting crops)"
```

---

## Task 5: Split MusicStartsAndBand into MusicTransition + BandMembers

**Files:**
- Create: `src/components/MusicTransition.astro`
- Create: `src/components/BandMembers.astro`
- Delete: `src/components/MusicStartsAndBand.astro`
- Modify: `src/pages/he/index.astro`, `src/pages/en/index.astro`

`BandGallery` (Task 6) now sits between the transition label and the band grid, so they can no longer be one component.

- [ ] **Step 1: Create MusicTransition.astro**

```astro
---
interface Props {
  label: string;
}
const { label } = Astro.props;
---

<section id="music-starts" class="transition has-grain">
  <p class="label transition__label">{label}</p>
</section>

<style>
  .transition {
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-charcoal);
  }
  .transition__label {
    font-size: var(--size-body);
  }
</style>
```

- [ ] **Step 2: Create BandMembers.astro** (same as the `#band` section from the old `MusicStartsAndBand.astro`, minus the transition section)

```astro
---
interface Member {
  id: string;
  nameHe: string;
  nameEn: string;
  instrumentHe: string;
  instrumentEn: string;
  age: number;
  bioHe: string;
  bioEn: string;
  photo: string;
}
interface Props {
  locale: 'he' | 'en';
  heading: string;
  subheading: string;
  intro: string;
  members: Member[];
}
const { locale, heading, subheading, intro, members } = Astro.props;
const introParagraphs = intro.split('\n\n');
---

<section id="band" class="band has-grain">
  <h2 class="band__heading">{heading}</h2>
  <p class="band__subheading">{subheading}</p>

  <div class="band__intro">
    {introParagraphs.map((p) => (
      <p>{p}</p>
    ))}
  </div>

  <div class="band__grid" data-band-grid>
    {members.map((m) => (
      <div class="band__member" data-band-member>
        <img
          src={m.photo}
          alt={locale === 'he' ? `${m.nameHe} — ${m.instrumentHe}` : `${m.nameEn} — ${m.instrumentEn}`}
          loading="lazy"
          class="band__photo"
        />
        <p class="band__name">{locale === 'he' ? m.nameHe : m.nameEn}</p>
        <p class="band__instrument label">
          {locale === 'he' ? m.instrumentHe : m.instrumentEn}
        </p>
        <p class="band__bio">{locale === 'he' ? m.bioHe : m.bioEn}</p>
      </div>
    ))}
  </div>
</section>

<noscript>
  <style is:global>
    #band .band__member {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>

<style>
  .band {
    background: var(--color-off-white);
    color: var(--color-black);
    padding: var(--space-xl) var(--space-md);
  }

  .band__heading,
  .band__subheading {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-md);
    text-align: center;
    margin: 0;
  }

  .band__intro {
    max-width: 42rem;
    margin-inline: auto;
    margin-top: var(--space-md);
    text-align: center;
  }

  .band__intro p {
    font-family: var(--font-body);
    font-size: var(--size-body);
    line-height: 1.6;
    margin: 0 0 var(--space-sm);
  }

  .band__intro p:last-child {
    margin-bottom: 0;
  }

  .band__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-md);
    margin-top: var(--space-lg);
  }

  .band__member {
    opacity: 0;
    transform: translateY(24px);
  }

  @media (prefers-reduced-motion: reduce) {
    .band__member {
      opacity: 1;
      transform: none;
    }
  }

  .band__photo {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    display: block;
  }

  @media (hover: hover) and (pointer: fine) {
    .band__photo {
      filter: grayscale(1);
      transition: filter 0.4s ease;
    }

    .band__member:hover .band__photo,
    .band__member:focus-within .band__photo {
      filter: grayscale(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .band__photo {
      transition: none;
    }
  }

  .band__name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--size-display-md);
    margin: var(--space-sm) 0 0;
  }

  .band__bio {
    font-family: var(--font-body);
    font-size: var(--size-body);
    line-height: 1.5;
    margin: var(--space-sm) 0 0;
    opacity: 0.85;
  }

  @media (min-width: 700px) {
    .band__grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  gsap.registerPlugin(ScrollTrigger);

  const members = gsap.utils.toArray('[data-band-member]') as HTMLElement[];

  if (prefersReducedMotion()) {
    members.forEach((m) => {
      m.style.opacity = '1';
      m.style.transform = 'none';
    });
  } else {
    gsap.to(members, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '[data-band-grid]',
        start: 'top 75%',
      },
    });

    if ('fonts' in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
</script>
```

- [ ] **Step 3: Delete the old combined component**

```bash
git rm src/components/MusicStartsAndBand.astro
```

- [ ] **Step 4: Update both pages' imports and call sites**

Replace:
```astro
import MusicStartsAndBand from '../../components/MusicStartsAndBand.astro';
```
with:
```astro
import MusicTransition from '../../components/MusicTransition.astro';
import BandMembers from '../../components/BandMembers.astro';
```

Replace the single `<MusicStartsAndBand ... />` call with two separate ones (still adjacent for now — Task 6 inserts `BandGallery` between them):
```astro
    <MusicTransition label={copy.musicStarts.label} />
    <BandMembers
      locale="he"
      heading={copy.band.heading}
      subheading={copy.band.subheading}
      intro={copy.band.intro}
      members={bandMembers.filter((m) => m.role === 'core')}
    />
```
(`locale="en"` in the English page, matching the pattern everywhere else.)

- [ ] **Step 5: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass, page looks identical to before this task (same content, just split across two components).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Split MusicStartsAndBand into MusicTransition + BandMembers, so BandGallery can sit between them"
```

---

## Task 6: Add BandGallery.astro and insert it into the flow

**Files:**
- Create: `src/components/BandGallery.astro`
- Modify: `src/pages/he/index.astro`, `src/pages/en/index.astro`

- [ ] **Step 1: Create the component**

```astro
---
interface Props {
  locale: 'he' | 'en';
}
const { locale } = Astro.props;
---

<section id="band-gallery" class="gallery has-grain">
  <div class="gallery__grid" data-gallery-grid>
    <div class="gallery__cell gallery__cell--dominant" data-gallery-cell>
      <img
        src="/assets/gallery/gallery-dominant-full-band.jpg"
        alt={locale === 'he' ? 'YADAYADAS על הבמה' : 'YADAYADAS live on stage'}
        loading="lazy"
        class="gallery__image"
      />
    </div>
    <div class="gallery__cell" data-gallery-cell>
      <img
        src="/assets/gallery/gallery-roi-isak-crop.jpg"
        alt=""
        loading="lazy"
        class="gallery__image"
      />
    </div>
    <div class="gallery__cell" data-gallery-cell>
      <img
        src="/assets/gallery/gallery-itzik-galanti-crop.jpg"
        alt=""
        loading="lazy"
        class="gallery__image"
      />
    </div>
    <div class="gallery__cell" data-gallery-cell>
      <img
        src="/assets/gallery/gallery-gil-idan-crop.jpg"
        alt=""
        loading="lazy"
        class="gallery__image"
      />
    </div>
  </div>
</section>

<noscript>
  <style is:global>
    #band-gallery .gallery__cell {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>

<style>
  .gallery {
    background: var(--color-black);
    padding: var(--space-lg) var(--space-md);
  }

  .gallery__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 24vh;
    gap: var(--space-sm);
    max-width: 64rem;
    margin-inline: auto;
  }

  .gallery__cell {
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
  }

  .gallery__cell--dominant {
    grid-column: span 2;
    grid-row: span 2;
  }

  .gallery__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease, filter 0.4s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .gallery__cell:hover .gallery__image {
      transform: scale(1.04);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gallery__cell {
      opacity: 1;
      transform: none;
    }
    .gallery__image {
      transition: none;
    }
  }

  /* Mobile: dominant image stays full-width and tall; supporting images
     become a 3-across strip beneath it, rather than a naive uniform stack. */
  @media (max-width: 699px) {
    .gallery__grid {
      grid-template-columns: repeat(3, 1fr);
      grid-auto-rows: 16vh;
    }
    .gallery__cell--dominant {
      grid-column: 1 / -1;
      grid-row: span 2;
      aspect-ratio: 4 / 3;
      height: auto;
    }
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  gsap.registerPlugin(ScrollTrigger);

  const cells = gsap.utils.toArray('[data-gallery-cell]') as HTMLElement[];

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
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '[data-gallery-grid]',
        start: 'top 80%',
      },
    });

    if ('fonts' in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
</script>
```

Note the three supporting images use `alt=""` (decorative) rather than naming the person — this section is about the band's live energy as a whole, not identifying individuals (that's what `BandMembers`, immediately after it, is for). The dominant image gets real alt text since it's the section's one substantive image.

- [ ] **Step 2: Insert into both pages' flow**

Add the import next to `BandMembers`'s:
```astro
import BandGallery from '../../components/BandGallery.astro';
```

Insert `<BandGallery locale="he" />` between `<MusicTransition ... />` and `<BandMembers ... />`:
```astro
    <MusicTransition label={copy.musicStarts.label} />
    <BandGallery locale="he" />
    <BandMembers
      locale="he"
      ...
```
(`locale="en"` in the English page.)

- [ ] **Step 3: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add BandGallery, insert into flow between the music transition and Band Members"
```

---

## Task 7: Visual verification

**Files:** none (verification only)

- [ ] **Step 1: Full walkthrough, both locales**

Start the dev server, open `/he/` and `/en/`, scroll the full page and confirm the new flow: Hero → Bowie Collage → **Bowie Story** (small italic paragraph + pull-quote, noticeably smaller/quieter than every other section) → "then the music starts" transition → **Band Gallery** (asymmetric grid, one large image + 3 smaller, full color) → Band Members → Events (unchanged, Phase B territory) → Contact.

Confirm `Sound`, the old `Story`, `EditorialQuotes`, and `WhyStatement` no longer appear anywhere, and there's no console error about a missing `under-pressure.mp4` (it was only ever referenced by the now-deleted `Sound.astro`).

- [ ] **Step 2: Check reduced-motion and no-JS fallbacks**

Confirm `BowieStory` and `BandGallery` are both fully visible under `prefers-reduced-motion: reduce` and via their `<noscript>` fallbacks.

- [ ] **Step 3: Check mobile width (375px)**

Confirm `BandGallery`'s dominant-image-plus-strip mobile layout reads correctly and there's no horizontal overflow anywhere in the new sections.

- [ ] **Step 4: Report**

No commit for this task — verification checkpoint only.
