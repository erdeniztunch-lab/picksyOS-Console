import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';
import { cx } from './primitives';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'ink';
export type ButtonSize = 'md' | 'sm' | 'touch';
export type ButtonState = 'idle' | 'processing' | 'disabled' | 'locked';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
}

/**
 * Disabled and locked buttons use aria-disabled, not disabled, so they stay
 * focusable and can show their reason or tooltip.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', state = 'idle', className, children, onClick, ...rest },
  ref,
) {
  const inert = state === 'disabled' || state === 'locked';
  return (
    <button
      ref={ref}
      type="button"
      className={cx('btn', `btn--${variant}`, `btn--${size}`, inert && 'btn--disabled', state === 'processing' && 'btn--processing', className)}
      aria-disabled={inert || state === 'processing' || undefined}
      aria-busy={state === 'processing' || undefined}
      onClick={onClick}
      {...rest}
    >
      {state === 'processing' && <Icon name="spin" size={14} strokeWidth={1.6} />}
      {state === 'locked' && <Icon name="lock" size={12} />}
      {children}
    </button>
  );
});
