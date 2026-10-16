import { useEffect, useRef } from 'react';

/** A new page starts at its heading, so keyboard and screen-reader users land where the content begins. */
export function usePageFocus(key: string) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [key]);
  return ref;
}
