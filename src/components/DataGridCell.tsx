import { forwardRef, type TdHTMLAttributes, type ReactNode } from 'react';
import { Avatar, type AvatarProps } from './Avatar.js';
import { AvatarListing } from './AvatarListing.js';
import { Badge, type BadgeProps } from './Badge.js';
import { Button } from './Button.js';
import { Checkbox, type CheckboxProps } from './Checkbox.js';
import { RadioButton, type RadioButtonProps } from './RadioButton.js';
import { Icon } from './Icon.js';

export type DataGridCellType = 'avatar-name' | 'text' | 'multi-select' | 'single-select' | 'slot' | 'buttons' | 'badge';
export type DataGridCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  type?: DataGridCellType;
  hasAvatar?: boolean;
  hasIcon?: boolean;
  hasMultiSelect?: boolean;
  hasSingleSelect?: boolean;
  text?: ReactNode;
  textSize?: 'default' | 'small';
  href?: string;
  avatar?: AvatarProps;
  name?: string;
  description?: string;
  onAvatarClick?: () => void;
  icon?: ReactNode;
  selection?: CheckboxProps;
  singleSelection?: RadioButtonProps;
  badgeProps?: BadgeProps;
  actionIcon?: string;
  actionLabel?: string;
  onAction?: () => void;
  onEdit?: () => void;
  editLabel?: string;
  downloadAriaLabel?: string;
  onDownload?: () => void;
  downloadLabel?: string;
  disabled?: boolean;
};

export const DataGridCell = forwardRef<HTMLTableCellElement, DataGridCellProps>(function DataGridCell({
  type = 'avatar-name', hasAvatar = true, hasIcon = true, hasMultiSelect = true,
  hasSingleSelect = true, text = 'Body text', textSize = 'default', href, avatar,
  name = 'Name Surname', description = 'Position / Description', onAvatarClick, icon,
  selection, singleSelection, badgeProps, actionIcon = 'add', actionLabel = 'Add',
  onAction, onEdit, editLabel = 'Edit', downloadAriaLabel, onDownload, downloadLabel = 'Download', disabled = false,
  children, className, ...props
}, ref) {
  const checkbox = <Checkbox label="Select row" hasLabel={false} disabled={disabled} {...selection} />;
  const radio = <RadioButton label="Choose row" hasLabel={false} disabled={disabled} {...singleSelection} />;
  return <td {...props} ref={ref} className={['wa-data-cell', `wa-data-cell--${type}`, `wa-data-cell--${textSize}`, className].filter(Boolean).join(' ')}>
    <div className="wa-data-cell__content">{children ?? <>
      {type === 'avatar-name' && <AvatarListing size={24} title={name} description={description} avatar={avatar} disabled={disabled} onClick={onAvatarClick} />}
      {type === 'multi-select' && hasMultiSelect && checkbox}
      {type === 'single-select' && hasSingleSelect && radio}
      {type === 'text' && <>
        {hasMultiSelect && checkbox}{hasSingleSelect && radio}
        {hasIcon && (icon ?? <Icon name="error" size={24} fill />)}
        {hasAvatar && <Avatar {...avatar} variant="image" size={24} alt="" />}
        {href ? <a className="wa-data-cell__text" href={href}>{text}</a> : <span className="wa-data-cell__text">{text}</span>}
      </>}
      {type === 'badge' && <Badge size="small" status="warning" {...badgeProps} />}
      {type === 'buttons' && <>
        <Button variant="icon-only" size="small" status="destructive" leadingIcon={<Icon name={actionIcon} size={20} />} aria-label={actionLabel} disabled={disabled} onClick={onAction} />
        <Button variant="icon-only" size="small" status="action" leadingIcon={<Icon name="edit" size={20} />} aria-label={editLabel} disabled={disabled} onClick={onEdit} />
        <Button variant="secondary" size="small" status="action" leadingIcon={<Icon name="download" size={20} />} aria-label={downloadAriaLabel} disabled={disabled} onClick={onDownload}>{downloadLabel}</Button>
      </>}
    </>}</div>
  </td>;
});
