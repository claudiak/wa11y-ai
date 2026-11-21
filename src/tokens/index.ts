import { colours } from './colours.js';
import { typography } from './typography.js';
import { spacing } from './spacing.js';
import { sizing } from './sizing.js';
import { radii } from './radii.js';
import { configuration } from './configuration.js';
import { collections as definitions } from './collections.js';
import { styles as styleDefinitions } from './styles.js';
import { freeze } from '../utils.js';

export const collections = freeze(definitions);
export const styles = freeze(styleDefinitions);
export const tokens: typeof colours & typeof typography & typeof spacing & typeof sizing & typeof radii & typeof configuration =
  freeze({ ...colours, ...typography, ...spacing, ...sizing, ...radii, ...configuration });

export type TokenKey = keyof typeof tokens;
export type StyleKey = keyof typeof styles;
export type CollectionName = typeof collections[number]['name'];
export type ModeSelection = { [C in typeof collections[number] as C['name']]?: C['modes'][number] };
export type Colour = Readonly<{ r: number; g: number; b: number; a: number }>;
type Values<K extends TokenKey> = (typeof tokens)[K]['valuesByMode'][keyof (typeof tokens)[K]['valuesByMode']];
type Resolved<V> = V extends { readonly $ref: infer K extends TokenKey } ? Resolved<Values<K>> :
  V extends string ? string : V extends number ? number : V extends boolean ? boolean : V extends Colour ? Colour : never;
export type TokenValueMap = { [K in TokenKey]: Resolved<Values<K>> };
export type StyleVarKey = {
  [K in StyleKey]: (typeof styles)[K]['type'] extends 'text' ? `${K}/${Exclude<keyof (typeof styles)[K], 'type'> & string}` :
  (typeof styles)[K]['type'] extends 'effect' ? K : (typeof styles)[K] extends { type: 'paint'; status: 'available' } ? K : never
}[StyleKey];
