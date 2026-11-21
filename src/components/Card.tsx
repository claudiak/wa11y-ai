import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { AvatarGroup } from './AvatarGroup.js';
import type { AvatarProps } from './Avatar.js';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { Icon } from './Icon.js';
import { ProgressBar } from './ProgressBar.js';

export type CardType = 'full' | 'image' | 'simple' | 'slot';
export type CardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  type?: CardType;
  state?: 'default' | 'hover' | 'focus';
  heading?: string;
  description?: ReactNode;
  image?: { src: string; alt: string };
  tag?: boolean;
  tagLabel?: string;
  recommendation?: boolean;
  recommendationText?: ReactNode;
  title?: boolean;
  metaRow?: boolean;
  badge?: boolean;
  badgeLabel?: string;
  avatarGroup?: boolean;
  participants?: readonly AvatarProps[];
  additionalCount?: number;
  progressBar?: boolean;
  progress?: number;
  progressLabel?: string;
  actions?: boolean;
  onSkip?: () => void;
  onStart?: () => void;
  skipLabel?: string;
  startLabel?: string;
  avatar?: boolean;
  author?: ReactNode;
};

export const Card = forwardRef<HTMLElement, CardProps>(function Card({
  type = 'full', state = 'default', heading = 'Memory Tecniques',
  description = 'Learn proven strategies for improving memory retention.', image,
  tag = true, tagLabel = 'Recommended next step', recommendation = true,
  recommendationText = 'Because you paused during recall exercises', title = true,
  metaRow = true, badge = true, badgeLabel = 'Study', avatarGroup = true,
  participants = [], additionalCount = 0, progressBar = true, progress = 50,
  progressLabel = 'Resume from step 3', actions = true, onSkip, onStart,
  skipLabel = 'Skip', startLabel = 'Start Now', avatar = true, author,
  children, className, ...props
}, ref) {
  const headingId = useId();
  return <article {...props} ref={ref} aria-labelledby={props['aria-labelledby'] ?? (type !== 'slot' && title ? headingId : undefined)}
    className={['wa-card', `wa-card--${type}`, `wa-card--${state}`, className].filter(Boolean).join(' ')}>
    {type === 'slot' ? children : <>
      {type === 'full' && (tag || recommendation) && <div className="wa-card__recommendation">
        {tag && <div className="wa-card__tag"><Icon name="auto_awesome" size={18} fill /><span>{tagLabel}</span></div>}
        {recommendation && <p className="wa-card__reason">{recommendationText}</p>}
      </div>}
      {(type === 'full' || type === 'image') && image && <img className="wa-card__image" src={image.src} alt={image.alt} />}
      {metaRow && (badge || avatarGroup && participants.length > 0) && <div className="wa-card__meta">
        {badge && <Badge status="warning" size="small" label={badgeLabel} />}
        {avatarGroup && participants.length > 0 && <AvatarGroup avatars={participants} size={24} additionalCount={additionalCount} />}
      </div>}
      {title && <div className="wa-card__heading"><h3 id={headingId}>{heading}</h3><p>{description}</p></div>}
      {type === 'full' && progressBar && <div className="wa-card__progress">
        <span>{progressLabel}</span>
        <ProgressBar value={progress} label={progressLabel} />
      </div>}
      {actions && <div className="wa-card__actions">
        <Button variant="link" status="neutral" leadingIcon={false} className="wa-card__skip" onClick={onSkip}>{skipLabel}</Button>
        <Button status="action" leadingIcon={<Icon name="star" size={20} fill />} onClick={onStart}>{startLabel}</Button>
      </div>}
      {type === 'full' && avatar && author && <div className="wa-card__author">{author}</div>}
      {children}
    </>}
  </article>;
});
