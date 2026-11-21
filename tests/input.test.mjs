import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Node', 'MutationObserver']) Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, createRef } = await import('react');
const { render, cleanup, fireEvent, act } = await import('@testing-library/react');
const { default: userEvent } = await import('@testing-library/user-event');
const { Input } = await import('../dist/components/Input.js');
afterEach(cleanup);

test('MainMenuItem supports native link focus, Enter activation, and optional icons', async () => {
  const { MainMenuItem } = await import('../dist/index.js');
  const user = userEvent.setup({ document });
  let activated = 0;
  const ref = createRef();
  const view = render(h(MainMenuItem, { href: '/home', state: 'active', trailingIcon: true, ref,
    onClick: event => { event.preventDefault(); activated++; } }));
  const link = view.getByRole('link', { name: 'Home' });
  assert.equal(ref.current, link);
  assert.equal(link.getAttribute('href'), '/home');
  assert.equal(link.getAttribute('aria-current'), 'page');
  assert.equal(link.querySelectorAll('[aria-hidden="true"]').length, 2);
  await user.tab();
  assert.equal(document.activeElement, link);
  await user.keyboard('{Enter}');
  assert.equal(activated, 1);
  view.rerender(h(MainMenuItem, { href: '/reports', label: 'Reports', leadingIcon: false }));
  assert.equal(view.getByRole('link', { name: 'Reports' }).getAttribute('aria-current'), null);
  assert.equal(view.container.querySelector('.wa-icon'), null);
});

test('Mobile navigation names every destination and supports keyboard and controlled selection', async () => {
  const { MenuFloatMobile } = await import('../dist/index.js');
  const user = userEvent.setup({ document });
  const selected = [];
  const view = render(h(MenuFloatMobile, { onNavigate: value => selected.push(value) }));
  assert.equal(view.getAllByRole('button').length, 5);
  assert.equal(view.getByRole('button', { name: 'Home' }).getAttribute('aria-current'), 'page');
  await user.tab();
  await user.tab();
  assert.equal(document.activeElement, view.getByRole('button', { name: 'Records' }));
  await user.keyboard('{Enter}');
  assert.equal(document.activeElement.getAttribute('aria-current'), 'page');
  await user.tab();
  await user.keyboard(' ');
  assert.deepEqual(selected, ['records', 'reports']);
  view.rerender(h(MenuFloatMobile, { state: 'dashboard', onNavigate: value => selected.push(value) }));
  await user.click(view.getByRole('button', { name: 'More' }));
  assert.equal(view.getByRole('button', { name: 'Dashboard' }).getAttribute('aria-current'), 'page');
  assert.equal(view.getByRole('button', { name: 'More' }).getAttribute('aria-current'), null);
  assert.equal(selected.at(-1), 'more');
});

test('Badge dismissal works by keyboard and disabled badges prevent dismissal', async () => {
  const { Badge } = await import('../dist/components/Badge.js');
  let dismissed = 0;
  const user = userEvent.setup({ document });
  const view = render(h(Badge, { label: 'Filter', leadingIcon: true, onDismiss: () => dismissed++ }));
  const close = view.getByRole('button', { name: 'Remove Filter' });
  await user.tab(); assert.equal(document.activeElement, close);
  await user.keyboard(' '); assert.equal(dismissed, 1);
  view.rerender(h(Badge, { label: 'Filter', status: 'disabled', onDismiss: () => dismissed++ }));
  assert(view.getByRole('button').disabled);
  await user.click(view.getByRole('button')); assert.equal(dismissed, 1);
  view.rerender(h(Badge, { label: 'Static', status: 'success', size: 'small', state: 'focus' }));
  assert.equal(view.queryByRole('button'), null);
  assert(view.getByText('Static').closest('.wa-badge').classList.contains('wa-badge--small'));
});

test('Switch Large/Small support keyboard focus, Space toggling, and disabled behavior', async () => {
  const { Switch } = await import('../dist/components/Switch.js');
  const user = userEvent.setup({ document });
  for (const size of ['large', 'small']) {
    const view = render(h(Switch, { size, 'aria-label': 'Notifications', defaultOn: false }));
    const control = view.getByRole('switch', { name: 'Notifications' });
    assert.equal(view.container.querySelector('svg').getAttribute('viewBox'), '0 0 36 20');
    assert.equal(view.container.querySelector('.wa-switch__thumb').getAttribute('cx'), '10');
    assert.equal(view.container.querySelector('.wa-switch__track').tagName, 'path');
    await user.tab(); assert.equal(document.activeElement, control);
    await user.keyboard(' '); assert.equal(control.checked, true);
    await user.keyboard(' '); assert.equal(control.checked, false);
    view.rerender(h(Switch, { size, 'aria-label': 'Notifications', disabled: true }));
    await user.click(control); assert.equal(control.checked, false); assert(control.disabled);
    cleanup();
  }
});

test('RadioButton supports group arrow keys, skips disabled options, and preserves single selection', async () => {
  const { RadioButton } = await import('../dist/components/RadioButton.js');
  // JSDOM lacks CSS.escape, which user-event uses to find named radio groups.
  dom.window.CSS ??= {};
  dom.window.CSS.escape ??= value => String(value).replace(/[^a-zA-Z0-9_-]/g, char => `\\${char}`);
  const user = userEvent.setup({ document });
  const view = render(h('fieldset', null,
    h(RadioButton, { name: 'choice', label: 'First', defaultChecked: true }),
    h(RadioButton, { name: 'choice', label: 'Disabled', status: 'disabled' }),
    h(RadioButton, { name: 'choice', label: 'Last', status: 'error' })));
  const first = view.getByRole('radio', { name: 'First' }), last = view.getByRole('radio', { name: 'Last' });
  await user.tab(); assert.equal(document.activeElement, first);
  await user.keyboard('{ArrowRight}');
  assert.equal(document.activeElement, last); assert(last.checked); assert(!first.checked);
  assert.equal(last.getAttribute('aria-invalid'), 'true');
  await user.keyboard(' '); assert(last.checked);
});

test('Checkbox supports keyboard focus, Space toggling, and label clicks', async () => {
  const { Checkbox } = await import('../dist/components/Checkbox.js');
  const user = userEvent.setup({ document });
  const view = render(h(Checkbox, { label: 'Accept terms' }));
  const checkbox = view.getByRole('checkbox', { name: 'Accept terms' });
  await user.tab(); assert.equal(document.activeElement, checkbox);
  await user.keyboard(' '); assert.equal(checkbox.checked, true);
  await user.click(view.getByText('Accept terms')); assert.equal(checkbox.checked, false);
});

test('Checkbox preserves all six variants and disabled controls cannot toggle', async () => {
  const { Checkbox } = await import('../dist/components/Checkbox.js');
  const user = userEvent.setup({ document });
  for (const status of ['unselected', 'selected', 'success', 'success-selected', 'disabled', 'disabled-selected']) {
    const view = render(h(Checkbox, { status, label: 'Label', hasLabel: false }));
    const checkbox = view.getByRole('checkbox', { name: 'Label' });
    const selected = status === 'selected' || status.endsWith('-selected');
    assert.equal(checkbox.checked, selected);
    assert.equal(checkbox.disabled, status.startsWith('disabled'));
    if (checkbox.disabled) { await user.click(checkbox); assert.equal(checkbox.checked, selected); }
    cleanup();
  }
});

test('Dropdown reuses the field layout and supports focus, selection, and disabled behavior', async () => {
  const { Dropdown } = await import('../dist/components/Dropdown.js');
  const user = userEvent.setup({ document });
  let selected;
  const view = render(h(Dropdown, { label: 'Country', defaultValue: 'ca', onChange: e => { selected = e.target.value; } },
    h('option', { value: 'ca' }, 'Canada'), h('option', { value: 'br' }, 'Brazil')));
  const select = view.getByRole('combobox', { name: 'Country' });
  await user.tab(); assert.equal(document.activeElement, select);
  await user.selectOptions(select, 'br'); assert.equal(selected, 'br');
  assert.equal(view.container.querySelectorAll('img').length, 0);
  assert(view.container.querySelector('.wa-dropdown__chevron'));
  view.rerender(h(Dropdown, { label: 'Country', disabled: true }, h('option', null, 'Canada')));
  assert(view.getByRole('combobox').disabled);
});

test('Input has a label, accepts keyboard focus/typing, and forwards its ref', async () => {
  const ref = createRef(), user = userEvent.setup({ document });
  const view = render(h(Input, { ref, label: 'Email', showLabel: false, name: 'email', required: true }));
  const input = view.getByRole('textbox', { name: 'Email' });
  assert.equal(ref.current, input); assert(input.required);
  await user.tab(); assert.equal(document.activeElement, input);
  await user.type(input, 'hello'); assert.equal(input.value, 'hello');
});

test('error/helper/hint descriptions are linked and shared Material icons have the expected sizes', () => {
  const view = render(h(Input, { label: 'Email', status: 'error', helper: true, helperText: 'Invalid email', hasTip: true, tipText: 'Use your work email', trailingIcon: true }));
  const input = view.getByRole('textbox', { name: 'Email' });
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  for (const id of input.getAttribute('aria-describedby').split(' ')) assert(document.getElementById(id));
  assert.deepEqual([...view.container.querySelectorAll('.wa-icon')].map(i => [i.textContent, i.style.fontSize]), [['help', '16px'], ['search', '20px'], ['calendar_today', '20px']]);
});

test('all six statuses render; Filled uses supplied data and Disabled prevents keyboard editing', async () => {
  for (const status of ['default', 'filled', 'selected', 'focus', 'error', 'disabled']) {
    const view = render(h(Input, { label: 'Value', status, defaultValue: status === 'filled' ? 'Saved value' : undefined }));
    const input = view.getByRole('textbox', { name: 'Value' });
    assert.equal(input.disabled, status === 'disabled');
    if (status === 'filled') assert.equal(input.value, 'Saved value');
    if (status === 'disabled') { await userEvent.setup({ document }).type(input, 'ignored'); assert.equal(input.value, ''); }
    cleanup();
  }
});


test('Icon defaults to decorative, inherits colour, and supports accessible labels, fill and size', async () => {
  const { Icon } = await import('../dist/components/Icon.js');
  const view = render(h(Icon, { name: 'search' }));
  const icon = view.container.firstChild;
  assert.equal(icon.getAttribute('aria-hidden'), 'true');
  assert.equal(icon.style.color, 'inherit');
  assert.equal(icon.textContent, 'search');
  view.rerender(h(Icon, { name: 'favorite', size: 20, colour: 'red', fill: true, label: 'Favorite' }));
  const named = view.getByRole('img', { name: 'Favorite' });
  assert.equal(named.getAttribute('aria-hidden'), 'false');
  assert.equal(named.style.fontSize, '20px');
  assert.equal(named.style.color, 'red');
  assert.match(named.style.fontVariationSettings, /["']FILL["'] 1/);
});

test('Alert supports keyboard dismissal, optional content, and disabled behavior', async () => {
  const { Alert } = await import('../dist/components/Alert.js');
  const user = userEvent.setup({ document });
  let dismissed = 0;
  const view = render(h(Alert, { type: 'success', title: 'Saved', hasDescription: true, description: 'Changes saved', onDismiss: () => dismissed++ }));
  assert(view.getByRole('status').textContent.includes('Changes saved'));
  await user.tab();
  assert.equal(document.activeElement, view.getByRole('button', { name: 'Dismiss alert' }));
  await user.keyboard('{Enter}'); assert.equal(dismissed, 1);
  view.rerender(h(Alert, { type: 'disabled', onDismiss: () => dismissed++ }));
  assert(view.getByRole('button').disabled);
  await user.click(view.getByRole('button')); assert.equal(dismissed, 1);
  view.rerender(h(Alert, { title: 'Static', hasTitle: false, hasIcon: false, hasDescription: true, description: 'Details', role: 'alert' }));
  assert(view.getByRole('alert'));
  assert.equal(view.queryByText('Static'), null);
  assert.equal(view.queryByRole('button'), null);
  assert.equal(view.container.querySelector('.wa-icon'), null);
});

test('Avatar exposes names, handles failed photos, and groups preserve sizes/counts', async () => {
  const { Avatar } = await import('../dist/components/Avatar.js');
  const { AvatarGroup } = await import('../dist/components/AvatarGroup.js');
  const view = render(h(Avatar, { src: '/photo.png', alt: 'Anne', size: 24 }));
  assert(view.getByRole('img', { name: 'Anne' }).classList.contains('wa-avatar--24'));
  fireEvent.error(view.container.querySelector('img'));
  assert.match(view.container.querySelector('img').src, /3f2c9.png$/);
  view.rerender(h(Avatar, { variant: 'initials', initials: 'CK', alt: 'Claudia', size: 16 }));
  assert.equal(view.getByRole('img', { name: 'Claudia' }).textContent, 'CK');
  view.rerender(h(AvatarGroup, { size: 32, avatars: [{ src: '/a.png', alt: 'Anne' }, { src: '/g.png', alt: 'Gilmar' }], additionalCount: 22 }));
  assert.equal(view.getAllByRole('listitem').length, 2);
  assert.equal(view.container.querySelectorAll('.wa-avatar--32').length, 2);
  assert(view.getByText('22 more people'));
  assert.equal(view.getByText('+22').getAttribute('aria-hidden'), 'true');
  assert.equal(view.container.querySelector('[tabindex],button,a'), null);
  view.rerender(h(AvatarGroup, { avatars: [], hasNumber: false, additionalCount: 22 }));
  assert.equal(view.queryByText('+22'), null);
});

test('AvatarListing supports keyboard activation, hidden details, and disabled behavior', async () => {
  const { AvatarListing } = await import('../dist/components/AvatarListing.js');
  const user = userEvent.setup({ document });
  let clicks = 0;
  const ref = createRef();
  const view = render(h(AvatarListing, { ref, title: 'Claudia', description: 'Designer', onClick: () => clicks++ }));
  const button = view.getByRole('button', { name: 'Claudia Designer' });
  assert.equal(ref.current, button); assert.equal(button.type, 'button');
  await user.tab(); assert.equal(document.activeElement, button);
  await user.keyboard('{Enter} '); assert.equal(clicks, 2);
  view.rerender(h(AvatarListing, { title: 'Claudia', description: 'Designer', size: 16, hasDragDrop: true, disabled: true, onClick: () => clicks++ }));
  assert.equal(view.queryByText('Designer'), null);
  assert.equal(view.container.querySelector('.wa-icon').textContent, 'drag_indicator');
  await user.click(view.getByRole('button')); assert.equal(clicks, 2);
  view.rerender(h(AvatarListing, { title: 'Claudia', hasDetails: false }));
  assert(view.getByRole('button', { name: 'Claudia' }));
});

test('Card composes accessible progress, keyboard actions, and custom slot content', async () => {
  const { Card } = await import('../dist/components/Card.js');
  const user = userEvent.setup({ document });
  let skipped = 0, started = 0;
  const view = render(h(Card, { heading: 'Memory', progress: 50, onSkip: () => skipped++, onStart: () => started++ }));
  assert(view.getByRole('article', { name: 'Memory' }));
  assert.equal(view.getByRole('progressbar', { name: 'Resume from step 3' }).value, 50);
  await user.tab(); assert.equal(document.activeElement, view.getByRole('button', { name: 'Skip' }));
  await user.keyboard('{Enter}'); assert.equal(skipped, 1);
  await user.tab(); await user.keyboard(' '); assert.equal(started, 1);
  view.rerender(h(Card, { type: 'simple', metaRow: false, actions: false, title: false }));
  assert.equal(view.queryByRole('progressbar'), null); assert.equal(view.queryByRole('button'), null);
  assert.equal(view.queryByRole('heading'), null);
  view.rerender(h(Card, { type: 'slot' }, h('p', null, 'Custom content')));
  assert(view.getByText('Custom content')); assert.equal(view.queryByRole('button'), null);
});

test('ProgressBar exposes named numeric progress and clamps invalid values', async () => {
  const { ProgressBar } = await import('../dist/components/ProgressBar.js');
  const ref = createRef();
  const view = render(h(ProgressBar, { ref, percentual: '25', label: 'Course completion' }));
  assert(ref.current.classList.contains('wa-progress'));
  assert.equal(view.getByRole('progressbar', { name: 'Course completion' }).value, 25);
  assert(view.getByText('25%'));
  for (const [value, expected] of [[50, 50], [100, 100], [120, 100], [-1, 0], [NaN, 0]]) {
    view.rerender(h(ProgressBar, { value, percentual: '25', 'aria-label': 'Upload' }));
    assert.equal(view.getByRole('progressbar', { name: 'Upload' }).value, expected);
    assert(view.getByText(`${expected}%`));
  }
  assert.equal(view.container.querySelector('[tabindex]'), null);
});

test('CardHorizontal provides separate keyboard actions and optional slot content', async () => {
  const { CardHorizontal } = await import('../dist/components/CardHorizontal.js');
  const user = userEvent.setup({ document });
  let joined = 0, dismissed = 0;
  const view = render(h(CardHorizontal, { title: 'Blue Lake', onAction: () => joined++, onDismiss: () => dismissed++ }));
  assert(view.getByRole('article', { name: 'Blue Lake' }));
  assert.equal(view.container.querySelector('button button'), null);
  await user.tab(); assert.equal(document.activeElement, view.getByRole('button', { name: 'Join' }));
  await user.keyboard('{Enter}'); assert.equal(joined, 1);
  await user.tab(); await user.keyboard(' '); assert.equal(dismissed, 1);
  view.rerender(h(CardHorizontal, { type: 'avatar', disabled: true, onAction: () => joined++, onDismiss: () => dismissed++ }));
  assert(view.getByRole('button', { name: 'Follow' }).disabled);
  assert(view.getByRole('button', { name: /Dismiss/ }).disabled);
  view.rerender(h(CardHorizontal, { type: 'slot' }, h('p', null, 'Custom content')));
  assert(view.getByText('Custom content')); assert.equal(view.queryByRole('button'), null);
});

test('DataHeader and DataGridCell preserve table semantics and keyboard controls', async () => {
  const { DataHeader } = await import('../dist/components/DataHeader.js');
  const { DataGridCell } = await import('../dist/components/DataGridCell.js');
  const user = userEvent.setup({ document });
  let checked, sorts = 0, edits = 0;
  const ref = createRef();
  const table = direction => h('table', null,
    h('thead', null, h('tr', null,
      h(DataHeader, { layout: 'selection', selection: { indeterminate: direction === 'none', onChange: e => { checked = e.target.checked; } } }),
      h(DataHeader, { headerContent: 'Name', sorting: true, weight: 'semibold', sortDirection: direction, onSort: () => sorts++ }))),
    h('tbody', null, h('tr', null,
      h(DataGridCell, { type: 'multi-select', selection: { label: 'Select Claudia' } }),
      h(DataGridCell, { type: 'buttons', ref, onEdit: () => edits++ }))));
  const view = render(table('none'));
  const selectAll = view.getByRole('checkbox', { name: 'Select all rows' });
  assert.equal(selectAll.indeterminate, true);
  await user.tab(); assert.equal(document.activeElement, selectAll);
  await user.keyboard(' '); assert.equal(checked, true);
  await user.tab(); assert.equal(document.activeElement, view.getByRole('button', { name: 'Name' }));
  await user.keyboard('{Enter}'); assert.equal(sorts, 1);
  view.rerender(table('ascending'));
  assert.equal(view.getByRole('columnheader', { name: 'Name' }).getAttribute('aria-sort'), 'ascending');
  assert.equal(view.getByRole('checkbox', { name: 'Select all rows' }).indeterminate, false);
  assert.equal(ref.current.tagName, 'TD');
  await user.tab(); await user.keyboard(' ');
  assert(view.getByRole('checkbox', { name: 'Select Claudia' }).checked);
  await user.tab(); await user.tab();
  assert.equal(document.activeElement, view.getByRole('button', { name: 'Edit' }));
  await user.keyboard(' '); assert.equal(edits, 1);
});

test('Sidebar disclosures support keyboard, selection, Escape and outside dismissal', async () => {
  const { SidebarMenuItemDropdown } = await import('../dist/components/Sidebar.js');
  const user = userEvent.setup({ document });
  let selected;
  const view = render(h(SidebarMenuItemDropdown, { collapsed: true, defaultOpen: true, onSelectItem: value => { selected = value; } }));
  const trigger = view.getByRole('button', { name: 'Record' });
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert(document.getElementById(trigger.getAttribute('aria-controls')));
  assert.equal(view.container.querySelector('button button'), null);
  await user.tab(); assert.equal(document.activeElement, trigger);
  await user.keyboard('{Escape}'); assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, trigger); assert.equal(view.queryByText('Business'), null);
  await user.keyboard('{Enter}'); await user.tab();
  assert.equal(document.activeElement, view.getByRole('button', { name: 'Business' }));
  await user.keyboard(' '); assert.equal(selected, 'business');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false'); assert.equal(document.activeElement, trigger);
  await user.keyboard(' '); assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  fireEvent.pointerDown(document.body); assert.equal(trigger.getAttribute('aria-expanded'), 'false');
});

test('Sidebar desktop collapses and preserves accessible icon-only navigation', async () => {
  const { SidebarMenuDesktop } = await import('../dist/components/Sidebar.js');
  const user = userEvent.setup({ document });
  let destination;
  const view = render(h(SidebarMenuDesktop, { onNavigate: value => { destination = value; } }));
  const nav = view.getByRole('navigation', { name: 'Sidebar navigation' });
  assert(nav); assert(view.getByRole('button', { name: 'Business' }));
  await user.click(view.getByRole('button', { name: 'Collapse sidebar' }));
  assert(nav.classList.contains('wa-sidebar--collapsed'));
  assert.equal(view.queryByText('Business'), null);
  assert(view.getByRole('button', { name: 'Expand sidebar' }));
  await user.click(view.getByRole('button', { name: 'Analytics' })); assert.equal(destination, 'analytics');
  await user.click(view.getByRole('button', { name: 'Record' })); assert(view.getByRole('button', { name: 'School' }));
  await user.click(view.getByRole('button', { name: 'School' })); assert.equal(destination, 'school');
  assert.equal(view.queryByText('Business'), null);
  await user.click(view.getByRole('button', { name: 'Expand sidebar' })); assert(!nav.classList.contains('wa-sidebar--collapsed'));
});

test('Breadcrumbs group provides native keyboard links and one noninteractive current page', async () => {
  const { BreadcrumbsGroup } = await import('../dist/components/Breadcrumbs.js');
  const user = userEvent.setup({ document });
  let followed = 0;
  const items = [{ label: 'Home', href: '/', onClick: e => { e.preventDefault(); followed++; } }, { label: 'Projects', href: '/projects' }, { label: 'Current' }];
  const view = render(h(BreadcrumbsGroup, { items }));
  assert(view.getByRole('navigation', { name: 'Breadcrumb' }));
  assert.equal(view.getAllByRole('listitem').length, 3);
  assert.equal(view.getAllByRole('link').length, 2);
  assert.equal(view.container.querySelectorAll('[aria-current="page"]').length, 1);
  assert.equal(view.getByText('Current').tagName, 'SPAN');
  assert(view.getByText('Current').getAttribute('tabindex') === null);
  assert(view.container.querySelector('.wa-icon').getAttribute('aria-hidden') === 'true');
  await user.tab(); assert.equal(document.activeElement, view.getByRole('link', { name: 'Home' }));
  await user.keyboard('{Enter}'); assert.equal(followed, 1);
  await user.tab(); assert.equal(document.activeElement, view.getByRole('link', { name: 'Projects' }));
  view.rerender(h(BreadcrumbsGroup, { items, hasLevel1: false, hasLevel2: false }));
  assert.equal(view.queryByRole('link'), null); assert(view.getByText('Current'));
});

test('SkipContent group moves keyboard focus to actual destinations and preserves native links', async () => {
  const { SkipContentGroup, SkipContent } = await import('../dist/components/SkipContent.js');
  const user = userEvent.setup({ document });
  const view = render(h('div', null,
    h(SkipContentGroup, { targets: { content: '#skip-main', menu: '#skip-menu', search: '#skip-search', footer: '#skip-footer' } }),
    h('main', { id: 'skip-main' }, 'Main'), h('nav', { id: 'skip-menu' }, 'Menu'),
    h('input', { id: 'skip-search', 'aria-label': 'Search destination' }), h('footer', { id: 'skip-footer' }, 'Footer')));
  assert(view.getByRole('navigation', { name: 'Skip links' }));
  assert.equal(view.getAllByRole('link').length, 4);
  const link = view.getByRole('link', { name: 'Go to Content' });
  assert.equal(link.getAttribute('href'), '#skip-main');
  await user.tab(); assert.equal(document.activeElement, link);
  await user.keyboard('{Enter}'); assert.equal(document.activeElement, document.getElementById('skip-main'));
  assert.equal(document.activeElement.getAttribute('tabindex'), '-1');
  await user.click(view.getByRole('link', { name: 'Go to Search' }));
  assert.equal(document.activeElement, document.getElementById('skip-search'));
  assert.equal(document.getElementById('skip-main').hasAttribute('tabindex'), false);
  assert.equal(document.getElementById('skip-search').hasAttribute('tabindex'), false);
  view.rerender(h(SkipContent, { href: '#skip-main', onClick: e => e.preventDefault() }));
  await user.click(view.getByRole('link')); assert.equal(document.activeElement, view.getByRole('link'));
});

test('Tooltip connects descriptions, dismisses with Escape, and remains hoverable', async () => {
  const { Tooltip } = await import('../dist/components/Tooltip.js');
  const user = userEvent.setup({ document });
  for (const position of ['bottom', 'top', 'left', 'right']) {
    const view = render(h(Tooltip, { position, title: 'Help', body: 'Details' }, h('button', { 'aria-describedby': 'existing-description' }, 'Trigger')));
    const trigger = view.getByRole('button', { name: 'Trigger' });
    assert.equal(view.queryByRole('tooltip'), null);
    await user.tab();
    const tooltip = view.getByRole('tooltip');
    assert(tooltip.classList.contains(`wa-tooltip--${position}`));
    assert.equal(trigger.getAttribute('aria-describedby'), `existing-description ${tooltip.id}`);
    assert.equal(tooltip.querySelectorAll('img[width="8"][height="8"]').length, 2);
    await user.keyboard('{Escape}');
    assert.equal(view.queryByRole('tooltip'), null); assert.equal(document.activeElement, trigger);
    assert.equal(trigger.getAttribute('aria-describedby'), 'existing-description');
    view.unmount();
  }
  const view = render(h(Tooltip, { hasBody: false }, h('button', null, 'Hover')));
  const trigger = view.getByRole('button');
  await user.hover(trigger); assert(view.getByRole('tooltip'));
  await user.hover(view.getByRole('tooltip')); assert(view.getByRole('tooltip'));
  assert.equal(view.queryByText('Body Text'), null);
  await user.unhover(view.getByRole('tooltip'));
  await act(() => new Promise(resolve => setTimeout(resolve, 175)));
  assert.equal(view.queryByRole('tooltip'), null);
});

test('Avatar accepts explicit accessible names and empty Tooltip stays absent', async () => {
  const { Avatar } = await import('../dist/components/Avatar.js');
  const { Tooltip } = await import('../dist/components/Tooltip.js');
  const user = userEvent.setup({ document });
  const view = render(h(Avatar, { 'aria-label': 'Account picture' }));
  assert(view.getByRole('img', { name: 'Account picture' }));
  view.rerender(h(Tooltip, { hasTitle: false, hasBody: false }, h('button', null, 'Empty tooltip')));
  await user.tab(); assert.equal(view.queryByRole('tooltip'), null);
  assert.equal(view.getByRole('button').getAttribute('aria-describedby'), null);
});
