import { forwardRef, type HTMLAttributes } from 'react';
import { Avatar, type AvatarProps } from './Avatar.js';

export type AvatarGroupProps = HTMLAttributes<HTMLDivElement> & {
  avatars: readonly AvatarProps[];
  size?: 16 | 24 | 32 | 40;
  additionalCount?: number;
  hasNumber?: boolean;
};

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup({
  avatars, size = 40, additionalCount = 0, hasNumber = true, className, ...props
}, ref) {
  return <div {...props} ref={ref} className={['wa-avatar-group', `wa-avatar-group--${size}`, className].filter(Boolean).join(' ')}>
    <ul className="wa-avatar-group__avatars" aria-label="People">
      {avatars.map((avatar, index) => <li key={index} style={{ zIndex: avatars.length - index }}>
        {avatar.variant === 'initials' ? <Avatar {...avatar} size={size === 40 ? 32 : size} /> : <Avatar {...avatar} size={size} />}
      </li>)}
    </ul>
    {hasNumber && additionalCount > 0 && <span className="wa-avatar-group__count"><span aria-hidden="true">+{additionalCount}</span><span className="wa-avatar-group__sr-only">{additionalCount} more people</span></span>}
  </div>;
});
