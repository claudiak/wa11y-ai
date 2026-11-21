'use client';

import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import type { InputStatus } from './Input.js';
import { Icon } from './Icon.js';

export type DropdownProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple'> & {
  label?: ReactNode;
  showLabel?: boolean;
  status?: InputStatus;
  helper?: boolean;
  helperText?: string;
};

/** Native select using the approved Input layout and keyboard behavior. */
export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(function Dropdown({
  label = 'Dropdown', showLabel = true, status = 'default', helper = false, helperText,
  id: suppliedId, disabled = false, required, className, children, ...props
}, ref) {
  const generatedId = useId(), id = suppliedId ?? generatedId;
  const isDisabled = disabled || status === 'disabled';
  const helperId = `${id}-helper`;
  return <div className={['wa-input', 'wa-dropdown', `wa-input--${isDisabled ? 'disabled' : status}`, className].filter(Boolean).join(' ')}>
    <div className={showLabel ? 'wa-input__heading' : 'wa-input__sr-only'}>
      <label htmlFor={id}>{label}</label>
      {required && <span className="wa-input__required" aria-hidden="true">*</span>}
    </div>
    <div className="wa-input__box wa-dropdown__box">
      <select {...props} ref={ref} id={id} className="wa-input__control wa-dropdown__control" disabled={isDisabled} required={required}
        aria-invalid={status === 'error' ? true : props['aria-invalid']}
        aria-describedby={[props['aria-describedby'], helper ? helperId : ''].filter(Boolean).join(' ') || undefined}>
        {children}
      </select>
      <Icon name="expand_more" size={20} className="wa-dropdown__chevron" />
    </div>
    {helper && <p id={helperId} className="wa-input__helper">{helperText}</p>}
  </div>;
});
