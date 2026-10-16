# Engineering handoff

From concept prototype to a production console. Do the steps in order. Each step ends with its check.

## 0. What you are getting

| Real (keep) | Mock (replace) |
|---|---|
| Screens, components, tokens, copy (Turkish UI) | Seed data in `engine.ts` (12 stations, 10 incidents) |
| Ranking rule, state machines, actions catalogue | Demo clock (starts 14:00), scripted action outcomes |
| Keyboard, focus, a11y behaviour | Field-service stages (simulated, D17) |
| 62 live + 16 a11y checks | Demo kontrolleri menu, `?scene=` states, the case study page (`#/`), the tour |

Spec lives in docs, not in code comments. If code and docs disagree, ask; do not guess.

## 1. Run and verify (15 min)

```bash
cd picksyos-console
npm install
npm run dev                      # keep running
npm run typecheck && npm run build
npm run check:live               # expect 62/62
npm run check:a11y               # expect 16/16
```

Done when all four pass on your machine.

## 2. Read (45 min, this order)

1. `product-brief.md`: flows A, B, C and the edge-state map.
2. `operational-model.md` §1 entities, §2 freshness, §3 state models, §4 actions, §5 priority.
3. `docs/design-system.md` §1 rules, §5 components.
4. `picksyos-console/README.md`: code structure.

Code map:
- `src/domain/engine.ts`: state, `derive()` (band + reasons), `rec()` (recommended action), `actionsFor()`, `act()` → `finish()`/`apply()`, `tick()`.
- `src/domain/selectors.ts`: pure view models (`queueModel`, `panelModel`, `stationModel`, `parcelModel`, `taskView`).
- `src/components/`: rendering only. No business rules here.

## 3. Invariants (must survive every change)

1. Rank = written rule (bands P1–P3; recipient waiting first in P1 for 10 min; then deadline; then parcels blocked). No hidden score.
2. Only Open and Acknowledged are ranked. In hand / Recovered / Resolved are grouped, not ranked.
3. Stale data is never shown as healthy (signal delayed → unknown, dashed, "son veri hh:mm").
4. Counts are computed from records, never stored.
5. Parcel-affecting actions confirm inline. No modal confirms.
6. Every action writes an event. Every action has a success and a failure outcome.
7. Only "Mark for return" needs a supervisor. Enforce on the server; the UI lock is only presentation.
8. Results show inline where the operator acted. Toasts only for off-screen changes.
9. Lime never means OK. State is never colour alone. Text ≥ 12 px. WCAG 2.2 AA both themes.

Put these in your PR template.

## 4. Get answers before building (blockers)

Ask Delivery One. Each answer changes the build.

| # | Question | Blocks step |
|---|---|---|
| Q1 | Who watches stations, and how many per shift? | 9 (roles), scope |
| Q2 | Heartbeat interval; how is offline told apart from quiet? | 6 (freshness thresholds) |
| Q3 | Which remote actions exist as APIs today? Which are logged? | 7 |
| Q4 | Contract response times: per customer or per unit, business or calendar hours? | 5 (deadlines) |
| Q5 | How are field visits requested and tracked today? | 8 |
| Q6 | Is there a parcel hold period? | 5 (Pickup window expired) |

Until answered, keep the illustrative values and flag them in config.

## 5. Data contract

Define the API from `operational-model.md` §1 before writing UI code.

Prompt:
```
Read operational-model.md §1–§5 and picksyos-console/src/domain/types.ts.
Write an OpenAPI 3.1 spec for: stations, parcels, incidents, service tasks, events.
Include: GET lists with filters, GET by id, POST action commands (one per action in §4),
an event stream (SSE) for heartbeats, incident changes and task stage changes.
Every command takes an idempotency key and returns 202 + a command id.
Do not invent fields that are not in the docs; list missing ones as open questions.
```

Done when the spec is reviewed by backend and every field maps to a doc line.

## 6. Data layer behind an interface

Prompt:
```
In picksyos-console, move all seed data out of ConsoleEngine into a DataSource interface
(stations, parcels, incidents, events, subscribe()). Keep a MockDataSource that returns
today's seed exactly, so check:live stays 62/62. Engine and selectors must not import
mock data directly. No behaviour change. Run typecheck, build, check:live, check:a11y.
```

Then add `ApiDataSource` against the step-5 spec, behind an env flag (`VITE_DATA=mock|api`).

Prompt:
```
Implement ApiDataSource from openapi.yaml. Use SSE for live updates and map them into the
same records the engine uses today. Freshness thresholds (3 min delayed, 10 min offline)
come from config, not constants. lastSeen comes from the server heartbeat time.
Keep counts computed client-side from records.
```

## 7. Actions as server commands

Prompt:
```
Replace the scripted outcomes in engine.finish()/apply() with server commands.
Flow stays: confirm → owner check → POST command → pending state → result event.
Map server outcomes to the existing Result copy (success / failure with next step /
"Gönderilemedi. Hiçbir şey değişmedi." for a failed submit). Keep the failure → new
recommendation behaviour. The event log is written by the server; the client only renders it.
```

Done when every row of `operational-model.md` §4 has a passing test for success and failure.

## 8. Field service

D17 stages (Requested → Accepted → On site → Completed, Cancelled) are proposed. Map them to the real system after Q5.

Prompt:
```
Map our TaskStage (types.ts) to the field-service system's states from <their docs>.
Remove the simulated 10 s auto-accept and the "Saha görevini ilerlet" demo control in api mode.
Keep: cancel needs a reason, cancel only before On site, completion resolves the incident and
the station's state comes from its heartbeat, not from the task.
```

## 9. Auth, roles, ownership

Prompt:
```
Add authentication (company SSO). Roles: operator, supervisor. The server rejects
"markReturn" from operators. Replace the Demo kontrolleri role switch with the session role.
Ownership: take-over uses optimistic concurrency (incident version); on conflict show the
existing ownership notice with the new owner. Owner names come from the directory.
```

## 10. Remove concept-only parts (api mode)

- Demo kontrolleri menu, `?scene=`, demo clock → real time.
- Footer disclaimer → remove only with brand approval.
- Case study page (`#/`): remove from the product build; the console route becomes the root.
- Tour: product decision; keep it if useful.

Prompt:
```
Behind VITE_DATA=api, hide the Demo kontrolleri menu, disable applyScene, and use real time
(remove the 14:00 anchor and the frozen clock). Mock mode keeps all of them for demos and tests.
```

## 11. Strings

All UI copy is Turkish and inline (constants.ts, engine.ts, selectors.ts, components).

Prompt:
```
Extract every user-facing string into src/i18n/tr.ts with stable keys. No copy changes.
Then run a rendered-text scan of all scenes: no hard-coded string may remain outside tr.ts.
```

## 12. Tests in CI

Prompt:
```
Port scripts/live-check.mjs and scripts/a11y-check.mjs to Playwright test files, keep
every check name and assertion. Add unit tests for derive() bands and reasons, the
partition() sort (worked example in operational-model.md §5), actionsFor() per status,
and rec() per role. Run both suites in CI on every PR against MockDataSource.
```

## 13. Definition of done (every PR)

- typecheck, build, live checks, a11y checks green.
- Invariants in §3 untouched, or the docs changed in the same PR.
- Any UI string quoted in the docs is changed in the docs too; log it in `docs/design-passes-changelog.md`.
- Both themes and phone width checked.
