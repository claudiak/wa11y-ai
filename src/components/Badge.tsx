import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon.js';

export type BadgeStatus = 'user-profile' | 'info' | 'success' | 'warning' | 'destructive' | 'dark' | 'neutral' | 'disabled';
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  label?: ReactNode;
  status?: BadgeStatus;
  size?: 'default' | 'small';
  state?: 'default' | 'focus';
  leadingIcon?: boolean | ReactNode;
  trailingIcon?: boolean | ReactNode;
  /** Application-provided image URL or avatar content. */
  avatar?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  disabled?: boolean;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({
  label = 'Label', children, status = 'user-profile', size = 'default', state = 'default',
  leadingIcon = false, trailingIcon = false, avatar, onDismiss, dismissLabel,
  disabled = false, className, ...props
}, ref) {
  const isDisabled = disabled || status === 'disabled';
  const content = children ?? label, iconSize = size === 'small' ? 16 : 20;
  const close = trailingIcon === true || !trailingIcon ? <Icon name="close" size={iconSize} /> : trailingIcon;
  return <span {...props} ref={ref} className={['wa-badge', `wa-badge--${isDisabled ? 'disabled' : status}`, `wa-badge--${size}`, state === 'focus' && 'wa-badge--focus', className].filter(Boolean).join(' ')} aria-disabled={isDisabled || props['aria-disabled']}>
    {avatar && <span className="wa-badge__avatar" aria-hidden="true">{typeof avatar === 'string' ? <img src={avatar} alt="" /> : avatar}</span>}
    {leadingIcon && <span className="wa-badge__icon" aria-hidden="true">{leadingIcon === true ? <Icon name="alarm" size={iconSize} /> : leadingIcon}</span>}
    <span className="wa-badge__label">{content}</span>
    {onDismiss ? <button type="button" className="wa-badge__dismiss" disabled={isDisabled} onClick={onDismiss}
      aria-label={dismissLabel ?? (typeof content === 'string' ? `Remove ${content}` : 'Remove badge')}>{close}</button> :
      trailingIcon && <span className="wa-badge__icon" aria-hidden="true">{close}</span>}
  </span>;
});
