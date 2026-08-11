# Redesign Phase 3 — Contact/Booking + Social + Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve `FinalScene.astro` into the site's closing Contact/Booking beat — "Book YADAYADAS" heading, a primary WhatsApp CTA, and minimal social icons — then do a cross-site motion/mobile polish pass. Full spec: `docs/superpowers/specs/2026-08-11-yadayadas-redesign-design.md` (§8, §9).

**⚠️ Hard blocker, read before starting:** there is no WhatsApp number or social media URL anywhere in this codebase (verified: `grep -rniE "whatsapp|wa\.me|instagram|facebook|youtube|phone|\+972" src/` returns nothing outside prose bios). This plan wires the UI to accept these as data with an obvious, clearly-flagged placeholder value — **do not replace the placeholder with a real-looking number you aren't certain of.** Leave it exactly as written in Task 1 and flag it in your final report every time this plan is executed, until the real value is supplied by the user.

**Tech Stack:** Astro 5, GSAP 3 + ScrollTrigger (existing patterns only), inline SVG icons (no icon library), Vitest.

---

## Task 1: Add contact config with flagged placeholder values

**Files:**
- Modify: `src/content/copy.he.json`
- Modify: `src/content/copy.en.json`

- [ ] **Step 1: Add a `contact` object to both copy files**

In `copy.en.json`, add after `"final"`:
```json
"contact": {
  "heading": "Book YADAYADAS",
  "whatsappCta": "Talk to us on WhatsApp",
  "whatsappNumber": "000000000000",
  "whatsappMessage": "Hi! I'd like to book YADAYADAS for a show.",
  "instagramUrl": "",
  "facebookUrl": "",
  "youtubeUrl": ""
},
```

In `copy.he.json`, add after `"final"`:
```json
"contact": {
  "heading": "דברו איתנו",
  "whatsappCta": "דברו איתנו בוואטסאפ",
  "whatsappNumber": "000000000000",
  "whatsappMessage": "היי! אני רוצה להזמין את YADAYADAS למופע.",
  "instagramUrl": "",
  "facebookUrl": "",
  "youtubeUrl": ""
},
```

`whatsappNumber: "000000000000"` is a deliberately-invalid placeholder (12 zeros — not a real phone number in any format), not a guess at a real one. `instagramUrl`/`facebookUrl`/`youtubeUrl` are empty strings on purpose — Task 2's component must not render a social icon whose URL is empty (see Task 2 Step 2), so an unfilled link never ships as a dead `#` href.

- [ ] **Step 2: Verify key parity test still passes**

Run: `npx vitest run src/content.schema.test.ts`
Expected: passes — both files got the same new keys in Step 1.

- [ ] **Step 3: Commit**

```bash
git add src/content/copy.he.json src/content/copy.en.json
git commit -m "Add contact/booking copy with flagged placeholder WhatsApp number and social URLs"
```

---

## Task 2: Extend FinalScene into the Contact/Booking closing section

**Files:**
- Modify: `src/components/FinalScene.astro`
- Modify: `src/pages/he/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Update Props and replace the CTA**

Replace the frontmatter and the CTA/logo markup:
```astro
---
interface Props {
  line1: string;
  line2: string;
  contactHeading: string;
  whatsappCta: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}
const {
  line1,
  line2,
  contactHeading,
  whatsappCta,
  whatsappNumber,
  whatsappMessage,
  instagramUrl,
  facebookUrl,
  youtubeUrl,
} = Astro.props;

const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
const socialLinks = [
  { url: instagramUrl, label: 'Instagram', icon: 'instagram' },
  { url: facebookUrl, label: 'Facebook', icon: 'facebook' },
  { url: youtubeUrl, label: 'YouTube', icon: 'youtube' },
].filter((s) => s.url);
---

<section id="final-scene" class="final has-grain">
  <p class="final__line1" data-final-line>{line1}</p>
  <p class="final__line2" data-final-line>{line2}</p>

  <h2 class="final__contact-heading" data-final-line>{contactHeading}</h2>
  <a class="final__cta" href={whatsappHref} target="_blank" rel="noopener noreferrer" data-final-cta>
    {whatsappCta}
  </a>

  {socialLinks.length > 0 && (
    <div class="final__social" data-final-line>
      {socialLinks.map((s) => (
        <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} class="final__social-link">
          <SocialIcon name={s.icon} />
        </a>
      ))}
    </div>
  )}

  <img
    src="/assets/logo/yadayadas-logo.png"
    alt="YADAYADAS"
    class="final__logo"
    data-final-line
  />

  <noscript>
    <style is:global>
      #final-scene .final__line1,
      #final-scene .final__line2,
      #final-scene .final__contact-heading,
      #final-scene .final__cta,
      #final-scene .final__social,
      #final-scene .final__logo {
        opacity: 1 !important;
      }
    </style>
  </noscript>
</section>
```

Note the `<SocialIcon>` reference — that's a small helper component created in Step 2. `socialLinks.length > 0` guards the whole block so an all-placeholder state (current) renders no social row at all, rather than three dead links.

- [ ] **Step 2: Create the SocialIcon helper**

**Files:** Create `src/components/SocialIcon.astro`

```astro
---
interface Props {
  name: 'instagram' | 'facebook' | 'youtube';
}
const { name } = Astro.props;

const paths: Record<Props['name'], string> = {
  instagram:
    'M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.55.55.89 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76a4.9 4.9 0 0 1 1.76-1.15c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z',
  facebook:
    'M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7C16.4 3.66 15.4 3.57 14.24 3.57c-2.34 0-3.94 1.43-3.94 4.05V9.9H7.6V13h2.7v8h3.2z',
  youtube:
    'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.5v-7l6.3 3.5-6.3 3.5z',
};
---

<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
  <path d={paths[name]}></path>
</svg>
```

- [ ] **Step 3: Import SocialIcon in FinalScene**

Add to `FinalScene.astro`'s frontmatter, above the `Props` interface:
```astro
import SocialIcon from './SocialIcon.astro';
```

- [ ] **Step 4: Add styles for the new elements**

Add to `FinalScene.astro`'s `<style>` block:
```css
  .final__contact-heading {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--size-display-lg);
    margin: var(--space-xl) 0 0;
    opacity: 0;
  }

  .final__social {
    display: flex;
    gap: var(--space-md);
    margin-top: var(--space-lg);
    opacity: 0;
  }

  .final__social-link {
    color: var(--color-off-white);
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .final__social-link:hover,
  .final__social-link:focus-visible {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .final__social-link {
      transition: none;
    }
  }
```

And add `.final__contact-heading` and `.final__social` to the existing `@media (prefers-reduced-motion: reduce)` opacity-1 block (alongside `.final__line1` etc.).

Change `.final__cta`'s `margin-top` from `var(--space-lg)` to `var(--space-md)` (it now follows directly under the new heading, not the line1/line2 pair) and bump its `font-size` up one notch by adding `font-size: var(--size-body);` (it's now the page's single most important action, not a secondary link).

- [ ] **Step 5: Update the GSAP target list**

The script already does `gsap.utils.toArray('[data-final-line]')` plus explicitly adds `[data-final-cta]`. Since `.final__contact-heading` and `.final__social` both got `data-final-line` in Step 1's markup, they're automatically included — no script changes needed. Verify this is true by reading the final markup before moving on (both new elements must carry `data-final-line`, matching what's written above).

- [ ] **Step 6: Wire the new props at both page call sites**

In `src/pages/he/index.astro` and `src/pages/en/index.astro`, change:
```astro
    <FinalScene line1={copy.final.line1} line2={copy.final.line2} cta={copy.final.cta} />
```
to:
```astro
    <FinalScene
      line1={copy.final.line1}
      line2={copy.final.line2}
      contactHeading={copy.contact.heading}
      whatsappCta={copy.contact.whatsappCta}
      whatsappNumber={copy.contact.whatsappNumber}
      whatsappMessage={copy.contact.whatsappMessage}
      instagramUrl={copy.contact.instagramUrl}
      facebookUrl={copy.contact.facebookUrl}
      youtubeUrl={copy.contact.youtubeUrl}
    />
```

Note `copy.final.cta` is no longer used by `FinalScene` — leave the `final.cta` key in the copy JSON files as-is (removing it isn't necessary and risks an unrelated diff; it's simply unused now).

- [ ] **Step 7: Build and test**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass. Grep the built `dist/he/index.html` for `wa.me/000000000000` to confirm the (placeholder) WhatsApp link is present and well-formed, and confirm no `<a href="">` (empty social link) exists anywhere in the output — the `socialLinks.filter((s) => s.url)` guard in Task 2 Step 1 should have suppressed all three, since all three URLs are still empty placeholders.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Extend FinalScene into Contact/Booking: WhatsApp CTA + social icons (placeholder data)"
```

---

## Task 3: Cross-site motion & mobile polish pass

**Files:** review only, edit as needed — no files are known in advance for this task

- [ ] **Step 1: Full-site mobile sweep**

Start the dev server, resize to 375px, and scroll through every section on `/he/` and `/en/`: Hero, BowieCollage, WhyStatement, Band, Events, FinalScene. For each, confirm:
- No horizontal overflow (`document.documentElement.scrollWidth === document.documentElement.clientWidth` in devtools/JS console).
- Text doesn't overflow its container or get clipped.
- Touch targets (WhatsApp CTA, social icons, ticket CTAs) are comfortably tappable — not smaller than ~44px in any dimension.

If anything fails, fix it with a targeted CSS change in the relevant component and note the fix in the Task 3 commit message (there's no way to enumerate every fix in advance — this step is a real review, not a checklist to rubber-stamp).

- [ ] **Step 2: Full-site reduced-motion sweep**

With `prefers-reduced-motion: reduce` active, confirm every section's content is fully visible with no animation — Hero, BowieCollage, WhyStatement, Band, Events (n/a, no motion there), FinalScene. All of these already have the CSS override in place from their respective builds; this step is verification, not new implementation, unless a gap is found.

- [ ] **Step 3: Grayscale/color system consistency check**

Per spec §2 and §9: Bowie photography reads grayscale/monochrome-leaning (BowieCollage already does this), band/live photography reads in color (Hero, Band-on-hover, FinalScene). Confirm this holds across the site — nothing else currently mixes Bowie and band photography adjacently, so this is mostly a confirmation, not new work.

- [ ] **Step 4: Commit any fixes found**

```bash
git add -A
git commit -m "Polish pass: mobile touch targets, reduced-motion, monochrome/color consistency"
```

If no fixes were needed, skip this commit — don't create an empty one.

---

## Task 4: Visual verification

**Files:** none (verification only)

- [ ] **Step 1: Full walkthrough, both locales**

Confirm the WhatsApp CTA is the visually primary action in FinalScene (larger/more prominent than anything else in that section), and that the social row (if any URLs were filled in by the time this runs) doesn't compete with it in size or placement.

- [ ] **Step 2: Report the placeholder status**

Explicitly state in the final report whether `whatsappNumber`/`instagramUrl`/`facebookUrl`/`youtubeUrl` are still placeholders (they will be, unless the user supplied real values between Phase 2 and now) — this must not be silently forgotten.

No commit for this task — verification checkpoint only.
