import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const updateSnapshots = process.argv.includes('--update');
const storybookRoot = readPathOption('--storybook-root', 'storybook-static');
const snapshotRoot = readPathOption('--snapshot-root', 'tests/visual/__snapshots__');
const reportRoot = readPathOption('--report-root', 'reports/visual-regression');
const pixelThreshold = 20;
const maxChangedPixelRatio = 0.001;
const formStory = 'design-system-components-form-controls--states';
const visualFontStylesheet =
  'https://cdn.jsdelivr.net/npm/@fontsource-variable/noto-sans-kr@5.3.0/index.css';
const allowedExternalHosts = new Set(['cdn.jsdelivr.net']);

const visualCases = [
  {
    name: 'form-controls-light',
    storyId: formStory,
    prepare: waitForFormFixture,
    capture: (page) => captureLocator(page, '[aria-labelledby="forms-light-title"]')
  },
  {
    name: 'form-controls-dark',
    storyId: formStory,
    prepare: waitForFormFixture,
    capture: (page) => captureLocator(page, '[aria-labelledby="forms-dark-title"]')
  },
  {
    name: 'combobox-light-open',
    storyId: formStory,
    prepare: async (page) => {
      await waitForFormFixture(page);
      const lightPanel = page.locator('[aria-labelledby="forms-light-title"]');
      const combobox = lightPanel.getByRole('combobox', { name: '담당' });
      await combobox.focus();
      await combobox.press('ArrowDown');
      await lightPanel.locator('[role="listbox"]').waitFor({ state: 'visible' });
      await settleLayout(page);
    },
    capture: captureViewport
  },
  {
    name: 'menu-light-open',
    storyId: 'design-system-components-interaction--states',
    prepare: async (page) => {
      const lightPanel = page.locator('[aria-labelledby="interaction-light-title"]');
      await lightPanel.getByRole('button', { name: '더보기' }).click();
      await page.getByRole('menu', { name: '더보기' }).waitFor({ state: 'visible' });
      await settleLayout(page);
    },
    capture: captureViewport
  },
  {
    name: 'dialog-light-open',
    storyId: 'design-system-components-interaction--states',
    prepare: async (page) => {
      const lightPanel = page.locator('[aria-labelledby="interaction-light-title"]');
      await lightPanel.getByRole('button', { name: '검토 열기' }).click();
      await page.getByRole('dialog', { name: '변경 내용을 저장할까요?' }).waitFor({ state: 'visible' });
      await settleLayout(page);
    },
    capture: captureViewport
  },
  {
    name: 'sheet-light-open',
    storyId: 'design-system-components-interaction--states',
    prepare: async (page) => {
      const lightPanel = page.locator('[aria-labelledby="interaction-light-title"]');
      await lightPanel.getByRole('button', { name: '화면 설정' }).click();
      await page.getByRole('dialog', { name: '화면 설정' }).waitFor({ state: 'visible' });
      await settleLayout(page);
    },
    capture: captureViewport
  },
  {
    name: 'theme-locale-mobile-light',
    storyId: 'design-system-qa-theme-locale-stress--stress',
    prepare: settleLayout,
    capture: (page) => captureLocator(
      page,
      '[aria-labelledby="stress-light-title"] .stress-device'
    )
  }
];

await assertDirectory(storybookRoot, `Storybook build directory does not exist: ${storybookRoot}`);
if (updateSnapshots) {
  await rm(snapshotRoot, { force: true, recursive: true });
}
await mkdir(snapshotRoot, { recursive: true });
await rm(reportRoot, { force: true, recursive: true });

const server = await startStaticServer(storybookRoot);
let browser;
const failures = [];

try {
  browser = await chromium.launch({
    channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
    timeout: 30_000
  });

  const context = await browser.newContext({
    colorScheme: 'light',
    deviceScaleFactor: 1,
    locale: 'ko-KR',
    reducedMotion: 'reduce',
    timezoneId: 'Asia/Seoul',
    viewport: { width: 1280, height: 900 }
  });

  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    const localRequest = url.protocol === 'http:' && url.hostname === '127.0.0.1';
    const pinnedFontRequest = url.protocol === 'https:' && allowedExternalHosts.has(url.hostname);

    if (localRequest || pinnedFontRequest || url.protocol === 'data:' || url.protocol === 'blob:') {
      await route.continue();
      return;
    }

    await route.abort('blockedbyclient');
  });

  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);

  for (const visualCase of visualCases) {
    try {
      await openStory(page, server.url, visualCase.storyId);
      await visualCase.prepare(page);
      const actual = await visualCase.capture(page);
      const snapshotPath = join(snapshotRoot, `${visualCase.name}.png`);

      if (updateSnapshots) {
        await writeFile(snapshotPath, actual);
        console.log(`Updated visual snapshot: ${visualCase.name}`);
        continue;
      }

      let expected;
      try {
        expected = await readFile(snapshotPath);
      } catch {
        const message = 'snapshot is missing; capture the base Storybook before comparison.';
        await writeCaseFailure(visualCase.name, message, { actual });
        failures.push(`${visualCase.name}: ${message}`);
        continue;
      }

      const comparison = await compareScreenshots(page, expected, actual);
      const changedPixelRatio = comparison.changedPixels / Math.max(comparison.totalPixels, 1);

      if (comparison.sameSize && changedPixelRatio <= maxChangedPixelRatio) {
        console.log(
          `Visual snapshot passed: ${visualCase.name} (${comparison.changedPixels}/${comparison.totalPixels} changed pixels)`
        );
        continue;
      }

      await writeCaseFailure(visualCase.name, 'rendered pixels changed.', {
        expected,
        actual,
        diff: Buffer.from(comparison.diffBase64, 'base64')
      });

      const sizeDetail = comparison.sameSize
        ? `${comparison.width}x${comparison.height}`
        : `expected ${comparison.expectedWidth}x${comparison.expectedHeight}, actual ${comparison.actualWidth}x${comparison.actualHeight}`;
      failures.push(
        `${visualCase.name}: ${comparison.changedPixels}/${comparison.totalPixels} pixels changed ` +
        `(${(changedPixelRatio * 100).toFixed(3)}%, allowed ${(maxChangedPixelRatio * 100).toFixed(3)}%) at ${sizeDetail}.`
      );
    } catch (error) {
      const detail = formatError(error);
      await writeCaseFailure(visualCase.name, detail);
      failures.push(`${visualCase.name}: ${detail.split('\n')[0]}`);
    }
  }

  await context.close();
} finally {
  await browser?.close();
  await server.close();
}

if (failures.length > 0) {
  throw new Error(`Targeted visual regression check failed:\n- ${failures.join('\n- ')}`);
}

console.log(updateSnapshots
  ? 'Targeted visual regression snapshots updated.'
  : 'Targeted visual regression check passed.');

async function openStory(page, baseUrl, storyId) {
  const url = new URL('/iframe.html', baseUrl);
  url.searchParams.set('id', storyId);
  url.searchParams.set('viewMode', 'story');

  await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
  await page.locator('#storybook-root').waitFor({ state: 'visible' });
  await page.addStyleTag({ url: visualFontStylesheet });
  await page.addStyleTag({
    content: `
      :root,
      [data-zdp-theme='light'],
      [data-zdp-theme='dark'] {
        --zdp-font-family-sans: 'Noto Sans KR Variable', 'Noto Sans SC Variable', 'Noto Sans JP Variable', sans-serif;
        --zdp-font-family-korean: 'Noto Sans KR Variable', sans-serif;
        --zdp-font-family-display: 'Noto Sans KR Variable', 'Noto Sans SC Variable', 'Noto Sans JP Variable', sans-serif;
        --zdp-font-family-multiscript: 'Noto Sans KR Variable', 'Noto Sans SC Variable', 'Noto Sans JP Variable', 'Noto Sans Devanagari Variable', 'Noto Sans Thai Variable', sans-serif;
      }

      html,
      body,
      #storybook-root {
        font-family: var(--zdp-font-family-multiscript);
      }

      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `
  });
  const loadedFontFaces = await page.evaluate(async () => {
    const faces = await document.fonts.load('400 16px "Noto Sans KR Variable"', '한글');
    await document.fonts.ready;
    return faces.filter((face) => face.status === 'loaded').length;
  });
  assert.ok(loadedFontFaces > 0, 'Pinned Noto Sans KR visual-test font must load before capture.');
  await settleLayout(page);
}

async function waitForFormFixture(page) {
  const lightPanel = page.locator('[aria-labelledby="forms-light-title"]');
  await lightPanel.waitFor({ state: 'visible' });
  await lightPanel.getByRole('combobox', { name: '담당' }).waitFor({ state: 'visible' });
  await settleLayout(page);
}

async function captureLocator(page, selector) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible' });
  return locator.screenshot({
    animations: 'disabled',
    caret: 'hide',
    scale: 'css'
  });
}

async function captureViewport(page) {
  return page.screenshot({
    animations: 'disabled',
    caret: 'hide',
    fullPage: false,
    scale: 'css'
  });
}

async function settleLayout(page) {
  await page.evaluate(() => new Promise((resolveFrame) => {
    requestAnimationFrame(() => requestAnimationFrame(resolveFrame));
  }));
}

async function writeCaseFailure(name, message, images = {}) {
  const caseReportRoot = join(reportRoot, name);
  await mkdir(caseReportRoot, { recursive: true });
  await writeFile(join(caseReportRoot, 'failure.txt'), `${message.trim()}\n`);

  const writes = [];
  if (images.expected) {
    writes.push(writeFile(join(caseReportRoot, 'expected.png'), images.expected));
  }
  if (images.actual) {
    writes.push(writeFile(join(caseReportRoot, 'actual.png'), images.actual));
  }
  if (images.diff) {
    writes.push(writeFile(join(caseReportRoot, 'diff.png'), images.diff));
  }
  await Promise.all(writes);
}

async function compareScreenshots(page, expected, actual) {
  return page.evaluate(async ({ expectedBase64, actualBase64, threshold }) => {
    const decode = async (base64) => {
      const image = new Image();
      const loaded = new Promise((resolveImage, rejectImage) => {
        image.addEventListener('load', resolveImage, { once: true });
        image.addEventListener('error', () => rejectImage(new Error('Could not decode PNG snapshot.')), { once: true });
      });
      image.src = `data:image/png;base64,${base64}`;
      await loaded;

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context === null) {
        throw new Error('Could not create a 2D canvas context for visual comparison.');
      }
      context.drawImage(image, 0, 0);

      return {
        width: canvas.width,
        height: canvas.height,
        pixels: context.getImageData(0, 0, canvas.width, canvas.height).data
      };
    };

    const [expectedImage, actualImage] = await Promise.all([
      decode(expectedBase64),
      decode(actualBase64)
    ]);
    const sameSize = expectedImage.width === actualImage.width && expectedImage.height === actualImage.height;
    const width = Math.max(expectedImage.width, actualImage.width);
    const height = Math.max(expectedImage.height, actualImage.height);
    const totalPixels = width * height;
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = width;
    diffCanvas.height = height;
    const diffContext = diffCanvas.getContext('2d');
    if (diffContext === null) {
      throw new Error('Could not create a 2D canvas context for visual diff output.');
    }
    const diffImage = diffContext.createImageData(width, height);
    let changedPixels = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const diffOffset = (y * width + x) * 4;
        const expectedInBounds = x < expectedImage.width && y < expectedImage.height;
        const actualInBounds = x < actualImage.width && y < actualImage.height;
        const expectedOffset = expectedInBounds ? (y * expectedImage.width + x) * 4 : -1;
        const actualOffset = actualInBounds ? (y * actualImage.width + x) * 4 : -1;

        const redDelta = Math.abs(
          (expectedOffset >= 0 ? expectedImage.pixels[expectedOffset] : 0) -
          (actualOffset >= 0 ? actualImage.pixels[actualOffset] : 0)
        );
        const greenDelta = Math.abs(
          (expectedOffset >= 0 ? expectedImage.pixels[expectedOffset + 1] : 0) -
          (actualOffset >= 0 ? actualImage.pixels[actualOffset + 1] : 0)
        );
        const blueDelta = Math.abs(
          (expectedOffset >= 0 ? expectedImage.pixels[expectedOffset + 2] : 0) -
          (actualOffset >= 0 ? actualImage.pixels[actualOffset + 2] : 0)
        );
        const alphaDelta = Math.abs(
          (expectedOffset >= 0 ? expectedImage.pixels[expectedOffset + 3] : 0) -
          (actualOffset >= 0 ? actualImage.pixels[actualOffset + 3] : 0)
        );
        const changed = !expectedInBounds || !actualInBounds ||
          Math.max(redDelta, greenDelta, blueDelta, alphaDelta) > threshold;

        if (changed) {
          changedPixels += 1;
          diffImage.data[diffOffset] = 255;
          diffImage.data[diffOffset + 1] = 0;
          diffImage.data[diffOffset + 2] = 96;
          diffImage.data[diffOffset + 3] = 255;
          continue;
        }

        const grayscale = expectedOffset >= 0
          ? Math.round(
              expectedImage.pixels[expectedOffset] * 0.299 +
              expectedImage.pixels[expectedOffset + 1] * 0.587 +
              expectedImage.pixels[expectedOffset + 2] * 0.114
            )
          : 255;
        diffImage.data[diffOffset] = grayscale;
        diffImage.data[diffOffset + 1] = grayscale;
        diffImage.data[diffOffset + 2] = grayscale;
        diffImage.data[diffOffset + 3] = 96;
      }
    }

    diffContext.putImageData(diffImage, 0, 0);

    return {
      actualHeight: actualImage.height,
      actualWidth: actualImage.width,
      changedPixels,
      diffBase64: diffCanvas.toDataURL('image/png').split(',')[1],
      expectedHeight: expectedImage.height,
      expectedWidth: expectedImage.width,
      height,
      sameSize,
      totalPixels,
      width
    };
  }, {
    actualBase64: actual.toString('base64'),
    expectedBase64: expected.toString('base64'),
    threshold: pixelThreshold
  });
}

async function startStaticServer(directory) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const requestPath = decodeURIComponent(requestUrl.pathname);
      const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
      let absolutePath = resolve(directory, relativePath);

      if (absolutePath !== directory && !absolutePath.startsWith(`${directory}${sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      const fileStats = await stat(absolutePath).catch(() => null);
      if (fileStats?.isDirectory()) {
        absolutePath = join(absolutePath, 'index.html');
      }

      const body = await readFile(absolutePath);
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': contentType(absolutePath)
      });
      response.end(body);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object', 'Visual regression server must expose a TCP address.');

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolveClose, rejectClose) => {
      server.close((error) => error ? rejectClose(error) : resolveClose());
    })
  };
}

function readPathOption(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return resolve(root, fallback);
  }

  const value = process.argv[index + 1];
  assert.ok(value && !value.startsWith('--'), `${flag} requires a path value.`);
  return resolve(root, value);
}

function contentType(path) {
  switch (extname(path)) {
    case '.css': return 'text/css; charset=utf-8';
    case '.gif': return 'image/gif';
    case '.html': return 'text/html; charset=utf-8';
    case '.ico': return 'image/x-icon';
    case '.jpeg':
    case '.jpg': return 'image/jpeg';
    case '.js':
    case '.mjs': return 'text/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    case '.woff': return 'font/woff';
    case '.woff2': return 'font/woff2';
    default: return 'application/octet-stream';
  }
}

function formatError(error) {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}

async function assertDirectory(path, message) {
  const pathStats = await stat(path).catch(() => null);
  assert.ok(pathStats?.isDirectory(), message);
}
