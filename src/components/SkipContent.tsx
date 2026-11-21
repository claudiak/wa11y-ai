import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes } from 'react';

export type SkipContentType = 'content' | 'menu' | 'search' | 'footer';
const destinations = {
  content: { label: 'Go to Content', number: 1 }, menu: { label: 'Go to Menu', number: 2 },
  search: { label: 'Go to Search', number: 3 }, footer: { label: 'Go to Footer', number: 4 },
} as const;
export type SkipContentProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type' | 'href'> & {
  href: string;
  type?: SkipContentType;
  state?: 'default' | 'hover' | 'focus' | 'active';
  label?: string;
};

export const SkipContent = forwardRef<HTMLAnchorElement, SkipContentProps>(function SkipContent({
  href, type = 'content', state = 'default', label, children, className, onClick, ...props
}, ref) {
  return <a {...props} ref={ref} href={href}
    className={['wa-skip-content', `wa-skip-content--${state}`, className].filter(Boolean).join(' ')}
    onClick={event => {
      onClick?.(event);
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || props.target && props.target !== '_self' || !href.startsWith('#')) return;
      let id: string;
      try { id = decodeURIComponent(href.slice(1)); } catch { return; }
      const destination = event.currentTarget.ownerDocument.getElementById(id);
      if (!destination) return;
      if (destination.tabIndex < 0 && !destination.hasAttribute('tabindex')) {
        destination.setAttribute('tabindex', '-1');
        destination.addEventListener('blur', () => {
          if (destination.getAttribute('tabindex') === '-1') destination.removeAttribute('tabindex');
        }, { once: true });
      }
      destination.focus({ preventScroll: true });
    }}>
    <span>{children ?? label ?? destinations[type].label}</span>
    <span className="wa-skip-content__number" aria-hidden="true">{destinations[type].number}</span>
  </a>;
});

export type SkipContentGroupProps = HTMLAttributes<HTMLElement> & {
  targets: Readonly<Record<SkipContentType, string>>;
};
export const SkipContentGroup = forwardRef<HTMLElement, SkipContentGroupProps>(function SkipContentGroup({
  targets, className, ...props
}, ref) {
  return <nav {...props} ref={ref} aria-label={props['aria-label'] ?? 'Skip links'} className={['wa-skip-group', className].filter(Boolean).join(' ')}>
    {(['content', 'menu', 'search', 'footer'] as const).map(type => <SkipContent key={type} type={type} href={targets[type]} />)}
  </nav>;
});
