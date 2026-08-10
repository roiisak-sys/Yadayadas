# YADAYADAS Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the YADAYADAS bilingual (Hebrew/English), scroll-driven, cinematic Awwwards-tier
site described in `docs/superpowers/specs/2026-08-09-yadayadas-design.md`, using real band assets
and copy gathered during brainstorming.

**Architecture:** Astro static site, vanilla TypeScript, GSAP + ScrollTrigger for scroll-driven
animation, Lenis for smooth scroll. Content (band members, events, story beats, per-locale UI
strings) lives in structured JSON under `src/content/`, validated by Vitest schema tests. Two
parallel static route trees (`/he/`, `/en/`) share the same components. No UI framework (React/Vue)
— components are `.astro` files with vanilla `<script>` modules for interactivity.

**Tech Stack:** Astro 5, TypeScript, GSAP 3 + ScrollTrigger, Lenis, Vitest, @fontsource (Rubik,
Assistant, JetBrains Mono), sharp (image optimization), adm-zip (dev-time asset extraction only).

---

## File Structure

```
C:\GIT\Yadayadas\
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── env.d.ts
│   ├── content/
│   │   ├── band-members.json
│   │   ├── events.json
│   │   ├── story-beats.json
│   │   ├── copy.he.json
│   │   └── copy.en.json
│   ├── content.schema.test.ts        # Vitest: validates all JSON above
│   ├── layouts/
│   │   └── BaseLayout.astro           # <html dir>, SEO/OG meta, font links, Lenis/GSAP boot
│   ├── pages/
│   │   ├── index.astro                # redirects to /he/
│   │   ├── he/index.astro
│   │   └── en/index.astro
│   ├── components/
│   │   ├── LanguageToggle.astro
│   │   ├── Hero.astro
│   │   ├── QuestionAndBowies.astro     # sections 2+3: The Question, The Many Bowies
│   │   ├── MusicStartsAndBand.astro    # sections 4+5: transition + Band
│   │   ├── Sound.astro                 # section 6
│   │   ├── Story.astro                 # section 7
│   │   ├── EditorialQuotes.astro       # section 8
│   │   ├── Events.astro                # section 9
│   │   └── FinalScene.astro            # section 10
│   ├── scripts/
│   │   ├── smooth-scroll.ts            # Lenis + GSAP ScrollTrigger boot, reduced-motion guard
│   │   └── reduced-motion.ts           # shared prefers-reduced-motion helper
│   └── styles/
│       └── tokens.css                  # design tokens (color, type, spacing, grain)
├── scripts/
│   └── extract-fb-videos.mjs           # one-off Node script: pulls selected clips from the FB zip
└── public/                             # Astro's default publicDir — copied verbatim into dist/
    ├── assets/
    │   ├── photos/photo_01.jpg … photo_30.jpg   (already present)
    │   └── video/                      (populated by extract-fb-videos.mjs)
    └── favicon.svg
```

Note: `assets/` lives *under* `public/`, not as a top-level sibling — Astro only copies
`publicDir` (default `public/`) into `dist/` on build, so a top-level `assets/` would silently
never reach the deployed site even though `src/` code references it via absolute paths like
`/assets/photos/photo_09.jpg`. Fonts are not physically staged under `public/` — `@fontsource*`
packages are imported directly as CSS in `BaseLayout.astro` and bundled by Vite into
`dist/_astro/*.woff2` at build time, so no `public/fonts/` directory exists or is needed.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `src/pages/index.astro`
- Modify: `.gitignore`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "yadayadas",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.1.0",
    "gsap": "^3.12.5",
    "lenis": "^1.1.18",
    "@fontsource-variable/rubik": "^5.1.0",
    "@fontsource/assistant": "^5.1.0",
    "@fontsource/jetbrains-mono": "^5.1.0",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "vitest": "^2.1.8",
    "adm-zip": "^0.5.16"
  }
}
```

- [ ] **Step 2: Write `astro.config.mjs`**

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  image: {
    domains: [],
  },
});
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "scripts/**/*"]
}
```

- [ ] **Step 4: Write `src/env.d.ts`**

```typescript
/// <reference types="astro/client" />
```

- [ ] **Step 5: Write the root redirect page `src/pages/index.astro`**

```astro
---
return Astro.redirect('/he/');
---
```

- [ ] **Step 6: Update `.gitignore`**

```
node_modules/
dist/
.astro/
.env
*.log
public/assets/video/*.mp4
!public/assets/video/.gitkeep
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 8: Verify dev server boots**

Run: `npm run dev` (in background, or check it starts then stop it)
Expected: Astro dev server starts on `http://localhost:4321` without errors. A request to
`http://localhost:4321/` should respond with a redirect (302/200 meta-refresh) toward `/he/`
(the `/he/` page won't exist until Task 4, so a 404 there is fine at this point — the check here
is only that the server boots and the redirect page compiles without error).

- [ ] **Step 9: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json src/env.d.ts src/pages/index.astro .gitignore package-lock.json
git commit -m "Scaffold Astro project"
```

---

## Task 2: Design Tokens & Fonts

**Files:**
- Create: `src/styles/tokens.css`
- Test: `src/styles/tokens.test.ts`

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  /* Color — pulled from real stage lighting in the band's own photos, not an invented palette */
  --color-black: #0a0a0a;
  --color-off-white: #f2ede4;
  --color-charcoal: #1a1a1a;
  --color-accent-green: #4dff88;   /* red/green club rig */
  --color-accent-red: #ff3b3b;     /* red/green club rig + Gypsy bar */
  --color-accent-purple: #b24dff;  /* psychedelic-spiral venue */

  /* Type */
  --font-display: 'Rubik Variable', 'Rubik', system-ui, sans-serif;
  --font-body: 'Assistant', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --size-display-xl: clamp(4rem, 16vw, 14rem);
  --size-display-lg: clamp(2.5rem, 9vw, 7rem);
  --size-display-md: clamp(1.75rem, 5vw, 3.5rem);
  --size-body: clamp(1rem, 1.2vw, 1.15rem);
  --size-label: 0.75rem;

  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 8rem;

  /* Motion */
  --ease-editorial: cubic-bezier(0.16, 1, 0.3, 1);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--color-black);
  color: var(--color-off-white);
  font-family: var(--font-body);
  overflow-x: hidden;
}

[dir='rtl'] {
  font-family: var(--font-body);
}

.label {
  font-family: var(--font-mono);
  font-size: var(--size-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
}

/* Cheap GPU-friendly grain overlay, used sparingly per section via .has-grain */
.has-grain {
  position: relative;
}
.has-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Write a token sanity test `src/styles/tokens.test.ts`**

This isn't deep CSS testing (not worth it) — it's a guard that the file exists and defines the
custom properties every component will depend on, so a future edit can't silently delete a token
a component still uses.

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf-8');

describe('design tokens', () => {
  const requiredTokens = [
    '--color-black',
    '--color-off-white',
    '--color-accent-green',
    '--color-accent-red',
    '--color-accent-purple',
    '--font-display',
    '--font-body',
    '--font-mono',
    '--size-display-xl',
    '--space-lg',
    '--ease-editorial',
  ];

  it.each(requiredTokens)('defines %s', (token) => {
    expect(css).toContain(token);
  });

  it('includes a prefers-reduced-motion rule', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: all tests PASS (file was written in Step 1 with all required tokens present).

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css src/styles/tokens.test.ts
git commit -m "Add design token system"
```

---

## Task 3: Content Data Files & Schema Tests

**Files:**
- Create: `src/content/band-members.json`
- Create: `src/content/events.json`
- Create: `src/content/story-beats.json`
- Create: `src/content/copy.he.json`
- Create: `src/content/copy.en.json`
- Test: `src/content.schema.test.ts`

- [ ] **Step 1: Write the failing schema test first — `src/content.schema.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import bandMembers from './content/band-members.json';
import events from './content/events.json';
import storyBeats from './content/story-beats.json';
import copyHe from './content/copy.he.json';
import copyEn from './content/copy.en.json';

describe('band-members.json', () => {
  it('has exactly 6 core members', () => {
    expect(bandMembers.filter((m: any) => m.role === 'core')).toHaveLength(6);
  });

  it('every member has required bilingual fields', () => {
    for (const m of bandMembers as any[]) {
      expect(m.id).toBeTruthy();
      expect(m.nameHe).toBeTruthy();
      expect(m.nameEn).toBeTruthy();
      expect(m.instrumentHe).toBeTruthy();
      expect(m.instrumentEn).toBeTruthy();
      expect(m.photo).toMatch(/^\/assets\/photos\/.+\.jpg$/);
    }
  });

  it('has unique ids', () => {
    const ids = (bandMembers as any[]).map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('events.json', () => {
  it('every event has required fields and a valid ISO date', () => {
    for (const e of events as any[]) {
      expect(e.id).toBeTruthy();
      expect(() => new Date(e.dateISO).toISOString()).not.toThrow();
      expect(e.venueHe).toBeTruthy();
      expect(e.venueEn).toBeTruthy();
      expect(['past', 'upcoming']).toContain(e.status);
    }
  });
});

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

describe('copy.he.json / copy.en.json', () => {
  it('both locales define the same set of keys', () => {
    const flatten = (obj: any, prefix = ''): string[] =>
      Object.entries(obj).flatMap(([k, v]) =>
        typeof v === 'object' && v !== null
          ? flatten(v, `${prefix}${k}.`)
          : [`${prefix}${k}`]
      );
    const heKeys = flatten(copyHe).sort();
    const enKeys = flatten(copyEn).sort();
    expect(heKeys).toEqual(enKeys);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/content.schema.test.ts`
Expected: FAIL — imports fail because the JSON files don't exist yet.

- [ ] **Step 3: Write `src/content/band-members.json`**

Real, confirmed lineup from the band's Facebook page (see spec §2.2). Photo assignments below use
stills already confirmed to show that instrument being played (photo_01.jpg is the full-band b&w
rehearsal shot, used as a fallback for anyone not otherwise matched).

```json
[
  {
    "id": "roi-isak",
    "role": "core",
    "nameHe": "רועי איסק",
    "nameEn": "Roi Isak",
    "instrumentHe": "שירה וכלי הקשה",
    "instrumentEn": "Lead Vocals & Percussion",
    "photo": "/assets/photos/photo_05.jpg",
    "bioHe": "",
    "bioEn": ""
  },
  {
    "id": "guy-wittenberg",
    "role": "core",
    "nameHe": "גיא ויטנברג",
    "nameEn": "Guy Wittenberg",
    "instrumentHe": "סקסופון, כינור וקולות",
    "instrumentEn": "Saxophone, Violin & Vocals",
    "photo": "/assets/photos/photo_09.jpg",
    "bioHe": "",
    "bioEn": ""
  },
  {
    "id": "gil-idan",
    "role": "core",
    "nameHe": "גיל אידן",
    "nameEn": "Gil Idan",
    "instrumentHe": "תופים",
    "instrumentEn": "Drums",
    "photo": "/assets/photos/photo_01.jpg",
    "bioHe": "",
    "bioEn": ""
  },
  {
    "id": "dedi-kovetz",
    "role": "core",
    "nameHe": "דדי קובץ'",
    "nameEn": "Dedi Kovetz",
    "instrumentHe": "קלידים וקולות",
    "instrumentEn": "Keyboards & Vocals",
    "photo": "/assets/photos/photo_01.jpg",
    "bioHe": "",
    "bioEn": ""
  },
  {
    "id": "ofer-pal",
    "role": "core",
    "nameHe": "עופר פל",
    "nameEn": "Ofer Pal",
    "instrumentHe": "בס",
    "instrumentEn": "Bass",
    "photo": "/assets/photos/photo_01.jpg",
    "bioHe": "",
    "bioEn": ""
  },
  {
    "id": "itzik-galanti",
    "role": "core",
    "nameHe": "איציק גלנטי",
    "nameEn": "Itzik Galanti",
    "instrumentHe": "גיטרות",
    "instrumentEn": "Guitars",
    "photo": "/assets/photos/photo_21.jpg",
    "bioHe": "",
    "bioEn": ""
  }
]
```

- [ ] **Step 4: Write `src/content/events.json`**

Seeded with real, verifiable past shows from the FB export (spec §2.2). No fabricated upcoming
dates — `status: "upcoming"` list starts empty; the Events component (Task 11) must render a
graceful "more dates coming soon" state when it's empty, not a broken layout. This is a genuine
open item (spec §11) the user fills in later by adding entries here.

```json
[
  {
    "id": "the-zone-2026-08-08",
    "status": "past",
    "dateISO": "2026-08-08",
    "venueHe": "האיזור",
    "venueEn": "The Zone",
    "cityHe": "תל אביב",
    "cityEn": "Tel Aviv",
    "ticketUrl": ""
  },
  {
    "id": "bella-ciao-2026-07-24",
    "status": "past",
    "dateISO": "2026-07-24",
    "venueHe": "Bella Ciao Bar",
    "venueEn": "Bella Ciao Bar",
    "cityHe": "ראשון לציון",
    "cityEn": "Rishon LeZion",
    "ticketUrl": ""
  },
  {
    "id": "bar-giyora-2025-12-13",
    "status": "past",
    "dateISO": "2025-12-13",
    "venueHe": "בר גיורא",
    "venueEn": "Bar Giyora",
    "cityHe": "תל אביב",
    "cityEn": "Tel Aviv",
    "ticketUrl": ""
  }
]
```

- [ ] **Step 5: Write `src/content/story-beats.json`**

Condensed scroll-beat version of the user-supplied Thin White Duke/Berlin narrative (spec §2.3),
isolating the strongest lines per the brief's "editorial quotes fill the screen" rule rather than
reproducing full paragraphs. English text is the user's own words, lightly cut for beat pacing;
Hebrew is a first-pass translation flagged for the user's review before launch (spec §11).

```json
[
  { "order": 0, "he": "אחרי זיגי סטארדסט, בואי לא פשוט המשיך הלאה.", "en": "After Ziggy Stardust, Bowie didn't simply move on." },
  { "order": 1, "he": "הדמויות הפכו אפלות יותר. הגבול בין הדמות לאדם הפך דק באופן מסוכן.", "en": "The characters became darker. The boundary between the character and the man became dangerously thin." },
  { "order": 2, "he": "הוא הפך ל'הדוכס הצנום הלבן'. אלגנטי. קר. צנום להחריד. מנותק.", "en": "He became the Thin White Duke. Elegant. Cold. Extremely thin. Detached." },
  { "order": 3, "he": "מתחת לפני השטח היה משהו אפל בהרבה — בואי היה שקוע בהתמכרות עמוקה לקוקאין.", "en": "Underneath it was something much darker — Bowie was deeply addicted to cocaine." },
  { "order": 4, "he": "הדוכס הצנום הלבן היה אמור להיות מסכה. אבל עכשיו היה מאחוריה אדם אמיתי בסכנה של ממש.", "en": "The Thin White Duke was supposed to be a persona. But there was now a real person behind him who was in serious danger." },
  { "order": 5, "he": "לוס אנג'לס ריכזה כמעט כל דבר שהיה יכול להגביר את הדחפים הגרועים ביותר של בואי.", "en": "Los Angeles represented almost everything that could amplify Bowie's worst impulses." },
  { "order": 6, "he": "הפעם, פשוט להרוג את הדמות לא הספיק. הוא היה צריך לעזוב.", "en": "This time, simply killing the character wasn't enough. He needed to leave." },
  { "order": 7, "he": "איגי פופ ובואי חיו כל אחד בגרסה שלו לאותה קטסטרופה. בשלב מסוים בואי הבין: זה לא עובד.", "en": "Iggy Pop and Bowie were living through their own versions of the same disaster. At some point, Bowie recognized: this is not working." },
  { "order": 8, "he": "אז הוא עזב את לוס אנג'לס. ולקח את איגי איתו.", "en": "So Bowie made a radical decision. He left Los Angeles. And he took Iggy with him." },
  { "order": 9, "he": "הם עברו לברלין. לא הברלין הזוהרת. עיר אפורה, מחולקת, צנועה.", "en": "They went to Berlin. Not glamorous Berlin. A divided, grey, austere city." },
  { "order": 10, "he": "הסמים נשארו מאחור. העודף הופשט. והמוזיקה השתנתה יחד עם הכל.", "en": "The drugs were left behind. The excess was stripped away. And the music changed with it." },
  { "order": 11, "he": "מהתקופה הזו נולדה 'טרילוגיית ברלין': Low, \"Heroes\", Lodger. ניסיונית. מינימלית. אלקטרונית. קרה. אנושית.", "en": "Out of this period came the Berlin Trilogy: Low, \"Heroes\", Lodger. Experimental. Minimal. Electronic. Cold. Human." },
  { "order": 12, "he": "בואי כבר שרד טרנספורמציה אחת: מדייויד ג'ונס לדייויד בואי לזיגי סטארדסט. עכשיו השאלה כבר לא הייתה 'מי אני', אלא 'האם אוכל לשרוד את עצמי'.", "en": "Bowie had already survived one transformation. Now the question was no longer 'Who am I?' — it was 'Can I survive myself?'" },
  { "order": 13, "he": "זיגי היה צריך למות. הדוכס הצנום הלבן היה צריך להיעלם. לוס אנג'לס הייתה צריכה להישאר מאחור.", "en": "Ziggy had to die. The Thin White Duke had to disappear. Los Angeles had to be left behind." },
  { "order": 14, "he": "לא שהוא מעולם לא נשבר. אלא שהוא שוב ושוב בנה את עצמו מחדש. ובכל פעם, האמנות השתנתה יחד איתו.", "en": "Not that he never broke. But that he repeatedly rebuilt himself. And each time he rebuilt himself, the art changed with him." },
  { "order": 15, "he": "מי אני עכשיו? מה קורה אם אני הופך לדמות הזו? מתי אני צריך לנטוש אותה? ומי אני הופך להיות אחר כך?", "en": "Who am I now? What happens if I become this person? When do I need to leave him behind? And who do I become next?" }
]
```

- [ ] **Step 6: Write `src/content/copy.en.json`**

```json
{
  "meta": {
    "title": "YADAYADAS — A David Bowie Live Experience",
    "description": "YADAYADAS is a six-piece Israeli live band performing a David Bowie tribute show that isn't a costume act — it's a discovery. The music is the vehicle. The man is the mystery."
  },
  "nav": { "show": "Show", "bowie": "Bowie", "music": "Music", "band": "Band", "dates": "Dates" },
  "hero": { "question": "WHO WAS DAVID BOWIE?", "title": "BOWIE", "subtitle": "YADAYADAS", "tagline": "A LIVE EXPERIENCE" },
  "question": { "heading": "Who was David Bowie?", "fragments": ["THE CHAMELEON", "THE OUTSIDER", "THE ROCK STAR", "THE ACTOR", "THE ARTIST", "THE MAN"] },
  "bowies": {
    "eras": [
      { "name": "ZIGGY", "line": "Color. Energy. Theatricality." },
      { "name": "THE THIN WHITE DUKE", "line": "ZIGGY HAD TO DIE." },
      { "name": "BERLIN", "line": "THE THIN WHITE DUKE HAD TO DISAPPEAR." },
      { "name": "LET'S DANCE", "line": "Color. Movement. Pop." },
      { "name": "BLACKSTAR", "line": "Mystery. Mortality. Art." }
    ]
  },
  "musicStarts": { "label": "Then the music starts" },
  "band": { "heading": "SIX MUSICIANS.", "subheading": "ONE STRANGE JOURNEY." },
  "sound": { "words": ["ROCK'N'ROLL", "SAX", "VIOLIN", "GUITAR", "BALLADS", "LOUD", "QUIET", "BOWIE"] },
  "story": { "heading": "THE THIN WHITE DUKE" },
  "quotes": { "primary": "Who am I now? What happens if I become this person? When do I need to leave him behind? And who do I become next?" },
  "events": { "heading": "DATES", "empty": "More dates coming soon.", "ticketsCta": "Get Tickets" },
  "final": { "line1": "DAVID BOWIE WAS NEVER JUST ONE PERSON.", "line2": "NEITHER ARE WE.", "cta": "SEE YADAYADAS LIVE" },
  "languageToggle": { "label": "EN" }
}
```

- [ ] **Step 7: Write `src/content/copy.he.json`**

```json
{
  "meta": {
    "title": "YADAYADAS — מופע חי מחווה לדייויד בואי",
    "description": "YADAYADAS היא להקה ישראלית בת שישה נגנים המבצעת מופע מחווה לדייויד בואי שהוא לא מופע תחפושות — זו חוויית גילוי. המוזיקה היא כלי. האיש הוא התעלומה."
  },
  "nav": { "show": "המופע", "bowie": "בואי", "music": "מוזיקה", "band": "ההרכב", "dates": "תאריכים" },
  "hero": { "question": "מי היה דייויד בואי?", "title": "BOWIE", "subtitle": "YADAYADAS", "tagline": "מופע חי" },
  "question": { "heading": "מי היה דייויד בואי?", "fragments": ["הזיקית", "החריג", "כוכב הרוק", "השחקן", "האמן", "האיש"] },
  "bowies": {
    "eras": [
      { "name": "זיגי", "line": "צבע. אנרגיה. תיאטרליות." },
      { "name": "הדוכס הצנום הלבן", "line": "זיגי היה צריך למות." },
      { "name": "ברלין", "line": "הדוכס הצנום הלבן היה צריך להיעלם." },
      { "name": "LET'S DANCE", "line": "צבע. תנועה. פופ." },
      { "name": "BLACKSTAR", "line": "מסתורין. תמותה. אמנות." }
    ]
  },
  "musicStarts": { "label": "ואז המוזיקה מתחילה" },
  "band": { "heading": "שישה נגנים.", "subheading": "מסע אחד מוזר." },
  "sound": { "words": ["רוקנרול", "סקסופון", "כינור", "גיטרה", "בלדות", "חזק", "שקט", "בואי"] },
  "story": { "heading": "הדוכס הצנום הלבן" },
  "quotes": { "primary": "מי אני עכשיו? מה קורה אם אני הופך לדמות הזו? מתי אני צריך לנטוש אותה? ומי אני הופך להיות אחר כך?" },
  "events": { "heading": "תאריכים", "empty": "תאריכים נוספים יפורסמו בקרוב.", "ticketsCta": "לכרטיסים" },
  "final": { "line1": "דייויד בואי מעולם לא היה רק אדם אחד.", "line2": "גם אנחנו לא.", "cta": "בואו לראות את YADAYADAS חיים" },
  "languageToggle": { "label": "HE" }
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/content.schema.test.ts`
Expected: PASS — all assertions pass (6 members, valid event dates, 16 story beats with matching
order indices, identical key sets between `copy.he.json`/`copy.en.json` including the `bowies.eras`
block added in Step 6/7).

- [ ] **Step 9: Commit**

```bash
git add src/content/ src/content.schema.test.ts
git commit -m "Add bilingual content data with schema tests"
```

---

## Task 4: Base Layout & i18n Routing

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/LanguageToggle.astro`
- Create: `src/pages/he/index.astro`
- Create: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource-variable/rubik';
import '@fontsource/assistant/400.css';
import '@fontsource/assistant/600.css';
import '@fontsource/assistant/800.css';
import '@fontsource/jetbrains-mono/500.css';
import '../styles/tokens.css';

interface Props {
  locale: 'he' | 'en';
  title: string;
  description: string;
}

const { locale, title, description } = Astro.props;
const dir = locale === 'he' ? 'rtl' : 'ltr';
const canonical = new URL(Astro.url.pathname, Astro.site ?? 'https://yadayadas.example').toString();
---

<!doctype html>
<html lang={locale} dir={dir}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <slot />
    <script>
      import '../scripts/smooth-scroll';
    </script>
  </body>
</html>
```

- [ ] **Step 2: Write `src/scripts/reduced-motion.ts`**

```typescript
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 3: Write `src/scripts/smooth-scroll.ts`**

```typescript
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './reduced-motion';

gsap.registerPlugin(ScrollTrigger);

if (!prefersReducedMotion()) {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}
```

- [ ] **Step 4: Write `src/components/LanguageToggle.astro`**

Swaps `/he/...` ↔ `/en/...` on the current path, preserving the scroll-position fraction across
navigation via `sessionStorage`.

```astro
---
interface Props {
  locale: 'he' | 'en';
  label: string;
}
const { locale, label } = Astro.props;
---

<button id="lang-toggle" class="label" aria-label="Switch language" data-locale={locale}>
  {label}
</button>

<style>
  #lang-toggle {
    position: fixed;
    top: var(--space-sm);
    inset-inline-end: var(--space-sm);
    z-index: 100;
    background: transparent;
    border: 1px solid var(--color-off-white);
    color: var(--color-off-white);
    padding: var(--space-xs) var(--space-sm);
    cursor: pointer;
  }
</style>

<script>
  const btn = document.getElementById('lang-toggle')!;
  btn.addEventListener('click', () => {
    const scrollFraction =
      window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
    sessionStorage.setItem('yy-scroll-fraction', String(scrollFraction));

    const currentLocale = btn.getAttribute('data-locale');
    const targetLocale = currentLocale === 'he' ? 'en' : 'he';
    const path = window.location.pathname.replace(`/${currentLocale}/`, `/${targetLocale}/`);
    window.location.href = path;
  });

  window.addEventListener('load', () => {
    const stored = sessionStorage.getItem('yy-scroll-fraction');
    if (stored) {
      sessionStorage.removeItem('yy-scroll-fraction');
      const fraction = parseFloat(stored);
      window.scrollTo(0, fraction * (document.documentElement.scrollHeight - window.innerHeight));
    }
  });
</script>
```

- [ ] **Step 5: Write `src/pages/he/index.astro`** (placeholder body — sections added in later tasks)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import LanguageToggle from '../../components/LanguageToggle.astro';
import copy from '../../content/copy.he.json';
---

<BaseLayout locale="he" title={copy.meta.title} description={copy.meta.description}>
  <LanguageToggle locale="he" label={copy.languageToggle.label} />
  <main>
    <p class="label" style="padding: 2rem;">YADAYADAS — HE build in progress</p>
  </main>
</BaseLayout>
```

- [ ] **Step 6: Write `src/pages/en/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import LanguageToggle from '../../components/LanguageToggle.astro';
import copy from '../../content/copy.en.json';
---

<BaseLayout locale="en" title={copy.meta.title} description={copy.meta.description}>
  <LanguageToggle locale="en" label={copy.languageToggle.label} />
  <main>
    <p class="label" style="padding: 2rem;">YADAYADAS — EN build in progress</p>
  </main>
</BaseLayout>
```

- [ ] **Step 7: Verify both routes render**

Run: `npm run dev`, then open a browser to `http://localhost:4321/he/` and
`http://localhost:4321/en/`.
Expected: `/he/` shows `dir="rtl"` in the page's `<html>` tag (check via devtools or view-source)
and the Hebrew placeholder text; `/en/` shows `dir="ltr"` and the English placeholder text. Click
the language toggle button on each — it should navigate to the other locale's `/` route.

- [ ] **Step 8: Commit**

```bash
git add src/layouts/ src/components/LanguageToggle.astro src/pages/ src/scripts/
git commit -m "Add bilingual base layout, i18n routing, and language toggle"
```

---

## Task 5: Hero Section

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/Hero.astro`**

```astro
---
interface Props {
  question: string;
  title: string;
  subtitle: string;
  tagline: string;
}
const { question, title, subtitle, tagline } = Astro.props;
---

<section id="hero" class="hero has-grain">
  <div class="hero__bg" aria-hidden="true"></div>
  <p class="hero__question label">{question}</p>
  <h1 class="hero__title">{title}</h1>
  <p class="hero__subtitle">{subtitle}</p>
  <p class="hero__tagline label">{tagline}</p>
</section>

<style>
  .hero {
    position: relative;
    height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;
    background: var(--color-black);
  }

  .hero__bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, var(--color-charcoal) 0%, var(--color-black) 70%);
    z-index: 0;
  }

  .hero__question {
    position: relative;
    z-index: 1;
    margin-bottom: var(--space-md);
  }

  .hero__title {
    position: relative;
    z-index: 1;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-xl);
    line-height: 0.9;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .hero__subtitle {
    position: relative;
    z-index: 1;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--size-display-md);
    margin: var(--space-sm) 0 0;
  }

  .hero__tagline {
    position: relative;
    z-index: 1;
    margin-top: var(--space-md);
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  if (!prefersReducedMotion()) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__question', { opacity: 0, y: 20, duration: 0.8 })
      .from('.hero__title', { opacity: 0, scale: 0.85, duration: 1.1 }, '+=0.3')
      .from('.hero__subtitle', { opacity: 0, y: 30, duration: 0.7 }, '-=0.4')
      .from('.hero__tagline', { opacity: 0, duration: 0.6 }, '-=0.2');
  }
</script>
```

- [ ] **Step 2: Wire it into `src/pages/he/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import LanguageToggle from '../../components/LanguageToggle.astro';
import Hero from '../../components/Hero.astro';
import copy from '../../content/copy.he.json';
---

<BaseLayout locale="he" title={copy.meta.title} description={copy.meta.description}>
  <LanguageToggle locale="he" label={copy.languageToggle.label} />
  <main>
    <Hero
      question={copy.hero.question}
      title={copy.hero.title}
      subtitle={copy.hero.subtitle}
      tagline={copy.hero.tagline}
    />
  </main>
</BaseLayout>
```

- [ ] **Step 3: Wire it into `src/pages/en/index.astro`** (same pattern, English copy)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import LanguageToggle from '../../components/LanguageToggle.astro';
import Hero from '../../components/Hero.astro';
import copy from '../../content/copy.en.json';
---

<BaseLayout locale="en" title={copy.meta.title} description={copy.meta.description}>
  <LanguageToggle locale="en" label={copy.languageToggle.label} />
  <main>
    <Hero
      question={copy.hero.question}
      title={copy.hero.title}
      subtitle={copy.hero.subtitle}
      tagline={copy.hero.tagline}
    />
  </main>
</BaseLayout>
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`, open `http://localhost:4321/he/` and `http://localhost:4321/en/`.
Expected: full-viewport dark hero, question label fades in, then `BOWIE` scales in large, then
`YADAYADAS` and the tagline. Confirm the sequence plays once per load and text is centered/legible
in both RTL and LTR. Resize to a mobile width (375px) and confirm the title still fits without
horizontal overflow (uses `clamp()` from tokens, should scale down).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Add Hero section with GSAP intro timeline"
```

---

## Task 6: The Question + The Many Bowies

**Files:**
- Create: `src/components/QuestionAndBowies.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

Both sections share a mechanism: a pinned container whose scroll progress drives a horizontal
translateX on desktop, and a plain vertical stack on mobile (per spec §7's desktop→mobile
transform pattern). The `bowies.eras` content field was already added to `copy.he.json`/
`copy.en.json` in Task 3, Steps 6–7 — no content-file edits needed here.

- [ ] **Step 1: Write `src/components/QuestionAndBowies.astro`**

```astro
---
interface Era {
  name: string;
  line: string;
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

  <div class="qab__track" data-track>
    {fragments.map((f) => (
      <div class="qab__panel qab__panel--fragment">
        <span class="qab__word">{f}</span>
      </div>
    ))}
    {eras.map((era) => (
      <div class="qab__panel qab__panel--era">
        <span class="qab__era-name">{era.name}</span>
        <span class="qab__era-line">{era.line}</span>
      </div>
    ))}
  </div>
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
    gap: var(--space-md);
  }

  .qab__panel {
    min-height: 40vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-md);
  }

  .qab__word {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-lg);
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

  /* Desktop: pinned horizontal scroll */
  @media (min-width: 900px) {
    .qab__track {
      flex-direction: row;
      flex-wrap: nowrap;
      width: max-content;
    }

    .qab__panel {
      width: 100vw;
      height: 100vh;
      flex-shrink: 0;
    }
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  gsap.registerPlugin(ScrollTrigger);

  function setupHorizontalScroll() {
    const section = document.getElementById('question-and-bowies');
    const track = section?.querySelector('[data-track]') as HTMLElement | null;
    if (!section || !track) return;

    const isDesktop = window.matchMedia('(min-width: 900px)').matches;
    if (!isDesktop || prefersReducedMotion()) return;

    const distance = track.scrollWidth - window.innerWidth;
    if (distance <= 0) return;

    gsap.to(track, {
      x: () => -distance,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance}`,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    });
  }

  setupHorizontalScroll();
  window.addEventListener('resize', () => ScrollTrigger.refresh());
</script>
```

- [ ] **Step 2: Wire into both pages**

Modify `src/pages/he/index.astro` — add import and usage after `<Hero .../>`:

```astro
import QuestionAndBowies from '../../components/QuestionAndBowies.astro';
```

```astro
    <QuestionAndBowies
      heading={copy.question.heading}
      fragments={copy.question.fragments}
      eras={copy.bowies.eras}
    />
```

Modify `src/pages/en/index.astro` the same way with the English `copy` import already in scope.

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`, open `http://localhost:4321/he/` at a desktop width (≥1280px). Scroll down into
the section — confirm it pins and the panels slide horizontally (RTL: panels should visually feel
consistent with reading direction — acceptable for v1 if they scroll in the same DOM order; a
polish pass can reverse direction for RTL later, note this as a follow-up, not a blocker).
Resize to 375px width and reload — confirm the same section now stacks vertically with normal
page scroll (no pinning, no horizontal movement).

- [ ] **Step 4: Commit**

```bash
git add src/components/QuestionAndBowies.astro src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Add Question and Many Bowies sections with horizontal-scroll/mobile-stack pattern"
```

---

## Task 7: Then the Music Starts + Band

**Files:**
- Create: `src/components/MusicStartsAndBand.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/MusicStartsAndBand.astro`**

```astro
---
interface Member {
  id: string;
  nameHe: string;
  nameEn: string;
  instrumentHe: string;
  instrumentEn: string;
  photo: string;
}
interface Props {
  locale: 'he' | 'en';
  label: string;
  heading: string;
  subheading: string;
  members: Member[];
}
const { locale, label, heading, subheading, members } = Astro.props;
---

<section id="music-starts" class="transition has-grain">
  <p class="label transition__label">{label}</p>
</section>

<section id="band" class="band">
  <h2 class="band__heading">{heading}</h2>
  <p class="band__subheading">{subheading}</p>

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
        <p class="band__instrument label">{locale === 'he' ? m.instrumentHe : m.instrumentEn}</p>
      </div>
    ))}
  </div>
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
    font-size: 1.2rem;
  }

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

  .band__photo {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    display: block;
  }

  .band__name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.25rem;
    margin: var(--space-sm) 0 0;
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
  }
</script>
```

- [ ] **Step 2: Wire into `src/pages/he/index.astro`**

```astro
import MusicStartsAndBand from '../../components/MusicStartsAndBand.astro';
import bandMembers from '../../content/band-members.json';
```

```astro
    <MusicStartsAndBand
      locale="he"
      label={copy.musicStarts.label}
      heading={copy.band.heading}
      subheading={copy.band.subheading}
      members={bandMembers.filter((m) => m.role === 'core')}
    />
```

- [ ] **Step 3: Wire into `src/pages/en/index.astro`** (same pattern, `locale="en"`)

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`, open `/he/`, scroll to the band section. Confirm all 6 members render with
name + instrument in Hebrew, photos load, and each member fades/rises in with a stagger as the
grid scrolls into view. Confirm the same on `/en/` with English labels. Resize to mobile — grid
should be single-column.

- [ ] **Step 5: Commit**

```bash
git add src/components/MusicStartsAndBand.astro src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Add music-starts transition and Band reveal section"
```

---

## Task 8: The Sound

**Files:**
- Create: `src/components/Sound.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

Video files referenced here (`/assets/video/under-pressure.mp4`) are produced by Task 14's
extraction script — this component references that exact filename, so Task 14 must use it verbatim.

- [ ] **Step 1: Write `src/components/Sound.astro`**

```astro
---
interface Props {
  words: string[];
}
const { words } = Astro.props;
---

<section id="sound" class="sound has-grain">
  <video
    class="sound__video"
    autoplay
    muted
    loop
    playsinline
    poster="/assets/photos/photo_09.jpg"
  >
    <source src="/assets/video/under-pressure.mp4" type="video/mp4" />
  </video>

  <div class="sound__overlay">
    {words.map((w) => (
      <span class="sound__word" data-sound-word>{w}</span>
    ))}
  </div>
</section>

<style>
  .sound {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--color-black);
  }

  .sound__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5;
  }

  .sound__overlay {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .sound__word {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-lg);
    opacity: 0;
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  gsap.registerPlugin(ScrollTrigger);

  const words = gsap.utils.toArray('[data-sound-word]') as HTMLElement[];
  const video = document.querySelector('.sound__video') as HTMLVideoElement | null;

  // Respect reduced-motion: pause the background video and just show the words statically.
  if (prefersReducedMotion()) {
    video?.pause();
    words.forEach((w) => (w.style.opacity = '1'));
  } else {
    gsap.to(words, {
      opacity: 1,
      duration: 0.4,
      stagger: 0.5,
      scrollTrigger: {
        trigger: '#sound',
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      },
    });
  }
</script>
```

- [ ] **Step 2: Wire into `src/pages/he/index.astro`**

```astro
import Sound from '../../components/Sound.astro';
```

```astro
    <Sound words={copy.sound.words} />
```

- [ ] **Step 3: Wire into `src/pages/en/index.astro`** (same pattern)

- [ ] **Step 4: Verify in browser**

Run: `npm run dev` (video won't exist until Task 14 runs the extraction script — confirm the
`poster` image shows as a fallback and the layout doesn't break with a missing video source; check
devtools console shows a 404 for the video source at this point, which is expected until Task 14).
Confirm the word list renders and fades in on scroll.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sound.astro src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Add Sound section with video background and rhythmic word reveal"
```

---

## Task 9: The Story (Thin White Duke)

**Files:**
- Create: `src/components/Story.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/Story.astro`**

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

<section id="story" class="story">
  <h2 class="story__heading label">{heading}</h2>
  <div class="story__beats">
    {sorted.map((b) => (
      <p class="story__beat" data-story-beat>{locale === 'he' ? b.he : b.en}</p>
    ))}
  </div>
</section>

<style>
  .story {
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
    max-width: 46rem;
    margin-inline: auto;
  }

  .story__heading {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .story__beats {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .story__beat {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--size-display-md);
    line-height: 1.25;
    text-align: center;
    margin: 0;
    opacity: 0;
    transform: translateY(24px);
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  gsap.registerPlugin(ScrollTrigger);

  const beats = gsap.utils.toArray('[data-story-beat]') as HTMLElement[];

  if (prefersReducedMotion()) {
    beats.forEach((b) => {
      b.style.opacity = '1';
      b.style.transform = 'none';
    });
  } else {
    beats.forEach((beat) => {
      gsap.to(beat, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: beat,
          start: 'top 80%',
        },
      });
    });
  }
</script>
```

- [ ] **Step 2: Wire into `src/pages/he/index.astro`**

```astro
import Story from '../../components/Story.astro';
import storyBeats from '../../content/story-beats.json';
```

```astro
    <Story locale="he" heading={copy.story.heading} beats={storyBeats} />
```

- [ ] **Step 3: Wire into `src/pages/en/index.astro`** (same pattern, `locale="en"`)

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`, scroll through the story section on `/he/`. Confirm each of the 16 beats fades
and rises into place one at a time as it enters the viewport (not all at once), text is legible
and centered, RTL alignment reads correctly. Confirm the same on `/en/`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Story.astro src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Add Story section with scroll-triggered Thin White Duke narrative beats"
```

---

## Task 10: Editorial Quotes

**Files:**
- Create: `src/components/EditorialQuotes.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/EditorialQuotes.astro`**

```astro
---
interface Props {
  quote: string;
}
const { quote } = Astro.props;
---

<section id="editorial-quote" class="quote">
  <p class="quote__text">{quote}</p>
</section>

<style>
  .quote {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
  }

  .quote__text {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-lg);
    line-height: 1.05;
    text-align: center;
    max-width: 60rem;
    margin: 0;
  }
</style>
```

No GSAP needed here — this section's job is stillness after the Story section's rhythmic reveals;
letting it appear immediately (no animation) is the intentional contrast.

- [ ] **Step 2: Wire into `src/pages/he/index.astro`**

```astro
import EditorialQuotes from '../../components/EditorialQuotes.astro';
```

```astro
    <EditorialQuotes quote={copy.quotes.primary} />
```

- [ ] **Step 3: Wire into `src/pages/en/index.astro`** (same pattern)

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`, scroll to the quote section on both locales. Confirm the full refrain
("Who am I now? ... Who do I become next?" / Hebrew equivalent) is centered, large, and legible
without overflow at both desktop and mobile widths.

- [ ] **Step 5: Commit**

```bash
git add src/components/EditorialQuotes.astro src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Add Editorial Quotes section"
```

---

## Task 11: Events

**Files:**
- Create: `src/components/Events.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/Events.astro`**

```astro
---
interface Event {
  id: string;
  status: 'past' | 'upcoming';
  dateISO: string;
  venueHe: string;
  venueEn: string;
  cityHe: string;
  cityEn: string;
  ticketUrl: string;
}
interface Props {
  locale: 'he' | 'en';
  heading: string;
  emptyLabel: string;
  ticketsCta: string;
  events: Event[];
}
const { locale, heading, emptyLabel, ticketsCta, events } = Astro.props;
const upcoming = events.filter((e) => e.status === 'upcoming');

function formatDate(iso: string, locale: 'he' | 'en') {
  return new Date(iso).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
---

<section id="events" class="events">
  <h2 class="events__heading">{heading}</h2>

  {upcoming.length === 0 ? (
    <p class="events__empty label">{emptyLabel}</p>
  ) : (
    <ul class="events__list">
      {upcoming.map((e) => (
        <li class="events__row">
          <span class="events__date label">{formatDate(e.dateISO, locale)}</span>
          <span class="events__venue">{locale === 'he' ? e.venueHe : e.venueEn}</span>
          <span class="events__city label">{locale === 'he' ? e.cityHe : e.cityEn}</span>
          {e.ticketUrl && (
            <a class="events__cta" href={e.ticketUrl} target="_blank" rel="noopener noreferrer">
              {ticketsCta}
            </a>
          )}
        </li>
      ))}
    </ul>
  )}
</section>

<style>
  .events {
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
  }

  .events__heading {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-md);
    text-align: center;
    margin: 0 0 var(--space-lg);
  }

  .events__empty {
    text-align: center;
    font-size: 1rem;
  }

  .events__list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-width: 50rem;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .events__row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: baseline;
    gap: var(--space-sm);
    border-bottom: 1px solid var(--color-charcoal);
    padding-block: var(--space-sm);
  }

  .events__venue {
    font-family: var(--font-display);
    font-size: 1.25rem;
  }

  .events__cta {
    grid-column: 1 / -1;
    justify-self: start;
    color: var(--color-accent-green);
    text-decoration: underline;
  }
</style>
```

- [ ] **Step 2: Wire into `src/pages/he/index.astro`**

```astro
import Events from '../../components/Events.astro';
import events from '../../content/events.json';
```

```astro
    <Events
      locale="he"
      heading={copy.events.heading}
      emptyLabel={copy.events.empty}
      ticketsCta={copy.events.ticketsCta}
      events={events}
    />
```

- [ ] **Step 3: Wire into `src/pages/en/index.astro`** (same pattern, `locale="en"`)

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`, scroll to the events section on `/he/`. Since `events.json` currently has no
`status: "upcoming"` entries, confirm the empty state message renders (not a blank/broken section).
Manually add a test entry with `"status": "upcoming"` and a `dateISO`, reload, confirm it renders
as a formatted row with venue/city/date, then revert the test edit (don't commit it).

- [ ] **Step 5: Commit**

```bash
git add src/components/Events.astro src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Add Events section with graceful empty state"
```

---

## Task 12: Final Scene

**Files:**
- Create: `src/components/FinalScene.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/FinalScene.astro`**

```astro
---
interface Props {
  line1: string;
  line2: string;
  cta: string;
}
const { line1, line2, cta } = Astro.props;
---

<section id="final-scene" class="final">
  <p class="final__line1" data-final-line>{line1}</p>
  <p class="final__line2" data-final-line>{line2}</p>
  <a class="final__cta" href="#events" data-final-cta>{cta}</a>
</section>

<style>
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

  .final__line1,
  .final__line2 {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-md);
    margin: 0;
    opacity: 0;
  }

  .final__cta {
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
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  gsap.registerPlugin(ScrollTrigger);

  const targets = [
    ...(gsap.utils.toArray('[data-final-line]') as HTMLElement[]),
    document.querySelector('[data-final-cta]') as HTMLElement,
  ];

  if (prefersReducedMotion()) {
    targets.forEach((t) => (t.style.opacity = '1'));
  } else {
    gsap.to(targets, {
      opacity: 1,
      duration: 0.8,
      stagger: 0.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#final-scene',
        start: 'top 60%',
      },
    });
  }
</script>
```

- [ ] **Step 2: Wire into `src/pages/he/index.astro`**

```astro
import FinalScene from '../../components/FinalScene.astro';
```

```astro
    <FinalScene line1={copy.final.line1} line2={copy.final.line2} cta={copy.final.cta} />
```

- [ ] **Step 3: Wire into `src/pages/en/index.astro`** (same pattern)

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`, scroll to the very bottom of `/he/` and `/en/`. Confirm the two closing lines
and the CTA button fade in with a stagger, and clicking the CTA scrolls back up to the Events
section (`#events` anchor).

- [ ] **Step 5: Commit**

```bash
git add src/components/FinalScene.astro src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Add Final Scene closing section"
```

---

## Task 13: Full Page Assembly Cleanup

**Files:**
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

By now both page files have accumulated imports/usages added incrementally across Tasks 5–12. This
task is a straight read-through to confirm the full section order matches the spec and nothing was
missed or duplicated — not new functionality.

- [ ] **Step 1: Read `src/pages/he/index.astro` in full and confirm section order**

Expected order inside `<main>`: `Hero`, `QuestionAndBowies`, `MusicStartsAndBand`, `Sound`, `Story`,
`EditorialQuotes`, `Events`, `FinalScene`. If any are out of order or missing (compare against the
imports at the top of the file), fix the `<main>` body to match this order exactly.

- [ ] **Step 2: Repeat Step 1 for `src/pages/en/index.astro`**

- [ ] **Step 3: Full-page scroll-through verification**

Run: `npm run dev`, open `/he/`, and scroll from top to bottom without interruption. Confirm: no
section overlaps another, no console errors, every GSAP ScrollTrigger fires once per section as it
enters view, language toggle remains visible/clickable throughout (it's `position: fixed`). Repeat
for `/en/`.

- [ ] **Step 4: Commit** (only if Steps 1–2 required fixes; otherwise skip — nothing to commit)

```bash
git add src/pages/he/index.astro src/pages/en/index.astro
git commit -m "Fix section ordering in page assembly"
```

---

## Task 14: Asset Pipeline — Extract Real Video Clips

**Files:**
- Create: `scripts/extract-fb-videos.mjs`
- Create: `public/assets/video/.gitkeep`
- Test: `scripts/extract-fb-videos.test.mjs`

The Facebook export zip is at `C:\Users\roiis\Downloads\facebook-YadayadasIL-09_08_2026-1ldiFay8.zip`
(local machine path — this script is a one-off dev-time tool, not part of the deployed site, so a
hardcoded path with a clear override via CLI arg is acceptable here). Extraction uses the `adm-zip`
package (added to `package.json` devDependencies in Task 1) rather than shelling out to external
`unzip`/`mv` tools — this keeps the script portable and dependency-free at the OS level.

- [ ] **Step 1: Write the failing test for the filename-mapping logic — `scripts/extract-fb-videos.test.mjs`**

```javascript
import { describe, it, expect } from 'vitest';
import { buildOutputFilename } from './extract-fb-videos.mjs';

describe('buildOutputFilename', () => {
  it('maps a known source path to its target name', () => {
    const result = buildOutputFilename(
      "this_profile's_activity_across_facebook/posts/media/videos/1041231161493966.mp4",
      { 'this_profile\'s_activity_across_facebook/posts/media/videos/1041231161493966.mp4': 'under-pressure.mp4' }
    );
    expect(result).toBe('under-pressure.mp4');
  });

  it('returns null for a source path not in the selection map', () => {
    const result = buildOutputFilename('some/other/path.mp4', {});
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run scripts/extract-fb-videos.test.mjs`
Expected: FAIL — `extract-fb-videos.mjs` doesn't exist yet.

- [ ] **Step 3: Write `scripts/extract-fb-videos.mjs`**

This script requires manual, one-time work before it can succeed: confirming which exact `.mp4`
filename inside the FB export corresponds to the Aug 9, 2026 "Under Pressure" live clip referenced
in Task 8's `Sound.astro`, since Facebook's export filenames are opaque numeric IDs with no caption
in the filename itself. The `SELECTED_VIDEOS` map below has a placeholder source ID — **replace the
key with the real ID found by cross-referencing `profile_posts_1.html` (around the "Under pressure"
caption, posted Aug 9, 2026) against `posts/videos.html`'s link list before running this script.**

```javascript
import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const DEFAULT_ZIP_PATH =
  'C:\\Users\\roiis\\Downloads\\facebook-YadayadasIL-09_08_2026-1ldiFay8.zip';

const FB_PREFIX = "this_profile's_activity_across_facebook/posts/media/videos/";

// Map of { <exact zip-internal source path> : <output filename in public/assets/video/> }.
// REPLACE the numeric ID below with the real one identified by cross-referencing
// posts/videos.html against the Aug 9, 2026 "Under pressure" post before running this for real.
export const SELECTED_VIDEOS = {
  [`${FB_PREFIX}REPLACE_WITH_REAL_ID.mp4`]: 'under-pressure.mp4',
};

export function buildOutputFilename(sourcePath, selectionMap) {
  return selectionMap[sourcePath] ?? null;
}

function main() {
  const zipPath = process.argv[2] ?? DEFAULT_ZIP_PATH;
  if (!existsSync(zipPath)) {
    console.error(`Zip not found at ${zipPath}. Pass the path as the first argument.`);
    process.exit(1);
  }

  const outDir = join(PROJECT_ROOT, 'public', 'assets', 'video');
  mkdirSync(outDir, { recursive: true });

  const zip = new AdmZip(zipPath);

  for (const [sourcePath, outputName] of Object.entries(SELECTED_VIDEOS)) {
    if (sourcePath.includes('REPLACE_WITH_REAL_ID')) {
      console.warn(`Skipping unresolved placeholder mapping for ${outputName} — edit SELECTED_VIDEOS first.`);
      continue;
    }
    const entry = zip.getEntry(sourcePath);
    if (!entry) {
      console.warn(`Entry not found in zip: ${sourcePath} — skipping ${outputName}.`);
      continue;
    }
    const outputPath = join(outDir, outputName);
    console.log(`Extracting ${sourcePath} -> ${outputPath}`);
    writeFileSync(outputPath, entry.getData());
  }

  console.log('Done. Remember to compress large clips (H.264, web-reasonable bitrate) before deploying.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `npx vitest run scripts/extract-fb-videos.test.mjs`
Expected: PASS (tests only the pure `buildOutputFilename` mapping function, not the file-extraction
side effects, so they pass without touching the real zip).

- [ ] **Step 5: Create `public/assets/video/.gitkeep`**

```
```

(empty file — keeps the directory tracked in git since actual `.mp4` files are gitignored)

- [ ] **Step 6: Manually resolve the real video ID and run the extraction**

This step requires the developer to inspect the FB export (not automatable inside this plan since
it depends on manually cross-referencing two HTML files by eye). Extract just the reference HTML
file to inspect it (using the same `adm-zip` package already installed, via a quick one-off Node
one-liner, or any zip-viewing tool the developer already has — no specific tool is mandated here):

Open the FB export zip's `this_profile's_activity_across_facebook/posts/videos.html` entry, find
the video link nearest the "Under pressure" caption (dated Aug 9, 2026 per the brainstorming
transcript — search the sibling `profile_posts_1.html` for that caption to confirm timing/context),
note its `.mp4` filename, and replace `REPLACE_WITH_REAL_ID` in `SELECTED_VIDEOS`
(`scripts/extract-fb-videos.mjs`) with the real ID.

Then run:

```bash
node scripts/extract-fb-videos.mjs
```

Expected: `public/assets/video/under-pressure.mp4` exists and plays back correctly (spot-check by
opening it in a media player).

- [ ] **Step 7: Verify Sound.astro now has a working video**

Run: `npm run dev`, open `/he/`, scroll to the Sound section. Confirm the background video now
plays (muted, looping) instead of showing only the poster image, and the devtools console no
longer shows a 404 for the video source.

- [ ] **Step 8: Commit**

```bash
git add scripts/extract-fb-videos.mjs scripts/extract-fb-videos.test.mjs public/assets/video/.gitkeep
git commit -m "Add FB video extraction script and populate Sound section video"
```

Note: the real `.mp4` file itself is gitignored (per Task 1's `.gitignore`) — it's a build input,
not source-controlled. Document this for deployment: the deploy pipeline needs
`public/assets/video/under-pressure.mp4` present at build time. Since the source zip is local-only, the
practical path is uploading the final compressed clip to the hosting provider's asset storage
directly before first deploy — flag this as a deployment prerequisite, not something CI can
reproduce from the zip.

---

## Task 15: Accessibility & Performance Pass

**Files:**
- Modify: `src/components/Hero.astro` (only if Step 2 finds an issue)
- Test: `src/a11y.test.ts`

- [ ] **Step 1: Write a structural accessibility test — `src/a11y.test.ts`**

Since there's no component-rendering test harness set up (Astro components aren't trivially
unit-testable without a browser), this test reads the *built* HTML output. It assumes `npm run
build` has already been run (Step 2 below) — it does not shell out to trigger the build itself, to
avoid the test suite depending on spawning external processes.

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');

beforeAll(() => {
  if (!existsSync(join(DIST, 'he', 'index.html'))) {
    throw new Error(
      'dist/he/index.html not found. Run `npm run build` before running this test suite.'
    );
  }
});

describe('accessibility structure — /he/', () => {
  const html = () => readFileSync(join(DIST, 'he', 'index.html'), 'utf-8');

  it('sets dir="rtl" and lang="he" on <html>', () => {
    expect(html()).toMatch(/<html[^>]*lang="he"[^>]*dir="rtl"/);
  });

  it('has exactly one <h1>', () => {
    const matches = html().match(/<h1[\s>]/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  it('has a <main> landmark', () => {
    expect(html()).toContain('<main');
  });

  it('every <img> has a non-empty alt attribute', () => {
    const imgTags = html().match(/<img[^>]*>/g) ?? [];
    expect(imgTags.length).toBeGreaterThan(0);
    for (const tag of imgTags) {
      expect(tag).toMatch(/alt="[^"]+"/);
    }
  });
});

describe('accessibility structure — /en/', () => {
  const html = () => readFileSync(join(DIST, 'en', 'index.html'), 'utf-8');

  it('sets dir="ltr" and lang="en" on <html>', () => {
    expect(html()).toMatch(/<html[^>]*lang="en"[^>]*dir="ltr"/);
  });

  it('has exactly one <h1>', () => {
    const matches = html().match(/<h1[\s>]/g) ?? [];
    expect(matches).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Build the site, then run the test**

Run: `npm run build`
Expected: builds without errors, produces `dist/he/index.html` and `dist/en/index.html`.

Run: `npx vitest run src/a11y.test.ts`
Expected: likely PASS on first try — `Hero.astro` is the only component using `<h1>`, every other
section heading uses `<h2>` (verify this was followed correctly in Tasks 5–12). If the "exactly one
`<h1>`" assertion fails, find which component has a second `<h1>` and change it to `<h2>`.

- [ ] **Step 3: Fix any failures found in Step 2**

(Concrete fix depends on what Step 2 finds — the general rule: only `Hero.astro`'s title is `<h1>`;
every other section heading is `<h2>`.)

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npm run build && npx vitest run src/a11y.test.ts`
Expected: PASS.

- [ ] **Step 5: Manual Lighthouse check**

Run: `npm run preview` (serves the `dist/` build), open the preview URL in Chrome DevTools, run
Lighthouse (Performance + Accessibility categories) against `/he/`. Target: Performance ≥ 85,
Accessibility ≥ 95 (video-heavy sections may cap Performance below 90 until video compression is
tuned — note the actual score, don't block on hitting an exact number, but do fix anything
Lighthouse flags as a clear bug, e.g. missing `width`/`height` causing layout shift).

- [ ] **Step 6: Commit**

```bash
git add src/a11y.test.ts src/components/
git commit -m "Add accessibility structure tests and fix heading hierarchy"
```

---

## Task 16: Final Creative Review

**Files:** none (verification-only task)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all Vitest suites pass (design tokens, content schema, extract-fb-videos mapping, a11y —
a11y requires `dist/` to exist, so run `npm run build` first if it was cleaned since Task 15).

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: builds without errors, `dist/he/index.html` and `dist/en/index.html` both exist.

- [ ] **Step 3: Walk through the spec's quality-bar test (spec §10, item 8)**

Using `npm run preview`, go through the site fresh (clear cache / private window) and answer
honestly against the design spec's own bar:
- First 5 seconds: does it feel extraordinary, or like a template?
- 15 seconds: am I curious?
- 30 seconds: is it clear this isn't a conventional tribute-band site?
- 60 seconds: do I want to see the band live?
- After scrolling: did I discover something about Bowie?
- At the end: do I feel something?

If any answer is "no," note specifically which section fell short — this becomes a follow-up task,
not a blocker for this plan (the plan produces a complete, working v1; further creative polish is
explicitly iterative per the spec's phase list).

- [ ] **Step 4: Confirm the "rock'n'roll, not sterile" check from the spec**

Re-read spec §1's closing note. Scroll through both locales once more specifically watching for
sections that feel too quiet/gallery-like relative to the live-show sections (Hero, Music Starts,
Sound). Note any that need more energy in a follow-up pass — don't fix in this task, just document.

- [ ] **Step 5: Report findings**

Summarize: test suite status, build status, and the honest answers to Step 3/4's questions, to the
user, along with the list of open items from spec §11 that still need real input (upcoming tour
dates, band bios, Hebrew translation review of the Duke/Berlin narrative, final CTA wording
approval, display typeface final pick).

---

## Plan Self-Review Notes

- **Spec coverage**: All 10 sections from spec §6 have a task (Hero=T5, Question+ManyBowies=T6,
  MusicStarts+Band=T7, Sound=T8, Story=T9, Quotes=T10, Events=T11, FinalScene=T12). Architecture
  (§4)=T1, design system (§5)=T2, content model=T3, i18n/routing (§3)=T4, asset pipeline (§8)=T14,
  accessibility/performance (§9)=T15, final review against §10's own bar=T16.
- **Known gap carried forward on purpose**: the exact source video ID for the Sound section can't
  be resolved without a human eyeballing the FB export's `videos.html` (Task 14, Step 6) — this is
  flagged explicitly in the task rather than faked with a wrong ID that would silently produce a
  broken video.
- **No shell-exec dependencies**: the video extraction script (Task 14) uses the `adm-zip` library
  rather than shelling out to `unzip`/`mv`, avoiding `child_process` entirely — safer and more
  portable across OSes. The accessibility test (Task 15) reads pre-built `dist/` output rather than
  invoking the build itself, so no test file spawns child processes either.
- **Type/signature consistency checked**: `Member`/`Event`/`Beat` prop interfaces are redeclared
  per-component (Astro components don't share TS types across files without an explicit shared
  types module) but field names match `band-members.json`/`events.json`/`story-beats.json` exactly
  in every task that touches them (`nameHe`/`nameEn`/`instrumentHe`/`instrumentEn`/`photo`;
  `dateISO`/`venueHe`/`venueEn`/`cityHe`/`cityEn`/`status`/`ticketUrl`; `order`/`he`/`en`).
