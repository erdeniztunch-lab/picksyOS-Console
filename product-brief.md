# Product brief: PicksyOS Operations Console (concept)

An independent concept. It does not describe a Delivery One tool, and it uses no Delivery One data. Hypothesis IDs (H1 to H10) refer to `docs/evidence.md`.

## Problem statement

Delivery One says every unit is "monitored remotely around the clock", that "most issues" are resolved remotely, and that a field visit must arrive within each customer's contracted response time (FACT, S2). Monitoring produces signals. Someone has to turn those signals into decisions: what to look at first, whether it can be fixed from a screen, and whether to send a technician before the contract deadline passes. No public material shows how that is done (OBSERVATION).

The concept problem: **a remote operator needs to see, in one place, which station issues are blocking parcels right now, how close each one is to a contract deadline, and what fix to try next.**

## Primary user and job to be done

| Candidate | For | Against |
|---|---|---|
| **Central remote operations team** | Remote monitoring is around the clock (S2). The site names a "remote operations team" (S6). Remote fixes come first and field visits are contracted (S2). | It is not stated who watches the stations (H1). |
| Customer or carrier staff | They already have a "dashboard" (S1). | They see their own units, have limited remote actions, and are not the party bound by the service contract. |
| Field technician | Field visits are a FACT (S2). | They act after dispatch, not during triage. A mobile task view is a separate product. |

**Primary user (HYPOTHESIS H1):** an operator on Delivery One's central remote operations team, watching stations across all customers during a shift.

**Job to be done (HYPOTHESIS):** "When a station reports a problem, help me decide quickly whether parcels are blocked, how close we are to breaching the customer's response time, and what to do, so I fix it remotely when I can and dispatch field service only when I must."

## Decisions the user makes

1. Is this a real, current problem, or stale or duplicate data?
2. Which issue goes first?
3. Can it be fixed remotely, and with which action?
4. Did the fix work? If not, should I retry or escalate?
5. Does this need a field visit, and how urgently?
6. When is it safe to close?

**If an issue is ignored (HYPOTHESIS):** recipients cannot collect parcels, couriers cannot drop off, the contracted response time is breached, and uncollected parcels may go to returns (H5).

## Incident types in scope

All types are "Illustrative" (H2). Each one is tied to a publicly documented capability.

| Type | Why include it |
|---|---|
| Station offline | Connectivity is listed for every station (LTE, Ethernet, Bluetooth offline mode). Going offline blocks every parcel at once and tests how stale data is handled (H6). |
| Retrieval failure (parcel not delivered to hatch) | Wall and Pro dispense robotically and have a light curtain at the hatch (S4, S5). A recipient is standing at the station. This is the most time-critical case and the clearest choice between a remote fix and a field visit. |
| Pickup code notification failed | Codes are sent by SMS or email (S2, S3). The parcel is fine, but the recipient cannot know it is there. It has a clear remote fix (resend). |
| Pickup window expired | Parcel-level and slow-burning. It contrasts with the urgent types. It rests on H5 (low confidence), so it is labeled "Illustrative hold period" and is always P3 (D13). |

Capacity critical: LATER. Stock balancing exists (S1), but there is no public detail on how it works.

## Value proposition

One queue ranks station issues by a visible rule (time to contract deadline, parcels blocked, whether the station can still serve pickups). Each issue opens to its affected parcels and a recommended next action, so an operator can go from alert to fix or dispatch without switching tools.

## Scope

**MUST (about 1.5 days of build, front end with illustrative mock data, no back end)**

| Feature | Q1 Now | Q2 Why/urgent | Q3 Act |
|---|---|---|---|
| Incident queue sorted by a visible priority rule, with type and band (P1 to P3) filters. Status is shown by queue section. | ● | ● | |
| Priority reason on each row: response-time countdown, parcels blocked, availability | | ● | |
| Data freshness: "last seen" per station, with stale data shown as unknown | ● | ● | |
| Related signals grouped under one incident, with a count | ● | | |
| Incident detail: timeline, affected parcels, recommended next action | | ● | ● |
| Remote actions with confirmation (parcel-affecting) and in-progress, success and failed states | | | ● |
| Request field visit | | | ● |
| Statuses (open, acknowledged, in progress, awaiting field service, recovered, resolved) plus an activity log. See `operational-model.md`. | ● | | ● |
| Station detail: health, open incidents, parcels held | ● | ● | |
| Parcel detail: status, notification history, deadline, resend code | | ● | ● |

**If time runs short:** cut the "large queue" (Stress test) and "no permission" (role switch) edge states first.

**LATER:** capacity incidents, vehicle (Street, Air) incidents with hand-off (H8), map view, assignment and escalation, shift handover notes, customer notification, bulk actions, search, trends and reporting, a field technician mobile view.

**Non-goals:** live vehicle control, a customer-facing dashboard (H10), real integrations or data, authentication, and any claim about Delivery One's actual workflow.

## Prototype: 3 views

1. **Queue with incident detail** (split pane, the default screen)
2. **Station detail**
3. **Parcel detail**

**Edge states it must show:** an empty queue, a stale or not-reporting station, a remote action in progress, a remote action that failed, a breached response time (negative countdown), an incident that recovers on its own while open, two incidents on one station, and one parcel affected by two incidents.

## Success criteria for the prototype

A reviewer, without guidance, can:

1. Name the top incident and explain why it ranks first, using only what is on screen.
2. Open it and see which parcels are blocked and the time left before breach.
3. Run a remote action, see it fail, and then request a field visit.
4. Tell a stale station apart from a healthy one.
5. Resolve an incident and see the queue update.
6. Tell concept elements apart from sourced facts, using the footer disclaimer and Help → "About this concept".

These are criteria for the design to meet. No usability testing has been done.

---

## Screens and interactions

Everything in this section is a DESIGN DECISION unless tagged otherwise. Field names come from `operational-model.md`, and the example values come from its section 8 (Sample content). No visual styling is set here.

### Primary flow: clear the top incident (3 clicks from the queue to resolved)

1. **Open the console.** The queue view loads with no incident selected. The header shows network status, Offline 4 · Signal delayed 1, and the band filter chips show P1 2 · P2 2 · P3 3. On a first visit, a 3-step tour points at the queue, the top row and the next-step button.
2. **Spot the top incident.** The first row under "Needs attention" is INC-101: P1, Retrieval failure, WAL-01 Istanbul, with the why line "Recipient waiting at station · 1 parcel blocked" (the deciding reason first, in medium weight) and the countdown "1h 56m" in the right column. The panel's "Why P1" lists every reason, including "Deadline in 1h 56m". It ranks above the breached INC-102 because of the recipient-waiting rule (D10).
3. **Open it (click 1).** The incident panel opens on the right and the row is highlighted.
4. **Understand the context.**
   - The header shows the type, the station link (WAL-01 · Degraded), P1 with all its reasons, the status (Open), and the deadline "1h 56m" with a contract-time bar and its source, "Contract target 2 h" tagged "Illustrative".
   - Below it is the recommended action, "Retry dispense", with the reason "Recipient code accepted, parcel did not reach hatch".
   - Then the affected parcel PCL-0107 · Slot 3-14, 3 grouped signals, and the timeline.
5. **Take the action (click 2).** Clicking "Retry dispense" opens an inline confirm: "Moves PCL-0107 to the hatch at WAL-01. The recipient may be waiting."
6. **Confirm (click 3).** The action runs. The button reads "Retrying dispense…", the other actions are disabled, the status is "Action in progress", and the row moves to "In hand".
7. **See the result.** An inline result reads "Parcel delivered to hatch. Incident resolved. Moved to Resolved today." with a "Show in queue" link that opens that section and scrolls to the row. The status changes to Resolved, PCL-0107 is Picked up, WAL-01 is Online, and the timeline gains 3 events.
8. **Confirm the queue updated.** The row moves to "Resolved today", and P1 drops to 1. INC-102 is now the top row. The panel stays on INC-101 until the operator picks another row.

### Secondary flow A: an action fails and the operator escalates (INC-102)

1. Open INC-102 (P1, "Breached 15 min ago · No pickups possible · 18 parcels blocked").
2. Click "Switch to backup connection". There is no confirm, per the catalog. It runs ("Switching to backup…").
3. It fails. The inline error reads "Backup did not respond. Next: request a field visit." Retry is a quiet text link. The status changes to Acknowledged (owner: You), and the recommendation updates to "Request field visit", which is now the only primary button.
4. Click "Request field visit". The inline confirm is the request itself: İstasyon "LIT-03 · Lite · Ankara · Müşteri B", Sorun "09:35 itibarıyla çevrimdışı · LTE yedeğinden yanıt yok (14:00)" (built from the signals and the last failed action), Etki "18 paket engelli · teslim alma yapılamıyor", Son süre "13:45 · Sözleşme hedefi 4 sa", then "Süre 15 dk önce aşıldı. Daha erken bir zaman yok." (Already breached by 15 min. No earlier time exists.) and an optional note to the field team. Buttons: "Talebi gönder" (Send request) and Cancel; Esc cancels.
5. Click Send request. The status changes to Awaiting field service, the result reads "FT-032 saha görevi gönderildi. Son süre 13:45 (zaten aşıldı).", and a task card appears in the decision zone: "Saha görevi FT-032" with its stage chip, the stage line Talep edildi ✓ 14:00 · Kabul edildi · Sahada · Tamamlandı, the due countdown and contract-time bar (same component and breach style as the incident deadline), "Talep eden: Siz · 14:00", the note, and "Saha ziyaretini iptal et" (Cancel field visit, inline confirm with a required reason). The row moves to "In hand" and reads "FT-032 · Talep edildi · son süre 13:45", keeping the breach edge. 10 s later field service accepts it (simulated): the card, the row and the station banner read "Kabul edildi".
6. To finish the demo, "Demo controls → Advance field task" moves the task to On site (cancel is then no longer offered) and then to Completed. That resolves the incident and brings LIT-03 back Online; its 18 parcels return to Ready, Offline drops by 1 and the incident moves to Resolved today. Meanwhile the station page shows "Saha ziyareti FT-032 · Kabul edildi · son süre 13:45" with "İstasyon yeniden çevrimiçi olduğunda paketlerin engeli kalkar.", and a blocked parcel's page shows "FT-032 saha ziyareti bekleniyor".

### Secondary flow B: an incident owned by someone else (INC-105)

1. The INC-105 row shows the owner chip "Operator B".
2. In the panel, a notice above the action bar reads "Acknowledged by Operator B at 13:40."
3. Click "Switch to backup connection". An inline ownership notice opens: "Owned by Operator B since 13:40. Taking over is logged." The options are "Take over and continue" and Cancel.
4. Click "Take over and continue". The owner becomes You, the log reads "Taken over from Operator B", and the action runs.
5. Backup fails (the signals already show "Mains power lost"). The operator requests a field visit, as in flow A from step 4.

### Secondary flow C: an operator without permission (INC-108)

1. The role switch in the header is set to Operator, the default.
2. Open INC-108 (P3, "Hold expired (illustrative hold period)").
3. The recommendation is "Extend hold +2 days" (enabled, inline confirm), with the reason "Hold period ended 09:00. Marking it for return needs a supervisor." Under it, "Mark for return" is a secondary action, disabled with a lock and "Supervisor approval needed".
4. Hovering or focusing the locked button shows "Irreversible: the parcel leaves the recipient's reach. Needs supervisor approval." An approval request flow is LATER.
5. The operator either extends the hold (resolved), or switches the role to Supervisor (Concept controls), where Mark for return becomes the recommendation (inline confirm, then resolved).

### Screen specs

#### View 1: Queue with incident panel (default, `/queue?incident=ID`)

**Purpose:** see what needs attention and act on it without leaving the screen. **Answers:** Q1, Q2 and Q3.

| Order | Block | Data | Actions |
|---|---|---|---|
| 1 | Header (all views) | Product name (plain text, no Delivery One logo, D14), network status (stations Offline, stations Signal delayed), the demo clock, Help, and one "Concept controls" menu holding the role switch, the theme toggle and the simulated events. The P1/P2/P3 counts are not repeated here; they sit on the band filter chips. The disclaimer "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data." is a thin footer line on every screen. | Help: ranking rule, band legend, keys, what is invented, "Show the tour again". Concept controls: role switch, theme, Reset, Advance field task (On site, then Completed; acceptance happens on its own), Stress test, Fail next submit. While the Supervisor role is on, a "Supervisor mode" chip shows next to the menu. Clicking Offline applies that filter. Clicking Signal delayed opens the delayed station, because signal delay has no incident to filter. |
| 2 | Filter bar | Type chips (4 types) and band chips (P1, P2, P3), each with a count | Toggle a chip, Clear filters |
| 3 | Queue sections | **Needs attention** (ranked, Open and Acknowledged) · **In hand** (In progress and Awaiting field service, sorted by `deadlineAt`) · **Recovered: confirm to close** · **Resolved today** (collapsed). Each section header shows its count. Under "Needs attention", one line states the order within P1 ("Within P1: a waiting recipient goes first for 10 min, then soonest deadline, then most parcels blocked."), tagged "Proposed rule". | Click a row to select it. Expand or collapse a section. "How ranking works" opens the full rule inline. |
| 3a | Queue row (accessible name "P1, Retrieval failure, WAL-01, deadline in 1 hour 56 minutes" or "…, breached by 15 minutes"; the why line is its description) | band, type, station id and city, why line (max 2 lines; the deciding reason first, in medium weight), deadline countdown with a breach state, owner chip if the owner is not You, status chip if not Open, freshness icon if the station's signal is delayed | the whole row is clickable |
| 4 | Panel: incident header | id, type, station (link) with station state, band, all reasons, status, owner, `openedAt`, deadline with its source | Acknowledge (when Open) |
| 5 | Panel: result area | the latest action result (success or failure) or ownership notice. Hidden when empty. | Retry (on failure) |
| 6 | Panel: recommended action and action bar | recommended action with one line of reason, then the other allowed actions for this type and state. Disabled actions show their reason. Inline confirm opens directly under the action. The recommendation follows the role, so it is always an action the current user can take; an action that needs another role stays visible as a locked secondary with its reason. | per the catalog |
| 7 | Panel: affected parcels | for each parcel: id, compartment, label and flags, hold until. The count matches the "Blocked" count. | click a row to open parcel detail. Show all. |
| 8 | Panel: grouped signals | count, then a list of signal text and time | none |
| 9 | Panel: timeline | Events, newest first: time, actor, text, outcome | none |

**No incident selected:** the right pane is short and actionable: "No incident open", an "Open the top incident" button naming the current top row of Needs attention (it follows live ranking), one line of network status ("12 stations · 7 fresh · 4 offline · 1 signal delayed"), and a key hint. The ranking rule, legends and keys live in Help.

**First visit:** a 3-step tour on the real screen, not a modal: 1) "Most urgent first" at the queue, 2) "Open an incident" at the top row (its button opens it), 3) "Do the next step" at the recommended action. Skip or Esc ends it. It is remembered in the browser and reopens from Help → "Show the tour again".

**States:** loading (skeleton rows), empty queue, filtered and empty, an incident selected or not (short empty pane), first-visit tour, every incident status, action in progress, action failed, ownership notice, no permission, large queue.

#### View 2: Station detail (`/stations/ID`)

**Purpose:** judge one station as a whole: is it reachable, what is wrong, and what is inside. **Answers:** Q1 and Q2 for one site.

| Order | Block | Data | Actions |
|---|---|---|---|
| 1 | Breadcrumb | Queue › INC-id (if it came from an incident) › station id | Back links |
| 2 | Station header | id, model, customer, city, state (Online, Degraded, Signal delayed, Offline, Out of service), availability (All, Partial, Unknown, None), `lastSeenAt` as "Last seen 14:00 (fresh)" or "as of 13:54 (6 min ago)" | Set out of service / Return to service (Operator, inline confirm) |
| 3 | Contract | response target with an "illustrative" label, LTE backup yes or no | none |
| 4 | Open incidents | each one: band, type, status, deadline | click to go to `/queue?incident=ID` |
| 5 | Parcels held | count, then a list: id, compartment, label and flags, hold until. Sorted with blocked parcels first. | click to go to parcel detail |
| 6 | Station history | Events for this station, newest first, last 20 | none |

**States:** each of the five station states. When the signal is delayed or the station is offline, values are greyed out with "as of hh:mm", and availability is shown as Unknown or None, never as a healthy value. It also covers a station with no incidents, and Out of service with Return to service available.

#### View 3: Parcel detail (`/parcels/ID`)

**Purpose:** understand one parcel and the recipient's situation. **Answers:** Q2 and Q3 for one recipient.

| Order | Block | Data | Actions |
|---|---|---|---|
| 1 | Breadcrumb | Queue › INC-id › station id › parcel id | Back links |
| 2 | Parcel header | id, label and every flag, station and compartment (link), recipient (masked) | none |
| 3 | Actions | only the actions of the linked incidents that act on this parcel: Resend code / Send by other channel (notification), Retry dispense (retrieval), Mark for return / Extend hold (expired) | the same behaviour and effect as in the incident panel |
| 4 | Dates | `arrivedAt`, `holdUntil` with the label "Illustrative hold period" | none |
| 5 | Notifications | channel, time, delivered or not delivered | none |
| 6 | Linked incidents | each one: band, type, status | click to go to the queue |
| 7 | Parcel history | Events, newest first | none |

**States:** each label (Ready, Blocked, Code not delivered, Hold expired, Picked up, Marked for return), more than one flag at once (PCL-0412), action in progress or failed, and a terminal state (actions hidden, and "No actions: parcel picked up" shown).

### Interaction patterns

| Topic | Decision |
|---|---|
| Layout | Master-detail for queue and incident (list on the left, about 40 %, panel on the right). Station and parcel views are full pages with a breadcrumb. |
| Filters, search, sort | Type and band filter chips are in scope. Sort is fixed to the priority rule and cannot be changed, so the order always matches the rule. Search is LATER. |
| Confirmation | Always inline, opening directly under the button. It states the consequence in one sentence and offers Confirm and Cancel. A note field appears when the catalog requires one. Browser dialogs and modals are never used. Esc cancels. |
| Results | Shown inline in the panel's result area. They are not toasts, so the operator sees the outcome where they acted. |
| Toasts | Only for changes off-screen: "INC-104 recovered", "New incident on LIT-0x". Each toast has a "View" link and disappears after 6 s. At most 3 show at once, newest first; the rest collapse into "+N more". It never carries an action result for the selected incident. |
| Loading and processing | Skeleton rows on first load. During an action, the button shows a spinner and a verb in the -ing form, the other actions are disabled, and the row status reads "In progress". The simulated time is 3 to 5 s. |
| Live updates | Countdowns show whole minutes and refresh at least every 30 s. Rows re-rank live, but the selected incident and scroll position are kept. A row that moves gets a short highlight. |
| Keyboard | ↑/↓ move through the queue, Enter opens, A acknowledges, R runs the recommended action (it opens the inline confirm if the action has one), Esc closes a confirm or the panel, and G Q returns to the queue. The keys are listed in Help, and Acknowledge and the recommended action show their key ("Shortcut: A", "Shortcut: R") in their tooltip. Focus moves to the panel heading when a row is opened, and returns to the row when Esc closes the panel; closing a confirm, Help, Concept controls or the tour returns focus to where it was. Single-key shortcuts (A, R, g q) only act from the queue or panel and can be turned off in Help (WCAG 2.1.4). Arrows move the selection only from the queue or the panel heading, so they still scroll the panel. |
| Phone width (under 768 px) | The queue is full width, and opening a row shows the panel as a full page with a "Back to queue" button. The header keeps two status cells (Offline, Delayed: icon + word + count), the brand shortens to "PicksyOS", and "Help" opens inline. The type and band chips fold into one "Filters" disclosure ("Filters (n)" when n are active), so the first incident is visible without scrolling. This also applies at 200 % zoom on desktop. The action bar sticks to the bottom of the screen, and an open inline confirm stays at about 200 px or less: long consequence text scrolls inside it, and Confirm and Cancel stay visible. The sticky sheet never takes more than about 45 % of the view (it scrolls inside), tooltips flow in the layout instead of covering actions, and every tap target is at least 44 px. No horizontal scroll. |
| Labels | The working screens read like an internal tool: no "Illustrative" or "Proposed" tags on the queue, panel, station or parcel pages. The disclaimer "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data." is a thin footer line on every screen at every width. Help → "About this concept" explains what is invented (Illustrative = invented value · Proposed = invented rule, role or action · Demo control = simulated event), and the tags remain only in Help and in Concept controls. |

### Edge-state map

| Edge state | Where | What the operator sees | What they can do |
|---|---|---|---|
| No incidents | Queue | The "Needs attention" section reads "Nothing needs attention. 11 stations fresh · 1 signal delayed." (computed from station states) The In hand and Resolved sections stay visible, the filter chips are hidden (every count would be 0), and the right pane reads "All clear. New incidents appear at the top of the queue." | Open resolved incidents, or Reset (demo) |
| Filter with no match | Queue | "No P1 incidents. Clear filter" | Clear filter |
| Station offline | Queue row, panel, station | State shown as Offline, availability None, all its parcels Blocked. If there is no LTE backup, the backup action is disabled with its reason. | Backup (if available), field visit |
| Stale data (signal delayed) | Queue header count, station, parcel | The "Signal delayed" chip with the stamp "as of 13:54 (6 min ago)", values greyed out, availability Unknown. No incident is created. | Watch. Becomes Offline at 10 min. |
| Breached deadline | Row, panel | The row gets a 3 px error edge and the countdown reads "Breached −15m" (no row tint, no motion). The panel's contract-time bar is full and in error styling, with the text equivalent "Breached by 15 minutes". The reason reads "Breached 15 min ago". | the normal actions |
| Action processing | Panel, row, parcel | Spinner and -ing label, other actions disabled, row shows "In progress" | Wait, or move to another incident (the action continues) |
| Action failed | Panel result area, parcel | The failure sentence and the next step ("Backup did not respond. Next: request a field visit."), the new status (Acknowledged), and the updated recommendation as the only primary button | Follow the new recommendation, or Retry (a quiet link) |
| Submit failed | Panel | "Could not send. Nothing changed." | Retry |
| No permission | Action bar (Mark for return, INC-108, parcel PCL-0301) | For an Operator the recommendation is Extend hold; Mark for return is a locked secondary with "Supervisor approval needed" and a tooltip that never covers another action | Use Extend hold, or switch role (demo) |
| Owned by someone else | Row chip, panel notice | "Acknowledged by Operator B at 13:40" | Take over and continue, or Cancel |
| Recovers on its own | Row moves to "Recovered: confirm to close", plus a toast if the incident is not selected | "Condition cleared at 14:01. Confirm to close." | Confirm and close |
| Resolved incident | The "Resolved today" section, and the panel in read-only mode | Outcome, who resolved it and when, full timeline. The action bar is hidden. | Reopen |
| Two incidents on one station | Station (2 rows in open incidents), queue rows, panel context note | INC-106 shows "Station also offline (INC-105)" | Open either incident |
| One parcel under two incidents | Parcel detail (both flags, 2 linked incidents), both incident panels | "Blocked: station offline + Code not delivered" | Resend code (allowed while the station is offline) |
| Large queue (Stress test, 47 open) | Queue | One banner above the queue ("Stress test on: 40 extra incidents added. Concept controls → Reset removes them."), section headers stay pinned, In hand and Resolved are collapsed, chip counts help to narrow the list, and the panel is unaffected | Filter |

### Key UX decisions

| # | DESIGN DECISION | Alternative considered | Trade-off |
|---|---|---|---|
| UX1 | The landing view is the exception queue | A dashboard with charts and a map | The operator gets less overview of the whole network. The header summary covers counts, and a map is LATER. Action needs to come first, because nothing on a chart can be acted on. |
| UX2 | Visible bands, with every reason written out | A numeric risk score (0 to 100) | The ordering is coarser and ties need a time sort. Any operator can explain or challenge the rank. |
| UX3 | Master-detail with the queue always visible | A full-page incident view | The panel is narrower. The queue stays in view, the change in rank after an action is visible, and the primary flow takes 3 clicks. |
| UX4 | Results inline, inline confirms only for actions that touch parcels or use resources | Modals, and a confirm for everything | The no-confirm actions (resend, backup) can be clicked by accident. They are idempotent or harmless. |
| UX5 | Soft ownership with "Take over" | A hard lock on someone else's incident | Two operators could collide. The owner is visible and each takeover is logged. This rests on H7. |