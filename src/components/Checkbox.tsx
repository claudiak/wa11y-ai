'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export type CheckboxStatus = 'unselected' | 'selected' | 'success' | 'success-selected' | 'disabled' | 'disabled-selected';
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: ReactNode;
  hasLabel?: boolean;
  status?: CheckboxStatus;
  assetBaseUrl?: string;
};
const assets = {
  selected: new URL('../../assets/checkbox/6b2f9.svg', import.meta.url).href,
  success: new URL('../../assets/checkbox/7f9db.svg', import.meta.url).href,
  disabled: new URL('../../assets/checkbox/d90ff.svg', import.meta.url).href,
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
  label = 'Label', hasLabel = true, status = 'unselected', disabled = false,
  checked, defaultChecked, className, assetBaseUrl, ...props
}, ref) {
  const isDisabled = disabled || status.startsWith('disabled');
  const success = status.startsWith('success');
  const initialChecked = defaultChecked ?? (status === 'selected' || status.endsWith('-selected'));
  const src = (name: keyof typeof assets) => assetBaseUrl ? `${assetBaseUrl.replace(/\/$/, '')}/${assets[name].split('/').at(-1)}` : assets[name];
  return <label className={['wa-checkbox', success && 'wa-checkbox--success', isDisabled && 'wa-checkbox--disabled', className].filter(Boolean).join(' ')}>
    <input {...props} ref={ref} type="checkbox" className="wa-checkbox__control" disabled={isDisabled}
      checked={checked} defaultChecked={checked === undefined ? initialChecked : undefined} />
    <span className="wa-checkbox__visual" aria-hidden="true">
      <img className="wa-checkbox__selected" src={src('selected')} width={22} height={22} alt="" />
      <img className="wa-checkbox__success" src={src('success')} width={18} height={18} alt="" />
      <img className="wa-checkbox__disabled" src={src('disabled')} width={22} height={22} alt="" />
    </span>
    <span className={hasLabel ? 'wa-checkbox__label' : 'wa-checkbox__sr-only'}>{label}</span>
  </label>;
});
