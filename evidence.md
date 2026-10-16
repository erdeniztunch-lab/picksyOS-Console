# Evidence

PicksyOS Operations Console is an independent concept. Nothing here comes from Delivery One's internal systems, data, users or team. All sources were accessed on 16 Oct 2026.

## Sources

| # | URL | Supports |
|---|-----|----------|
| S1 | https://www.delivery-one.com/en | PicksyOS scope, service contract, customer dashboard, product line |
| S2 | https://www.delivery-one.com/en/faq | Monitoring, field service, pickup flow, API, business model, operator supervision |
| S3 | https://www.delivery-one.com/en/products/picksy-lite | Lite hardware, sensors, connectivity |
| S4 | https://www.delivery-one.com/en/products/picksy-pro | Pro hardware, vehicle and battery transfer |
| S5 | https://www.delivery-one.com/en/products/picksy-wall | Wall hardware, operating limits |
| S6 | https://www.delivery-one.com/en/products/picksy-street | Street robot, remote operations team |
| S7 | https://www.delivery-one.com/en/products/picksy-air | Air drone, remote operator oversight |
| S8 | https://www.delivery-one.com/en/news | Company timeline |
| S9 | https://www.delivery-one.com/en/careers | Open roles |
| A1 | https://inpost.co.uk/help/what-is-remote-opening | Analog: InPost remote opening |
| A2 | https://www.dha.com.tr/kurumsal/trendyol-gel-al-noktalarini-81-ilde-10-bin-noktaya-ulastirdigini-duyurdu-2863350 | Analog: Trendyol Gel-Al (published 29 Apr 2026) |
| A3 | https://support.pagerduty.com/docs/incidents | Analog: incident states, urgency vs priority |
| A4 | https://support.zendesk.com/hc/en-us/articles/4408832852122-Viewing-and-understanding-SLA-targets | Analog: SLA countdown in queues |
| A5 | https://developers.samsara.com/docs/maintenance-fault-monitoring-guide | Analog: fleet fault monitoring to maintenance |

## Facts

Re-check of the facts from the project context:

| Fact | Status |
|------|--------|
| PicksyOS plans tasks and routes, monitors units remotely, balances batteries and inventory, one API (S1) | Confirmed. The page currently says "stock" where the context said "inventory". |
| Round-the-clock remote monitoring; most issues handled remotely; field service within agreed response time (S2) | Confirmed. The FAQ also says parts can be replaced on site. |
| Monthly service, maintenance and remote monitoring contract per unit (S1) | Confirmed |
| Customers follow deliveries live in the dashboard and through the API (S1) | Confirmed |
| One-time pickup code, entered or scanned as QR; returns run in reverse; expiry not described (S2) | Confirmed |
| Picksy Wall specs (S5) | Confirmed |
| Integrations, buy-or-lease model, news items, open roles (S2, S8, S9) | Confirmed |
| UI/UX job content (flows, dashboards, admin panels, design system) | **Not re-verified.** S9 now lists the role without a description. |

New facts relevant to the console:

- FACT: "Every unit is monitored remotely around the clock." If a site visit is needed, the field service team arrives "within the response time set in your service agreement." No fixed value is given. (S2)
- FACT: The open API covers "parcel drop-off, pickup codes, notifications and reporting." (S2)
- FACT: Picksy Air and Picksy Street "operate under remote operator supervision." (S2) Street: "a remote operations team oversees the fleet over 4G LTE." (S6) Air: "under remote operator oversight", with "telemetry and video live along the whole route." (S7)
- FACT: Lite has "Door sensors and camera", "Industrial electronic locks", "Bluetooth offline mode", 4G LTE, Ethernet and Wi-Fi, battery and solar options, an outdoor version rated −25 °C to 45 °C, and "Real-time remote monitoring". (S3)
- FACT: Pro has a "Light curtain at the hatch", "CCTV, motion sensor", "UPS optional", 4G LTE plus Ethernet, a climate-controlled interior, and fully automated "Parcel and battery transfer" for UAVs and UGVs. (S4)
- FACT: Wall is indoor only, operates from 5 °C to 35 °C, uses Ethernet with optional 4G backup, and has a "Cloud dashboard, open API" and "remote management". (S5)
- FACT: Street "Charges automatically at the station", runs "Up to 8 h" within "Up to 2 km" of a station, and opens its cargo space only with the recipient's one-time code. (S6)
- FACT: Air batteries are swapped by Picksy Pro. Wind limit is 12 m/s. (S7)

## Observations

- OBSERVATION: No public page shows a PicksyOS screen, a station screen UI or an operator view. The only screen interaction described is a courier scanning a barcode "at the station screen" (S1) and a recipient entering a code (S2, S3). The product pages contain only renders and photos. (S1, S3 to S5)
- OBSERVATION: The homepage embeds a video. I could not inspect its content through the text fetch, so I make no claim about what it shows. (S1)
- OBSERVATION: The site names three supervisory audiences: the customer's "team" in the dashboard (S1), a "remote operations team" for vehicles (S6), and a "field service team" (S2). It does not say how they relate or who watches stations day to day.

## Analogous patterns

Interaction patterns only. None of these are Delivery One capabilities.

| Product | Pattern to learn | Pattern to avoid | Source |
|---|---|---|---|
| InPost remote opening | One clear action ("Open Locker Remotely") tied to a specific parcel, with a safety precondition (within 10 m). Remote actions need explicit guard conditions. | Failure handling is not described; users are sent to generic help. A remote action needs a visible failure state and a next step. | A1 |
| Trendyol Gel-Al | A stated hold period (5 days) gives every parcel a known deadline, which can drive urgency. | Lockers and staffed shops sit under one label with different failure modes. Do not mix unit types without showing what differs. | A2 |
| PagerDuty | Separates *urgency* (how to notify) from *priority* (order of work), and gives clear states: triggered, acknowledged, resolved. Acknowledging stops escalation. | Many raw alerts per incident. Dedup only by key, and the 100-event limit shows how noise piles up. Group raw signals into one item. | A3 |
| Zendesk SLA views | Queues show time left to the next breach, with green / amber / red badges and negative time once breached. The soonest target is the one displayed. | Badges round time and show calendar time while the deadline uses business hours. Do not show a countdown whose rules differ from what it displays. | A4 |
| Samsara maintenance | Fault codes connect to inspections and work orders, so a detected fault leads to a maintenance task. | The public docs do not show how alerts are triaged, so there is little to learn about noise control. | A5 |

## Operational facts for the console

- **What is monitored:** every unit, remotely, around the clock (S2). Signals the hardware exposes: door sensors, camera, CCTV, motion sensor, hatch light curtain, connectivity (with LTE or Bluetooth fallback), power or UPS, and vehicle telemetry and video (S3 to S7).
- **What can fail:** the site does not list failure types. Hardware limits suggest likely categories: connectivity loss, power, temperature outside range, doors and locks, docking and battery transfer, and vehicles that need operator attention. These are HYPOTHESES for phase 3, not facts.
- **Fixed remotely:** "most issues" (S2). Which ones is not stated.
- **Needs a field visit:** part replacement, within the contracted response time (S2).
- **Who the customer is:** carriers, e-commerce platforms and site owners who buy or lease hardware and pay a monthly service fee (S1, S2). Recipients and couriers use the stations but are not the paying customer.

## Research limits

- No public UI of PicksyOS, the customer dashboard or station screens.
- No incident types, frequencies, SLA or response-time values, or parcel hold period for Picksy stations.
- No information on who monitors stations day to day, or how the operations, field service and customer teams split the work.
- The UI/UX job description could not be re-read. The careers page now shows only the title.
- The hold period found (5 days) belongs to Trendyol Gel-Al, not Delivery One.

## Hypotheses

Each row is an assumption, not a finding. "Validate" is one question Delivery One could answer in a single conversation.

| ID | HYPOTHESIS | Evidence | Conf. | What breaks if wrong | Validate |
|---|---|---|---|---|---|
| H1 | A central Delivery One team probably handles first response for stations across all customers. | S2 (round-the-clock monitoring), S6 ("remote operations team") | Med | If customer staff do first response, the console needs to be scoped per customer, with different permissions and fewer remote actions. | "Who sees a station alert first, and what do they do next?" |
| H2 | Likely issue types are connectivity loss, power, temperature out of range, door or lock fault, stuck compartment, docking or battery transfer failure, a vehicle needing an operator, and failed pickup codes. | Inferred from sensor and spec lists (S3 to S7). No failure list is public. | Low | The incident catalog and every example in the prototype would be wrong. | "What were your five most common unit issues last month?" |
| H3 | The likely remote and field split: restart, reopen compartment, resend code and mark compartment out of service can probably be done remotely. Mechanical faults and part replacement probably need a field visit. | S2 ("most issues" remote, parts replaced on site). The specific actions are inferred. | Med (split), Low (actions) | The action panel would offer things operators cannot do, or would miss real ones. | "Which fixes can an operator trigger from a screen today?" |
| H4 | Urgency is probably driven by (a) time left on the contracted response time, (b) parcels and recipients affected, (c) whether the unit can still serve pickups, and (d) for vehicles, safety. | (a) S2. (b) to (d) are inferred. | Med | The priority order in the queue would not match how operators actually rank work. | "When two issues arrive at once, how do you pick which one first?" |
| H5 | Picksy stations probably have a parcel hold period, after which parcels go to returns, which would create a second deadline. | None for Delivery One. A2 (Gel-Al, 5 days) is a competitor analog only. | Low | If there is no hold period, the "parcels near expiry" urgency signal would be invented. | "How long does a parcel wait in a station, and what happens after?" |
| H6 | Telemetry is probably near real time, and a unit that stops reporting is unknown, not healthy. | S3, S4 ("real-time remote monitoring"), S3 (Bluetooth offline mode) | Med | Freshness labels and "last seen" logic would be miscalibrated. | "How often does a unit report, and how do you tell offline from quiet?" |
| H7 | Remote actions that touch parcels probably need a confirmation and an audit record. Field dispatch is probably handled by a separate team. | S2 (field service team), S5 (ISO 27001) | Low–Med | The permission model and confirmation steps would be too heavy or too light. | "Who is allowed to open a compartment remotely, and is it logged?" |
| H8 | Live vehicle control probably lives in a dedicated supervision tool. An overview console would show vehicle issues and hand them off. | S6, S7 (operator oversight with live video) | Med | If one tool does both, the console would need live control, which is out of scope. | "Do the people supervising robots and drones also watch the stations?" |
| H9 | One root cause probably raises several raw alerts, for example a unit going offline then triggering door and temperature alerts, so grouping is needed. | None for Delivery One. A3 is an analog. | Med | If alerts are already clean, grouping adds complexity for nothing. | "When a unit goes offline, how many alerts does it produce?" |
| H10 | The console is probably internal only. Customers already have their own dashboard. | S1 (customer dashboard) | Med | If customers use the same tool, labels, data scope and actions would change. | "What does a customer see compared with your own team?" |

### Working assumptions for the prototype

The prototype treats these as true and labels them. Every screen shows the permanent label "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data."

| Hyp. | Treated as | UI label | Case study label |
|---|---|---|---|
| H1 | The console's user is a central network operator. | Role switch inside Concept controls (tagged "Proposed") | HYPOTHESIS H1, named as the main risk |
| H2 | A fixed catalog of 4 incident types (D3) | Footer disclaimer and Help → "About this concept" (no tag on working screens) | HYPOTHESIS H2 |
| H3 | A set of remote actions plus one action to request a field visit | Help → "About this concept" (actions are proposals) | DESIGN DECISION resting on H3 |
| H4 | Priority is calculated from contract time, parcels affected and availability | "Proposed rule" on the full rule in Help → "How ranking works"; targets explained there as illustrative | DESIGN DECISION resting on H4 |
| H5 | A hold period of N days, shown as a parcel deadline | Help → "About this concept" (hold periods are invented) | HYPOTHESIS H5, flagged as unconfirmed |
| H6 | Each unit shows a "last seen" time, and stale data is shown as unknown | Help → "About this concept" | DESIGN DECISION resting on H6 |
| H7 | Actions that touch parcels need confirmation, and every action is logged | Help → "About this concept" | DESIGN DECISION resting on H7 |
| H8 | Vehicles are out of scope for the prototype (D2) | not shown | Scope boundary resting on H8 |
| H9 | Raw alerts are grouped into one incident | Help → "About this concept" | DESIGN DECISION resting on H9 |

Decision (16 Oct 2026, project owner): the working screens must read like the first version of an internal tool, so concept tags were moved off the queue, panel, station and parcel pages. Each assumption above is still disclosed, through the footer disclaimer on every screen and Help → "About this concept".

H10 is not shown in the UI. The case study states it as a scope boundary.

All counts, durations, unit names, customer names and locations in the prototype are invented. They are labeled "Illustrative", and none of them describes a real Delivery One customer or site.

## Brand reference

Source: S1 (https://www.delivery-one.com/en), accessed 16 Oct 2026.

- OBSERVATION: Values were read from the site's public stylesheet (CSS custom properties) and from computed styles in a browser.
- The fonts are read from the page's loaded font list.
- Visual traits are taken from a screenshot of the homepage.
- No brand guideline document is public. These are the values the website uses, not an official brand specification.

**Colour (exact values from the site CSS)**

| Role on the site | Token name on the site | Value |
|---|---|---|
| Brand lime (accent) | `--d1-lime` | #84b926 |
| Brand lime on dark | `--d1-lime-bright` | #a6e22e |
| Brand green | `--d1-green` | #648f2f |
| Brand green deep (accent text) | `--d1-green-deep` | #4a6b22 |
| Lime soft (tint) | `--d1-lime-soft` | #eef6df |
| Ink scale | `--ink-950 / 900 / 800 / 700 / 600` | #0a0b0a / #111312 / #1b1e1c / #2a2e2b / #3d423e |
| Grey scale | `--grey-50 … 500` | #f7f7f6, #f2f2f2, #e8eae8, #dcdfdc, #bfc3bf, #8f948f, #6e736f |
| Logo grey | `--d1-logo-grey` | #c6c6c6 |
| Status (the site's own) | `--status-ok / warn / error / info` | #5e9e1f / #c98a12 / #c2412d / #3b6e8f |
| Status backgrounds | `--status-*-bg` | #eef6df / #fbf1dc / #f9e4e0 / #e2edf3 |
| Theme colour (meta) | `theme-color` | #0a0b0a |

**Typography:**

- Inter (variable, 100 to 900) is used for all text, and JetBrains Mono (400, 500) is also loaded.
- Size tokens: 11, 12 (label), 14, 17 (body), 20, 28, 44, 64 and 96 px.
- Body weight is 300, headings are 600, and buttons are 500.
- Headings have negative tracking (−0.03em). Labels are uppercase with +0.14em tracking.
- Line heights: 1.55 for body, 1.1 for headings.

**Shape, space and motion:**

- Radius: 6, 10, 14, 20 and 28 px, and pill (999 px). Buttons are pills.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96 and 144 px.
- The hairline border is 1 px, grey-200.
- Shadows are soft.
- Motion durations are 0.14, 0.24 and 0.6 s.
- The focus ring is lime at 45 % alpha (#84b92673).

**Visual traits (OBSERVATION from the screenshot):**

- Dark ink hero with white text.
- A lime pill as the primary call to action, with ink text.
- Headlines end with a lime full stop ("automated.").
- The wordmark is lowercase, "delivery" in white and "one" in grey.
- Photography shows hardware in real settings.

**Tone:** short, declarative and plain. For example, the headline "The last mile, automated.", the call to action "Request a quote", and the section title "Let's talk."

**Contrast (computed, WCAG 2.x):**

| Pair | Ratio | Result |
|---|---|---|
| Lime #84b926 on white | 2.35 | Fails for text and UI |
| Ink on lime #84b926 | 8.4 | Passes |
| Lime-bright on ink-950 | 12.7 | Passes |
| Green-deep on white | 6.15 | Passes |
| Status warn #c98a12 on white | 2.95 | Fails for text |
| Status ok #5e9e1f on white | 3.29 | Fails for small text |
| Error #c2412d on its bg #f9e4e0 | 4.21 | Fails for small text |
| Error #c2412d on ink-950 | 3.84 | Fails for small text |
| Info #3b6e8f on ink-950 | 3.58 | Fails for small text |
| Grey-500 #6e736f on white | 4.83 | Passes |
| Grey-400 #8f948f on white | 3.09 | Fails for text |

**Where the brand is not enough for an operations tool (DESIGN DECISION):**

1. **Status colour conflicts with identity.** The site's ok green sits next to brand lime. In the console, lime and brand green mark identity and focus only. They never mean "healthy".
2. **Status values fail AA in places** (see the table). The console derives darker shades for light theme and lighter shades for dark theme, keeping each hue, until text reaches 4.5:1 and icons and borders reach 3:1.
3. **Body text at weight 300 is too thin for dense data.** The console uses Inter at 400 for body text and 500 for labels, with tabular numerals. JetBrains Mono is used for IDs and times.
4. **The size scale is built for marketing.** The console uses a compact scale (12 to 24 px).
5. **There is no stale or unknown state.** The console adds a neutral "unknown" treatment that is not one of the four status hues.
6. **No dark theme is defined as a system.** The hero already uses ink-950 with white, and the console's dark theme is built from the ink scale.

## Design decisions

D1 to D7 were confirmed by the project owner on 16 Oct 2026. Full rationale is in `docs/product-brief.md`.

- DESIGN DECISION D1: The primary user is an operator on Delivery One's central remote operations team (rests on H1, supported by S2 and S6).
- DESIGN DECISION D2: Scope is stations only (Lite, Pro, Wall). Vehicle incidents move to LATER (H8).
- DESIGN DECISION D3: The incident types are station offline, retrieval failure, pickup code notification failed and pickup window expired. All are labeled "Illustrative" (H2).
- DESIGN DECISION D4: Priority is a visible rule, not a hidden score. It is based on time to contract deadline, parcels blocked and whether the station can still serve pickups. The hold period is excluded from it (H4, H5).
- DESIGN DECISION D5: Stale data is shown as unknown, never as healthy (H6).
- DESIGN DECISION D6: Parcel-affecting remote actions require confirmation, and every action is logged (H7).
- DESIGN DECISION D7: The prototype has three views: queue with incident detail, station detail and parcel detail. It uses illustrative mock data and has no back end.

D8 to D13 come from phase 5 and were approved by the project owner on 16 Oct 2026, with the conditions shown. Details are in `docs/operational-model.md`.

- Scope note on D7: if time runs short, the "large queue" and "no permission" edge states are cut first.
- D3 confirmed: all four incident types stay. *Pickup window expired* keeps an "Illustrative hold period" label, stays at P3 (D13), and its underlying assumption H5 remains an open question (Q5).

- DESIGN DECISION D8: A station counts as "signal delayed" after 3 min without a heartbeat and "offline" after 10 min. Both values are illustrative.
- DESIGN DECISION D9: Bands P1 to P3 use visible rules. Only Open and Acknowledged incidents are ranked. Incidents in hand, recovered or resolved are grouped separately.
- DESIGN DECISION D10 (mixed rule): For the first 10 min after a retrieval failure (illustrative), an incident with a recipient waiting sorts to the top of P1. After that it returns to time order (deadline soonest first, breached deadlines first).
  - *Why:* a recipient at the hatch is the only case where a person is waiting at the station in real time, and they will probably leave within minutes. A breached contract deadline is already lost and stays urgent, but a few minutes' delay changes less. Pure time order would push the one case where a fast remote fix still helps a person below a deadline that has already passed.
  - *Cost:* one exception to an otherwise single rule. The why line has to say "Recipient waiting at station" so that the rank stays explainable. The 10 min window is HYPOTHESIS, and illustrative.
  - *Alternative rejected:* time order only. It is simpler, but it ranks INC-102 (breached, 18 parcels) above INC-101 (recipient at the hatch now).
  - Candidate for the case study's "Three decisions" section.
- DESIGN DECISION D11: Supervisor approval is required only for irreversible actions. In this catalog, Mark for return is the only one. Every other action can be undone or is harmless to repeat. A Proposed role switch demonstrates it.
- DESIGN DECISION D12: All counts are computed from records and never stored.
- DESIGN DECISION D13: *Pickup window expired* is always P3, because it rests on H5 and no parcel is physically blocked.
- DESIGN DECISION D14: The concept uses Delivery One's public colours and type, so it reads as made for this company. It does **not** use the Delivery One logo or wordmark, so it cannot be taken for an official tool. The product name is set in plain text: "PicksyOS Operations Console". Every screen carries "Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data."
- DESIGN DECISION D15: Brand lime and brand green are for identity and focus only. Status, priority and freshness each use their own semantic tokens. Priority and state are never conveyed by colour alone.
- DESIGN DECISION D16: LIT-06 reports with a steady 6 min lag (illustrative). Its heartbeats arrive, but late, so `lastSeenAt` is always now minus 6 min. It stays "Signal delayed" for the whole demo, and is never auto-escalated to offline. Why: a signal-delay example that disappears after 3 minutes, or turns into an unplanned incident, would break the counts on every screen. A steady lag is also the more realistic meaning of "delayed".

- DESIGN DECISION D17 (16 Oct 2026): Field task stages (Requested → Accepted → On site → Completed, plus Cancelled from Requested or Accepted) are Proposed and simulated. The real field-service process is unknown (open question 6). Acceptance is simulated 10 s after the request (illustrative); the later stages are advanced by a demo control; every simulated step is tagged "Simulated" in the timeline. The request shows only what the model already knows (station, problem from signals and the last failed action, impact, due time). No technician names, contacts, vehicle tracking, maps, arrival estimates or SLA statistics are shown; the team is only "Field service".

Approval conditions, checked against `operational-model.md`:

1. Incidents being worked on (in progress, awaiting field service, recovered) are grouped separately and are not ranked. Met.
2. Every priority band has a visible reason next to it. Met: every matching rule is shown in the why line.
3. Every action has a success and a failure outcome. Met. The one exception is "Field task completed", which is a simulated event, not an operator action.
4. Supervisor approval applies only to irreversible actions. **This was not met and has been fixed.** Set out of service, Return to service and Extend hold were supervisor only. They are now operator actions with a confirm, and Mark for return is now the only supervisor action.

## Open questions

Ordered by how much the answer would change the design.

1. OPEN QUESTION: Who watches the network day to day, and how many units does one person cover per shift? (H1)
2. OPEN QUESTION: What were the most common unit issues last month, and what share were resolved remotely? (H2, H3)
3. OPEN QUESTION: Which remote actions exist today, and which need approval or a log entry? (H3, H7)
4. OPEN QUESTION: How do contracted response times work: per customer, per unit, business hours or calendar hours? (H4)
5. OPEN QUESTION: How long does a parcel wait in a station, and what happens when it is not collected? (H5. The prototype keeps *Pickup window expired* on an illustrative hold period, labeled as such, until this is answered.)
6. OPEN QUESTION: How is a field visit requested and tracked today, and who decides to send one? (H3, H7)
7. OPEN QUESTION: How often do units report, and how is a unit that has gone offline told apart from one that is quiet? (H6, H9)
8. OPEN QUESTION: Are stations and vehicles supervised by the same people in the same tool? (H8)