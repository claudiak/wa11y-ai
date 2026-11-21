import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon.js';

export type AlertType = 'info' | 'success' | 'warning' | 'destructive' | 'neutral' | 'disabled';
export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  type?: AlertType;
  state?: 'default' | 'focus';
  title?: ReactNode;
  description?: ReactNode;
  hasTitle?: boolean;
  hasDescription?: boolean;
  hasIcon?: boolean;
  hasClose?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
};

/** Static messages use status; choose role="alert" for urgent updates. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert({
  type = 'destructive', state = 'default', title = 'Alert message title',
  description = 'Alert message description', hasTitle = true, hasDescription = false,
  hasIcon = true, hasClose = true, onDismiss, dismissLabel = 'Dismiss alert',
  children, className, role = 'status', ...props
}, ref) {
  const disabled = type === 'disabled';
  return <div {...props} ref={ref} role={role} aria-disabled={disabled || props['aria-disabled']}
    className={['wa-alert', `wa-alert--${type}`, state === 'focus' && 'wa-alert--focus', className].filter(Boolean).join(' ')}>
    {hasIcon && <Icon className="wa-alert__icon" name={type === 'success' ? 'check' : type === 'info' ? 'error' : 'report_problem'} fill={type !== 'success'} size={24} />}
    <div className="wa-alert__content">
      {hasTitle && <div className="wa-alert__title">{title}</div>}
      {hasDescription && <div className="wa-alert__description">{description}</div>}
      {children}
    </div>
    {hasClose && onDismiss && <button type="button" className="wa-alert__dismiss" onClick={onDismiss} disabled={disabled} aria-label={dismissLabel}><Icon name="close" size={24} /></button>}
  </div>;
});
