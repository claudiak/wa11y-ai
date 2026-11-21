import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon.js';

export type SidebarItemState = 'default' | 'selected' | 'hover' | 'focus';
export type SidebarMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  icon?: boolean | ReactNode;
  dropdown?: boolean;
  collapsed?: boolean;
  state?: SidebarItemState;
};
export const SidebarMenuItem = forwardRef<HTMLButtonElement, SidebarMenuItemProps>(function SidebarMenuItem({
  label = 'ALL COMMITTES', icon = true, dropdown = false, collapsed = false,
  state = 'default', className, type = 'button', ...props
}, ref) {
  return <button {...props} ref={ref} type={type} aria-label={props['aria-label'] ?? (collapsed ? label : undefined)}
    aria-current={props['aria-current'] ?? (state === 'selected' && !dropdown ? 'page' : undefined)}
    title={props.title ?? (collapsed ? label : undefined)}
    className={['wa-sidebar-item', `wa-sidebar-item--${state}`, collapsed && 'wa-sidebar-item--collapsed', className].filter(Boolean).join(' ')}>
    {icon && <span className="wa-sidebar-item__icon" aria-hidden="true">{icon === true ? <Icon name="favorite" size={24} /> : icon}</span>}
    {!collapsed && <span className="wa-sidebar-item__label">{label}</span>}
    {dropdown && !collapsed && <Icon name={props['aria-expanded'] ? 'expand_less' : 'expand_more'} size={24} />}
  </button>;
});

export type SidebarMenuTitleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  image?: { src: string; alt: string };
  collapsed?: boolean;
  trailingIcon?: boolean;
};
export const SidebarMenuTitle = forwardRef<HTMLButtonElement, SidebarMenuTitleProps>(function SidebarMenuTitle({
  label = 'All Committees', image, collapsed = false, trailingIcon = true, className, type = 'button', ...props
}, ref) {
  return <button {...props} ref={ref} type={type} aria-label={props['aria-label'] ?? (collapsed ? label : undefined)}
    title={props.title ?? (collapsed ? label : undefined)}
    className={['wa-sidebar-title', collapsed && 'wa-sidebar-title--collapsed', className].filter(Boolean).join(' ')}>
    {image && <img src={image.src} alt={image.alt} />}
    {!collapsed && <><span>{label}</span>{trailingIcon && <Icon name="expand_more" size={24} />}</>}
  </button>;
});

export type SidebarSubmenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  collapsed?: boolean;
  state?: SidebarItemState;
};
export const SidebarSubmenuItem = forwardRef<HTMLButtonElement, SidebarSubmenuItemProps>(function SidebarSubmenuItem({
  label = 'Menu subitem text', collapsed = false, state = 'default', className, type = 'button', ...props
}, ref) {
  return <div className={['wa-sidebar-subitem', collapsed && 'wa-sidebar-subitem--compact'].filter(Boolean).join(' ')}>
    <div className="wa-sidebar-subitem__rail"><button {...props} ref={ref} type={type}
      aria-current={props['aria-current'] ?? (state === 'selected' ? 'page' : undefined)}
      className={['wa-sidebar-subitem__button', `wa-sidebar-subitem__button--${state}`, className].filter(Boolean).join(' ')}>{label}</button></div>
  </div>;
});

export type SidebarSubmenuOption = { value: string; label: string; disabled?: boolean };
const submenuOptions: readonly SidebarSubmenuOption[] = [
  { value: 'business', label: 'Business' }, { value: 'school', label: 'School' },
  { value: 'family', label: 'Family' }, { value: 'friends', label: 'Friends' },
];
export type SubmenuCollapsibleProps = HTMLAttributes<HTMLDivElement> & {
  items?: readonly SidebarSubmenuOption[];
  selectedValue?: string;
  onSelectItem?: (value: string) => void;
};
export const SubmenuCollapsible = forwardRef<HTMLDivElement, SubmenuCollapsibleProps>(function SubmenuCollapsible({
  items = submenuOptions, selectedValue = 'school', onSelectItem, className, ...props
}, ref) {
  return <div {...props} ref={ref} className={['wa-sidebar-popover', className].filter(Boolean).join(' ')}>
    {items.map(item => <SidebarSubmenuItem key={item.value} label={item.label} collapsed disabled={item.disabled}
      state={selectedValue === item.value ? 'selected' : 'default'} onClick={() => onSelectItem?.(item.value)} />)}
  </div>;
});

export type SidebarMenuItemDropdownProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  label?: string;
  icon?: ReactNode;
  collapsed?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: readonly SidebarSubmenuOption[];
  selectedValue?: string;
  onSelectItem?: (value: string) => void;
};
export function SidebarMenuItemDropdown({
  label = 'Record', icon = <Icon name="mic" size={24} />, collapsed = false,
  open: suppliedOpen, defaultOpen = false, onOpenChange,
  items = [submenuOptions[0]!, submenuOptions[1]!, submenuOptions[3]!, submenuOptions[2]!],
  selectedValue, onSelectItem, className, onKeyDown, onBlur, ...props
}: SidebarMenuItemDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = suppliedOpen ?? internalOpen;
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const changeOpen = (next: boolean) => { setInternalOpen(next); onOpenChange?.(next); };
  useEffect(() => {
    if (!open || !collapsed) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setInternalOpen(false); onOpenChange?.(false);
      }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, collapsed, onOpenChange]);
  return <div {...props} ref={root} className={['wa-sidebar-dropdown', collapsed && 'wa-sidebar-dropdown--collapsed', className].filter(Boolean).join(' ')}
    onBlur={event => {
      onBlur?.(event);
      if (collapsed && open && !event.currentTarget.contains(event.relatedTarget)) changeOpen(false);
    }}
    onKeyDown={event => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && event.key === 'Escape' && open) {
        event.preventDefault(); event.stopPropagation(); changeOpen(false); trigger.current?.focus();
      }
    }}>
    <SidebarMenuItem ref={trigger} label={label} icon={icon} dropdown collapsed={collapsed} state={open || !collapsed ? 'selected' : 'default'}
      aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={() => changeOpen(!open)} />
    {open && (collapsed ? <SubmenuCollapsible id={panelId} items={items} selectedValue={selectedValue} onSelectItem={value => {
      onSelectItem?.(value); changeOpen(false); trigger.current?.focus();
    }} /> : <div id={panelId} className="wa-sidebar-dropdown__list">
      {items.map(item => <SidebarSubmenuItem key={item.value} label={item.label} disabled={item.disabled}
        state={selectedValue === item.value ? 'selected' : 'default'} onClick={() => onSelectItem?.(item.value)} />)}
    </div>)}
  </div>;
}

export type SidebarDesktopState = 'default' | 'collapsed' | 'collapsed-submenu';
export type SidebarMenuDesktopProps = HTMLAttributes<HTMLElement> & {
  titleTrailingIcon?: boolean;
  state?: SidebarDesktopState;
  defaultState?: SidebarDesktopState;
  onStateChange?: (state: SidebarDesktopState) => void;
  collapseIcon?: boolean;
  showTitle?: boolean;
  text?: string;
  image?: { src: string; alt: string };
  label?: string;
  selectedValue?: string;
  onNavigate?: (value: string) => void;
};
export const SidebarMenuDesktop = forwardRef<HTMLElement, SidebarMenuDesktopProps>(function SidebarMenuDesktop({
  state: suppliedState, defaultState = 'default', onStateChange, collapseIcon = true,
  showTitle = false, text = 'Sample Title sidebar menu', image, label = 'HOME', titleTrailingIcon = true,
  selectedValue, onNavigate, children, className, ...props
}, ref) {
  const [internalState, setInternalState] = useState(defaultState);
  const [recordOpen, setRecordOpen] = useState(true);
  const state = suppliedState ?? internalState, collapsed = state !== 'default';
  const changeState = (next: SidebarDesktopState) => { setInternalState(next); onStateChange?.(next); };
  return <nav {...props} ref={ref} aria-label={props['aria-label'] ?? 'Sidebar navigation'}
    className={['wa-sidebar', collapsed && 'wa-sidebar--collapsed', className].filter(Boolean).join(' ')}>
    {showTitle && <div className="wa-sidebar__caption">{collapsed ? <span className="wa-sidebar__sr-only">{text}</span> : text}</div>}
    <SidebarMenuTitle image={image} label={label} collapsed={collapsed} trailingIcon={titleTrailingIcon} onClick={() => onNavigate?.('home')} />
    <div className="wa-sidebar__items">
      {children ?? <>
      <SidebarMenuItem label="Analytics" icon={<Icon name="bar_chart" size={24} />} collapsed={collapsed} state={selectedValue === 'analytics' ? 'selected' : 'default'} onClick={() => onNavigate?.('analytics')} />
      <SidebarMenuItemDropdown collapsed={collapsed} open={collapsed ? state === 'collapsed-submenu' : recordOpen}
        onOpenChange={open => collapsed ? changeState(open ? 'collapsed-submenu' : 'collapsed') : setRecordOpen(open)}
        selectedValue={selectedValue} onSelectItem={onNavigate} />
      {([['favorite', 'Favorite'], ['folder', 'Files'], ['notifications', 'Notifications'], ['calendar_today', 'Calendar']] as const).map(([icon, itemLabel]) =>
        <SidebarMenuItem key={icon} label={itemLabel} collapsed={collapsed} icon={<Icon name={icon} size={24} />}
          state={selectedValue === icon ? 'selected' : 'default'} onClick={() => onNavigate?.(icon)} />)}
      </>}
    </div>
    {collapseIcon && <button type="button" className="wa-sidebar__collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}
      onClick={() => changeState(collapsed ? 'default' : 'collapsed')}><Icon name="unfold_more" size={20} /></button>}
  </nav>;
});
