import { collections, tokens, styles, cssVars, styleVars, getTokenValue } from '../dist/index.js';
import { mountHeaderNavigation } from './components.tsx';

mountHeaderNavigation(document.querySelector('#header-navigation'));

const grid = document.querySelector('#grid'), search = document.querySelector('#search');
const profile = document.querySelector('#profile'), filter = document.querySelector('#collection');
let category = 'colours';
let unmountComponent = null;
let renderVersion = 0;
for (const c of collections) { const option = document.createElement('option'); option.value = c.name; option.textContent = c.name; filter.append(option); }
const categories = {
  colours: ['Colours', 'Exact palette values, with semantic references preserved.'],
  typography: ['Typography', 'Font variables and text styles. Missing line heights remain unspecified.'],
  dimensions: ['Spacing & size', 'Original pixel dimensions for rhythm, icons, and avatars.'],
  radii: ['Corner radius', 'The original corner-radius scale, including the 999px full radius.'],
  effects: ['Effects', 'Four elevation styles, with every shadow layer preserved.'],
  configuration: ['Configuration', 'String and boolean values for programmatic use.'],
  components: ['Components', 'Reusable React components built with the shared tokens.'],
};
if (Object.hasOwn(categories, location.hash.slice(1))) category = location.hash.slice(1);
function node(tag, className, text) { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; }
function display(value) {
  if (value && typeof value === 'object') return `color(srgb ${value.r} ${value.g} ${value.b} / ${value.a})`;
  return String(value);
}
function copyButton(reference) {
  const button = node('button', 'copy', 'Copy CSS'); button.type = 'button';
  button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(reference); document.querySelector('#copy-status').textContent = `Copied ${reference}`; }
    catch { document.querySelector('#copy-status').textContent = `Copy unavailable. Reference: ${reference}`; }
  });
  return button;
}
function card(key, sample, value, reference, css) {
  const article = node('article', 'card'); article.dataset.key = key;
  if (sample) { const wrap = node('div', 'sample-wrap'); sample.setAttribute('aria-hidden', 'true'); wrap.append(sample); article.append(wrap); }
  const body = node('div', 'body'), slash = key.indexOf('/');
  body.append(node('p', 'collection-label', key.slice(0, slash)), node('h3', '', key.slice(slash + 1)), node('p', 'value', value), node('p', 'reference', reference));
  if (css) body.append(copyButton(css));
  article.append(body); return article;
}
function render() {
  const version = ++renderVersion;
  unmountComponent?.(); unmountComponent = null;
  grid.replaceChildren();
  document.querySelector('#results-title').textContent = categories[category][0];
  document.querySelector('#description').textContent = categories[category][1];
  const modes = { 'User Profiles': profile.value }, query = search.value.trim().toLowerCase();
  if (category === 'components') {
    const container = node('div', 'component-preview'); grid.append(container);
    document.querySelector('#result-count').textContent = 'Input · Dropdown · Checkbox · Radio · Switch · Badge · Alert · Avatar · Avatar Group · Avatar Listing · Card · Card Horizontal · Progress Bar · Data Header · DataGrid Cell · Sidebar · Breadcrumbs · Skip Content · Tooltip · Button';
    import('./components.tsx').then(module => {
      if (version === renderVersion) unmountComponent = module.mountButtonPlayground(container);
    }).catch(() => { if (version === renderVersion) container.append(node('p', 'empty', 'Build the component preview with npm run playground.')); });
    return;
  }
  for (const [key, token] of Object.entries(tokens)) {
    const collection = key.split('/')[0];
    const matches = category === 'colours' ? token.type === 'COLOR' : category === 'typography' ? collection === 'Typography' : category === 'dimensions' ? ['Spacing', 'Size'].includes(collection) : category === 'radii' ? collection === 'Radius' : category === 'configuration' ? collection === 'Components' : false;
    const definition = collections.find(c => c.name === collection), mode = modes[collection] ?? definition.defaultMode;
    const raw = token.valuesByMode[mode], alias = raw && typeof raw === 'object' && '$ref' in raw ? raw.$ref : '';
    if (!matches || filter.value && filter.value !== collection || !`${key} ${alias}`.toLowerCase().includes(query)) continue;
    const value = getTokenValue(key, modes); let sample = null;
    if (token.type === 'COLOR') { sample = node('div', 'sample'); sample.style.backgroundColor = cssVars[key]; }
    else if (category === 'dimensions') { sample = node('div', 'sample dimension-sample'); const bar = node('div', 'dimension-bar'); bar.style.width = cssVars[key]; sample.append(bar); }
    else if (category === 'radii') { sample = node('div', 'sample dimension-sample'); const shape = node('div', 'radius-shape'); shape.style.borderRadius = cssVars[key]; sample.append(shape); }
    grid.append(card(key, sample, display(value) + (token.unit === 'px' ? 'px' : ''), alias ? `References ${alias}` : `Literal · ${mode}`, cssVars[key]));
  }
  if (!filter.value) for (const [key, style] of Object.entries(styles)) {
    if (category === 'colours' && style.type === 'paint' && style.status === 'available' && key.toLowerCase().includes(query)) {
      const sample = node('div', 'sample'); sample.style.backgroundImage = styleVars[key];
      const description = style.value ?? `${style.angle}deg · ${style.stops.map(stop => `${stop.colour.$ref ?? stop.colour} ${stop.position}%`).join(' → ')}`;
      grid.append(card(key, sample, description, 'Linear gradient', styleVars[key]));
    }
    if (category === 'typography' && style.type === 'text' && key.toLowerCase().includes(query)) {
      const sample = node('div', 'sample type-sample', 'Aa · A shared language');
      for (const property of Object.keys(style)) if (property !== 'type') sample.style[property] = styleVars[`${key}/${property}`];
      const line = 'lineHeight' in style ? `Line height ${style.lineHeight}` : 'Line height not supplied';
      grid.append(card(key, sample, `${style.fontFamily} · ${style.fontSize} · ${style.fontWeight}`, line, styleVars[`${key}/fontSize`]));
    }
    if (category === 'effects' && style.type === 'effect' && key.toLowerCase().includes(query)) {
      const sample = node('div', 'sample effect-sample'), shape = node('div', 'effect-shape'); shape.style.boxShadow = styleVars[key]; sample.append(shape);
      grid.append(card(key, sample, style.boxShadow, 'Original multi-layer shadow', styleVars[key]));
    }
  }
  const count = grid.children.length;
  document.querySelector('#result-count').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  if (!count) grid.append(node('p', 'empty', 'No matching tokens or styles. Try another search or collection.'));
}
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.category;
  history.replaceState(null, '', `#${category}`);
  document.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  // Collections filter variables; styles have their own namespace.
  if (['effects', 'components'].includes(category)) filter.value = '';
  render();
}));
search.addEventListener('input', render); filter.addEventListener('change', render);
profile.addEventListener('change', () => {
  document.documentElement.setAttribute('data-wa11y-user-profiles-mode', profile.value.toLowerCase().replaceAll(' ', '-'));
  render();
});
document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
render();
