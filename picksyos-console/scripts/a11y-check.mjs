// Keyboard, focus, zoom and touch-target checks from the audit (run with the dev server up).
import puppeteer from 'puppeteer-core';
const URL = (process.env.URL || 'http://localhost:5173/').replace(/\/$/, '');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = [];
const check = (n, ok, d = '') => { out.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  — ' + d : ''}`); };
const go = async (url, w = 1440, h = 900, fresh = false) => {
  const ctx = fresh ? await b.createBrowserContext() : b.defaultBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h });
  if (!fresh) await p.evaluateOnNewDocument(() => localStorage.setItem('picksy-tour-done', '1'));
  await p.goto(url, { waitUntil: 'networkidle0' });
  await sleep(fresh ? 1400 : 400);
  return p;
};
const active = (p) => p.evaluate(() => { const a = document.activeElement; return `${a.tagName}.${a.className.toString().split(' ')[0]}:${(a.innerText || '').trim().slice(0, 30)}`; });
const click = async (p, t) => { const h = await p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === t), t); const el = h.asElement(); if (el) await el.click(); };

// 1 focus ring on a selected + breached row
let p = await go(URL + '/?scene=inc102-failed');
const before = await p.$eval('.row.is-selected', (r) => getComputedStyle(r).boxShadow + '|' + getComputedStyle(r).outlineWidth);
await p.focus('.row.is-selected');
await p.keyboard.press('Shift'); // keyboard modality
await p.evaluate(() => document.querySelector('.row.is-selected').focus({ focusVisible: true }));
await sleep(100);
const fv = await p.$eval('.row.is-selected', (r) => r.matches(':focus-visible'));
const after = await p.$eval('.row.is-selected', (r) => getComputedStyle(r).boxShadow + '|' + getComputedStyle(r).outlineWidth);
check('row focus visible on selected+breached row', fv && after !== before, after);
await p.close();

// 2 focus return
p = await go(URL + '/?scene=inc101');
await click(p, 'Teslimi yeniden dene'); await sleep(150);
await p.keyboard.press('Escape'); await sleep(150);
check('Esc on confirm → focus back on the action', (await active(p)).includes('Teslimi yeniden dene'), await active(p));
await p.evaluate(() => document.querySelector('.inc-head .heading').focus()); await p.keyboard.press('Escape'); await sleep(250);
check('Esc closes panel → focus on its queue row', (await active(p)).startsWith('BUTTON.row'), await active(p));
await click(p, 'Yardım'); await sleep(150); await p.keyboard.press('Escape'); await sleep(150);
check('Esc on Help → focus on Help', (await active(p)).includes(':Yardım'), await active(p));
await click(p, 'Demo kontrolleri'); await sleep(150); await p.keyboard.press('Escape'); await sleep(150);
check('Esc on Concept controls → focus on its button', (await active(p)).includes('Demo kontrolleri'), await active(p));
// 11 menus close when focus leaves
await click(p, 'Demo kontrolleri'); await sleep(150);
for (let i = 0; i < 14; i++) await p.keyboard.press('Tab');
await sleep(150);
check('Concept controls closes when focus leaves', !(await p.$('#concept-controls')), await active(p));
await p.close();

// 3 shortcut off switch + scoping
p = await go(URL + '/?scene=inc101');
await click(p, 'Yardım'); await sleep(150);
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.innerText.startsWith('Tek tuş kısayolları'))?.click()); await sleep(100);
await p.keyboard.press('Escape'); await sleep(100);
await p.evaluate(() => document.querySelector('.inc-head .heading').focus());
await p.keyboard.press('a'); await sleep(900);
const status = await p.$eval('.inc-head__meta .chip', (c) => c.innerText.trim());
check('A does nothing when shortcuts are off', status === 'Açık', status);
await p.close();

// 5 arrows scroll the panel when focus is on panel content
p = await go(URL + '/?scene=inc102-failed', 1440, 700);
await p.evaluate(() => document.querySelector('.parcel-row')?.focus());
const hashBefore = await p.evaluate(() => location.hash);
await p.keyboard.press('ArrowDown'); await sleep(200);
check('↓ in panel content does not change the selection', (await p.evaluate(() => location.hash)) === hashBefore, await p.evaluate(() => location.hash));
// 6 h1 + section h2s
const heads = await p.evaluate(() => ({ h1: [...document.querySelectorAll('h1')].map((h) => h.innerText), h2: [...document.querySelectorAll('h2')].map((h) => h.innerText.replace(/\s+/g, ' ').trim()).slice(0, 4) }));
check('queue view has an h1 and section h2s', heads.h1.length === 1 && heads.h2.some((t) => t.startsWith('MÜDAHALE BEKLIYOR') || t.startsWith('Müdahale bekliyor') || t.toLocaleUpperCase('tr').startsWith('MÜDAHALE BEKLİYOR')), JSON.stringify(heads));
await p.close();

// 4 200 % zoom: sheet height, tooltip not over the primary
for (const sc of ['inc108-locked', 'inc101-confirm']) {
  p = await go(`${URL}/?scene=${sc}`, 720, 450);
  const m = await p.evaluate(() => {
    const sheet = document.querySelector('.actions-block--phone').getBoundingClientRect();
    const tip = document.querySelector('[role=tooltip]')?.getBoundingClientRect();
    const prim = document.querySelector('[data-tour="next-step"]')?.getBoundingClientRect();
    const overlap = tip && prim && !(tip.bottom <= prim.top || tip.top >= prim.bottom || tip.right <= prim.left || tip.left >= prim.right);
    return { sheet: Math.round(sheet.height), vh: innerHeight, overlap: !!overlap };
  });
  check(`200% zoom ${sc}: sheet ≤ 45% of view, tooltip not over primary`, m.sheet <= m.vh * 0.46 + 1 && !m.overlap, JSON.stringify(m));
  await p.close();
}
// 8 tablet overflow
p = await go(URL + '/?scene=inc108-locked', 900, 1000);
const ov = await p.evaluate(() => { const d = document.querySelector('.detail'); return { detail: d.scrollWidth > d.clientWidth, page: document.documentElement.scrollWidth > innerWidth }; });
check('tablet 900px: no sideways scroll', !ov.detail && !ov.page, JSON.stringify(ov));
// 9 header outline contrast
const lum = (c) => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
const pair = await p.evaluate(() => [getComputedStyle(document.querySelector('.pill-btn')).borderTopColor, getComputedStyle(document.querySelector('.hdr')).backgroundColor]);
const [l1, l2] = pair.map(lum); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
check('header control outline ≥ 3:1', ratio >= 3, ratio.toFixed(2) + ':1');
await p.close();

// 7 phone targets
p = await go(URL + '/?scene=inc102-failed', 390, 844);
const small = await p.evaluate(() => [...document.querySelectorAll('a,button')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.height && r.height < 44 && getComputedStyle(el).visibility !== 'hidden'; }).map((el) => `${el.tagName}:${(el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 20)}:${Math.round(el.getBoundingClientRect().height)}`));
check('phone: no tap target under 44 px', small.length === 0, small.slice(0, 8).join(' | '));
await p.close();

// 12 tour card not covering the top row
p = await go(URL + '/#/queue', 1440, 900, true);
const tov = await p.evaluate(() => { const c = document.querySelector('.tour').getBoundingClientRect(); const r = document.querySelector('[data-tour="top-row"]').getBoundingClientRect(); return !(c.bottom <= r.top || c.top >= r.bottom || c.right <= r.left || c.left >= r.right); });
check('tour step 1 card does not cover the top row', !tov);
await click(p, 'Turu atla'); await sleep(200);
check('tour end → focus is not lost to <body>', !(await active(p)).startsWith('BODY'), await active(p));
await p.close();

await b.close();
console.log(`\n${out.filter(Boolean).length}/${out.length} passed`);
