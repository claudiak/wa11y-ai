'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export type RadioButtonStatus = 'unselected' | 'selected' | 'success' | 'success-selected' | 'error' | 'error-selected' | 'disabled' | 'disabled-selected';
export type RadioButtonProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: ReactNode;
  hasLabel?: boolean;
  status?: RadioButtonStatus;
  assetBaseUrl?: string;
};
const images = {
  default: [new URL('../../assets/radio/0e31e.svg', import.meta.url).href, new URL('../../assets/radio/52bae.svg', import.meta.url).href],
  success: [new URL('../../assets/radio/21326.svg', import.meta.url).href, new URL('../../assets/radio/6d213.svg', import.meta.url).href],
  error: [new URL('../../assets/radio/ef4c5.svg', import.meta.url).href, new URL('../../assets/radio/0f247.svg', import.meta.url).href],
  disabled: [new URL('../../assets/radio/f3454.svg', import.meta.url).href, new URL('../../assets/radio/4559f.svg', import.meta.url).href],
} as const;

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton({
  label = 'Label', hasLabel = true, status = 'unselected', disabled = false,
  checked, defaultChecked, className, assetBaseUrl, ...props
}, ref) {
  const isDisabled = disabled || status.startsWith('disabled');
  const variant = isDisabled ? 'disabled' : status.startsWith('success') ? 'success' : status.startsWith('error') ? 'error' : 'default';
  const initialChecked = defaultChecked ?? (status === 'selected' || status.endsWith('-selected'));
  const src = (url: string) => assetBaseUrl ? `${assetBaseUrl.replace(/\/$/, '')}/${url.split('/').at(-1)}` : url;
  return <label className={['wa-radio', `wa-radio--${variant}`, className].filter(Boolean).join(' ')}>
    <input {...props} ref={ref} type="radio" className="wa-radio__control" disabled={isDisabled}
      checked={checked} defaultChecked={checked === undefined ? initialChecked : undefined}
      aria-invalid={variant === 'error' ? true : props['aria-invalid']} />
    <span className="wa-radio__visual" aria-hidden="true">
      <img className="wa-radio__unselected" src={src(images[variant][0])} width={22.5} height={22} alt="" />
      <img className="wa-radio__selected" src={src(images[variant][1])} width={22.5} height={22} alt="" />
    </span>
    <span className={hasLabel ? 'wa-radio__label' : 'wa-radio__sr-only'}>{label}</span>
  </label>;
});
