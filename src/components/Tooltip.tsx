'use client';

import { cloneElement, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';

export type TooltipProps = Omit<HTMLAttributes<HTMLSpanElement>, 'title' | 'children'> & {
  children: ReactElement;
  title?: ReactNode;
  body?: ReactNode;
  hasBody?: boolean;
  hasTitle?: boolean;
  /** The arrow edge, matching Figma; bottom places the tooltip above its trigger. */
  position?: 'bottom' | 'top' | 'left' | 'right';
  assetBaseUrl?: string;
};
const arrows = {
  bottom: ['81173.svg', '84c23.svg'], right: ['81173.svg', '84c23.svg'],
  top: ['be3a0.svg', '90305.svg'], left: ['f5718.svg', '0f506.svg'],
} as const;

export function Tooltip({ children, title = 'Title', body = 'Body Text', hasBody = true, hasTitle = true,
  position = 'bottom', assetBaseUrl, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props
}: TooltipProps) {
  const id = useId();
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false), [dismissed, setDismissed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasContent = hasTitle && title != null && title !== '' || hasBody && body != null && body !== '';
  const open = !!hasContent && !dismissed && (hovered || focused);
  const clearTimer = () => { clearTimeout(timer.current); };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setDismissed(true); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  const trigger = children as ReactElement<HTMLAttributes<HTMLElement>>;
  const describedBy = [trigger.props['aria-describedby'], open && id].filter(Boolean).join(' ') || undefined;
  const src = (file: string) => assetBaseUrl ? `${assetBaseUrl.replace(/\/$/, '')}/${file}` : new URL(`../../assets/tooltip/${file}`, import.meta.url).href;
  return <span {...props} className={['wa-tooltip-anchor', className].filter(Boolean).join(' ')}
    onMouseEnter={event => { onMouseEnter?.(event); clearTimer(); setHovered(true); setDismissed(false); }}
    onMouseLeave={event => { onMouseLeave?.(event); clearTimer(); timer.current = setTimeout(() => setHovered(false), 150); }}
    onFocus={event => { onFocus?.(event); setFocused(true); setDismissed(false); }}
    onBlur={event => { onBlur?.(event); if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    {cloneElement(trigger, { 'aria-describedby': describedBy })}
    {open && <span id={id} role="tooltip" className={`wa-tooltip wa-tooltip--${position}`}>
      <span className="wa-tooltip__arrow" aria-hidden="true"><span>{arrows[position].map(file => <img key={file} src={src(file)} width={8} height={8} alt="" />)}</span></span>
      {hasTitle && <span className="wa-tooltip__title">{title}</span>}
      {hasBody && <span className="wa-tooltip__body">{body}</span>}
    </span>}
  </span>;
}
