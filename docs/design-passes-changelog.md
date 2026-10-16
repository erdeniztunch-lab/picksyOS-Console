# Design passes: docs change log

Every documentation change made during the design passes (16 Oct 2026), in order, as file → old → new. The text is quoted exactly as replaced.

- **Pass 1** `operational-model.md`
  - old: **Why reasons:** every rule that matches is shown, not only the first one, in this order.
  - new: **Why reasons:** every rule that matches is shown, not only the first one. The deciding reason, which is the first rule that matched the incident's band (P1: recipient waiting, then breach or 30 min or less, then no pickups with 10 or more blocked; P2: no pickups, then 2 h or less, then 1 or more blocked), comes first and is shown in medium weight. The rest follow in this order.
- **Pass 1** `operational-model.md`
  - old: - If the action can't be submitted, the state does not change, and the operator sees an inline error with a Retry button.
  - new: - If the action can't be submitted, the state does not change, and the operator sees an inline error ("Could not send. Nothing changed.") with a Retry button.
- If the action runs and fails, the result names what failed and points to the new recommendation ("Backup did not respond. Next: request a field visit."). The new recommendation is the only primary button; Retry is a quiet text link.
- **Pass 1** `operational-model.md`
  - old: stays as it was, with "Carrier did not accept, retry" |
  - new: stays as it was, with "Carrier did not accept." and a Retry link |
- **Pass 1** `product-brief.md`
  - old: 3. It fails. The inline error reads "No response on LTE backup. Station still offline." The status changes to Acknowledged (owner: You), and the recommendation updates to "Request field visit".
  - new: 3. It fails. The inline error reads "Backup did not respond. Next: request a field visit." Retry is a quiet text link. The status changes to Acknowledged (owner: You), and the recommendation updates to "Request field visit", which is now the only primary button.
- **Pass 1** `product-brief.md`
  - old: 7. **See the result.** An inline result reads "Parcel delivered to hatch. Incident resolved."
  - new: 7. **See the result.** An inline result reads "Parcel delivered to hatch. Incident resolved. Moved to Resolved today." with a "Show in queue" link that opens that section and scrolls to the row.
- **Pass 1** `product-brief.md`
  - old: Each section header shows its count. | Click a row to select it. Expand or collapse a section. |
  - new: Each section header shows its count. Under "Needs attention", one line states the order within P1 ("Within P1: a waiting recipient goes first for 10 min, then soonest deadline, then most parcels blocked."), tagged "Proposed rule". | Click a row to select it. Expand or collapse a section. "How ranking works" opens the full rule inline. |
- **Pass 1** `product-brief.md`
  - old: | 3a | Queue row | band, type, station id and city, why line (max 2 lines),
  - new: | 3a | Queue row | band, type, station id and city, why line (max 2 lines; the deciding reason first, in medium weight),
- **Pass 1** `product-brief.md`
  - old: recommended action with one line of reason, then the other allowed actions for this type and state. Disabled actions show their reason. Inline confirm opens directly under the action. |
  - new: recommended action with one line of reason, then the other allowed actions for this type and state. Disabled actions show their reason. Inline confirm opens directly under the action. When the recommended action is locked for the current role, it shows as a locked card ("Mark for return · needs supervisor" plus its reason), followed by "You can" and the first available action as the primary. |
- **Pass 1** `product-brief.md`
  - old: "Proposed" appears on the role switch, the priority rule tooltip and actions.
  - new: "Proposed" appears on the role switch, the priority rule ("Proposed rule") and actions.
- **Pass 1** `product-brief.md`
  - old: The "Needs attention" section reads "Nothing needs attention. 12 stations reporting."
  - new: The "Needs attention" section reads "Nothing needs attention. 11 stations fresh · 1 signal delayed." (computed from station states)
- **Pass 1** `product-brief.md`
  - old: | Action failed | Panel result area, parcel | The failure sentence, the new status (Acknowledged) and the updated recommendation | Retry, or follow the new recommendation |
  - new: | Action failed | Panel result area, parcel | The failure sentence and the next step ("Backup did not respond. Next: request a field visit."), the new status (Acknowledged), and the updated recommendation as the only primary button | Follow the new recommendation, or Retry (a quiet link) |
- **Pass 1** `product-brief.md`
  - old: | No permission | Action bar (Mark for return, INC-108, parcel PCL-0301) | Lock plus "Supervisor approval needed", with a tooltip | Use Extend hold, or switch role (demo) |
  - new: | No permission | Action bar (Mark for return, INC-108, parcel PCL-0301) | In the panel, a locked recommendation card "Mark for return · needs supervisor" with its reason, then "You can" with Extend hold as the primary. The locked button keeps "Supervisor approval needed" and a tooltip that opens below it. | Use Extend hold, or switch role (demo) |
- **Pass 1** `evidence.md`
  - old: "Proposed" on the priority rule shown in a tooltip
  - new: "Proposed rule" on the priority rule, shown under "Needs attention" and in the "How ranking works" disclosure
- **Pass 1** `docs/design-system.md`
  - old: (file did not exist)
  - new: canonical design doc created from PicksyOS Screens.dc.html + DESIGN.md, with a canonical copy-string table
- **Pass 1** `DESIGN.md`
  - old: ### Inline Confirm
  - new: ### Result Notice
Success in the ok tint; after a resolve it adds "Moved to Resolved today." with a "Show in queue" link. An action failure (err tint) states what failed and the next step in bold ("Backup did not respond. Next: request a field visit."); Retry is a quiet text link and the new recommendation stays the only lime button. A submit failure (err outline, "Could not send. Nothing changed.") keeps a Retry button.

### Locked Recommendation
When the recommended action needs another role: a dashed Sunken card, "Mark for return · needs supervisor", its reason and the locked button (tooltip opens below it), then "You can" with the first available action as the primary.

### Inline Confirm
- **Pass 1** `DESIGN.md`
  - old: Below it sit the why line (two lines at most) and the chips.
  - new: Below it sit the why line (two lines at most, the deciding reason first in medium weight) and the chips. Above the rows, "Needs attention" carries a "Proposed rule" tag and a one-line rule with a "How ranking works" disclosure; the rule is never hover-only.
- **Pass 1** `PRODUCT.md`
  - old: Tokens: `README.md` / `picksyos-console/src/design/tokens.ts`.
  - new: Tokens: `README.md` / `picksyos-console/src/design/tokens.ts`. The canonical design doc is `docs/design-system.md`; `DESIGN.md` mirrors it.
- **Pass 2** `operational-model.md`
  - old: The deadline line always shows its source: "Contract target 4 h (illustrative)" or "Internal target 8 h (proposed)".
  - new: The deadline always shows its source. In the panel it sits beside a thin bar of contract time used vs. left: "Contract target 4 h" with an "Illustrative" tag, or "Internal target 8 h" with a "Proposed" tag. The bar fills fully and switches to error styling once the deadline passes. Countdowns use the compact form "1h 56m", "3h 00m", "22m", and "Breached −15m" once past the deadline.
- **Pass 2** `operational-model.md`
  - old: 1 parcel blocked, deadline in 1 h 56 m |
  - new: 1 parcel blocked, deadline in 1h 56m |
- **Pass 2** `operational-model.md`
  - old: | opened 4 h 15 m ago, 18 parcels blocked, deadline breached 15 m ago |
  - new: | opened 4h 15m ago, 18 parcels blocked, deadline breached 15 min ago |
- **Pass 2** `operational-model.md`
  - old: 7 parcels blocked, deadline in 3 h 35 m |
  - new: 7 parcels blocked, deadline in 3h 35m |
- **Pass 2** `operational-model.md`
  - old: 1 parcel, deadline in 7 h 20 m (internal) |
  - new: 1 parcel, deadline in 7h 20m (internal) |
- **Pass 2** `operational-model.md`
  - old: | opened 4 h 15 m ago. Backup **fails**. |
  - new: | opened 4h 15m ago. Backup **fails**. |
- **Pass 2** `operational-model.md`
  - old: task due in 5 h 10 m, requested by Operator B
  - new: task due in 5h 10m, requested by Operator B
- **Pass 2** `operational-model.md`
  - old: | Recipient waiting at station · Deadline in 1 h 56 m · 1 parcel blocked |
  - new: | Recipient waiting at station · Deadline in 1h 56m · 1 parcel blocked |
- **Pass 2** `product-brief.md`
  - old: with the why line "Recipient waiting at station · Deadline in 1 h 56 m · 1 parcel blocked".
  - new: with the why line "Recipient waiting at station · Deadline in 1h 56m · 1 parcel blocked" (the deciding reason, "Recipient waiting at station", first and in medium weight).
- **Pass 2** `product-brief.md`
  - old: and the deadline "1 h 56 m · Contract target 2 h (illustrative)".
  - new: and the deadline "1h 56m" with a contract-time bar and its source, "Contract target 2 h" tagged "Illustrative".
- **Pass 2** `product-brief.md`
  - old: | Breached deadline | Row, panel | The countdown turns negative ("−15 m") in a breach style, and the reason reads "Breached 15 min ago" | the normal actions |
  - new: | Breached deadline | Row, panel | The row gets a 3 px error edge and the countdown reads "Breached −15m" (no row tint, no motion). The panel's contract-time bar is full and in error styling, with the text equivalent "Breached by 15 minutes". The reason reads "Breached 15 min ago". | the normal actions |
- **Pass 2** `DESIGN.md`
  - old: so INC-102, 09:45 and −15 m line up
  - new: so INC-102, 09:45 and −15m line up
- **Pass 2** `DESIGN.md`
  - old: - **Caption** (Inter 400, 12 px, 1.4): deadline sources ("Contract target 2 h (illustrative)"), action reasons.
  - new: - **Caption** (Inter 400, 12 px, 1.4): deadline sources ("Contract target 2 h" with an "Illustrative" tag), action reasons.
- **Pass 2** `DESIGN.md`
  - old: Mono, three states: normal (ink), 30 min or less (warn, weight 600, with a clock icon), and breached (an err-tinted 6 px plate with a triangle and a negative value, "−15 m").
  - new: Mono, compact ("1h 56m", "3h 00m", "22m"), three states: normal (ink), 30 min or less (warn, weight 600, with a clock icon), and breached (an err-tinted 6 px plate with a triangle and "Breached −15m"). A breached queue row also gets a 3 px Err edge on its left (inset, no tint, no motion); this is the one sanctioned coloured edge in the system. In the panel only, a 6 px Deadline Bar under the countdown shows contract time used vs. left (Ledger Ink 2 fill, Warn at 30 min or less, full and Err once breached), with its source and an Illustrative or Proposed tag beside it, and a spoken equivalent ("1 hour 56 minutes left of 2 hours", "Breached by 15 minutes").
- **Pass 2** `docs/design-system.md`
  - old: - **Needs attention header:**
  - new: - **Deadline countdown:** mono, compact: "1h 56m", "3h 00m", "22m". At 30 min or less it turns warn with a clock icon. Once breached it reads "Breached −15m" on an err plate.
- **Breached row:** a 3 px `--err` inset edge on the left. No row tint, no motion. This is the one sanctioned coloured edge.
- **Deadline bar (panel only):** a 6 px track under the countdown. It fills with contract time used (`--text-2`), turns `--warn` at 30 min or less, and is full in `--err` once breached. Beside it is the source ("Contract target 4 h" plus an Illustrative tag, or "Internal target 8 h" plus a Proposed tag). It is `role="img"`, labelled "1 hour 56 minutes left of 2 hours" or "Breached by 15 minutes". There is no bar in queue rows.
- **Needs attention header:**
- **Pass 2** `docs/design-system.md`
  - old: | Parcel block (one parcel) | Affected parcel · 1 blocked |
  - new: | Parcel block (one parcel) | Affected parcel · 1 blocked |
| Countdown | 1h 56m · 3h 00m · 22m · Breached −15m |
| Deadline bar (spoken) | 1 hour 56 minutes left of 2 hours · Breached by 15 minutes |
- **Pass 3** `docs/design-system.md`
  - old: OwnerChip { owner: string }                        // hidden when the owner is You
  - new: OwnerChip { owner: string }                        // text chip ("Operator B"), no avatar; hidden when the owner is You
- **Pass 3** `docs/design-system.md`
  - old: ### Component notes
  - new: ### Component notes
- **Type floor:** every readable string is at least 12 px. This includes concept tags (Illustrative, Proposed, Demo control), hints ("Esc cancels · Proposed"), block asides ("Hold period illustrative"), timeline outcome tags, small status chips and the header band badges. On phone the disclaimer keeps 12 px and wraps to two lines instead of shrinking.
- **Owner chip:** a 12 px text chip, Ledger Ink on Sunken with a hairline, with a visually hidden "Owner:" prefix for screen readers. There is no initial avatar: the 9 px initial on Control Line failed AA (3.3:1 light, 3.9:1 dark).
- **Phone brand:** "PicksyOS." alone below 768 px, never cut mid-word. The link's accessible name is the full product name.
- **Pass 3** `DESIGN.md`
  - old: ### Navigation
  - new: ### Owner Chip
A 12 px text pill ("Operator B") in Ledger Ink on Sunken with a hairline. There is no avatar. Screen readers hear "Owner: Operator B". It is hidden when the owner is You.

### Navigation
- **Pass 3** `DESIGN.md`
  - old: On phone it collapses to a 5-column 44 px count row with role, theme and demo controls behind "⋯".
  - new: On phone the brand shortens to "PicksyOS." (never cut mid-word), and the header collapses to a 5-column 44 px count row with role, theme and demo controls behind "⋯". The disclaimer stays at 12 px and wraps.
- **Pass 4** `product-brief.md`
  - old: **States:** loading (skeleton rows), empty queue, filtered and empty, an incident selected or not,
  - new: **No incident selected:** the right pane shows a compact orientation, not a tour or a modal: one sentence on what this is, how ranking works (the same rule text as the queue), the P1/P2/P3 legend, the label legend (Illustrative = invented value · Proposed = invented rule, role or action · Demo control = simulated event), the keys, and a "Start with the top incident" button that opens the current top row of Needs attention. On phone the same content sits behind "How this works" in the header.

**States:** loading (skeleton rows), empty queue, filtered and empty, an incident selected or not (orientation pane),
- **Pass 4** `product-brief.md`
  - old: Esc closes a confirm or the panel, and G Q returns to the queue.
  - new: Esc closes a confirm or the panel, and G Q returns to the queue. The keys are listed in the orientation pane, and Acknowledge and the recommended action show their key ("Shortcut: A", "Shortcut: R") in their tooltip.
- **Pass 4** `product-brief.md`
  - old: The header summary collapses to counts. The action bar sticks to the bottom of the screen.
  - new: The header summary collapses to counts, the brand shortens to "PicksyOS", and "How this works" opens the orientation inline. The action bar sticks to the bottom of the screen.
- **Pass 4** `product-brief.md`
  - old: "Illustrative" appears next to every invented value type (targets, hold period, counts in Stress test).
  - new: "Illustrative" appears next to every invented value type (targets, hold period). In the Stress test it appears once, on a banner above the queue, not on every row. "Proposed" is always a capitalised tag, never "(proposed)" in brackets.
- **Pass 4** `product-brief.md`
  - old: | Large queue (Stress test, 47 open) | Queue | Section headers stay pinned, In hand and Resolved are collapsed,
  - new: | Large queue (Stress test, 47 open) | Queue | One "Illustrative" banner above the queue ("Stress test: 40 invented incidents added."), section headers stay pinned, In hand and Resolved are collapsed,
- **Pass 4** `docs/design-system.md`
  - old: - **Inline confirm:**
  - new: - **Orientation pane:** fills the detail pane while no incident is selected (on phone, behind "How this works" in the header). It is reference, not a tour, and has a max width of 640 px:
  1. a heading and one sentence
  2. RankingRule (the same constant as the queue)
  3. the band legend (solid, outlined, hairline)
  4. the label legend
  5. the keys (`kbd`, mono 12 px, Control Line with a 2 px base)
  6. one primary button, "Start with the top incident", which follows live ranking

  Parts are separated by hairlines, with no cards.
- **Stress banner:** one Sunken strip above the queue with an Illustrative tag. Rows carry no per-row Illustrative chip.
- **Key hints:** Acknowledge and the recommended action carry `aria-keyshortcuts` and a "Shortcut: A" / "Shortcut: R" tooltip.
- **Inline confirm:**
- **Pass 4** `DESIGN.md`
  - old: ### Inline Confirm
  - new: ### Orientation Pane
The detail pane while nothing is selected: a Headline, one sentence, then hairline-separated parts. It shows the ranking rule (the same constant the queue uses), the band legend, the label legend and the keys (Mono `kbd` caps with a 2 px base), and ends with the panel's one lime button, "Start with the top incident". It is never a tour or a modal. On phone it opens inline from "How this works" in the header.

### Inline Confirm
- **Pass 5** `product-brief.md`
  - old: Each toast has a "View" link and disappears after 6 s. It never carries an action result for the selected incident. |
  - new: Each toast has a "View" link and disappears after 6 s. At most 3 show at once, newest first; the rest collapse into "+N more". It never carries an action result for the selected incident. |
- **Pass 5** `product-brief.md`
  - old: and "How this works" opens the orientation inline. The action bar sticks to the bottom of the screen.
  - new: and "How this works" opens the orientation inline. The type and band chips fold into one "Filters" disclosure ("Filters (n)" when n are active), so the first incident is visible without scrolling. This also applies at 200 % zoom on desktop. The action bar sticks to the bottom of the screen, and an open inline confirm stays at about 200 px or less: long consequence text scrolls inside it, and Confirm and Cancel stay visible.
- **Pass 5** `product-brief.md`
  - old: | 3a | Queue row | band, type, station id and city,
  - new: | 3a | Queue row (accessible name "P1, Retrieval failure, WAL-01, deadline in 1 hour 56 minutes" or "…, breached by 15 minutes"; the why line is its description) | band, type, station id and city,
- **Pass 5** `docs/design-system.md`
  - old: - **Inline confirm:**
  - new: - **Toasts:** at most 3, newest first, then a Sunken "+N more" line.
- **Queue row accessibility:** the accessible name is short and structured ("P1, Retrieval failure, WAL-01, deadline in 1 hour 56 minutes" / "…, breached by 15 minutes" / "Resolved, …, resolved at 10:15"). The why line and chips are linked as its description.
- **Filters under 768 px** (including 200 % zoom): one "Filters" / "Filters (n)" disclosure button, plus Clear filters when any are active.
- **Inline confirm:**
- **Pass 5** `docs/design-system.md`
  - old: "Esc cancels · Proposed". It is never a modal.
  - new: "Esc cancels · Proposed". It is never a modal. On phone it stays at about 200 px or less: the consequence and note scroll inside a 96 px area, Confirm and Cancel stay visible, the Esc hint is hidden, and the recommendation line above it is hidden while it is open.
- **Pass 5** `DESIGN.md`
  - old: "Esc cancels · Proposed" aligned right. It is never a modal.
  - new: "Esc cancels · Proposed" aligned right. It is never a modal. On phone it stays at about 200 px or less: the consequence scrolls inside it and Confirm and Cancel stay visible.
- **Pass 6** `product-brief.md`
  - old: role switch (Proposed), demo clock, Demo controls | Role switch. Demo controls: Reset, Complete field task, Stress test.
  - new: demo clock, and one "Concept controls" menu holding the role switch (Proposed), the theme toggle and the simulated events (Demo control) | Concept controls: role switch, theme, Reset, Complete field task, Stress test, Fail next submit. While the Supervisor role is on, a "Supervisor role" tag shows next to the menu.
- **Pass 6** `DESIGN.md`
  - old: - **Corner Style:** 10 px for blocks; 14 px for the action panel.
- **Background:** Surface on Canvas.
- **Shadow Strategy:** none (see The Flat Ledger Rule).
- **Border:** 1 px Hairline.
- **Internal Padding:** 12 by 14 px for blocks, 16 px for the action panel.
  - new: - **Decision card:** the only card in the incident panel (14 px corners, Surface, 1 px Hairline, 20 px padding). It holds the header, reasons, deadline bar, notices, the recommendation and the actions; the action bar sits under a hairline inside it, not in a card of its own. On phone the action block is the sticky bottom sheet instead.
- **Evidence sections:** parcels, signals, timeline, notifications, history, open and linked incidents. Each is a plain section: a Control Line rule on top, a caps label header, Hairline dividers between rows, and no box or background.
- **Stats block:** the station stats keep a bordered block, because its dashed Unknown treatment carries meaning.
- **Shadow Strategy:** none (see The Flat Ledger Rule).
- **Pass 6** `DESIGN.md`
  - old: - **Header:** the product name in Inter 600 with a lime full stop, then the
  - new: - **Header:** everything that belongs to the concept rather than the work (role switch, theme, simulated events) sits in one "Concept controls" menu; a "Supervisor role" tag shows while that role is on. The product name is in Inter 600 with a lime full stop, then the
- **Pass 6** `docs/design-system.md`
  - old: - **Inline confirm:**
  - new: - **Panel hierarchy:** the decision zone is the only card in the panel (header, reasons, deadline bar, notices, recommendation, actions). Evidence (parcels, signals, timeline, notifications, history, linked incidents) is plain sections with a header and dividers.
- **Header:** summary counts, clock and disclaimer always visible. Role switch, theme and simulated events live in one "Concept controls" menu (behind ⋯ on phone). The phone summary cells are icon + word + count, with no Unicode glyphs.
- **Inline confirm:**
- **Pass 7** `product-brief.md`
  - old: 1. **Open the console.** The queue view loads with no incident selected. The header summary reads: P1 2 · P2 2 · P3 3 · Offline 4 · Signal delayed 1.
  - new: 1. **Open the console.** The queue view loads with no incident selected. The header shows network status, Offline 4 · Signal delayed 1, and the band filter chips show P1 2 · P2 2 · P3 3. On a first visit, a 3-step tour points at the queue, the top row and the next-step button.
- **Pass 7** `product-brief.md`
  - old: | 1 | Header (all views) | Product name (plain text, no Delivery One logo, D14), the always-visible label "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data.", network summary (open P1, P2 and P3 counts, stations Offline, stations Signal delayed), demo clock, and one "Concept controls" menu holding the role switch (Proposed), the theme toggle and the simulated events (Demo control) | Concept controls: role switch, theme, Reset, Complete field task, Stress test, Fail next submit. While the Supervisor role is on, a "Supervisor role" tag shows next to the menu. Clicking P1, P2, P3 or Offline applies that filter. Clicking Signal delayed opens the delayed station, because signal delay has no incident to filter. |
  - new: | 1 | Header (all views) | Product name (plain text, no Delivery One logo, D14), network status (stations Offline, stations Signal delayed), the demo clock, Help, and one "Concept controls" menu holding the role switch, the theme toggle and the simulated events. The P1/P2/P3 counts are not repeated here; they sit on the band filter chips. The disclaimer "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data." is a thin footer line on every screen. | Help: ranking rule, band legend, keys, what is invented, "Show the tour again". Concept controls: role switch, theme, Reset, Complete field task, Stress test, Fail next submit. While the Supervisor role is on, a "Supervisor mode" chip shows next to the menu. Clicking Offline applies that filter. Clicking Signal delayed opens the delayed station, because signal delay has no incident to filter. |
- **Pass 7** `product-brief.md`
  - old: **No incident selected:** the right pane shows a compact orientation, not a tour or a modal: one sentence on what this is, how ranking works (the same rule text as the queue), the P1/P2/P3 legend, the label legend (Illustrative = invented value · Proposed = invented rule, role or action · Demo control = simulated event), the keys, and a "Start with the top incident" button that opens the current top row of Needs attention. On phone the same content sits behind "How this works" in the header.
  - new: **No incident selected:** the right pane is short and actionable: "No incident open", an "Open the top incident" button naming the current top row of Needs attention (it follows live ranking), one line of network status ("12 stations · 7 fresh · 4 offline · 1 signal delayed"), and a key hint. The ranking rule, legends and keys live in Help.

**First visit:** a 3-step tour on the real screen, not a modal: 1) "Most urgent first" at the queue, 2) "Open an incident" at the top row (its button opens it), 3) "Do the next step" at the recommended action. Skip or Esc ends it. It is remembered in the browser and reopens from Help → "Show the tour again".
- **Pass 7** `product-brief.md`
  - old: an incident selected or not (orientation pane),
  - new: an incident selected or not (short empty pane), first-visit tour,
- **Pass 7** `product-brief.md`
  - old: The keys are listed in the orientation pane, and Acknowledge
  - new: The keys are listed in Help, and Acknowledge
- **Pass 7** `product-brief.md`
  - old: The header summary collapses to counts, the brand shortens to "PicksyOS", and "How this works" opens the orientation inline.
  - new: The header keeps two status cells (Offline, Delayed: icon + word + count), the brand shortens to "PicksyOS", and "Help" opens inline.
- **Pass 7** `product-brief.md`
  - old: | Labels | The disclaimer label "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data." is visible on every screen and at every width. "Illustrative" appears next to every invented value type (targets, hold period). In the Stress test it appears once, on a banner above the queue, not on every row. "Proposed" is always a capitalised tag, never "(proposed)" in brackets. "Proposed" appears on the role switch, the priority rule ("Proposed rule") and actions. "Demo control" appears on simulated events. |
  - new: | Labels | The working screens read like an internal tool: no "Illustrative" or "Proposed" tags on the queue, panel, station or parcel pages. The disclaimer "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data." is a thin footer line on every screen at every width. Help → "About this concept" explains what is invented (Illustrative = invented value · Proposed = invented rule, role or action · Demo control = simulated event), and the tags remain only in Help and in Concept controls. |
- **Pass 7** `product-brief.md`
  - old: | Large queue (Stress test, 47 open) | Queue | One "Illustrative" banner above the queue ("Stress test: 40 invented incidents added."),
  - new: | Large queue (Stress test, 47 open) | Queue | One banner above the queue ("Stress test on: 40 extra incidents added. Concept controls → Reset removes them."),
- **Pass 7** `product-brief.md`
  - old: 6. Find the "Illustrative" and "Proposed" labels and tell concept elements apart from sourced facts.
  - new: 6. Tell concept elements apart from sourced facts, using the footer disclaimer and Help → "About this concept".
- **Pass 7** `operational-model.md`
  - old: In the panel it sits beside a thin bar of contract time used vs. left: "Contract target 4 h" with an "Illustrative" tag, or "Internal target 8 h" with a "Proposed" tag.
  - new: In the panel it sits under a thin bar of contract time used vs. left: "Contract target 4 h" or "Internal target 8 h" (both illustrative, explained in Help).
- **Pass 7** `operational-model.md`
  - old: Header (all views): PicksyOS Operations Console · disclaimer label · network summary
  (P1/P2/P3 open, stations offline, stations signal delayed) · role switch (Proposed) · Demo controls
  - new: Header (all views): PicksyOS Operations Console · network status (stations offline, stations
  signal delayed) · demo clock · Help · Concept controls (role switch, theme, simulated events)
Footer (all views): disclaimer line
- **Pass 7** `evidence.md`
  - old: | H1 | The console's user is a central network operator. | "Proposed role" in the about panel | HYPOTHESIS H1, named as the main risk |
  - new: | H1 | The console's user is a central network operator. | Role switch inside Concept controls (tagged "Proposed") | HYPOTHESIS H1, named as the main risk |
- **Pass 7** `evidence.md`
  - old: | H2 | A fixed catalog of 4 incident types (D3) | "Illustrative" tag on the issue type filter and in each incident's detail | HYPOTHESIS H2 |
  - new: | H2 | A fixed catalog of 4 incident types (D3) | Footer disclaimer and Help → "About this concept" (no tag on working screens) | HYPOTHESIS H2 |
- **Pass 7** `evidence.md`
  - old: | H3 | A set of remote actions plus one action to request a field visit | "Proposed action" on each action button | DESIGN DECISION resting on H3 |
  - new: | H3 | A set of remote actions plus one action to request a field visit | Help → "About this concept" (actions are proposals) | DESIGN DECISION resting on H3 |
- **Pass 7** `evidence.md`
  - old: | H4 | Priority is calculated from contract time, parcels affected and availability | "Illustrative" on every response-time target and countdown, and "Proposed rule" on the priority rule, shown under "Needs attention" and in the "How ranking works" disclosure | DESIGN DECISION resting on H4 |
  - new: | H4 | Priority is calculated from contract time, parcels affected and availability | "Proposed rule" on the full rule in Help → "How ranking works"; targets explained there as illustrative | DESIGN DECISION resting on H4 |
- **Pass 7** `evidence.md`
  - old: | H5 | A hold period of N days, shown as a parcel deadline | "Illustrative hold period" next to every expiry value | HYPOTHESIS H5, flagged as unconfirmed |
  - new: | H5 | A hold period of N days, shown as a parcel deadline | Help → "About this concept" (hold periods are invented) | HYPOTHESIS H5, flagged as unconfirmed |
- **Pass 7** `evidence.md`
  - old: | H6 | Each unit shows a "last seen" time, and stale data is shown as unknown | "Illustrative" on the reporting interval | DESIGN DECISION resting on H6 |
  - new: | H6 | Each unit shows a "last seen" time, and stale data is shown as unknown | Help → "About this concept" | DESIGN DECISION resting on H6 |
- **Pass 7** `evidence.md`
  - old: | H7 | Actions that touch parcels need confirmation, and every action is logged | "Proposed" on the inline confirm and the activity log | DESIGN DECISION resting on H7 |
  - new: | H7 | Actions that touch parcels need confirmation, and every action is logged | Help → "About this concept" | DESIGN DECISION resting on H7 |
- **Pass 7** `evidence.md`
  - old: | H9 | Raw alerts are grouped into one incident | "Illustrative" alert counts | DESIGN DECISION resting on H9 |
  - new: | H9 | Raw alerts are grouped into one incident | Help → "About this concept" | DESIGN DECISION resting on H9 |

Decision (16 Oct 2026, project owner): the working screens must read like the first version of an internal tool, so concept tags were moved off the queue, panel, station and parcel pages. Each assumption above is still disclosed, through the footer disclaimer on every screen and Help → "About this concept".
- **Pass 7** `PRODUCT.md`
  - old: - Concept labels are binding: "Illustrative" on invented value types, "Proposed" on the role switch, the priority rule and actions, "Demo control" on simulated events.
  - new: - The working screens read like v1 of an internal operations tool: no concept tags on the queue, panel, station or parcel pages. What is invented or proposed is disclosed through the footer disclaimer and Help → "About this concept"; the "Illustrative" / "Proposed" / "Demo control" tags remain only in Help and Concept controls.
- **Pass 7** `PRODUCT.md`
  - old: 6. Find the "Illustrative" and "Proposed" labels and tell concept elements apart from sourced facts.
  - new: 6. Tell concept elements apart from sourced facts, using the footer disclaimer and Help → "About this concept".
- **Pass 7** `DESIGN.md`
  - old: - **Header:** everything that belongs to the concept rather than the work (role switch, theme, simulated events) sits in one "Concept controls" menu; a "Supervisor role" tag shows while that role is on. The product name is in Inter 600 with a lime full stop, then the network summary as outlined pills (P1 / P2 / P3 badges, Offline with an err icon, Signal delayed dashed), the mono demo clock, the role switch (a Sunken segmented pill, labeled "Proposed"), the theme toggle and Demo controls. On phone the brand shortens to "PicksyOS." (never cut mid-word), and the header collapses to a 5-column 44 px count row with role, theme and demo controls behind "⋯". The disclaimer stays at 12 px and wraps.
  - new: - **Header:** the product name in Inter 600 with a lime full stop, then network status as outlined pills (Offline with an err icon, Signal delayed dashed), the mono demo clock, Help, and one "Concept controls" menu (role switch, theme, simulated events). A "Supervisor mode" chip shows while that role is on. Band counts are not repeated in the header; they live on the band filter chips. On phone the brand shortens to "PicksyOS." (never cut mid-word), status collapses to two 48 px cells (icon + word + count), and the menu sits behind a drawn "more" icon.
- **Footer:** the disclaimer is one thin Sunken line at the bottom of every screen (12 px, wraps on phone).
- **Pass 7** `DESIGN.md`
  - old: The detail pane while nothing is selected: a Headline, one sentence, then hairline-separated parts. It shows the ranking rule (the same constant the queue uses), the band legend, the label legend and the keys (Mono `kbd` caps with a 2 px base), and ends with the panel's one lime button, "Start with the top incident". It is never a tour or a modal. On phone it opens inline from "How this works" in the header.
  - new: The detail pane while nothing is selected is short: "No incident open", the one lime button "Open the top incident" with the top row's band, type and station, one mono status line, and a key hint. The ranking rule, band legend, keys and "About this concept" live in Help (a popover on desktop, inline on phone).

### First-visit Tour
Three callouts on the real screen, never modal and nothing dimmed: a 2 px focus-coloured ring on the target plus a Surface card ("1 of 3", a 16 px title, one sentence, an ink primary, a quiet "Skip tour"). Esc ends it, it is remembered in the browser, and Help reopens it.
- **Pass 7** `DESIGN.md`
  - old: - **Do** keep the disclaimer bar ("Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data.") visible on every screen at every width.
  - new: - **Do** keep the disclaimer footer line ("Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data.") visible on every screen at every width.
- **Do** keep concept tags (Illustrative, Proposed, Demo control) out of the working screens; they belong in Help and Concept controls.
- **Pass 7** `DESIGN.md`
  - old: - **Caption** (Inter 400, 12 px, 1.4): deadline sources ("Contract target 2 h" with an "Illustrative" tag), action reasons.
  - new: - **Caption** (Inter 400, 12 px, 1.4): deadline sources ("Contract target 2 h"), action reasons.
- **Pass 7** `docs/design-system.md`
  - old: - **Needs attention header:** "Proposed rule" tag. Under it, one line: the summary of the rule, with a "How ranking works" disclosure button that opens the full rule inline. There is no hover-only tooltip.
  - new: - **Needs attention header:** the title, the count and a muted "most urgent first". No rule line and no tags on the working screen; the full rule lives in Help → "How ranking works".
- **Pass 7** `docs/design-system.md`
  - old: - **Orientation pane:** fills the detail pane while no incident is selected (on phone, behind "How this works" in the header). It is reference, not a tour, and has a max width of 640 px:
  1. a heading and one sentence
  2. RankingRule (the same constant as the queue)
  3. the band legend (solid, outlined, hairline)
  4. the label legend
  5. the keys (`kbd`, mono 12 px, Control Line with a 2 px base)
  6. one primary button, "Start with the top incident", which follows live ranking

  Parts are separated by hairlines, with no cards.
  - new: - **Empty pane:** "No incident open", one primary button "Open the top incident" with the live top row (band, type, station), one mono status line ("12 stations · 7 fresh · 4 offline · 1 signal delayed"), and a key hint.
- **Help:** a popover on desktop, inline on phone. It holds RankingRule (the single source of the rule text), the band legend, the keys (`kbd`, mono 12 px, Control Line with a 2 px base), "About this concept" with the Illustrative / Proposed / Demo control legend, and "Show the tour again".
- **First-visit tour:** three callouts on the real screen (queue → top row → recommended action), with a ring on the target and an ink primary. It is not modal and nothing is dimmed. Skip or Esc ends it, and it is remembered in localStorage (`picksy-tour-done`).
- **Pass 7** `docs/design-system.md`
  - old: - **Stress banner:** one Sunken strip above the queue with an Illustrative tag. Rows carry no per-row Illustrative chip.
  - new: - **Stress banner:** one Sunken strip above the queue ("Stress test on: 40 extra incidents added."), with no tags. Rows carry no per-row chip.
- **Pass 7** `docs/design-system.md`
  - old: | Disclaimer | Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data. |
  - new: | Disclaimer (footer line) | Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data. |
| Empty pane | No incident open · Open the top incident |
| Tour | Most urgent first · Open an incident · Do the next step |
| Recommendation label | Recommended next step |
- **Pass 7** `docs/design-system.md`
  - old: - **The disclaimer is visible on every screen at every width.** No Delivery One logo; the product name is plain text.
  - new: - **The disclaimer is visible on every screen at every width,** as a thin footer line. No Delivery One logo; the product name is plain text.
- **Working screens carry no concept tags.** Illustrative / Proposed / Demo control appear only in Help and Concept controls.
- **Pass 7** `docs/design-system.md`
  - old: | Rule summary | Within P1: a waiting recipient goes first for 10 min, then soonest deadline, then most parcels blocked. |
  - new: | Rule summary (Help only) | Within P1: a waiting recipient goes first for 10 min, then soonest deadline, then most parcels blocked. |
- **Pass 7** `DESIGN.md`
  - old: - **Sunken** (#f2f2f2; #1b1e1c in dark): section headers, the disclaimer bar, inline confirms and context notes.
  - new: - **Sunken** (#f2f2f2; #1b1e1c in dark): section headers, the disclaimer footer line, inline confirms and context notes.
- **Pass 7** `docs/design-system.md`
  - old: - **Header:** summary counts, clock and disclaimer always visible. Role switch, theme and simulated events live in one "Concept controls" menu (behind ⋯ on phone). The phone summary cells are icon + word + count, with no Unicode glyphs.
  - new: - **Header:** network status (Offline, Signal delayed), the clock and Help are always visible; band counts are not repeated (they sit on the band filter chips). Role switch, theme and simulated events live in one "Concept controls" menu (behind a drawn "more" icon on phone). The phone status cells are icon + word + count, with no Unicode glyphs. The disclaimer is the footer line.
- **Pass 7** `.impeccable/design.json`
  - old: sidecar generated before passes 1–7 (P1 badge in network summary, "Esc cancels · Proposed", old dos/don'ts)
  - new: regenerated from DESIGN.md: dos/don'ts and named rules re-read, network summary without band counts, queue row with breach edge and bold deciding reason, "Esc to cancel"
- **Pass 8** `operational-model.md`
  - old: DESIGN DECISION D11: supervisor approval is required only for irreversible actions. In this catalog, Mark for return is the only one. Every other action can be undone (Reopen, Cancel field visit, Return to service) or is harmless to repeat. The prototype includes an Operator / Supervisor role switch, labeled "Proposed". With the Operator role, Mark for return shows a lock and the text "Supervisor approval needed". An approval request flow is LATER.
  - new: DESIGN DECISION D11: supervisor approval is required only for irreversible actions. In this catalog, Mark for return is the only one. Every other action can be undone (Reopen, Cancel field visit, Return to service) or is harmless to repeat. The prototype includes an Operator / Supervisor role switch, labeled "Proposed". With the Operator role, Mark for return shows a lock and the text "Supervisor approval needed". An approval request flow is LATER. The recommended action follows the role (16 Oct 2026): for an Operator, Pickup window expired recommends "Extend hold +2 days", with the reason "Hold period ended 09:00. Marking it for return needs a supervisor."; Mark for return stays visible as a locked secondary action. For a Supervisor it recommends Mark for return.
- **Pass 8** `operational-model.md`
  - old: | INC-108 | Pickup window expired | LIT-02 | Open | 09:00 | 17:00 (internal 8 h) | P3 | Hold expired (illustrative hold period) | 0 | Hold period ended 09:00 (1) | Mark for return |
  - new: | INC-108 | Pickup window expired | LIT-02 | Open | 09:00 | 17:00 (internal 8 h) | P3 | Hold expired (illustrative hold period) | 0 | Hold period ended 09:00 (1) | Extend hold +2 days (Operator) · Mark for return (Supervisor) |
- **Pass 8** `product-brief.md`
  - old: 3. The action bar shows "Extend hold +2 days" (enabled, inline confirm) and "Mark for return", which is disabled with a lock and "Supervisor approval needed".
  - new: 3. The recommendation is "Extend hold +2 days" (enabled, inline confirm), with the reason "Hold period ended 09:00. Marking it for return needs a supervisor." Under it, "Mark for return" is a secondary action, disabled with a lock and "Supervisor approval needed".
- **Pass 8** `product-brief.md`
  - old: 4. Hovering or focusing the locked button shows "Irreversible: the parcel leaves the recipient's reach. Needs a supervisor. In this concept, use the role switch to try it." An approval request flow is LATER.
  - new: 4. Hovering or focusing the locked button shows "Irreversible: the parcel leaves the recipient's reach. Needs supervisor approval." An approval request flow is LATER.
- **Pass 8** `product-brief.md`
  - old: 5. The operator either extends the hold (resolved), or switches the role to Supervisor and uses Mark for return (inline confirm, then resolved).
  - new: 5. The operator either extends the hold (resolved), or switches the role to Supervisor (Concept controls), where Mark for return becomes the recommendation (inline confirm, then resolved).
- **Pass 8** `product-brief.md`
  - old: | 6 | Panel: recommended action and action bar | recommended action with one line of reason, then the other allowed actions for this type and state. Disabled actions show their reason. Inline confirm opens directly under the action. When the recommended action is locked for the current role, it shows as a locked card ("Mark for return · needs supervisor" plus its reason), followed by "You can" and the first available action as the primary. | per the catalog |
  - new: | 6 | Panel: recommended action and action bar | recommended action with one line of reason, then the other allowed actions for this type and state. Disabled actions show their reason. Inline confirm opens directly under the action. The recommendation follows the role, so it is always an action the current user can take; an action that needs another role stays visible as a locked secondary with its reason. | per the catalog |
- **Pass 8** `product-brief.md`
  - old: | Keyboard | ↑/↓ move through the queue, Enter opens, A acknowledges, R runs the recommended action (it opens the inline confirm if the action has one), Esc closes a confirm or the panel, and G Q returns to the queue. The keys are listed in Help, and Acknowledge and the recommended action show their key ("Shortcut: A", "Shortcut: R") in their tooltip. Focus moves to the panel heading when a row is opened. |
  - new: | Keyboard | ↑/↓ move through the queue, Enter opens, A acknowledges, R runs the recommended action (it opens the inline confirm if the action has one), Esc closes a confirm or the panel, and G Q returns to the queue. The keys are listed in Help, and Acknowledge and the recommended action show their key ("Shortcut: A", "Shortcut: R") in their tooltip. Focus moves to the panel heading when a row is opened, and returns to the row when Esc closes the panel; closing a confirm, Help, Concept controls or the tour returns focus to where it was. Single-key shortcuts (A, R, g q) only act from the queue or panel and can be turned off in Help (WCAG 2.1.4). Arrows move the selection only from the queue or the panel heading, so they still scroll the panel. |
- **Pass 8** `product-brief.md`
  - old: | No permission | Action bar (Mark for return, INC-108, parcel PCL-0301) | In the panel, a locked recommendation card "Mark for return · needs supervisor" with its reason, then "You can" with Extend hold as the primary. The locked button keeps "Supervisor approval needed" and a tooltip that opens below it. | Use Extend hold, or switch role (demo) |
  - new: | No permission | Action bar (Mark for return, INC-108, parcel PCL-0301) | For an Operator the recommendation is Extend hold; Mark for return is a locked secondary with "Supervisor approval needed" and a tooltip that never covers another action | Use Extend hold, or switch role (demo) |
- **Pass 8** `product-brief.md`
  - old: | Phone width (under 768 px) | The queue is full width, and opening a row shows the panel as a full page with a "Back to queue" button. The header keeps two status cells (Offline, Delayed: icon + word + count), the brand shortens to "PicksyOS", and "Help" opens inline. The type and band chips fold into one "Filters" disclosure ("Filters (n)" when n are active), so the first incident is visible without scrolling. This also applies at 200 % zoom on desktop. The action bar sticks to the bottom of the screen, and an open inline confirm stays at about 200 px or less: long consequence text scrolls inside it, and Confirm and Cancel stay visible. No horizontal scroll. |
  - new: | Phone width (under 768 px) | The queue is full width, and opening a row shows the panel as a full page with a "Back to queue" button. The header keeps two status cells (Offline, Delayed: icon + word + count), the brand shortens to "PicksyOS", and "Help" opens inline. The type and band chips fold into one "Filters" disclosure ("Filters (n)" when n are active), so the first incident is visible without scrolling. This also applies at 200 % zoom on desktop. The action bar sticks to the bottom of the screen, and an open inline confirm stays at about 200 px or less: long consequence text scrolls inside it, and Confirm and Cancel stay visible. The sticky sheet never takes more than about 45 % of the view (it scrolls inside), tooltips flow in the layout instead of covering actions, and every tap target is at least 44 px. No horizontal scroll. |
- **Pass 8** `docs/design-system.md`
  - old: - **Locked recommendation:** used when the recommended action needs another role. It is a dashed sunken card with the title "Mark for return · needs supervisor", the reason, and the locked button ("Supervisor approval needed", with a tooltip that opens below). Then the label "You can", followed by the first available action as the primary.
  - new: - **Per-role recommendation:** the recommended action is always one the current role can take (Operator on Pickup window expired: Extend hold). An action that needs another role stays in the action row as a locked secondary (dashed outline, padlock, "Supervisor approval needed"); its tooltip opens below and right-aligned for later actions, and inline on phone, so it never covers another action. The dashed locked card is kept only as a fallback for a recommendation that cannot be re-targeted.
- **Focus:** queue rows show the focus ring over selected and breached states (inset, 2 px plus halo). Focus returns to its origin when a confirm, the panel (back to the row), Help, Concept controls or the tour closes. Popovers close when focus leaves them.
- **Keys:** single-key shortcuts can be turned off in Help (`picksy-shortcuts`), and they never fire from the header, popovers or the tour.
- **Targets:** on phone every tappable element is at least 44 px, links included.
- **Pass 8** `docs/design-system.md`
  - old: | Locked recommendation | Mark for return · needs supervisor |
  - new: | Locked secondary (Operator) | Mark for return · Supervisor approval needed · tooltip: Irreversible: the parcel leaves the recipient's reach. Needs supervisor approval. |
- **Pass 8** `DESIGN.md`
  - old: When the recommended action needs another role: a dashed Sunken card, "Mark for return · needs supervisor", its reason and the locked button (tooltip opens below it), then "You can" with the first available action as the primary.
  - new: The recommendation follows the role, so the one lime button is always doable. An action that needs another role stays in the row as a locked secondary (dashed Control Line, padlock, a reason line, and a tooltip that never covers another action). The dashed Sunken locked card remains only as a fallback.
- **Pass 8** `DESIGN.md`
  - old: - **Do** pair every status hue with an icon and a word.
  - new: - **Do** pair every status hue with an icon and a word.
- **Do** keep the focus ring visible on every state (selected and breached rows included), and return focus to its origin whenever something closes.
- **Pass 9** `operational-model.md`
  - old: **Why reasons:** every rule that matches is shown, not only the first one. The deciding reason, which is the first rule that matched the incident's band (P1: recipient waiting, then breach or 30 min or less, then no pickups with 10 or more blocked; P2: no pickups, then 2 h or less, then 1 or more blocked), comes first and is shown in medium weight. The rest follow in this order.
  - new: **Why reasons:** every rule that matches is shown, not only the first one. The deciding reason, which is the first rule that matched the incident's band (P1: recipient waiting, then breach or 30 min or less, then no pickups with 10 or more blocked; P2: no pickups, then 2 h or less, then 1 or more blocked), comes first and is shown in medium weight. The rest follow in this order. In a queue row the deadline reason ("Deadline in …" / "Breached …") is left out unless it is the deciding reason, because the countdown sits in the same row; the incident panel lists every reason.
- **Pass 9** `product-brief.md`
  - old: 2. **Spot the top incident.** The first row under "Needs attention" is INC-101: P1, Retrieval failure, WAL-01 Istanbul, with the why line "Recipient waiting at station · Deadline in 1h 56m · 1 parcel blocked" (the deciding reason, "Recipient waiting at station", first and in medium weight). It ranks above the breached INC-102 because of the recipient-waiting rule (D10).
  - new: 2. **Spot the top incident.** The first row under "Needs attention" is INC-101: P1, Retrieval failure, WAL-01 Istanbul, with the why line "Recipient waiting at station · 1 parcel blocked" (the deciding reason first, in medium weight) and the countdown "1h 56m" in the right column. The panel's "Why P1" lists every reason, including "Deadline in 1h 56m". It ranks above the breached INC-102 because of the recipient-waiting rule (D10).
- **Pass 9** `product-brief.md`
  - old: | Stale data (signal delayed) | Queue header count, station, parcel | "Signal delayed · as of 13:54 (6 min ago)", values greyed out, availability Unknown. No incident is created. | Watch. Becomes Offline at 10 min. |
  - new: | Stale data (signal delayed) | Queue header count, station, parcel | The "Signal delayed" chip with the stamp "as of 13:54 (6 min ago)", values greyed out, availability Unknown. No incident is created. | Watch. Becomes Offline at 10 min. |
- **Pass 9** `product-brief.md`
  - old: | No incidents | Queue | The "Needs attention" section reads "Nothing needs attention. 11 stations fresh · 1 signal delayed." (computed from station states) The In hand and Resolved sections stay visible. | Open resolved incidents, or Reset (demo) |
  - new: | No incidents | Queue | The "Needs attention" section reads "Nothing needs attention. 11 stations fresh · 1 signal delayed." (computed from station states) The In hand and Resolved sections stay visible, the filter chips are hidden (every count would be 0), and the right pane reads "All clear. New incidents appear at the top of the queue." | Open resolved incidents, or Reset (demo) |
- **Pass 9** `docs/design-system.md`
  - old: - **Space:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
  - new: - **Space:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. `app.css` uses `var(--space-n)` and `var(--radius-*)` for every on-scale padding, margin, gap and corner (152 values, verified pixel-identical against screenshots taken before the change); off-scale and negative values stay raw.
- **Pass 9** `docs/design-system.md`
  - old:   - **Why line:** up to 2 lines, with the deciding reason first in medium weight.
  - new:   - **Why line:** up to 2 lines, with the deciding reason first in medium weight. A deadline reason is left out of the row unless it is the deciding one; the countdown column carries it.
- **Pass 9** `docs/design-system.md`
  - old: | Empty pane | No incident open · Open the top incident |
  - new: | Empty pane | No incident open · Open the top incident · (empty queue) All clear. New incidents appear at the top of the queue. |
- **Pass 9** `docs/design-system.md`
  - old: | Deadline bar (spoken) | 1 hour 56 minutes left of 2 hours · Breached by 15 minutes |
  - new: | Deadline bar (spoken) | 1 hour 56 minutes left of 2 hours · Breached by 15 minutes |
| Freshness (delayed) | Signal delayed (chip) · as of 13:54 (6 min ago) (stamp) |
- **Pass 9** `docs/design-system.md`
  - old: - **Header:** network status (Offline, Signal delayed), the clock and Help are always visible; band counts are not repeated (they sit on the band filter chips). Role switch, theme and simulated events live in one "Concept controls" menu (behind a drawn "more" icon on phone). The phone status cells are icon + word + count, with no Unicode glyphs. The disclaimer is the footer line.
  - new: - **Header:** network status (Offline, Signal delayed), the clock and Help are always visible; band counts are not repeated (they sit on the band filter chips). Role switch, theme and simulated events live in one "Concept controls" menu (behind a drawn "more" icon on phone). The phone status cells are icon + word + count, with no Unicode glyphs. The disclaimer is the footer line. The saved theme is applied by an inline script in `index.html` before the app renders, so dark theme never flashes light.
- **Pass 9** `DESIGN.md`
  - old: The ledger line. A three-column grid: the band badge (or a status icon outside Needs attention), the type with the station ID, city and incident ID, then the mono countdown aligned right. Below it sit the why line (two lines at most, the deciding reason first in medium weight) and the chips. Above the rows, "Needs attention" carries a "Proposed rule" tag and a one-line rule with a "How ranking works" disclosure; the rule is never hover-only. Selected rows get Pilot-Light Soft with a 1.5 px Pilot-Light Green inner outline. Rows that change section or band flash Moved Tint for 1.6 s (held 2 s under reduced motion).
  - new: The ledger line. A three-column grid: the band badge (or a status icon outside Needs attention), the type with the station ID, city and incident ID, then the mono countdown aligned right. Below it sit the why line (two lines at most, the deciding reason first in medium weight) and the chips. Above the rows, "Needs attention" carries a "Proposed rule" tag and a one-line rule with a "How ranking works" disclosure; the rule is never hover-only. Selected rows get Pilot-Light Soft with a 1.5 px Pilot-Light Green inner outline. Rows that change section or band flash Moved Tint for 1.6 s (held 2 s under reduced motion). A deadline reason is not repeated in the why line unless it is the deciding one, since the countdown sits in the same row.
- **Field task** `operational-model.md`
  - old: | **Service task** | id, incidentId, stationId, reason, status, `requestedAt`, `dueAt` (= incident `deadlineAt`) | belongs to one Incident |
  - new: | **Service task** | id, incidentId, stationId, stage (Requested, Accepted, On site, Completed, Cancelled; Proposed, D17), `requestedAt`, `acceptedAt`, `onSiteAt`, `completedAt`, `dueAt` (= incident `deadlineAt`), `requestedBy`, note (optional, sent with the request) | belongs to one Incident. One open task per incident; two incidents on one station have one task each. |
- **Field task** `operational-model.md`
  - old:   AwaitingField --> Resolved: field task completed
  AwaitingField --> Acknowledged: Cancel field visit
  - new:   AwaitingField --> Resolved: field task completed (last task stage)
  AwaitingField --> Acknowledged: Cancel field visit (task Requested or Accepted)
  AwaitingField --> Recovered: condition clears on its own (the task stays open until cancelled)
- **Field task** `operational-model.md`
  - old: | Awaiting field service | the service task and its due time, counting down | no, only monitoring | In hand |
  - new: | Awaiting field service | the service task, its stage and its due time, counting down | no, only monitoring (cancel while Requested or Accepted) | In hand |
- **Field task** `operational-model.md`
  - old: | Request field visit | Operator | yes | Open or Acknowledged, and no action running | Service task created. The incident moves to Awaiting field service. | stays as it was, with "request not sent" |
| Cancel field visit | Operator | yes | Awaiting field service | Task cancelled. The incident moves to Acknowledged. | stays as it was |
  - new: | Request field visit | Operator | yes: the confirm is the request itself (station, problem, impact, due, optional note to the field team), sent with "Talebi gönder" (Send request) | Open or Acknowledged, and no action running | Service task created in stage Requested. The incident moves to Awaiting field service. | stays as it was, with "Gönderilemedi. Hiçbir şey değişmedi." (Could not send. Nothing changed.) and Retry; no task is created |
| Cancel field visit | Operator | yes, with a required reason | Awaiting field service or Recovered, and the task is Requested or Accepted (not once the technician is On site) | Task cancelled, reason logged. An Awaiting field service incident moves to Acknowledged; a Recovered one stays Recovered. | stays as it was |
- **Field task** `operational-model.md`
  - old: | *Field task completed* | Field (simulated event, labeled "Demo control") | n/a | Awaiting field service | Resolved. The station fault is cleared. The station is Online, unless it is Out of service, in which case an operator must Return to service. Parcels are unblocked once the station is Online. | n/a (this is an event, not an operator action) |
  - new: | *Field task stages* | Field service (simulated, D17) | n/a | an open task | Requested → Accepted happens on its own 10 s after the request (illustrative). Accepted → On site and On site → Completed are advanced by "Demo kontrolleri → Saha görevini ilerlet" (Demo controls → Advance field task). Each simulated step is logged with the tag "Simüle" (Simulated). | n/a (these are events, not operator actions) |
| *Field task completed* | Field service (simulated, labeled "Demo control") | n/a | task On site | Resolved by "Saha ekibi" (Field service). The station fault is cleared and the log reads "İstasyon yeniden çevrimiçi" (Station back online). The station is Online, unless it is Out of service, in which case an operator must Return to service. Parcels are unblocked once the station is Online. If the incident is not on screen, a toast reads "INC-102 kapandı · LIT-03 yeniden çevrimiçi" with View. | n/a (this is an event, not an operator action) |

Closing a Recovered incident ("Onayla ve kapat") that still has an open field task also cancels the task, and the log says so. Nothing about the field team is invented: no technician names, contacts, tracking or arrival estimates; the team is only "Saha ekibi" (Field service).
- **Field task** `product-brief.md`
  - old: 4. Click "Request field visit". An inline confirm reads "Creates a field task due 13:45, already breached. Contract target 4 h (illustrative)."
5. Click Confirm. The status changes to Awaiting field service, and the row moves to "In hand" showing "Field task FT-0xx · breached".
6. To finish the demo, "Demo controls → Complete field task" resolves the incident and brings LIT-03 back Online. Its 18 parcels return to Ready.
  - new: 4. Click "Request field visit". The inline confirm is the request itself: İstasyon "LIT-03 · Lite · Ankara · Müşteri B", Sorun "09:35 itibarıyla çevrimdışı · LTE yedeğinden yanıt yok (14:00)" (built from the signals and the last failed action), Etki "18 paket engelli · teslim alma yapılamıyor", Son süre "13:45 · Sözleşme hedefi 4 sa", then "Süre 15 dk önce aşıldı. Daha erken bir zaman yok." (Already breached by 15 min. No earlier time exists.) and an optional note to the field team. Buttons: "Talebi gönder" (Send request) and Cancel; Esc cancels.
5. Click Send request. The status changes to Awaiting field service, the result reads "FT-032 saha görevi gönderildi. Son süre 13:45 (zaten aşıldı).", and a task card appears in the decision zone: "Saha görevi FT-032" with its stage chip, the stage line Talep edildi ✓ 14:00 · Kabul edildi · Sahada · Tamamlandı, the due countdown and contract-time bar (same component and breach style as the incident deadline), "Talep eden: Siz · 14:00", the note, and "Saha ziyaretini iptal et" (Cancel field visit, inline confirm with a required reason). The row moves to "In hand" and reads "FT-032 · Talep edildi · son süre 13:45", keeping the breach edge. 10 s later field service accepts it (simulated): the card, the row and the station banner read "Kabul edildi".
6. To finish the demo, "Demo controls → Advance field task" moves the task to On site (cancel is then no longer offered) and then to Completed. That resolves the incident and brings LIT-03 back Online; its 18 parcels return to Ready, Offline drops by 1 and the incident moves to Resolved today. Meanwhile the station page shows "Saha ziyareti FT-032 · Kabul edildi · son süre 13:45" with "İstasyon yeniden çevrimiçi olduğunda paketlerin engeli kalkar.", and a blocked parcel's page shows "FT-032 saha ziyareti bekleniyor".
- **Field task** `product-brief.md`
  - old: Concept controls: role switch, theme, Reset, Complete field task, Stress test, Fail next submit.
  - new: Concept controls: role switch, theme, Reset, Advance field task (On site, then Completed; acceptance happens on its own), Stress test, Fail next submit.
- **Field task** `evidence.md`
  - old: Approval conditions, checked against `operational-model.md`:
  - new: - DESIGN DECISION D17 (16 Oct 2026): Field task stages (Requested → Accepted → On site → Completed, plus Cancelled from Requested or Accepted) are Proposed and simulated. The real field-service process is unknown (open question 6). Acceptance is simulated 10 s after the request (illustrative); the later stages are advanced by a demo control; every simulated step is tagged "Simulated" in the timeline. The request shows only what the model already knows (station, problem from signals and the last failed action, impact, due time). No technician names, contacts, vehicle tracking, maps, arrival estimates or SLA statistics are shown; the team is only "Field service".

Approval conditions, checked against `operational-model.md`:
- **Field task** `docs/design-system.md`
  - old: - **Inline confirm:** a sunken 10 px block
  - new: - **Field task card:** a Sunken block inside the decision zone, flat (no border, no shadow) and with no lime. Header "Saha görevi FT-0xx" with a stage chip (hue + icon + word: Talep edildi clock, Kabul edildi ack, Sahada a drawn pin, Tamamlandı check). The stage line reuses the step-bar component (done with time, the next stage marked "bekleniyor", the rest muted). The due countdown and contract-time bar are the incident's own components and breach style. Then "Talep eden" and the note, the hint "Sizden işlem gerekmiyor.", and "Saha ziyaretini iptal et" as a secondary button whose inline confirm needs a reason. After the station recovers on its own, the card asks "İstasyon kendiliğinden düzeldi. Saha ziyareti iptal edilsin mi?". Simulated timeline steps carry a neutral dashed "Simüle" tag, never the success tint. On narrow cards the step sub-lines give way to one line naming the current step.
- **Field visit request confirm:** the inline confirm lists İstasyon, Sorun, Etki and Son süre (breached in err), then the consequence sentence and an optional note; its ink button reads "Talebi gönder".
- **Inline confirm:** a sunken 10 px block
- **Case study page** `product-brief.md`
  - old: 1. **Open the console.** The queue view loads with no incident selected.
  - new: 0. **Read the case study.** The first screen (`#/`) is the case study page: problem, what was done, three decisions, the operator flow, the console, the engineering handoff and where it stands, with "Konsolu aç" / "Canlı prototipi aç →" leading to the console. The demo clock stands still while it is open, and console shortcuts do nothing there.
1. **Open the console** (`#/queue`). The queue view loads with no incident selected.
- **Case study page** `docs/design-system.md`
  - old: - **Field task card:**
  - new: - **Case study page (`#/`):** the first screen, outside the console shell. It follows the author's portfolio case format, not the console tokens: warm paper `#faf8f4`, Source Serif 4 headings (62 / 26 / 18 px), IBM Plex Sans body 17/1.6, one 672 px column, 1 px hairline sections with 44 px padding, figures in a 10 px hairline frame with italic one-line captions, a blue text link and a blue primary button. Figures are real screenshots from the build; the operator-flow figure is HTML drawn in the console's own visual system, with the build's task stage labels. The disclaimer sits under the role line.
- **Field task card:**
