import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

export type IconProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> & {
  name: string;
  size?: number | string;
  colour?: CSSProperties['color'];
  color?: CSSProperties['color'];
  fill?: boolean;
  label?: string;
  decorative?: boolean;
};

/** Material Symbols Outlined; decorative and colour-inheriting by default. */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon({
  name, size = 24, colour, color, fill = false, label, decorative, className, style,
  'aria-hidden': suppliedHidden, 'aria-label': suppliedLabel, role, ...props
}, ref) {
  const accessibleLabel = label ?? suppliedLabel;
  const hidden = suppliedHidden ?? decorative ?? !(accessibleLabel || props['aria-labelledby']);
  const opticalSize = typeof size === 'number' ? Math.min(48, Math.max(20, size)) : 24;
  return <span {...props} ref={ref} className={['material-symbols-outlined', 'wa-icon', className].filter(Boolean).join(' ')}
    aria-hidden={hidden} aria-label={hidden === true || hidden === 'true' ? undefined : accessibleLabel}
    role={hidden === true || hidden === 'true' ? undefined : role ?? 'img'}
    style={{ ...style, fontSize: size, color: colour ?? color ?? style?.color ?? 'inherit',
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${opticalSize}` }}>{name}</span>;
});
