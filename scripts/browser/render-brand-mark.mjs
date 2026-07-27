import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const [svgPath, outputPath, sizeValue] = process.argv.slice(2);
const size = Number.parseInt(sizeValue ?? '', 10);

assert.ok(svgPath, 'Ship-mark renderer requires an SVG input path.');
assert.ok(outputPath, 'Ship-mark renderer requires a PNG output path.');
assert.ok(Number.isInteger(size) && size > 0, 'Ship-mark renderer requires a positive integer size.');

const svg = await readFile(svgPath, 'utf8');
const browser = await chromium.launch({
  channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
  headless: true,
  timeout: 60_000
});

try {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;background:transparent}svg{display:block;width:100%;height:100%}</style>${svg}`);
  await page.screenshot({ path: outputPath, omitBackground: true });
} finally {
  await browser.close();
}
