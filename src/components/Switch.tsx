'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';

export type SwitchState = 'default' | 'hovered' | 'focused' | 'pressed' | 'disabled';
export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  on?: boolean;
  defaultOn?: boolean;
  /** @deprecated Both sizes use the shared focus-state artwork. */
  hasFocusIndicator?: boolean;
  assetBaseUrl?: string;
} & ({ size?: 'large'; state?: SwitchState } | { size: 'small'; state?: Exclude<SwitchState, 'pressed'> });

const switchImages = {
  default: [new URL('../../assets/switch/eace5.svg', import.meta.url).href, new URL('../../assets/switch/0b212.svg', import.meta.url).href],
  hovered: [new URL('../../assets/switch/34e80.svg', import.meta.url).href, new URL('../../assets/switch/5721f.svg', import.meta.url).href],
  focused: [new URL('../../assets/switch/1320d.svg', import.meta.url).href, new URL('../../assets/switch/e51af.svg', import.meta.url).href],
  disabled: [new URL('../../assets/switch/e2234.svg', import.meta.url).href, new URL('../../assets/switch/acbca.svg', import.meta.url).href],
} as const;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({
  size = 'large', state = 'default', on, defaultOn = true, checked, defaultChecked,
  disabled = false, hasFocusIndicator: _legacyFocusIndicator, assetBaseUrl, className,
  onChange, onFocus, onBlur, onPointerEnter, onPointerLeave, onPointerDown, onPointerUp, onPointerCancel, ...props
}, ref) {
  const [internalOn, setInternalOn] = useState(defaultChecked ?? defaultOn);
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false), [pressed, setPressed] = useState(false);
  const isOn = on ?? checked ?? internalOn, isDisabled = disabled || state === 'disabled';
  const activeState = isDisabled ? 'disabled' : state !== 'default' ? state : pressed ? size === 'small' ? 'hovered' : 'pressed' : focused ? 'focused' : hovered ? 'hovered' : 'default';
  const imageState = activeState === 'focused' ? 'default' : activeState === 'pressed' ? 'hovered' : activeState;
  const image = switchImages[imageState][isOn ? 1 : 0];
  const src = assetBaseUrl ? `${assetBaseUrl.replace(/\/$/, '')}/${image.split('/').at(-1)}` : image;
  return <span className={['wa-switch', `wa-switch--${size}`, className].filter(Boolean).join(' ')} data-on={isOn} data-state={activeState}>
    <input {...props} ref={ref} type="checkbox" role="switch" className="wa-switch__control" checked={isOn} disabled={isDisabled}
      onChange={e => { if (on === undefined && checked === undefined) setInternalOn(e.target.checked); onChange?.(e); }}
      onFocus={e => { setFocused(e.currentTarget.matches(':focus-visible')); onFocus?.(e); }}
      onBlur={e => { setFocused(false); setPressed(false); onBlur?.(e); }}
      onPointerEnter={e => { setHovered(true); onPointerEnter?.(e); }}
      onPointerLeave={e => { setHovered(false); setPressed(false); onPointerLeave?.(e); }}
      onPointerDown={e => { setPressed(true); onPointerDown?.(e); }}
      onPointerUp={e => { setPressed(false); onPointerUp?.(e); }}
      onPointerCancel={e => { setPressed(false); onPointerCancel?.(e); }} />
    <span className="wa-switch__visual" aria-hidden="true">{isDisabled || assetBaseUrl ? <img src={src} width={36} height={20} alt="" /> :
      <svg width={36} height={20} viewBox="0 0 36 20" fill="none" aria-hidden="true" focusable="false">
        <path className="wa-switch__track" d={isOn
          ? 'M0 10C0 4.47715 4.47715 0 10 0H26C31.5228 0 36 4.47715 36 10V10C36 15.5228 31.5228 20 26 20H10C4.47715 20 0 15.5228 0 10V10Z'
          : 'M10 1H26C30.9706 1 35 5.02944 35 10C35 14.9706 30.9706 19 26 19H10C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1Z'} />
        <circle className="wa-switch__thumb" cx={isOn ? 24 : 10} cy={10} r={isOn ? 8 : 6} />
      </svg>}
    </span>
  </span>;
});
