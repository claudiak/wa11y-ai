import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';
import { within, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { buildPlayground } from '../scripts/build-playground.mjs';

const output = await buildPlayground();
const html = await readFile(new URL('../playground/index.html', import.meta.url), 'utf8');
const entry = './.generated/playground.js';
const bundle = await readFile(new URL('../playground/' + entry, import.meta.url), 'utf8');
const openWindows = [];

function openPlayground(hash = '') {
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(html, {
    url: `http://localhost:4173/playground/${hash}`, runScripts: 'outside-only',
    pretendToBeVisual: true, virtualConsole,
  });
  openWindows.push(dom.window);
  // The build is self-contained ESM. JSDOM does not execute module script tags;
  // substitute the browser-provided module URL and execute the actual built entry.
  dom.window.eval(bundle.replaceAll('import.meta.url', JSON.stringify(`http://localhost:4173/playground/${entry}`)));
  return { window: dom.window, document: dom.window.document, errors, user: userEvent.setup({ document: dom.window.document }) };
}
afterEach(() => { for (const window of openWindows.splice(0)) window.close(); });

test('HTML loads the self-contained browser bundle with no unresolved external imports', () => {
  assert.match(html, /<script type="module" src="\.\/\.generated\/playground\.js"><\/script>/);
  for (const [name, file] of Object.entries(output.metafile.outputs)) {
    if (name.endsWith('.js')) assert.deepEqual(file.imports, []);
    else for (const dependency of file.imports) {
      assert.equal(dependency.kind, 'url-token');
      assert(Object.hasOwn(output.metafile.outputs, dependency.path), 'Font assets must be emitted locally');
    }
  }
  const { document, errors } = openPlayground();
  assert.equal(document.querySelectorAll('#grid .card').length, 80);
  assert.deepEqual(errors, []);
});

test('all token tabs update the selected button, heading, URL, and content', async () => {
  const { document, window, user, errors } = openPlayground();
  const tabs = within(document.querySelector('.categories'));
  for (const [name, category, count] of [
    ['Typography', 'typography', 33], ['Spacing & size', 'dimensions', 24],
    ['Corner radius', 'radii', 6], ['Effects', 'effects', 4],
    ['Configuration', 'configuration', 7], ['Colours', 'colours', 80],
  ]) {
    const button = tabs.getByRole('button', { name, exact: true });
    await user.click(button);
    assert.equal(button.getAttribute('aria-pressed'), 'true');
    assert.equal(document.querySelectorAll('[data-category][aria-pressed="true"]').length, 1);
    assert.equal(document.querySelector('#results-title').textContent, name);
    assert.equal(document.querySelectorAll('#grid .card').length, count);
    assert.equal(window.location.hash, `#${category}`);
  }
  assert.deepEqual(errors, []);
});

test('Components mounts the React preview, activates a Button, and unmounts when changing tabs', async () => {
  const { document, user, errors } = openPlayground();
  const tabs = within(document.querySelector('.categories'));
  await user.click(tabs.getByRole('button', { name: 'Components', exact: true }));
  await waitFor(() => assert(document.querySelector('.button-playground')), { container: document.body });
  const target = within(document.querySelector('.button-preview-target')).getByRole('button', { name: 'Label' });
  await user.click(target);
  await waitFor(() => assert.match(document.querySelector('.button-preview-area [role="status"]').textContent, /Activated 1 time/), { container: document.body });
  await user.click(tabs.getByRole('button', { name: 'Corner radius', exact: true }));
  assert.equal(document.querySelector('.button-playground'), null);
  assert.equal(document.querySelectorAll('#grid .card').length, 6);
  assert.deepEqual(errors, []);
});

test('direct component links load, and filtering/profile changes still work after tab switches', async () => {
  const { document, user, errors } = openPlayground('#components');
  await waitFor(() => assert(document.querySelector('.button-playground')), { container: document.body });
  const tabs = within(document.querySelector('.categories'));
  await user.click(tabs.getByRole('button', { name: 'Colours', exact: true }));
  await user.selectOptions(document.querySelector('#collection'), 'User Profiles');
  assert.equal(document.querySelectorAll('#grid .card').length, 10);
  await user.type(document.querySelector('#search'), 'Primary/Default');
  assert.equal(document.querySelectorAll('#grid .card').length, 1);
  await user.selectOptions(document.querySelector('#profile'), 'Admin');
  assert.equal(document.documentElement.getAttribute('data-wa11y-user-profiles-mode'), 'admin');
  assert.match(document.querySelector('#grid .reference').textContent, /Admin \(Olive Green\)/);
  assert.deepEqual(errors, []);
});
