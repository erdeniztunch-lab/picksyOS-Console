# PicksyOS Operations Console: full context for the case study

Written 16 Oct 2026 as a handoff to the agent that will write the case study. It covers what the product is, the research behind it, every design decision, the design process pass by pass, and the exact state of the product today. Read it with the source files listed in section 12. Where this file and a source file disagree, the source file wins.

**Ground rules for the case study (non-negotiable):**
- It is an **independent concept**. It is not affiliated with or endorsed by Delivery One. Do not imply that Delivery One commissioned, uses or approved it.
- **No usability testing has been done.** Do not claim user research results, interviews, task success rates or quotes from operators. The success criteria are design criteria, not test results.
- **All stations, customers, parcels, counts, durations, contract targets and hold periods are invented** ("illustrative"). Only the facts tagged S1–S9 come from Delivery One's public website (accessed 16 Oct 2026).
- Hypotheses (H1–H10) must stay hypotheses. Do not present them as findings.
- Do not use the Delivery One logo or wordmark in any case study visual.

---

## 1. The product in one paragraph

PicksyOS Operations Console is a concept for the internal tool a remote operations operator would use to keep Delivery One's parcel stations (Picksy Lite, Pro and Wall) working. Delivery One says publicly that every unit is monitored remotely around the clock, that most issues are fixed remotely, and that field service must arrive within each customer's contracted response time. No public material shows how signals become decisions. The console answers that gap with one exception queue ranked by a written, visible rule. Each incident opens to the reasons for its rank, its deadline against the contract, the blocked parcels and one recommended next action. So the operator goes from alert to remote fix or field dispatch without switching tools.

**Problem statement (concept):** a remote operator needs to see, in one place, which station issues are blocking parcels right now, how close each one is to a contract deadline, and what fix to try next.

**Job to be done (hypothesis):** "When a station reports a problem, help me decide quickly whether parcels are blocked, how close we are to breaching the customer's response time, and what to do, so I fix it remotely when I can and dispatch field service only when I must."

**Primary user (hypothesis H1, the main risk):** an operator on a central remote operations team, watching stations across all customers during a shift. The design brief added a usage scene: "an employee whose attention is scattered on a 3 a.m. shift".

**Evaluating audience:** a hiring reviewer (Delivery One or a similar company), unguided. The reviewer is not a second design target. They judge how well the console serves the operator.

---

## 2. Research and evidence (what is known vs assumed)

Source: `evidence.md`.

### What is sourced fact (S1–S9, Delivery One public site)
- PicksyOS plans tasks and routes, monitors units remotely, balances batteries and stock, and exposes one API (S1).
- "Every unit is monitored remotely around the clock." Most issues are handled remotely. Field service arrives "within the response time set in your service agreement", with no fixed value given (S2).
- There is a monthly service, maintenance and remote-monitoring contract per unit (S1). Customers follow deliveries in their own dashboard and through the API (S1).
- The pickup flow uses a one-time code, entered or scanned as a QR code (S2).
- Hardware signals: door sensors, camera, CCTV, motion sensor, a light curtain at the hatch (Pro, Wall), 4G LTE/Ethernet/Wi-Fi, Bluetooth offline mode, and UPS (S3–S5).
- Street robots and Air drones run under "remote operator supervision" (S2, S6, S7).

### What is not public (research limits)
- No PicksyOS UI, no customer dashboard and no station screen UI.
- No incident types, frequencies, SLA values or hold periods.
- No information on who watches stations day to day, or how operations, field service and customer teams split the work.

### Analogs studied (patterns only, not Delivery One capabilities)
| Analog | Learned | Avoided |
|---|---|---|
| InPost remote opening (A1) | One clear remote action tied to one parcel, with a guard condition | No visible failure state, so the console gives every action a failure and a next step |
| Trendyol Gel-Al (A2) | A stated hold period gives every parcel a known deadline | Mixing unit types without showing what differs |
| PagerDuty (A3) | Urgency vs priority; triggered / acknowledged / resolved states | Raw alert noise, so the console groups signals into one incident |
| Zendesk SLA views (A4) | Time left to breach in the queue, negative time once breached | Countdowns whose rules differ from what they show |
| Samsara maintenance (A5) | A fault leads to a work order | (little public detail on triage) |

### Hypotheses (each with a validation question for Delivery One)
| ID | Hypothesis | Confidence |
|---|---|---|
| H1 | A central team handles first response for all customers' stations | Medium |
| H2 | Likely incident types (connectivity, power, temperature, locks, stuck compartment, codes…) | Low |
| H3 | The remote vs field split (restart, reopen, resend and out-of-service are remote; mechanical faults need the field) | Medium (split), Low (actions) |
| H4 | Urgency is driven by contract time left, parcels affected and whether the station can still serve pickups | Medium |
| H5 | Stations have a parcel hold period, after which parcels go to returns | Low |
| H6 | Telemetry is near real time, and a silent unit is unknown, not healthy | Medium |
| H7 | Parcel-affecting actions need confirmation and an audit trail | Low–Medium |
| H8 | Live vehicle control lives in a separate tool | Medium |
| H9 | One root cause raises several raw alerts, so grouping is needed | Medium |
| H10 | The console is internal only | Medium |

The eight open questions in `evidence.md`, ordered by impact, are the natural "what I would validate next" section. The first is: "Who sees a station alert first, and what do they do next?"

---

## 3. Design decisions (D1–D16) and why

Confirmed by the project owner on 16 Oct 2026. Full text is in `evidence.md`, `product-brief.md` and `operational-model.md`.

| # | Decision | Why / trade-off |
|---|---|---|
| D1 | Primary user is a central remote operations operator | Supported by S2 and S6; it rests on H1, the biggest risk |
| D2 | Stations only (Lite, Pro, Wall); vehicles are LATER | Vehicle control is a separate tool (H8) |
| D3 | 4 incident types: Station offline, Retrieval failure, Pickup code notification failed, Pickup window expired | Each is tied to a documented capability. Capacity is LATER (no public detail) |
| D4 | Priority is a **visible rule**, not a hidden score | Any operator can explain or challenge a rank. Coarser ordering is accepted |
| D5 | Stale data is shown as **unknown, never healthy** | A silent station is not a fine station (H6) |
| D6 | Parcel-affecting actions need confirmation; every action is logged | H7 |
| D7 | 3 views (queue + incident detail, station, parcel); mock data, no back end | ~1.5 days of build scope |
| D8 | "Signal delayed" after 3 min without a heartbeat, "offline" after 10 min | Values are illustrative |
| D9 | Bands P1–P3; only Open and Acknowledged incidents are ranked | Work in hand, recovered and resolved are grouped separately, not ranked |
| **D10** | **Mixed rule:** for 10 min after a retrieval failure, a recipient waiting at the station sorts to the top of P1, then returns to time order | A person at the hatch is the only real-time human cost; a breached deadline is already lost. Pure time order would put INC-102 (breached, 18 parcels) above INC-101 (recipient at the hatch now). Cost: one exception, so the why line must say "Alıcı istasyonda bekliyor". **Flagged by the owner as a candidate for the case study's "Three decisions" section.** |
| D11 | Supervisor approval only for irreversible actions; "Mark for return" is the only one | Everything else can be undone or is harmless to repeat. An earlier draft over-restricted three actions; this was caught and fixed |
| D12 | Counts are computed from records, never stored | Numbers can never disagree across screens |
| D13 | "Pickup window expired" is always P3 | It rests on H5 (low confidence), and no parcel is physically blocked |
| D14 | Use Delivery One's public colours and type, but **no logo**; plain-text product name; disclaimer on every screen | It reads as made for this company, but cannot be taken for an official tool |
| D15 | Lime and brand green mean identity and focus only, **never "healthy"**; state is never shown by colour alone | The site's own OK green sits next to brand lime, so status hues were separated |
| D16 | LIT-06 has a steady 6-min lag and stays "Signal delayed" all demo | A delay example that vanishes or turns into an incident would break the counts |

### Key UX decisions (with the alternatives rejected)
| # | Chosen | Rejected | Trade-off |
|---|---|---|---|
| UX1 | The landing view is an **exception queue** | A dashboard with charts and a map | Less network overview, but nothing on a chart can be acted on |
| UX2 | Visible bands with every reason written out | A 0–100 risk score | Coarser order, but rank is explainable |
| UX3 | Master-detail; the queue is always visible | A full-page incident view | Narrower panel, but re-ranking after an action stays visible; 3 clicks to resolve |
| UX4 | Inline results; inline confirms only for parcel-affecting or resource-using actions | Modals; a confirm for everything | Idempotent actions (resend, backup) can be clicked by accident |
| UX5 | **Soft ownership** with "Devral" (take over), logged | A hard lock | Two operators could collide; the owner is visible and every takeover is logged |

### Visual system decisions ("The Night-Shift Ledger")
Sources: `docs/design-system.md` (canonical) and `DESIGN.md`.
- **North star:** the console is the record an operator trusts at the end of a long shift. It is calm, plain and accountable, and every line on screen can say why it is there. Nothing shouts; urgency comes from weight, order and one breach edge, never alarm colour or motion.
- **Priority is weight, not hue:** P1 solid ink, P2 outlined, P3 hairline. A red P1 would read as "offline" or "breached".
- **Every state has a shape:** hue + icon + word, never colour alone.
- **Uncertainty is its own material:** grey, dashed, with a clock icon and "son veri hh:mm" (last data at hh:mm). It never borrows the healthy style.
- **One "pilot light" per panel:** the recommended action is the only lime button. Confirm buttons are ink.
- **The breach signal is quiet:** a 3 px error edge on the row and "Aşıldı −15 dk" ("Breached −15 min"). No row tint and no motion.
- **Brand adaptation (and where the brand was not enough):**
  - The site's lime fails contrast on white (2.35:1), so it is used only as a fill with ink text.
  - Status colours were darkened or lightened until text reaches 4.5:1 in both themes.
  - Body text is weight 400, not 300.
  - The type scale is compact (12–24 px).
  - A neutral "unknown" state was added.
  - The dark theme is built from the brand's ink scale.
  - The focus ring is solid green-deep plus a lime halo, because the brand's 45 % lime ring is 1.4:1.
- **Floors:** nothing readable below 12 px; WCAG 2.2 AA in both themes; 44 px tap targets on phone; reduced-motion support.

---

## 4. Design process (chronological)

### Phase A: research and specification (before the build)
1. Public-source research and brand reading, producing `evidence.md` (sources, facts, analogs, H1–H10, open questions, brand values with computed contrast).
2. The product brief (`product-brief.md`): problem, user, decisions the user makes, incident types, scope (MUST / LATER / non-goals), 3 views, edge-state map, flows.
3. The operational model (`operational-model.md`): entities, freshness, state machines (station, parcel, incident), actions catalog with success and failure for every action, the priority model with a worked example, and the illustrative dataset.
4. A design system and a clickable prototype were produced as a design handoff (`PicksyOS Design System.dc.html` = the prototype, `PicksyOS Screens.dc.html` = the design-system page, `README.md` = tokens). The filenames were scrambled in the handoff, and the owner confirmed this was intended.

### Phase B: build and spec alignment
5. Implemented in React 18 + TypeScript (strict) + Vite, in `picksyos-console/`.
6. Compared item by item against `operational-model.md` and `product-brief.md`, and fixed the discrepancies.
7. Live browser click-through of the flows. Built an automated live check (`npm run check:live`, Puppeteer with real timers and clock skew), which started at 39 behaviours.
8. Context captured for the design tooling (impeccable): `PRODUCT.md` (via `teach`/init) and `DESIGN.md` + `.impeccable/design.json` (via `document`).

### Phase C: critique, then six ordered design passes
9. **First critique: 25/40 ("Acceptable")**, dual-agent heuristic review plus a detector. The top issues:
   - **P1:** the stated rank rule contradicted the queue order (it omitted the recipient-waiting rule).
   - **P1:** breaches were under-signalled ("−15 m" had the same footprint as a healthy countdown).
   - **P2:** sub-12 px text and an avatar that failed contrast.
   - **P2:** two competing next steps after a failure.
   - **P2:** no orientation, and an empty primary pane.
10. **Pass 1, clarify (rank trust + one next step):**
    - The ranking rule text was rewritten to match the code exactly.
    - Each why line leads with the reason that decides the row's position, in medium weight.
    - An action failure now points forward ("Yedek bağlantı yanıt vermedi. Sıradaki adım: saha ziyareti iste."). The new recommendation is the only primary button, and Retry is a quiet link.
    - A resolve says where the incident went, with a "Kuyrukta göster" link.
    - Copy: the empty state is computed.
11. **Pass 2, bolder but quiet (breach):** a 3 px error edge plus the word "Aşıldı" before the negative time. A panel-only deadline bar shows contract time used vs left, with its source ("Sözleşme hedefi 4 sa") and a screen-reader text equivalent.
12. **Pass 3, typeset:** everything raised to at least 12 px. The avatar initials were replaced by a text owner chip. The phone brand shows "PicksyOS." and is never cut mid-word.
13. **Pass 4, onboard:** an orientation pane when nothing is selected, key hints on Acknowledge (A) and the recommended action (R), and label grammar cleaned up.
14. **Pass 5, harden:**
    - Toasts are capped at 3 plus "+N olay daha".
    - Each queue row has a short structured accessible name.
    - Filters collapse at 200 % zoom and on phone.
    - The phone confirm is held to about 200 px or less.
15. **Pass 6, polish:**
    - The decision zone is the only card in the panel; the evidence sections became quiet sections with dividers.
    - The role switch, theme and simulated events were grouped into one "Demo kontrolleri" menu.
16. **Re-critique: 33/40 ("Good").** Audit: 15/20. The detector found only documented false positives (the brand's Inter font flagged as "overused", and nested-card flags on the inline confirm and locked recommendation).
17. **Pass 7, "internal dashboard, not a case study"** (owner direction: "it shouldn't feel like an academic test or case study; it should be the first version of an internal company dashboard, understandable by someone with scattered attention on a 3 a.m. shift"):
    - Concept tags (Illustrative / Proposed) were removed from all working screens and moved to Help → "Bu konsept hakkında".
    - The disclaimer became a thin footer line.
    - The empty pane was made short and actionable ("En üstteki olayı aç").
    - A 3-step first-visit tour was added.
18. **Header cleanup:** the owner asked to remove the "UX-unnecessary" header items. The P1/P2/P3 counts were removed from the header (they duplicated the band filters).
19. **Pass 8, harden (all P1/P2 audit items):**
    - Focus return after the confirm, the panel, Help and the tour.
    - An off switch for single-key shortcuts (WCAG 2.1.4), with shortcuts scoped so they never fire from the header or popovers.
    - Arrow keys scroll panel content instead of moving the selection.
    - 44 px phone targets, tablet overflow fixes, and header outline contrast of at least 3:1.
    - A rule change: **the recommendation follows the role.** An Operator on "Pickup window expired" is recommended "Bekletmeyi 2 gün uzat", and "İadeye ayır" stays visible as a locked secondary action.
20. **Pass 9, final cleanup.**

### Phase D: Pass 10 (in progress). Owner brief, reviewing "as both a user and a UI/UX hiring manager"
The four requests:
1. A pop-up on entry explaining that this is a case study, its assumptions, its evidence and what it means for Delivery One, understandable without knowing Delivery One.
2. A lean, self-guiding UI with low cognitive load, where the user *feels* a workflow is done.
3. Everything in Turkish except terms that must stay English.
4. An onboarding that introduces the whole workflow.

Decisions taken with the owner:
- The pop-up shows on the first visit and reopens from "Proje hakkında".
- The onboarding is hands-on: the user actually resolves the top incident.
- The "done" feeling comes from a step bar plus a done card.
- The docs stay in English, with the UI strings they quote updated to Turkish.
- **The welcome dialog is an explicit exception to the earlier "never modals" rule.** Inline confirms stay non-modal.

Sub-passes:
- **10a, Turkish copy: done.** A binding glossary (section 8) was applied in place, with no i18n framework. A rendered-text scanner found no English left except the tour counter "1 of 3", which the 10e tour rewrite will replace.
- **10b, distill: done.**
  - Type and band filters fold behind one "Filtrele" button on every width, while the bar keeps a quiet "P1 2 · P2 2 · P3 3" summary.
  - Section-header notes were removed.
  - In the panel, signals and the timeline moved behind one "Geçmiş ve sinyaller" disclosure.
- **10c, step bar + done card: done.** Owner feedback during this pass: the decision card felt cramped ("çok sıkışık"), and the station line "WAL-01 / İstanbul · Müşteri A / Kısmi arıza / Son sinyal 14:00 (güncel)" did not mean much. Both were addressed (section 5).
- **Scenario walk-through: done.** All 10 scenarios were played as the target user, with real clicks and waits on desktop and phone. Eight fixes were applied (section 6).
- **Field visit as a real work item: done** (owner request, 16 Oct 2026, D17). A request now creates a trackable field task with proposed, simulated stages (Talep edildi → Kabul edildi → Sahada → Tamamlandı, or İptal edildi). The inline confirm *is* the request (station, problem built from signals and the last failed action, impact, due, optional note; "Talebi gönder"). A task card sits in the decision zone; the task shows on the queue row, the station banner, the parcel page and the timeline (simulated steps tagged "Simüle"). Acceptance is simulated 10 s after the request; "Demo kontrolleri → Saha görevini ilerlet" moves it to On site and Completed, which closes the loop (station online, parcels ready, counts update). Cancel needs a reason and is not offered once on site; a station that recovers while a visit is open asks whether to cancel it. Explicitly not invented: technician names, contacts, tracking, maps, arrival estimates, SLA stats.
- **10d, welcome dialog: NOT built yet.**
- **10e, hands-on 7-step tour: NOT built yet.**
- **10f, docs sync, new checks, final critique and audit: NOT done yet.**

---

## 5. The product as it is now (16 Oct 2026)

### Stack and how to run it
- Vite 5, React 18, TypeScript 5.6 (strict). State lives in one `ConsoleEngine` class, read through `useSyncExternalStore`.
- Hash routes: `#/queue?incident=&type=&band=`, `#/stations/:id`, `#/parcels/:id`.
- Run `npm run dev` in `picksyos-console/` (http://localhost:5173).
- **Demo clock:** starts at 14:00 on the day it is opened and runs in real time.
- **Scenes:** `?scene=inc101-confirm` etc. freeze the clock for screenshots. Available scenes: inc101, inc101-confirm, inc101-running, inc101-done, inc102-failed, inc102-field-confirm, inc102-awaiting, inc102-complete, inc105-owner, inc104-recovered, inc104-toast, inc108-locked, inc108-supervisor, inc103, inc106, inc091.
- **Verification:**
  - `npm run check:live`: 57 live behaviours, real timers (44 before the field-task work, plus 13 for it).
  - `npm run check:a11y`: 16 keyboard, focus, zoom and touch checks.
  - Typecheck and build.
  - All green after every pass.

### Seed world (all invented)
- 12 stations in Istanbul and Ankara for customers A, B and C. Contract targets are illustrative (A = 2 h, B = 4 h); parcel-level types use an 8 h internal target.
- **On load at 14:00:**
  - Header: Çevrimdışı 4 · Sinyal gecikiyor 1.
  - Needs attention (7 incidents): P1 2 · P2 2 · P3 3.
  - In hand: 1. Resolved today: 2.
- **Queue order at load:**
  - **INC-101** · P1 · Teslim arızası · WAL-01 İstanbul: "Alıcı istasyonda bekliyor · 1 paket engelli", 1 sa 56 dk left.
  - **INC-102** · P1 · İstasyon çevrimdışı · LIT-03 Ankara: deadline breached 15 min ago ("Son süre 15 dk önce aşıldı"), no pickups possible, 18 parcels blocked.
  - **INC-105** · P2 · LIT-04 offline · owned by Operatör B.
  - **INC-104** · P2 · PRO-02 offline · recovers on its own at 14:01:30.
  - **INC-108** · P3 · Teslim alma süresi doldu · LIT-02.
  - **INC-107** and **INC-106** · P3 · Kod bildirimi iletilemedi.
  - **In hand:** INC-103 · WAL-02 offline, awaiting field task FT-031.
- **Live dynamics:**
  - INC-104 recovers at 14:01:30.
  - INC-101 drops from P1 to P2 at about 14:06 if untouched (the D10 window ends).
  - LIT-06 stays "Sinyal gecikiyor" (D16).
- **Seed outcomes (fixed, so the demo replays the same way):**
  - Retry dispense on INC-101 succeeds.
  - Backup connection on INC-102 and INC-105 fails.
  - The field visit then resolves via "Demo kontrolleri → Saha görevini tamamla".

### Layout and screens
- **Header:**
  - The product name "PicksyOS Operations Console." in plain text with a lime full stop.
  - Network status pills: "Çevrimdışı 4" (error icon) and "Sinyal gecikiyor 1" (dashed).
  - The mono clock, "Yardım", and "Demo kontrolleri" (role switch Operatör/Süpervizör, theme, Sıfırla, Saha görevini tamamla, Yük testi, failed submit).
  - Phone: two status cells and a "more" menu.
- **Footer (every screen, every width):** "Bağımsız bir konsept çalışmasıdır. Delivery One ile bağlantılı değildir ve onayını taşımaz. Veriler temsilîdir."
- **Queue (left, about 40 %):**
  - "Filtrele" disclosure plus the band summary.
  - Sections: "Müdahale bekliyor" (ranked), "İşlemde", "Kendiliğinden düzeldi: kapatmayı onayla", "Bugün kapananlar" (collapsed).
  - Each row shows: the band badge, type, station, city and ID, a countdown on the right, a why line with the deciding reason first, and chips for owner and status.
  - Breached rows get the 3 px error edge.
- **Empty detail pane:** "Açık olay seçilmedi", one lime button "En üstteki olayı aç" naming the live top row, a network status line ("12 istasyon · 7 güncel · 4 çevrimdışı · 1 sinyal gecikiyor"), and key hints.
- **Incident panel.** The decision card is the only card, restructured in 10c:
  1. **Top:** ID, band, status chip, owner chip and "Üstlen" (Acknowledge). Then the heading (the incident type). Then the **step bar**: Tespit → Sahiplen → Aksiyon → Sonuç → Kapandı (detect → own → act → outcome → closed).
  2. **Assessment:** "Neden P1" (all reasons) **beside** "Son süre 15:56" with a large countdown, the deadline bar and its source ("Sözleşme hedefi 2 sa"). The deadline reason is not repeated in the reasons list. On narrow widths the two stack.
  3. **Recommendation and actions:** "Önerilen sonraki adım" plus a one-line reason, the lime primary, and secondary actions with disabled reasons shown inline.
     - The inline confirm opens under it: "ONAY · TESLİMİ YENİDEN DENE · PCL-0107 paketi WAL-01 kapağına gönderilir. Alıcı bekliyor olabilir." with Onayla, Vazgeç and "Esc ile vazgeç".
  4. **Details row,** where every value has its own label: İstasyon (WAL-01 İstanbul, link) · İstasyon durumu (a chip plus a plain meaning, e.g. "Kısmen kullanılabilir · açık bir teslim arızası var") · Son sinyal ("14:00 · güncel", or "09:35 · 4 sa 25 dk önce" in the stale style) · Açılış · Sorumlu.
     - The customer name was removed from the panel; it stays on the station page.
  - Below the card: "Etkilenen paket(ler)", each row showing the parcel, compartment, flags and hold-until; then the folded "Geçmiş ve sinyaller (3 sinyal · 4 kayıt)".
- **Step bar mapping** (presentation only, derived from status):
  - Open: Sahiplen is current, with the sub-line "ilk işlemle otomatik" (the first action claims the incident).
  - Acknowledged: Aksiyon is current. After a failure it shows "son deneme başarısız" in the error tone.
  - In progress: Aksiyon shows a spinner and "sürüyor".
  - Awaiting field: Sonuç is current, with "saha ekibi".
  - Recovered: Sahiplen and Aksiyon are dashed with "gerekmedi", Sonuç reads "kendiliğinden düzeldi", and Kapandı reads "onayınız bekleniyor".
  - Resolved: all steps done.
  - Shape carries the state (check, filled ring, hollow circle, dashed circle), and screen readers get the state word.
- **Done card** (replaces the success notice when an incident closes):
  - "✓ Olay kapandı" plus the time.
  - The action result ("Paket kapağa ulaştı.").
  - Sonuç / Süre / Kapatan (outcome / duration / closed by).
  - A primary **"Sıradaki olay: P1 INC-102 · İstasyon çevrimdışı ›"** that follows the live ranking, plus a quiet "Kuyrukta göster".
  - Right after a close, focus moves to that button, so Enter continues the work.
  - On phone the button sits in the sticky bottom sheet as the primary.
  - "Yeniden aç" (Reopen) becomes secondary. A closed incident no longer shows the old ownership banner.
- **End state:** when nothing is open anywhere, "✓ Tüm olaylar kapandı · 12 istasyon izleniyor".
- **Station page:**
  - Breadcrumb, then the mono ID, the state chip and freshness.
  - Stats: Erişilebilirlik, Bekleyen paket, Sözleşme hedefi, LTE yedeği, Raporlama aralığı. They are dashed and stamped "son veri hh:mm" when stale.
  - Open incidents, parcels held (blocked first) and station history.
  - Out of service / Return to service actions.
- **Parcel page:**
  - Flags, compartment, masked recipient, dates, notifications, linked incidents, history.
  - Only the actions that act on the parcel are offered.
  - Offline-station parcels say "Paket işlemi yok: istasyon çevrimdışı. INC-102 üzerinden ilerleyin."
- **Help ("Yardım"):** the ranking rule (single source), the band legend, keys, "Bu konsept hakkında" (what is invented: Temsilî / Önerilen / Demo kontrolü), a shortcuts off switch, and "Turu tekrar göster".
- **Keyboard:** ↑/↓ moves through the queue, Enter opens, A acknowledges, R runs the recommended action, Esc closes, g q returns to the queue. Single-key shortcuts can be switched off.
- **Phone (under 768 px):** a full-width queue; the panel becomes a page with "Kuyruğa dön"; a sticky action sheet (at most 45 % of the view); every target at least 44 px; no horizontal scroll.
- **Themes:** light ("paper ledger") and dark ("ledger ink"), both WCAG AA. The theme is applied before paint, with no flash.

### The flows (in the current Turkish UI)
- **Primary, 3 clicks:** open INC-101 → "Teslimi yeniden dene" → "Onayla".
  - The button reads "Teslim yeniden deneniyor…", the row moves to "İşlemde", and the step bar spins on Aksiyon.
  - It succeeds and the done card appears. P1 drops to 1, INC-102 becomes the top row, and "Sıradaki olay" leads there.
- **Flow A, failure then escalation (INC-102):**
  - "Yedek bağlantıya geç" (no confirm) fails with "Yedek bağlantı yanıt vermedi. Sıradaki adım: saha ziyareti iste."
  - The recommendation becomes "Saha ziyareti iste". Its confirm shows the request (İstasyon, Sorun, Etki, Son süre "13:45 · Sözleşme hedefi 4 sa", "Süre 15 dk önce aşıldı. Daha erken bir zaman yok.", optional note) and sends with "Talebi gönder".
  - The task card "Saha görevi FT-032" appears; the row in "İşlemde" reads "FT-032 · Talep edildi · son süre 13:45". After 10 s (simulated) it reads "Kabul edildi".
  - "Demo kontrolleri → Saha görevini ilerlet" moves it to "Sahada" (cancel no longer offered), then to "Tamamlandı": INC-102 resolves, LIT-03 is back online, its 18 parcels are ready, Offline drops to 3.
  - Measured in a real-browser walk: load P1 2 · Offline 4 → request sent P1 1, İşlemde 2 → accepted → on site → completed Offline 3, İşlemde 1.
- **Flow B, soft ownership (INC-105):**
  - The panel notice reads "Operatör B 13.40’ta üstlendi." with a "Devral" button (it shows "Devralınıyor…" while running).
  - Or any action first asks "Bu olay 13:40 itibarıyla Operatör B üzerinde. Devralırsanız kayda geçer." with "Devral ve devam et".
  - The log records "Devralındı · önceki sorumlu: Operatör B".
- **Flow C, permission (INC-108):**
  - As an Operator the recommendation is "Bekletmeyi 2 gün uzat", and "İadeye ayır" is locked with "Süpervizör onayı gerekli". The tooltip reads "Geri alınamaz: paket alıcının erişiminden çıkar. Süpervizör onayı gerekir."
  - As a Supervisor the recommendation is "İadeye ayır".
- **Recovery (INC-104):** it moves to "Kendiliğinden düzeldi: kapatmayı onayla" with a toast, then "Onayla ve kapat".
- **Notification (INC-107):**
  - "Kodu yeniden gönder" is offered first.
  - "Başka kanaldan gönder" opens only after a failed resend ("İletilmeyen bir yeniden gönderimden sonra açılır").
  - "Ulaşılamadı olarak kapat" opens after 2 failed attempts and needs a note.

---

## 6. Scenario walk-through (as the target user) and the fixes it produced

**Method:** a scripted browser session played 10 scenarios with real clicks and real timers, on desktop 1440×900 and phone 390×844, from a fresh browser. It ran 28 steps, saving a screenshot and a text log of focus, toasts and panel text at each step. No JS errors.

**Scenarios:**
1. First visit.
2. INC-101 happy path through to "Sıradaki olay".
3. INC-102 failure, then field visit.
4. INC-105 takeover.
5. INC-108 as Operator, then as Supervisor.
6. INC-107 notification.
7. Station and parcel pages.
8. Filters and keyboard.
9. Phone happy path.
10. INC-106 and Help.

**Findings and fixes (all presentation, copy or focus; behaviour unchanged):**
1. **The step bar contradicted the action.** It said "claim first", but the recommended action claims the incident automatically. Fix: "ilk işlemle otomatik" under Sahiplen.
2. **The parcel page contradicted itself.** It said "no linked open incident" directly above a linked open incident. Fix: case-specific copy pointing to the station incident.
3. **While waiting for the field team, the only highlighted button was "cancel the visit".** Fix: cancel is now secondary, and the notice says no action is needed.
4. **Moving on after a close was slow.**
   - Keyboard: focus stayed on the heading, about 10 Tabs from "next".
   - Phone: the sheet's only action was "Reopen".
   - Fix: focus moves to "Sıradaki olay" right after a close (never stealing focus from elsewhere), and on phone it is the sheet's primary.
5. **No progress state during the takeover.** Fix: "Devralınıyor…".
6. **The waiting notice repeated the deadline line.** Fix: deduplicated.
7. **The done card said "Olay kapandı" twice.** Fix: the trailing sentence was removed from the result line.
8. **Station and parcel pages left focus on `<body>`.** Fix: focus moves to the page heading.

Honest notes:
- Two first-read findings were wrong and were corrected before fixing. The "locked-looking" takeover buttons were only the one-second busy state, and a scroll jump was caused by the test script.
- What the walk-through confirmed works:
  - The queue order reads at a glance.
  - The confirm sentences state the consequence.
  - Failures name the next step.
  - The locked supervisor path is clear.
  - Stale data never looks healthy.

---

## 7. Constraints held across every pass (useful as a "design principles in practice" section)

- **Behaviour never changed during design passes:** the ranking (bands, D10, D13), transitions, the actions catalog, permissions, freshness and seed outcomes. Every pass was verified by the live checks, typecheck and build, and work stopped if anything broke.
- **No feature creep:** nothing beyond what was requested. A "jump to next breached" feature was explicitly rejected.
- **Colour:** lime and brand green never mean OK; status is never shown by colour alone; stale is never shown as healthy.
- **Disclaimer and brand:** the disclaimer is always visible, and there is no Delivery One logo.
- **Accessibility:** 12 px floor and WCAG 2.2 AA in both themes.
- **Docs move with the copy:** a docs-sync rule says any UI string quoted in the docs changes in the docs in the same pass. 111 doc changes are logged in `docs/design-passes-changelog.md` (file → old → new).

### Product principles (from `PRODUCT.md`)
1. Action comes before overview.
2. Every rank and every number explains itself on screen.
3. Uncertainty is visible.
4. The operator sees the outcome where they acted, and every action leaves a trace.
5. Nothing is a dead end.

---

## 8. Turkish UI glossary (binding; English is the docs' wording)

| Area | English → Turkish |
|---|---|
| Queue sections | Needs attention → Müdahale bekliyor · In hand → İşlemde · Recovered: confirm to close → Kendiliğinden düzeldi: kapatmayı onayla · Resolved today → Bugün kapananlar |
| Incident types | Station offline → İstasyon çevrimdışı · Retrieval failure → Teslim arızası · Code notification failed → Kod bildirimi iletilemedi · Pickup window expired → Teslim alma süresi doldu |
| Statuses | Open → Açık · Acknowledged → Üstlenildi · Action in progress → İşlem sürüyor · Awaiting field service → Saha ekibi bekleniyor · Recovered → Düzeldi · Resolved → Kapandı |
| Station states | Online → Çevrimiçi · Degraded → Kısmi arıza · Signal delayed → Sinyal gecikiyor · Offline → Çevrimdışı · Out of service → Hizmet dışı |
| Actions | Acknowledge → Üstlen · Take over → Devral · Retry dispense → Teslimi yeniden dene · Set station out of service → İstasyonu hizmet dışı bırak · Return to service → Hizmete al · Switch to backup connection → Yedek bağlantıya geç · Request field visit → Saha ziyareti iste · Cancel field visit → Saha ziyaretini iptal et · Confirm and close → Onayla ve kapat · Reopen → Yeniden aç · Resend code → Kodu yeniden gönder · Send by other channel → Başka kanaldan gönder · Close as unreachable → Ulaşılamadı olarak kapat · Mark for return → İadeye ayır · Extend hold +2 days → Bekletmeyi 2 gün uzat |
| Panel | Recommended next step → Önerilen sonraki adım · Why P1 → Neden P1 · Deadline → Son süre · Contract target → Sözleşme hedefi · Internal target → İç hedef |
| Header | Help → Yardım · Concept controls → Demo kontrolleri · Operator / Supervisor → Operatör / Süpervizör |
| Countdowns | 1 sa 56 dk · 3 sa 00 dk · 22 dk · Aşıldı −15 dk |
| Kept in English | PicksyOS, Delivery One, P1/P2/P3, LTE, SMS, IDs (INC-/PCL-/LIT-/FT-), key names |

---

## 9. Scores and evidence of quality (use exactly; do not inflate)

| Measure | Value | When |
|---|---|---|
| Heuristic critique (10 Nielsen heuristics, 0–4 each) | **25/40 → 33/40** | Before Pass 1 → after Pass 7. Not re-run after Passes 8–10 (planned in 10f) |
| Technical audit | 15/20 | After Pass 7. Pass 8 then fixed all its P1/P2 items. Not re-run since |
| `check:live` | 57/57 | After the field-task work (44/44 after every earlier sub-pass) |
| `check:a11y` | 16/16 | Same |
| Detector | Only documented false positives (the brand's Inter font; nested-card flags on the confirm and locked recommendation) | After Pass 7 |
| Usability testing | **None** | — |

---

## 10. What is not done yet (state this honestly in the case study, or wait for it)

- **10d: welcome dialog.** A real modal: a focus trap, Esc and ×, first visit only, reopenable from a header button "Proje hakkında", never shown in scenes. It has 4 pages:
  1. "Bu nedir?": what Delivery One is, in plain words.
  2. "Problem ve varsayımlar": H1–H5 with confidence levels.
  3. "Kanıtlar": the sourced facts S1–S9, the analogs A1–A5, and what is invented.
  4. "Delivery One için anlamı": the value, plus 5 validation questions.

  The final button "Akışı öğren" starts the tour.
- **10e: hands-on 7-step tour** on the top incident. Steps advance on real actions:
  1. The queue.
  2. Open the top incident (with "Benim için aç").
  3. Why and deadline.
  4. Run the recommended step.
  5. Confirm.
  6. Wait for the result (it explains a failure if one happens).
  7. The done card.

  It also fixes the English "1 of 3" counter in the current 3-step tour.
- **10f:**
  - Sync the docs to the Turkish UI strings and the new components; a pending list is kept.
  - Add welcome → tour → done-card checks to `check:live`.
  - Take batched screenshots in light and dark, desktop and phone.
  - Re-run the critique and the audit.
- Until 10f, the English docs (`product-brief.md`, `operational-model.md`, `docs/design-system.md`) still quote the **English** UI strings. The Turkish strings in this file are the current UI.

---

## 11. Suggested case study angles (supported by the record above)

- **"Three decisions"** (the owner already marked D10 as a candidate):
  1. **D10, the mixed ranking rule:** a person at the hatch outranks a breached contract, for 10 minutes only.
  2. **Visible rule instead of a risk score (D4/UX2),** and the trust bug the first critique found: the rule text and the actual order disagreed, which was fixed in Pass 1.
  3. **Stale is never healthy (D5/D16),** built into its own visual material (grey, dashed, stamped).

  Alternatives: **soft ownership (UX5)**; **the recommendation follows the role (D11 + Pass 8)**; **"priority is weight, not hue" (D15)**.
- **The tension between case study and tool:** Pass 7 moved every concept tag off the working screens to make it feel like a real v1 tool. Pass 10 then adds an explicit case-study welcome dialog, keeping the honesty in one place instead of on every row.
- **Designing the end of a task:** the step bar and the done card with "Sıradaki olay", born from the owner's request that the user should *feel* a workflow is done. The walk-through then found that the step bar contradicted the action button, and that was fixed.
- **Brand adaptation for operations:** where Delivery One's public brand had to bend (lime contrast 2.35:1, the OK green next to identity lime, weight 300 body text, no unknown state, no dark system).
- **Process discipline:**
  - A critique → ordered passes → re-critique loop.
  - Behaviour locked by automated live checks during every visual pass.
  - Docs changed with the copy (111 logged changes).
  - Honest corrections recorded (D11 over-restriction fixed; walk-through misreads corrected).
- **What I would validate first with Delivery One:** H1 (who watches), H2 (real incident types), H4 (how they rank), H5 (whether a hold period exists).

---

## 12. Source files (read these for detail and exact wording)

All paths are relative to the repository root `deliveryone/`.

| File | What it holds |
|---|---|
| `evidence.md` | Sources S1–S9, analogs A1–A5, facts, H1–H10, open questions, brand values and contrast, D1–D16 |
| `product-brief.md` | Problem, user, scope, flows, screen specs, interaction patterns, edge-state map, UX1–UX5 |
| `operational-model.md` | Entities, freshness, state machines, actions catalog, priority model with a worked example, dataset |
| `PRODUCT.md` | Product context, principles, accessibility commitments |
| `docs/design-system.md` | Canonical design system: rules, colour/type/space tokens, components, canonical copy, brand deviations |
| `DESIGN.md` + `.impeccable/design.json` | Machine-readable mirror of the design system ("The Night-Shift Ledger") |
| `docs/design-passes-changelog.md` | All 111 doc changes, pass by pass, as old → new |
| `.impeccable/critique/*.md` | The two critique snapshots (25/40 and 33/40) with priority issues |
| `PicksyOS Design System.dc.html` | The original prototype from the design handoff (despite its name) |
| `PicksyOS Screens.dc.html` | The original design-system page from the handoff (despite its name) |
| `picksyos-console/` | The shipped React app; `scripts/live-check.mjs` and `scripts/a11y-check.mjs` hold the checks |
