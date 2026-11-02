import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { resolveGitHubPagesUrl } from './github-pages-url.mjs';

const repository = 'example/design-system';
const options = { token: 'test-token', apiUrl: 'https://api.github.com' };
const response = (status = 200, value = { html_url: 'https://design.example/docs/' }) => ({ status, text: async () => JSON.stringify(value) });
const lookup = (overrides = {}, target = 'pr-preview/pr-42') => resolveGitHubPagesUrl(repository, target, { ...options, ...overrides });

test('a single authenticated GET retains the configured custom domain and base path', async () => {
  let calls = 0;
  assert.deepEqual(await lookup({ request: async (url, init) => {
    calls++;
    assert.equal(url, 'https://api.github.com/repos/example/design-system/pages');
    assert.equal(init.method, 'GET');
    assert.equal(init.headers.Authorization, 'Bearer test-token');
    return response();
  } }), { pages_enabled: 'true', deployment_url: 'https://design.example/docs/pr-preview/pr-42/' });
  assert.equal(calls, 1);
  assert.deepEqual(await lookup({ request: async () => response(200, { html_url: 'https://design.example/docs' }) }, '.'),
    { pages_enabled: 'true', deployment_url: 'https://design.example/docs/' });
});

test('only HTTP 404 retains the existing disabled-Pages fallback', async () => {
  for (const target of ['.', 'pr-preview/pr-42']) {
    assert.deepEqual(await lookup({ request: async () => response(404) }, target), {
      pages_enabled: 'false',
      deployment_url: `https://example.github.io/design-system/${target === '.' ? '' : `${target}/`}`
    });
  }
});

for (const status of [401, 403]) {
  test(`HTTP ${status} fails once instead of inventing a preview URL`, async () => {
    let calls = 0;
    await assert.rejects(lookup({ request: async () => { calls++; return response(status); },
      sleep: async () => assert.fail('must not retry') }), error => error.cause?.status === status);
    assert.equal(calls, 1);
  });
}

test('transient GET failures back off and recover the actual configured address', async () => {
  let calls = 0;
  const waits = [];
  const result = await lookup({ request: async () => response(++calls < 3 ? 503 : 200),
    sleep: async ms => { waits.push(ms); } });
  assert.equal(result.pages_enabled, 'true');
  assert.equal(result.deployment_url, 'https://design.example/docs/pr-preview/pr-42/');
  assert.deepEqual(waits, [250, 500]);
});

test('exhausted network errors preserve causes without producing a fallback', async () => {
  const original = new TypeError('network unavailable', { cause: new Error('ECONNRESET') });
  let calls = 0;
  await assert.rejects(lookup({ request: async () => { calls++; throw original; }, sleep: async () => {} }),
    error => error.cause === original && error.cause.cause.message === 'ECONNRESET');
  assert.equal(calls, 3);
});

test('missing, malformed and unsafe URL metadata fails after one read', async () => {
  for (const html_url of [undefined, '', 'not a url', 'javascript:alert(1)', 'https://name:secret@example.com', 'https://example.com/?x=1', 'https://example.com/\noutput=injected']) {
    let calls = 0;
    await assert.rejects(lookup({ request: async () => { calls++; return response(200, { html_url }); },
      sleep: async () => assert.fail('must not retry') }), error => /invalid Pages URL/.test(error.cause?.message));
    assert.equal(calls, 1);
  }
  await assert.rejects(lookup({ request: async () => ({ status: 200, text: async () => 'invalid json' }) }),
    error => error.cause instanceof SyntaxError);
});

test('cancellation before and during a read propagates the caller reason', async () => {
  const reason = new Error('cancel Pages lookup');
  await assert.rejects(lookup({ signal: AbortSignal.abort(reason), request: async () => assert.fail('must not fetch') }), error => error === reason);
  const controller = new AbortController();
  let requestSignal;
  const pending = lookup({ signal: controller.signal, request: async (_url, init) => {
    requestSignal = init.signal;
    return new Promise(() => {});
  } });
  controller.abort(reason);
  await assert.rejects(pending, error => error === reason);
  assert.equal(requestSignal.reason, reason);
});

test('the response-body deadline is enforced before any URL is returned', async () => {
  let calls = 0;
  await assert.rejects(lookup({ timeoutMs: 5, sleep: async () => {}, request: async () => {
    calls++;
    return { status: 200, text: () => new Promise(() => {}) };
  } }), error => error.cause?.name === 'TimeoutError');
  assert.equal(calls, 3);
});

test('invalid repository or target paths fail before external I/O', async () => {
  const settings = { ...options, request: async () => assert.fail('must not fetch') };
  for (const target of ['', '../escape', 'pr-preview/pr-0', 'pr-preview/pr-1\noutput=injected']) {
    await assert.rejects(resolveGitHubPagesUrl(repository, target, settings), /Pages target/);
  }
  await assert.rejects(resolveGitHubPagesUrl('bad-repository', '.', settings), /Repository/);
});

test('CLI failure leaves GITHUB_OUTPUT untouched and exits nonzero without leaking credentials', async () => {
  const root = await mkdtemp(join(tmpdir(), 'zdp-pages-url-'));
  const server = createServer((_request, reply) => { reply.writeHead(401); reply.end('{}'); });
  try {
    const output = join(root, 'output.txt');
    await writeFile(output, 'existing=value\n');
    await new Promise((yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
    const script = fileURLToPath(new URL('./github-pages-url.mjs', import.meta.url));
    const child = spawn(process.execPath, [script, repository, '.'], {
      env: { ...process.env, GH_TOKEN: 'private-test-credential', GITHUB_API_URL: `http://127.0.0.1:${server.address().port}`, GITHUB_OUTPUT: output },
      stdio: ['ignore', 'pipe', 'pipe'], timeout: 5000
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });
    const code = await new Promise((yes, no) => { child.once('error', no); child.once('close', yes); });
    assert.equal(code, 1);
    assert.equal(stdout, '');
    assert.match(stderr, /HTTP 401/);
    assert.doesNotMatch(stderr, /private-test-credential/);
    assert.equal(await readFile(output, 'utf8'), 'existing=value\n');
  } finally {
    server.closeAllConnections();
    await new Promise((yes, no) => server.close(error => error ? no(error) : yes()));
    await rm(root, { recursive: true, force: true });
  }
});

test('the workflow uses the bounded helper and lets failures block preview comment updates', async () => {
  const workflow = await readFile(new URL('../.github/workflows/storybook-pages-publish.yml', import.meta.url), 'utf8');
  const step = workflow.split('      - name: Resolve Pages URL')[1].split('      - name: Update pull request preview comment')[0];
  assert.ok(step.includes('node scripts/github-pages-url.mjs "$GITHUB_REPOSITORY" "$TARGET_PATH"'));
  assert.ok(!step.includes('|| true'));
  assert.ok(!step.includes('continue-on-error'));
  assert.ok(!step.includes('2>/dev/null'));
});
