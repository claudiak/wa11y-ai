import { getTokenValue, tokenVar, styleVars, type ModeSelection, type Colour } from 'wa11y-ai';

const spacing: number = getTokenValue('Spacing/Spacing/16');
const show: boolean = getTokenValue('Components/Alert/showAlert');
const country: string = getTokenValue('Components/Dropdown/Value 1');
const colour: Readonly<{ r: number; g: number; b: number; a: number }> = getTokenValue('Primitives/Text/Primary');
const modes: ModeSelection = { 'User Profiles': 'Logged In', Primitives: 'Value' };
const profile: string | Colour = getTokenValue('User Profiles/Primary/Hover', modes);
const profileDefault: Readonly<{ r: number; g: number; b: number; a: number }> = getTokenValue('User Profiles/Primary/Default', modes);
const borderDefault: Readonly<{ r: number; g: number; b: number; a: number }> = getTokenValue('User Profiles/Border/Default', modes);
const css: 'var(--wa11y-spacing-spacing-16)' = tokenVar('Spacing/Spacing/16');
const tracking: string = styleVars['text/Body/letterSpacing'];
// @ts-expect-error Invalid token paths must be rejected.
getTokenValue('Spacing/not-real');
// @ts-expect-error No Dark mode was exported.
getTokenValue('Primitives/Text/Primary', { Primitives: 'Dark' });
// @ts-expect-error Raw dimensions are numbers, not CSS strings.
const invalid: string = getTokenValue('Spacing/Spacing/16');
// @ts-expect-error Unresolved paints have no CSS references.
styleVars['paint/Gradient Croissant'];
void [spacing, show, country, colour, profile, profileDefault, borderDefault, css, tracking, invalid];

const rose: string = styleVars['paint/Gradient Rose'];
const cardBackground: string = styleVars['paint/Bg Card'];
void cardBackground;
