# YADAYADAS — Site Design Spec

**Date**: 2026-08-09
**Status**: Approved (brainstorming phase) — ready for implementation planning

## 1. Premise

YADAYADAS is an Israeli six-piece live band performing a David Bowie tribute show that is
explicitly **not** a costume/impersonation act. The show is about *discovering* Bowie — the
music is the vehicle, the man is the mystery. The site must feel like an Awwwards-tier music/art
experience, not a tribute-band brochure. Full creative brief supplied by the user governs tone,
prohibited patterns (generic SaaS components, cosplay imagery, wall-of-Bowie-photos, etc.), and
the phase-by-phase build order; this spec adapts that brief to the real assets and copy gathered
below.

**Non-negotiable throughout implementation: this must read as ROCK'N'ROLL and LIVE, not as a cold
editorial art-installation.** The mysterious/cinematic hero sequence and the quiet Story section
are deliberate tonal *lows* that make the loud sections hit harder — but the site's resting
personality is a loud, physical, sweaty live show, not a minimalist gallery. Every section should
be checked against this before it's considered done: does it still feel like six people playing
loud in a room, or has it drifted into sterile art-direction? If in doubt, add more grain, more
crowd, more motion blur, more volume in the type — not less.

## 2. Real Source Material (asset & content audit)

### 2.1 Photos
30 curated stills downloaded from the band's shared Google Photos album to
`assets/photos/photo_01.jpg`–`photo_30.jpg` (source: https://photos.app.goo.gl/iNdijtP9SfTxtkpT7,
downloaded with user permission). Spans black-and-white outdoor rehearsal shots, and color live
shots across at least four venues: an intimate brick-walled bar with a hand-painted "Gypsy" star
mural, a black-box club with red/green stage wash, a club with a blue/purple psychedelic spiral
backdrop, and a larger room with visible crowd silhouettes. A few items are video poster frames
(play-button overlay), meaning the real clips exist in the Facebook archive (see below), not as
downloadable stills.

No Bowie costuming anywhere — real contemporary stagewear (a pale suit, a pink blazer, a green
coat, band tees), which matches the brief's anti-cosplay direction directly.

### 2.2 Facebook Page Export
A full personal Facebook data export was provided
(`facebook-YadayadasIL-09_08_2026-*.zip`, ~1GB). **Only the public `posts/` content was used** —
private messages, saved items, stories, and reels were deliberately left untouched as
out-of-scope/private data unrelated to the band's public content. From `posts/profile_posts_1.html`
and `posts/videos.html`:

- **Real, confirmed lineup**: Roi Isak (vocals, percussion), Guy Wittenberg (sax, violin, vocals),
  Gil Idan (drums, nicknamed "Agrol"), Dedi Kovetz (keys, vocals), Ofer Pal (bass), Itzik Galanti
  (guitars). Occasional guest vocalist (e.g. Yasmin Tal) appears at some shows.
- **Real show copy**, Hebrew and English, spanning the band's history from their first gig
  (Yad Hanna, 15.7.2022) through an Aug 8, 2026 show at "האזור" (The Zone), Tel Aviv — the most
  recent show, with live video posted the following day.
- **Real narrative passage** (Aug 2, 2026 post) almost verbatim matching the brief's "there was
  never just one Bowie" concept: *"יש אמנים שמוציאים שירים. ויש אמנים שממציאים עולמות"* — "Some
  artists release songs. Others invent worlds."
- **~114 real performance video clips** under `posts/media/videos/` (not yet extracted into the
  project — see §6).
- A drummer transition (Gil Idan announced a farewell tour starting 24.7.2026) is visible in the
  data. **Per user decision, the site stays evergreen and does not reference this** — the six
  current members are presented without a transition narrative.

### 2.3 User-authored narrative (supplied directly in chat)
A full, original ten-part narrative (§§10A–10J) covering Bowie's Thin White Duke period, his
addiction and physical decline in Los Angeles, Iggy Pop's parallel struggle, the move to Berlin,
the Berlin Trilogy (*Low*, *"Heroes"*, *Lodger*), and "the pattern" of Bowie repeatedly destroying
and rebuilding his own identity — closing on the refrain *"Who am I now? ... Who do I become
next?"* as the show's central emotional question. **Per user decision, this is the one central
deep-dive narrative for the site** — other eras (Ziggy's origin, Let's Dance, Blackstar) appear
only as short visual/typographic fragments, not full narratives. Full text preserved in
`src/content/story-thin-white-duke.md` (bilingual — Hebrew translation to be produced during
implementation, reviewed by the user before launch since this is voice-critical copy).

## 3. Language & Routing

Bilingual: Hebrew (RTL) as primary/default route, English (LTR) as secondary, with a floating
language toggle that swaps route while preserving scroll position/section. Astro's built-in i18n
routing serves `/he/` and `/en/` as parallel statically-prerendered trees sharing components — no
runtime translation cost, no framework-level i18n library needed.

## 4. Tech Stack

- **Astro** (static output), TypeScript, no UI framework (vanilla components — this is a content
  + animation site, not an interactive app).
- **GSAP + ScrollTrigger** for scroll-driven animation; **Lenis** for smooth scroll.
- **Vanilla CSS** with a custom-property design-token system (`src/styles/tokens.css`) — no
  Tailwind/utility framework; this project wants bespoke editorial CSS.
- Content lives in structured JSON/content-collections (`src/content/`) — band members, events,
  per-locale copy strings — so swapping placeholder → real content is a data edit.

### Project structure
```
C:\GIT\Yadayadas\
├── src/
│   ├── content/
│   │   ├── band-members.json
│   │   ├── events.json
│   │   ├── story-thin-white-duke.md   (he + en)
│   │   ├── copy.he.json
│   │   └── copy.en.json
│   ├── layouts/BaseLayout.astro        (dir="rtl|ltr", lang switch, SEO/OG)
│   ├── pages/{he,en}/index.astro
│   ├── components/                     (one per section, see §5)
│   ├── scripts/                        (GSAP timelines, ScrollTrigger, Lenis init)
│   └── styles/tokens.css
├── public/fonts/, favicon, etc.
└── assets/
    ├── photos/    (the 30 downloaded stills — source material, optimized at build)
    └── video/     (selected clips extracted from the FB export, see §6)
```

## 5. Design System

**Color**: Near-black (`#0a0a0a`) / warm off-white (`#f2ede4`) as the resting state. Accent colors
are pulled from the band's *actual* stage lighting rather than an invented Bowie palette — acid
green and red (from the club's red/green rig), electric magenta/purple (from the psychedelic-spiral
venue). Color is used as an event, not a wash — but the live sections should feel like being
inside the stage lights, not observing them from a gallery wall.

**Typography**:
- Display: a high-contrast expressive grotesque, paired with a Hebrew display face of matching
  weight/attitude (no single typeface fakes both scripts well — pick two that match in spirit).
  Must hold up at full-viewport scale in both `BOWIE` and `בואי`.
- Body: a clean sans with strong Hebrew glyph coverage (e.g. Inter or equivalent).
- Mono/label: metadata, dates, venue names, section numbers.

**Texture**: film grain overlay (cheap, GPU-friendly), chromatic aberration used sparingly at hero
transitions only. No glassmorphism, no rounded-corner SaaS patterns, no gradients-as-decoration.

**Photography**: real photos used mostly as-shot — no filter forces a uniform "Bowie era" look
onto contemporary band photos. The contrast between the *authentic current band* and the
*legendary subject* is the point, and it's also what keeps this feeling like a real band, not a
concept film.

## 6. Section Map

| # | Section | Content status |
|---|---|---|
| 1 | Hero | Cinematic open ("מי היה דייויד בואי?" / "WHO WAS DAVID BOWIE?" → `BOWIE` fills viewport → `YADAYADAS` → tagline). Candidate footage: Aug 8, 2026 Zone live clips. |
| 2 | The Question | Fragments from real copy, e.g. "מי היה האדם שמאחורי התחפושות והמסכות?" |
| 3 | The Many Bowies | Short visual/typographic fragments per era (Ziggy, Duke, Berlin, Let's Dance, Blackstar) — several pulled from the Duke/Berlin narrative ("ZIGGY HAD TO DIE," "THE THIN WHITE DUKE HAD TO DISAPPEAR"). No full narratives here. |
| 4 | Then the Music Starts | Transition into live-performance mode via real color stage photos + video. |
| 5 | The Band | Real: 6 members, names + instruments confirmed (§2.2). Bios beyond instrument = **placeholder**. |
| 6 | The Sound | Real video: Aug 8–9, 2026 "Under Pressure" / "Rock n Roll Suicide" live clips are prime candidates; physicality shots (sax, hands, drums) from the photo set. |
| 7 | The Story / Human Bowie | Real: the full Thin White Duke → LA → Iggy Pop → Berlin → Berlin Trilogy → "the pattern" arc (§2.3), broken into scroll-triggered typographic beats — not a wall of text. |
| 8 | Editorial Quotes | Pulled from §2.3: *"Who am I now? ... Who do I become next?"* as the central question, plus 2–3 more isolated lines. |
| 9 | Events / Dates | Real tour history 2022–2026 available to seed structure. **Upcoming/confirmed dates need user confirmation** before launch — section reads from `events.json` so this is a data update, not a redesign. |
| 10 | Final Scene | Emotional close, tone adapted from the real "10 years without David Bowie" post; original closing copy in the brief's spirit, loud not somber — this is a rock show, not a eulogy. |

Placeholders remaining: individual band member bios beyond instrument, confirmed upcoming tour
dates, final CTA exact wording.

## 7. Interaction & Animation Strategy

- **Hero**: pinned intro timeline — question fades, `BOWIE` scales to fill viewport, image emerges
  through a mask, `YADAYADAS` settles in. Cursor-reactive parallax on desktop; static composition
  on mobile (no cursor to react to — not a degraded copy of the desktop version, a different one).
- **The Question / Many Bowies**: horizontal-scroll-within-vertical-scroll on desktop (pinned,
  scroll mapped to translateX); becomes a straightforward vertical stacked sequence on mobile.
- **The Story section**: text beats fade/rise in sync with scroll, one thought per screen,
  generous negative space — this is the quiet section, deliberately.
- **Section transitions**: black-frame wipes / cross-dissolves between documentary mode and
  live-performance mode — not simple vertical stacking between scenes.
- **Signature interactions**:
  1. Hero reveal/transformation.
  2. Band reveal — six members appear one at a time synced to scroll, assembling into the full
     lineup shot.
  3. The refrain explosion — "Who am I now? ... Who do I become next?" — each question fills the
     screen in sequence at the emotional climax before the finale.
- All motion respects `prefers-reduced-motion` (static equivalents, no parallax/pin). Content is
  readable/navigable with animation off — progressive enhancement, not a requirement.
- **Energy check**: the live-show sections (4, 6, and the hero) should feel loud — faster cuts,
  more motion, more crowd/physicality imagery, less negative space than sections 2, 3, and 7. Don't
  let the whole site settle into the same restrained editorial pace; the contrast between quiet
  and loud sections is what makes the loud sections read as *live*.

## 8. Asset Pipeline

- **Photos**: 30 downloaded stills usable now, optimized to WebP/AVIF with responsive srcsets at
  build time.
- **Video**: don't bulk-extract all ~114 FB clips. Pull a short, deliberately chosen list (Aug
  8–9, 2026 live clips are the leading candidates for §6 "The Sound"), compress properly for web
  (H.264/WebM, poster frames, muted-autoplay-safe, **no audio autoplay** per the brief), extract
  directly from the zip archive on demand during implementation.

## 9. Accessibility & Performance

Semantic HTML, keyboard navigation, focus states, alt text (bilingual), proper heading hierarchy,
sufficient contrast, `prefers-reduced-motion` support, accessible video controls. Responsive
images, lazy loading, video poster images, avoid layout shift, GPU-friendly transforms only.
Target strong Lighthouse scores — the cinematic experience is worthless if it's slow, especially
on the mobile connections most of this band's actual audience will be using.

## 10. Build Phases

1. Project scaffold + design tokens + i18n routing.
2. Hero + Question sections.
3. Many Bowies (fragments) + Story section (real Duke/Berlin narrative).
4. Band + Sound/performance sections.
5. Events + final CTA.
6. Mobile adaptation pass.
7. Performance + accessibility pass.
8. Final creative review against the brief's own quality-bar test (§36–37 of the original brief:
   would this look at home on Awwwards; does it feel extraordinary in 5 seconds, curious at 15,
   clearly-not-a-tribute-band at 30, live-show-hungry at 60, and does the ending land emotionally).

## 11. Open Items for User Before/During Implementation

- Confirm upcoming tour dates for the Events section (FB export's most recent entry is Aug 8,
  2026 — need to know what's actually next).
- Individual band member bios beyond name/instrument (optional — placeholders are fine if not
  ready).
- Hebrew translation review of the Thin White Duke/Berlin narrative (voice-critical, should not
  ship without the user's review).
- Final CTA wording (draft will be provided, needs approval).
- Display typeface final pick (Latin + Hebrew pairing) — will propose 2-3 options during
  implementation for a quick visual approval, since this is highly visual and hard to judge as text.
