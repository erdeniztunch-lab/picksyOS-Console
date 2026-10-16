# Design handoff (original files)

The files exported by the design tool, kept as received. **Their names do not match their contents.** Use this table, not the filenames.

| File | What it actually is |
|---|---|
| `PicksyOS Design System.dc.html` | The clickable console prototype: all behaviour and the seed data. The React app in `picksyos-console/` is a port of its script. |
| `PicksyOS Screens.dc.html` | The design-system page: component boundaries, breakpoints, deviations from the brand. |
| `PicksyOS Console.dc.html` | The component sheet. |
| `support.js` | The screens board (an HTML page). |
| `tokens.css` | The design tool's runtime script (generated JavaScript). |
| `tokens.ts.md` | The design tokens as a TypeScript object (mirrored in `picksyos-console/src/design/tokens.ts`). |
| `COMPONENTS_AND_DEVIATIONS.md` | The design tokens as CSS custom properties (mirrored in `picksyos-console/src/styles/tokens.css`). |

The live source of truth is now the code and `docs/design-system.md`. These files are reference only; they are not edited.
