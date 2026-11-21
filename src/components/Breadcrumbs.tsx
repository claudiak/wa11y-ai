import { forwardRef, type HTMLAttributes, type ReactNode, type Ref, type MouseEventHandler } from 'react';
import { Icon } from './Icon.js';

export type BreadcrumbsProps = HTMLAttributes<HTMLElement> & {
  label?: ReactNode;
  state?: 'default' | 'hover' | 'focus';
} & ({ type: 'link'; href: string; target?: string; rel?: string } | { type?: 'current'; href?: never; target?: never; rel?: never });

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs({
  label = 'Label', children, type = 'current', state = 'default', href, target, rel, className, ...props
}, ref) {
  const classes = ['wa-breadcrumb', `wa-breadcrumb--${type}`, `wa-breadcrumb--${state}`, className].filter(Boolean).join(' ');
  return type === 'link' ? <a {...props} ref={ref as Ref<HTMLAnchorElement>} href={href} target={target} rel={rel} className={classes}>
    <span>{children ?? label}</span><Icon name="chevron_right" size={24} />
  </a> : <span {...props} ref={ref as Ref<HTMLSpanElement>} className={classes} aria-current="page">{children ?? label}</span>;
});

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  state?: 'default' | 'hover' | 'focus';
};
export type BreadcrumbsGroupProps = HTMLAttributes<HTMLElement> & {
  /** Ancestors need hrefs; the final item is always the current page. */
  items: readonly BreadcrumbItem[];
  hasLevel1?: boolean;
  hasLevel2?: boolean;
  hasLevel3?: boolean;
};
export const BreadcrumbsGroup = forwardRef<HTMLElement, BreadcrumbsGroupProps>(function BreadcrumbsGroup({
  items, hasLevel1 = true, hasLevel2 = true, hasLevel3 = true, className, ...props
}, ref) {
  const levels = [hasLevel1, hasLevel2, hasLevel3];
  return <nav {...props} ref={ref} aria-label={props['aria-label'] ?? 'Breadcrumb'} className={['wa-breadcrumbs-group', className].filter(Boolean).join(' ')}>
    <ol>{items.map((item, index) => {
      const current = index === items.length - 1;
      if (!current && levels[index] === false) return null;
      if (!current && !item.href) throw new Error('Breadcrumb ancestors require an href.');
      return <li key={index}>{current ? <Breadcrumbs label={item.label} state={item.state} /> :
        <Breadcrumbs type="link" href={item.href!} label={item.label} state={item.state} onClick={item.onClick} />}</li>;
    })}</ol>
  </nav>;
});
