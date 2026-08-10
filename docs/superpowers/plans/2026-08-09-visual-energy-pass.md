# Visual Energy Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the three concrete gaps the final creative review flagged against the original
design spec — Hero has no imagery/parallax, stage-light accent colors are barely used, grain
texture is applied to only 3 of 9 sections — without touching content, copy, or the typeface
decision (those are separate, non-code follow-ups).

**Architecture:** Modify existing components in place (`Hero.astro`, `QuestionAndBowies.astro`,
`Sound.astro`, `EditorialQuotes.astro`, `MusicStartsAndBand.astro`, `Story.astro`, `Events.astro`,
`FinalScene.astro`) — no new components, no content-schema changes. Reuses the existing GSAP/
reduced-motion/noscript patterns already established across the codebase.

**Tech Stack:** Same as the existing site — Astro, GSAP + ScrollTrigger, vanilla CSS with design
tokens. No new dependencies.

---

## Task 1: Hero Background Image + Reveal

**Files:**
- Modify: `src/components/Hero.astro`

- [ ] **Step 1: Add the background image and scrim to the markup**

Read the current `src/components/Hero.astro` first, then replace its `.hero__bg` div and add a new
scrim layer. The `<section>` body should become:

```astro
<section id="hero" class="hero has-grain">
  <div class="hero__bg" aria-hidden="true">
    <img
      src="/assets/photos/photo_01.jpg"
      alt=""
      class="hero__bg-image"
      data-hero-bg-image
    />
  </div>
  <div class="hero__scrim" aria-hidden="true"></div>
  <p class="hero__question label">{question}</p>
  <h1 class="hero__title">{title}</h1>
  <p class="hero__subtitle">{subtitle}</p>
  <p class="hero__tagline label">{tagline}</p>
</section>
```

(`photo_01.jpg` — the black-and-white outdoor rehearsal shot — is currently unused anywhere else
in the site after the band-photo duplicate fix, and its moody/documentary tone matches the Hero's
"who was David Bowie?" mystery framing described in the design spec.)

Keep the existing `<noscript>` block, but add the background image to it so it's also forced
visible when JS is disabled:

```astro
<noscript>
  <style is:global>
    #hero .hero__question,
    #hero .hero__title,
    #hero .hero__subtitle,
    #hero .hero__tagline,
    #hero .hero__bg-image {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>
```

- [ ] **Step 2: Update the CSS**

Replace the existing `.hero__bg` rule and add new rules for the image/scrim. In the `<style>`
block:

```css
.hero__bg {
  position: absolute;
  inset: -5%;
  z-index: 0;
  overflow: hidden;
}

.hero__bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  filter: grayscale(0.3) contrast(1.1);
  opacity: 0;
  transform: scale(1.15);
  will-change: transform;
}

.hero__scrim {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(180deg, rgba(10, 10, 10, 0.55) 0%, rgba(10, 10, 10, 0.75) 55%, var(--color-black) 100%),
    radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 10, 0.4) 100%);
}
```

Update the existing `@media (prefers-reduced-motion: reduce)` block to also force the image
visible without animation:

```css
@media (prefers-reduced-motion: reduce) {
  .hero__question,
  .hero__title,
  .hero__subtitle,
  .hero__tagline,
  .hero__bg-image {
    opacity: 1;
    transform: none;
  }
}
```

(The existing `.hero__title`/`.hero__subtitle`/`.hero__tagline`/`.hero__question` rules that
already set baseline `opacity: 0` stay as they are — don't remove or duplicate them, just extend
the reduced-motion override list to include `.hero__bg-image`.)

- [ ] **Step 3: Extend the GSAP timeline to reveal the image**

In the existing `<script>` block, the current timeline looks like:

```typescript
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
tl.from('.hero__question', { opacity: 0, y: 20, duration: 0.8 })
  .from('.hero__title', { opacity: 0, scale: 0.85, duration: 1.1 }, '+=0.3')
  .from('.hero__subtitle', { opacity: 0, y: 30, duration: 0.7 }, '-=0.4')
  .from('.hero__tagline', { opacity: 0, duration: 0.6 }, '-=0.2');
```

Add the background-image reveal as part of the same timeline, starting at the same moment as the
question fades in (so the image and text emerge together, not sequentially):

```typescript
const bgImage = document.querySelector('[data-hero-bg-image]') as HTMLElement | null;

const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
tl.from('.hero__question', { opacity: 0, y: 20, duration: 0.8 })
  .to(bgImage, { opacity: 1, scale: 1.05, duration: 1.6, ease: 'power2.out' }, '<')
  .from('.hero__title', { opacity: 0, scale: 0.85, duration: 1.1 }, '+=0.3')
  .from('.hero__subtitle', { opacity: 0, y: 30, duration: 0.7 }, '-=0.4')
  .from('.hero__tagline', { opacity: 0, duration: 0.6 }, '-=0.2');
```

(`'<'` positions this tween to start at the same time as the previous one, not after it — GSAP
timeline position-parameter syntax. `bgImage` may be `null` if the query fails; GSAP silently
no-ops on a `null` target, so no extra guard is needed here, but don't remove the `as HTMLElement |
null` type since that's what keeps `astro check` happy.)

- [ ] **Step 4: Verify**

Run `npm run build`. Confirm it succeeds. Inspect `dist/he/index.html` / `dist/en/index.html` —
confirm the `<img data-hero-bg-image src="/assets/photos/photo_01.jpg" ...>` tag is present, and
`dist/assets/photos/photo_01.jpg` exists in the build output. Run `npx astro check` — confirm 0
errors. Run `npm run dev` and check the browser console for errors on both locales (screenshot
verification isn't reliable in this sandbox — rely on console/network inspection and reading the
compiled CSS/HTML instead, per established practice in this project).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro
git commit -m "Add Hero background image with GSAP reveal"
```

---

## Task 2: Hero Cursor-Reactive Parallax

**Files:**
- Modify: `src/components/Hero.astro`

- [ ] **Step 1: Add the parallax script**

In `src/components/Hero.astro`'s `<script>` block, after the existing timeline code (still inside
the `if (!prefersReducedMotion())` block), add:

```typescript
const supportsHoverParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (supportsHoverParallax && bgImage) {
  const hero = document.getElementById('hero');

  hero?.addEventListener('mousemove', (event) => {
    const rect = hero.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(bgImage, {
      x: relativeX * -20,
      y: relativeY * -20,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });

  hero?.addEventListener('mouseleave', () => {
    gsap.to(bgImage, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
  });
}
```

This is gated three ways: `!prefersReducedMotion()` (outer block, already present), `(hover:
hover) and (pointer: fine)` (excludes touchscreens — there's no cursor to react to on mobile, per
the design spec's explicit "desktop: cursor interaction, mobile: tap interaction" pattern), and
`bgImage` being non-null. The `.hero__bg { inset: -5% }` from Task 1 gives the image room to shift
±20px without exposing an edge.

- [ ] **Step 2: Verify**

Run `npm run build`. Confirm success. Run `npx astro check` — confirm 0 errors. Run `npm run dev`,
open the browser at a desktop viewport width, and verify via `read_console_messages` that no
errors occur; if the sandbox's `javascript_tool` can simulate a `mousemove` event on the `#hero`
element, dispatch one and confirm (via computed style inspection) that `bgImage`'s transform
changes — if simulating mouse events isn't reliable in this sandbox, confirm at minimum that the
code runs without throwing (check console) and that `window.matchMedia('(hover: hover) and
(pointer: fine)').matches` evaluates as expected for a desktop-width viewport, and note the
limitation in your report rather than blocking on full interactive verification.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "Add cursor-reactive parallax to Hero background on desktop"
```

---

## Task 3: Extend Grain Texture to More Sections

**Files:**
- Modify: `src/components/MusicStartsAndBand.astro`
- Modify: `src/components/Story.astro`
- Modify: `src/components/EditorialQuotes.astro`
- Modify: `src/components/Events.astro`
- Modify: `src/components/FinalScene.astro`

The `.has-grain` utility class already exists in `src/styles/tokens.css` (added in Task 2 of the
original implementation plan) and is already applied to `Hero.astro`, the `#music-starts`
transition section, and `Sound.astro`. It's a cheap, GPU-friendly SVG-noise overlay at 5% opacity
with `mix-blend-mode: overlay` — safe to apply to both dark and light-background sections.

- [ ] **Step 1: Apply `.has-grain` to the Band section**

In `src/components/MusicStartsAndBand.astro`, find the line:
```astro
<section id="band" class="band">
```
Change it to:
```astro
<section id="band" class="band has-grain">
```
(Leave `<section id="music-starts" class="transition has-grain">` — the transition beat — as-is,
it already has grain from the original build.)

- [ ] **Step 2: Apply `.has-grain` to the Story section**

In `src/components/Story.astro`, find:
```astro
<section id="story" class="story">
```
Change it to:
```astro
<section id="story" class="story has-grain">
```

- [ ] **Step 3: Apply `.has-grain` to the Editorial Quotes section**

In `src/components/EditorialQuotes.astro`, find:
```astro
<section id="editorial-quote" class="quote">
```
Change it to:
```astro
<section id="editorial-quote" class="quote has-grain">
```

- [ ] **Step 4: Apply `.has-grain` to the Events section**

In `src/components/Events.astro`, find:
```astro
<section id="events" class="events">
```
Change it to:
```astro
<section id="events" class="events has-grain">
```

- [ ] **Step 5: Apply `.has-grain` to the Final Scene section**

In `src/components/FinalScene.astro`, find:
```astro
<section id="final-scene" class="final">
```
Change it to:
```astro
<section id="final-scene" class="final has-grain">
```

- [ ] **Step 6: Verify**

Run `npm run build`. Confirm success. Grep the built `dist/he/index.html` for `class="` on each of
the 5 modified sections' `id` attributes to confirm `has-grain` is present on all of them. Run
`npx vitest run` — confirm all 29 tests still pass (none of them assert on class names, so this
should be unaffected, but confirm). Run `npx astro check` — confirm 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/MusicStartsAndBand.astro src/components/Story.astro src/components/EditorialQuotes.astro src/components/Events.astro src/components/FinalScene.astro
git commit -m "Extend grain texture to Band, Story, Quotes, Events, and Final Scene sections"
```

---

## Task 4: Deliberate Accent-Color Usage

**Files:**
- Modify: `src/components/QuestionAndBowies.astro`
- Modify: `src/components/Sound.astro`
- Modify: `src/components/EditorialQuotes.astro`

The design spec calls for `--color-accent-green`/`--color-accent-red`/`--color-accent-purple`
(defined in `tokens.css`, pulled from the band's actual stage lighting) to be used as "color as
dramaturgy" — appearing as deliberate events, not decoration everywhere. Currently only 2 of 3
colors are used anywhere (green, on two CTA buttons). This task adds visible, restrained accent
color to three sections without touching their content or JSON data — pure CSS additions.

- [ ] **Step 1: Color the Many Bowies era cards**

In `src/components/QuestionAndBowies.astro`, the `.qab__track` renders 6 fragment panels (children
1–6) followed by 5 era panels (children 7–11). Add these rules to the `<style>` block, after the
existing `.qab__era-line` rule:

```css
.qab__panel:nth-child(7) .qab__era-name {
  color: var(--color-accent-green);
}

.qab__panel:nth-child(8) .qab__era-name {
  color: var(--color-accent-purple);
}

.qab__panel:nth-child(9) .qab__era-name {
  color: var(--color-accent-red);
}

.qab__panel:nth-child(10) .qab__era-name {
  color: var(--color-accent-green);
}

.qab__panel:nth-child(11) .qab__era-name {
  color: var(--color-accent-purple);
}
```

(This colors ZIGGY green, THE THIN WHITE DUKE purple, BERLIN red, LET'S DANCE green, BLACKSTAR
purple — cycling through the three stage-light colors across the five eras. `:nth-child` counts
position among ALL sibling `.qab__panel` divs regardless of their `--fragment`/`--era` modifier
class, which is why the era panels land on positions 7–11, not 1–5 — the 6 fragment panels come
first in the DOM.)

- [ ] **Step 2: Color the Sound section's words**

In `src/components/Sound.astro`, the `.sound__overlay` renders 8 words. Add these rules to the
`<style>` block, after the existing `.sound__word` rule (keep the existing `opacity: 0` baseline
rule and reduced-motion override exactly as they are — just add color on top):

```css
.sound__word:nth-child(3n + 1) {
  color: var(--color-accent-green);
}

.sound__word:nth-child(3n + 2) {
  color: var(--color-accent-red);
}

.sound__word:nth-child(3n + 3) {
  color: var(--color-accent-purple);
}
```

- [ ] **Step 3: Add an accent rule to the Editorial Quote**

In `src/components/EditorialQuotes.astro`, add a thin accent-colored rule above the quote text, in
the markup:

```astro
<section id="editorial-quote" class="quote has-grain">
  <div class="quote__accent" aria-hidden="true"></div>
  <p class="quote__text">{quote}</p>
</section>
```

(This assumes Task 3's `has-grain` addition is already applied — if implementing Task 4 before
Task 3, just add `has-grain` yourself here too, matching Task 3 Step 3's instruction, so the two
tasks don't conflict regardless of execution order.)

Add to the `<style>` block:

```css
.quote__accent {
  width: 4rem;
  height: 3px;
  background: var(--color-accent-red);
  margin-bottom: var(--space-lg);
}
```

- [ ] **Step 4: Verify**

Run `npm run build`. Confirm success. Inspect the compiled CSS in `dist/_astro/*.css` — confirm all
three accent colors (`--color-accent-green`, `--color-accent-red`, `--color-accent-purple`) are
now referenced in more than the original 2 places (grep the compiled CSS for each color token by
its hex value — `#4dff88`, `#ff3b3b`, `#b24dff` — and confirm each appears in at least 2 rules now,
not just 1). Run `npx vitest run` — confirm all 29 tests pass. Run `npx astro check` — confirm 0
errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/QuestionAndBowies.astro src/components/Sound.astro src/components/EditorialQuotes.astro
git commit -m "Add deliberate stage-light accent color usage across three sections"
```

---

## Task 5: Full Verification Pass

**Files:** none (verification-only task)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all 29 tests pass (4 test files), `pretest` builds automatically first.

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors, 0 warnings, 0 hints.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: builds without errors, `dist/he/index.html` and `dist/en/index.html` both exist.

- [ ] **Step 4: Visual/behavioral spot-check**

Run `npm run preview`, load both `/he/` and `/en/` in the Browser preview tooling. Check console
for errors (none expected). Confirm via `get_page_text`/DOM inspection: Hero now has a background
image element present, all 5 sections from Task 3 have `has-grain` in their class list, the Many
Bowies era names and Sound words render with the new accent colors (check computed `color` style
via `javascript_tool`, since visual screenshot verification is unreliable in this sandbox). Note
any issues found — this task doesn't fix them, it reports for the controller to decide on
follow-up.

- [ ] **Step 5: Report findings**

Summarize: test/build/type-check status, confirmation that Hero now has imagery + parallax + a
mask-style reveal, confirmation that grain now covers 8 of 9 sections (all except `#events`... no
wait, Events got grain too in Task 3 — confirm final count of sections with `.has-grain`, should be
8 of 9, since `#question-and-bowies` is the only section that doesn't get it in this plan — note
whether that specific omission looks intentional/fine or worth a follow-up), and confirmation that
all 3 accent colors are now visibly used in more than one place each.

---

## Plan Self-Review Notes

- **Spec coverage**: Hero imagery/parallax (design spec §8) = Tasks 1–2. Grain "sparingly per
  section" (design spec §5) extended to more sections = Task 3. Color "as dramaturgy" using all
  three defined accent colors (design spec §5, §6) = Task 4. Final verification against the
  original creative review's specific findings = Task 5.
- **Deliberately out of scope**: content/copy changes (tour dates, CTA wording, translation
  review), the display-typeface options presentation, and any changes to `Events.astro`'s data or
  `band-members.json` — those are non-code follow-ups already tracked separately, not part of this
  plan.
- **Type/signature consistency**: `bgImage` (Task 1) is referenced again in Task 2's parallax code
  — same variable, same component, same script block, no redeclaration conflict since Task 2's
  code is appended into the same `<script>` block Task 1 creates.
