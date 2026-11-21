import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { collections, tokens, styles, cssVars, styleVars, getTokenValue, tokenVar } from 'wa11y-ai';
import { generateCss, validate, cssString } from '../scripts/token-build.mjs';
import * as naming from '../dist/utils.js';

const baseline = JSON.parse(await readFile(new URL('./fidelity.json', import.meta.url)));
const data = { collections, tokens, styles };
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  return value !== null && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])])) : value;
}
const hash = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');

test('preserves every migrated token value, semantic alias, mode, and style property', () => {
  assert.equal(hash(collections), baseline.collections);
  assert.equal(hash(tokens), baseline.variables);
  assert.equal(hash(styles), baseline.styles);
  assert.equal(Object.keys(tokens).length, baseline.counts.variables);
  assert.equal(Object.values(tokens).flatMap(t => Object.values(t.valuesByMode)).filter(v => v?.$ref).length, baseline.counts.aliases);
});

test('preserves resolved values for every token in every independent mode combination', () => {
  const { combinations } = validate(data);
  const resolved = combinations.map(modes => ({ modes, values: Object.fromEntries(Object.keys(tokens).map(key => [key, getTokenValue(key, modes)])) }));
  assert.equal(combinations.length, 4);
  assert.equal(hash(resolved), baseline.resolvedModes);
});

test('preserves all original CSS selectors and declaration values', async () => {
  const css = await readFile(new URL('../styles/tokens.css', import.meta.url), 'utf8');
  assert.equal(css, generateCss(data, naming));
  const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim(),
    declarations: Object.fromEntries(body.trim().split(';').filter(x => x.trim()).map(s => { const i = s.indexOf(':'); return [s.slice(0, i).trim(), s.slice(i + 1).trim()]; })),
  }));
  assert.equal(hash(blocks), baseline.css);
});

test('public helpers return CSS references and correctly typed raw data', () => {
  assert.equal(getTokenValue('Spacing/Spacing/16'), 16);
  assert.equal(getTokenValue('Components/Alert/showAlert'), true);
  assert.equal(getTokenValue('Components/Dropdown/Value 1'), 'Brazil');
  assert.equal(tokenVar('Primitives/Text/Primary'), 'var(--wa11y-primitives-text-primary)');
  assert.equal(cssVars['Radius/Radius/Full'], 'var(--wa11y-radius-radius-full)');
  assert.equal(styleVars['text/Body/letterSpacing'], 'var(--wa11y-style-text-body-letter-spacing)');
  assert.equal(styleVars['effect/Elevation 1'], 'var(--wa11y-style-effect-elevation-1)');
});

test('both profile defaults match across all modes and use palette references', () => {
  for (const mode of ['Public', 'Logged In', 'Admin', 'Neutral']) {
    const modes = { 'User Profiles': mode };
    assert.deepEqual(getTokenValue('User Profiles/Primary/Default', modes), getTokenValue('User Profiles/Border/Default', modes));
    assert('$ref' in tokens['User Profiles/Primary/Default'].valuesByMode[mode]);
  }
  assert.deepEqual(getTokenValue('User Profiles/Border/Default', { 'User Profiles': 'Neutral' }), getTokenValue('Primitives/Neutral/Light Grey'));
});

test('missing paint and line-height data remains absent', () => {
  const paints = Object.entries(styles).filter(([, s]) => s.type === 'paint' && s.status === 'unavailable');
  assert.equal(paints.length, 2);
  for (const [key, style] of paints) { assert.equal(style.status, 'unavailable'); assert.equal(styleVars[key], undefined); }
  assert.equal(Object.values(styles).filter(s => s.type === 'text' && !('lineHeight' in s)).length, 16);
  assert.equal(styles['text/Label LG'].fontSize, '20px');
  assert.equal(getTokenValue('Typography/Font Size/Label LG'), 18);
});

test('runtime rejects unknown tokens, collections, and modes', () => {
  assert.throws(() => getTokenValue('no/such/token'), /Unknown token/);
  assert.throws(() => tokenVar('no/such/token'), /Unknown token/);
  assert.throws(() => getTokenValue('Primitives/Text/Primary', { Primitives: 'Dark' }), /Unknown mode/);
  assert.throws(() => getTokenValue('Spacing/Spacing/16', { Unknown: 'Value' }), /Unknown collection/);
});

test('definitions are immutable and returned colour objects are independent', () => {
  assert.throws(() => { tokens['Spacing/Spacing/16'].valuesByMode.Value = 99; }, TypeError);
  const colour = getTokenValue('Primitives/Neutral/Dark');
  const r = colour.r; colour.r = 0;
  assert.equal(getTokenValue('Primitives/Neutral/Dark').r, r);
});

test('generation rejects missing values, invalid colours, unknown units, and collisions', () => {
  let copy = structuredClone(data); delete copy.tokens['Spacing/Spacing/16'].valuesByMode.Value;
  assert.throws(() => validate(copy), /Missing\/unknown mode/);
  copy = structuredClone(data); copy.tokens['Primitives/Neutral/Dark'].valuesByMode.Value.r = 2;
  assert.throws(() => validate(copy), /Invalid COLOR/);
  copy = structuredClone(data); copy.tokens['Spacing/Spacing/16'].unit = 'unknown';
  assert.throws(() => validate(copy), /Unknown numeric unit/);
  copy = structuredClone(data); copy.tokens['Spacing/Spacing/16'].cssName = copy.tokens['Spacing/Spacing/8'].cssName;
  assert.throws(() => validate(copy), /duplicate CSS name/);
});

test('generation rejects missing aliases, type mismatch, and nondefault-mode cycles', () => {
  let copy = structuredClone(data); copy.tokens['Primitives/Text/Primary'].valuesByMode.Value = { $ref: 'Missing/Token' };
  assert.throws(() => validate(copy), /Unresolved alias/);
  copy = structuredClone(data); copy.tokens['Primitives/Text/Primary'].valuesByMode.Value = { $ref: 'Spacing/Spacing/16' };
  assert.throws(() => validate(copy), /type\/unit mismatch/);
  copy = structuredClone(data); copy.tokens['User Profiles/Primary/Default'].valuesByMode.Admin = { $ref: 'User Profiles/Primary/Default' };
  assert.throws(() => validate(copy), /Circular alias/);
});

test('future collection modes resolve independently across aliases', () => {
  const copy = structuredClone(data);
  const c = copy.collections.find(c => c.name === 'Primitives'); c.modes.push('Dark');
  for (const [key, token] of Object.entries(copy.tokens)) if (key.startsWith('Primitives/')) token.valuesByMode.Dark = structuredClone(token.valuesByMode.Value);
  copy.tokens['Primitives/Neutral/Dark'].valuesByMode.Dark = { r: 1, g: 1, b: 1, a: 1 };
  const { combinations, resolve } = validate(copy);
  const selected = combinations.find(m => m.Primitives === 'Dark' && m['User Profiles'] === 'Admin');
  assert.deepEqual(resolve('Primitives/Text/Primary', selected), { r: 1, g: 1, b: 1, a: 1 });
  assert.match(generateCss(copy, naming), /data-wa11y-primitives-mode="dark"/);
});

test('CSS strings are escaped and unsupported style properties are rejected', () => {
  assert.equal(cssString('a"\\\nb'), '"a\\"\\\\\\a b"');
  assert.throws(() => cssString('\0'), /NUL/);
  const copy = structuredClone(data); copy.styles['text/Body'].unsupported = 1;
  assert.throws(() => generateCss(copy, naming), /Unsupported text property/);
});

test('Gradient Scarlate preserves both confirmed brand aliases', () => {
  assert.equal(styles['paint/Gradient Scarlate'].angle, 90);
  assert.deepEqual(styles['paint/Gradient Scarlate'].stops, [
    { position: 0, colour: { $ref: 'Primitives/Brand/Red Scarlet' } },
    { position: 100, colour: { $ref: 'Primitives/Brand/Public (Old Rose)/Dark' } },
  ]);
  assert.equal(styleVars['paint/Gradient Scarlate'], 'var(--wa11y-style-paint-gradient-scarlate)');
  assert.match(generateCss(data, naming), /linear-gradient\(90deg, var\(--wa11y-primitives-brand-red-scarlet\) 0%, var\(--wa11y-primitives-brand-public-old-rose-dark\) 100%\)/);
});

test('Bg Card preserves both screenshot aliases and mode-dependent CSS references', () => {
  assert.deepEqual(styles['paint/Bg Card'].stops, [
    { position: 0, colour: { $ref: 'User Profiles/Primary/Dark' } },
    { position: 100, colour: { $ref: 'Primitives/Neutral/Black' } },
  ]);
  assert.equal(styleVars['paint/Bg Card'], 'var(--wa11y-style-paint-bg-card)');
  assert.match(generateCss(data, naming), /linear-gradient\(90deg, var\(--wa11y-user-profiles-primary-dark\) 0%, var\(--wa11y-primitives-neutral-black\) 100%\)/);
});

test('Gradient Leaf preserves its Golden lime alias and screenshot end colour', () => {
  const leaf = styles['paint/Gradient Leaf'];
  assert.equal(leaf.angle, 90);
  assert.deepEqual(leaf.stops, [{ position: 0, colour: { $ref: 'Primitives/Brand/Golden lime' } }, { position: 100, colour: '#66730B' }]);
  assert.equal(styleVars['paint/Gradient Leaf'], 'var(--wa11y-style-paint-gradient-leaf)');
  assert.match(generateCss(data, naming), /linear-gradient\(90deg, var\(--wa11y-primitives-brand-golden-lime\) 0%, #66730B 100%\)/);
  const copy = structuredClone(data); copy.styles['paint/Gradient Leaf'].stops[0].colour.$ref = 'Missing/Colour';
  assert.throws(() => generateCss(copy, naming), /Invalid gradient colour/);
});

test('Gradient Rose preserves the approved screenshot stops and CSS reference', () => {
  assert.equal(styles['paint/Gradient Rose'].value, 'linear-gradient(90deg, #FFEBEB 0%, #D7BAC0 100%)');
  assert.equal(styleVars['paint/Gradient Rose'], 'var(--wa11y-style-paint-gradient-rose)');
  assert(generateCss(data, naming).includes('--wa11y-style-paint-gradient-rose: linear-gradient(90deg, #FFEBEB 0%, #D7BAC0 100%);'));
  const copy = structuredClone(data); copy.styles['paint/Gradient Rose'].value = 'invalid';
  assert.throws(() => generateCss(copy, naming), /Unsupported paint data/);
});
