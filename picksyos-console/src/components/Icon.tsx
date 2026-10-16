const circle = (r: number) => `M6 ${6 - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}z`;

const PATHS = {
  dot: circle(3.5),
  ring: circle(4),
  ack: circle(4) + circle(1.3),
  clock: circle(4.5) + 'M6 3.6V6l1.6 1',
  x: circle(4.5) + 'M4.2 4.2l3.6 3.6M7.8 4.2L4.2 7.8',
  slash: circle(4.5) + 'M2.9 9.1l6.2-6.2',
  tri: 'M6 1.8l4.4 7.9H1.6zM6 5v1.8',
  check: 'M2.5 6.3l2.4 2.4 4.6-5',
  pin: 'M6 10.6S2.6 7.5 2.6 5a3.4 3.4 0 0 1 6.8 0c0 2.5-3.4 5.6-3.4 5.6zM6 6.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z',
  recover: 'M9.6 6.4A3.6 3.6 0 1 1 8.5 3.4M8.8 1.6v2.2H6.6',
  lock: 'M3.5 5.5h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1zM4 5.5V4a2 2 0 0 1 4 0v1.5',
  ret: 'M5 3L2.5 5.5 5 8M2.5 5.5h5a2 2 0 0 1 0 4H6',
  spin: 'M6 1.5a4.5 4.5 0 1 1-4.5 4.5',
  chevDown: 'M3 4.5l3 3 3-3',
  chevRight: 'M4.5 3l3 3-3 3',
  chevLeft: 'M7.5 2.5L4 6l3.5 3.5',
  more: 'M2.6 6h.01M6 6h.01M9.4 6h.01',
  close: 'M3 3l6 6M9 3L3 9',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 11, strokeWidth = 1.5, className }: IconProps) {
  const cls = ['icon', name === 'spin' ? 'icon--spin' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      fill={name === 'dot' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
