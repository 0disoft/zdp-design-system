import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';
import { readGitHubReleaseTag } from './github-release-preflight.mjs';
import { planDraftAssets } from './github-release-draft.mjs';

const repository = 'example/package';
const tag = 'v1.2.3';
const options = { token: 'test-token', apiUrl: 'https://api.github.com' };
const response = (status = 200, value = { tag_name: tag }) => ({ status, text: async () => JSON.stringify(value) });
const lookup = overrides => readGitHubReleaseTag(repository, tag, { ...options, ...overrides });

const run = promisify(execFile);
const mockGh = [
  "import assert from 'node:assert/strict';",
  "import { createHash } from 'node:crypto';",
  "import { readFileSync, writeFileSync } from 'node:fs';",
  "const file = 'github-state.json';",
  "const state = JSON.parse(readFileSync(file, 'utf8'));",
  "const [command, ...args] = process.argv.slice(2);",
  "const save = action => { state.calls.push(action); writeFileSync(file, JSON.stringify(state)); };",
  "const endpoint = 'repos/example/package/releases/12';",
  "if (command === 'api' && args[0] === 'graphql') {",
  "  assert.ok(args.includes('tag=v1.2.3'));",
  "  save('lookup'); console.log(state.draft.id);",
  "} else if (command === 'api' && args[0] === endpoint) {",
  "  save('read'); console.log(JSON.stringify(state.draft));",
  "} else if (command === 'api' && args[1] === 'DELETE') {",
  "  assert.equal(args[2], 'repos/example/package/releases/assets/21');",
  "  assert.equal(state.draft.assets.find(asset => asset.id === 21).state, 'starter');",
  "  state.draft.assets = state.draft.assets.filter(asset => asset.id !== 21); save('delete starter');",
  "} else if (command === 'release' && args[0] === 'upload') {",
  "  assert.deepEqual(args.slice(1), ['v1.2.3', 'release-artifact.json#npm release artifact manifest']);",
  "  const name = 'release-artifact.json';",
  "  assert.ok(!state.draft.assets.some(asset => asset.name === name));",
  "  if (state.mode === 'lost-response') {",
  "    const bytes = readFileSync(name);",
  "    state.draft.assets.push({ name, size: bytes.length, digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), state: 'uploaded' });",
  "  }",
  "  save('upload');",
  "  if (state.mode === 'lost-response') process.exitCode = 1;",
  "} else if (command === 'api' && args[1] === 'PATCH') {",
  "  assert.equal(args[2], endpoint); assert.ok(args.includes('draft=false'));",
  "  state.draft.draft = false; save('publish');",
  "} else {",
  "  assert.fail(JSON.stringify([command, ...args]));",
  "}"
].join('\n');

test('the release step resumes an interrupted draft and verifies remote assets before publishing', async () => {
  const yaml = (await readFile(new URL('../.github/workflows/publish-npm.yml', import.meta.url), 'utf8')).replaceAll('\r\n', '\n');
  const step = yaml.match(/^      - name: Create GitHub release\n(?:.*\n)*?^        run: \|\n((?:^ {10}.*\n)+)/m)?.[1];
  assert.ok(step, 'The workflow release step must supply the script under test.');
  const shell = 'export PATH="$PWD/mock-bin:$PATH"\n' + step.replace(/^ {10}/gm, '');
  const bash = process.platform === 'win32'
    ? join(process.env.ProgramFiles ?? 'C:/Program Files', 'Git', 'bin', 'bash.exe')
    : 'bash';
  const fixture = await mkdtemp(join(tmpdir(), 'zdp-release-workflow-'));
  const server = createServer((request, reply) => {
    if (request.method !== 'GET' || request.url !== '/repos/example/package/releases/tags/v1.2.3') {
      reply.writeHead(400).end();
    } else {
      reply.writeHead(404).end();
    }
  });
  try {
    await new Promise((yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
    for (const directory of ['scripts', 'mock-bin']) await mkdir(join(fixture, directory));
    for (const script of ['github-release-preflight.mjs', 'github-release-draft.mjs', 'github-api-read.mjs']) {
      await copyFile(new URL(script, import.meta.url), join(fixture, 'scripts', script));
    }
    await writeFile(join(fixture, 'mock-bin', 'gh'), '#!/usr/bin/env bash\nexec node ./mock-gh.mjs "$@"\n', { mode: 0o755 });
    await writeFile(join(fixture, 'mock-gh.mjs'), mockGh);
    const packageName = 'zdp-design-system-1.2.3.tgz';
    const manifestName = 'release-artifact.json';
    const bytes = Buffer.from('verified package');
    const notes = 'Release notes\n';
    await writeFile(join(fixture, packageName), bytes);
    await writeFile(join(fixture, manifestName), '{}\n');
    await writeFile(join(fixture, 'release-notes.md'), notes);
    const statePath = join(fixture, 'github-state.json');
    const readState = async () => JSON.parse(await readFile(statePath, 'utf8'));
    const seed = mode => writeFile(statePath, JSON.stringify({
      mode, calls: [],
      draft: {
        id: 12, tag_name: tag, draft: true, name: tag, body: notes, author: { login: 'github-actions[bot]' },
        assets: [
          { name: packageName, size: bytes.length, digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), state: 'uploaded' },
          { name: manifestName, id: 21, size: 0, state: 'starter' }
        ]
      }
    }));
    const executeStep = () => run(bash, ['-c', shell], { cwd: fixture, timeout: 30_000, env: {
      ...process.env, GH_TOKEN: 'test-token', GITHUB_API_URL: 'http://127.0.0.1:' + server.address().port,
      GITHUB_REPOSITORY: repository, GITHUB_REF_NAME: tag, RELEASE_TARBALL: packageName, RELEASE_MANIFEST: manifestName
    } });

    await seed('missing-after-upload');
    await assert.rejects(executeStep(), error => {
      assert.equal(error.code, 1);
      assert.match(error.stdout, /still missing verified assets/);
      return true;
    });
    let state = await readState();
    assert.equal(state.draft.draft, true);
    assert.deepEqual(state.calls, ['lookup', 'read', 'delete starter', 'upload', 'read']);

    await seed('lost-response');
    await assert.rejects(executeStep(), { code: 1 });
    state = await readState();
    assert.equal(state.draft.draft, true);
    assert.deepEqual(state.calls, ['lookup', 'read', 'delete starter', 'upload']);
    assert.equal(state.draft.assets.length, 2);
    await executeStep();
    state = await readState();
    assert.equal(state.draft.draft, false);
    assert.deepEqual(state.calls, ['lookup', 'read', 'delete starter', 'upload', 'lookup', 'read', 'read', 'publish']);
  } finally {
    server.closeAllConnections();
    await new Promise((yes, no) => server.close(error => error ? no(error) : yes()));
    await rm(fixture, { recursive: true, force: true });
  }
});

const tarball = { name: 'zdp-design-system-1.2.3.tgz', size: 42, digest: 'sha256:tarball' };
const manifest = { name: 'release-artifact.json', size: 16, digest: 'sha256:manifest' };
const expectedDraft = { id: '12', tag, notes: 'Release notes\n', assets: [tarball, manifest] };
const draft = {
  id: 12, tag_name: tag, draft: true, name: tag, body: expectedDraft.notes,
  author: { login: 'github-actions[bot]' }, assets: [{ ...tarball, id: 20, state: 'uploaded' }]
};

test('resumes a partially uploaded draft and treats a fully uploaded draft as ready', () => {
  assert.deepEqual(planDraftAssets(draft, expectedDraft), [{ name: manifest.name, starterId: null }]);
  const complete = { ...draft, assets: [...draft.assets, { ...manifest, id: 21, state: 'uploaded' }] };
  assert.deepEqual(planDraftAssets(complete, expectedDraft), []);
});

test('plans to replace only the empty starter left by a failed asset upload', () => {
  const interrupted = { ...draft, assets: [...draft.assets, { name: manifest.name, id: 21, size: 0, state: 'starter' }] };
  assert.deepEqual(planDraftAssets(interrupted, expectedDraft), [{ name: manifest.name, starterId: 21 }]);
});

test('refuses foreign drafts, unexpected assets and mismatched uploaded content', () => {
  for (const fields of [{ draft: false }, { name: 'Manual release' }, { body: 'Different content' }, { author: { login: 'maintainer' } }]) {
    assert.throws(() => planDraftAssets({ ...draft, ...fields }, expectedDraft), /does not match the automated release/);
  }
  assert.throws(() => planDraftAssets({ ...draft, assets: [{ name: 'extra.txt' }] }, expectedDraft), /Unexpected or duplicate/);
  assert.throws(() => planDraftAssets({ ...draft, assets: [{ ...draft.assets[0], digest: 'sha256:other' }] }, expectedDraft),
    /does not match the verified release input/);
});

test('authenticated GET encodes tags, rejects redirects and returns the matching release', async () => {
  const specialTag = 'release/v1.2.3';
  assert.equal(await readGitHubReleaseTag(repository, specialTag, { ...options, request: async (url, init) => {
    assert.equal(url, 'https://api.github.com/repos/example/package/releases/tags/release%2Fv1.2.3');
    assert.equal(init.method, 'GET');
    assert.equal(init.redirect, 'error');
    assert.equal(init.headers.Authorization, 'Bearer test-token');
    assert.ok(init.signal instanceof AbortSignal);
    return response(200, { tag_name: specialTag });
  } }), specialTag);
});

test('only a definite HTTP 404 returns a missing release result', async () => {
  let calls = 0;
  assert.equal(await lookup({ request: async () => { calls++; return response(404); } }), null);
  assert.equal(calls, 1);
});

test('transient reads back off 250ms then 500ms before recovering', async () => {
  let calls = 0;
  const waits = [];
  assert.equal(await lookup({ request: async () => response([503, 429, 200][calls++]),
    sleep: async ms => { waits.push(ms); } }), tag);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [250, 500]);
});

test('persistent network failures stop at three attempts with the full cause chain', async () => {
  const socketError = new Error('ECONNRESET');
  const failure = new TypeError('fetch failed', { cause: socketError });
  let calls = 0;
  await assert.rejects(lookup({ request: async () => { calls++; throw failure; }, sleep: async () => {} }),
    error => error.cause === failure && error.cause.cause === socketError);
  assert.equal(calls, 3);
});

for (const status of [401, 403, 422, 501]) {
  test(`HTTP ${status} fails immediately without authorizing creation`, async () => {
    let calls = 0;
    await assert.rejects(lookup({ request: async () => { calls++; return response(status); },
      sleep: async () => assert.fail('must not retry') }), error => error.cause?.status === status);
    assert.equal(calls, 1);
  });
}

test('persistent server failure preserves its status and stops after three reads', async () => {
  let calls = 0;
  await assert.rejects(lookup({ request: async () => { calls++; return response(503); }, sleep: async () => {} }),
    error => error.cause?.status === 503);
  assert.equal(calls, 3);
});

test('malformed or mismatched responses fail without retry or a missing-release result', async () => {
  await assert.rejects(lookup({ request: async () => ({ status: 200, text: async () => 'invalid json' }),
    sleep: async () => assert.fail('must not retry') }), error => error.cause instanceof SyntaxError);
  await assert.rejects(lookup({ request: async () => response(200, { tag_name: 'other' }),
    sleep: async () => assert.fail('must not retry') }), error => /unexpected release metadata/.test(error.cause?.message));
});

test('pre-cancellation propagates the exact reason without any request', async () => {
  const reason = new Error('stop before lookup');
  await assert.rejects(lookup({ signal: AbortSignal.abort(reason), request: async () => assert.fail('must not request') }),
    error => error === reason);
});

test('in-flight cancellation aborts I/O and never retries', async () => {
  const controller = new AbortController();
  const reason = new Error('cancel lookup');
  let requestSignal;
  let calls = 0;
  const pending = lookup({ signal: controller.signal, request: async (_url, init) => {
    calls++;
    requestSignal = init.signal;
    return new Promise(() => {});
  } });
  controller.abort(reason);
  await assert.rejects(pending, error => error === reason);
  assert.equal(requestSignal.reason, reason);
  assert.equal(calls, 1);
});

test('cancellation during backoff preserves its reason before a second request', async () => {
  const controller = new AbortController();
  const reason = new Error('stop retrying');
  let calls = 0;
  await assert.rejects(lookup({ signal: controller.signal,
    request: async () => { calls++; return response(503); },
    sleep: async () => { controller.abort(reason); throw new Error('delay aborted'); }
  }), error => error === reason);
  assert.equal(calls, 1);
});

test('scheduler failures retain their original cause', async () => {
  const failure = new Error('scheduler failed');
  await assert.rejects(lookup({ request: async () => response(503), sleep: async () => { throw failure; } }),
    error => error.cause === failure);
});

test('invalid deadlines and missing credentials fail before external I/O', async () => {
  for (const timeoutMs of [0, -1, NaN, Infinity, 2_147_483_648]) {
    await assert.rejects(lookup({ timeoutMs, request: async () => assert.fail('must not request') }), RangeError);
  }
  await assert.rejects(lookup({ token: '', request: async () => assert.fail('must not request') }), /GH_TOKEN is required/);
});

test('a stalled real HTTP response body hits the deadline and cannot authorize a write', async () => {
  const server = createServer((_request, reply) => {
    reply.writeHead(200);
    reply.flushHeaders();
    reply.write('{"tag_name":');
  });
  let calls = 0;
  try {
    await new Promise((yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
    const url = `http://127.0.0.1:${server.address().port}`;
    await assert.rejects(lookup({ timeoutMs: 50,
      request: (_url, init) => { calls++; return fetch(url, init); }, sleep: async () => {}
    }), error => error.cause?.name === 'TimeoutError');
    assert.equal(calls, 3);
  } finally {
    server.closeAllConnections();
    await new Promise((yes, no) => server.close(error => error ? no(error) : yes()));
  }
});
