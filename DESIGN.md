---
name: Wagle Universal Solutions
description: A live foundry specimen sheet for the company's own name — one variable-font axis hardens from draft to production.
colors:
  paper: "#f5f2ea"
  paper-raised: "#ede7d6"
  paper-deep: "#e7dfc9"
  ink: "#18140f"
  ink-soft: "#4a4235"
  muted: "#6f6656"
  line: "#d9d0b8"
  line-strong: "#b9ac8a"
  accent: "#e1461f"
  accent-ink: "#a92e0f"
  accent-paper: "#fbe4d8"
  white: "#ffffff"
  success: "#3f7a52"
  error: "#b23414"
typography:
  display:
    fontFamily: "Recursive, -apple-system, sans-serif"
    fontSize: "clamp(2.6rem, 9.4vw, 8.5rem)"
    fontWeight: 300
    lineHeight: 0.96
    letterSpacing: "-0.015em"
    fontVariation: "'wght' var(--axis-wght, 300), 'CASL' var(--axis-casl, 1)"
  headline:
    fontFamily: "Recursive, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Recursive, -apple-system, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 600
    lineHeight: 1.05
  body:
    fontFamily: "Recursive, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Space Mono', 'JetBrains Mono', 'Fira Code', monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.08em"
rounded:
  sm: "2px"
  md: "3px"
  lg: "4px"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
  3xl: "4rem"
  4xl: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.9rem 1.6rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.9rem 1.6rem"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
---

# Design System: Wagle Universal Solutions

## Overview

**Creative North Star: "The Foundry Specimen Sheet"**

This site presents itself as a live type-foundry specimen for the company's own name: the wordmark is the demonstration, and the demonstration is the pitch. Instead of the soft-gradient dark-SaaS hero this category defaults to, the hero exposes a single variable-font axis (drag from "Draft" to "Production") that visibly hardens the headline in real time, on a warm specimen-paper canvas with hairline baseline rules. Everything downstream — spec-sheet plate cards, mono-labeled tags, registration crop marks — reads as annotation on a drawing, not as decoration on a product page. The rejected reference is the generic dark-mode SaaS hero (gradient orbs, glow text); this build explicitly strips those out (`.hero-bg, .hero-gradient-orb, .hero-grid-lines, .gradient-text, .cta-glow { display: none !important; }`).

Density is calm and print-like: generous section padding (`--space-4xl` = 6rem), a 44px baseline grid behind body copy, and a single accent color spent sparingly (CTAs, the axis slider, numerals, hover states) so its rarity keeps meaning. The palette is warm and paper-bound rather than cool-tech; the type system does the work a second typeface usually would, because the one thing this company sells — precision, shipped — is the axis control itself.

The display face changed from Fraunces to **Recursive** after Fraunces was flagged as an overused choice; Recursive was chosen specifically because it preserves the live axis-drag mechanism and maps even more directly onto the site's own thesis — its `CASL` (casual↔formal) axis is read literally as "draft sketch to shipped product," alongside `wght` 300–1000.

**Key Characteristics:**
- One variable typeface (Recursive) spans the entire display-to-body hierarchy; Space Mono is the only second face, reserved for coordinates/labels/tags.
- Warm ink on specimen paper, one committed vermillion accent; no secondary or tertiary hue.
- Flat surfaces with hairline borders and a 44px baseline grid; no soft drop shadows.
- Sharp, near-square corners (2–4px) everywhere — cards, buttons, badges, inputs.
- Interactive font-axis drag as the signature mechanism, not a one-off hero gimmick — the axis slider drives `wght` and `CASL` together on the hero headline live via `specimen.js`.
- Section headings stand alone with no kicker/eyebrow label above them (`.section-label { display: none; }` in the shipped stylesheet) — the specimen-sheet metaphor is carried by the baseline grid and plate cards, not by numbered labels.

## Colors

Warm, low-saturation "specimen paper" neutrals carry the page; a single vermillion is the entire accent system.

### Primary
- **Vermillion** (`#e1461f`, accent): the one committed accent — primary CTA, the axis-slider thumb/track fill, active nav underline, hover states on links/cards/tags, the accent-word span inside the specimen headline.
- **Vermillion Ink** (`#a92e0f`, accent-ink): pressed/hover-darkened state for the accent (button hover; link-hover text; the live axis-readout digits; tag/icon hover).
- **Vermillion Paper** (`#fbe4d8`, accent-paper): defined as a token but not spent on a shipped surface — reserved tint, not a confirmed system color yet.

### Neutral
- **Specimen Paper** (`#f5f2ea`, paper): page background.
- **Paper Raised** (`#ede7d6`, paper-raised): alternating section background (`.section-alt`), mobile nav-drawer background.
- **Paper Deep** (`#e7dfc9`, paper-deep): placeholder/plate background inside project-card images.
- **Warm Ink** (`#18140f`, ink): primary text, headline color, dark CTA-section background, nav-CTA background.
- **Ink Soft** (`#4a4235`, ink-soft): body copy, descriptions, subtitles.
- **Muted** (`#6f6656`, muted): labels, captions, footer meta text.
- **Line** (`#d9d0b8`, line): default hairline borders, baseline-grid rule, dividers.
- **Line Strong** (`#b9ac8a`, line-strong): stronger borders — badges, inputs, tags, axis-control frame, contact-icon frames.

### Named Rules
**The One Accent Rule.** Vermillion is the only saturated color in the system. It marks exactly one thing per view: the CTA, the live axis value, or the active state. Everything else is warm neutral ink-on-paper.

**The No-Drop-Shadow Rule.** Depth is conveyed by hairline borders and 1–2px offset flat shadows (`--shadow-sm`, `--shadow-md`), never a soft blurred drop shadow, except the single ambient `--shadow-lg` reserved for the axis-slider thumb ring. A specimen sheet has ink lines, not glow.

## Typography

**Display Font:** Recursive (variable, `wght` 300–1000, `CASL` 0–1; with `-apple-system, sans-serif` fallback)
**Body Font:** Recursive (same family — no separate body face)
**Label/Mono Font:** Space Mono (with JetBrains Mono, Fira Code fallback)

**Character:** One variable sans-serif carries every register from a live-axis 8.5rem hero specimen down to running body copy, using its registered `wght` and `CASL` axes to do the work a type pairing normally would. The `CASL` axis (casual→formal) is read as "draft sketch" (CASL 1) hardening to "shipped product" (CASL 0) as the hero slider moves toward Production. Space Mono is the only second voice, reserved for machine-readable-feeling labels: nav links, tags, badges, form labels, the axis readout.

### Hierarchy
- **Display** (var `wght`/`CASL`, driven live by the axis slider — default `wght` 300 / `CASL` 1.00; `clamp(2.6rem, 9.4vw, 8.5rem)`; line-height 0.96): the hero specimen headline only, the one place the axis is user-controlled.
- **Headline** (h2, 600, `clamp(2rem, 4.5vw, 3.25rem)`, line-height 1.05): section titles.
- **Title** (h3, 600, 1.3rem): card and plate titles.
- **Body** (400, 1rem, line-height 1.6, color ink-soft): paragraph copy; legal-content intro copy runs slightly larger at 1.05rem.
- **Label** (Space Mono, 400/700, 0.66–0.78rem, letter-spacing 0.08em, uppercase): nav links, buttons, tags/badges, form labels, breadcrumbs, footer headings.

### Named Rules
**The One-Face Specimen Rule.** Recursive is the entire type system — display and body both — because the product being sold is precision made visible, and a specimen that only demonstrates its axes in the hero would be decoration, not proof. This is a deliberate structural choice tied to the site's own thesis, not a placeholder waiting for a pairing.

**The Mono-Annotates Rule.** Space Mono never carries headline or body content. It only labels, tags, or annotates — the way a spec sheet annotates a drawing.

**The No-Kicker Rule.** Section headings never carry a label, eyebrow, or "Plate NN" prefix above them. `.section-label` is set to `display: none` in the shipped stylesheet; headings stand alone. Where a section's only heading was previously a kicker-style label (contact page: "Send a message," "Other ways to reach us"), it now ships as a real `<h2>`, not as decorative annotation.

## Layout

Container max-width is 1200px (`--max-width`, legal/narrow content uses 800px `--max-width-sm`), centered with side padding that steps down from `--space-xl` (2rem) to `--space-lg` (1.5rem) under 640px. Sections use generous vertical rhythm (`--space-4xl` = 6rem top/bottom); alternating sections (`.section-alt`) get a raised-paper background bounded by hairline top/bottom rules to break the page into visible "plates." A 44px horizontal baseline grid (`background-image: linear-gradient(var(--line) 1px, transparent 1px); background-size: 100% 44px`) runs behind the entire body starting below the fixed nav, reinforcing the specimen-sheet metaphor even where no rule element is drawn. Card grids default to 3 columns (`.grid-3`), collapsing to 1 column under 900px; a 2-column variant is used for the about-teaser (fixed 340px photo column) and contact-layout (1.3fr/1fr), both collapsing to 1 column under 860–900px.

## Elevation & Depth

Flat by design: "a specimen sheet has no drop shadows, only ink" (source comment, design-system.css). Depth reads through hairline borders and small vertical lift-on-hover (`translateY(-3px)` on cards/project-cards, `translateY(-1px)` on primary buttons) paired with a border-color shift to accent, not through shadow growth. The only true shadows in the system are near-flat 1–2px offset lines (`--shadow-sm`, `--shadow-md`) and one soft ambient shadow reserved for the axis-slider thumb ring (`--shadow-lg: 0 4px 24px rgba(24,20,15,0.12)`); `--shadow-glow` is explicitly set to `none`.

### Shadow Vocabulary
- **Hairline Shadow** (`box-shadow: 0 1px 0 rgba(24,20,15,0.08)` / `0 2px 0 rgba(24,20,15,0.08)`): reserved token vocabulary, not yet spent on a visible surface — kept for future flat-ink elevation if needed.
- **Ambient Ring** (`box-shadow: 0 4px 24px rgba(24,20,15,0.12)`): the one soft shadow in the system, present only as a token; the axis-slider thumb instead uses a solid `box-shadow: 0 0 0 1px var(--accent)` ring, not this token.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit flat with a hairline border at rest. The only depth response to interaction is a border-color shift to accent plus a small upward translate — never a shadow bloom.

## Shapes

Corners are sharp and near-square throughout — 2px (`--radius-sm`: buttons, tags, badges, inputs, nav-CTA) up to 3–4px (`--radius-md`/`--radius-lg`: cards, project-card plates, axis-control panel, photo frames). The one full-round exception is the scroll-to-top button and the hero-badge pill (`--radius-full`), plus small circular UI (axis-slider thumb, pulse dot, footer social icons at 50%). Borders are consistently 1px hairlines in `line` or `line-strong`; there is no heavy stroke weight anywhere in the system. Recurring plate geometry — `+` registration marks in project-card image corners, crop-mark hairline crosses, mono coordinate labels — signals the "specimen sheet"/print-proof world without ever using a decorative icon glyph to do it.

## Components

### Buttons
- **Shape:** near-square corners (2px, `--radius-sm`), 1px solid border always present even on the filled primary.
- **Primary:** vermillion fill (`#e1461f`), white text, mono label styling (uppercase, 0.78rem, letter-spacing 0.08em), padding `0.9rem 1.6rem` (`btn-lg`: `1.1rem 2rem`). The single site-wide primary CTA ("Start a Project →") lives inside the hero's axis-control card, in an `.axis-control-footer` flex row aligned to the right under the slider's "Production" end — it is not a standalone button pair below the card.
- **Secondary:** transparent fill, ink border and text; inverts to solid ink background with paper text on hover. Used for the hero's "View Our Work" action, paired inline with a plain mono proof line (`.hero-stats-line`: "3+ Projects Delivered · 3 Countries Served · 12 Free Dev Tools") rather than a 3-up stat-card row.
- **Hover/Focus:** primary darkens to accent-ink and lifts 1px; secondary inverts to solid ink; both transition over 0.15s with the system's single custom ease (`cubic-bezier(0.22, 1, 0.36, 1)`).

### Chips / Tags
- **Style:** mono uppercase text (0.66rem), 1px `line-strong` border, `--radius-sm` corners, ink-soft text color, no fill — used for tech badges and project tags.
- **State:** static only; no selected/filter variant exists in the shipped system.

### Cards / Containers
- **Corner Style:** `--radius-md` (3px).
- **Background:** white, against the paper/paper-raised section background — the one place pure white appears as a surface color.
- **Shadow Strategy:** none at rest; border shifts to accent and card lifts 3px on hover (see Elevation & Depth).
- **Border:** 1px `line`, becoming accent on hover.
- **Internal Padding:** `--space-xl` (2rem); project-card body uses `--space-lg` top, `--space-xl` sides/bottom.
- Service cards carry no decorative numeral badge — the earlier 01/02/03 `.card-icon` markup was removed from the three homepage service cards; they now open directly with a title and description.

### Inputs / Fields
- **Style:** white background, 1px `line-strong` border, `--radius-sm` corners, Recursive body-weight text, mono uppercase labels above each field.
- **Focus:** border shifts to accent plus a soft accent-tinted ring (`box-shadow: 0 0 0 3px rgba(225,70,31,0.18)`) — the one deliberate soft-glow moment in an otherwise flat system, reserved for form focus state only.
- **Error / Disabled:** inline success/error banners use tinted backgrounds (`success`/`error` at low opacity) with a matching 1px border; no disabled-state styling is shipped.

### Navigation
- Fixed, translucent-paper nav (`rgba(245,242,234,0.85)` + `backdrop-filter: blur(10px)`), transparent border until scrolled, then a hairline `line` bottom border. Links are mono, uppercase, letter-spaced; the active/hover state is an ink color shift plus a vermillion underline that wipes in from the left. The CTA link is a solid ink pill that inverts to vermillion on hover. Mobile collapses to a slide-in paper drawer from the right, bounded by a hairline left border.
- The nav logo is the single full WUSPL lockup image only (`Universal-03.png` on the home page, `Universal-01.png` elsewhere) — used uncropped everywhere, including on the 12 tool pages. No text-next-to-logo wordmark treatment ships anywhere in the system.

### Contact / Info Card
- Small bordered plate (`--radius-md`, 1px `line`) with a fixed square icon frame (38px, `--radius-sm`, `line-strong` border) at left. The icon frame holds either a two-letter mono monogram or, for the email row, a real Bootstrap Icon (`bi-envelope`) — never a unicode glyph rendered as a pseudo-icon.

### Specimen Axis Control (signature component)
The hero's defining mechanism: a bordered white panel containing a native range input styled as a bare 2px track with a solid-vermillion circular thumb (ringed, not shadowed), flanked by mono "Draft"/"Production" endpoint labels and a live mono readout (`WGHT 300 · CASL 1.00`) that updates the headline's `font-variation-settings` (`wght` and `CASL` together) in real time via `specimen.js`. An `.axis-control-footer` row beneath the slider pairs a short mono hint with the primary CTA, anchored under the "Production" end. This is the one place typography itself is the interactive UI.

## Do's and Don'ts

### Do:
- **Do** spend the vermillion accent (`#e1461f`) on exactly one focal element per view — a CTA, the live axis value, an active state — never as a background fill for large areas.
- **Do** use Recursive's variable axes (`wght`, `CASL`) as a live design tool wherever precision-made-visible is the point, anchored in the hero slider mechanism.
- **Do** keep corners sharp (2–4px) and borders hairline (1px); this is a specimen-sheet world, not a soft-card world.
- **Do** reserve Space Mono for labels, tags, coordinates, and readouts only — never headlines or body paragraphs.
- **Do** use real semantic icons (Bootstrap Icons, scoped to functional contexts already in the build) rather than unicode glyphs standing in for icons.

### Don't:
- **Don't** introduce soft blurred drop shadows or glow effects outside the two confirmed exceptions (axis-slider thumb ring token, form-focus ring). Depth is borders and lift, not blur.
- **Don't** add a second display typeface. The one-face rule is structural to the concept, not a placeholder waiting for a pairing.
- **Don't** add a kicker/eyebrow label above a section heading. `.section-label` is disabled site-wide; a heading stands alone or, if a section needs one, it ships as a real heading element, not decorative annotation.
- **Don't** build a 3-up "big number, small label" stat-card row. The hero's proof numbers ship as a single plain mono line, not stat cards.
- **Don't** use decorative icon glyphs to signal section identity (numeral badges, sparkle/feature icons, unicode-glyph-as-icon). Bootstrap Icons are shipped, but scoped strictly to functional uses already in the build: social links, scroll-to-top, contact-method markers.
- **Don't** reintroduce gradient-orb or glow-text hero treatments; they're explicitly zeroed out in the stylesheet as the rejected default this world replaces.
