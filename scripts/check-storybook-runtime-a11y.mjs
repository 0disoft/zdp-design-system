import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer as createHttpServer } from 'node:http';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const temporaryRoot = await mkdtemp(join(tmpdir(), 'zdp-storybook-a11y-'));
const storybookRoot = join(temporaryRoot, 'storybook-static');
const failures = [];
let browser;
let staticServer;

try {
  buildStorybook(storybookRoot);

  const storyIndex = parseStoryIndex(JSON.parse(await readFile(join(storybookRoot, 'index.json'), 'utf8')));
  assert.ok(storyIndex.length > 0, 'Storybook runtime a11y check requires at least one rendered story.');
  const axeSource = await readFile(resolve(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
  staticServer = await startStaticServer(storybookRoot);
  browser = await chromium.launch({
    channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    timeout: 30_000
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(30_000);

  for (const story of storyIndex) {
    const storyUrl = `${staticServer.origin}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`;
    const response = await page.goto(storyUrl, { waitUntil: 'networkidle' });
    assert.ok(response?.ok(), `Storybook story ${story.id} failed to load: ${response?.status() ?? 'no response'}.`);
    await page.waitForFunction(() => {
      const storyRoot = document.getElementById('storybook-root');
      const error = document.querySelector('.sb-errordisplay');
      return Boolean(error || (storyRoot && storyRoot.innerHTML.trim().length > 0));
    });
    await page.waitForTimeout(1_200);

    const storyError = await page.evaluate(() => {
      const error = document.querySelector('.sb-errordisplay');
      if (!(error instanceof HTMLElement) || getComputedStyle(error).display === 'none') {
        return null;
      }
      return error.textContent?.trim() || 'Unknown Storybook render error.';
    });
    if (storyError) {
      failures.push(`${story.id} failed to render: ${storyError}`);
      continue;
    }

    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(async () => {
      if (!globalThis.axe) {
        throw new Error('axe-core did not initialize in the Storybook iframe.');
      }

      const audit = await globalThis.axe.run(document.body, {
        resultTypes: ['violations'],
        rules: {
          region: { enabled: false }
        }
      });

      return audit.violations.map((violation) => ({
        help: violation.help,
        helpUrl: violation.helpUrl,
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.slice(0, 5).map((node) => ({
          failureSummary: node.failureSummary,
          html: node.html,
          target: node.target
        }))
      }));
    });

    for (const violation of result) {
      failures.push(formatViolation(story, violation));
    }
  }

  if (failures.length > 0) {
    throw new Error(`Storybook runtime a11y check failed:\n- ${failures.join('\n- ')}`);
  }

  console.log(`Storybook runtime a11y check passed for ${storyIndex.length} stories.`);
} finally {
  await browser?.close();
  await staticServer?.close();
  await rm(temporaryRoot, { force: true, recursive: true });
}

function buildStorybook(outputDirectory) {
  const storybookExecutable = resolve(
    root,
    process.platform === 'win32' ? 'node_modules/.bin/storybook.exe' : 'node_modules/.bin/storybook'
  );
  const result = spawnSync(storybookExecutable, ['build', '--output-dir', outputDirectory], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    timeout: 300_000,
    windowsHide: true
  });

  assert.equal(result.error, undefined, `Storybook build failed to start: ${result.error?.message ?? 'unknown error'}`);
  assert.equal(result.status, 0, `Storybook build failed:\n${result.stderr || result.stdout}`);
}

function parseStoryIndex(value) {
  assert.ok(isRecord(value), 'Storybook index.json must be an object.');
  const entries = isRecord(value.entries) ? value.entries : isRecord(value.stories) ? value.stories : null;
  assert.ok(entries, 'Storybook index.json must contain entries.');

  return Object.values(entries)
    .filter(
      (entry) =>
        isRecord(entry) &&
        entry.type === 'story' &&
        typeof entry.id === 'string' &&
        typeof entry.title === 'string' &&
        typeof entry.name === 'string'
    )
    .map((entry) => ({ id: entry.id, name: entry.name, title: entry.title }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

async function startStaticServer(directory) {
  const server = createHttpServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const pathname = decodeURIComponent(requestUrl.pathname);
      let filePath = resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
      const relativePath = relative(directory, filePath);

      if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      const fileStats = await stat(filePath);
      if (fileStats.isDirectory()) {
        filePath = join(filePath, 'index.html');
      }

      const content = await readFile(filePath);
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': contentType(filePath)
      });
      response.end(content);
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        response.writeHead(404).end('Not found');
        return;
      }

      response.writeHead(500).end('Internal server error');
    }
  });

  await new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolvePromise);
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object', 'Storybook static server must expose a TCP address.');

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolvePromise, reject) => server.close((error) => (error ? reject(error) : resolvePromise())))
  };
}

function contentType(path) {
  switch (extname(path)) {
    case '.css':
      return 'text/css; charset=utf-8';
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function formatViolation(story, violation) {
  const nodes = violation.nodes
    .map((node) => `${node.target.join(' ')} :: ${node.failureSummary ?? node.html}`)
    .join(' | ');
  return `${story.title}/${story.name} [${violation.id}, ${violation.impact ?? 'unknown'}] ${violation.help} (${violation.helpUrl}) ${nodes}`;
}

function isNodeError(value) {
  return value instanceof Error && 'code' in value;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
