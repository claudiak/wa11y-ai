import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { open, readFile, stat } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Node', 'MutationObserver']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import('react');
const { render, cleanup, within } = await import('@testing-library/react');
const { default: userEvent } = await import('@testing-library/user-event');
const { Button, tokens, styleVars } = await import('wa11y-ai');
const { buttonAssets } = await import('../dist/components/button-assets.js');
const { buttonStatuses, buttonIconPair } = await import('../dist/components/button-variants.js');
const h = React.createElement;
afterEach(() => cleanup());

test('pill icon-only buttons stay circular at both sizes and render a single icon', async () => {
  const style = document.createElement('style');
  style.textContent = await readFile(new URL('../styles/button.css', import.meta.url), 'utf8');
  document.head.append(style);
  try {
    for (const size of ['default', 'small']) {
      const view = render(h(Button, { size, pill: true, variant: 'icon-only', trailingIcon: true, 'aria-label': 'Add' }));
      const button = view.getByRole('button', { name: 'Add' });
      assert(button.classList.contains('wa-button--pill'));
      const computed = window.getComputedStyle(button);
      assert.equal(computed.inlineSize, size === 'small' ? '36px' : '40px');
      assert.equal(computed.inlineSize, computed.blockSize);
      assert.equal(button.querySelectorAll('.wa-icon').length, 1);
      cleanup();
    }
  } finally { style.remove(); }
});

test('Small and Link support every status, including icon-only links and keyboard focus', async () => {
  const user = userEvent.setup({ document });
  for (const status of buttonStatuses) {
    let clicks = 0;
    const view = render(h(Button, { status, size: 'small', variant: 'link', onClick: () => clicks++ }, 'Link'));
    const button = view.getByRole('button', { name: 'Link' });
    assert(button.classList.contains('wa-button--small'));
    assert.equal(button.querySelector('.wa-icon').style.fontSize, '20px');
    await user.tab(); assert.equal(document.activeElement, button);
    await user.keyboard(' '); assert.equal(clicks, 1);
    cleanup();
    const iconView = render(h(Button, { status, size: 'small', variant: 'icon-only', appearance: 'link', 'aria-label': 'Add' }));
    assert(iconView.getByRole('button', { name: 'Add' }).classList.contains('wa-button--link'));
    cleanup();
  }
});

test('Button renders a named native button and defaults to type=button', () => {
  const view = render(h(Button, { 'aria-describedby': 'help', className: 'custom' }, 'Save'));
  const button = view.getByRole('button', { name: 'Save' });
  assert.equal(button.tagName, 'BUTTON');
  assert.equal(button.type, 'button');
  assert.equal(button.getAttribute('aria-describedby'), 'help');
  assert(button.classList.contains('custom'));
  assert(button.classList.contains('wa-button--user-profile'));
});

test('native Enter, Space, and pointer activation work without custom keyboard handlers', async () => {
  let clicks = 0;
  const user = userEvent.setup({ document });
  const view = render(h(Button, { onClick: () => clicks++ }, 'Activate'));
  const button = view.getByRole('button', { name: 'Activate' });
  await user.tab(); assert.equal(document.activeElement, button);
  await user.keyboard('{Enter}'); assert.equal(clicks, 1);
  await user.keyboard(' '); assert.equal(clicks, 2);
  await user.click(button); assert.equal(clicks, 3);
});

test('disabled buttons cannot activate and are skipped in tab order', async () => {
  let clicks = 0;
  const user = userEvent.setup({ document });
  const view = render(h('div', null, h(Button, { disabled: true, onClick: () => clicks++ }, 'Unavailable'), h(Button, null, 'Next')));
  const disabled = view.getByRole('button', { name: 'Unavailable' });
  assert.equal(disabled.disabled, true);
  await user.click(disabled); await user.tab();
  assert.equal(document.activeElement, view.getByRole('button', { name: 'Next' }));
  assert.equal(clicks, 0);
});

test('refs and explicit submit behavior work inside native forms', async () => {
  let submitted = 0;
  const ref = React.createRef(); const user = userEvent.setup({ document });
  const view = render(h('form', { onSubmit: e => { e.preventDefault(); submitted++; } },
    h(Button, { ref }, 'Ordinary'), h(Button, { type: 'submit' }, 'Submit')));
  assert.equal(ref.current, view.getByRole('button', { name: 'Ordinary' }));
  await user.click(ref.current); assert.equal(submitted, 0);
  await user.click(view.getByRole('button', { name: 'Submit' })); assert.equal(submitted, 1);
});

test('icon-only buttons require an accessible name and decorative images retain 24px geometry', () => {
  assert.throws(() => render(h(Button, { variant: 'icon-only' })), /requires a nonempty/);
  const view = render(h(Button, { variant: 'icon-only', 'aria-label': 'Add item' }));
  const button = view.getByRole('button', { name: 'Add item' });
  assert.equal(within(button).queryByRole('img'), null);
  const icon = button.querySelector('.wa-icon');
  assert.equal(icon.textContent, 'add');
  assert.equal(icon.style.fontSize, '24px');
  assert.equal(icon.getAttribute('aria-hidden'), 'true');
});

test('the component supports all retrieved statuses/types, custom icons, and the Action link appearance', () => {
  for (const status of buttonStatuses) for (const variant of ['primary', 'secondary', 'icon-only']) {
    const props = { status, variant, ...(variant === 'icon-only' ? { 'aria-label': 'Add' } : {}) };
    const view = render(h(Button, props, variant === 'icon-only' ? undefined : 'Label'));
    assert(view.getByRole('button').classList.contains(`wa-button--${status}`)); cleanup();
  }
  const view = render(h(Button, { variant: 'link', leadingIcon: h('span', null, 'Custom'), trailingIcon: true }, 'Continue'));
  assert(view.getByRole('button', { name: 'Continue' }).classList.contains('wa-button--action'));
  assert.equal(view.getByText('Custom').closest('[aria-hidden]').getAttribute('aria-hidden'), 'true');
  cleanup();
  assert(render(h(Button, { variant: 'link', status: 'warning' }, 'Warning')).getByRole('button', { name: 'Warning' }));
});

test('font icons render without private filesystem asset paths', () => {
  const view = render(h(Button, { assetBaseUrl: '/design-system/button', trailingIcon: true }, 'Label'));
  assert.equal(view.container.querySelectorAll('img').length, 0);
  assert.doesNotMatch(view.container.innerHTML, /file:\/\//);
  assert.equal(view.container.querySelectorAll('.wa-icon').length, 2);
});

test('legacy SVG assets remain nonempty with their original root geometry', async () => {
  const used = new Set();
  for (const status of buttonStatuses) for (const variant of ['primary', 'secondary', 'icon-only']) for (const state of ['default', 'hover', 'focus', 'disabled']) {
    for (const file of buttonIconPair(status, variant, state)) used.add(file);
  }
  for (const file of buttonIconPair('action', 'link', 'default')) used.add(file);
  assert.deepEqual([...used].sort(), Object.keys(buttonAssets).sort());
  for (const href of Object.values(buttonAssets)) {
    const url = new URL(href); assert.equal(url.protocol, 'file:'); assert((await stat(url)).size > 0);
    const file = await open(url); const buffer = Buffer.alloc(256); await file.read(buffer, 0, 256, 0); await file.close();
    const root = buffer.toString().match(/<svg\b[^>]*>/)?.[0];
    assert.match(root, /width="24"/); assert.match(root, /height="24"/); assert.match(root, /viewBox="0 0 24 24"/);
  }
});

test('component CSS references only existing source tokens and supplied style properties', async () => {
  const css = await readFile(new URL('../styles/button.css', import.meta.url), 'utf8');
  const names = new Set(Object.values(tokens).map(t => t.cssName));
  for (const value of Object.values(styleVars)) names.add(value.slice(4, -1));
  for (const [, name] of css.matchAll(/var\((--wa11y-[a-z0-9-]+)/g)) assert(names.has(name), name);
  assert.doesNotMatch(css, /figma\.com\/api\/mcp\/asset/);
  assert.match(css, /:focus-visible/); assert.match(css, /forced-colors: active/);
});
