# Redesign Phase 2 — Why Statement + Band + Live Shows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the short "why reinvention matters" editorial statement the brief asks for (§5), remove ages from the Band section and raise its polish (§6), and redesign the Live Shows section's hierarchy/CTA/mobile layout (§7).

**Architecture:** One new component (`WhyStatement.astro`), two components modified in place (`MusicStartsAndBand.astro`, `Events.astro`). No new copy schema shape beyond one new top-level `why` object. Full spec: `docs/superpowers/specs/2026-08-11-yadayadas-redesign-design.md` (§5, §6, §7).

**Tech Stack:** Astro 5, GSAP 3 + ScrollTrigger (existing patterns only), Vitest.

---

## Task 1: Add WhyStatement component and copy

**Files:**
- Create: `src/components/WhyStatement.astro`
- Modify: `src/content/copy.he.json`
- Modify: `src/content/copy.en.json`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Add `why` copy to both files**

In `copy.en.json`, add after the `"bowies"` object (before `"musicStarts"`):
```json
"why": {
  "line1": "David Bowie was never just a musician.",
  "line2": "He built characters, sounds, entire worlds — and had the courage to leave each one behind before it calcified.",
  "line3": "That's not a biography detail. It's the whole point.",
  "line4": "YADAYADAS doesn't perform Bowie's songs so much as follow his instinct: to keep becoming something else."
},
```

In `copy.he.json`, add after the `"bowies"` object (before `"musicStarts"`):
```json
"why": {
  "line1": "דייויד בואי מעולם לא היה רק מוזיקאי.",
  "line2": "הוא בנה דמויות, צלילים, עולמות שלמים — והעז לנטוש כל אחד מהם לפני שהתקבע.",
  "line3": "זה לא פרט ביוגרפי. זו כל הנקודה.",
  "line4": "YADAYADAS לא מבצעים את השירים של בואי כמו שהם עוקבים אחרי האינסטינקט שלו: להמשיך להפוך למשהו אחר."
},
```

- [ ] **Step 2: Create the component**

```astro
---
interface Props {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
}
const { line1, line2, line3, line4 } = Astro.props;
---

<section id="why" class="why has-grain">
  <p class="why__line why__line--lead" data-why-line>{line1}</p>
  <p class="why__line" data-why-line>{line2}</p>
  <p class="why__line why__line--emphasis" data-why-line>{line3}</p>
  <p class="why__line" data-why-line>{line4}</p>
</section>

<noscript>
  <style is:global>
    #why .why__line {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>

<style>
  .why {
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
    max-width: 44rem;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    text-align: center;
  }

  .why__line {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--size-display-md);
    line-height: 1.3;
    margin: 0;
    opacity: 0;
    transform: translateY(20px);
  }

  .why__line--lead {
    font-weight: 800;
  }

  .why__line--emphasis {
    color: var(--color-accent-green);
  }

  @media (prefers-reduced-motion: reduce) {
    .why__line {
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

  const lines = gsap.utils.toArray('[data-why-line]') as HTMLElement[];

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
      stagger: 0.25,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#why',
        start: 'top 75%',
      },
    });

    if ('fonts' in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
</script>
```

- [ ] **Step 3: Wire into both pages, between BowieCollage and MusicStartsAndBand**

In both `src/pages/he/index.astro` and `src/pages/en/index.astro`, add the import:
```astro
import WhyStatement from '../../components/WhyStatement.astro';
```
and insert between `<BowieCollage ... />` and `<MusicStartsAndBand ...>`:
```astro
    <WhyStatement
      line1={copy.why.line1}
      line2={copy.why.line2}
      line3={copy.why.line3}
      line4={copy.why.line4}
    />
```

- [ ] **Step 4: Update the "both locales define the same set of keys" test — no change needed, but verify**

Run: `npx vitest run src/content.schema.test.ts`
Expected: still passes — the `why` key was added to both files with matching shape in Step 1, so the existing key-parity test should pass unmodified. If it fails, the two files' `why` objects have mismatched keys; fix them to match exactly.

- [ ] **Step 5: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add WhyStatement section — short reinvention editorial, per brief section 03"
```

---

## Task 2: Remove ages from Band section, raise visual polish

**Files:**
- Modify: `src/components/MusicStartsAndBand.astro`

- [ ] **Step 1: Remove age from the rendered instrument line**

Change:
```astro
        <p class="band__instrument label">
          {locale === 'he' ? m.instrumentHe : m.instrumentEn} · {m.age}
        </p>
```
to:
```astro
        <p class="band__instrument label">
          {locale === 'he' ? m.instrumentHe : m.instrumentEn}
        </p>
```

Leave the `Member` interface's `age: number` field and `band-members.json`'s `age` values untouched — only stop rendering it.

- [ ] **Step 2: Add grayscale-to-color hover treatment**

In the `<style>` block, update `.band__photo` and add a hover rule scoped to devices that actually support hover (so touch devices aren't stuck in an unreachable grayscale state):

```css
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
```

(This is additive — `.band__photo` had no `filter` before; devices without `(hover: hover)` — i.e. touch — get full color always, never stuck mid-grayscale.)

- [ ] **Step 3: Bump `band__name` hierarchy relative to `band__instrument`**

Change:
```css
  .band__name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--size-body);
    margin: var(--space-sm) 0 0;
  }
```
to:
```css
  .band__name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--size-display-md);
    margin: var(--space-sm) 0 0;
  }
```

- [ ] **Step 4: Visually verify no leftover age text**

Run: `npm run build`, then check `dist/he/index.html` and `dist/en/index.html` don't contain a stray `· ` followed by a bare number in the band section markup (grep for the pattern `· \d` — should return nothing in the band member blocks).

Run: `grep -n "band__instrument" -A2 dist/he/index.html | head -20` and confirm the age number is gone from the rendered output.

- [ ] **Step 5: Commit**

```bash
git add src/components/MusicStartsAndBand.astro
git commit -m "Remove age display, add grayscale-to-color hover, raise name hierarchy in Band section"
```

---

## Task 3: Redesign Live Shows hierarchy, CTA, and mobile layout

**Files:**
- Modify: `src/components/Events.astro`

- [ ] **Step 1: Restyle the CTA to match FinalScene's button treatment**

Change:
```css
  .events__cta {
    grid-column: 1 / -1;
    justify-self: start;
    color: var(--color-accent-green);
    text-decoration: underline;
  }
```
to:
```css
  .events__cta {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: var(--space-xs);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-black);
    background: var(--color-accent-green);
    padding: var(--space-xs) var(--space-md);
    text-decoration: none;
  }
```

- [ ] **Step 2: Raise venue name as the visual anchor, restyle date/city as secondary**

Change:
```css
  .events__venue {
    font-family: var(--font-display);
    font-size: var(--size-body);
  }
```
to:
```css
  .events__venue {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--size-display-md);
    grid-column: 1 / -1;
    order: -1;
  }
```

And update the template's element order so venue renders first in markup (screen-reader order matches visual order — CSS `order` alone would desync the two). Change:
```astro
        <li class="events__row">
          <span class="events__date label">{formatDate(e.dateISO, locale)}</span>
          <span class="events__venue">{locale === 'he' ? e.venueHe : e.venueEn}</span>
          <span class="events__city label">{locale === 'he' ? e.cityHe : e.cityEn}</span>
```
to:
```astro
        <li class="events__row">
          <span class="events__venue">{locale === 'he' ? e.venueHe : e.venueEn}</span>
          <span class="events__date label">{formatDate(e.dateISO, locale)}</span>
          <span class="events__city label">{locale === 'he' ? e.cityHe : e.cityEn}</span>
```
and remove the now-redundant `order: -1` from `.events__venue` (markup order now matches visual order directly).

- [ ] **Step 3: Add a stacked mobile layout below ~480px**

Add to the `<style>` block:
```css
  @media (max-width: 480px) {
    .events__row {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
    .events__cta {
      justify-self: stretch;
      text-align: center;
    }
  }
```

- [ ] **Step 4: Restyle the empty state to match**

Change:
```css
  .events__empty {
    text-align: center;
    font-size: var(--size-body);
  }
```
to:
```css
  .events__empty {
    text-align: center;
    font-size: var(--size-display-md);
    font-family: var(--font-display);
    font-weight: 600;
    opacity: 0.6;
  }
```

- [ ] **Step 5: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass. Since the current `events.json` has zero `upcoming` entries, the empty state is what's actually visible — verify it in the browser (Task 4) rather than assuming the row styling is correct from code alone.

- [ ] **Step 6: Commit**

```bash
git add src/components/Events.astro
git commit -m "Redesign Live Shows: venue as visual anchor, button CTA, stacked mobile layout"
```

---

## Task 4: Visual verification

**Files:** none (verification only)

- [ ] **Step 1: Check both locales**

Start the dev server, open `/he/` and `/en/`, scroll through and confirm:
- WhyStatement appears between the Bowie Collage and "then the music starts" transition, 4 lines revealing in sequence on scroll.
- Band section: no age numbers visible anywhere; hovering a member's photo (desktop) shifts it from grayscale to color; touch/no-hover devices show photos in color always.
- Events section: since there are no upcoming shows, confirm the restyled empty state reads clearly and doesn't look broken/empty-by-accident.

- [ ] **Step 2: Check reduced-motion and no-JS fallbacks**

Confirm WhyStatement's lines are fully visible with `prefers-reduced-motion: reduce`, and via the `<noscript>` fallback.

- [ ] **Step 3: Check mobile width (375px) for Events**

Resize to 375px and confirm the (currently-empty) Events section's empty-state styling reads fine; if/when upcoming shows exist later, the `max-width: 480px` stacked layout from Task 3 Step 3 governs — there's nothing to visually check for the row layout right now since there's no data, but confirm no layout regression from the CSS changes.

- [ ] **Step 4: Report**

No commit for this task — verification checkpoint only.
