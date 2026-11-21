import { forwardRef, useState, type HTMLAttributes } from 'react';

export type AvatarSize = 16 | 20 | 24 | 32 | 40;
type AvatarVariant = { variant?: 'image' | 'icon'; size?: AvatarSize } | { variant: 'initials'; size?: Exclude<AvatarSize, 40> };
export type AvatarProps = HTMLAttributes<HTMLSpanElement> & AvatarVariant & {
  src?: string;
  alt?: string;
  initials?: string;
  /** Optional public directory containing the supplied icon artwork. */
  assetBaseUrl?: string;
};

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({
  variant = 'image', size, src, alt = '', initials = '', assetBaseUrl,
  children, className, role, ...props
}, ref) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const actualSize = size ?? (variant === 'initials' ? 32 : 40);
  const showPhoto = variant === 'image' && src && failedSrc !== src;
  const showInitials = variant === 'initials' || (!showPhoto && initials);
  const iconSrc = assetBaseUrl ? `${assetBaseUrl.replace(/\/$/, '')}/3f2c9.png` : new URL('../../assets/avatar/3f2c9.png', import.meta.url).href;
  return <span {...props} ref={ref} role={role ?? (alt || props['aria-label'] || props['aria-labelledby'] ? 'img' : undefined)} aria-label={props['aria-label'] ?? (alt || undefined)}
    className={['wa-avatar', `wa-avatar--${actualSize}`, !showPhoto && !children && 'wa-avatar--fallback', showInitials && 'wa-avatar--initials', className].filter(Boolean).join(' ')}>
    {children ?? (showPhoto ? <img className="wa-avatar__photo" src={src} alt="" onError={() => setFailedSrc(src)} /> :
      showInitials ? <span aria-hidden="true">{initials}</span> : <img className="wa-avatar__icon" src={iconSrc} alt="" />)}
  </span>;
});
