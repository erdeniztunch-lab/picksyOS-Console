# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary user (confirmed design target; stays labeled HYPOTHESIS H1 in the UI and case study):** an operator on a central remote operations team, watching stations across all customers during a shift.

**Job to be done:** "When a station reports a problem, help me decide quickly whether parcels are blocked, how close we are to breaching the customer's response time, and what to do, so I fix it remotely when I can and dispatch field service only when I must."

**Decisions the operator makes:** is this real and current (or stale or duplicate)? Which issue first? Can it be fixed remotely, and with which action? Did the fix work, and should I retry or escalate? Does it need a field visit, and how urgently? When is it safe to close?

**Evaluating audience:** the prototype is a portfolio and job-application case study. A hiring reviewer (Delivery One or a similar company) evaluates it without a guide. The reviewer is not a second design target; they judge how well the console serves the operator.

## Product Purpose

PicksyOS Operations Console is an independent concept for the operations tool behind Delivery One's PicksyOS parcel stations (Picksy Lite, Pro, Wall). It shows in one place which station issues are blocking parcels right now, how close each one is to a contract deadline, and which fix to try next.

Success means a reviewer, unguided, can:
1. Name the top incident and explain why it ranks first, using only what is on screen.
2. Open it and see which parcels are blocked and the time left before breach.
3. Run a remote action, see it fail, and then request a field visit.
4. Tell a stale station apart from a healthy one.
5. Resolve an incident and see the queue update.
6. Tell concept elements apart from sourced facts, using the footer disclaimer and Help → "About this concept".

No usability testing has been done; these are design criteria.

## Positioning

The landing view is an exception queue ranked by a visible, written rule (time to contract deadline, parcels blocked, whether the station can still serve pickups), not a chart dashboard or an opaque risk score. Every rank shows all of its reasons, so any operator can explain or challenge it. Each issue opens to its affected parcels and a recommended next action, so the operator goes from alert to fix or dispatch without switching tools.

## Operating Context

- Shift work at a desk, monitoring 12 stations (illustrative) across customers A, B and C in Ankara and Istanbul.
- Master-detail on desktop (queue about 40 %, panel on the right); full-page panel with a sticky action bar on phone (under 768 px).
- Three views: Queue with incident detail (`/queue?incident=ID`), Station detail (`/stations/ID`), Parcel detail (`/parcels/ID`). Navigation state lives in the URL.
- A demo clock starts at 14:00 local on the day it is opened and runs in real time. Demo controls (labeled "Demo control") simulate field-task completion, a stress test, a failed submit, and reset.
- Keyboard: ↑/↓, Enter, A (acknowledge), R (recommended action), Esc, g q.

## Capabilities and Constraints

- Front end only, illustrative mock data, no back end, no authentication, no real integrations. The app lives in `picksyos-console/` (React + TypeScript + Vite).
- Behavioral spec: `operational-model.md` (entities, freshness, state models, actions catalog, priority model, dataset) and `product-brief.md` (flows, screen specs, interaction patterns, edge-state map). The console and these docs agree as of 16 Oct 2026; `npm run check:live` verifies 39 live behaviors.
- Incident types in scope (all "Illustrative", H2): Station offline, Retrieval failure, Pickup code notification failed, Pickup window expired.
- Statuses: Open, Acknowledged, Action in progress, Awaiting field service, Recovered, Resolved.
- Priority bands P1 to P3 by the written rule; Pickup window expired is always P3.
- Soft ownership (H7): an incident owned by someone else is never locked; taking over is confirmed and logged.
- Supervisor approval only for irreversible actions (Mark for return); the Operator/Supervisor role switch is labeled "Proposed".
- Confirmations are always inline, never modals. Results are inline; toasts only for off-screen changes.
- Stale data (signal delayed) is never shown as healthy.
- Counts are never stored; every number is computed from records.
- LATER: capacity incidents, vehicle (Street, Air) incidents, map view, assignment and escalation, shift handover, customer notification, bulk actions, search, reporting, field technician mobile view.
- Non-goals: live vehicle control, a customer-facing dashboard, real data, any claim about Delivery One's actual workflow.

## Brand Commitments

- Not affiliated with or endorsed by Delivery One. The label "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data." is visible on every screen at every width. No Delivery One logo; the product name is plain text (D14).
- The working screens read like v1 of an internal operations tool: no concept tags on the queue, panel, station or parcel pages. What is invented or proposed is disclosed through the footer disclaimer and Help → "About this concept"; the "Illustrative" / "Proposed" / "Demo control" tags remain only in Help and Concept controls.
- Visual values are adapted from Delivery One's public website (see `evidence.md`, Brand reference): Inter and JetBrains Mono, brand lime as identity and focus only (never "healthy"), pill buttons, headlines ending in a lime full stop. Tokens: `README.md` / `picksyos-console/src/design/tokens.ts`. The canonical design doc is `docs/design-system.md`; `DESIGN.md` mirrors it.
- Voice: short, declarative, plain.

## Evidence on Hand

- Public sources S1 to S9 (Delivery One site, accessed 16 Oct 2026) and analogs A1 to A5, in `evidence.md`.
- Hypotheses H1 to H10 with confidence levels and validation questions, in `evidence.md`.
- No public PicksyOS UI, no real incident types, SLA values, hold periods, frequencies, or team structure exist. Future work must not fabricate them or present them as fact; all stations, customers, parcels, counts and durations are invented and labeled.
- Design decisions D1 to D7 confirmed by the project owner on 16 Oct 2026.

## Product Principles

1. Action comes before overview: the first screen is what needs doing, in the order a written rule sets.
2. Every rank and every number explains itself on screen.
3. Uncertainty is visible: stale data, illustrative values and proposed rules are marked as such, never dressed as fact or health.
4. The operator sees the outcome where they acted, and every action leaves a trace in the log.
5. Nothing is a dead end: every state and every incident type has a path forward.

## Accessibility & Inclusion

WCAG 2.2 AA: text 4.5:1 and UI components 3:1 in both themes, full keyboard operation, a visible focus ring, no state conveyed by colour alone (hue plus icon plus word), and reduced-motion support.
