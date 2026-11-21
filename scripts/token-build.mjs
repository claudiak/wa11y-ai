import assert from 'node:assert/strict';

export function cssString(value) {
  return '"' + [...value].map(char => {
    const code = char.codePointAt(0);
    assert(code !== 0, 'CSS cannot preserve NUL');
    if (code < 32 || code === 127) return `\\${code.toString(16)} `;
    return char === '"' || char === '\\' ? '\\' + char : char;
  }).join('') + '"';
}

function validValue(type, value) {
  if (type === 'COLOR') return typeof value === 'string' ? /^#[0-9a-f]{6}$/i.test(value) || /^rgba\((?:\d+(?:\.\d+)?, ){3}(?:0(?:\.\d+)?|1(?:\.0+)?)\)$/.test(value) && value.match(/[\d.]+/g).slice(0, 3).every(v => Number(v) <= 255) :
    value !== null && typeof value === 'object' && ['r', 'g', 'b', 'a'].every(k => Number.isFinite(value[k]) && value[k] >= 0 && value[k] <= 1);
  if (type === 'FLOAT') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'STRING') return typeof value === 'string';
  if (type === 'BOOLEAN') return typeof value === 'boolean';
  return false;
}

export function serialize(token, value, tokens) {
  if (value && typeof value === 'object' && '$ref' in value) {
    assert(Object.hasOwn(tokens, value.$ref), `Unresolved alias: ${value.$ref}`);
    return `var(${tokens[value.$ref].cssName})`;
  }
  if (token.type === 'COLOR') return typeof value === 'string' ? value : `color(srgb ${value.r} ${value.g} ${value.b} / ${value.a})`;
  if (token.type === 'STRING') return cssString(value);
  if (token.type === 'BOOLEAN') return String(value);
  return `${value}${token.unit === 'px' ? 'px' : ''}`;
}

export function validate({ collections, tokens }) {
  assert(collections.length > 0 && Object.keys(tokens).length > 0, 'Token source is empty');
  const names = new Set(), attributes = new Set(), cssNames = new Set();
  for (const c of collections) {
    assert(!names.has(c.name) && !attributes.has(c.cssAttribute), `Duplicate collection: ${c.name}`);
    names.add(c.name); attributes.add(c.cssAttribute);
    assert(c.modes.length > 0 && new Set(c.modes).size === c.modes.length && c.modes.includes(c.defaultMode), `Invalid modes: ${c.name}`);
    assert(/^data-wa11y-[a-z0-9-]+-mode$/.test(c.cssAttribute), `Invalid mode attribute: ${c.name}`);
  }
  for (const [key, token] of Object.entries(tokens)) {
    const c = collections.find(c => key.startsWith(c.name + '/'));
    assert(c, `Unknown collection: ${key}`);
    assert(/^--wa11y-[a-z0-9-]+$/.test(token.cssName) && !cssNames.has(token.cssName), `Invalid/duplicate CSS name: ${key}`);
    cssNames.add(token.cssName);
    assert(Object.keys(token.valuesByMode).length === c.modes.length && c.modes.every(m => Object.hasOwn(token.valuesByMode, m)), `Missing/unknown mode value: ${key}`);
    if (token.type === 'FLOAT') assert(['px', 'number'].includes(token.unit), `Unknown numeric unit: ${key}`);
    for (const value of Object.values(token.valuesByMode)) {
      if (value !== null && typeof value === 'object' && '$ref' in value) {
        const target = Object.hasOwn(tokens, value.$ref) ? tokens[value.$ref] : undefined;
        assert(target, `Unresolved alias: ${key} -> ${value.$ref}`);
        assert(target.type === token.type && target.unit === token.unit, `Alias type/unit mismatch: ${key}`);
      } else assert(validValue(token.type, value), `Invalid ${token.type} value: ${key}`);
    }
  }
  let combinations = [{}];
  for (const c of collections) {
    assert(combinations.length * c.modes.length <= 10000, 'Too many mode combinations');
    combinations = combinations.flatMap(s => c.modes.map(mode => ({ ...s, [c.name]: mode })));
  }
  const resolve = (key, modes, trail = new Set()) => {
    assert(!trail.has(key), `Circular alias: ${key}`);
    const c = collections.find(c => key.startsWith(c.name + '/'));
    const value = tokens[key].valuesByMode[modes[c.name]];
    return value && typeof value === 'object' && '$ref' in value ? resolve(value.$ref, modes, new Set([...trail, key])) : value;
  };
  for (const modes of combinations) for (const key of Object.keys(tokens)) resolve(key, modes);
  return { combinations, resolve };
}

export function generateCss(data, { kebab, stylePropertyName }) {
  validate(data);
  const { collections, tokens, styles } = data;
  const lines = ['/* Generated from src/tokens by scripts/build.mjs. Do not edit. */'];
  for (const c of collections) for (const mode of c.modes) {
    lines.push(`${mode === c.defaultMode ? ':root,\n' : ''}:root[${c.cssAttribute}="${kebab(mode)}"] {`);
    for (const [key, token] of Object.entries(tokens)) if (key.startsWith(c.name + '/')) lines.push(`  ${token.cssName}: ${serialize(token, token.valuesByMode[mode], tokens)};`);
    lines.push('}', '');
  }
  const declarations = [], used = new Set(Object.values(tokens).map(t => t.cssName));
  function add(name, value) { assert(!used.has(name), `CSS name collision: ${name}`); used.add(name); declarations.push(`  ${name}: ${value};`); }
  for (const [key, style] of Object.entries(styles)) {
    if (style.type === 'paint') {
      if (style.status === 'available') {
        if (Array.isArray(style.stops)) {
          assert(style.paintType === 'gradient_linear' && Number.isFinite(style.angle) && style.stops.length >= 2, `Unsupported paint data: ${key}`);
          const stops = style.stops.map(stop => {
            assert(Number.isFinite(stop.position) && stop.position >= 0 && stop.position <= 100, `Invalid gradient position: ${key}`);
            const colour = stop.colour;
            assert(typeof colour === 'string' ? validValue('COLOR', colour) : colour && typeof colour === 'object' && '$ref' in colour && Object.hasOwn(tokens, colour.$ref) && tokens[colour.$ref].type === 'COLOR', `Invalid gradient colour: ${key}`);
            return `${serialize({ type: 'COLOR' }, colour, tokens)} ${stop.position}%`;
          });
          add(stylePropertyName(key), `linear-gradient(${style.angle}deg, ${stops.join(', ')})`);
          continue;
        }
        assert(style.paintType === 'gradient_linear' && typeof style.value === 'string' && /^linear-gradient\(-?\d+(?:\.\d+)?deg, #[0-9a-f]{6}(?:[0-9a-f]{2})? \d+(?:\.\d+)?%(?:, #[0-9a-f]{6}(?:[0-9a-f]{2})? \d+(?:\.\d+)?%)+\)$/i.test(style.value), `Unsupported paint data: ${key}`);
        add(stylePropertyName(key), style.value);
      } else assert(style.status === 'unavailable' && !('value' in style), `Unsupported paint data: ${key}`);
      continue;
    }
    if (style.type === 'effect') {
      assert(/^(?:-?\d+(?:\.\d+)?px ){4}rgba\((?:\d+(?:\.\d+)?, ){3}(?:0(?:\.\d+)?|1(?:\.0+)?)\)(?:, (?:-?\d+(?:\.\d+)?px ){4}rgba\((?:\d+(?:\.\d+)?, ){3}(?:0(?:\.\d+)?|1(?:\.0+)?)\))*$/.test(style.boxShadow), `Unsupported shadow: ${key}`);
      add(stylePropertyName(key), style.boxShadow); continue;
    }
    assert(style.type === 'text', `Unknown style type: ${key}`);
    for (const [property, raw] of Object.entries(style)) {
      if (property === 'type') continue;
      let value = raw;
      if (property === 'fontFamily') { assert(typeof raw === 'string'); value = cssString(raw); }
      else if (property === 'fontSize') assert(/^\d+(?:\.\d+)?px$/.test(raw), `Invalid font size: ${key}`);
      else if (property === 'fontWeight') assert(/^\d+(?:\.\d+)?$/.test(raw) && Number(raw) >= 1 && Number(raw) <= 1000, `Invalid weight: ${key}`);
      else if (property === 'lineHeight') assert(typeof raw === 'number' && raw > 0 && Number.isFinite(raw), `Invalid line height: ${key}`);
      else if (property === 'letterSpacing') { assert(/^-?\d+(?:\.\d+)?%$/.test(raw), `Invalid tracking: ${key}`); value = `${Number(raw.slice(0, -1)) / 100}em`; }
      else assert.fail(`Unsupported text property: ${property}`);
      add(stylePropertyName(key, property), value);
    }
  }
  if (declarations.length) lines.push(':root {', ...declarations, '}', '');
  return lines.join('\n');
}
