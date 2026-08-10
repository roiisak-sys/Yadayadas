# YADAYADAS Redesign — Design Spec

**Status:** Authored autonomously per user instruction ("continue without asking, as I'm leaving the computer"). Normal brainstorming back-and-forth was cut short after two visual decisions (Hero direction) were confirmed; everything past that point in this document is my own judgment call, made explicit here so it's auditable and reversible. Two items are hard-blocked on real data only the user has — flagged inline and in the Open Items section at the end.

**Source brief:** the user's 12-section creative brief ("YADAYADAS Website — Design Refinement & Redesign Brief"), delivered in full in chat.

**Confirmed via visual companion before the session went autonomous:**
- Hero direction = **Concept A, "Live Photo Dominant"**: full-bleed live show photo, evolved from the current Hero, with logo integrated into the composition and a credit-line-style descriptor treatment. (User selected this after a brief back-and-forth that also touched B; A is the final, twice-confirmed choice.)

---

## 1. Scope & Phasing

Three phases, each independently shippable (spec → plan → subagent-driven-development, matching how this repo's prior work — the 16-task build, 5-task visual-energy-pass, 6-task UX-simplification-pass — was executed):

- **Phase 1 — Hero + Bowie Collage.** The two highest-impact, most visually-defining sections. Also resolves two pieces of unfinished business from earlier in this project: (a) `QuestionAndBowies.astro` still has the horizontal-scroll-pin mechanic live on `master` — the branch that removed it was never merged — and (b) the Bowie era photos need re-sourcing from `C:\Users\roiis\Downloads\bowie` (moved out of OneDrive this session to fix an unreliable-read bug) rather than trusting the old worktree's unverified output.
- **Phase 2 — Why (reinvention statement) + Band + Live Shows.** Editorial/content sections.
- **Phase 3 — Contact/Booking + social links + cross-site visual-system polish (motion refinement, mobile compositions).**

Each phase gets its own implementation plan under `docs/superpowers/plans/`. This document specs all three phases up front so the whole redesign holds together as one coherent design, even though it ships in three passes.

---

## 2. Visual System (applies across all phases)

**Decision: evolve, don't replace.** The existing token system (`src/styles/tokens.css`) already does real work — the accent colors were pulled from the band's actual stage lighting, not invented, and the type stack (Rubik Variable display / Assistant body / JetBrains Mono labels) already reads as confident and editorial rather than generic. The brief's "premium, cinematic, editorial" direction is a matter of *how these tools get used* — contrast, scale, negative space, restraint — not new tools.

Concretely:
- No new fonts, no new color tokens. Keep `--color-black`, `--color-off-white`, `--color-charcoal`, the three stage-light accents, and the existing type scale.
- Lean harder into the black/off-white flip the site already uses (Band section flips to off-white) as a structural rhythm device — each phase below calls out where.
- Grayscale/desaturation as a recurring treatment for Bowie photography specifically (used already in Hero concept A), reserving full color for the band's own live photos — this creates a visual distinction between "Bowie's world" (referenced, archival, monochrome-leaning) and "YADAYADAS's world" (present-tense, in color), which directly supports the brief's "entering Bowie's world" framing.
- Motion stays governed by the established pattern: CSS baseline `opacity:0`/`transform`, GSAP `ScrollTrigger` reveal via explicit `.to()`/`.fromTo()` (not `.from()` — see the Hero bug fixed earlier this session), `prefers-reduced-motion` CSS override, `<noscript>` fallback, `document.fonts.ready` refresh. No new motion library.

---

## 3. Phase 1 — Hero

**File:** `src/components/Hero.astro` (modify in place, not a rewrite — the reveal-animation script, parallax, and accessibility fallbacks already work correctly and stay).

**Composition change:**
- Background: keep `hero-band-live.jpg` (already wired this session), refine crop/`object-position` to favor the singer + stage-light shafts in the upper frame (current `center 30%` is close; tighten to frame the mic stand less centrally cropped at narrow viewports — implementer should check at 375px width).
- **Logo becomes part of the hero composition, not just the small corner `BrandMark`.** Add a large centered lockup of `yadayadas-logo.png` sized similarly to where `hero__title` ("BOWIE") sits today — replacing the plain-text title, not sitting alongside it. `BrandMark` (small, fixed, top corner) stays as-is for persistent nav/scroll-back-to-top; the Hero's large logo is a separate, one-time compositional element scoped to `#hero`.
- Structure top-to-bottom (mirrors the existing label → title → subtitle → tagline reveal sequence, just recast):
  1. `hero__question` (label, existing copy: "מי היה דייויד בואי?" / "WHO WAS DAVID BOWIE?") — unchanged, stays as the "hook."
  2. Large logo lockup, replacing `hero__title`.
  3. New descriptor line, replacing `hero__subtitle`: **"מופע מחווה חי לדיוויד בואי"** / **"A Live David Bowie Tribute Show"** — this is new copy per the brief, added to `copy.he.json`/`copy.en.json` as `hero.descriptor`.
  4. `hero__tagline` — keep existing ("מופע חי" / "A LIVE EXPERIENCE") or fold into the descriptor if it reads redundant once the descriptor is in place; implementer's call during build, favor removing the redundancy over keeping both.
- Reveal animation: same GSAP timeline structure (already fixed to use `.fromTo()`), just re-target the logo `<img>` instead of `.hero__title` text — swap the `scale: 0.85 → 1` treatment onto the logo.

**Copy changes** (`copy.he.json` / `copy.en.json`, `hero` object): add `descriptor` field with the two strings above. Do not remove `title`/`subtitle`/`tagline` fields from the schema without checking `content.schema.test.ts` — update that test alongside.

---

## 4. Phase 1 — Bowie Collage

**Replaces `src/components/QuestionAndBowies.astro` entirely** — new component `src/components/BowieCollage.astro`. This retires the horizontal-scroll-pin mechanic still live on `master` (the earlier removal only ever happened in an unmerged worktree) and replaces the current text-only era fragments with real Bowie photography.

**Layout: Editorial Grid** (the concept confirmed conceptually strongest for "premium/editorial" during mockup review, before the session went autonomous — asymmetric, mixed image sizes, hard edges, no rotation/scrapbook treatment). No horizontal scroll at any breakpoint — this is a hard constraint from the user's earlier explicit feedback ("אנא בנה הכל בדף אחד ללא SCROLL צידי").

**Images — sourced fresh from `C:\Users\roiis\Downloads\bowie`.** ⚠️ **Correction, made during Task 1 execution:** the table originally here (captured during this same brainstorming session) turned out to be wrong for 4 of 8 files — a Read-tool image-caching bug served stale/incorrect content on repeated reads of the same path within this long conversation, so "verified by direct sequential visual read" was not actually reliable here. Caught and fixed by re-reading every source file through a fresh, never-before-used temp-file path (which reads correctly) before generating the final asset set. **The real, shipped mapping is:**

| Source file | Content, as verified via fresh-path re-read | Era label used |
|---|---|---|
| `images (3).jpeg` | Standing pose, red background, striped shoulder-pad jumpsuit | ZIGGY STARDUST |
| `1973_aladdinsane.webp` | Aladdin Sane album cover — lightning bolt across the face | ALADDIN SANE |
| `1983-cannes_2445749k.jpg` | Press-conference portrait, swept blonde hair, cigarette, grey suit | LET'S DANCE |
| `GLOBAL-FAP-8X12_scaled-bordered_850.jpg` | Live, Union Jack-style coat, mic, green/blue stage light | ON STAGE |
| `images (6).jpeg` | Live, spiky blonde hair, mic, arm raised, dark stage | THE VOICE |
| `images (8).jpeg` | Live, cream/white guitar, red scarf, dark stage | THE GUITAR |
| `images (5).jpeg` | B&W, side profile, mic, windswept hair | LIVE |
| `David_Bowie-06.webp` | Late-career B&W studio portrait, direct gaze — the strongest single image in the set | THE MAN |

Eight files from the original 18 were **not** re-verified via the fresh-path method (`02-david-bowie-makeup.webp`, `1969_manofwords.webp`, `Lvd4yWGHJrmptjYiwvLp7c-960-80.jpg`, `images (10).jpeg`, `images (9).jpeg`, `images (2).jpeg`, `7PSpxXJyzycvsLSPYKK4JT.jpg`, `images (7).jpeg`). **Do not use these without a fresh-temp-path visual verification first** — do not trust any earlier in-conversation read of them, including ones recorded elsewhere in this document's history.

**Component contract:**
- Props: `heading`, `eras: { name: string; line: string; image: string }[]`. **This replaces the current 5-entry `bowies.eras` array content**, not just adds an `image` field to it — the existing entries (ZIGGY / THE THIN WHITE DUKE / BERLIN / LET'S DANCE / BLACKSTAR) were written against different source photos than the ones verified in the table above, and forcing a 1:1 label match to unverified files would reintroduce the exact mapping-confidence problem this phase exists to fix. Replace `bowies.eras` in both copy files with 8 entries (one per non-spare row in the table above: name + a short line in the existing terse style + image path), dropping "THE THIN WHITE DUKE" / "BERLIN" / "BLACKSTAR" as *era labels here* specifically — that narrative already lives in `Story.astro`'s copy, so nothing is lost, it's just not duplicated as a grid label pointing at an unverified photo. Update `content.schema.test.ts` for the new shape/count.
- Processing: new script `scripts/prepare-collage-images.mjs` (sibling to `prepare-bowie-images.mjs`/`prepare-band-assets.mjs`, same sharp pipeline: `.rotate().resize({width: 1600}).jpeg({quality: 84, mozjpeg: true})`), output to `public/assets/bowie/`.
- Grid: CSS Grid, asymmetric track sizing (mix of `span 2`/`span 1` cells), each cell an `<img>` with `object-fit: cover`, a small `.label`-styled era-name tag overlaid bottom-left (matching the mono-label treatment used elsewhere on the site). No literal chronological ordering required by the layout — the brief explicitly wants "a visual Bowie timeline expressed through design, not a literal timeline."
- Motion: per-cell reveal via `ScrollTrigger` + staggered `.fromTo()` (fade + slight rise), matching `Story.astro`'s per-element pattern. No parallax-on-hero-scale — keep it restrained per the brief's "avoid gimmicky" note.
- Mobile: grid collapses to a single column, but *not* naive vertical stacking at uniform size — alternate two cell widths (e.g., full-width / 80%-width offset) so the asymmetry survives at narrow viewports. Implementer should treat this as a real mobile composition, not `grid-template-columns: 1fr`.

**Copy:** keep the existing `question.heading`/`question.fragments` content (the "מי היה דייויד בואי?" / chameleon-outsider-rockstar-actor-artist-man fragments) as a short lead-in *above* the grid — it already does useful work framing the section and doesn't need to be cut. The `bowies.eras[].image` field is new, added per the table above.

---

## 5. Phase 2 — Why (Reinvention Statement)

**New component:** `src/components/WhyStatement.astro`, positioned immediately after `BowieCollage`, before `MusicStartsAndBand`. Fills the brief's "03 — WHY" slot in the content hierarchy.

This is deliberately **separate from** the existing `Story.astro` (the Thin White Duke / Berlin narrative). That component is specific, deep, and strong — brief item 12 explicitly says preserve what's already strong — so it stays exactly where it is in the flow (after `Sound`, before `EditorialQuotes`), as a deeper dive for readers who keep scrolling. `WhyStatement` is the short, universal statement the brief asks for; `Story` remains the long-form bonus.

**Copy** (new `why` object in both copy JSON files) — short, editorial, no marketing clichés, per the brief's writing-style guidance. Draft (implementer/user can refine wording at build time, but keep it this length and register):

- EN: *"David Bowie was never just a musician. He built characters, sounds, entire worlds — and had the courage to leave each one behind before it calcified. That's not a biography detail. It's the whole point. YADAYADAS doesn't perform Bowie's songs so much as follow his instinct: to keep becoming something else."*
- HE: *"דייויד בואי מעולם לא היה רק מוזיקאי. הוא בנה דמויות, צלילים, עולמות שלמים — והעז לנטוש כל אחד מהם לפני שהתקבע. זה לא פרט ביוגרפי. זו כל הנקודה. YADAYADAS לא מבצעים את השירים של בואי כמו שהם עוקבים אחרי האינסטינקט שלו: להמשיך להפוך למשהו אחר."*

**Layout:** simple, centered, editorial — large `--size-display-md` text on `--color-black`, generous `--space-xl` padding, no imagery (a deliberate breathing-room beat between the dense Collage grid and the Band section, same function `Sound.astro`'s word-cloud already serves elsewhere). Reveal: single fade/rise on scroll, matching `Story.astro__beat`.

---

## 6. Phase 2 — Band

**File:** `src/components/MusicStartsAndBand.astro` (modify in place).

**Required content change:** remove age entirely. Currently: `{locale === 'he' ? m.instrumentHe : m.instrumentEn} · {m.age}` — delete `· {m.age}`, leaving just the instrument line. Do **not** remove the `age` field from `band-members.json`/the `Member` interface — leave the data as-is, just stop rendering it, in case it's wanted again later. Update `content.schema.test.ts` only if it asserts on the rendered DOM text (check; if it only validates the JSON shape, no change needed).

**Redesign:** keep the 3-column grid structure (already responsive, already solid) but raise the polish:
- Photo treatment: `grayscale(1)` at rest, transitioning to full color on hover/focus (desktop) — a common, restrained editorial-band-page technique, ties back to the "Bowie's world = monochrome, YADAYADAS = color" system-wide idea from §2. Respect `prefers-reduced-motion` (instant swap, no transition) and don't rely on hover alone for anything essential (mobile has no hover — photos stay in color on touch devices, or grayscale is dropped entirely below the `(hover: hover)` breakpoint).
- Typography: bump `band__name` up a step in the type scale relative to `band__instrument` for clearer hierarchy (currently both are visually similar weight/size neighbors); keep `band__bio` as-is, it reads fine.
- Everything else (intro paragraphs, grid reveal stagger, off-white section flip) stays.

---

## 7. Phase 2 — Live Shows

**File:** `src/components/Events.astro` (modify in place — data model in `events.json` is fine, no changes needed there).

- Hierarchy: date currently reads as a small mono label first in a 3-column grid row; bump the venue name to be the visual anchor (largest), date as a secondary but still prominent element (currently correct relative order, needs size/weight adjustment), city as tertiary.
- CTA: `.events__cta` is currently a plain underlined text link. Give it the same button treatment `FinalScene.astro`'s `.final__cta` already uses (solid `--color-accent-green` background, uppercase mono label, padding) — consistent CTA language across the site rather than two different link styles for "go buy a ticket."
- Mobile: current `.events__row` is `grid-template-columns: auto 1fr auto` — at narrow widths this likely crowds three columns into little space. Switch to a stacked card layout below ~480px (venue/date/city each on their own line, CTA full-width) rather than shrinking the grid columns.
- Empty state (`emptyLabel`, shown when there are no upcoming shows — the current live data has none) stays functionally the same, just restyle to match the new heading/CTA treatment so it doesn't look like an afterthought.

---

## 8. Phase 3 — Contact / Booking

**Decision: extend `FinalScene.astro` rather than add a new section.** The brief's hierarchy has "06 — BOOK" as the closing beat, and `FinalScene` already *is* the closing beat ("David Bowie was never just one person. Neither are we." → CTA). Splitting this into two consecutive full-height sections (a poetic closer, then immediately another CTA section) would work against the "journey" feel the brief asks for. One evolved closing section reads better than two adjacent ones.

**Changes to `FinalScene.astro`:**
- Keep `line1`/`line2` (existing poetic close) and the logo (added this session) exactly as-is.
- Replace the current CTA (`cta` → `#events` anchor scroll) with the new primary action: heading **"Book YADAYADAS"** / **"דברו איתנו"**, plus a prominent WhatsApp button styled as the primary CTA (same green-block treatment as today's `.final__cta`, sized larger — this is now *the* action the whole page builds to, not a secondary link).
- WhatsApp link: `https://wa.me/<PHONE>?text=<encoded prefill>`. **BLOCKED — no phone number exists anywhere in this codebase** (checked `band-members.json`, all copy files, `events.json` — grepped for `whatsapp|wa\.me|instagram|facebook|youtube|phone|\+972` across `src/content` and `src/components`, zero matches). Implementer must wire the component to accept the number as a prop/copy field (e.g. `contact.whatsappNumber` in `copy.*.json`) with an obvious placeholder value (`"+972000000000"`) and a code comment flagging it — **do not fabricate a real-looking number**. This is a real blocker on real data, not a design decision; surfaced again in Open Items below.
- Social icons: small, minimal SVG icon row (Instagram / Facebook / YouTube) below the WhatsApp CTA — secondary in visual weight, per the brief ("should not compete with the primary booking CTA"). **Also blocked** — no social handles/URLs exist in the codebase. Same treatment: wire as `contact.instagramUrl`/`contact.facebookUrl`/`contact.youtubeUrl` copy fields with placeholder values, implementer leaves them clearly marked.
- Keep the existing `#events` anchor reachable from the nav/scroll flow as before — just no longer the primary final CTA.

**Icons:** inline SVG (no icon font/library dependency), sized to match the existing `.label` visual weight, `currentColor` fill so they inherit the section's off-white-on-black.

---

## 9. Phase 3 — Motion & Mobile Polish Pass

A dedicated pass after Phases 1–2 are built, reviewing the whole site rather than one section:
- Confirm every new section (`BowieCollage`, `WhyStatement`, evolved `Events`, evolved `FinalScene`) has an explicit mobile composition (per-section notes above), not just a naturally-responsive fallback.
- Confirm the grayscale→color hover treatment (Band) and the Bowie-monochrome/YADAYADAS-color system-wide idea (§2) are applied consistently anywhere else a Bowie photo and a band photo appear near each other.
- Full-site `prefers-reduced-motion` and keyboard/screen-reader pass (consistent with how every prior phase in this project has been verified) before merge.

---

## 10. Open Items (blocked on the user)

1. **BOWIE wordmark logo file.** The user pasted an image of the classic "BOWIE" wordmark logo directly in chat. I can see it, but I have no file — pasted chat images aren't accessible as files to me, only paths on disk are (same mechanism as every other asset this session). User said they'd save it and send a path; not yet received. **Nothing in this spec depends on it** — the brief's explicit ask ("also add the bowie logo") isn't yet assigned a section; once the file arrives, the most natural placement is a small mark near/paired with the YADAYADAS logo in the Bowie Collage heading area (§4), but that placement is provisional pending the actual asset.
2. **WhatsApp number + social URLs.** Hard-blocked, see §8. Every other design decision in this spec is independent of these two values — the component contracts are built to accept them as data, so filling them in later is a one-line change, not a rebuild.

Both are called out again at the end of implementation so they're not silently forgotten.
