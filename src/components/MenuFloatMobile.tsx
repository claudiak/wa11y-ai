import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { Icon } from './Icon.js';

export type MenuFloatMobileState = 'home' | 'records' | 'reports' | 'dashboard' | 'more';
export type MenuFloatMobileProps = Omit<ComponentPropsWithoutRef<'nav'>, 'children'> & {
  items?: readonly { value: MenuFloatMobileState; label: string; icon: string }[];
  state?: MenuFloatMobileState;
  defaultState?: MenuFloatMobileState;
  onNavigate?: (destination: MenuFloatMobileState) => void;
};

const defaultItems = [
  { value: 'home', label: 'Home', icon: 'home' },
  { value: 'records', label: 'Records', icon: 'mic' },
  { value: 'reports', label: 'Reports', icon: 'history' },
  { value: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { value: 'more', label: 'More', icon: 'menu' },
] as const;

/** Compact navigation with one labelled destination and four named icon buttons. */
export const MenuFloatMobile = forwardRef<HTMLElement, MenuFloatMobileProps>(function MenuFloatMobile({
  state, defaultState = 'home', onNavigate, items = defaultItems, className, 'aria-label': label = 'Mobile navigation', ...props
}, ref) {
  const [selected, setSelected] = useState(defaultState);
  const current = state ?? selected;
  return <nav {...props} ref={ref} aria-label={label} className={['wa-menu-float', className].filter(Boolean).join(' ')}>
    {items.map(item => <button key={item.value} type="button" className="wa-menu-float__item"
      data-destination={item.value} aria-label={item.label} aria-current={current === item.value ? 'page' : undefined}
      onClick={() => { if (state === undefined) setSelected(item.value); onNavigate?.(item.value); }}>
      <Icon name={item.icon} size={24} />
      {current === item.value && <span className="wa-menu-float__label">{item.label}</span>}
    </button>)}
  </nav>;
});
