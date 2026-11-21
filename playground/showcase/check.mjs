import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.setDefaultTimeout(8000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:4173/playground/showcase/index.html');
  await page.getByRole('heading', { name: 'Business overview', exact: true }).waitFor();
  if (process.argv.includes('--mobile-nav-only')) {
    for (const width of [320, 390, 760]) {
      await page.setViewportSize({ width, height: 844 });
      const nav = page.getByRole('navigation', { name: 'Mobile workspace navigation' });
      assert(await nav.isVisible());
      assert(!(await page.locator('.app-sidebar').isVisible()));
      await nav.getByRole('button', { name: 'Accounts', exact: true }).click();
      await page.getByRole('heading', { name: 'Good relationships. Better growth.' }).waitFor();
      await nav.getByRole('button', { name: 'Settings', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('heading', { name: 'Make it your workspace.' }).waitFor();
      assert.equal(await nav.getByRole('button', { name: 'Settings' }).getAttribute('aria-current'), 'page');
      await page.getByRole('button', { name: 'Save preferences' }).scrollIntoViewIfNeeded();
      const save = await page.getByRole('button', { name: 'Save preferences' }).boundingBox();
      const floating = await page.locator('.mobile-floating-navigation').boundingBox();
      assert(save.y + save.height <= floating.y, 'The floating menu must not cover the final action');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No page overflow');
      await nav.getByRole('button', { name: 'Overview', exact: true }).click();
      await page.getByRole('heading', { name: 'Business overview', exact: true }).waitFor();
    }
    await page.setViewportSize({ width: 1440, height: 1100 });
    assert(await page.locator('.app-sidebar').isVisible());
    assert(!(await page.locator('.mobile-floating-navigation').isVisible()));
    console.log('Floating mobile navigation passed: three widths, routing, keyboard, no overlap/overflow, desktop sidebar retained.');
    await browser.close();
    process.exit(0);
  }
  if (process.argv.includes('--table-hover-only')) {
    const assertListHighlight = async selector => {
      const row = page.locator(selector).first();
      await row.locator('strong').last().hover();
      assert(await row.evaluate(element => {
        const probe = document.createElement('span');
        probe.style.background = 'var(--wa11y-user-profiles-primary-selected)';
        element.append(probe);
        const expected = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return getComputedStyle(element).backgroundColor === expected;
      }), 'The full list row must use Selected');
      await row.locator('.wa-avatar-listing').hover();
      assert.equal(await row.locator('.wa-avatar-listing').evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)');
    };
    await assertListHighlight('.recent-panel li');
    await page.getByRole('button', { name: 'Accounts', exact: true }).click();
    const row = page.locator('.accounts-table tbody tr').first();
    const allCellsSelected = () => row.evaluate(element => {
      const probe = document.createElement('span');
      probe.style.background = 'var(--wa11y-user-profiles-primary-selected)';
      element.append(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [...element.querySelectorAll('td')].every(cell => getComputedStyle(cell).backgroundColor === expected);
    });
    await row.locator('td').nth(2).hover();
    assert(await allCellsSelected(), 'Every cell must highlight when hovering a non-avatar cell');
    await page.locator('.product-brand').hover();
    await row.getByRole('button').first().focus();
    assert(await allCellsSelected(), 'Every cell must highlight when a row action has keyboard focus');
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileRow = page.locator('.mobile-accounts > li').first();
    await mobileRow.locator('dd').last().hover();
    assert.notEqual(await mobileRow.evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)');
    await mobileRow.locator('.wa-avatar-listing').hover();
    assert.equal(await mobileRow.locator('.wa-avatar-listing').evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)');
    console.log('Table row hover and keyboard focus highlight all cells with the profile Selected colour.');
    await browser.close();
    process.exit(0);
  }
  if (process.argv.includes('--sidebar-only')) {
    for (const width of [1024, 1440, 2560]) {
      await page.setViewportSize({ width, height: 1100 });
      const expanded = await page.locator('.dashboard-main').boundingBox();
      await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
      const collapsed = await page.locator('.dashboard-main').boundingBox();
      assert(collapsed.x < expanded.x, `Main content must move left at ${width}px`);
      assert(collapsed.width > expanded.width, `Main content must expand at ${width}px`);
      assert.equal(Math.round(collapsed.x), 96);
      await page.getByRole('button', { name: 'Expand sidebar', exact: true }).click();
      const restored = await page.locator('.dashboard-main').boundingBox();
      assert.equal(Math.round(restored.x), Math.round(expanded.x));
    }
    console.log('Sidebar layout passed: main content follows collapse and expansion at 1024, 1440, and 2560px.');
    await browser.close();
    process.exit(0);
  }
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('.recharts-surface').count(), 3);
  await page.getByText('View data table', { exact: false }).first().click();
  assert(await page.getByRole('table', { name: 'Revenue, moving forward' }).isVisible());
  await page.getByText('View data table', { exact: false }).first().click();
  if (process.argv.includes('--screenshots')) await page.screenshot({ path: '/private/tmp/wa11y-dashboard-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Accounts', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search accounts', exact: true }).fill('Forma');
  assert.equal(await page.locator('.accounts-table tbody tr').count(), 1);
  await page.getByRole('textbox', { name: 'Search accounts', exact: true }).fill('unmatched-company');
  assert(await page.getByRole('heading', { name: 'No accounts found' }).isVisible());
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  assert.equal(await page.locator('.accounts-table tbody tr').count(), 12);
  await page.getByRole('button', { name: 'Add account', exact: true }).click();
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  assert(await page.getByText('Enter a valid contact email.', { exact: true }).isVisible());
  await page.getByRole('textbox', { name: 'Company name', exact: true }).fill('Apex Works');
  await page.getByRole('textbox', { name: 'Contact email', exact: true }).fill('hello@apex.example');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  assert.equal(await page.locator('.accounts-table tbody tr').count(), 13);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const nameInput = page.getByRole('textbox', { name: 'Full name', exact: true });
  await nameInput.fill('Alex Morgan');
  const focusStyles = await nameInput.evaluate(input => {
    const inner = getComputedStyle(input), outer = getComputedStyle(input.closest('.wa-input__box'));
    return { innerOutline: inner.outlineStyle, innerBorder: inner.borderTopWidth, innerShadow: inner.boxShadow, outerOutline: outer.outlineStyle, outerShadow: outer.boxShadow };
  });
  assert.equal(focusStyles.innerOutline, 'none'); assert.equal(focusStyles.innerBorder, '0px');
  assert.equal(focusStyles.innerShadow, 'none'); assert.equal(focusStyles.outerOutline, 'none');
  assert(focusStyles.outerShadow.includes('3px') && focusStyles.outerShadow.includes('inset'));

  await page.getByRole('radio', { name: 'Compact', exact: true }).focus();
  await page.keyboard.press('Space');
  assert(await page.getByRole('radio', { name: 'Compact', exact: true }).isChecked());
  await page.getByRole('button', { name: 'Save preferences', exact: true }).click();
  assert.equal(await page.locator('.app-shell').getAttribute('data-density'), 'compact');
  await page.getByRole('button', { name: 'Accounts', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  assert.equal(await page.getByRole('textbox', { name: 'Full name', exact: true }).inputValue(), 'Alex Morgan');
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(100);
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
    if (dimensions.page > dimensions.viewport) console.log(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + .1).slice(0, 15).map(el => ({ tag: el.tagName, class: el.getAttribute('class'), right: el.getBoundingClientRect().right, text: el.textContent?.slice(0, 50) }))));
    assert(dimensions.page <= dimensions.viewport, `Page overflow at ${width}: ${JSON.stringify(dimensions)}`);
  }
  await page.getByRole('button', { name: 'Accounts', exact: true }).click();
  await page.locator('.mobile-accounts').waitFor({ state: 'visible' });
  assert(await page.locator('.mobile-accounts').isVisible());
  assert(!(await page.locator('.desktop-accounts').isVisible()));
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.getByRole('heading', { name: 'Business overview', exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  if (process.argv.includes('--screenshots')) await page.screenshot({ path: '/private/tmp/wa11y-dashboard-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('Showcase checks passed: charts/data tables, search, empty state, create/validation, saved settings, mobile navigation, and 320–1440px reflow.');
} finally { await browser.close(); }
