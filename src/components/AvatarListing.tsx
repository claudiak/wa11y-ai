import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Avatar, type AvatarProps } from './Avatar.js';
import { Icon } from './Icon.js';

export type AvatarListingProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> & {
  title?: string;
  description?: ReactNode;
  avatar?: AvatarProps;
  size?: 16 | 24 | 32 | 40;
  state?: 'default' | 'focus';
  hasDetails?: boolean;
  hasTitle?: boolean;
  hasDescription?: boolean;
  /** Decorative grip; application-level reordering remains caller-controlled. */
  hasDragDrop?: boolean;
};

export const AvatarListing = forwardRef<HTMLButtonElement, AvatarListingProps>(function AvatarListing({
  title = 'Name Surname', description = 'Position / Description', avatar, size = 40,
  state = 'default', hasDetails = true, hasTitle = true, hasDescription = true,
  hasDragDrop = false, className, type = 'button', ...props
}, ref) {
  return <button {...props} ref={ref} type={type}
    aria-label={props['aria-label'] ?? (!hasDetails || !hasTitle ? title : undefined)}
    className={['wa-avatar-listing', `wa-avatar-listing--${size}`, `wa-avatar-listing--${state}`, className].filter(Boolean).join(' ')}>
    <span className="wa-avatar-listing__body">
      {avatar?.variant === 'initials' ? <Avatar {...avatar} size={size === 40 ? 32 : size} alt="" aria-hidden="true" /> : <Avatar {...avatar} size={size} alt="" aria-hidden="true" />}
      {hasDetails && <span className="wa-avatar-listing__details">
        {hasTitle && <span className="wa-avatar-listing__title">{title}</span>}{' '}
        {hasDescription && size !== 16 && <span className="wa-avatar-listing__description">{description}</span>}
      </span>}
    </span>
    {hasDragDrop && <Icon name="drag_indicator" size={24} />}
  </button>;
});
