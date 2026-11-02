import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readPublishedVersion } from './npm-release-preflight.mjs';

const name = '@example/package';
const version = '1.2.3';
const metadata = JSON.stringify({ name, version });
const response = (status, text = metadata) => ({ status, text: async () => text });

test('lookup is a GET with an encoded package path and returns the exact version', async () => {
  let calls = 0;
  const result = await readPublishedVersion(name, version, { request: async (url, options) => {
    calls++;
    assert.equal(url, 'https://registry.npmjs.org/%40example%2Fpackage/1.2.3');
    assert.equal(options.method, 'GET');
    assert.ok(options.signal instanceof AbortSignal);
    return response(200);
  } });
  assert.equal(result, version);
  assert.equal(calls, 1);
});

test('only a definite 404 authorizes a missing-version result', async () => {
  let calls = 0;
  assert.equal(await readPublishedVersion(name, version, { request: async () => {
    calls++;
    return response(404, '{"error":"Not found"}');
  } }), null);
  assert.equal(calls, 1);
});

test('transient reads use 250ms then 500ms backoff and stop after success', async () => {
  let calls = 0;
  const waits = [];
  assert.equal(await readPublishedVersion(name, version, {
    request: async () => response(++calls < 3 ? 503 : 200),
    sleep: async ms => { waits.push(ms); }
  }), version);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [250, 500]);
});

test('exhausted network errors retain the original error and its cause', async () => {
  const socketError = new Error('ECONNRESET');
  const failure = new TypeError('fetch failed', { cause: socketError });
  let calls = 0;
  await assert.rejects(readPublishedVersion(name, version, {
    request: async () => { calls++; throw failure; }, sleep: async () => {}
  }), error => error.cause === failure && error.cause.cause === socketError);
  assert.equal(calls, 3);
});

for (const status of [400, 401, 403, 422, 501]) {
  test(`HTTP ${status} fails once without being mistaken for an unpublished version`, async () => {
    let calls = 0;
    await assert.rejects(readPublishedVersion(name, version, { request: async () => {
      calls++;
      return response(status);
    } }), error => error.cause?.status === status);
    assert.equal(calls, 1);
  });
}

test('persistent service failures stop after three reads with the HTTP cause intact', async () => {
  let calls = 0;
  await assert.rejects(readPublishedVersion(name, version, {
    request: async () => { calls++; return response(503); }, sleep: async () => {}
  }), error => error.cause?.status === 503);
  assert.equal(calls, 3);
});

test('malformed JSON is not retried or treated as missing', async () => {
  let calls = 0;
  await assert.rejects(readPublishedVersion(name, version, { request: async () => {
    calls++;
    return response(200, 'invalid json');
  } }), error => error.cause instanceof SyntaxError);
  assert.equal(calls, 1);
});

test('mismatched metadata fails without retry', async () => {
  let calls = 0;
  await assert.rejects(readPublishedVersion(name, version, { request: async () => {
    calls++;
    return response(200, JSON.stringify({ name, version: '9.9.9' }));
  } }), error => /unexpected package metadata/.test(error.cause.message));
  assert.equal(calls, 1);
});

test('pre-cancellation propagates the exact reason without issuing a read', async () => {
  const reason = new Error('cancelled by caller');
  await assert.rejects(readPublishedVersion(name, version, {
    signal: AbortSignal.abort(reason), request: async () => { assert.fail('must not fetch'); }
  }), error => error === reason);
});

test('in-flight cancellation aborts the request and does not retry', async () => {
  const controller = new AbortController();
  const reason = new Error('stop lookup');
  let calls = 0;
  let requestSignal;
  const pending = readPublishedVersion(name, version, {
    signal: controller.signal,
    request: async (_url, options) => {
      calls++;
      requestSignal = options.signal;
      return new Promise(() => {});
    }
  });
  controller.abort(reason);
  await assert.rejects(pending, error => error === reason);
  assert.equal(requestSignal.aborted, true);
  assert.equal(calls, 1);
});

test('cancellation during backoff propagates its reason before a second read', async () => {
  const controller = new AbortController();
  const reason = new Error('cancel backoff');
  let calls = 0;
  await assert.rejects(readPublishedVersion(name, version, {
    signal: controller.signal,
    request: async () => { calls++; return response(503); },
    sleep: async () => { controller.abort(reason); throw new Error('delay aborted'); }
  }), error => error === reason);
  assert.equal(calls, 1);
});

test('the deadline includes a stalled response body and aborts real HTTP reads', async () => {
  let calls = 0;
  const server = createServer((_request, reply) => {
    reply.writeHead(200);
    reply.flushHeaders();
    reply.write('{"version":');
  });
  try {
    await new Promise((yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
    const origin = `http://127.0.0.1:${server.address().port}`;
    await assert.rejects(readPublishedVersion(name, version, {
      timeoutMs: 50,
      request: (_url, options) => { calls++; return fetch(origin, options); },
      sleep: async () => {}
    }), error => error.cause?.name === 'TimeoutError');
    assert.equal(calls, 3);
  } finally {
    server.closeAllConnections();
    await new Promise((yes, no) => server.close(error => error ? no(error) : yes()));
  }
});

test('invalid timeout configuration cannot silently disable the deadline', async () => {
  for (const timeoutMs of [0, -1, NaN, Infinity, 2_147_483_648]) {
    await assert.rejects(readPublishedVersion(name, version, { timeoutMs }), RangeError);
  }
});
