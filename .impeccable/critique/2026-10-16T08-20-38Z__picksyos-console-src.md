---
target: PicksyOS console (picksyos-console/src)
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\yerde\\OneDrive\\Desktop\\deliveryone\\picksyos-console\\src"
timestamp: 2026-10-16T08-20-38Z
slug: picksyos-console-src
---
# Critique: PicksyOS Operations Console (picksyos-console/src)

Method: dual-agent (A: ab065289db5d3ce76 · B: acf0fb75b7e1b7ded)

## Design Health Score: 25/40 (Acceptable)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of status | 3 | Empty state "12 stations reporting" vs header "Signal delayed 1" |
| 2 | Match real world | 3 | "D+2 16:20", "3 h 0 m" machine-like |
| 3 | User control | 3 | Inline Cancel/Esc; panel stable through re-rank |
| 4 | Consistency | 2 | Rule tooltip says "sorted by deadline"; recipient-waiting INC-101 sits above breached INC-102 |
| 5 | Error prevention | 3 | Inline confirms with consequence; irreversible action locked |
| 6 | Recognition vs recall | 2 | Shortcuts unexposed; rule only in hover tooltip; phone "⋯" unlabeled |
| 7 | Flexibility | 2 | Shortcuts undiscoverable; no next-breached jump |
| 8 | Minimalist | 3 | Calm; 40x "Illustrative" chips in stress; ~10 header controls |
| 9 | Error recovery | 2 | Red Retry competes with lime new recommendation after failure |
| 10 | Help | 2 | No orientation for bands, rule, labels, demo controls |

## Design specificity
Mostly authored (weight-not-hue bands, stale grammar, why-lines, parcel labels, inline concept labels). Panel blocks are uniform cards; the contract countdown has no visual form; ~60% blank canvas on load.
Detector: source scan clean (regex only, undercount). URL scans: undersized-ui-text (10px .concept--sm, app.css:83), tiny-text (.hint 11px app.css:26, .block__aside 11px app.css:255, phone disclaimer 11px app.css:320), low-contrast ADV owner-chip avatar 3.3:1 / 3.9:1 (app.css:126) — true positives vs DESIGN.md 12 px Floor + WCAG AA. overused-font (Inter) and nested-cards (.confirm) false positives.

## Priority issues
1. [P1] Stated rank rule contradicts queue order (RANKING_RULE omits recipient-waiting-first). Fix rule text + visible "#1 · recipient waiting". /impeccable clarify
2. [P1] Breach under-signalled: "−15 m" same footprint as healthy countdown. Err edge + "Breached" word on row; contract-time bar in panel. /impeccable bolder
3. [P2] Sub-12px text and avatar contrast (concept, hint, block__aside, outcome, chip--sm, sum__band, phone disclaimer; avatar initials). /impeccable typeset
4. [P2] Competing next steps after failure (Retry vs new lime recommendation). Demote Retry, point forward. /impeccable clarify
5. [P2] No orientation; empty primary pane. Orientation panel (rule, bands, keys, label legend, start action) + key hints. /impeccable onboard

## Persona red flags
- Alex: no shortcut hints; g q 1.2 s window without feedback; no next-breached jump; 7 chips to filter.
- Sam: verbose row accessible name; "−15 m" lacks text alternative; rule tooltip on focusable span; filter bar ~5 rows at 200%; phone sticky confirm ~280/844 px.
- Hiring reviewer: criterion 1 rule contradiction; criterion 3 two CTAs; criterion 5 Resolved collapsed; criterion 6 label density, no legend; no start point.

## Minor observations
Toast stack uncapped (scene artifact made it 11; live expiry 6 s) → harden. Spaced mono countdowns. "12 stations reporting" ambiguity (brief copy). "PARCEL 1 · 1 blocked" stutter. Phone: brand truncation, 2-line disclaimer, Acknowledge orphaned. Locked tooltip covers Recommended header; no lime action left. Stress P1 notification row "parcel otherwise fine".

## Questions
- Why is the core contract countdown the least visual element?
- Should a rank ever need a tooltip?
- Why is the reviewer's first view (empty right pane) blank?
