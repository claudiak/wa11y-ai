import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const findings = [], reflow = [], interactions = [];
const categories = process.argv.includes('--components-only') ? ['components'] : ['colours', 'typography', 'dimensions', 'radii', 'effects', 'accessibility', 'components'];
try {
  await page.goto((process.env.PLAYGROUND_URL ?? 'http://127.0.0.1:4173/playground/') + (process.argv.includes('--accessibility-only') ? '#accessibility' : ''));
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  if (process.argv.includes('--profiles-only')) {
    await page.locator('#tooltip-heading').waitFor();
    const observed = [];
    for (const mode of ['Public', 'Logged In', 'Admin', 'Neutral']) {
      await page.selectOption('#profile', { label: mode });
      await page.locator('#tooltip-heading').waitFor();
      const colours = await page.evaluate(() => {
        const colour = name => {
          const probe = document.createElement('span'); probe.style.background = `var(${name})`; document.body.append(probe);
          const value = getComputedStyle(probe).backgroundColor; probe.remove(); return value;
        };
        return {
          primary: colour('--wa11y-user-profiles-primary-default'), hover: colour('--wa11y-user-profiles-primary-hover'),
          sidebar: getComputedStyle(document.querySelector('.wa-sidebar-title')).backgroundColor,
          mobile: getComputedStyle(document.querySelector('.wa-menu-float__item[aria-current]')).backgroundColor,
          switch: getComputedStyle(document.querySelector('.wa-switch[data-state="default"][data-on="true"] .wa-switch__track')).fill,
        };
      });
      assert.equal(colours.sidebar, colours.hover); assert.equal(colours.mobile, colours.hover); assert.equal(colours.switch, colours.primary);
      observed.push(colours.primary);
      const switched = page.locator('.wa-switch[data-state="default"] .wa-switch__control').first();
      await switched.focus(); const previous = await switched.isChecked(); await page.keyboard.press('Space'); assert.equal(await switched.isChecked(), !previous);
      const audit = await page.evaluate(async () => (await window.axe.run(document.querySelector('.wa-switch'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] } })).violations.map(v => v.id));
      assert.deepEqual(audit, []);
    }
    assert.equal(new Set(observed).size, 4);
    console.log('Profile checks passed in all four modes: sidebar, floating menu, switch colours, switch keyboard activation and targeted axe.');
    await browser.close(); process.exit(0);
  }
  if (process.argv.includes('--accessibility-only')) {
    await page.getByRole('heading', { name: 'Accessible by design. Inclusive by practice.' }).waitFor();
    for (const mode of ['Public', 'Logged In', 'Admin', 'Neutral']) {
      await page.selectOption('#profile', { label: mode });
      const audit = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
        return { violations: result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), incomplete: result.incomplete.map(v => v.id) };
      });
      console.log(JSON.stringify({ mode, ...audit }));
      assert.equal(audit.violations.length, 0, `Accessibility guidance violations in ${mode}`);
    }
    const colours = page.getByRole('button', { name: 'Colours', exact: true });
    await colours.focus(); await page.keyboard.press('Enter');
    assert(!(await page.locator('#search').isDisabled()));
    const category = page.getByRole('button', { name: 'Accessibility', exact: true });
    await category.focus(); await page.keyboard.press('Space');
    await page.waitForURL(url => url.hash === '#accessibility');
    assert(page.url().endsWith('#accessibility'));
    assert(!(await page.locator('#search').isVisible()));
    assert(await page.locator('#profile').isVisible());
    for (const name of ['accessibility checks', 'known limitations', 'Explore wa11y.io']) {
      await page.keyboard.press('Tab');
      const link = page.getByRole('link', { name, exact: true });
      assert(await link.evaluate(element => document.activeElement === element), `Keyboard order: ${name}`);
      assert.equal(await link.evaluate(element => getComputedStyle(element).outlineWidth), '3px');
    }
    await page.getByRole('link', { name: 'Explore wa11y.io' }).evaluate(element => element.addEventListener('click', event => { event.preventDefault(); element.dataset.activated = 'true'; }, { once: true }));
    await page.keyboard.press('Enter');
    assert.equal(await page.getByRole('link', { name: 'Explore wa11y.io' }).getAttribute('data-activated'), 'true');
    for (const width of [320, 640, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Reflow at ${width}px`);
    }
    await page.addStyleTag({ content: '.accessibility-view * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } .accessibility-view p { margin-bottom: 2em !important; }' });
    await page.setViewportSize({ width: 320, height: 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Text-spacing override reflow');
    console.log('Accessibility guidance passed: axe in four profiles, keyboard switching/order/focus/activation, 320–1440px reflow, and text-spacing overrides.');
    await browser.close(); process.exit(0);
  }
  for (const category of [...categories, 'Logged In', 'Admin', 'Neutral']) {
    const mode = ['Logged In', 'Admin', 'Neutral'].includes(category);
    if (mode) await page.selectOption('#profile', { label: category });
    else {
    await page.locator(`[data-category="${category}"]`).click();
    if (category === 'components') await page.locator('#tooltip-heading').waitFor();
    }
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(async () => {
      const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
      return { violations: result.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, html: n.html.slice(0, 180), summary: n.failureSummary })) })), incomplete: result.incomplete.map(v => ({ id: v.id, count: v.nodes.length, targets: v.id === 'color-contrast' ? [] : v.nodes.slice(0, 4).map(n => ({ target: n.target, summary: n.failureSummary })) })) };
    });
    findings.push({ category, ...result });
  }
  for (const width of [1280, 768, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    reflow.push(await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, overflowing: [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && !el.closest('.data-table-scroll, .categories') && getComputedStyle(el).position !== 'absolute'; }).slice(0, 12).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0, 45) })) })));
  }
  await page.selectOption('#profile', { label: 'Public' });
  await page.setViewportSize({ width: 320, height: 1000 });
  for (const position of ['bottom', 'top', 'left', 'right']) {
    const trigger = page.getByRole('button', { name: `${position} arrow`, exact: true });
    await trigger.focus(); await page.getByRole('tooltip').waitFor();
    interactions.push({ tooltip: position, ...await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth })) });
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Remove Claudia', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.id === 'restore-badge');
  await page.getByRole('button', { name: 'Restore badge', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Remove Claudia');
  await page.getByRole('button', { name: 'Dismiss info default alert', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.id === 'restore-alerts');
  await page.getByRole('button', { name: 'Dismiss Community XYZ Blue Lake', exact: true }).first().click();
  await page.waitForFunction(() => document.activeElement?.id === 'restore-cards');
  await page.getByRole('button', { name: 'Edit row 1', exact: true }).click();
  await page.getByRole('textbox', { name: 'Name for row 1', exact: true }).fill('Edited name');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Edit row 1');
  await page.getByRole('button', { name: 'Delete row 1', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.id === 'restore-table');
  const relationships = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
    return { duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i), missingReferences: [...document.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls]')].flatMap(el => ['aria-labelledby', 'aria-describedby', 'aria-controls'].flatMap(attr => (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean).filter(id => !document.getElementById(id)).map(id => ({ attr, id })))) };
  });
  assert.deepEqual(relationships, { duplicateIds: [], missingReferences: [] });
  console.log('Browser focus checks passed for badge/alert/card dismissal, table save/delete, and ARIA ID relationships.');
  const report = process.argv.includes('--verbose') ? findings : findings.map(f => ({ category: f.category, violations: f.violations.map(v => ({ id: v.id, count: v.nodes.length, examples: v.nodes.slice(0, 2).map(n => n.summary) })), incomplete: f.incomplete }));
  console.log(JSON.stringify({ findings: report, reflow, interactions, relationships }, null, 2));
  if (findings.some(f => f.violations.length) || [...reflow, ...interactions].some(r => r.documentWidth > r.width)) process.exitCode = 1;
} finally { await browser.close(); }
