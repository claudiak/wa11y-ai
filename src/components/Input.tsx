'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon.js';

export type InputStatus = 'default' | 'filled' | 'selected' | 'focus' | 'error' | 'disabled';
export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: ReactNode;
  showLabel?: boolean;
  status?: InputStatus;
  leadingIcon?: boolean | ReactNode;
  trailingIcon?: boolean | ReactNode;
  helper?: boolean;
  helperText?: string;
  hasTip?: boolean;
  tipText?: string;
  assetBaseUrl?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label = 'Input', showLabel = true, status = 'default', leadingIcon = true, trailingIcon = false,
  helper = false, helperText = 'Helper text', hasTip = false, tipText, assetBaseUrl: _legacyAssetBaseUrl,
  id: suppliedId, disabled = false, required, className, placeholder = 'Placeholder', ...props
}, ref) {
  const generatedId = useId(), id = suppliedId ?? generatedId;
  const isDisabled = disabled || status === 'disabled', isError = status === 'error';
  const helperId = `${id}-helper`, tipId = `${id}-tip`;
  const descriptions = [props['aria-describedby'], helper ? helperId : '', hasTip && tipText ? tipId : ''].filter(Boolean).join(' ') || undefined;
  const icon = (value: ReactNode | boolean, trailing = false) => !value ? null :
    <span className={`wa-input__icon${trailing ? ' wa-input__icon--trailing' : ' wa-input__icon--leading'}`} aria-hidden="true">
      {value === true ? <Icon name={trailing ? 'calendar_today' : 'search'} size={20} /> : value}
    </span>;
  return <div className={['wa-input', `wa-input--${isDisabled ? 'disabled' : status}`, className].filter(Boolean).join(' ')}>
    <div className={showLabel ? 'wa-input__heading' : 'wa-input__sr-only'}>
      <label htmlFor={id}>{label}</label>
      {required && <span className="wa-input__required" aria-hidden="true">*</span>}
      {hasTip && <span title={tipText}><Icon name="help" size={16} fill /></span>}
    </div>
    <div className="wa-input__box">
      {icon(leadingIcon)}
      <input {...props} id={id} ref={ref} className="wa-input__control" disabled={isDisabled} required={required}
        placeholder={placeholder} aria-invalid={isError ? true : props['aria-invalid']} aria-describedby={descriptions} />
      {icon(trailingIcon, true)}
    </div>
    {helper && <p id={helperId} className="wa-input__helper">{helperText}</p>}
    {hasTip && tipText && <span id={tipId} className="wa-input__sr-only wa-input__tip-text">{tipText}</span>}
  </div>;
});
