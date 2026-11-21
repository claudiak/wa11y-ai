import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { Avatar, type AvatarProps } from './Avatar.js';
import { Button } from './Button.js';
import { Icon } from './Icon.js';

export type CardHorizontalType = 'image' | 'avatar' | 'icon' | 'slot';
export type CardHorizontalProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  type?: CardHorizontalType;
  state?: 'default' | 'hover' | 'focus';
  title?: string;
  description?: ReactNode;
  image?: { src: string; alt: string };
  avatar?: AvatarProps;
  icon?: ReactNode;
  hasButton?: boolean;
  hasClose?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
  disabled?: boolean;
};

export const CardHorizontal = forwardRef<HTMLElement, CardHorizontalProps>(function CardHorizontal({
  type = 'image', state = 'default', title, description, image, avatar, icon,
  hasButton = true, hasClose = true, actionLabel, onAction, onDismiss,
  dismissLabel, disabled = false, children, className, ...props
}, ref) {
  const titleId = useId();
  const heading = title ?? (type === 'avatar' ? 'Martha Carvalho' : type === 'icon' ? 'Camping Fanatics' : 'Community XYZ Blue Lake');
  return <article {...props} ref={ref} aria-labelledby={props['aria-labelledby'] ?? (type === 'slot' ? undefined : titleId)}
    className={['wa-card-horizontal', `wa-card-horizontal--${type}`, `wa-card-horizontal--${state}`, className].filter(Boolean).join(' ')}>
    {type === 'slot' ? children : <>
      <div className="wa-card-horizontal__lead">
        {type === 'image' && image && <img className="wa-card-horizontal__image" src={image.src} alt={image.alt} />}
        {type === 'avatar' && <Avatar {...avatar} size={40} variant="image" alt="" />}
        {type === 'icon' && <span className="wa-card-horizontal__icon" aria-hidden="true">{icon ?? <Icon name="flashlight_on" size={40} />}</span>}
        <div className="wa-card-horizontal__details"><h3 id={titleId}>{heading}</h3><p>{description ?? (type === 'avatar' ? '238 Followers' : 'Description Sample')}</p></div>
      </div>
      {(hasButton || hasClose && onDismiss) && <div className="wa-card-horizontal__trail">
        {hasButton && <Button variant="secondary" status="action" leadingIcon={false} disabled={disabled} onClick={onAction}>{actionLabel ?? (type === 'avatar' ? 'Follow' : 'Join')}</Button>}
        {hasClose && onDismiss && <button className="wa-card-horizontal__dismiss" type="button" disabled={disabled} onClick={onDismiss} aria-label={dismissLabel ?? `Dismiss ${heading}`}><Icon name="close" size={20} /></button>}
      </div>}
    </>}
  </article>;
});
