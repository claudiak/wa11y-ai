import type { ButtonAsset } from './button-assets.js';

export const buttonStatuses = ['user-profile', 'success', 'warning', 'destructive', 'action', 'neutral'] as const;
export type ButtonStatus = typeof buttonStatuses[number];
export type ButtonVariant = 'primary' | 'secondary' | 'icon-only' | 'link';
export type IconState = 'default' | 'hover' | 'focus' | 'disabled';
type Pair = readonly [ButtonAsset, ButtonAsset];

const primary: Record<ButtonStatus, Pair> = {
  'user-profile': ['4ab7d.svg', '3ef12.svg'], success: ['d2a9f.svg', 'd85f2.svg'],
  warning: ['d2a9f.svg', '4ec9e.svg'], destructive: ['4ab7d.svg', '15625.svg'],
  action: ['ab7f0.svg', '15625.svg'], neutral: ['ab7f0.svg', '15625.svg'],
};
const primaryHover: Record<ButtonStatus, Pair> = {
  'user-profile': ['857a5.svg', '2ba50.svg'], success: ['f4bd6.svg', '84456.svg'],
  warning: ['d2a9f.svg', '4ec9e.svg'], destructive: ['6609f.svg', '5bce1.svg'],
  action: ['0c4e3.svg', 'adf61.svg'], neutral: ['d2a9f.svg', '6c3b1.svg'],
};
const secondary: Record<ButtonStatus, Pair> = {
  'user-profile': ['857a5.svg', 'd85f2.svg'], success: ['f4bd6.svg', '84456.svg'],
  warning: ['d2a9f.svg', '4ec9e.svg'], destructive: ['19e87.svg', '5bce1.svg'],
  action: ['9125c.svg', '707ac.svg'], neutral: ['6fb57.svg', '707ac.svg'],
};

/** Unretrieved hover variants retain their verified default appearance. */
export function buttonIconPair(status: ButtonStatus, variant: ButtonVariant, state: IconState): Pair {
  if (state === 'disabled') return ['cd72b.svg', 'ffd5a.svg'];
  if (variant === 'link') return ['9125c.svg', '4656c.svg'];
  if (variant === 'secondary') return state === 'hover' && status === 'success' ? ['f4bd6.svg', 'cb0d8.svg'] : secondary[status];
  if (variant === 'primary' && state === 'hover') return primaryHover[status];
  return primary[status];
}
