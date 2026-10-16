// PicksyOS Operations Console tokens. Mirrors tokens.css (CSS custom properties).
export const color = {
  light: {
    canvas: '#f7f7f6', surface: '#ffffff', sunken: '#f2f2f2', border: '#e8eae8', borderStrong: '#8a8f8a',
    text: '#111312', text2: '#3d423e', textMuted: '#5f645f',
    accent: '#84b926', accentInk: '#0a0b0a', accentText: '#4a6b22', accentSoft: '#eef6df',
    focus: '#4a6b22', focusHalo: '#84b92673',
    ok: '#3f6e14', okBg: '#e8f2de', warn: '#8a5a06', warnBg: '#fbf1dc', err: '#a8321f', errBg: '#f9e4e0',
    info: '#335f7c', infoBg: '#e2edf3', unk: '#565b57', unkBg: '#f2f2f2', unkBorder: '#8a8f8a',
    p1Bg: '#111312', p1Fg: '#ffffff', p2Line: '#111312', p2Fg: '#111312', p3Line: '#bfc3bf', p3Fg: '#5f645f',
    moved: '#fbf1dc', skeleton: '#e8eae8',
  },
  dark: {
    canvas: '#0a0b0a', surface: '#111312', sunken: '#1b1e1c', border: '#2a2e2b', borderStrong: '#6e736f',
    text: '#f2f2f2', text2: '#c6cac6', textMuted: '#9ca19c',
    accent: '#a6e22e', accentInk: '#0a0b0a', accentText: '#a6e22e', accentSoft: '#1c2610',
    focus: '#a6e22e', focusHalo: '#a6e22e59',
    ok: '#8fcb5c', okBg: '#18240f', warn: '#e8b552', warnBg: '#2a200c', err: '#f2856f', errBg: '#2e1612',
    info: '#86b6d6', infoBg: '#0f1f29', unk: '#b1b6b1', unkBg: '#1b1e1c', unkBorder: '#7d827d',
    p1Bg: '#f2f2f2', p1Fg: '#0a0b0a', p2Line: '#f2f2f2', p2Fg: '#f2f2f2', p3Line: '#3d423e', p3Fg: '#9ca19c',
    moved: '#2a200c', skeleton: '#2a2e2b',
  },
} as const;

export const font = { sans: "Inter, system-ui, sans-serif", mono: "'JetBrains Mono', ui-monospace, monospace", features: "'tnum' 1" } as const;
export const type = {
  title:      { size: 24, line: 1.2,  weight: 600, tracking: '-0.02em' },
  heading:    { size: 20, line: 1.25, weight: 600, tracking: '-0.02em' },
  subhead:    { size: 16, line: 1.35, weight: 600 },
  body:       { size: 14, line: 1.5,  weight: 400 },
  bodyStrong: { size: 14, line: 1.5,  weight: 500 },
  small:      { size: 13, line: 1.45, weight: 400 },
  label:      { size: 12, line: 1.3,  weight: 500, tracking: '0.1em', transform: 'uppercase' },
  caption:    { size: 12, line: 1.4,  weight: 400 },
  mono:       { size: 13, line: 1.4,  weight: 500, family: 'mono' },
  monoSm:     { size: 12, line: 1.4,  weight: 500, family: 'mono' },
} as const;
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64 } as const;
export const radius = { sm: 6, md: 10, lg: 14, pill: 999 } as const;
export const border = { hairline: '1px solid var(--border)', control: '1px solid var(--border-strong)', stale: '1px dashed var(--unk-border)', p2: '1.5px solid var(--p2-line)' } as const;
export const elevation = { e0: 'none', e1: 'var(--border) hairline', e2: { light: '0 8px 24px rgba(10,11,10,.10), 0 1px 2px rgba(10,11,10,.08)', dark: '0 8px 24px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.4)' } } as const;
export const motion = { fast: 140, base: 240, slow: 600, ease: 'cubic-bezier(.2,0,0,1)', spinner: 900, rowHighlight: 1600 } as const;
export const breakpoint = { phoneMax: 767, tablet: 768, desktop: 1200 } as const;
export const focus = { width: 2, offset: 2, halo: 4 } as const;
export const control = { height: 36, heightSm: 30, heightTouch: 44 } as const;
