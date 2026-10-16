import puppeteer from 'puppeteer-core';

const URL = process.env.URL || 'http://localhost:5173/';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, defaultViewport: { width: 1440, height: 900 } });
const errors = [];

async function fresh({ tourSeen = true } = {}) {
  // A first visit needs its own clean browser context (localStorage is shared across pages).
  const page = tourSeen ? await browser.newPage() : await (await browser.createBrowserContext()).newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  // Clock skew hook: the app reads Date.now(), so shifting it moves the demo clock.
  // Standard sessions behave like a returning operator: the first-visit tour is already done.
  if (tourSeen) await page.evaluateOnNewDocument(() => localStorage.setItem('picksy-tour-done', '1'));
  await page.evaluateOnNewDocument(() => {
    const real = Date.now.bind(Date);
    window.__skew = 0;
    Date.now = () => real() + window.__skew;
  });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(1200); // skeleton (700 ms) + first ticks
  return page;
}

const S = {
  // Band counts live on the band filter chips; network status (Offline, Signal delayed) stays in the header.
  header: (p) =>
    p.evaluate(() =>
      [...document.querySelectorAll('.filters__summary > span'), ...document.querySelectorAll('.sum__btn')]
        .map((b) => b.innerText.replace(/\s+/g, ' ').trim())
        .join(' | '),
    ),
  clock: (p) => p.$eval('.hdr__clock', (e) => e.innerText),
  sections: (p) =>
    p.$$eval('.queue [role=group]', (gs) =>
      Object.fromEntries(
        gs.map((g) => [
          g.getAttribute('aria-label'),
          [...g.querySelectorAll('.row')].map((r) => {
            const id = r.querySelector('.row__title .xs')?.innerText;
            const band = r.querySelector('.band')?.innerText;
            return band ? `${band}:${id}` : id;
          }),
        ]),
      ),
    ),
  panel: async (p) => {
    // History and signals are folded by default: open them before reading the timeline.
    if (await p.$('.evidence__toggle[aria-expanded="false"]')) {
      // a JS click opens it without moving focus, so the focus checks still see the real focus
      await p.evaluate(() => document.querySelector('.evidence__toggle').click());
      await new Promise((r) => setTimeout(r, 60));
    }
    return p.evaluate(() => ({
      title: document.querySelector('.panel h2')?.innerText,
      chips: [...document.querySelectorAll('.inc-head__meta .chip, .inc-head__meta .band, .inc-head__meta .owner-chip')].map((c) => c.innerText.trim()),
      notices: [...document.querySelectorAll('.panel .notice, .panel .done__result')].map((n) => n.innerText.replace(/\s+/g, ' ').trim()),
      rec: document.querySelector('.rec__reason')?.innerText,
      confirm: document.querySelector('.confirm .confirm__text')?.innerText,
      timeline: [...document.querySelectorAll('.panel .events .event__text')].map((e) => e.innerText.replace(/\s+/g, ' ').trim()),
    }));
  },
  task: (p) =>
    p.evaluate(() => {
      const c = document.querySelector('.task');
      if (!c) return null;
      return {
        chip: c.querySelector('.task__head .chip')?.innerText.trim(),
        stages: [...c.querySelectorAll('.flow__step')].map((x) => x.querySelector('.flow__label').innerText + ':' + (x.className.match(/flow__step--(\w+)/) || [])[1]),
        text: c.innerText.replace(/\s+/g, ' '),
      };
    }),
  toasts: (p) => p.$$eval('.toast', (ts) => ts.map((t) => t.innerText.replace(/\s+/g, ' ').trim())),
  focus: (p) => p.evaluate(() => `${document.activeElement.tagName}:${document.activeElement.innerText?.trim().slice(0, 40)}`),
};

async function clickText(p, text, scope = 'button') {
  const ok = await p.evaluate(
    (text, scope) => {
      const el = [...document.querySelectorAll(scope)].find((b) => b.innerText.replace(/\s+/g, ' ').trim() === text);
      if (!el) return false;
      el.click();
      return true;
    },
    text,
    scope,
  );
  if (!ok) throw new Error(`no ${scope} with text "${text}"`);
}
async function clickRow(p, id) {
  const ok = await p.evaluate((id) => {
    const r = [...document.querySelectorAll('.row')].find((r) => r.querySelector('.row__title .xs')?.innerText === id);
    r?.click();
    return !!r;
  }, id);
  if (!ok) throw new Error('no row ' + id);
  await sleep(150);
}
const skew = async (p, ms) => {
  await p.evaluate((ms) => (window.__skew = ms), ms);
  await sleep(1600);
};
const REMOTE = 5600;

// ---------- 1–3: timed behaviour ----------
{
  const p = await fresh();
  const h0 = await S.header(p);
  const s0 = await S.sections(p);
  check('load: header P1 2 · P2 2 · P3 3 · Offline 4 · Delayed 1', h0 === 'P1 2 | P2 2 | P3 3 | Çevrimdışı 4 | Sinyal gecikiyor 1', h0);
  check('load: queue order', s0['Müdahale bekliyor'].join(',') === 'P1:INC-101,P1:INC-102,P2:INC-105,P2:INC-104,P3:INC-108,P3:INC-107,P3:INC-106', s0['Müdahale bekliyor'].join(','));

  await skew(p, 95_000);
  const h1 = await S.header(p);
  const s1 = await S.sections(p);
  const t1 = await S.toasts(p);
  check('14:01:35 INC-104 recovered: P2 1, Offline 3', h1.includes('P2 1') && h1.includes('Çevrimdışı 3'), `${await S.clock(p)} ${h1}`);
  check('INC-104 in "Recovered: confirm to close"', (s1['Kendiliğinden düzeldi: kapatmayı onayla'] || []).includes('INC-104'), JSON.stringify(s1['Kendiliğinden düzeldi: kapatmayı onayla']));
  check('toast "INC-104 recovered" (not selected)', t1.some((t) => t.startsWith('INC-104 kendiliğinden düzeldi')), t1.join(' / '));

  await skew(p, 6.5 * 60_000);
  const s2 = await S.sections(p);
  const need = s2['Müdahale bekliyor'];
  check('14:06:30 INC-101 drops to P2, INC-102 on top', need[0] === 'P1:INC-102' && need.includes('P2:INC-101'), `${await S.clock(p)} ${need.join(',')}`);

  await skew(p, 30 * 60_000);
  const h3 = await S.header(p);
  await p.goto(URL + '#/stations/LIT-06');
  await sleep(400);
  const st = await p.$eval('.page__title-row', (e) => e.innerText.replace(/\s+/g, ' '));
  const lit06Inc = await p.$eval('.block--list', (e) => e.innerText.includes('Bu istasyonda açık olay yok'));
  check('14:30 LIT-06 still Signal delayed, no incident', h3.includes('Sinyal gecikiyor 1') && st.includes('Sinyal gecikiyor') && lit06Inc, st);
  await p.close();
}

// ---------- 4: keyboard ----------
{
  const p = await fresh();
  await p.keyboard.press('ArrowDown');
  await sleep(200);
  check('↓ selects INC-101, focus on panel heading', (await S.panel(p)).title === 'Teslim arızası' && (await S.focus(p)) === 'H2:Teslim arızası', await S.focus(p));
  await p.keyboard.press('ArrowDown');
  await sleep(200);
  check('↓ again → INC-102', (await S.panel(p)).title === 'İstasyon çevrimdışı' && (await p.evaluate(() => location.hash)).includes('INC-102'));
  await p.keyboard.press('ArrowUp');
  await sleep(200);
  await p.keyboard.press('Escape');
  await sleep(200);
  check('Esc closes the panel', !(await p.evaluate(() => location.hash)).includes('incident'), await p.evaluate(() => location.hash));
  await p.keyboard.press('Enter');
  await sleep(200);
  check('Enter opens the first row', (await p.evaluate(() => location.hash)).includes('INC-101'));
  await p.keyboard.press('a');
  await sleep(900);
  const pa = await S.panel(p);
  check('A acknowledges INC-101', pa.chips.includes('Üstlenildi'), pa.chips.join(','));
  await p.keyboard.press('r');
  await sleep(200);
  check('R opens Retry dispense confirm, focus on Confirm', !!(await S.panel(p)).confirm && (await S.focus(p)) === 'BUTTON:Onayla', await S.focus(p));
  await p.keyboard.press('Escape');
  await sleep(200);
  check('Esc closes the confirm', !(await S.panel(p)).confirm);
  await p.keyboard.press('r');
  await sleep(200);
  await p.keyboard.press('Enter'); // focused Confirm button
  await sleep(300);
  const pr = await S.panel(p);
  const sr = await S.sections(p);
  check('Confirm runs: In progress, row in In hand', pr.chips.includes('İşlem sürüyor') && sr['İşlemde'].includes('INC-101'), pr.chips.join(','));
  await sleep(REMOTE);
  const pd = await S.panel(p);
  const hd = await S.header(p);
  const sd = await S.sections(p);
  check('Retry succeeds: Resolved, P1 1, INC-102 on top', pd.chips.includes('Kapandı') && hd.startsWith('P1 1') && sd['Müdahale bekliyor'][0] === 'P1:INC-102', hd);
  check('success notice inline, no toast', pd.notices.some((n) => n.startsWith('Paket kapağa ulaştı')) && (await S.toasts(p)).length === 0);
  await p.keyboard.press('g');
  await p.goto(URL + '#/stations/WAL-01');
  await sleep(300);
  const wal = await p.$eval('.page__title-row', (e) => e.innerText);
  check('WAL-01 back Online', wal.includes('Çevrimiçi'), wal.replace(/\s+/g, ' '));
  await p.keyboard.press('g');
  await p.keyboard.press('q');
  await sleep(300);
  check('g q returns to the queue', (await p.evaluate(() => location.hash)).startsWith('#/queue'), await p.evaluate(() => location.hash));
  await p.close();
}

// ---------- 5a: flow A (INC-102) ----------
{
  const p = await fresh();
  await clickRow(p, 'INC-102');
  await clickText(p, 'Yedek bağlantıya geç');
  await sleep(300);
  check('A: backup runs without confirm', (await S.panel(p)).chips.includes('İşlem sürüyor'));
  await sleep(REMOTE);
  let pa = await S.panel(p);
  check('A: backup fails → Acknowledged, error, new recommendation', pa.chips.includes('Üstlenildi') && pa.notices.some((n) => n.startsWith('Yedek bağlantı yanıt vermedi')) && pa.rec?.startsWith('Yedek bağlantı çalışmadı'), pa.rec);
  await clickText(p, 'Saha ziyareti iste');
  await sleep(200);
  pa = await S.panel(p);
  check('A: field visit confirm says already breached', pa.confirm === 'Süre 15 dk önce aşıldı. Daha erken bir zaman yok.', pa.confirm);
  // textContent: labels are uppercased by CSS only
  const sum = await p.$$eval('.confirm__summary > div', (ds) => ds.map((d) => d.querySelector('dt').textContent + ' ' + d.querySelector('dd').textContent));
  check('A: request summary: station, problem, impact, due', sum[0] === 'İstasyon LIT-03 · Lite · Ankara · Müşteri B' && /^Sorun 09:35 itibarıyla çevrimdışı · LTE yedeğinden yanıt yok \(14:0\d\)$/.test(sum[1]) && sum[2] === 'Etki 18 paket engelli · teslim alma yapılamıyor' && sum[3] === 'Son süre 13:45 · Sözleşme hedefi 4 sa', sum.join(' | '));
  await p.type('.confirm textarea', 'Kapı paneli kontrol edilsin');
  await clickText(p, 'Talebi gönder');
  await sleep(1000);
  pa = await S.panel(p);
  const sa = await S.sections(p);
  check('A: Awaiting field service, row in In hand', pa.chips.includes('Saha ekibi bekleniyor') && sa['İşlemde'].includes('INC-102'), sa['İşlemde'].join(','));
  const why = await p.evaluate(() => [...document.querySelectorAll('.row')].find((r) => r.innerText.includes('INC-102'))?.querySelector('.row__why')?.innerText);
  check('A: row shows the field task, its stage and due time', /^FT-032 · Talep edildi · son süre 13:45$/.test(why), why);
  const breachedRow = await p.evaluate(() => [...document.querySelectorAll('.row')].find((r) => r.innerText.includes('INC-102'))?.classList.contains('is-breached'));
  check('A: overdue task keeps the breach style on its row', breachedRow === true);
  let tk = await S.task(p);
  check('task: created as FT-032, Requested done, Accepted next, note shown', tk?.chip === 'Talep edildi' && tk.stages.join(',') === 'Talep edildi:done,Kabul edildi:current,Sahada:todo,Tamamlandı:todo' && tk.text.includes('Kapı paneli kontrol edilsin'), JSON.stringify(tk));
  check('task: "sent" result names the task and the breach', (await S.panel(p)).notices.some((n) => n === 'FT-032 saha görevi gönderildi. Son süre 13:45 (zaten aşıldı).'), (await S.panel(p)).notices.join(' / '));
  await skew(p, 11_000);
  tk = await S.task(p);
  pa = await S.panel(p);
  check('task: auto-accepted 10 s after the request (simulated, logged)', tk?.chip === 'Kabul edildi' && pa.timeline.some((t) => t === 'Saha ekibi kabul etti · FT-032 Simüle'), pa.timeline.slice(0, 3).join(' / '));
  await clickText(p, 'Demo kontrolleri');
  await sleep(150);
  await clickText(p, 'Saha görevini ilerlet · INC-102 FT-032: Kabul edildi → Sahada', 'button.demo__item');
  await sleep(300);
  tk = await S.task(p);
  const cancelOff = await p.evaluate(() => [...document.querySelectorAll('.task .btn')].find((b) => b.innerText.trim() === 'Saha ziyaretini iptal et')?.getAttribute('aria-disabled'));
  check('task: advanced to On site; cancel no longer allowed', tk?.chip === 'Sahada' && cancelOff === 'true', JSON.stringify({ chip: tk?.chip, cancelOff }));
  await p.goto(URL + '#/stations/LIT-03');
  await sleep(300);
  const banner = await p.$eval('.task-banner', (b) => b.innerText.replace(/\s+/g, ' ')).catch(() => '');
  check('task: station banner names the visit and what unblocks parcels', banner.includes('Saha ziyareti FT-032 · Sahada · son süre 13:45') && banner.includes('İstasyon yeniden çevrimiçi olduğunda paketlerin engeli kalkar.'), banner);
  await p.goto(URL + '#/queue?incident=INC-102');
  await sleep(300);
  await clickText(p, 'Demo kontrolleri');
  await sleep(150);
  await clickText(p, 'Saha görevini ilerlet · INC-102 FT-032: Sahada → Tamamlandı. Olayı kapatır.', 'button.demo__item');
  await sleep(300);
  pa = await S.panel(p);
  check('task: completion is logged as simulated, then the station comes back', pa.timeline[0].startsWith('Kapandı · Saha görevi tamamlandı') && pa.timeline.includes('İstasyon yeniden çevrimiçi') && pa.timeline.includes('FT-032 saha görevi tamamlandı Simüle'), pa.timeline.slice(0, 4).join(' / '));
  const h = await S.header(p);
  check('A: field task completes → Resolved, P1 1, Offline 3', pa.chips.includes('Kapandı') && h.startsWith('P1 1') && h.includes('Çevrimdışı 3'), h);
  await p.goto(URL + '#/stations/LIT-03');
  await sleep(300);
  const blocked = await p.$$eval('.page .flags', (fs) => fs.filter((f) => f.innerText.includes('Engelli')).length);
  check('A: LIT-03 Online, its 18 parcels no longer blocked', (await p.$eval('.page__title-row', (e) => e.innerText)).includes('Çevrimiçi') && blocked === 0, `blocked=${blocked}`);
  await p.close();
}

// ---------- 5b: flow B (INC-105) ----------
{
  const p = await fresh();
  const chip = await p.evaluate(() => [...document.querySelectorAll('.row')].find((r) => r.innerText.includes('INC-105'))?.querySelector('.owner-chip')?.innerText);
  check('B: row shows owner chip Operator B', chip?.includes('Operatör B'), chip);
  await clickRow(p, 'INC-105');
  let pb = await S.panel(p);
  check('B: notice "Acknowledged by Operator B at 13:40."', pb.notices.some((n) => n.startsWith('Operatör B 13.40’ta üstlendi.')), pb.notices.join(' / '));
  await clickText(p, 'Yedek bağlantıya geç');
  await sleep(200);
  pb = await S.panel(p);
  check('B: ownership confirm', pb.notices.some((n) => n.startsWith('Bu olay 13:40 itibarıyla Operatör B üzerinde. Devralırsanız kayda geçer.')));
  await clickText(p, 'Devral ve devam et');
  await sleep(REMOTE);
  pb = await S.panel(p);
  check('B: owner You, takeover logged, backup failed', pb.timeline.includes('Devralındı · önceki sorumlu: Operatör B') && pb.notices.some((n) => n.startsWith('Yedek bağlantı yanıt vermedi')) && !pb.chips.some((c) => c.includes('Operatör B')), pb.timeline.slice(0, 4).join(' / '));
  await clickText(p, 'Saha ziyareti iste');
  await sleep(100);
  await clickText(p, 'Talebi gönder');
  await sleep(1000);
  check('B: field visit requested → Awaiting field service', (await S.panel(p)).chips.includes('Saha ekibi bekleniyor'));
  const h = await S.header(p);
  check('B: header P2 1 (INC-104 left only)', h.includes('P2 1'), h);
  await p.close();
}

// ---------- 5c: flow C (INC-108) ----------
{
  const p = await fresh();
  await clickRow(p, 'INC-108');
  const locked = await p.evaluate(() => {
    const b = [...document.querySelectorAll('.action .btn')].find((x) => x.innerText.trim() === 'İadeye ayır');
    return { aria: b?.getAttribute('aria-disabled'), lock: !!b?.querySelector('svg'), reason: b?.parentElement.querySelector('.action__reason')?.innerText };
  });
  check('C: Mark for return locked with reason', locked.aria === 'true' && locked.lock && locked.reason === 'Süpervizör onayı gerekli', JSON.stringify(locked));
  await p.hover('.action:nth-child(2) .btn').catch(() => {});
  await p.evaluate(() => [...document.querySelectorAll('.action .btn')].find((x) => x.innerText.trim() === 'İadeye ayır')?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
  await sleep(200);
  const tip = await p.$eval('[role=tooltip]', (t) => t.innerText).catch(() => null);
  check('C: tooltip on hover', tip?.startsWith('Geri alınamaz:'), tip);
  await clickText(p, 'Bekletmeyi 2 gün uzat');
  await sleep(150);
  await clickText(p, 'Onayla');
  await sleep(REMOTE);
  let pc = await S.panel(p);
  check('C: extend hold → Resolved, P3 2', pc.chips.includes('Kapandı') && (await S.header(p)).includes('P3 2'), pc.notices.join(' / '));

  // Supervisor path after Reset.
  await clickText(p, 'Demo kontrolleri');
  await sleep(150);
  await clickText(p, 'Sıfırla Başlangıç verisini ve 14:00 saatini geri yükler.', 'button.demo__item');
  await sleep(300);
  await clickText(p, 'Demo kontrolleri');
  await sleep(150);
  await clickText(p, 'Süpervizör');
  await clickRow(p, 'INC-108');
  await clickText(p, 'İadeye ayır');
  await sleep(150);
  pc = await S.panel(p);
  check('C: supervisor gets irreversible confirm', pc.confirm?.startsWith('Geri alınamaz. PCL-0301'), pc.confirm);
  await clickText(p, 'Onayla');
  await sleep(REMOTE);
  pc = await S.panel(p);
  check('C: marked for return → Resolved', pc.chips.includes('Kapandı') && pc.notices.some((n) => n.startsWith('PCL-0301 iadeye ayrıldı')), pc.notices.join(' / '));
  await p.goto(URL + '#/parcels/PCL-0301');
  await sleep(300);
  const pcl = await p.$eval('.page__head', (e) => e.innerText.replace(/\s+/g, ' '));
  const noAct = await p.$eval('.page__actions', (e) => e.innerText.replace(/\s+/g, ' '));
  check('C: PCL-0301 Marked for return, no actions', pcl.includes('İadeye ayrıldı') && noAct.includes('İşlem yok: paket iadeye ayrıldı.'), noAct);
  await p.close();
}

// ---------- field task edge cases ----------
{
  const p = await fresh();
  await clickRow(p, 'INC-102');
  await clickText(p, 'Demo kontrolleri');
  await sleep(150);
  await p.evaluate(() => [...document.querySelectorAll('button.demo__item')].find((b) => /gönderim/i.test(b.innerText))?.click());
  await sleep(200);
  await clickText(p, 'Saha ziyareti iste');
  await sleep(150);
  await clickText(p, 'Talebi gönder');
  await sleep(1000);
  let pe = await S.panel(p);
  check('task: request not sent → "Nothing changed", no task card', pe.notices.some((n) => n.startsWith('Gönderilemedi. Hiçbir şey değişmedi.')) && !(await S.task(p)) && !pe.chips.includes('Saha ekibi bekleniyor'), pe.notices.join(' / '));
  await clickText(p, 'Yeniden dene');
  await sleep(150);
  await clickText(p, 'Talebi gönder');
  await sleep(1000);
  check('task: retry sends it', (await S.task(p))?.chip === 'Talep edildi');
  await clickText(p, 'Saha ziyaretini iptal et');
  await sleep(150);
  const off = await p.$eval('.task .btn--confirm', (b) => b.getAttribute('aria-disabled'));
  await p.type('.task .confirm textarea', 'Yanlış istasyon');
  await clickText(p, 'Onayla');
  await sleep(1000);
  pe = await S.panel(p);
  check('task: cancel needs a reason; then task gone, back to Acknowledged, reason logged', off === 'true' && !(await S.task(p)) && pe.chips.includes('Üstlenildi') && pe.timeline.some((t) => t === 'FT-032 saha görevi iptal edildi · neden: Yanlış istasyon'), `${off} ${pe.timeline.slice(0, 2).join(' / ')}`);
  await p.close();
}
{
  const p = await fresh();
  await clickRow(p, 'INC-104');
  await clickText(p, 'Saha ziyareti iste');
  await sleep(150);
  await clickText(p, 'Talebi gönder');
  await sleep(1000);
  await skew(p, 95_000);
  let tk = await S.task(p);
  let pr = await S.panel(p);
  check('task: station recovers while the visit is open → Recovered, card offers to cancel', pr.chips.includes('Düzeldi') && tk?.text.includes('İstasyon kendiliğinden düzeldi. Saha ziyareti iptal edilsin mi?'), tk?.text);
  await clickText(p, 'Saha ziyaretini iptal et');
  await sleep(150);
  await p.type('.task .confirm textarea', 'Kendiliğinden düzeldi');
  await clickText(p, 'Onayla');
  await sleep(1000);
  pr = await S.panel(p);
  check('task: cancelled while recovered → incident stays Recovered', !(await S.task(p)) && pr.chips.includes('Düzeldi'), pr.chips.join(','));
  await p.close();
}

// ---------- first-visit tour ----------
{
  const p = await fresh({ tourSeen: false });
  const title = () => p.$eval('.tour__title', (e) => e.innerText).catch(() => null);
  check('tour: shows on first visit, step 1', (await title()) === 'En acil olan en üstte', await title());
  await clickText(p, 'İleri');
  await sleep(200);
  check('tour: step 2 points at the top row', (await title()) === 'Olayı aç');
  await clickText(p, 'Aç');
  await sleep(300);
  check('tour: "Open it" opens the top incident, step 3', (await p.evaluate(() => location.hash)).includes('INC-101') && (await title()) === 'Sonraki adımı at');
  await clickText(p, 'Bitir');
  await sleep(200);
  check('tour: Done ends it and remembers', (await title()) === null && (await p.evaluate(() => localStorage.getItem('picksy-tour-done'))) === '1');
  await p.reload({ waitUntil: 'networkidle0' });
  await sleep(1200);
  check('tour: not shown again on return', (await title()) === null);
  await p.close();
}

check('no page or console errors', errors.length === 0, errors.join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
