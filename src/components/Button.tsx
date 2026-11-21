'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon.js';
import type { ButtonStatus, ButtonVariant } from './button-variants.js';

type NativeProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;
type NamedIcon = { 'aria-label': string; 'aria-labelledby'?: string } | { 'aria-label'?: string; 'aria-labelledby': string };
type Content =
  | { variant?: 'primary' | 'secondary' | 'link'; status?: ButtonStatus; children: ReactNode }
  | ({ variant: 'icon-only'; status?: ButtonStatus; children?: never } & NamedIcon);

export type ButtonProps = NativeProps & Content & {
  size?: 'default' | 'small';
  pill?: boolean;
  /** Link appearance can also be applied to icon-only buttons. */
  appearance?: 'default' | 'link';
  /** true uses the shared Material Symbol; false omits it; ReactNode supplies an application icon. */
  leadingIcon?: ReactNode | boolean;
  trailingIcon?: ReactNode | boolean;
  /** @deprecated Material icons use the shared font; custom nodes may supply their own assets. */
  assetBaseUrl?: string;
};

function ButtonIcon({ value, slot, size }: { value: ReactNode | boolean; slot: 0 | 1; size: number }) {
  if (!value) return null;
  return <span className="wa-button__icon" aria-hidden="true">{value === true ? <Icon name={slot === 0 ? 'add' : 'arrow_forward'} size={size} /> : value}</span>;
}

/** Native button behavior with shared status, size, and appearance variants. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary', status: suppliedStatus, leadingIcon = true, trailingIcon = false,
  size = 'default', appearance = 'default', pill = false,
  children, type = 'button', className, assetBaseUrl: _legacyAssetBaseUrl, ...props
}, ref) {
  const status = suppliedStatus ?? (variant === 'link' ? 'action' : 'user-profile');
  if (variant === 'icon-only' && !props['aria-label']?.trim() && !props['aria-labelledby']?.trim()) {
    throw new Error('Icon-only Button requires a nonempty aria-label or aria-labelledby.');
  }
  return <button {...props} ref={ref} type={type}
    className={['wa-button', `wa-button--${variant}`, `wa-button--${status}`, `wa-button--${size}`, appearance === 'link' && 'wa-button--link', pill && 'wa-button--pill', className].filter(Boolean).join(' ')}>
    <ButtonIcon value={variant === 'icon-only' ? leadingIcon || trailingIcon : leadingIcon} slot={variant === 'icon-only' && !leadingIcon ? 1 : 0} size={size === 'small' ? 20 : 24} />
    {variant !== 'icon-only' && <span className="wa-button__label">{children}</span>}
    {variant !== 'icon-only' && <ButtonIcon value={trailingIcon} slot={1} size={size === 'small' ? 20 : 24} />}
  </button>;
});

export type { ButtonStatus, ButtonVariant } from './button-variants.js';
