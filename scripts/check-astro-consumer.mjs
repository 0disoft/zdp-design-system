import assert from 'node:assert/strict';
import { verifyButtonLoadingAppearance } from './browser/check-button-loading.mjs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { chromium } from 'playwright-core';
import { npmCommand } from './npm-command.ts';
import { verifyWaitingProgress } from './browser/check-progress-waiting.mjs';
import { verifySpinnerMotion } from './browser/check-spinner-motion.mjs';
import { verifySkeletonMotion } from './browser/check-skeleton-motion.mjs';

const root = process.cwd();
await mkdir(join(root, 'tmp'), { recursive: true });
const working = await mkdtemp(join(root, 'tmp/astro-consumer-'));
assert.ok(resolve(working).startsWith(resolve(root, 'tmp') + sep), 'Temporary consumer must stay inside workspace tmp');
let browser;
let server;

async function run(args, cwd) {
  const child = Bun.spawn(args, { cwd, stdout: 'inherit', stderr: 'inherit',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  assert.equal(await child.exited, 0, `Command failed: ${args.join(' ')}`);
}

try {
  await cp(join(root, 'fixtures/consumer-astro'), working, { recursive: true });
  const npm = npmCommand(['pack', '--ignore-scripts', '--json', '--pack-destination', working]);
  const packed = Bun.spawn([npm.executable, ...npm.args],
    { cwd: root, stdout: 'pipe', stderr: 'inherit' });
  const output = JSON.parse(await new Response(packed.stdout).text());
  const report = Array.isArray(output) ? output : Object.values(output);
  assert.equal(await packed.exited, 0, 'Pack current working-tree package');
  assert.ok(report[0]);
  const manifest = JSON.parse(await readFile(join(working, 'package.json'), 'utf8'));
  manifest.dependencies['zdp-design-system'] = `file:${join(working, report[0].filename).replaceAll('\\', '/')}`;
  await writeFile(join(working, 'package.json'), JSON.stringify(manifest));
  await run(['bun', 'install'], working);
  await run(['bun', 'run', 'build'], working);

  const dist = resolve(working, 'dist');
  const staticHtml = await readFile(join(dist, 'static/index.html'), 'utf8');
  const menuHtml = await readFile(join(dist, 'menu/index.html'), 'utf8');
  const popoverHtml = await readFile(join(dist, 'popover/index.html'), 'utf8');
  const comboboxHtml = await readFile(join(dist, 'combobox/index.html'), 'utf8');
  assert.ok(comboboxHtml.includes('<astro-island') && comboboxHtml.includes('Astro team'), 'Combobox server-renders and hydrates through its Svelte island');
  assert.ok(!staticHtml.includes('<astro-island'), 'Static CSS/controller page must not hydrate Svelte');
  assert.ok(menuHtml.includes('<astro-island'), 'Menu hydrates only through its Svelte island');
  assert.ok(menuHtml.includes('Astro actions'), 'Menu trigger is server rendered');
  assert.ok(popoverHtml.includes('<astro-island'), 'Popover hydrates only through its Svelte island');
  assert.ok(popoverHtml.includes('Astro filters'), 'Popover custom trigger is server rendered');

  server = Bun.serve({ hostname: '127.0.0.1', port: 0, async fetch(request) {
    const url = new URL(request.url);
    const path = resolve(dist, `.${url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname}`);
    if (!path.startsWith(dist + sep)) return new Response(null, { status: 404 });
    const file = Bun.file(path);
    return await file.exists() ? new Response(file) : new Response(null, { status: 404 });
  } });
  browser = await chromium.launch({ channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome', headless: true });
  const page = await browser.newPage();
  const originalViewport = page.viewportSize();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://**', route => route.abort());
  await page.goto(`http://127.0.0.1:${server.port}/static/`);
  const loadingRoot = page.getByTestId('static-button-loading');
  const loadingButtons = loadingRoot.getByTestId('static-button-loading-variants').locator('button');
  await verifyButtonLoadingAppearance(page, loadingRoot, loadingButtons, async loading => {
    await loadingButtons.evaluateAll((buttons, loading) => {
      for (const button of buttons) {
        button.setAttribute('data-loading', String(loading));
        button.disabled = loading;
        if (loading) button.setAttribute('aria-busy', 'true'); else button.removeAttribute('aria-busy');
      }
    }, loading);
  });
  await verifyWaitingProgress(page, page.getByRole('progressbar', { name: 'Static waiting progress', exact: true }));
  await verifySpinnerMotion(page, page.getByTestId('static-spinners').locator('.zdp-spinner'));
  await verifySkeletonMotion(page, page.getByTestId('static-skeletons-animated').locator('.zdp-skeleton'), page.getByTestId('static-skeletons-static').locator('.zdp-skeleton'));
  const staticGeometry = await page.evaluate(async () => {
    const input = document.querySelector('.zdp-input');
    const select = document.querySelector('.zdp-select');
    const arrow = document.querySelector('.zdp-select__arrow');
    const mask = getComputedStyle(arrow).maskImage;
    const maskUrl = mask.startsWith('url("') && mask.endsWith('")') ? mask.slice(5, -2) : null;
    const response = maskUrl ? await fetch(maskUrl) : null;
    return {
      height: [input, select].map(element => element.getBoundingClientRect().height),
      background: [input, select].map(element => getComputedStyle(element).backgroundColor),
      glyphSize: arrow.getBoundingClientRect().width,
      assetLoaded: Boolean(response?.ok && (await response.text()).includes('<svg')),
      disclosureMask: getComputedStyle(document.querySelector('.zdp-disclosure__mark'), '::before').maskImage,
      mask
    };
  });
  assert.deepEqual(staticGeometry.height, [44, 44], 'Packed static fields share control height');
  assert.equal(staticGeometry.background[0], staticGeometry.background[1]);
  assert.equal(staticGeometry.glyphSize, 20);
  assert.equal(staticGeometry.assetLoaded, true, 'Shared indicator asset must survive packing and Astro CSS bundling');
  assert.equal(staticGeometry.disclosureMask, staticGeometry.mask, 'Static disclosure uses the same indicator');
  await page.getByRole('combobox', { name: 'Static selection' }).selectOption({ label: 'Security team' });
  const separator = page.getByRole('separator');
  await separator.waitFor();
  await separator.focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => Number(document.querySelector('#separator')?.getAttribute('aria-valuenow')) > 240);
  await page.goto(`http://127.0.0.1:${server.port}/menu/`);
  await page.setViewportSize({ width: 320, height: 480 });
  await page.waitForSelector('astro-island:not([ssr])');
  const trigger = page.getByRole('button', { name: 'Astro actions', exact: true });
  await trigger.click();
  await page.getByRole('menuitem', { name: 'Edit', exact: true }).waitFor();
  await page.waitForFunction(() => {
    const panel = document.querySelector('.zdp-menu__panel');
    const rect = panel?.getBoundingClientRect();
    return panel?.getAttribute('data-side') === 'top' && rect.left >= 7 && rect.top >= 7 &&
      rect.right <= innerWidth - 7 && rect.bottom <= innerHeight - 7;
  });
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.getByRole('menuitem', { name: 'Archive', exact: true }).evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('Enter');
  await page.getByText('archive', { exact: true }).waitFor();
  assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
  await trigger.click();
  await page.getByRole('button', { name: 'Outside island', exact: true }).click();
  assert.equal(await page.getByRole('menu').count(), 0);
  await page.setViewportSize(originalViewport);
  await page.goto(`http://127.0.0.1:${server.port}/popover/`);
  await page.setViewportSize({ width: 320, height: 480 });
  await page.waitForSelector('astro-island:not([ssr])');
  const popoverTrigger = page.getByRole('button', { name: 'Astro filters', exact: true });
  const popover = page.getByRole('dialog', { name: 'Astro filter panel', exact: true });
  const editor = page.getByRole('textbox', { name: 'Astro filter value', exact: true });
  await popoverTrigger.click();
  await popover.waitFor();
  await page.waitForFunction(() => {
    const panel = document.querySelector('.zdp-popover__panel');
    const rect = panel?.getBoundingClientRect();
    return panel?.getAttribute('data-side') === 'top' && rect.left >= 7 && rect.top >= 7 &&
      rect.right <= innerWidth - 7 && rect.bottom <= innerHeight - 7;
  });
  assert.equal(await popoverTrigger.evaluate(element => element === document.activeElement), true);
  await editor.fill('release');
  await page.keyboard.press('Escape');
  assert.equal(await popover.count(), 0);
  assert.equal(await popoverTrigger.evaluate(element => element === document.activeElement), true);
  await popoverTrigger.click();
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  assert.equal(await popover.count(), 0);
  assert.equal(await popoverTrigger.evaluate(element => element === document.activeElement), true);
  await popoverTrigger.click();
  await page.getByRole('button', { name: 'Outside island', exact: true }).click();
  assert.equal(await popover.count(), 0);
  assert.equal(await page.getByTestId('popover-events').textContent(), 'true,false,true,false,true,false', 'Popover callbacks must fire once per internal state change');
  assert.deepEqual(errors, [], 'Astro island must hydrate without runtime errors');
  await page.goto(`http://127.0.0.1:${server.port}/combobox/`);
  await page.waitForSelector('astro-island:not([ssr])');
  const choice = page.getByRole('combobox', { name: 'Astro team', exact: true });
  await choice.click();
  await page.waitForFunction(() => {
    const panel = document.querySelector('.zdp-combobox__panel');
    const rect = panel?.getBoundingClientRect();
    return panel?.dataset.side === 'top' && rect.left >= 7 && rect.top >= 7 &&
      rect.right <= innerWidth - 7 && rect.bottom <= innerHeight - 7;
  });
  await choice.press('End');
  await choice.press('Enter');
  assert.equal(await choice.inputValue(), 'Team 40');
  assert.equal(await choice.evaluate(element => new FormData(element.form).get('team')), 'team-39');
  await choice.fill('Team 3');
  await page.getByRole('option', { name: 'Team 3', exact: true }).click();
  assert.equal(await choice.evaluate(element => new FormData(element.form).get('team')), 'team-2');
  await choice.fill('');
  await page.getByRole('button', { name: 'Outside island', exact: true }).click();
  assert.equal(await page.getByRole('listbox').count(), 0);
  assert.deepEqual(errors, [], 'Astro islands must not emit browser errors');
  console.log('Packed Astro static CSS/controller and hydrated Menu/Popover/Combobox consumers passed.');
} finally {
  await browser?.close();
  server?.stop(true);
  await rm(working, { recursive: true, force: true });
}
