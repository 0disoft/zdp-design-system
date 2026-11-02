import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createServer } from 'vite';

let server;
let cacheDir;
let render;
let Accordion;
before(async () => {
  cacheDir = await mkdtemp(join(tmpdir(), 'zdp-accordion-'));
  server = await createServer({
    root: process.cwd(), cacheDir, configFile: false, logLevel: 'error',
    optimizeDeps: { noDiscovery: true }, plugins: [svelte()], server: { hmr: false, host: '127.0.0.1', port: 0 }
  });
  await server.listen();
  ({ render } = await server.ssrLoadModule('svelte/server'));
  ({ default: Accordion } = await server.ssrLoadModule('/src/lib/components/Accordion.svelte'));
});
after(async () => {
  try { await server?.close(); }
  finally { if (cacheDir) await rm(cacheDir, { recursive: true, force: true }); }
});

const expanded = body => [...body.matchAll(/aria-expanded="(true|false)"/g)].map(match => match[1]);
const items = Object.freeze([
  Object.freeze({ id: 'closed', title: 'First', content: 'A' }),
  Object.freeze({ id: 'disabled', title: 'Second', content: 'B', open: true, disabled: true }),
  Object.freeze({ id: 'open', title: 'Third', content: 'C', open: true }),
  Object.freeze({ id: 'also-open', title: 'Fourth', content: 'D', open: true })
]);

test('SSR preserves item order and multiple open states while excluding disabled defaults', () => {
  const body = render(Accordion, { props: { items } }).body;
  assert.deepEqual(expanded(body), ['false', 'false', 'true', 'true']);
  assert.ok(body.indexOf('First') < body.indexOf('Second'));
  assert.ok(body.indexOf('Second') < body.indexOf('Third'));
  assert.ok(body.indexOf('Third') < body.indexOf('Fourth'));
});

test('single mode opens the first enabled default and empty input renders no triggers', () => {
  assert.deepEqual(expanded(render(Accordion, { props: { items, mode: 'single' } }).body), ['false', 'false', 'true', 'false']);
  assert.deepEqual(expanded(render(Accordion, { props: { items: [] } }).body), []);
});

test('large SSR input preserves every expanded item', t => {
  for (const size of [1000, 5000, 10000]) {
    const large = Array.from({ length: size }, (_, i) => ({ id: `item-${i}`, title: `Title ${i}`, content: '', open: true }));
    render(Accordion, { props: { items: large } });
    const times = [];
    for (let run = 0; run < 3; run++) {
      const start = performance.now();
      const body = render(Accordion, { props: { items: large } }).body;
      times.push(performance.now() - start);
      const states = expanded(body);
      assert.equal(states.length, size);
      assert.ok(states.every(state => state === 'true'));
    }
    times.sort((a, b) => a - b);
    t.diagnostic(`${size} open items: median SSR ${times[1].toFixed(1)}ms (3 runs; no timing assertion)`);
  }
});
