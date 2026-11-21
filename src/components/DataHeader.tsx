import { forwardRef, type ThHTMLAttributes } from 'react';
import { Checkbox, type CheckboxProps } from './Checkbox.js';
import { Icon } from './Icon.js';

export type DataHeaderProps = ThHTMLAttributes<HTMLTableCellElement> & {
  headerContent?: string;
  layout?: 'content' | 'selection';
  weight?: 'regular' | 'semibold';
  sorting?: boolean;
  sortDirection?: 'none' | 'ascending' | 'descending';
  onSort?: () => void;
  selection?: CheckboxProps & { indeterminate?: boolean };
};

export const DataHeader = forwardRef<HTMLTableCellElement, DataHeaderProps>(function DataHeader({
  headerContent = 'Header', layout = 'content', weight = 'regular', sorting = false,
  sortDirection = 'none', onSort, selection, children, className, scope = 'col', ...props
}, ref) {
  const { indeterminate, ...checkbox } = selection ?? {};
  return <th {...props} ref={ref} scope={scope} aria-sort={sorting ? sortDirection : props['aria-sort']}
    className={['wa-data-header', `wa-data-header--${layout}`, `wa-data-header--${weight}`, className].filter(Boolean).join(' ')}>
    {layout === 'selection' ? <Checkbox label="Select all rows" hasLabel={false} {...checkbox}
      ref={node => { if (node) node.indeterminate = !!indeterminate; }} /> :
      children ?? (sorting ? <button type="button" className="wa-data-header__sort" onClick={onSort}>
        {headerContent}<Icon name={sortDirection === 'ascending' ? 'arrow_upward' : sortDirection === 'descending' ? 'arrow_downward' : 'swap_vert'} size={20} />
      </button> : <span className="wa-data-header__content">{headerContent}</span>)}
  </th>;
});
