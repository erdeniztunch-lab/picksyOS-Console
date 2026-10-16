---
name: PicksyOS Operations Console
description: A calm, plain operations ledger for remote station incidents, built from Delivery One's public palette and type.
colors:
  pilot-light-lime: "#84b926"
  pilot-light-green: "#4a6b22"
  pilot-light-soft: "#eef6df"
  ledger-ink: "#111312"
  ledger-ink-2: "#3d423e"
  ledger-ink-muted: "#5f645f"
  canvas: "#f7f7f6"
  surface: "#ffffff"
  sunken: "#f2f2f2"
  hairline: "#e8eae8"
  control-line: "#8a8f8a"
  p3-line: "#bfc3bf"
  ok: "#3f6e14"
  ok-tint: "#e8f2de"
  warn: "#8a5a06"
  warn-tint: "#fbf1dc"
  err: "#a8321f"
  err-tint: "#f9e4e0"
  info: "#335f7c"
  info-tint: "#e2edf3"
  unknown: "#565b57"
  unknown-tint: "#f2f2f2"
  moved-tint: "#fbf1dc"
typography:
  title:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum' 1"
  body-strong:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  small:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.1em"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  mono-sm:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
components:
  button-primary:
    backgroundColor: "{colors.pilot-light-lime}"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "36px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "36px"
  button-confirm:
    backgroundColor: "{colors.ledger-ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "36px"
  button-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.ledger-ink-muted}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "36px"
  button-touch:
    rounded: "{rounded.pill}"
    height: "44px"
  band-p1:
    backgroundColor: "{colors.ledger-ink}"
    textColor: "{colors.surface}"
    typography: "{typography.mono-sm}"
    rounded: "{rounded.sm}"
    height: "22px"
  band-p2:
    backgroundColor: "transparent"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.mono-sm}"
    rounded: "{rounded.sm}"
    height: "22px"
  band-p3:
    backgroundColor: "transparent"
    textColor: "{colors.ledger-ink-muted}"
    typography: "{typography.mono-sm}"
    rounded: "{rounded.sm}"
    height: "22px"
  status-chip-info:
    backgroundColor: "{colors.info-tint}"
    textColor: "{colors.info}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "22px"
  parcel-label-blocked:
    backgroundColor: "{colors.err-tint}"
    textColor: "{colors.err}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "22px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "30px"
  filter-chip-on:
    backgroundColor: "{colors.ledger-ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "30px"
  queue-row:
    backgroundColor: "{colors.surface}"
    padding: "12px 16px"
  queue-row-selected:
    backgroundColor: "{colors.pilot-light-soft}"
    padding: "12px 16px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  confirm-block:
    backgroundColor: "{colors.sunken}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: PicksyOS Operations Console

## Overview

**Creative North Star: "The Night-Shift Ledger"**

The console is the record an operator trusts at the end of a long shift. It is calm, plain and accountable: low visual noise, declarative copy, and every line on screen able to say why it is there. A rank shows its reasons, a countdown shows its source, a disabled button shows its excuse, and every action leaves a line in the log. Nothing shouts. Urgency comes through weight, order and a single breach tint, never through alarm colour or motion.

The density is that of a working tool: a 14 px body, 12 px labels, tabular numerals throughout, and JetBrains Mono for anything an operator reads back aloud (IDs, clock times, countdowns). The light theme is a cool paper ledger; the dark theme is the same ledger in Ledger Ink, built for parity rather than as an afterthought. Both themes hold WCAG 2.2 AA.

The brand comes from Delivery One's public website: Inter and JetBrains Mono, pill buttons, and the lime full stop that ends the product name. Inside the tool that lime becomes the Pilot-Light: the one small light that stays on and marks where the operator acts. Controls are tactile and confident, with firm 36 px targets (44 px on touch), solid fills and clear running states.

**Key Characteristics:**
- Ledger calm: flat surfaces, 1 px hairlines, shadows only on things that float.
- Priority is weight, not hue: P1 solid, P2 outlined, P3 hairline.
- Every state has a shape: hue plus icon plus word, never colour alone.
- Uncertainty is its own material: grey, dashed and stamped "as of hh:mm".
- One Pilot-Light per panel: the recommended action is the only lime button.

## Colors

A near-monochrome ledger of cool greys and green-black ink, with one lime pilot light and four darkened status hues that carry state.

### Primary
- **Pilot-Light Lime** (#84b926; #a6e22e in dark): the fill of the single recommended action per panel, the full stop in the product name, and the focus halo. It always carries Ledger Ink text (8.4:1). It is never used as text or as a "healthy" signal; on white it fails as text (2.35:1).
- **Pilot-Light Green** (#4a6b22; lime-bright in dark): the text and line form of the accent: links, the "Recommended" label, the selected-row outline and the solid focus ring (6.15:1 on white).
- **Pilot-Light Soft** (#eef6df; #1c2610 in dark): the fill of the selected queue row, and nothing else.

### Neutral
- **Ledger Ink** (#111312; #f2f2f2 in dark): primary text, the P1 band fill, pressed filter chips and the ink Confirm button.
- **Ledger Ink 2** (#3d423e): why lines, reasons, body copy in notices.
- **Ledger Ink Muted** (#5f645f): captions, meta, times, section counts. It holds 5.6:1 or more on every light background.
- **Canvas** (#f7f7f6; #0a0b0a in dark): the app background behind the panel and pages.
- **Surface** (#ffffff; #111312 in dark): the queue, panels, rows and blocks.
- **Sunken** (#f2f2f2; #1b1e1c in dark): section headers, the disclaimer footer line, inline confirms and context notes.
- **Hairline** (#e8eae8; #2a2e2b in dark): decorative dividers between rows and around blocks.
- **Control Line** (#8a8f8a; #6e736f in dark): outlines of controls (secondary buttons, chips), held at 3:1 or more.

### Status
- **Ok** (#3f6e14 on #e8f2de): Online, Recovered, Resolved, Ready for pickup, Delivered.
- **Warn** (#8a5a06 on #fbf1dc): Degraded, a deadline 30 min away or less, Code not delivered, Hold expired.
- **Err** (#a8321f on #f9e4e0): Offline, a breached deadline, Blocked, failed results.
- **Info** (#335f7c on #e2edf3): incident progress (Acknowledged, Action in progress, Awaiting field service) and the ownership notice.
- **Unknown** (#565b57 on #f2f2f2, dashed #8a8f8a border): Signal delayed and any value that may be stale.
- **Moved Tint** (#fbf1dc): the brief highlight on a queue row that changed section or band.

Each status hue was darkened for light and lightened for dark until its text reaches 4.5:1 on both the surface and its own tint.

### Named Rules
**The Pilot-Light Rule.** Lime means "act here" or "you are here", never "healthy". One lime button per panel: the recommended action.

**The Weight-Not-Hue Rule.** Priority bands carry no colour. P1 is a solid Ledger Ink badge, P2 a 1.5 px ink outline, P3 a hairline in grey. Status hues stay free for state.

**The Honest Grey Rule.** Data that may be stale is grey, dashed, carries a clock icon and reads "as of hh:mm". It never borrows the ok style.

## Typography

**Body Font:** Inter (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace)

**Character:** Inter at 400 and 500 carries reading and labelling with tabular numerals; JetBrains Mono carries anything that is an identifier or a time, so INC-102, 09:45 and −15m line up and read back exactly.

### Hierarchy
- **Title** (JetBrains Mono 600, 24 px, 1.2, −0.02em): the ID heading of a station or parcel page (LIT-03, PCL-0412).
- **Headline** (Inter 600, 20 px, 1.25, −0.02em): the incident type at the top of the panel ("Retrieval failure"). It is the focus target when a row opens.
- **Body** (Inter 400, 14 px, 1.5, tabular numerals): reasons, confirm consequences, notices.
- **Body strong** (Inter 500, 14 px): button labels, row titles, fact values.
- **Small** (Inter 400, 13 px, 1.45): queue why lines (two lines at most), timeline text.
- **Label** (Inter 500, 12 px, +0.1em, uppercase): section headers ("NEEDS ATTENTION"), fact keys ("DEADLINE 15:56"), block titles.
- **Caption** (Inter 400, 12 px, 1.4): deadline sources ("Contract target 2 h"), action reasons.
- **Mono / Mono small** (JetBrains Mono 500, 13 / 12 px): IDs, clock times, countdowns, counts, concept labels.

### Named Rules
**The Read-Back Rule.** If an operator would read it aloud to a colleague (an ID, a time, a countdown, a count), set it in JetBrains Mono.

**The 12 px Floor Rule.** Nothing an operator must read is set below 12 px, on desktop or phone.

## Layout

The default view is master-detail. On desktop (1200 px and up) the queue takes 40 % of the width (380 to 560 px) with the incident panel on the right, capped at 880 px. On tablet (768 to 1199 px) the queue takes 45 %. On phone (under 768 px) the queue is full width, an open incident becomes a full page with "Back to queue", and the action block sticks to the bottom with 44 px targets. Station and parcel views are full pages with a breadcrumb, centred at 1120 px and 960 px, splitting into two columns of at least 440 / 380 px when there is room.

Spacing follows a 4 px base (4, 8, 12, 16, 24, 32, 48, 64). Rows use 12 by 16 px padding; panel blocks use 16 px; blocks stack with a 16 px gap; pages breathe at 20 px. Queue section headers stay pinned while the list scrolls. There is no horizontal scroll at any width.

## Elevation & Depth

The system is flat. Depth comes from tonal layering (Canvas under Surface, Sunken for headers and confirms) and 1 px hairlines. A single lifted shadow exists, and only for things that float above the ledger: toasts, tooltips, the demo controls popover and the phone action bar.

### Shadow Vocabulary
- **Lifted** (`box-shadow: 0 8px 24px rgba(10,11,10,.10), 0 1px 2px rgba(10,11,10,.08)`; dark: `0 8px 24px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.4)`): toasts, tooltips, the popover, the sticky phone action bar.

### Named Rules
**The Flat Ledger Rule.** Rows, panels and blocks never cast shadows. If it scrolls with the page, it is flat.

## Shapes

Corners come in four steps: 6 px for badges, labels and inputs; 10 px for blocks, confirms, notices and toasts; 14 px for the incident action panel; and full pills for every button, status chip, filter chip and the role switch. The shape itself carries meaning: pills are states and actions, square-cornered (6 px) chips are parcel labels. Borders are 1 px hairlines for structure, 1 px control lines for anything clickable, 1.5 px ink for the P2 band, and dashed lines for anything unknown, disabled or illustrative.

## Components

### Buttons
Tactile and confident: firm targets, solid fills, a visible running state.
- **Shape:** full pill (999 px); 36 px tall, 30 px small, 44 px on touch.
- **Primary:** Pilot-Light Lime fill with Ledger Ink text, 16 px side padding. One per panel, on the recommended action.
- **Secondary:** transparent with a 1 px Control Line outline and Ledger Ink text; hover adds a Sunken fill.
- **Confirm:** a Ledger Ink fill with Surface text, so it never competes with the lime primary sitting above it.
- **Quiet:** borderless, underlined text (Cancel).
- **Hover / Focus:** hover darkens the primary slightly (brightness .94) over 140 ms; focus shows a 2 px Pilot-Light Green ring, 2 px offset, with a 4 px lime halo.
- **Processing:** a spinning arc plus an -ing label ("Retrying dispense…"); the other actions in the bar turn disabled.
- **Disabled / Locked:** a dashed Control Line outline with muted text, always with a reason line underneath; locked adds a padlock and a tooltip. Both use aria-disabled so they stay focusable.

### Chips
- **Status chips:** pills, 22 px (20 px in rows), hue tint plus matching icon plus word: Open (outlined ring), Acknowledged, Action in progress, Awaiting field service (info), Recovered, Resolved (ok).
- **Parcel labels:** 6 px corners, same tint grammar: Blocked (err plus padlock), Code not delivered (warn plus triangle), Hold expired (warn plus clock), Ready (ok plus dot), Picked up and Marked for return (hairline, quiet).
- **Filter chips:** 30 px pills with a Control Line outline and a mono count; pressed turns solid Ledger Ink with a check.
- **Concept labels:** small mono tags: dashed for "Illustrative", solid line for "Proposed", Sunken fill for "Demo control".

### Cards / Containers
- **Decision card:** the only card in the incident panel (14 px corners, Surface, 1 px Hairline, 20 px padding). It holds the header, reasons, deadline bar, notices, the recommendation and the actions; the action bar sits under a hairline inside it, not in a card of its own. On phone the action block is the sticky bottom sheet instead.
- **Evidence sections:** parcels, signals, timeline, notifications, history, open and linked incidents. Each is a plain section: a Control Line rule on top, a caps label header, Hairline dividers between rows, and no box or background.
- **Stats block:** the station stats keep a bordered block, because its dashed Unknown treatment carries meaning.
- **Shadow Strategy:** none (see The Flat Ledger Rule).

### Inputs / Fields
- **Style:** the required note in a confirm: a 6 px textarea with a 1 px Control Line border on Surface.
- **Focus:** the shared 2 px ring and 4 px halo.

### Owner Chip
A 12 px text pill ("Operator B") in Ledger Ink on Sunken with a hairline. There is no avatar. Screen readers hear "Owner: Operator B". It is hidden when the owner is You.

### Navigation
- **Header:** the product name in Inter 600 with a lime full stop, then network status as outlined pills (Offline with an err icon, Signal delayed dashed), the mono demo clock, Help, and one "Concept controls" menu (role switch, theme, simulated events). A "Supervisor mode" chip shows while that role is on. Band counts are not repeated in the header; they live on the band filter chips. On phone the brand shortens to "PicksyOS." (never cut mid-word), status collapses to two 48 px cells (icon + word + count), and the menu sits behind a drawn "more" icon.
- **Footer:** the disclaimer is one thin Sunken line at the bottom of every screen (12 px, wraps on phone).
- **Breadcrumb:** mono IDs separated by "›"; the current page is plain Ledger Ink.

### Queue Row (signature)
The ledger line. A three-column grid: the band badge (or a status icon outside Needs attention), the type with the station ID, city and incident ID, then the mono countdown aligned right. Below it sit the why line (two lines at most, the deciding reason first in medium weight) and the chips. Above the rows, "Needs attention" carries a "Proposed rule" tag and a one-line rule with a "How ranking works" disclosure; the rule is never hover-only. Selected rows get Pilot-Light Soft with a 1.5 px Pilot-Light Green inner outline. Rows that change section or band flash Moved Tint for 1.6 s (held 2 s under reduced motion). A deadline reason is not repeated in the why line unless it is the deciding one, since the countdown sits in the same row.

### Deadline Countdown (signature)
Mono, compact ("1h 56m", "3h 00m", "22m"), three states: normal (ink), 30 min or less (warn, weight 600, with a clock icon), and breached (an err-tinted 6 px plate with a triangle and "Breached −15m"). A breached queue row also gets a 3 px Err edge on its left (inset, no tint, no motion); this is the one sanctioned coloured edge in the system. In the panel only, a 6 px Deadline Bar under the countdown shows contract time used vs. left (Ledger Ink 2 fill, Warn at 30 min or less, full and Err once breached), with its source and an Illustrative or Proposed tag beside it, and a spoken equivalent ("1 hour 56 minutes left of 2 hours", "Breached by 15 minutes").

### Result Notice
Success in the ok tint; after a resolve it adds "Moved to Resolved today." with a "Show in queue" link. An action failure (err tint) states what failed and the next step in bold ("Backup did not respond. Next: request a field visit."); Retry is a quiet text link and the new recommendation stays the only lime button. A submit failure (err outline, "Could not send. Nothing changed.") keeps a Retry button.

### Locked Recommendation
The recommendation follows the role, so the one lime button is always doable. An action that needs another role stays in the row as a locked secondary (dashed Control Line, padlock, a reason line, and a tooltip that never covers another action). The dashed Sunken locked card remains only as a fallback.

### Orientation Pane
The detail pane while nothing is selected is short: "No incident open", the one lime button "Open the top incident" with the top row's band, type and station, one mono status line, and a key hint. The ranking rule, band legend, keys and "About this concept" live in Help (a popover on desktop, inline on phone).

### First-visit Tour
Three callouts on the real screen, never modal and nothing dimmed: a 2 px focus-coloured ring on the target plus a Surface card ("1 of 3", a 16 px title, one sentence, an ink primary, a quiet "Skip tour"). Esc ends it, it is remembered in the browser, and Help reopens it.

### Inline Confirm
A Sunken 10 px block directly under the action bar: an uppercase "CONFIRM · ACTION" label, one sentence of consequence, a note field when required, the ink Confirm button, a quiet Cancel, and "Esc cancels · Proposed" aligned right. It is never a modal. On phone it stays at about 200 px or less: the consequence scrolls inside it and Confirm and Cancel stay visible.

## Do's and Don'ts

### Do:
- **Do** keep the disclaimer footer line ("Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data.") visible on every screen at every width.
- **Do** keep concept tags (Illustrative, Proposed, Demo control) out of the working screens; they belong in Help and Concept controls.
- **Do** pair every status hue with an icon and a word.
- **Do** keep the focus ring visible on every state (selected and breached rows included), and return focus to its origin whenever something closes.
- **Do** set IDs, times, countdowns and counts in JetBrains Mono with tabular numerals.
- **Do** give every disabled or locked action a visible reason line.
- **Do** show stale values grey and dashed with "as of hh:mm".
- **Do** keep the 2 px focus ring with its 4 px halo on every interactive element.

### Don't:
- **Don't** use lime to mean "healthy", or put more than one lime button in a panel.
- **Don't** give priority bands a hue; a red P1 would read as Offline or Breached.
- **Don't** add shadows to rows, panels or blocks.
- **Don't** use modals or browser dialogs for confirmation.
- **Don't** set body text at weight 300 or any readable text below 12 px.
- **Don't** add a Delivery One logo; the product name stays plain text.
