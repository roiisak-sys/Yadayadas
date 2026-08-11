# YADAYADAS Content & Structure Refinements — Design Spec

**Source brief:** the user's 8-section "Additional Design & Content Refinements" brief, delivered in full in chat, plus two rounds of clarifying decisions (archive scope, empty-state handling, story typography — recorded in §3 and §4 below).

**Research completed before this spec was written:** the band's Facebook page (`facebook.com/YadayadasIL/events`), accessed via an authenticated admin session, was reviewed in full.
- **Upcoming events: zero.** Only a "Past" tab exists on the Events page — no upcoming events are listed anywhere on Facebook, and Instagram (which has no native events feature) shows nothing suggesting a scheduled date either.
- **Past events: 36**, from 2022-09-02 through 2026-08-08, every one with a real date, venue name, city, and poster thumbnail. Full list captured in chat history for this session; the most recent 12 are used below.

---

## 1. Scope & Phasing

Two phases:
- **Phase A — Section restructuring.** Remove `Sound.astro`, redesign the Bowie story into one short section (merging `WhyStatement.astro`, the current `Story.astro`, and `EditorialQuotes.astro`), add `BandGallery.astro`. No external research dependency — can start immediately.
- **Phase B — Shows.** Replace `events.json`/`Events.astro` with a proper `shows.json` data model and two components, `UpcomingShows.astro` and `PastShows.astro`, populated with the real Facebook research above. Depends on Phase A's flow reorder being in place first (Shows moves to sit after Band Members, not immediately after Hero-adjacent content).

---

## 2. Phase A — Remove Sound, Add Band Gallery

**Remove:** `src/components/Sound.astro` entirely (the video-background + word-cloud "ROCKER/SAXOPHONE/VIOLIN/BALLAD" treatment). Delete the component, its `copy.*.json` `sound` key, and its two call sites. The `under-pressure.mp4` asset it referenced was already 404ing in dev (a pre-existing gap from earlier this session, never actually finished) — removing this component also quietly retires that.

**Add:** `src/components/BandGallery.astro`, a compact, asymmetric photo section using **real, already-available band photography** — not the same crops already used in the Band Members grid (avoiding visual repetition back-to-back), but a distinct, more candid/live set:

| Source | Role in gallery |
|---|---|
| `C:\Users\roiis\OneDrive\Pictures\band images\ebbbddb8-a363-4189-a243-c9de0d54d7c9.jpg` — full band on stage, blue/yellow stage light, crowd silhouettes in foreground | Dominant image (largest cell) |
| `public/assets/hero/hero-band-live.jpg` (already in the repo, used in Hero) | Supporting image — different crop/aspect than its Hero usage so it doesn't read as a duplicate |
| 3–4 of the existing individual member photos in `public/assets/band/*.jpg`, **re-cropped tighter/differently** than their Band Members section usage (e.g. closer crop on the performance moment, not the same full-frame version) | Supporting images |

Layout: asymmetric grid, one dominant cell + 3-4 smaller supporting cells, slight overlap/offset (not a uniform photo wall), matching the visual language already established for `BowieCollage`'s grid (reuse that pattern's CSS approach — mixed `grid-column`/`grid-row` spans, asymmetric mobile stacking) but in full color (this is the band's own world, not Bowie's monochrome-referenced one, per the site's established color-system rule). Subtle hover: slight scale/brightness lift on desktop, matching the restrained motion language used elsewhere (no gimmicks). Section stays compact — one screen height or less on desktop, not a scrolling wall.

**Position:** between the new short Bowie Story section (§3) and Band Members, per the brief's flow (§8). The existing "then the music starts" transition beat (currently the first thing inside `MusicStartsAndBand.astro`) moves to sit immediately before `BandGallery` instead of immediately before the Band Members grid — it now reads as the pivot from "the idea" to "the band," which is where it belongs in the new flow.

---

## 3. Phase A — Redesign the Bowie Story into one short section

**Remove/merge three existing pieces into one new component**, `src/components/BowieStory.astro`:
- `WhyStatement.astro` (added last redesign round — the "reinvention" editorial statement)
- `Story.astro` (the long Thin White Duke/Berlin narrative — the "too long, too biographical" piece the brief is specifically asking to cut)
- `EditorialQuotes.astro` (the "Who am I now?" Bowie quote)

These three were doing overlapping work (all three are "editorial interlude about who Bowie was/what he means") and the brief is explicit: replace the long narrative with one short poetic statement, not three separate beats making a similar point at different lengths.

**Copy** (new `bowieStory` object, replacing `why`, `story`, and `quotes` in both copy files) — confirmed direction: stay within the existing type system (Assistant, lighter weight/italic treatment), no new font dependency; user explicitly chose this over adding a handwriting web font, since Hebrew handwriting fonts are weak/nonexistent and a font that only works in one language would break parity.

Draft copy (50–70 words per the brief's cap; implementer may refine wording slightly but must stay in this range and register — no marketing language):

- EN: *"Bowie was never just music. Never just the characters he built and discarded. He kept crossing lines — between sound, image, identity — and became something new each time. Our show doesn't retell his biography. It follows that same instinct: through the music, the characters, the reinvention, again and again."* (~55 words)
- HE: *"בואי מעולם לא היה רק מוזיקה. לא רק הדמויות שהוא בנה ונטש. הוא כל הזמן חצה גבולות — בין צליל, דימוי וזהות — והפך למשהו חדש בכל פעם מחדש. המופע שלנו לא מספר את הביוגרפיה שלו. הוא עוקב אחרי אותו אינסטינקט: דרך המוזיקה, הדמויות, ההמצאה מחדש, שוב ושוב."* (~50 words)

Close the section with the existing Bowie quote (from `EditorialQuotes`) as a short, smaller pull-quote beneath the paragraph — pairing the site's own words with Bowie's own words is a better close than either alone, and preserves that quote rather than deleting it outright.

**Visual direction:**
- Small typography relative to the rest of the site — `--size-body` to `--size-display-md` range, not `--size-display-lg`/`xl` like other section headings. This section should NOT look like a heading-led content block.
- `font-style: italic`, lighter weight (400, not the 600-800 used everywhere else), on `Assistant`.
- Generous negative space: tall `padding-block`, narrow `max-width` (similar to `WhyStatement`'s current `44rem`, maybe tighter — `36rem`), centered.
- The pull-quote at the bottom: smaller still, `--size-label`-ish scale, in the mono label style already used for quotes/labels elsewhere, clearly visually subordinate to the main paragraph.
- Reveal: single fade/rise on scroll for the paragraph, a second smaller fade for the pull-quote — simpler motion than the multi-line stagger `WhyStatement` used, since this is now one compact paragraph, not four sequential lines.

**Position:** immediately after `BowieCollage`, before the "then the music starts" transition / `BandGallery`. This directly replaces where `WhyStatement` currently sits, and removes `Story.astro` + `EditorialQuotes.astro` from their current later position in the flow (after `Sound`, which is also being removed).

---

## 4. Phase B — Shows data model

**New file:** `src/content/shows.json`, replacing `src/content/events.json`. Schema per the brief's §6, adapted to this codebase's bilingual convention (matching how `band-members.json`/`events.json` already do `He`/`En` suffixes rather than nested locale objects):

```json
{
  "id": "the-zone-2026-08-08",
  "status": "upcoming | past",
  "dateISO": "2026-08-08",
  "venueHe": "האיזור",
  "venueEn": "The Zone",
  "cityHe": "תל אביב - יפו",
  "cityEn": "Tel Aviv",
  "eventNameHe": "YADAYADAS | David Bowie Tribute | \"האיזור\" תל אביב",
  "eventNameEn": "",
  "posterImage": "/assets/shows/the-zone-2026-08-08.jpg",
  "eventUrl": "https://www.facebook.com/events/1057673123384226/",
  "ticketUrl": ""
}
```

Notes on fields, given the research findings:
- `eventNameEn` is often empty — most of this band's event titles on Facebook are Hebrew-only or mixed. Leave it empty rather than translating/inventing an English title; components fall back to the venue name when it's empty.
- `posterImage`: downloaded from the Facebook event's cover photo during implementation (Phase B Task 1), processed through the same `sharp` pipeline as every other image asset this session, saved to `public/assets/shows/`.
- `ticketUrl`: empty for every entry right now — none of the 36 researched events had a discoverable ticket-purchase link (this band appears to run door-entry/guest-list shows, not ticketed ones, based on what's visible on the event pages). The `UpcomingShows` component must not show a "Get Tickets" button when `ticketUrl` is empty — same "don't render a dead CTA" rule already established for the social icons in `FinalScene`. If/when a real ticketed show exists, filling in `ticketUrl` is a one-line data change, no component change needed.
- `eventUrl` is present for all 12 shows in scope (Facebook event permalinks) — used for the "View event" link on Past Shows cards, and (as a fallback) on Upcoming Shows cards too if no ticket link exists.

**Data for Phase B, confirmed scope (most recent 12 of the 36 found, per user's choice):**

| # | Date | Venue | City | Facebook event URL |
|---|---|---|---|---|
| 1 | 2026-08-08 | The Zone (האיזור) | Tel Aviv-Jaffa | `facebook.com/events/1057673123384226/` |
| 2 | 2026-07-24 | Bella Ciao (בלה צ'או) | Rishon LeZion | `facebook.com/events/1325279466384272/` |
| 3 | 2026-02-14 | Babity Pub | Kfar Saba | `facebook.com/events/1211094990996739/` |
| 4 | 2025-12-13 | Bar Giyora (בר גיורא) | Tel Aviv-Jaffa | `facebook.com/events/694054259991399/` |
| 5 | 2025-10-08 | בית המרזח | Ramat Yishai | *to be collected in Phase B Task 1* |
| 6 | 2025-09-11 | קיבוץ משמרות | Mishmarot | *to be collected* |
| 7 | 2025-09-02 | The Hobbit (ההוביט) | Zichron Yaakov | *to be collected* |
| 8 | 2025-02-19 | Tassa | Tel Aviv-Jaffa | *to be collected* |
| 9 | 2024-11-23 | בית המרזח | Ramat Yishai | *to be collected* |
| 10 | 2024-11-19 | באBE | Hod HaSharon | *to be collected* |
| 11 | 2024-11-14 | Bella Ciao bar | Rishon LeZion | *to be collected* |
| 12 | 2024-08-28 | בירה שבט (Shevet Beer) | Pardes Hana-Karkur | *to be collected* |

Rows 1-4 already have confirmed Facebook event URLs (captured during this session's research). Rows 5-12's event URLs and every row's poster image still need to be collected — this is mechanical data-gathering, not a design decision, so it's a plan task (Phase B Task 1: "Collect remaining show data + posters"), not something blocking this spec's approval. **If any of rows 5-12 turn out to be unreachable or ambiguous when the implementer revisits Facebook, drop that row rather than guessing at its poster/URL** — a shorter accurate archive beats a padded inaccurate one.

**No entries currently have `status: "upcoming"`** — confirmed zero upcoming shows exist. `shows.json` ships with 12 `status: "past"` entries and zero `upcoming` ones.

---

## 5. Phase B — Upcoming Shows

**New component:** `src/components/UpcomingShows.astro`, replacing `Events.astro`. Visual language: **NOW / NEXT / prominent / action-oriented**, per the brief's §7.

- Filters `shows.json` for `status === "upcoming"`.
- **Populated state** (for whenever a real upcoming show exists): square poster image as the dominant visual element, date large and prominent (bigger than the current `Events.astro` treatment), venue clearly displayed, ticket CTA — "Get Tickets"/"כרטיסים" — shown only when `ticketUrl` is non-empty; otherwise a "View Event" link using `eventUrl` if that's non-empty, otherwise no link at all (just the info).
- **Empty state** (the actual state this ships in, confirmed by the user): not a bare "more dates coming soon" label. Per the user's choice, this becomes a confident, booking-oriented moment — a short line (e.g. "Next show: TBA" / "המופע הבא: יתפרסם בקרוב") paired with the same WhatsApp CTA pattern already built into `FinalScene` ("Want us at yours?" / "רוצים אותנו אצלכם?" → the existing `wa.me` deep link, reusing `copy.contact.whatsappNumber`/`whatsappMessage`). This turns the gap into a second booking touchpoint rather than a dead end, and keeps the section worth including in the flow rather than hiding it.
- Section stays in the page flow (not hidden), per the user's explicit choice.

---

## 6. Phase B — Past Shows

**New component:** `src/components/PastShows.astro`. Visual language: **archive / memory / editorial**, per the brief's §7 — more image-heavy, less text-heavy than Upcoming Shows, visually related but clearly secondary in energy.

- Filters `shows.json` for `status === "past"`, sorted newest-first (already the natural order of the table in §4).
- Masonry/grid of square-ish poster cards, newest-first. Each card: poster image (dominant), date, venue — no event-name text clutter on the card face (the brief explicitly wants "POSTER / DATE / VENUE," not a repeat of the full Facebook event title). Clicking a card (or a subtle "View event" affordance on it) opens the Facebook `eventUrl` in a new tab.
- Grid: reuse the asymmetric-grid CSS pattern already established in `BowieCollage`/`BandGallery` (mixed spans, no naive uniform grid, distinct mobile stacking) — visual continuity across the site's several grid sections, not a fourth different grid system.
- No ticket CTA anywhere in this section — these are done, no action attached, matching the brief's "archive, not calendar" framing.

---

## 7. New page flow (both locale index pages)

Per the brief's §8, and consolidating Phase A + Phase B:

1. `Hero`
2. `BowieCollage`
3. `BowieStory` (new, replaces `WhyStatement` + `Story` + `EditorialQuotes`)
4. "Then the music starts" transition (moved, still lives inside `MusicStartsAndBand.astro` as its lead-in)
5. `BandGallery` (new)
6. `MusicStartsAndBand`'s Band Members grid (unchanged from current build)
7. `UpcomingShows` (new, replaces `Events`)
8. `PastShows` (new)
9. `FinalScene` (Contact/Booking — unchanged)

`Sound.astro` is removed entirely and does not appear anywhere in the new flow.

---

## 8. Open items / risks

1. **8 of 12 Past Shows rows need their Facebook event URL + poster collected during implementation** (§4) — not a blocker for approving this spec, but real work with a real chance some rows get dropped if a specific event page turns out to be unreachable/ambiguous. The archive may end up being 9-12 entries rather than exactly 12.
2. **No ticket links exist anywhere in the researched data.** Every `ticketUrl` ships empty. This isn't a placeholder to fill in later the way the WhatsApp number was — it may simply reflect how this band actually runs its shows (door/guest-list, not pre-sold tickets). Worth a quick confirmation from the user if that's ever wrong, but nothing in this spec depends on inventing one.
3. **Photo re-cropping for `BandGallery`** (§2) — using the same source files as `Band Members` but different crops is a reasonable design call to avoid repetition, but if it ends up looking too similar in practice, the fallback is sourcing fresh photos from the Facebook Photos tab (browsed briefly during research; has additional candid/backstage material not yet processed).
