import { forwardRef, type HTMLAttributes } from 'react';

export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  value?: number;
  /** Original Figma percentage variants; value takes precedence. */
  percentual?: '25' | '50' | '100';
  label?: string;
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar({
  value, percentual = '100', label = 'Progress', className,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, ...props
}, ref) {
  const supplied = value ?? Number(percentual);
  const percent = Number.isFinite(supplied) ? Math.min(100, Math.max(0, supplied)) : 0;
  return <div {...props} ref={ref} className={['wa-progress', percent === 100 && 'wa-progress--complete', className].filter(Boolean).join(' ')}>
    <progress value={percent} max={100} aria-label={ariaLabel ?? label} aria-labelledby={labelledBy} aria-describedby={describedBy} />
    <span className="wa-progress__percentage" aria-hidden="true">{percent}%</span>
  </div>;
});
