import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Icon } from './Icon.js';

export type MainMenuItemState = 'default' | 'active' | 'hover' | 'focus';
export type MainMenuItemProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href: string;
  label?: ReactNode;
  leadingIcon?: boolean | ReactNode;
  trailingIcon?: boolean | ReactNode;
  state?: MainMenuItemState;
};

export const MainMenuItem = forwardRef<HTMLAnchorElement, MainMenuItemProps>(function MainMenuItem({
  label = 'Home', children, leadingIcon = true, trailingIcon = false, state = 'default', className,
  'aria-current': current, ...props
}, ref) {
  return <a {...props} ref={ref} className={['wa-main-menu-item', `wa-main-menu-item--${state}`, className].filter(Boolean).join(' ')}
    aria-current={current ?? (state === 'active' ? 'page' : undefined)}>
    {leadingIcon === true ? <Icon name="home" fill size={24} /> : leadingIcon}
    <span className="wa-main-menu-item__label">{children ?? label}</span>
    {trailingIcon === true ? <Icon name="chevron_right" size={24} /> : trailingIcon}
  </a>;
});
