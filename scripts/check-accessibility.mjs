import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const findings = [], reflow = [], interactions = [];
const categories = process.argv.includes('--components-only') ? ['components'] : ['colours', 'typography', 'dimensions', 'radii', 'effects', 'configuration', 'components'];
try {
  await page.goto(process.env.PLAYGROUND_URL ?? 'http://127.0.0.1:4173/playground/');
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
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
