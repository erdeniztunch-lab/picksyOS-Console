import { useEffect, useRef, type FocusEvent } from 'react';

/**
 * Shared behaviour for header popovers (Help, Concept controls, the phone menu):
 * close on an outside click or when focus leaves, and give focus back to the trigger on close.
 */
export function usePopover(open: boolean, close: () => void) {
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (!open) return;
    const onDown = (ev: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(ev.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);

  useEffect(() => {
    // Closed by Esc or by an item inside it: focus would fall to <body>, so return it to the trigger.
    if (wasOpen.current && !open) {
      const a = document.activeElement;
      if (!a || a === document.body || wrap.current?.contains(a)) trigger.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  const onBlur = (ev: FocusEvent<HTMLDivElement>) => {
    const next = ev.relatedTarget as Node | null;
    if (open && next && wrap.current && !wrap.current.contains(next)) close();
  };

  return { wrap, trigger, onBlur };
}
