# Content Refinements Phase B — Shows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `events.json`/`Events.astro` with `shows.json` + `UpcomingShows.astro` + `PastShows.astro`, using real data researched from Facebook. Full spec: `docs/superpowers/specs/2026-08-11-content-refinements-design.md` (§4, §5, §6).

**⚠️ Scope adjustment from the spec, discovered during this session's research (read before starting):**

1. **Facebook's infinite-scroll on the Events tab reproducibly stalls after 8 items** — confirmed across multiple reload/retry attempts (both `/events` and `/past_hosted_events` URLs, both slow deliberate scrolling and repeated fast scrolling). The spec's table listed 12 candidate shows; only the first 8 have confirmed Facebook event URLs. **This plan ships 8 shows, not 12.** Per the spec's own §4 risk note ("a shorter accurate archive beats a padded inaccurate one"), this is the correct call, not a shortcut to fix later — don't re-attempt scraping rows 9-12 without a good reason to think the stall was transient.

2. **No poster images could be downloaded.** Facebook serves event photos only to authenticated browser sessions with JS execution (confirmed: unauthenticated `curl` to both the event page and its `og:image` CDN URL either gets blocked or returns a JS-redirect stub, not image bytes; the browser-automation screenshot tools that *can* view the posters have no working save-to-disk path reachable from this session's file tools). **`posterImage` ships empty (`""`) for all 8 shows.** Components must render a well-designed typographic fallback card when `posterImage` is empty — not a broken image, not a placeholder gray box. See Task 2/3 for the fallback design. If the user later supplies poster files (e.g. saved from Facebook manually, same pattern as the BOWIE wordmark logo earlier this session), wiring them in is a one-line data change per show — no component change needed, since the components already branch on whether `posterImage` is truthy.

**Confirmed real data — 8 shows, all verified via authenticated Facebook session, newest first:**

| # | Date | Venue (He) | Venue (En) | City (En) | Facebook event URL |
|---|---|---|---|---|---|
| 1 | 2026-08-08 | האיזור | The Zone | Tel Aviv-Jaffa | `facebook.com/events/1057673123384226/` |
| 2 | 2026-07-24 | בלה צ'או | Bella Ciao | Rishon LeZion | `facebook.com/events/1325279466384272/` |
| 3 | 2026-02-14 | Babity Pub | Babity Pub | Kfar Saba | `facebook.com/events/1211094990996739/` |
| 4 | 2025-12-13 | בר גיורא | Bar Giyora | Tel Aviv-Jaffa | `facebook.com/events/694054259991399/` |
| 5 | 2025-10-08 | בית המרזח | Beit HaMarzeach | Ramat Yishai | `facebook.com/events/800502319614615/` |
| 6 | 2025-09-11 | קיבוץ משמרות | Kibbutz Mishmarot | Mishmarot | `facebook.com/events/1461370331766305/` |
| 7 | 2025-09-02 | ההוביט | The Hobbit | Zichron Yaakov | `facebook.com/events/1752663002009712/` |
| 8 | 2025-02-19 | Tassa | Tassa | Tel Aviv-Jaffa | `facebook.com/events/1150418303399970/` |

All 8 have `status: "past"`. Zero `status: "upcoming"` entries exist (confirmed earlier this session — no Upcoming tab exists on Facebook at all).

---

## Task 1: Create shows.json, delete events.json

**Files:**
- Create: `src/content/shows.json`
- Delete: `src/content/events.json`
- Modify: `src/content.schema.test.ts`

- [ ] **Step 1: Create shows.json**

```json
[
  {
    "id": "the-zone-2026-08-08",
    "status": "past",
    "dateISO": "2026-08-08",
    "venueHe": "האיזור",
    "venueEn": "The Zone",
    "cityHe": "תל אביב - יפו",
    "cityEn": "Tel Aviv-Jaffa",
    "posterImage": "",
    "eventUrl": "https://www.facebook.com/events/1057673123384226/",
    "ticketUrl": ""
  },
  {
    "id": "bella-ciao-2026-07-24",
    "status": "past",
    "dateISO": "2026-07-24",
    "venueHe": "בלה צ'או",
    "venueEn": "Bella Ciao",
    "cityHe": "ראשון לציון",
    "cityEn": "Rishon LeZion",
    "posterImage": "",
    "eventUrl": "https://www.facebook.com/events/1325279466384272/",
    "ticketUrl": ""
  },
  {
    "id": "babity-pub-2026-02-14",
    "status": "past",
    "dateISO": "2026-02-14",
    "venueHe": "Babity Pub",
    "venueEn": "Babity Pub",
    "cityHe": "כפר סבא",
    "cityEn": "Kfar Saba",
    "posterImage": "",
    "eventUrl": "https://www.facebook.com/events/1211094990996739/",
    "ticketUrl": ""
  },
  {
    "id": "bar-giyora-2025-12-13",
    "status": "past",
    "dateISO": "2025-12-13",
    "venueHe": "בר גיורא",
    "venueEn": "Bar Giyora",
    "cityHe": "תל אביב - יפו",
    "cityEn": "Tel Aviv-Jaffa",
    "posterImage": "",
    "eventUrl": "https://www.facebook.com/events/694054259991399/",
    "ticketUrl": ""
  },
  {
    "id": "beit-hamarzeach-2025-10-08",
    "status": "past",
    "dateISO": "2025-10-08",
    "venueHe": "בית המרזח",
    "venueEn": "Beit HaMarzeach",
    "cityHe": "רמת ישי",
    "cityEn": "Ramat Yishai",
    "posterImage": "",
    "eventUrl": "https://www.facebook.com/events/800502319614615/",
    "ticketUrl": ""
  },
  {
    "id": "mishmarot-2025-09-11",
    "status": "past",
    "dateISO": "2025-09-11",
    "venueHe": "קיבוץ משמרות",
    "venueEn": "Kibbutz Mishmarot",
    "cityHe": "משמרות",
    "cityEn": "Mishmarot",
    "posterImage": "",
    "eventUrl": "https://www.facebook.com/events/1461370331766305/",
    "ticketUrl": ""
  },
  {
    "id": "hobbit-bar-2025-09-02",
    "status": "past",
    "dateISO": "2025-09-02",
    "venueHe": "ההוביט",
    "venueEn": "The Hobbit",
    "cityHe": "זכרון יעקב",
    "cityEn": "Zichron Yaakov",
    "posterImage": "",
    "eventUrl": "https://www.facebook.com/events/1752663002009712/",
    "ticketUrl": ""
  },
  {
    "id": "tassa-2025-02-19",
    "status": "past",
    "dateISO": "2025-02-19",
    "venueHe": "Tassa",
    "venueEn": "Tassa",
    "cityHe": "תל אביב - יפו",
    "cityEn": "Tel Aviv-Jaffa",
    "posterImage": "",
    "eventUrl": "https://www.facebook.com/events/1150418303399970/",
    "ticketUrl": ""
  }
]
```

- [ ] **Step 2: Delete events.json**

```bash
git rm src/content/events.json
```

- [ ] **Step 3: Add a schema test for shows.json**

In `src/content.schema.test.ts`, replace the `events.json` describe block:
```ts
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
```
with:
```ts
describe('shows.json', () => {
  it('every show has required fields, a valid ISO date, and a unique id', () => {
    const ids = new Set<string>();
    for (const s of shows as any[]) {
      expect(s.id).toBeTruthy();
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      expect(() => new Date(s.dateISO).toISOString()).not.toThrow();
      expect(s.venueHe).toBeTruthy();
      expect(s.venueEn).toBeTruthy();
      expect(s.cityHe).toBeTruthy();
      expect(s.cityEn).toBeTruthy();
      expect(['past', 'upcoming']).toContain(s.status);
      // posterImage/ticketUrl may legitimately be empty strings (see plan's
      // scope-adjustment note) — only type-check them, don't require truthy.
      expect(typeof s.posterImage).toBe('string');
      expect(typeof s.eventUrl).toBe('string');
      expect(typeof s.ticketUrl).toBe('string');
    }
  });

  it('is sorted newest-first by dateISO', () => {
    const dates = (shows as any[]).map((s) => s.dateISO);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });
});
```
and update the import at the top of the file: replace `import events from './content/events.json';` with `import shows from './content/shows.json';`.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/content.schema.test.ts`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Replace events.json with shows.json (8 real shows researched from Facebook)"
```

---

## Task 2: Create UpcomingShows.astro

**Files:**
- Create: `src/components/UpcomingShows.astro`
- Modify: `src/content/copy.he.json`, `src/content/copy.en.json`

- [ ] **Step 1: Add copy**

In `copy.en.json`, replace the `"events"` key:
```json
"upcomingShows": {
  "heading": "UPCOMING SHOWS",
  "emptyLine": "Next show: TBA.",
  "emptyCta": "Want us at yours?",
  "ticketsCta": "Get Tickets",
  "viewEventCta": "View Event"
},
```
In `copy.he.json`:
```json
"upcomingShows": {
  "heading": "המופעים הבאים",
  "emptyLine": "המופע הבא: יתפרסם בקרוב.",
  "emptyCta": "רוצים אותנו אצלכם?",
  "ticketsCta": "כרטיסים",
  "viewEventCta": "לפרטי האירוע"
},
```

- [ ] **Step 2: Create the component**

```astro
---
interface Show {
  id: string;
  status: 'past' | 'upcoming';
  dateISO: string;
  venueHe: string;
  venueEn: string;
  cityHe: string;
  cityEn: string;
  posterImage: string;
  eventUrl: string;
  ticketUrl: string;
}
interface Props {
  locale: 'he' | 'en';
  heading: string;
  emptyLine: string;
  emptyCta: string;
  ticketsCta: string;
  viewEventCta: string;
  whatsappNumber: string;
  whatsappMessage: string;
  shows: Show[];
}
const {
  locale,
  heading,
  emptyLine,
  emptyCta,
  ticketsCta,
  viewEventCta,
  whatsappNumber,
  whatsappMessage,
  shows,
} = Astro.props;

const upcoming = shows.filter((s) => s.status === 'upcoming');
const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

function formatDate(iso: string, locale: 'he' | 'en') {
  return new Date(iso).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
---

<section id="upcoming-shows" class="upcoming has-grain">
  <h2 class="upcoming__heading">{heading}</h2>

  {upcoming.length === 0 ? (
    <div class="upcoming__empty">
      <p class="upcoming__empty-line">{emptyLine}</p>
      <a class="upcoming__empty-cta" href={whatsappHref} target="_blank" rel="noopener noreferrer">
        {emptyCta}
      </a>
    </div>
  ) : (
    <div class="upcoming__grid">
      {upcoming.map((s) => (
        <div class="upcoming__card">
          {s.posterImage ? (
            <img src={s.posterImage} alt="" loading="lazy" class="upcoming__poster" />
          ) : (
            <div class="upcoming__poster upcoming__poster--fallback" aria-hidden="true">
              <span class="upcoming__fallback-date">{formatDate(s.dateISO, locale)}</span>
            </div>
          )}
          <p class="upcoming__date">{formatDate(s.dateISO, locale)}</p>
          <p class="upcoming__venue">{locale === 'he' ? s.venueHe : s.venueEn}</p>
          <p class="upcoming__city label">{locale === 'he' ? s.cityHe : s.cityEn}</p>
          {s.ticketUrl ? (
            <a class="upcoming__cta" href={s.ticketUrl} target="_blank" rel="noopener noreferrer">
              {ticketsCta}
            </a>
          ) : s.eventUrl ? (
            <a class="upcoming__cta upcoming__cta--secondary" href={s.eventUrl} target="_blank" rel="noopener noreferrer">
              {viewEventCta}
            </a>
          ) : null}
        </div>
      ))}
    </div>
  )}
</section>

<style>
  .upcoming {
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
  }

  .upcoming__heading {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-lg);
    text-align: center;
    margin: 0 0 var(--space-lg);
  }

  .upcoming__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    text-align: center;
  }

  .upcoming__empty-line {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--size-display-md);
    margin: 0;
    opacity: 0.7;
  }

  .upcoming__empty-cta {
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: var(--size-body);
    color: var(--color-black);
    background: var(--color-accent-green);
    padding: var(--space-sm) var(--space-lg);
    text-decoration: none;
  }

  .upcoming__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--space-lg);
    max-width: 72rem;
    margin-inline: auto;
  }

  .upcoming__card {
    display: flex;
    flex-direction: column;
  }

  .upcoming__poster {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
    background: var(--color-charcoal);
  }

  .upcoming__poster--fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, var(--color-charcoal) 0%, var(--color-black) 100%);
  }

  .upcoming__fallback-date {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-md);
    color: var(--color-accent-green);
  }

  .upcoming__date {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: var(--space-sm) 0 0;
    opacity: 0.7;
  }

  .upcoming__venue {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--size-display-md);
    margin: var(--space-xs) 0 0;
  }

  .upcoming__city {
    margin: var(--space-xs) 0 0;
    opacity: 0.6;
  }

  .upcoming__cta {
    margin-top: var(--space-sm);
    align-self: flex-start;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: var(--size-label);
    color: var(--color-black);
    background: var(--color-accent-green);
    padding: var(--space-xs) var(--space-md);
    text-decoration: none;
  }

  .upcoming__cta--secondary {
    color: var(--color-off-white);
    background: transparent;
    border: 1px solid var(--color-off-white);
  }
</style>
```

- [ ] **Step 3: Wire into both pages, replacing Events**

In both `src/pages/he/index.astro` and `src/pages/en/index.astro`, replace:
```astro
import Events from '../../components/Events.astro';
import type { ShowEvent } from '../../components/Events.astro';
...
import eventsData from '../../content/events.json';

const events = eventsData as ShowEvent[];
```
with:
```astro
import UpcomingShows from '../../components/UpcomingShows.astro';
...
import showsData from '../../content/shows.json';
import type { Show } from '../../components/UpcomingShows.astro';

const shows = showsData as Show[];
```
(export `Show` as a named interface from `UpcomingShows.astro` — add `export` to its `interface Show` declaration.)

Replace the `<Events .../>` call site with:
```astro
    <UpcomingShows
      locale="he"
      heading={copy.upcomingShows.heading}
      emptyLine={copy.upcomingShows.emptyLine}
      emptyCta={copy.upcomingShows.emptyCta}
      ticketsCta={copy.upcomingShows.ticketsCta}
      viewEventCta={copy.upcomingShows.viewEventCta}
      whatsappNumber={copy.contact.whatsappNumber}
      whatsappMessage={copy.contact.whatsappMessage}
      shows={shows}
    />
```
(`locale="en"` in the English page. `PastShows`, Task 3, is inserted right after this in the same edit pass — do both components' wiring together rather than building then re-editing the pages twice.)

- [ ] **Step 4: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass. Since `shows.json` has zero `upcoming` entries, the empty state is what's actually rendered — this is expected, verify it in Task 4, not by assuming the populated-state code path is correct from reading it alone.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add UpcomingShows: real data, honest empty state with WhatsApp CTA"
```

---

## Task 3: Create PastShows.astro

**Files:**
- Create: `src/components/PastShows.astro`
- Modify: `src/content/copy.he.json`, `src/content/copy.en.json`
- Modify: `src/pages/he/index.astro`, `src/pages/en/index.astro`

- [ ] **Step 1: Add copy**

In `copy.en.json`, add after `upcomingShows`:
```json
"pastShows": {
  "heading": "PAST SHOWS",
  "viewEventCta": "View Event"
},
```
In `copy.he.json`:
```json
"pastShows": {
  "heading": "מופעים קודמים",
  "viewEventCta": "לפרטי האירוע"
},
```

- [ ] **Step 2: Create the component**

```astro
---
import type { Show } from './UpcomingShows.astro';

interface Props {
  locale: 'he' | 'en';
  heading: string;
  viewEventCta: string;
  shows: Show[];
}
const { locale, heading, viewEventCta, shows } = Astro.props;

const past = shows.filter((s) => s.status === 'past');

function formatDate(iso: string, locale: 'he' | 'en') {
  return new Date(iso).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
---

<section id="past-shows" class="past has-grain">
  <h2 class="past__heading">{heading}</h2>

  <div class="past__grid" data-past-grid>
    {past.map((s, i) => (
      <a
        class={`past__card past__card--${i % 3}`}
        href={s.eventUrl || undefined}
        target={s.eventUrl ? '_blank' : undefined}
        rel={s.eventUrl ? 'noopener noreferrer' : undefined}
        aria-label={`${locale === 'he' ? s.venueHe : s.venueEn} — ${formatDate(s.dateISO, locale)}${s.eventUrl ? ` — ${viewEventCta}` : ''}`}
        data-past-card
      >
        {s.posterImage ? (
          <img src={s.posterImage} alt="" loading="lazy" class="past__poster" />
        ) : (
          <div class="past__poster past__poster--fallback" aria-hidden="true">
            <span class="past__fallback-venue">{locale === 'he' ? s.venueHe : s.venueEn}</span>
          </div>
        )}
        <div class="past__caption">
          <span class="past__date label">{formatDate(s.dateISO, locale)}</span>
          <span class="past__venue">{locale === 'he' ? s.venueHe : s.venueEn}</span>
        </div>
      </a>
    ))}
  </div>
</section>

<noscript>
  <style is:global>
    #past-shows .past__card {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>

<style>
  .past {
    background: var(--color-black);
    padding: var(--space-xl) var(--space-md);
  }

  .past__heading {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-md);
    text-align: center;
    margin: 0 0 var(--space-lg);
    opacity: 0.85;
  }

  .past__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--space-sm);
    max-width: 72rem;
    margin-inline: auto;
  }

  .past__card {
    position: relative;
    display: block;
    color: inherit;
    text-decoration: none;
    opacity: 0;
    transform: translateY(16px);
  }

  @media (prefers-reduced-motion: reduce) {
    .past__card {
      opacity: 1;
      transform: none;
    }
  }

  .past__poster {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
    filter: grayscale(0.6);
    transition: filter 0.3s ease;
  }

  .past__card:hover .past__poster,
  .past__card:focus-visible .past__poster {
    filter: grayscale(0);
  }

  .past__poster--fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm);
    text-align: center;
    background: var(--color-charcoal);
  }

  .past__card--0 .past__poster--fallback { background: color-mix(in srgb, var(--color-accent-green) 15%, var(--color-charcoal)); }
  .past__card--1 .past__poster--fallback { background: color-mix(in srgb, var(--color-accent-purple) 15%, var(--color-charcoal)); }
  .past__card--2 .past__poster--fallback { background: color-mix(in srgb, var(--color-accent-red) 15%, var(--color-charcoal)); }

  .past__fallback-venue {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--size-body);
  }

  .past__caption {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: var(--space-xs);
  }

  .past__venue {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--size-body);
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../scripts/reduced-motion';

  gsap.registerPlugin(ScrollTrigger);

  const cards = gsap.utils.toArray('[data-past-card]') as HTMLElement[];

  if (!prefersReducedMotion()) {
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '[data-past-grid]',
        start: 'top 85%',
      },
    });

    if ('fonts' in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
</script>
```

Note: `color-mix()` is used for the three rotating fallback-card background tints — this is well-supported in current evergreen browsers (Chrome/Edge/Firefox/Safari all shipped it in 2023); no fallback needed given this project has no stated legacy-browser requirement.

- [ ] **Step 3: Wire into both pages, immediately after UpcomingShows**

Add the import next to `UpcomingShows`'s:
```astro
import PastShows from '../../components/PastShows.astro';
```
Add the call site immediately after `<UpcomingShows ... />`:
```astro
    <PastShows
      locale="he"
      heading={copy.pastShows.heading}
      viewEventCta={copy.pastShows.viewEventCta}
      shows={shows}
    />
```
(`locale="en"` in the English page.)

- [ ] **Step 4: Delete the old Events.astro**

```bash
git rm src/components/Events.astro
```

- [ ] **Step 5: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass. Grep `dist/he/index.html` for `past__card` to confirm 8 cards rendered, and confirm none of them have a broken `<img src="">` — every card should show either a real `<img>` (none will, since all 8 `posterImage` values are empty right now) or the `.past__poster--fallback` div.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add PastShows: 8-card archive grid with typographic fallback for missing posters"
```

---

## Task 4: Visual verification

**Files:** none (verification only)

- [ ] **Step 1: Full walkthrough, both locales**

Start the dev server, open `/he/` and `/en/`, scroll to the new Upcoming Shows section and confirm:
- It renders the empty state (confirmed zero upcoming shows), with a clear "next show TBA" line and a working WhatsApp CTA (verify the `wa.me` link has the real number and a sensible pre-filled message).
- Scrolling further, Past Shows renders 8 cards in a grid, newest-first (The Zone 8 Aug first, Tassa 19 Feb 2025 last), each showing the typographic fallback (venue name on a tinted background) since no posters are available yet, with date + venue captions beneath each card.
- Clicking a past show card opens its real Facebook event URL in a new tab.

- [ ] **Step 2: Check reduced-motion and no-JS fallbacks**

Confirm `PastShows` cards are fully visible under `prefers-reduced-motion: reduce` and via the `<noscript>` fallback.

- [ ] **Step 3: Check mobile width (375px)**

Confirm both sections' grids collapse sensibly (the `auto-fill, minmax(...)` grid patterns should naturally go to 1-2 columns at 375px) with no horizontal overflow.

- [ ] **Step 4: Report to the user**

This task's report to the user (not just internal notes) must explicitly state:
- 8 shows shipped, not 12 — Facebook's pagination stalled after 8 despite multiple retries.
- No poster images — Facebook blocks non-browser/unauthenticated image access; the components are ready to display real posters the moment `posterImage` fields are filled in, but none could be extracted as files this session. If the user wants real posters, they can save them manually (screenshot or right-click-save from Facebook) and hand over file paths, same pattern as the BOWIE wordmark logo earlier this session.

No commit for this task — verification checkpoint only.

