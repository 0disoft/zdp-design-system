import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { readGitHubReleaseTag } from './github-release-preflight.mjs';

const repository = 'example/package';
const tag = 'v1.2.3';
const options = { token: 'test-token', apiUrl: 'https://api.github.com' };
const response = (status = 200, value = { tag_name: tag }) => ({ status, text: async () => JSON.stringify(value) });
const lookup = overrides => readGitHubReleaseTag(repository, tag, { ...options, ...overrides });

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
