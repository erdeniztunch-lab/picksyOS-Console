import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TOUR_STEPS } from '../domain/engine';
import { queueModel } from '../domain/selectors';
import { useEngine } from '../EngineContext';
import { Button } from './Button';

interface Step {
  target: string;
  title: string;
  text: string;
  action: string;
}

const STEPS: Step[] = [
  {
    target: '[data-tour="queue"]',
    title: 'En acil olan en üstte',
    text: 'Bu liste aciliyete göre sıralanır. En üstteki satır, önce sizi bekleyen olaydır.',
    action: 'İleri',
  },
  {
    target: '[data-tour="top-row"]',
    title: 'Olayı aç',
    text: 'Neden acil olduğunu, hangi paketlerin takıldığını ve ne kadar süre kaldığını görmek için açın.',
    action: 'Aç',
  },
  {
    target: '[data-tour="next-step"]',
    title: 'Sonraki adımı at',
    text: 'İşaretli düğme önerilen sonraki adımdır. Paketi etkileyen her işlem önce onayınızı ister. Tüm kural ve kısayollar sağ üstteki Yardım’da.',
    action: 'Bitir',
  },
];

type Box = { top: number; left: number; width: number; height: number };

/**
 * First-visit tour: three callouts on the real screen. Not modal: the page stays usable,
 * Esc or Skip ends it, and it is remembered in the browser (Help → "Show the tour again").
 */
export function Tour() {
  const e = useEngine();
  const step = e.ui.tourStep;
  const [box, setBox] = useState<Box | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const wasOn = useRef(false);

  useLayoutEffect(() => {
    if (step == null) return;
    const measure = () => {
      const el = document.querySelector(STEPS[step].target);
      const r = el?.getBoundingClientRect();
      const next = r && r.width ? { top: r.top, left: r.left, width: r.width, height: r.height } : null;
      // Only update when the target actually moved; a new object every render would loop.
      setBox((prev) =>
        prev && next && prev.top === next.top && prev.left === next.left && prev.width === next.width && prev.height === next.height
          ? prev
          : prev === next
            ? prev
            : next,
      );
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  });

  useEffect(() => {
    if (step != null) {
      if (!wasOn.current) prevFocus.current = document.activeElement as HTMLElement | null;
      wasOn.current = true;
      primary.current?.focus({ preventScroll: true });
    } else if (wasOn.current) {
      // Tour ended: return focus to where the operator was, or to the open incident's heading.
      wasOn.current = false;
      const a = document.activeElement;
      if (!a || a === document.body) {
        const back = prevFocus.current?.isConnected && prevFocus.current !== document.body ? prevFocus.current : document.querySelector<HTMLElement>('.inc-head .heading, .row');
        back?.focus({ preventScroll: true });
      }
    }
  }, [step]);

  if (step == null) return null;
  const s = STEPS[step];
  const onPrimary = () => {
    if (step === 1) {
      const top = queueModel(e).sections.find((x) => x.key === 'need')?.rows[0];
      if (top) e.select(top.id);
    }
    e.tourNext();
  };

  // Place the card below the target when it fits, otherwise above; clamp to the viewport.
  const W = Math.min(320, window.innerWidth - 24);
  const H = card.current?.offsetHeight ?? 170;
  let top = window.innerHeight - H - 16;
  let left = (window.innerWidth - W) / 2;
  if (box) {
    // Prefer beside the target so it stays readable, then below, then above.
    const right = box.left + box.width + 14;
    const below = box.top + box.height + 10;
    if (right + W < window.innerWidth - 12) {
      left = right;
      top = Math.min(Math.max(8, box.top), window.innerHeight - H - 8);
    } else {
      top = below + H < window.innerHeight - 8 ? below : Math.max(8, box.top - H - 10);
      left = Math.min(Math.max(12, box.left), window.innerWidth - W - 12);
    }
  }

  return (
    <>
      {box && (
        <div
          className="tour__ring"
          aria-hidden="true"
          style={{ top: box.top - 4, left: box.left - 4, width: box.width + 8, height: box.height + 8 }}
        />
      )}
      <div ref={card} className="tour" role="dialog" aria-modal="false" aria-labelledby="tour-title" style={{ top, left, width: W }}>
        <span className="tour__count">
          {step + 1} of {TOUR_STEPS}
        </span>
        <h2 id="tour-title" className="tour__title">
          {s.title}
        </h2>
        <p className="tour__text">{s.text}</p>
        <div className="tour__row">
          <Button ref={primary} variant="ink" size={e.isPhone ? 'touch' : 'sm'} onClick={onPrimary}>
            {s.action}
          </Button>
          {step < TOUR_STEPS - 1 && (
            <Button variant="quiet" size={e.isPhone ? 'touch' : 'sm'} onClick={() => e.endTour()}>
              Turu atla
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
