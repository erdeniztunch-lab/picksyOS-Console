# PicksyOS Operations Console: design system

Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data.

This is the canonical design document. It was seeded from the approved design-system page (`PicksyOS Screens.dc.html`) and the shipped console (`picksyos-console/`).
- `DESIGN.md` at the repo root is the machine-readable mirror for design tooling. `.impeccable/design.json` is its sidecar.
- If they disagree with this file, this file wins, and they are updated in the same change.
- Behaviour lives in `operational-model.md`; screens and flows in `product-brief.md`.

Token sources:
- `picksyos-console/src/styles/tokens.css` (CSS custom properties)
- `picksyos-console/src/design/tokens.ts` (the same values as a TypeScript object)

## 1. Rules the tokens enforce

- **Lime is identity and focus.** It is used for the primary button, the selected row, the focus ring and the full stop. It never means "healthy".
- **Priority is weight, not hue.** P1 is solid, P2 outlined, P3 hairline, always with its label. Status hues stay free for state.
- **Every state has a shape.** Each status chip pairs a hue with an icon and a word, so nothing depends on colour alone.
- **Stale is neutral and dashed.** Unknown data gets grey, a dashed outline, a clock and "as of hh:mm". It never borrows the healthy style.
- **One lime button per panel.** It is used only on the recommended action. Confirm buttons are ink.
- **Nothing readable below 12 px**, on any width. WCAG 2.2 AA in both themes.
- **The disclaimer is visible on every screen at every width,** as a thin footer line. No Delivery One logo; the product name is plain text.
- **Working screens carry no concept tags.** Illustrative / Proposed / Demo control appear only in Help and Concept controls.

## 2. Colour roles

| Token | Role | Light | Dark |
|---|---|---|---|
| `--canvas` | App background | #f7f7f6 | #0a0b0a |
| `--surface` | Panels, rows | #ffffff | #111312 |
| `--sunken` | Section headers, confirms, disclaimer | #f2f2f2 | #1b1e1c |
| `--border` | Hairline (decorative) | #e8eae8 | #2a2e2b |
| `--border-strong` | Control outlines (≥3:1) | #8a8f8a | #6e736f |
| `--text` | Primary text | #111312 | #f2f2f2 |
| `--text-2` | Why lines, body | #3d423e | #c6cac6 |
| `--text-muted` | Captions, meta | #5f645f | #9ca19c |
| `--accent` | Primary fill (ink text on it) | #84b926 | #a6e22e |
| `--accent-text` | Links, selected outline | #4a6b22 | #a6e22e |
| `--accent-soft` | Selected row fill | #eef6df | #1c2610 |
| `--focus` / `--focus-halo` | 2 px ring + 4 px halo | #4a6b22 / #84b92673 | #a6e22e / #a6e22e59 |

### Status, priority and freshness

Each ratio pair is contrast on the surface, then on the token's own tint.

| Token | Used for | Light fg · bg | Dark fg · bg |
|---|---|---|---|
| `--ok` | Online, Ready, Recovered, Resolved, success | #3f6e14 · #e8f2de (6.08 / 5.27) | #8fcb5c · #18240f (9.65 / 8.37) |
| `--warn` | Degraded, Code not delivered, Hold expired, ≤30 min | #8a5a06 · #fbf1dc (5.92 / 5.28) | #e8b552 · #2a200c (9.92 / 8.52) |
| `--err` | Offline, Out of service, Blocked, breached, failure | #a8321f · #f9e4e0 (6.69 / 5.48) | #f2856f · #2e1612 (7.43 / 6.74) |
| `--info` | Acknowledged, In progress, Awaiting field, ownership | #335f7c · #e2edf3 (6.84 / 5.75) | #86b6d6 · #0f1f29 (8.60 / 7.75) |
| `--unk` / `--unk-border` | Signal delayed, availability Unknown, stale values (dashed) | #565b57 · #f2f2f2 (6.93 / 6.19), dash 3.29 | #b1b6b1 · #1b1e1c (9.06 / 8.16), dash 4.76 |
| `--p1-bg` / `--p1-fg` | Band P1, solid | #111312 / #ffffff (18.65) | #f2f2f2 / #0a0b0a (17.61) |
| `--p2-line` / `--p2-fg` | Band P2, 1.5 px outline | #111312 (18.65) | #f2f2f2 (16.66) |
| `--p3-line` / `--p3-fg` | Band P3, hairline | #bfc3bf / #5f645f (6.04) | #3d423e / #9ca19c (7.10) |
| `--moved` | Moved-row highlight | #fbf1dc | #2a200c |

## 3. Type

Inter 400/500/600 with tabular numerals. JetBrains Mono for IDs, clock times, countdowns and counts. The floor is 12 px; phone uses the same scale.

| Role | Spec | Example |
|---|---|---|
| title | 24/1.2, 600, −.02em (mono on station and parcel pages) | LIT-03 |
| heading | 20/1.25, 600, −.02em | Retrieval failure |
| subhead | 16/1.35, 600 | Affected parcels |
| body | 14/1.5, 400 | Moves PCL-0107 to the hatch at WAL-01. |
| body-strong | 14, 500 | Retry dispense |
| small | 13/1.45, 400 | Breached 15 min ago · No pickups possible |
| label | 12/1.3, 500, caps, +.1em | Needs attention |
| caption | 12/1.4, 400 | Contract target 4 h |
| mono / mono-sm | 13 / 12, 500, tnum | INC-102 · 09:45 |

## 4. Space, shape, motion, breakpoints

- **Space:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. `app.css` uses `var(--space-n)` and `var(--radius-*)` for every on-scale padding, margin, gap and corner (152 values, verified pixel-identical against screenshots taken before the change); off-scale and negative values stay raw.
- **Radius:**
  - sm 6: badges, labels, inputs
  - md 10: blocks, confirms, notices, toasts
  - lg 14: the decision panel
  - pill 999: buttons and chips
- **Elevation:**
  - e0 flat rows
  - e1 hairline surface
  - e2 `0 8px 24px /.10, 0 1px 2px /.08`, only for the toast, tooltip, popover and phone action bar
- **Motion:**
  - fast 140 ms: hover, press
  - base 240 ms: confirm open, re-rank
  - slow 600 ms: moved-row highlight fade
  - row highlight held 1600 ms
  - ease `cubic-bezier(.2,0,0,1)`
  - Reduced motion: no transitions, a static spinner, and the highlight held 2 s.
- **Breakpoints:**
  - phone under 768: single column, panel as a page, sticky action bar
  - tablet 768–1199: queue 45 %
  - desktop 1200 and up: queue 40 %, panel max 880

## 5. Components

The props come from the records in `operational-model.md`. Counts are passed in already computed; no component stores one.

```ts
type Band = 'P1' | 'P2' | 'P3';
type IncidentStatus = 'open' | 'acknowledged' | 'inProgress' | 'awaitingField' | 'recovered' | 'resolved';
type StationState = 'online' | 'degraded' | 'signalDelayed' | 'offline' | 'outOfService';
ConceptLabel { kind: 'illustrative' | 'proposed' | 'demoControl'; text?: string }
DisclaimerBar {}                                   // always rendered, every width
PriorityBadge { band: Band }
IncidentStatusChip { status: IncidentStatus; size?: 'md' | 'sm' }
StationStateChip { state: StationState }
DeadlineCountdown { value: CountdownView }         // normal / soon ≤30 m / breached
ParcelLabel { label: ParcelLabel }
OwnerChip { owner: string }                        // text chip ("Operator B"), no avatar; hidden when the owner is You
FilterChip { label; count; pressed; onToggle }
QueueSection { kind; count; open; onToggle }
QueueRow { row: RowView }                          // band, title, countdown, why line (lead first)
RankingRule {}                                     // renders RANKING_RULE; the single source of the rule text
IncidentHeader · RecommendedAction · ActionBar · InlineConfirm · ResultNotice
ParcelRow · SignalGroup · TimelineEvent · Breadcrumb · Toast · Tooltip
```

### Component notes
- **Type floor:** every readable string is at least 12 px. This includes concept tags (Illustrative, Proposed, Demo control), hints ("Esc cancels · Proposed"), block asides ("Hold period illustrative"), timeline outcome tags, small status chips and the header band badges. On phone the disclaimer keeps 12 px and wraps to two lines instead of shrinking.
- **Owner chip:** a 12 px text chip, Ledger Ink on Sunken with a hairline, with a visually hidden "Owner:" prefix for screen readers. There is no initial avatar: the 9 px initial on Control Line failed AA (3.3:1 light, 3.9:1 dark).
- **Phone brand:** "PicksyOS." alone below 768 px, never cut mid-word. The link's accessible name is the full product name.
- **Queue row:**
  - **Grid:** band, then type with station, city and ID, then the countdown aligned right.
  - **Why line:** up to 2 lines, with the deciding reason first in medium weight. A deadline reason is left out of the row unless it is the deciding one; the countdown column carries it.
  - **Selected:** accent-soft fill with a 1.5 px accent-text inner outline.
  - **Moved:** the moved tint for 1.6 s.
- **Deadline countdown:** mono, compact: "1h 56m", "3h 00m", "22m". At 30 min or less it turns warn with a clock icon. Once breached it reads "Breached −15m" on an err plate.
- **Breached row:** a 3 px `--err` inset edge on the left. No row tint, no motion. This is the one sanctioned coloured edge.
- **Deadline bar (panel only):** a 6 px track under the countdown. It fills with contract time used (`--text-2`), turns `--warn` at 30 min or less, and is full in `--err` once breached. Beside it is the source ("Contract target 4 h" plus an Illustrative tag, or "Internal target 8 h" plus a Proposed tag). It is `role="img"`, labelled "1 hour 56 minutes left of 2 hours" or "Breached by 15 minutes". There is no bar in queue rows.
- **Needs attention header:** the title, the count and a muted "most urgent first". No rule line and no tags on the working screen; the full rule lives in Help → "How ranking works".
- **Result notice:**
  - **Success:** ok tint.
  - **Action failure:** err tint. It states the failure and the next step in bold ("Next: request a field visit."), and Retry is a quiet text link.
  - **Submit failure:** err outline, "Could not send. Nothing changed.", and a Retry button.
  - **After a resolve:** the success notice adds "Moved to Resolved today." with a "Show in queue" link.
- **Per-role recommendation:** the recommended action is always one the current role can take (Operator on Pickup window expired: Extend hold). An action that needs another role stays in the action row as a locked secondary (dashed outline, padlock, "Supervisor approval needed"); its tooltip opens below and right-aligned for later actions, and inline on phone, so it never covers another action. The dashed locked card is kept only as a fallback for a recommendation that cannot be re-targeted.
- **Focus:** queue rows show the focus ring over selected and breached states (inset, 2 px plus halo). Focus returns to its origin when a confirm, the panel (back to the row), Help, Concept controls or the tour closes. Popovers close when focus leaves them.
- **Keys:** single-key shortcuts can be turned off in Help (`picksy-shortcuts`), and they never fire from the header, popovers or the tour.
- **Targets:** on phone every tappable element is at least 44 px, links included.
- **Empty pane:** "No incident open", one primary button "Open the top incident" with the live top row (band, type, station), one mono status line ("12 stations · 7 fresh · 4 offline · 1 signal delayed"), and a key hint.
- **Help:** a popover on desktop, inline on phone. It holds RankingRule (the single source of the rule text), the band legend, the keys (`kbd`, mono 12 px, Control Line with a 2 px base), "About this concept" with the Illustrative / Proposed / Demo control legend, and "Show the tour again".
- **First-visit tour:** three callouts on the real screen (queue → top row → recommended action), with a ring on the target and an ink primary. It is not modal and nothing is dimmed. Skip or Esc ends it, and it is remembered in localStorage (`picksy-tour-done`).
- **Stress banner:** one Sunken strip above the queue ("Stress test on: 40 extra incidents added."), with no tags. Rows carry no per-row chip.
- **Key hints:** Acknowledge and the recommended action carry `aria-keyshortcuts` and a "Shortcut: A" / "Shortcut: R" tooltip.
- **Toasts:** at most 3, newest first, then a Sunken "+N more" line.
- **Queue row accessibility:** the accessible name is short and structured ("P1, Retrieval failure, WAL-01, deadline in 1 hour 56 minutes" / "…, breached by 15 minutes" / "Resolved, …, resolved at 10:15"). The why line and chips are linked as its description.
- **Filters under 768 px** (including 200 % zoom): one "Filters" / "Filters (n)" disclosure button, plus Clear filters when any are active.
- **Panel hierarchy:** the decision zone is the only card in the panel (header, reasons, deadline bar, notices, recommendation, actions). Evidence (parcels, signals, timeline, notifications, history, linked incidents) is plain sections with a header and dividers.
- **Header:** network status (Offline, Signal delayed), the clock and Help are always visible; band counts are not repeated (they sit on the band filter chips). Role switch, theme and simulated events live in one "Concept controls" menu (behind a drawn "more" icon on phone). The phone status cells are icon + word + count, with no Unicode glyphs. The disclaimer is the footer line. The saved theme is applied by an inline script in `index.html` before the app renders, so dark theme never flashes light.
- **Field task card:** a Sunken block inside the decision zone, flat (no border, no shadow) and with no lime. Header "Saha görevi FT-0xx" with a stage chip (hue + icon + word: Talep edildi clock, Kabul edildi ack, Sahada a drawn pin, Tamamlandı check). The stage line reuses the step-bar component (done with time, the next stage marked "bekleniyor", the rest muted). The due countdown and contract-time bar are the incident's own components and breach style. Then "Talep eden" and the note, the hint "Sizden işlem gerekmiyor.", and "Saha ziyaretini iptal et" as a secondary button whose inline confirm needs a reason. After the station recovers on its own, the card asks "İstasyon kendiliğinden düzeldi. Saha ziyareti iptal edilsin mi?". Simulated timeline steps carry a neutral dashed "Simüle" tag, never the success tint. On narrow cards the step sub-lines give way to one line naming the current step.
- **Field visit request confirm:** the inline confirm lists İstasyon, Sorun, Etki and Son süre (breached in err), then the consequence sentence and an optional note; its ink button reads "Talebi gönder".
- **Inline confirm:** a sunken 10 px block directly under the action bar: "Confirm · Action", one consequence sentence, an optional required note, an ink Confirm button, a quiet Cancel, and "Esc cancels · Proposed". It is never a modal. On phone it stays at about 200 px or less: the consequence and note scroll inside a 96 px area, Confirm and Cancel stay visible, the Esc hint is hidden, and the recommendation line above it is hidden while it is open.

## 6. Canonical copy strings

These strings are quoted in the docs. Change them here, in the code, and in every doc that quotes them, all in the same change.

| Where | String |
|---|---|
| Disclaimer (footer line) | Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data. |
| Empty pane | No incident open · Open the top incident · (empty queue) All clear. New incidents appear at the top of the queue. |
| Tour | Most urgent first · Open an incident · Do the next step |
| Recommendation label | Recommended next step |
| Rule summary (Help only) | Within P1: a waiting recipient goes first for 10 min, then soonest deadline, then most parcels blocked. |
| Rule order (full) | Within P1: a waiting recipient goes first for 10 min (illustrative), then soonest deadline, then most parcels blocked. Within P2 and P3: soonest deadline, then most parcels blocked. |
| Empty queue | Nothing needs attention. 11 stations fresh · 1 signal delayed. (computed) |
| Filtered empty | No P1 incidents. Clear filter |
| Backup failure | Backup did not respond. Next: request a field visit. |
| Retry dispense failure | Parcel still stuck. Next: set the station out of service. |
| Resend failure | Code not delivered by SMS. Next: send the code by another channel. |
| Submit failure | Could not send. Nothing changed. |
| Resolve | … Incident resolved. Moved to Resolved today. Show in queue |
| Parcel block (one parcel) | Affected parcel · 1 blocked |
| Countdown | 1h 56m · 3h 00m · 22m · Breached −15m |
| Deadline bar (spoken) | 1 hour 56 minutes left of 2 hours · Breached by 15 minutes |
| Freshness (delayed) | Signal delayed (chip) · as of 13:54 (6 min ago) (stamp) |
| Locked secondary (Operator) | Mark for return · Supervisor approval needed · tooltip: Irreversible: the parcel leaves the recipient's reach. Needs supervisor approval. |

## 7. Deviations from the brand values

- **Focus ring.** Lime at 45 % alpha is about 1.4:1 on white, below the 3:1 a focus indicator needs. Light uses a solid green-deep ring with the lime halo around it; dark uses solid lime-bright.
- **Status hues darkened or lightened.** All four keep their hue. The light ok tint moved from #eef6df to #e8f2de, so "healthy" is not the same fill as lime-soft, which now means "selected".
- **Priority has no hue.** A red P1 would read as Offline or Breached.
- **Muted text is #5f645f, not grey-500.** It holds 5.6:1 or more on every light background.
- **Label tracking is +0.1em, not +0.14em.** Tighter for narrow panel headers; uppercase kept.
- **Compact type scale, 12–24 px, with weight 400 for body text.**
- **Confirm is ink, not lime.** One lime button per panel.
