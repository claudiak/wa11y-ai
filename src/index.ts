import { collections, styles, tokens, type ModeSelection, type TokenKey, type TokenValueMap, type StyleVarKey } from './tokens/index.js';
import { freeze, stylePropertyName } from './utils.js';
export { Button } from './components/Button.js';
export { Icon } from './components/Icon.js';
export { Badge } from './components/Badge.js';
export { Alert } from './components/Alert.js';
export { Avatar } from './components/Avatar.js';
export type { AvatarProps, AvatarSize } from './components/Avatar.js';
export { AvatarGroup } from './components/AvatarGroup.js';
export { AvatarListing } from './components/AvatarListing.js';
export { Card } from './components/Card.js';
export { CardHorizontal } from './components/CardHorizontal.js';
export { DataHeader } from './components/DataHeader.js';
export { Breadcrumbs, BreadcrumbsGroup } from './components/Breadcrumbs.js';
export { SkipContent, SkipContentGroup } from './components/SkipContent.js';
export { Tooltip } from './components/Tooltip.js';
export { MenuFloatMobile } from './components/MenuFloatMobile.js';
export { MainMenuItem } from './components/MainMenuItem.js';
export type { MainMenuItemProps, MainMenuItemState } from './components/MainMenuItem.js';
export type { MenuFloatMobileProps, MenuFloatMobileState } from './components/MenuFloatMobile.js';
export type { TooltipProps } from './components/Tooltip.js';
export type { SkipContentProps, SkipContentGroupProps, SkipContentType } from './components/SkipContent.js';
export type { BreadcrumbsProps, BreadcrumbsGroupProps, BreadcrumbItem } from './components/Breadcrumbs.js';
export { SidebarMenuDesktop, SidebarMenuTitle, SidebarMenuItem, SidebarSubmenuItem, SidebarMenuItemDropdown, SubmenuCollapsible } from './components/Sidebar.js';
export type { SidebarItemState, SidebarDesktopState, SidebarMenuDesktopProps, SidebarMenuTitleProps, SidebarMenuItemProps, SidebarSubmenuItemProps, SidebarMenuItemDropdownProps, SubmenuCollapsibleProps, SidebarSubmenuOption } from './components/Sidebar.js';
export type { DataHeaderProps } from './components/DataHeader.js';
export { DataGridCell } from './components/DataGridCell.js';
export type { DataGridCellProps, DataGridCellType } from './components/DataGridCell.js';
export type { CardHorizontalProps, CardHorizontalType } from './components/CardHorizontal.js';
export { ProgressBar } from './components/ProgressBar.js';
export type { ProgressBarProps } from './components/ProgressBar.js';
export type { CardProps, CardType } from './components/Card.js';
export type { AvatarListingProps } from './components/AvatarListing.js';
export type { AvatarGroupProps } from './components/AvatarGroup.js';
export type { AlertProps, AlertType } from './components/Alert.js';
export type { BadgeProps, BadgeStatus } from './components/Badge.js';
export type { IconProps } from './components/Icon.js';
export { Input } from './components/Input.js';
export { Dropdown } from './components/Dropdown.js';
export { Checkbox } from './components/Checkbox.js';
export { RadioButton } from './components/RadioButton.js';
export { Switch } from './components/Switch.js';
export type { SwitchProps, SwitchState } from './components/Switch.js';
export type { RadioButtonProps, RadioButtonStatus } from './components/RadioButton.js';
export type { CheckboxProps, CheckboxStatus } from './components/Checkbox.js';
export type { DropdownProps } from './components/Dropdown.js';
export type { InputProps, InputStatus } from './components/Input.js';
export type { ButtonProps, ButtonStatus, ButtonVariant } from './components/Button.js';

export { collections, styles, tokens };
export type { CollectionName, Colour, ModeSelection, TokenKey, TokenValueMap, StyleKey, StyleVarKey } from './tokens/index.js';

type RawValue = string | number | boolean | Readonly<{ r: number; g: number; b: number; a: number }>;
type Alias = { readonly $ref: string };
type Definition = { readonly valuesByMode: Readonly<Record<string, RawValue | Alias>> };
const definitions: Readonly<Record<string, Definition>> = tokens;

export const cssVars = freeze(Object.fromEntries(Object.entries(tokens).map(([key, token]) => [key, `var(${token.cssName})`])) as {
  readonly [K in TokenKey]: `var(${(typeof tokens)[K]['cssName']})`
});

export const styleVars = freeze(Object.fromEntries(Object.entries(styles).flatMap(([key, style]) =>
  style.type === 'text' ? Object.keys(style).filter(p => p !== 'type').map(p => [`${key}/${p}`, `var(${stylePropertyName(key, p)})`]) :
  style.type === 'effect' || style.type === 'paint' && style.status === 'available' ? [[key, `var(${stylePropertyName(key)})`]] : []
)) as Readonly<Record<StyleVarKey, string>>);

/** Resolve a value through semantic references and independent collection modes. */
export function getTokenValue<K extends TokenKey>(key: K, modes: ModeSelection = {}): TokenValueMap[K] {
  for (const [name, mode] of Object.entries(modes)) {
    const collection = collections.find(c => c.name === name);
    if (!collection) throw new Error(`Unknown collection: ${name}`);
    if (!(collection.modes as readonly string[]).includes(mode)) throw new Error(`Unknown mode ${mode} for ${name}`);
  }
  const visited = new Set<string>();
  function resolve(name: string): RawValue {
    const token = Object.hasOwn(definitions, name) ? definitions[name] : undefined;
    if (!token) throw new Error(`Unknown token: ${name}`);
    const collection = collections.find(c => c.name === name.split('/')[0]);
    if (!collection) throw new Error(`Unknown token collection: ${name}`);
    const mode = modes[collection.name] ?? collection.defaultMode;
    const node = `${name}@${mode}`;
    if (visited.has(node)) throw new Error(`Circular alias: ${node}`);
    visited.add(node);
    const value = token.valuesByMode[mode];
    if (value === undefined) throw new Error(`Missing value: ${name} / ${mode}`);
    if (typeof value === 'object' && '$ref' in value) return resolve(value.$ref);
    return typeof value === 'object' ? { ...value } : value;
  }
  return resolve(key) as TokenValueMap[K];
}

/** A typed CSS reference; use this for styling so modes continue to work. */
export function tokenVar<K extends TokenKey>(key: K): (typeof cssVars)[K] {
  if (!Object.hasOwn(cssVars, key)) throw new Error(`Unknown token: ${key}`);
  return cssVars[key];
}
