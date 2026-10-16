# PicksyOS Operations Console

React + TypeScript build of the PicksyOS console. Independent concept, illustrative data. Start with the [repository README](../README.md); engineers, see [HANDOFF.md](../HANDOFF.md).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run check:live # with the dev server running: drives the live flows in headless Chrome (57 checks)
npm run check:a11y # keyboard, focus return, 200 % zoom, tablet overflow, 44 px targets, tour placement (16 checks)
```

`check:live` moves the demo clock forward by shifting `Date.now()` in the page, so the timed checks (14:01:30 recovery, 14:06 band drop) run in seconds. Set `CHROME=` if Chrome is not at the default Windows path, and `URL=` if the dev server is on another port.

## Structure

- `src/domain/` — no React here.
  - `engine.ts`: seed data, demo clock (anchored at 14:00), ranking rule, action lifecycle (confirm → owner check → run → scripted outcome), keyboard shortcuts, scenes.
  - `selectors.ts`: turns engine state into view data for the queue, incident panel, station page and parcel page.
  - `router.ts`: hash routes (`#/queue?incident=…&type=…&band=…`, `#/stations/:id`, `#/parcels/:id`).
- `src/components/` — one file per component area, named after the component boundaries in the design system (AppHeader, QueueSection/QueueRow, IncidentHeader, ActionBar/InlineConfirm, ResultNotice, ParcelRow, Breadcrumb, Toast…).
- `src/styles/tokens.css` — CSS custom properties. `src/design/tokens.ts` holds the same values as a TS object.

React reads the engine through `useSyncExternalStore`. Each mutation ends in `engine.emit()`.

## Scenes

Append `?scene=<name>&theme=light|dark` to load a scripted state with the clock frozen at 14:00. Examples: `inc101-confirm`, `inc102-failed`, `inc108-locked`, `stress-filter`, `st-LIT-06`, `pcl-0412`. The full list is in `applyScene` in `engine.ts`.

## Keyboard

↑/↓ move through the queue · Enter opens · A acknowledges · R runs the recommended action · Esc cancels or closes · g then q goes back to the queue.
